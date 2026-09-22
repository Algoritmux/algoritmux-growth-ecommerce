<?php

namespace App\Services\Listmonk;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class ListmonkClient
{
    public function isConfigured(): bool
    {
        return $this->validBaseUrl()
            && filled(config('services.listmonk.api_username'))
            && filled(config('services.listmonk.api_token'))
            && $this->positiveInteger(config('services.listmonk.list_id')) !== null
            && $this->positiveInteger(config('services.listmonk.template_id')) !== null
            && (int) config('services.listmonk.timeout') > 0;
    }

    public function findCampaignIdByGuid(string $guid): ?int
    {
        $this->ensureConfigured();
        $tag = $this->guidTag($guid);
        $query = http_build_query([
            'page' => 1,
            'per_page' => 100,
            'no_body' => 'true',
        ]).'&tags='.rawurlencode($tag);
        $response = $this->client()
            ->retry(3, 250, throw: false)
            ->get("campaigns?{$query}");

        $this->ensureSuccessful($response);

        foreach ((array) data_get($response->json(), 'data.results', []) as $campaign) {
            if (! in_array($tag, (array) data_get($campaign, 'tags', []), true)) {
                continue;
            }

            if (data_get($campaign, 'status') !== 'draft') {
                throw new RuntimeException('The matching Listmonk campaign is not a draft.');
            }

            $id = data_get($campaign, 'id');

            if ($this->positiveInteger($id) === null) {
                throw new RuntimeException('Listmonk returned an invalid campaign identifier.');
            }

            return (int) $id;
        }

        return null;
    }

    /**
     * @param  array{guid: string, title: string, link: string, description: string}  $item
     */
    public function createDraftCampaign(array $item, string $html): int
    {
        $this->ensureConfigured();
        $response = $this->client()->post('campaigns', [
            'name' => "RSS | {$item['title']} | {$item['guid']}",
            'subject' => $item['title'],
            'lists' => [$this->positiveInteger(config('services.listmonk.list_id'))],
            'type' => 'regular',
            'content_type' => 'html',
            'body' => $html,
            'altbody' => "{$item['description']}\n\nLer artigo completo:\n{$item['link']}",
            'messenger' => 'email',
            'template_id' => $this->positiveInteger(config('services.listmonk.template_id')),
            'tags' => [
                'algoritmux-blog',
                'rss',
                $this->guidTag($item['guid']),
            ],
        ]);

        $this->ensureSuccessful($response);

        if (data_get($response->json(), 'data.status') !== 'draft') {
            throw new RuntimeException('Listmonk did not create the campaign as a draft.');
        }

        $id = data_get($response->json(), 'data.id');

        if ($this->positiveInteger($id) === null) {
            throw new RuntimeException('Listmonk returned an invalid campaign identifier.');
        }

        return (int) $id;
    }

    public function guidTag(string $guid): string
    {
        return 'rss-guid-'.hash('sha256', $guid);
    }

    private function client(): PendingRequest
    {
        return Http::baseUrl(rtrim((string) config('services.listmonk.base_url'), '/').'/api')
            ->acceptJson()
            ->asJson()
            ->withBasicAuth(
                (string) config('services.listmonk.api_username'),
                (string) config('services.listmonk.api_token'),
            )
            ->timeout((int) config('services.listmonk.timeout'))
            ->connectTimeout((int) config('services.listmonk.timeout'));
    }

    private function ensureConfigured(): void
    {
        if (! $this->isConfigured()) {
            throw new RuntimeException('Listmonk configuration is incomplete.');
        }
    }

    private function ensureSuccessful(Response $response): void
    {
        if ($response->successful()) {
            return;
        }

        throw new RuntimeException("Listmonk HTTP {$response->status()}.");
    }

    private function validBaseUrl(): bool
    {
        $url = (string) config('services.listmonk.base_url');

        return filter_var($url, FILTER_VALIDATE_URL) !== false
            && strtolower((string) parse_url($url, PHP_URL_SCHEME)) === 'https';
    }

    private function positiveInteger(mixed $value): ?int
    {
        $integer = filter_var($value, FILTER_VALIDATE_INT, [
            'options' => ['min_range' => 1],
        ]);

        return $integer === false ? null : $integer;
    }
}
