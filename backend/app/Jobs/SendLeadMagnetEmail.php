<?php

namespace App\Jobs;

use App\Mail\LeadMagnetDownloadMail;
use App\Models\LeadMagnetLead;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;
use RuntimeException;
use Throwable;

class SendLeadMagnetEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    /** @var list<int> */
    public array $backoff = [60, 300, 900];

    public function __construct(public LeadMagnetLead $lead) {}

    public function handle(): void
    {
        $lead = $this->lead->fresh();

        if ($lead === null) {
            return;
        }

        $magnet = config("lead-magnets.items.{$lead->lead_magnet}");

        if (! is_array($magnet)) {
            throw new RuntimeException('Lead magnet configuration is missing.');
        }

        $lead->forceFill([
            'email_status' => LeadMagnetLead::EMAIL_PROCESSING,
            'email_error' => null,
        ])->save();

        try {
            $downloadUrl = URL::temporarySignedRoute(
                'lead-magnets.download',
                now()->addDays((int) config('lead-magnets.link_expiration_days', 7)),
                ['publicId' => $lead->public_id],
            );

            Mail::to($lead->email)->send(new LeadMagnetDownloadMail(
                $lead,
                $downloadUrl,
                $magnet,
            ));

            $lead->forceFill([
                'email_status' => LeadMagnetLead::EMAIL_SENT,
                'email_sent_at' => now(),
                'email_error' => null,
            ])->save();
        } catch (Throwable $exception) {
            $lead->forceFill([
                'email_status' => LeadMagnetLead::EMAIL_FAILED,
                'email_error' => $this->safeError($exception),
            ])->save();

            throw $exception;
        }
    }

    private function safeError(Throwable $exception): string
    {
        $message = strip_tags($exception->getMessage());
        $message = preg_replace('/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/', '[redacted-email]', $message) ?? '';

        return Str::limit(trim($message) ?: 'Transactional email delivery failed.', 1000, '');
    }
}
