<?php

return [
    'temporary_file_upload' => [
        'disk' => 'local',
        'rules' => [
            'required',
            'file',
            'mimetypes:image/jpeg,image/png,image/webp',
            'max:5120',
        ],
        'directory' => 'livewire-tmp',
        'middleware' => 'throttle:60,1',
        'preview_mimes' => ['jpg', 'jpeg', 'png', 'webp'],
        'max_upload_time' => 5,
        'cleanup' => true,
    ],
];
