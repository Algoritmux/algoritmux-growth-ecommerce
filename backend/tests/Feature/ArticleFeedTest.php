<?php

namespace Tests\Feature;

use App\Enums\ArticleStatus;
use App\Models\Article;
use App\Models\User;
use DateTimeImmutable;
use DOMDocument;
use DOMElement;
use DOMXPath;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ArticleFeedTest extends TestCase
{
    use RefreshDatabase;

    private const ATOM_NAMESPACE = 'http://www.w3.org/2005/Atom';

    private const CACHE_KEY = 'feed.articles.rss.v1';

    private const DC_NAMESPACE = 'http://purl.org/dc/elements/1.1/';

    private const MEDIA_NAMESPACE = 'http://search.yahoo.com/mrss/';

    protected function setUp(): void
    {
        parent::setUp();

        Carbon::setTestNow('2026-09-21 15:00:00');
        Cache::forget(self::CACHE_KEY);
        config()->set('app.url', 'https://api.algoritmux.com');
        config()->set('site.public_url', 'https://algoritmux.com');
        config()->set('site.feed.title', 'Algoritmux Blog');
        config()->set(
            'site.feed.description',
            'Insights de Growth, vendas, inteligência artificial e design de conversão para operações B2B.',
        );
        config()->set('site.feed.path', '/rss.xml');
        config()->set('site.feed.limit', 50);
    }

    protected function tearDown(): void
    {
        Cache::forget(self::CACHE_KEY);
        Carbon::setTestNow();

        parent::tearDown();
    }

    public function test_feed_contains_only_published_articles_and_complete_channel_metadata(): void
    {
        Storage::fake('public');
        $coverPath = 'articles/covers/feed-cover.png';
        $coverContents = base64_decode(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Zl1sAAAAASUVORK5CYII=',
            strict: true,
        );
        Storage::disk('public')->put($coverPath, $coverContents);

        $author = User::factory()->create(['name' => 'Equipe & Pesquisa']);
        $newer = Article::factory()->published()->create([
            'author_id' => $author->id,
            'title' => 'Growth & Vendas <Avançado>',
            'slug' => 'growth-vendas-avancado',
            'excerpt' => 'Resumo <strong>seguro</strong> &amp; útil <script>alert(1)</script>',
            'category' => 'Growth & Vendas',
            'cover_image' => $coverPath,
            'published_at' => now()->subHour(),
        ]);
        $older = Article::factory()->published()->create([
            'author_id' => $author->id,
            'title' => 'Artigo anterior',
            'slug' => 'artigo-anterior',
            'cover_image' => null,
            'published_at' => now()->subDay(),
        ]);
        Article::factory()->create([
            'author_id' => $author->id,
            'slug' => 'artigo-rascunho',
            'status' => ArticleStatus::Draft,
        ]);
        Article::factory()->archived()->create([
            'author_id' => $author->id,
            'slug' => 'artigo-arquivado',
        ]);
        Article::factory()->scheduled()->create([
            'author_id' => $author->id,
            'slug' => 'artigo-agendado',
        ]);
        $deleted = Article::factory()->published()->create([
            'author_id' => $author->id,
            'slug' => 'artigo-excluido',
        ]);
        $deleted->delete();

        $response = $this->get('/rss.xml');

        $response
            ->assertOk()
            ->assertHeader('Content-Type', 'application/rss+xml; charset=UTF-8');

        $cacheControl = (string) $response->headers->get('Cache-Control');
        $this->assertStringContainsString('public', $cacheControl);
        $this->assertStringContainsString('max-age=300', $cacheControl);

        $document = $this->parseXml($response->getContent());
        $xpath = $this->xpath($document);
        $root = $document->documentElement;

        $this->assertSame('rss', $root?->nodeName);
        $this->assertSame('2.0', $root?->getAttribute('version'));
        $this->assertSame('Algoritmux Blog', $xpath->evaluate('string(/rss/channel/title)'));
        $this->assertSame('https://algoritmux.com/blog', $xpath->evaluate('string(/rss/channel/link)'));
        $this->assertSame(
            'Insights de Growth, vendas, inteligência artificial e design de conversão para operações B2B.',
            $xpath->evaluate('string(/rss/channel/description)'),
        );
        $this->assertSame('pt-BR', $xpath->evaluate('string(/rss/channel/language)'));
        $this->assertNotFalse(DateTimeImmutable::createFromFormat(
            DATE_RFC2822,
            $xpath->evaluate('string(/rss/channel/lastBuildDate)'),
        ));

        $selfLink = $xpath->query('/rss/channel/atom:link[@rel="self"]')?->item(0);
        $this->assertInstanceOf(DOMElement::class, $selfLink);
        $this->assertSame('https://api.algoritmux.com/rss.xml', $selfLink->getAttribute('href'));
        $this->assertSame('application/rss+xml', $selfLink->getAttribute('type'));

        $titles = [];

        foreach ($xpath->query('/rss/channel/item/title') ?: [] as $title) {
            $titles[] = $title->textContent;
        }

        $this->assertSame(['Growth & Vendas <Avançado>', 'Artigo anterior'], $titles);

        $newerItem = $this->itemByGuid($xpath, "urn:algoritmux:article:{$newer->id}");
        $this->assertSame(
            'https://algoritmux.com/blog/growth-vendas-avancado',
            $xpath->evaluate('string(link)', $newerItem),
        );
        $this->assertSame('false', $xpath->evaluate('string(guid/@isPermaLink)', $newerItem));
        $this->assertSame(
            $newer->published_at->toRfc2822String(),
            $xpath->evaluate('string(pubDate)', $newerItem),
        );
        $this->assertNotFalse(DateTimeImmutable::createFromFormat(
            DATE_RFC2822,
            $xpath->evaluate('string(pubDate)', $newerItem),
        ));
        $this->assertSame(
            'Resumo seguro & útil alert(1)',
            $xpath->evaluate('string(description)', $newerItem),
        );
        $this->assertSame('Growth & Vendas', $xpath->evaluate('string(category)', $newerItem));
        $this->assertSame('Equipe & Pesquisa', $xpath->evaluate('string(dc:creator)', $newerItem));
        $this->assertSame(0, $xpath->query('.//script', $newerItem)?->length);

        $media = $xpath->query('media:content', $newerItem)?->item(0);
        $this->assertInstanceOf(DOMElement::class, $media);
        $this->assertSame(
            'https://api.algoritmux.com/storage/articles/covers/feed-cover.png',
            $media->getAttribute('url'),
        );
        $this->assertSame('image', $media->getAttribute('medium'));
        $this->assertSame('image/png', $media->getAttribute('type'));
        $this->assertSame((string) strlen($coverContents), $media->getAttribute('fileSize'));

        $olderItem = $this->itemByGuid($xpath, "urn:algoritmux:article:{$older->id}");
        $this->assertSame(0, $xpath->query('media:content', $olderItem)?->length);

        $xml = $response->getContent();
        $this->assertStringNotContainsString('artigo-rascunho', $xml);
        $this->assertStringNotContainsString('artigo-arquivado', $xml);
        $this->assertStringNotContainsString('artigo-agendado', $xml);
        $this->assertStringNotContainsString('artigo-excluido', $xml);
    }

    public function test_feed_limits_results_to_fifty_articles(): void
    {
        $author = User::factory()->create();

        foreach (range(0, 50) as $index) {
            Article::factory()->published()->create([
                'author_id' => $author->id,
                'title' => "Artigo {$index}",
                'slug' => "artigo-{$index}",
                'published_at' => now()->subMinutes($index),
            ]);
        }

        $document = $this->parseXml($this->get('/rss.xml')->assertOk()->getContent());
        $xpath = $this->xpath($document);

        $this->assertSame(50, $xpath->query('/rss/channel/item')?->length);
        $this->assertSame(
            'https://algoritmux.com/blog/artigo-0',
            $xpath->evaluate('string(/rss/channel/item[1]/link)'),
        );
        $this->assertSame(
            'https://algoritmux.com/blog/artigo-49',
            $xpath->evaluate('string(/rss/channel/item[50]/link)'),
        );
        $this->assertStringNotContainsString(
            'https://algoritmux.com/blog/artigo-50',
            $document->saveXML() ?: '',
        );
    }

    public function test_guid_remains_stable_when_slug_changes(): void
    {
        $article = Article::factory()->published()->create([
            'slug' => 'slug-original',
        ]);

        $firstDocument = $this->parseXml($this->get('/rss.xml')->assertOk()->getContent());
        $firstGuid = $this->xpath($firstDocument)->evaluate('string(/rss/channel/item/guid)');

        $article->update(['slug' => 'slug-atualizado']);
        Cache::forget(self::CACHE_KEY);

        $secondDocument = $this->parseXml($this->get('/rss.xml')->assertOk()->getContent());
        $secondXpath = $this->xpath($secondDocument);

        $this->assertSame("urn:algoritmux:article:{$article->id}", $firstGuid);
        $this->assertSame($firstGuid, $secondXpath->evaluate('string(/rss/channel/item/guid)'));
        $this->assertSame(
            'https://algoritmux.com/blog/slug-atualizado',
            $secondXpath->evaluate('string(/rss/channel/item/link)'),
        );
    }

    public function test_empty_feed_is_valid_xml(): void
    {
        $response = $this->get('/rss.xml');

        $response
            ->assertOk()
            ->assertHeader('Content-Type', 'application/rss+xml; charset=UTF-8');

        $document = $this->parseXml($response->getContent());
        $xpath = $this->xpath($document);

        $this->assertSame('rss', $document->documentElement?->nodeName);
        $this->assertSame('2.0', $document->documentElement?->getAttribute('version'));
        $this->assertSame(0, $xpath->query('/rss/channel/item')?->length);
        $this->assertNotFalse(DateTimeImmutable::createFromFormat(
            DATE_RFC2822,
            $xpath->evaluate('string(/rss/channel/lastBuildDate)'),
        ));
    }

    public function test_feed_xml_is_cached_for_five_minutes(): void
    {
        Article::factory()->published()->create(['slug' => 'artigo-em-cache']);

        $firstResponse = $this->get('/rss.xml')->assertOk();
        $this->assertTrue(Cache::has(self::CACHE_KEY));

        Article::factory()->published()->create([
            'slug' => 'artigo-posterior',
            'published_at' => now(),
        ]);

        $secondResponse = $this->get('/rss.xml')->assertOk();
        $this->assertSame($firstResponse->getContent(), $secondResponse->getContent());
        $this->assertStringNotContainsString('artigo-posterior', $secondResponse->getContent());

        Cache::forget(self::CACHE_KEY);

        $thirdResponse = $this->get('/rss.xml')->assertOk();
        $this->assertStringContainsString('artigo-posterior', $thirdResponse->getContent());
    }

    private function parseXml(string $xml): DOMDocument
    {
        $document = new DOMDocument;

        $this->assertTrue($document->loadXML($xml));
        $this->assertSame('1.0', $document->xmlVersion);
        $this->assertSame('UTF-8', $document->encoding);

        return $document;
    }

    private function xpath(DOMDocument $document): DOMXPath
    {
        $xpath = new DOMXPath($document);
        $xpath->registerNamespace('atom', self::ATOM_NAMESPACE);
        $xpath->registerNamespace('media', self::MEDIA_NAMESPACE);
        $xpath->registerNamespace('dc', self::DC_NAMESPACE);

        return $xpath;
    }

    private function itemByGuid(DOMXPath $xpath, string $guid): DOMElement
    {
        $item = $xpath->query('/rss/channel/item[guid="'.$guid.'"]')?->item(0);
        $this->assertInstanceOf(DOMElement::class, $item);

        return $item;
    }
}
