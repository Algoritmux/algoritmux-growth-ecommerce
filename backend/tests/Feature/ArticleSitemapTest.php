<?php

namespace Tests\Feature;

use App\Enums\ArticleStatus;
use App\Models\Article;
use DOMDocument;
use DOMXPath;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class ArticleSitemapTest extends TestCase
{
    use RefreshDatabase;

    private const CACHE_KEY = 'sitemap.articles.xml';

    private const XML_NAMESPACE = 'http://www.sitemaps.org/schemas/sitemap/0.9';

    protected function setUp(): void
    {
        parent::setUp();

        Carbon::setTestNow('2026-09-17 15:00:00');
        Cache::forget(self::CACHE_KEY);
        config()->set('site.public_url', 'https://algoritmux.com');
    }

    protected function tearDown(): void
    {
        Cache::forget(self::CACHE_KEY);
        Carbon::setTestNow();

        parent::tearDown();
    }

    public function test_sitemap_lists_only_published_articles_with_canonical_urls_and_lastmod(): void
    {
        $published = Article::factory()->published()->create([
            'slug' => 'artigo-publicado',
        ]);
        Article::factory()->create([
            'slug' => 'artigo-rascunho',
            'status' => ArticleStatus::Draft,
        ]);
        Article::factory()->archived()->create([
            'slug' => 'artigo-arquivado',
        ]);
        Article::factory()->scheduled()->create([
            'slug' => 'artigo-agendado',
        ]);
        $deleted = Article::factory()->published()->create([
            'slug' => 'artigo-excluido',
        ]);
        $deleted->delete();

        $response = $this->get('/sitemap-articles.xml');

        $response
            ->assertOk()
            ->assertHeader('Content-Type', 'application/xml; charset=UTF-8');

        $cacheControl = (string) $response->headers->get('Cache-Control');
        $this->assertStringContainsString('public', $cacheControl);
        $this->assertStringContainsString('max-age=300', $cacheControl);

        $document = $this->parseXml($response->getContent());
        $entries = $this->sitemapEntries($document);

        $this->assertSame('urlset', $document->documentElement?->localName);
        $this->assertSame(self::XML_NAMESPACE, $document->documentElement?->namespaceURI);
        $this->assertSame([
            'https://algoritmux.com/blog/artigo-publicado' => $published->updated_at->toIso8601String(),
        ], $entries);
    }

    public function test_empty_sitemap_is_valid_xml(): void
    {
        $response = $this->get('/sitemap-articles.xml');

        $response
            ->assertOk()
            ->assertHeader('Content-Type', 'application/xml; charset=UTF-8');

        $document = $this->parseXml($response->getContent());

        $this->assertSame('urlset', $document->documentElement?->localName);
        $this->assertSame(self::XML_NAMESPACE, $document->documentElement?->namespaceURI);
        $this->assertSame([], $this->sitemapEntries($document));
    }

    private function parseXml(string $xml): DOMDocument
    {
        $document = new DOMDocument;

        $this->assertTrue($document->loadXML($xml));
        $this->assertSame('1.0', $document->xmlVersion);
        $this->assertSame('UTF-8', $document->encoding);

        return $document;
    }

    /**
     * @return array<string, string>
     */
    private function sitemapEntries(DOMDocument $document): array
    {
        $xpath = new DOMXPath($document);
        $xpath->registerNamespace('sitemap', self::XML_NAMESPACE);
        $entries = [];

        foreach ($xpath->query('//sitemap:url') ?: [] as $url) {
            $location = $xpath->evaluate('string(sitemap:loc)', $url);
            $lastModified = $xpath->evaluate('string(sitemap:lastmod)', $url);
            $entries[$location] = $lastModified;
        }

        return $entries;
    }
}
