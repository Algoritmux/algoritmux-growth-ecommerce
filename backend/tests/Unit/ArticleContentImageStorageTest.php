<?php

namespace Tests\Unit;

use App\Services\ArticleContentImageStorage;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use InvalidArgumentException;
use Tests\TestCase;

class ArticleContentImageStorageTest extends TestCase
{
    private ArticleContentImageStorage $storage;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');
        $this->storage = app(ArticleContentImageStorage::class);
    }

    public function test_it_stores_an_internal_image_with_a_safe_name_and_public_url(): void
    {
        $file = UploadedFile::fake()->createWithContent(
            'imagem.php.png',
            base64_decode(
                'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Zl1sAAAAASUVORK5CYII=',
                strict: true,
            ),
        );

        $path = $this->storage->store($file);

        $this->assertMatchesRegularExpression(
            '#^articles/content/[0-9a-f-]{36}\.png$#',
            $path,
        );
        $this->assertStringNotContainsString('imagem.php', $path);
        Storage::disk('public')->assertExists($path);
        $this->assertSame('/storage/'.$path, $this->storage->url($path));
        $this->assertSame(
            '/storage/'.$path,
            $this->storage->url('http://localhost/storage/'.$path),
        );
    }

    public function test_it_rejects_non_image_files_and_oversized_images(): void
    {
        try {
            $this->storage->store(
                UploadedFile::fake()->create('arquivo.php', 1, 'application/x-php'),
            );
            $this->fail('Arquivo executável deveria ser rejeitado.');
        } catch (InvalidArgumentException) {
            $this->assertTrue(true);
        }

        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('excede o limite');

        $this->storage->store(
            UploadedFile::fake()->create(
                'imagem-grande.png',
                ArticleContentImageStorage::MAX_SIZE_KILOBYTES + 1,
                'image/png',
            ),
        );
    }

    public function test_it_rejects_paths_outside_the_article_content_directory(): void
    {
        $this->assertNull($this->storage->normalizePath('../arquivo.png'));
        $this->assertNull($this->storage->normalizePath('articles/covers/capa.png'));
        $this->assertNull($this->storage->normalizePath('articles/content/arquivo.php'));
        $this->assertNull($this->storage->url('javascript:alert(1)'));
    }
}
