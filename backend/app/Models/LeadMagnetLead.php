<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LeadMagnetLead extends Model
{
    public const EMAIL_PENDING = 'pending';

    public const EMAIL_PROCESSING = 'processing';

    public const EMAIL_SENT = 'sent';

    public const EMAIL_FAILED = 'failed';

    public const LISTMONK_NOT_REQUESTED = 'not_requested';

    public const LISTMONK_PENDING = 'pending';

    public const LISTMONK_SYNCING = 'syncing';

    public const LISTMONK_SYNCED = 'synced';

    public const LISTMONK_FAILED = 'failed';

    protected $fillable = [
        'public_id',
        'name',
        'email',
        'lead_magnet',
        'source_page',
        'utm_source',
        'utm_medium',
        'utm_campaign',
        'utm_content',
        'utm_term',
        'newsletter_consent',
        'newsletter_consented_at',
        'email_status',
        'email_sent_at',
        'email_error',
        'downloaded_at',
        'listmonk_sync_status',
        'listmonk_subscriber_id',
        'listmonk_synced_at',
        'listmonk_sync_error',
        'last_requested_at',
    ];

    protected function casts(): array
    {
        return [
            'newsletter_consent' => 'boolean',
            'newsletter_consented_at' => 'datetime',
            'email_sent_at' => 'datetime',
            'downloaded_at' => 'datetime',
            'listmonk_synced_at' => 'datetime',
            'last_requested_at' => 'datetime',
        ];
    }
}
