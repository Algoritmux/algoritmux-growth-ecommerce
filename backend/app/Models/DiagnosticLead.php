<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DiagnosticLead extends Model
{
    public const PIPEDRIVE_SYNC_PENDING = 'pending';

    public const PIPEDRIVE_SYNC_SYNCING = 'syncing';

    public const PIPEDRIVE_SYNC_SYNCED = 'synced';

    public const PIPEDRIVE_SYNC_FAILED = 'failed';

    protected $fillable = [
        'public_id',
        'name',
        'whatsapp',
        'email',
        'company_name',
        'website',
        'revenue_range',
        'source_page',
        'status',
        'pipedrive_organization_id',
        'pipedrive_person_id',
        'pipedrive_deal_id',
        'pipedrive_sync_status',
        'pipedrive_sync_error',
        'pipedrive_synced_at',
    ];

    protected function casts(): array
    {
        return [
            'pipedrive_synced_at' => 'datetime',
        ];
    }
}
