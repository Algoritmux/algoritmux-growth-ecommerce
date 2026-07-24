<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'pipedrive' => [
        'company_domain' => env('PIPEDRIVE_COMPANY_DOMAIN'),
        'api_token' => env('PIPEDRIVE_API_TOKEN'),
        'pipeline_id' => env('PIPEDRIVE_PIPELINE_ID'),
        'stage_id' => env('PIPEDRIVE_STAGE_ID'),
        'owner_id' => env('PIPEDRIVE_OWNER_ID'),
        'timeout' => (int) env('PIPEDRIVE_TIMEOUT', 5),
        'org_website_field_key' => env('PIPEDRIVE_ORG_WEBSITE_FIELD_KEY'),
        'deal_revenue_field_key' => env('PIPEDRIVE_DEAL_REVENUE_FIELD_KEY'),
        'deal_source_field_key' => env('PIPEDRIVE_DEAL_SOURCE_FIELD_KEY'),
        'deal_source_option_id' => env('PIPEDRIVE_DEAL_SOURCE_OPTION_ID'),
        'deal_source_page_field_key' => env('PIPEDRIVE_DEAL_SOURCE_PAGE_FIELD_KEY'),
        'deal_local_id_field_key' => env('PIPEDRIVE_DEAL_LOCAL_ID_FIELD_KEY'),
        'revenue_option_ids' => [
            'up_to_50000' => env('PIPEDRIVE_REVENUE_UP_TO_50000_OPTION_ID'),
            '50001_75000' => env('PIPEDRIVE_REVENUE_50001_75000_OPTION_ID'),
            '75001_150000' => env('PIPEDRIVE_REVENUE_75001_150000_OPTION_ID'),
            '150001_250000' => env('PIPEDRIVE_REVENUE_150001_250000_OPTION_ID'),
            '250001_500000' => env('PIPEDRIVE_REVENUE_250001_500000_OPTION_ID'),
            'above_500000' => env('PIPEDRIVE_REVENUE_ABOVE_500000_OPTION_ID'),
        ],
    ],

];
