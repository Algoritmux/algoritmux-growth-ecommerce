<?php

namespace Tests\Feature;

use App\Models\NewsletterCampaignSync;
use App\Services\Listmonk\ListmonkClient;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class SyncArticleFeedCampaignsTest extends TestCase
{
    use RefreshDatabase;

    private const FEED_URL = 'https://api.algoritmux.test/rss.xml';

    private const LISTMONK_URL = 'https://listmonk.test';

    protected function setUp(): void
    {
        parent::setUp();

        config()->set('services.listmonk.enabled', true);
        config()->set('services.listmonk.base_url', self::LISTMONK_URL);
        config()->set('services.listmonk.api_username', 'api-user');
        config()->set('services.listmonk.api_token', 'secret-token');
        config()->set('services.listmonk.list_id', 7);
        config()->set('services.listmonk.template_id', 12);
        config()->set('services.listmonk.feed_url', self::FEED_URL);
        config()->set('services.listmonk.timeout', 10);
    }

    public function test_it_creates_drafts_oldest_first_with_the_expected_payload_and_does_not_duplicate(): void
    {
        $feed = $this->rss([
            $this->item(
                guid: 'urn:algoritmux:article:2',
                title: 'Título <especial> & vendas',
                slug: 'titulo-especial',
                publishedAt: 'Sat, 12 Sep 2026 09:00:00 +0000',
                description: 'Resumo & seguro',
                imageUrl: 'https://api.algoritmux.test/storage/articles/covers/capa.webp',
            ),
            $this->item(
                guid: 'urn:algoritmux:article:1',
                title: 'Artigo anterior',
                slug: 'artigo-anterior',
                publishedAt: 'Fri, 11 Sep 2026 09:00:00 +0000',
                description: 'Resumo anterior',
            ),
        ]);
        $posts = [];

        Http::fake(function (Request $request) use ($feed, &$posts) {
            if ($request->url() === self::FEED_URL) {
                return Http::response($feed, 200, ['Content-Type' => 'application/rss+xml']);
            }

            if ($request->method() === 'GET') {
                return Http::response(['data' => ['results' => []]]);
            }

            if ($request->method() === 'POST') {
                $posts[] = $request->data();

                return Http::response([
                    'data' => [
                        'id' => 100 + count($posts),
                        'status' => 'draft',
                    ],
                ], 201);
            }

            return Http::response([], 404);
        });

        $this->artisan('newsletter:sync-rss')->assertSuccessful();

        $this->assertCount(2, $posts);
        $this->assertSame('Artigo anterior', $posts[0]['subject']);
        $this->assertSame('Título <especial> & vendas', $posts[1]['subject']);
        $this->assertSame('RSS | Título <especial> & vendas | urn:algoritmux:article:2', $posts[1]['name']);
        $this->assertSame([7], $posts[1]['lists']);
        $this->assertSame(12, $posts[1]['template_id']);
        $this->assertSame('regular', $posts[1]['type']);
        $this->assertSame('html', $posts[1]['content_type']);
        $this->assertSame('email', $posts[1]['messenger']);
        $this->assertArrayNotHasKey('send_at', $posts[1]);
        $this->assertArrayNotHasKey('status', $posts[1]);
        $this->assertContains('algoritmux-blog', $posts[1]['tags']);
        $this->assertContains('rss', $posts[1]['tags']);
        $this->assertContains(
            'rss-guid-'.hash('sha256', 'urn:algoritmux:article:2'),
            $posts[1]['tags'],
        );
        $this->assertStringContainsString('&lt;especial&gt;', $posts[1]['body']);
        $this->assertStringContainsString('&amp; vendas', $posts[1]['body']);
        $this->assertStringContainsString(
            'https://api.algoritmux.test/storage/articles/covers/capa.webp',
            $posts[1]['body'],
        );
        $this->assertStringNotContainsString('<img', $posts[0]['body']);
        $this->assertSame(
            "Resumo & seguro\n\nLer artigo completo:\nhttps://algoritmux.com/blog/titulo-especial",
            $posts[1]['altbody'],
        );
        $this->assertDatabaseCount('newsletter_campaign_syncs', 2);
        $this->assertDatabaseHas('newsletter_campaign_syncs', [
            'source_guid' => 'urn:algoritmux:article:2',
            'status' => NewsletterCampaignSync::STATUS_CREATED,
            'listmonk_campaign_id' => 102,
            'attempts' => 1,
        ]);

        Http::assertSent(fn (Request $request): bool => $request->method() === 'POST'
            && $request->hasHeader('Authorization', 'Basic '.base64_encode('api-user:secret-token')));
        Http::assertNotSent(fn (Request $request): bool => str_contains($request->url(), '/status'));

        $this->artisan('newsletter:sync-rss')->assertSuccessful();

        $this->assertCount(2, $posts);
        $this->assertDatabaseCount('newsletter_campaign_syncs', 2);
    }

    public function test_dry_run_works_while_disabled_without_writes_or_listmonk_calls(): void
    {
        config()->set('services.listmonk.enabled', false);
        $this->fakeFeed($this->rss([$this->item()]));

        $this->artisan('newsletter:sync-rss --dry-run')
            ->expectsOutputToContain('Would create draft')
            ->assertSuccessful();

        $this->assertDatabaseCount('newsletter_campaign_syncs', 0);
        Http::assertSentCount(1);
    }

    public function test_bootstrap_works_while_disabled_and_never_calls_listmonk(): void
    {
        config()->set('services.listmonk.enabled', false);
        NewsletterCampaignSync::create([
            'source_guid' => 'urn:algoritmux:article:1',
            'source_url' => 'https://algoritmux.com/blog/artigo-1',
            'source_title' => 'Artigo 1',
            'source_published_at' => '2026-09-11 09:00:00',
            'status' => NewsletterCampaignSync::STATUS_FAILED,
            'attempts' => 1,
            'last_error' => 'Previous failure.',
        ]);
        $this->fakeFeed($this->rss([$this->item()]));

        $this->artisan('newsletter:sync-rss --bootstrap')->assertSuccessful();

        $this->assertDatabaseHas('newsletter_campaign_syncs', [
            'source_guid' => 'urn:algoritmux:article:1',
            'status' => NewsletterCampaignSync::STATUS_BASELINED,
            'listmonk_campaign_id' => null,
            'attempts' => 1,
            'last_error' => null,
        ]);
        Http::assertSentCount(1);
    }

    public function test_normal_sync_does_nothing_when_disabled(): void
    {
        config()->set('services.listmonk.enabled', false);
        Http::fake();

        $this->artisan('newsletter:sync-rss')
            ->expectsOutputToContain('disabled')
            ->assertSuccessful();

        Http::assertNothingSent();
        $this->assertDatabaseCount('newsletter_campaign_syncs', 0);
    }

    public function test_it_fails_before_network_access_when_credentials_are_missing(): void
    {
        config()->set('services.listmonk.api_token', null);
        Http::fake();

        $this->artisan('newsletter:sync-rss')
            ->expectsOutputToContain('configuration is incomplete')
            ->assertFailed();

        Http::assertNothingSent();
    }

    public function test_it_reports_an_rss_http_failure_without_writing(): void
    {
        Http::fake([
            self::FEED_URL => Http::response([], 503),
        ]);

        $this->artisan('newsletter:sync-rss')
            ->expectsOutputToContain('Newsletter feed HTTP 503')
            ->assertFailed();

        $this->assertDatabaseCount('newsletter_campaign_syncs', 0);
    }

    public function test_it_marks_the_item_failed_when_listmonk_rejects_creation(): void
    {
        $feed = $this->rss([$this->item()]);

        Http::fake(function (Request $request) use ($feed) {
            if ($request->url() === self::FEED_URL) {
                return Http::response($feed);
            }

            if ($request->method() === 'GET') {
                return Http::response(['data' => ['results' => []]]);
            }

            return Http::response([], 503);
        });

        $this->artisan('newsletter:sync-rss')->assertFailed();

        $this->assertDatabaseHas('newsletter_campaign_syncs', [
            'source_guid' => 'urn:algoritmux:article:1',
            'status' => NewsletterCampaignSync::STATUS_FAILED,
            'attempts' => 1,
        ]);
        $this->assertStringContainsString(
            'Listmonk HTTP 503',
            NewsletterCampaignSync::firstOrFail()->last_error,
        );
    }

    public function test_it_reconciles_a_previous_lost_response_by_deterministic_tag(): void
    {
        $guid = 'urn:algoritmux:article:1';
        NewsletterCampaignSync::create([
            'source_guid' => $guid,
            'source_url' => 'https://algoritmux.com/blog/artigo-1',
            'source_title' => 'Artigo 1',
            'source_published_at' => '2026-09-11 09:00:00',
            'status' => NewsletterCampaignSync::STATUS_FAILED,
            'attempts' => 1,
        ]);
        $feed = $this->rss([$this->item()]);
        $tag = app(ListmonkClient::class)->guidTag($guid);

        Http::fake(function (Request $request) use ($feed, $tag) {
            if ($request->url() === self::FEED_URL) {
                return Http::response($feed);
            }

            if ($request->method() === 'GET') {
                return Http::response(['data' => ['results' => [[
                    'id' => 321,
                    'status' => 'draft',
                    'tags' => ['rss', $tag],
                ]]]]);
            }

            return Http::response([], 500);
        });

        $this->artisan('newsletter:sync-rss')->assertSuccessful();

        $this->assertDatabaseHas('newsletter_campaign_syncs', [
            'source_guid' => $guid,
            'status' => NewsletterCampaignSync::STATUS_CREATED,
            'listmonk_campaign_id' => 321,
            'attempts' => 2,
        ]);
        Http::assertNotSent(fn (Request $request): bool => $request->method() === 'POST');
    }

    public function test_limit_is_applied_before_oldest_first_processing(): void
    {
        $feed = $this->rss([
            $this->item(guid: 'guid-new', title: 'Novo', slug: 'novo', publishedAt: 'Sun, 13 Sep 2026 09:00:00 +0000'),
            $this->item(guid: 'guid-middle', title: 'Intermediário', slug: 'intermediario', publishedAt: 'Sat, 12 Sep 2026 09:00:00 +0000'),
            $this->item(guid: 'guid-old', title: 'Antigo', slug: 'antigo', publishedAt: 'Fri, 11 Sep 2026 09:00:00 +0000'),
        ]);
        $subjects = [];

        Http::fake(function (Request $request) use ($feed, &$subjects) {
            if ($request->url() === self::FEED_URL) {
                return Http::response($feed);
            }

            if ($request->method() === 'GET') {
                return Http::response(['data' => ['results' => []]]);
            }

            $subjects[] = $request['subject'];

            return Http::response(['data' => [
                'id' => 500 + count($subjects),
                'status' => 'draft',
            ]], 201);
        });

        $this->artisan('newsletter:sync-rss --limit=2')->assertSuccessful();

        $this->assertSame(['Intermediário', 'Novo'], $subjects);
        $this->assertDatabaseCount('newsletter_campaign_syncs', 2);
        $this->assertDatabaseMissing('newsletter_campaign_syncs', ['source_guid' => 'guid-old']);
    }

    public function test_source_guid_has_a_unique_database_constraint(): void
    {
        $attributes = [
            'source_guid' => 'urn:algoritmux:article:1',
            'source_url' => 'https://algoritmux.com/blog/artigo-1',
            'source_title' => 'Artigo 1',
            'source_published_at' => '2026-09-11 09:00:00',
            'status' => NewsletterCampaignSync::STATUS_DISCOVERED,
        ];

        NewsletterCampaignSync::create($attributes);

        $this->expectException(QueryException::class);
        NewsletterCampaignSync::create($attributes);
    }

    private function fakeFeed(string $feed): void
    {
        Http::fake([
            self::FEED_URL => Http::response($feed, 200, ['Content-Type' => 'application/rss+xml']),
        ]);
    }

    /**
     * @param  list<string>  $items
     */
    private function rss(array $items): string
    {
        return '<?xml version="1.0" encoding="UTF-8"?>'
            .'<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" '
            .'xmlns:media="http://search.yahoo.com/mrss/"><channel>'
            .implode('', $items)
            .'</channel></rss>';
    }

    private function item(
        string $guid = 'urn:algoritmux:article:1',
        string $title = 'Artigo 1',
        string $slug = 'artigo-1',
        string $publishedAt = 'Fri, 11 Sep 2026 09:00:00 +0000',
        string $description = 'Resumo do artigo',
        ?string $imageUrl = null,
    ): string {
        $media = $imageUrl === null
            ? ''
            : '<media:content url="'.$this->xml($imageUrl).'" />';

        return '<item>'
            .'<guid isPermaLink="false">'.$this->xml($guid).'</guid>'
            .'<title>'.$this->xml($title).'</title>'
            .'<link>https://algoritmux.com/blog/'.$this->xml($slug).'</link>'
            .'<description>'.$this->xml($description).'</description>'
            .'<pubDate>'.$this->xml($publishedAt).'</pubDate>'
            .'<category>Growth</category>'
            .'<dc:creator>Equipe Algoritmux</dc:creator>'
            .$media
            .'</item>';
    }

    private function xml(string $value): string
    {
        return htmlspecialchars($value, ENT_QUOTES | ENT_XML1, 'UTF-8');
    }
}
