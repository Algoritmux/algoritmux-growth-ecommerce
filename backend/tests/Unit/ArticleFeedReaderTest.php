<?php

namespace Tests\Unit;

use App\Services\Newsletter\ArticleFeedReader;
use Illuminate\Support\Facades\Http;
use RuntimeException;
use Tests\TestCase;

class ArticleFeedReaderTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        config()->set('services.listmonk.feed_url', 'https://api.algoritmux.test/rss.xml');
        config()->set('services.listmonk.timeout', 10);
    }

    public function test_it_parses_supported_fields_and_rejects_untrusted_optional_media(): void
    {
        Http::fake([
            'https://api.algoritmux.test/rss.xml' => Http::response(<<<'XML'
                <?xml version="1.0" encoding="UTF-8"?>
                <rss version="2.0"
                    xmlns:dc="http://purl.org/dc/elements/1.1/"
                    xmlns:media="http://search.yahoo.com/mrss/">
                    <channel>
                        <item>
                            <guid isPermaLink="false">urn:algoritmux:article:10</guid>
                            <title>Growth &amp; vendas</title>
                            <link>https://algoritmux.com/blog/growth-vendas</link>
                            <description>Resumo &lt;strong&gt;seguro&lt;/strong&gt; &amp;amp; direto</description>
                            <pubDate>Fri, 11 Sep 2026 09:00:00 +0000</pubDate>
                            <category>Growth</category>
                            <dc:creator>Equipe Algoritmux</dc:creator>
                            <media:content url="https://api.algoritmux.test/storage/articles/covers/capa.webp" />
                        </item>
                        <item>
                            <guid isPermaLink="false">urn:algoritmux:article:11</guid>
                            <title>Sem mídia confiável</title>
                            <link>https://algoritmux.com/blog/sem-midia</link>
                            <description>Outro resumo</description>
                            <pubDate>Sat, 12 Sep 2026 09:00:00 +0000</pubDate>
                            <media:content url="https://attacker.example/capa.webp" />
                        </item>
                    </channel>
                </rss>
                XML, 200, ['Content-Type' => 'application/rss+xml']),
        ]);

        $items = app(ArticleFeedReader::class)->read();

        $this->assertCount(2, $items);
        $this->assertSame('urn:algoritmux:article:10', $items[0]['guid']);
        $this->assertSame('Growth & vendas', $items[0]['title']);
        $this->assertSame('Resumo seguro & direto', $items[0]['description']);
        $this->assertSame('Growth', $items[0]['category']);
        $this->assertSame('Equipe Algoritmux', $items[0]['creator']);
        $this->assertSame(
            'https://api.algoritmux.test/storage/articles/covers/capa.webp',
            $items[0]['image_url'],
        );
        $this->assertNull($items[1]['category']);
        $this->assertNull($items[1]['creator']);
        $this->assertNull($items[1]['image_url']);
    }

    public function test_it_rejects_an_article_link_outside_the_public_site(): void
    {
        Http::fake([
            'https://api.algoritmux.test/rss.xml' => Http::response(<<<'XML'
                <?xml version="1.0" encoding="UTF-8"?>
                <rss version="2.0"><channel><item>
                    <guid>urn:algoritmux:article:10</guid>
                    <title>Artigo</title>
                    <link>https://attacker.example/artigo</link>
                    <description>Resumo</description>
                    <pubDate>Fri, 11 Sep 2026 09:00:00 +0000</pubDate>
                </item></channel></rss>
                XML),
        ]);

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('invalid article URL');

        app(ArticleFeedReader::class)->read();
    }
}
