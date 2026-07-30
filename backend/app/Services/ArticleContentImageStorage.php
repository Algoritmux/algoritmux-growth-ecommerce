<?php

namespace App\Services;

use Filament\Forms\Components\RichEditor\FileAttachmentProviders\Contracts\FileAttachmentProvider;
use Filament\Forms\Components\RichEditor\RichContentAttribute;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use InvalidArgumentException;
use Livewire\Features\SupportFileUploads\TemporaryUploadedFile;
use RuntimeException;

class ArticleContentImageStorage implements FileAttachmentProvider
{
    public const DIRECTORY = 'articles/content';

    public const MAX_SIZE_KILOBYTES = 5120;

    /**
     * @var array<string, string>
     */
    private const ALLOWED_MIME_TYPES = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
    ];

    public function attribute(RichContentAttribute $attribute): static
    {
        return clone $this;
    }

    public function store(UploadedFile $file): string
    {
        if (($file->getSize() ?? 0) > (self::MAX_SIZE_KILOBYTES * 1024)) {
            throw new InvalidArgumentException('A imagem interna excede o limite de 5 MB.');
        }

        $mimeType = $file->getMimeType();
        $extension = self::ALLOWED_MIME_TYPES[$mimeType] ?? null;

        if ($extension === null) {
            throw new InvalidArgumentException('O tipo da imagem interna não é permitido.');
        }

        $fileName = Str::uuid()->toString().'.'.$extension;
        $path = Storage::disk('public')->putFileAs(
            self::DIRECTORY,
            $file,
            $fileName,
            ['visibility' => 'public'],
        );

        if (! is_string($path) || $path === '') {
            throw new RuntimeException('Não foi possível salvar a imagem interna do artigo.');
        }

        return str_replace('\\', '/', $path);
    }

    public function url(mixed $value): ?string
    {
        $path = $this->normalizePath($value);

        if ($path === null || ! Storage::disk('public')->exists($path)) {
            return null;
        }

        return '/storage/'.$path;
    }

    public function getFileAttachmentUrl(mixed $file): ?string
    {
        return $this->url($file);
    }

    public function saveUploadedFileAttachment(TemporaryUploadedFile $file): mixed
    {
        return $this->store($file);
    }

    public function getDefaultFileAttachmentVisibility(): ?string
    {
        return 'public';
    }

    public function isExistingRecordRequiredToSaveNewFileAttachments(): bool
    {
        return false;
    }

    /**
     * The content directory is shared by articles, so automatic cleanup cannot
     * safely infer ownership. Orphan cleanup must be performed separately.
     *
     * @param  array<mixed>  $exceptIds
     */
    public function cleanUpFileAttachments(array $exceptIds): void {}

    public function normalizePath(mixed $value): ?string
    {
        if (! is_string($value)) {
            return null;
        }

        $value = trim($value);

        if ($value === '') {
            return null;
        }

        if (filter_var($value, FILTER_VALIDATE_URL)) {
            $urlPath = parse_url($value, PHP_URL_PATH);
            $value = is_string($urlPath) ? $urlPath : '';
        }

        $value = ltrim(str_replace('\\', '/', $value), '/');

        if (str_starts_with($value, 'storage/')) {
            $value = substr($value, strlen('storage/'));
        }

        if (! preg_match(
            '#^articles/content/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(?:jpg|png|webp)$#i',
            $value,
        )) {
            return null;
        }

        return strtolower($value);
    }
}
