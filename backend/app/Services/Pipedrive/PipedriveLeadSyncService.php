<?php

namespace App\Services\Pipedrive;

use App\Models\DiagnosticLead;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use RuntimeException;
use Throwable;

class PipedriveLeadSyncService
{
    public function sync(DiagnosticLead $lead): bool
    {
        if ($lead->pipedrive_sync_status === DiagnosticLead::PIPEDRIVE_SYNC_SYNCED && $lead->pipedrive_deal_id) {
            return true;
        }

        if (! $this->isConfigured()) {
            $this->markAsFailed($lead, 'Pipedrive configuration is incomplete.');

            return false;
        }

        $lead->forceFill([
            'pipedrive_sync_status' => DiagnosticLead::PIPEDRIVE_SYNC_SYNCING,
            'pipedrive_sync_error' => null,
        ])->save();

        try {
            $this->revenueOptionId($lead);

            $organizationId = $lead->pipedrive_organization_id ?: $this->findOrCreateOrganization($lead);

            if (! $lead->pipedrive_organization_id) {
                $lead->forceFill(['pipedrive_organization_id' => $organizationId])->save();
            }

            $personId = $lead->pipedrive_person_id ?: $this->findOrCreatePerson($lead, $organizationId);

            if (! $lead->pipedrive_person_id) {
                $lead->forceFill(['pipedrive_person_id' => $personId])->save();
            }

            $dealId = $lead->pipedrive_deal_id ?: $this->findOrCreateDeal($lead, $organizationId, $personId);

            $lead->forceFill([
                'pipedrive_deal_id' => $dealId,
                'pipedrive_sync_status' => DiagnosticLead::PIPEDRIVE_SYNC_SYNCED,
                'pipedrive_sync_error' => null,
                'pipedrive_synced_at' => now(),
            ])->save();

            return true;
        } catch (ConnectionException) {
            $this->markAsFailed($lead, 'Pipedrive request timed out.');
        } catch (RuntimeException $exception) {
            $this->markAsFailed($lead, $exception->getMessage());
        } catch (Throwable) {
            $this->markAsFailed($lead, 'Pipedrive synchronization failed.');
        }

        return false;
    }

    private function findOrCreateOrganization(DiagnosticLead $lead): int
    {
        $organizationId = $this->firstSearchResultId('organizations/search', [
            'term' => $lead->company_name,
            'fields' => 'name',
            'exact_match' => true,
            'limit' => 1,
        ]);

        if ($organizationId) {
            $this->updateOrganizationWebsiteIfEmpty($organizationId, $lead->website);

            return $organizationId;
        }

        $payload = [
            'name' => $lead->company_name,
        ];

        $this->addOptionalField($payload, 'org_website_field_key', $lead->website);

        return $this->createdId($this->client()->post('organizations', $payload));
    }

    private function findOrCreatePerson(DiagnosticLead $lead, int $organizationId): int
    {
        $personId = $this->firstSearchResultId('persons/search', [
            'term' => $lead->email,
            'fields' => 'email',
            'exact_match' => true,
            'limit' => 1,
        ]);

        $personId ??= $this->firstSearchResultId('persons/search', [
            'term' => $lead->whatsapp,
            'fields' => 'phone',
            'exact_match' => true,
            'limit' => 1,
        ]);

        if ($personId) {
            return $personId;
        }

        return $this->createdId($this->client()->post('persons', [
            'name' => $lead->name,
            'org_id' => $organizationId,
            'emails' => [[
                'value' => $lead->email,
                'primary' => true,
            ]],
            'phones' => [[
                'value' => $lead->whatsapp,
                'primary' => true,
            ]],
        ]));
    }

    private function findOrCreateDeal(DiagnosticLead $lead, int $organizationId, int $personId): int
    {
        $title = $this->dealTitle($lead);
        $dealId = $this->firstSearchResultId('deals/search', [
            'term' => $title,
            'fields' => 'title',
            'exact_match' => true,
            'person_id' => $personId,
            'organization_id' => $organizationId,
            'limit' => 1,
        ]);

        if ($dealId) {
            return $dealId;
        }

        $payload = [
            'title' => $title,
            'person_id' => $personId,
            'org_id' => $organizationId,
            'pipeline_id' => (int) config('services.pipedrive.pipeline_id'),
            'stage_id' => (int) config('services.pipedrive.stage_id'),
            'owner_id' => (int) config('services.pipedrive.owner_id'),
        ];

        $this->addOptionalField($payload, 'deal_revenue_field_key', $this->revenueOptionId($lead));
        $this->addOptionalField($payload, 'deal_source_field_key', $this->optionalInteger('deal_source_option_id'));
        $this->addOptionalField($payload, 'deal_source_page_field_key', $lead->source_page);
        $this->addOptionalField($payload, 'deal_local_id_field_key', $lead->public_id);

        return $this->createdId($this->client()->post('deals', $payload));
    }

    private function firstSearchResultId(string $path, array $query): ?int
    {
        $response = $this->successful($this->client()->get($path, $query));
        $items = data_get($response->json(), 'data.items', data_get($response->json(), 'data', []));

        foreach ((array) $items as $item) {
            $id = data_get($item, 'item.id', data_get($item, 'id'));

            if (is_numeric($id) && (int) $id > 0) {
                return (int) $id;
            }
        }

        return null;
    }

    private function createdId(Response $response): int
    {
        $response = $this->successful($response);
        $id = data_get($response->json(), 'data.id');

        if (! is_numeric($id) || (int) $id < 1) {
            throw new RuntimeException('Pipedrive returned an invalid response.');
        }

        return (int) $id;
    }

    private function client(): PendingRequest
    {
        return Http::baseUrl(sprintf('https://%s.pipedrive.com/api/v2', config('services.pipedrive.company_domain')))
            ->acceptJson()
            ->asJson()
            ->timeout((int) config('services.pipedrive.timeout'))
            ->connectTimeout((int) config('services.pipedrive.timeout'))
            ->withQueryParameters([
                'api_token' => config('services.pipedrive.api_token'),
            ]);
    }

    private function successful(Response $response): Response
    {
        if ($response->successful()) {
            return $response;
        }

        throw new RuntimeException(match (true) {
            $response->status() === 429 => 'Pipedrive rate limit reached.',
            $response->serverError() => 'Pipedrive service is unavailable.',
            default => 'Pipedrive request failed.',
        });
    }

    private function isConfigured(): bool
    {
        return filled(config('services.pipedrive.api_token'))
            && filled(config('services.pipedrive.company_domain'))
            && is_numeric(config('services.pipedrive.pipeline_id'))
            && is_numeric(config('services.pipedrive.stage_id'))
            && is_numeric(config('services.pipedrive.owner_id'))
            && (int) config('services.pipedrive.timeout') > 0;
    }

    private function markAsFailed(DiagnosticLead $lead, string $error): void
    {
        $lead->forceFill([
            'pipedrive_sync_status' => DiagnosticLead::PIPEDRIVE_SYNC_FAILED,
            'pipedrive_sync_error' => $this->sanitizeError($error),
        ])->save();
    }

    private function sanitizeError(string $error): string
    {
        $error = strip_tags($error);
        $error = preg_replace('/api_token=[^&\s]+/i', 'api_token=[redacted]', $error) ?? '';
        $error = preg_replace('/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/', '[redacted-email]', $error) ?? '';
        $error = preg_replace('/\+?\d[\d\s()\-]{8,}\d/', '[redacted-phone]', $error) ?? '';

        return Str::limit(trim($error), 255, '');
    }

    private function dealTitle(DiagnosticLead $lead): string
    {
        $parts = ['Diagnóstico'];

        foreach ([$lead->company_name, $lead->name] as $value) {
            $value = preg_replace('/\s+/', ' ', trim((string) $value));

            if ($value !== '') {
                $parts[] = $value;
            }
        }

        return Str::limit(implode(' | ', $parts), 255, '');
    }

    private function updateOrganizationWebsiteIfEmpty(int $organizationId, ?string $website): void
    {
        $fieldKey = config('services.pipedrive.org_website_field_key');

        if (! filled($website) || ! filled($fieldKey)) {
            return;
        }

        $response = $this->successful($this->client()->get("organizations/{$organizationId}"));

        if (filled(data_get($response->json(), "data.{$fieldKey}"))) {
            return;
        }

        $this->successful($this->client()->patch("organizations/{$organizationId}", [
            $fieldKey => $website,
        ]));
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function addOptionalField(array &$payload, string $configurationKey, mixed $value): void
    {
        $fieldKey = config("services.pipedrive.{$configurationKey}");

        if (filled($fieldKey) && filled($value)) {
            $payload[$fieldKey] = $value;
        }
    }

    private function revenueOptionId(DiagnosticLead $lead): ?int
    {
        if (! filled(config('services.pipedrive.deal_revenue_field_key'))) {
            return null;
        }

        $range = match ($lead->revenue_range) {
            '1000_50000' => 'up_to_50000',
            'above_500000' => 'above_500000',
            '50001_200000', '200001_500000' => throw new RuntimeException('Pipedrive revenue range requires correction.'),
            default => $lead->revenue_range,
        };
        $optionId = config("services.pipedrive.revenue_option_ids.{$range}");

        return is_numeric($optionId) ? (int) $optionId : null;
    }

    private function optionalInteger(string $configurationKey): ?int
    {
        $value = config("services.pipedrive.{$configurationKey}");

        return is_numeric($value) ? (int) $value : null;
    }
}
