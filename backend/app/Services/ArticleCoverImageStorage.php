<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Livewire\Features\SupportFileUploads\TemporaryUploadedFile;

class ArticleCoverImageStorage
{
    public const DIRECTORY = 'articles/covers';

    public const MAX_SIZE_KILOBYTES = 5120;

    /**
     * @var array<string, string>
     */
    private const ALLOWED_MIME_TYPES = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
    ];

    public function filename(TemporaryUploadedFile $file): string
    {
        $extension = self::ALLOWED_MIME_TYPES[$file->getMimeType()] ?? null;

        if ($extension === null) {
            return Str::ulid().'.invalid';
        }

        return Str::ulid().".{$extension}";
    }

    /**
     * @return array{name: string, size: int, type: string, url: string}|null
     */
    public function metadata(mixed $file): ?array
    {
        $path = $this->path($file);

        if ($path === null || ! Storage::disk('public')->exists($path)) {
            return null;
        }

        $mimeType = Storage::disk('public')->mimeType($path);

        if (! is_string($mimeType) || ! array_key_exists($mimeType, self::ALLOWED_MIME_TYPES)) {
            return null;
        }

        return [
            'name' => basename($path),
            'size' => Storage::disk('public')->size($path),
            'type' => $mimeType,
            'url' => "/storage/{$path}",
        ];
    }

    public function url(mixed $file): ?string
    {
        return $this->metadata($file)['url'] ?? null;
    }

    private function path(mixed $file): ?string
    {
        if (! is_string($file)) {
            return null;
        }

        $path = ltrim(str_replace('\\', '/', trim($file)), '/');

        if (! preg_match(
            '#\Aarticles/covers/[A-Za-z0-9][A-Za-z0-9._-]*\.(?:jpe?g|png|webp)\z#i',
            $path,
        )) {
            return null;
        }

        return $path;
    }
}
