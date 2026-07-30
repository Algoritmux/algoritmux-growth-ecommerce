<?php

namespace Tests\Feature;

use App\Enums\ArticleStatus;
use App\Models\Article;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ArticleApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Carbon::setTestNow('2026-07-30 15:00:00');
        config()->set('filesystems.disks.public.url', 'https://api.algoritmux.test/storage');
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();

        parent::tearDown();
    }

    public function test_index_returns_only_live_articles_ordered_by_latest_without_full_content(): void
    {
        $older = Article::factory()->published()->create([
            'title' => 'Artigo publicado antigo',
            'slug' => 'artigo-publicado-antigo',
            'content' => '<p>Conteúdo antigo.</p>',
            'published_at' => now()->subDays(2),
        ]);

        $latest = Article::factory()->published()->create([
            'title' => 'Artigo publicado recente',
            'slug' => 'artigo-publicado-recente',
            'content' => '<p>Conteúdo recente.</p>',
            'published_at' => now()->subHour(),
        ]);

        Article::factory()->create(['status' => ArticleStatus::Draft]);
        Article::factory()->archived()->create();
        Article::factory()->scheduled()->create();
        Article::factory()->published()->create()->delete();

        $response = $this->getJson('/api/v1/articles');

        $response
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.slug', $latest->slug)
            ->assertJsonPath('data.1.slug', $older->slug)
            ->assertJsonMissingPath('data.0.content')
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'title',
                        'slug',
                        'excerpt',
                        'category',
                        'reading_time_minutes',
                        'is_featured',
                        'published_at',
                        'cover_image',
                        'author' => ['name'],
                        'seo' => ['title', 'description'],
                    ],
                ],
                'links' => ['first', 'last', 'prev', 'next'],
                'meta' => [
                    'current_page',
                    'from',
                    'last_page',
                    'path',
                    'per_page',
                    'to',
                    'total',
                ],
            ]);
    }

    public function test_index_is_paginated_and_accepts_a_limited_page_size(): void
    {
        Article::factory()->published()->count(5)->create();

        $response = $this->getJson('/api/v1/articles?per_page=2&page=2');

        $response
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('meta.current_page', 2)
            ->assertJsonPath('meta.per_page', 2)
            ->assertJsonPath('meta.total', 5);
    }

    public function test_index_filters_by_category_and_featured_state(): void
    {
        $featuredMarketing = Article::factory()->published()->create([
            'slug' => 'marketing-destaque',
            'category' => 'Marketing',
            'is_featured' => true,
        ]);

        $regularMarketing = Article::factory()->published()->create([
            'slug' => 'marketing-regular',
            'category' => 'Marketing',
            'is_featured' => false,
        ]);

        Article::factory()->published()->create([
            'category' => 'Vendas',
            'is_featured' => true,
        ]);

        $this->getJson('/api/v1/articles?category=Marketing&featured=true')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.slug', $featuredMarketing->slug);

        $this->getJson('/api/v1/articles?category=Marketing&featured=0')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.slug', $regularMarketing->slug);
    }

    public function test_index_rejects_invalid_filters(): void
    {
        $this->getJson('/api/v1/articles?featured=maybe&per_page=100')
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['featured', 'per_page']);
    }

    public function test_show_returns_full_sanitized_article_and_public_cover_url(): void
    {
        Storage::fake('public');
        $coverPath = 'articles/covers/conteudo-seguro.png';
        Storage::disk('public')->put(
            $coverPath,
            base64_decode(
                'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Zl1sAAAAASUVORK5CYII=',
                strict: true,
            ),
        );

        $article = Article::factory()->published()->create([
            'slug' => 'conteudo-seguro',
            'content' => '<p onclick="alert(1)">Texto <strong>permitido</strong>.</p><script>alert("xss")</script>',
            'cover_image' => $coverPath,
            'cover_alt_text' => 'Gráfico representando crescimento',
        ]);

        $response = $this->getJson("/api/v1/articles/{$article->slug}");

        $response
            ->assertOk()
            ->assertJsonPath('data.slug', $article->slug)
            ->assertJsonPath('data.cover_image.url', '/storage/articles/covers/conteudo-seguro.png')
            ->assertJsonPath('data.cover_image.alt', 'Gráfico representando crescimento')
            ->assertJsonPath('data.author.name', $article->author->name)
            ->assertJsonMissingPath('data.author.email');

        $content = $response->json('data.content');

        $this->assertStringContainsString('<strong>permitido</strong>', $content);
        $this->assertStringNotContainsString('<script', $content);
        $this->assertStringNotContainsString('onclick=', $content);
    }

    public function test_show_preserves_unordered_ordered_and_nested_lists(): void
    {
        $article = Article::factory()->published()->create([
            'content' => <<<'HTML'
                <ul>
                    <li>Marcador principal
                        <ul><li>Marcador aninhado</li></ul>
                    </li>
                </ul>
                <ol start="3">
                    <li>Item numerado
                        <ol><li>Item numerado aninhado</li></ol>
                    </li>
                </ol>
                HTML,
        ]);

        $content = $this->getJson("/api/v1/articles/{$article->slug}")
            ->assertOk()
            ->json('data.content');

        $this->assertStringContainsString('<ul>', $content);
        $this->assertStringContainsString('<ol start="3">', $content);
        $this->assertStringContainsString('<li>Marcador principal', $content);
        $this->assertStringContainsString('<li>Marcador aninhado</li>', $content);
        $this->assertStringContainsString('<li>Item numerado', $content);
        $this->assertStringContainsString('<li>Item numerado aninhado</li>', $content);
    }

    public function test_show_preserves_safe_internal_images_and_their_dimensions(): void
    {
        Storage::fake('public');
        $imagePath = 'articles/content/019444e8-7f9f-4abc-8def-0123456789ab.webp';
        Storage::disk('public')->put($imagePath, 'fake image');

        $article = Article::factory()->published()->create([
            'slug' => 'artigo-com-imagem-interna',
            'content' => '<p>Antes da imagem.</p><img src="http://localhost/storage/articles/content/019444e8-7f9f-4abc-8def-0123456789ab.webp" alt="Dashboard de crescimento" data-id="'.$imagePath.'" width="960" height="540" onerror="alert(1)"><p>Depois da imagem.</p>',
        ]);

        $content = $this
            ->getJson("/api/v1/articles/{$article->slug}")
            ->assertOk()
            ->json('data.content');

        $this->assertStringContainsString(
            'src="/storage/articles/content/019444e8-7f9f-4abc-8def-0123456789ab.webp"',
            $content,
        );
        $this->assertStringContainsString('alt="Dashboard de crescimento"', $content);
        $this->assertStringContainsString('width="960"', $content);
        $this->assertStringContainsString('height="540"', $content);
        $this->assertStringNotContainsString('onerror', $content);
    }

    public function test_show_returns_null_cover_when_article_has_no_image(): void
    {
        $article = Article::factory()->published()->create([
            'cover_image' => null,
            'cover_alt_text' => null,
        ]);

        $this->getJson("/api/v1/articles/{$article->slug}")
            ->assertOk()
            ->assertJsonPath('data.cover_image', null);
    }

    public function test_show_returns_not_found_for_missing_or_unavailable_articles(): void
    {
        $draft = Article::factory()->create(['status' => ArticleStatus::Draft]);
        $archived = Article::factory()->archived()->create();
        $scheduled = Article::factory()->scheduled()->create();
        $deleted = Article::factory()->published()->create();
        $deleted->delete();

        $this->getJson('/api/v1/articles/slug-inexistente')->assertNotFound();
        $this->getJson("/api/v1/articles/{$draft->slug}")->assertNotFound();
        $this->getJson("/api/v1/articles/{$archived->slug}")->assertNotFound();
        $this->getJson("/api/v1/articles/{$scheduled->slug}")->assertNotFound();
        $this->getJson("/api/v1/articles/{$deleted->slug}")->assertNotFound();
    }
}
