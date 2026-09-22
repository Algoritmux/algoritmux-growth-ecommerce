<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NewsletterCampaignSync extends Model
{
    use HasFactory;

    public const STATUS_DISCOVERED = 'discovered';

    public const STATUS_PROCESSING = 'processing';

    public const STATUS_CREATED = 'created';

    public const STATUS_FAILED = 'failed';

    public const STATUS_BASELINED = 'baselined';

    protected $fillable = [
        'source_guid',
        'source_url',
        'source_title',
        'source_published_at',
        'status',
        'listmonk_campaign_id',
        'attempts',
        'last_error',
        'last_attempt_at',
        'processed_at',
    ];

    protected function casts(): array
    {
        return [
            'source_published_at' => 'datetime',
            'listmonk_campaign_id' => 'integer',
            'attempts' => 'integer',
            'last_attempt_at' => 'datetime',
            'processed_at' => 'datetime',
        ];
    }
}
