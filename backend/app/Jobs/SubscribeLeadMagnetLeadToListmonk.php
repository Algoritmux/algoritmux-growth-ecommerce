<?php

namespace App\Jobs;

use App\Models\LeadMagnetLead;
use App\Services\Listmonk\ListmonkClient;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Str;
use RuntimeException;
use Throwable;

class SubscribeLeadMagnetLeadToListmonk implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    /** @var list<int> */
    public array $backoff = [60, 300, 900];

    public function __construct(public LeadMagnetLead $lead) {}

    public function handle(ListmonkClient $listmonk): void
    {
        $lead = $this->lead->fresh();

        if ($lead === null || ! $lead->newsletter_consent) {
            return;
        }

        $lead->forceFill([
            'listmonk_sync_status' => LeadMagnetLead::LISTMONK_SYNCING,
            'listmonk_sync_error' => null,
        ])->save();

        try {
            if (! config('services.listmonk.enabled')) {
                throw new RuntimeException('Listmonk synchronization is disabled.');
            }

            $subscriberId = $listmonk->upsertSubscriber(
                $lead->name,
                $lead->email,
                [
                    'lead_magnet' => $lead->lead_magnet,
                    'source_page' => $lead->source_page,
                    'utm_source' => $lead->utm_source,
                    'utm_medium' => $lead->utm_medium,
                    'utm_campaign' => $lead->utm_campaign,
                ],
            );

            $lead->forceFill([
                'listmonk_sync_status' => LeadMagnetLead::LISTMONK_SYNCED,
                'listmonk_subscriber_id' => $subscriberId,
                'listmonk_synced_at' => now(),
                'listmonk_sync_error' => null,
            ])->save();
        } catch (Throwable $exception) {
            $lead->forceFill([
                'listmonk_sync_status' => LeadMagnetLead::LISTMONK_FAILED,
                'listmonk_sync_error' => $this->safeError($exception),
            ])->save();

            throw $exception;
        }
    }

    private function safeError(Throwable $exception): string
    {
        $message = strip_tags($exception->getMessage());
        $message = preg_replace('/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/', '[redacted-email]', $message) ?? '';

        return Str::limit(trim($message) ?: 'Listmonk subscriber synchronization failed.', 1000, '');
    }
}
