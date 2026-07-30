<?php

namespace Tests\Unit;

use App\Services\ArticleCoverImageStorage;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ArticleCoverImageStorageTest extends TestCase
{
    public function test_it_returns_safe_relative_metadata_for_an_existing_cover(): void
    {
        Storage::fake('public');

        $path = 'articles/covers/01KYTZZZZZZZZZZZZZZZZZZZZZ.png';
        Storage::disk('public')->put(
            $path,
            base64_decode(
                'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Zl1sAAAAASUVORK5CYII=',
                strict: true,
            ),
        );

        $metadata = app(ArticleCoverImageStorage::class)->metadata($path);

        $this->assertSame('/storage/'.$path, $metadata['url']);
        $this->assertSame('image/png', $metadata['type']);
        $this->assertGreaterThan(0, $metadata['size']);
        $this->assertStringNotContainsString('localhost', $metadata['url']);
    }

    public function test_it_rejects_missing_unsafe_or_non_image_cover_paths(): void
    {
        Storage::fake('public');
        $storage = app(ArticleCoverImageStorage::class);

        Storage::disk('public')->put('articles/covers/arquivo.php', '<?php');

        $this->assertNull($storage->url('articles/covers/inexistente.png'));
        $this->assertNull($storage->url('../capa.png'));
        $this->assertNull($storage->url('articles/covers/arquivo.php'));
        $this->assertNull($storage->url('http://localhost/storage/articles/covers/capa.png'));
    }
}
