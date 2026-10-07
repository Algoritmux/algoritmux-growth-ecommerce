<?php

namespace App\Mail;

use App\Models\LeadMagnetLead;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class LeadMagnetDownloadMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * @param  array{title: string, subject: string, storage_path: string, download_filename: string}  $magnet
     */
    public function __construct(
        public LeadMagnetLead $lead,
        public string $downloadUrl,
        public array $magnet,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: $this->magnet['subject']);
    }

    public function content(): Content
    {
        return new Content(
            view: 'mail.lead-magnet-download',
            with: [
                'lead' => $this->lead,
                'downloadUrl' => $this->downloadUrl,
                'magnet' => $this->magnet,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
