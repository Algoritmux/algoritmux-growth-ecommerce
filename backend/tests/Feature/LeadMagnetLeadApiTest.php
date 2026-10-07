<?php

namespace Tests\Feature;

use App\Mail\LeadMagnetDownloadMail;
use App\Models\LeadMagnetLead;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

class LeadMagnetLeadApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Mail::fake();
        Http::preventStrayRequests();
        config()->set('services.listmonk.enabled', false);
    }

    public function test_it_normalizes_saves_and_sends_a_personal_email_without_newsletter_consent(): void
    {
        $response = $this->postJson('/api/v1/leads/lead-magnet', $this->payload([
            'name' => '  Pessoa de Teste  ',
            'email' => '  Pessoa.Teste@GMAIL.COM  ',
        ]));

        $response
            ->assertCreated()
            ->assertJsonPath('data.email_status', LeadMagnetLead::EMAIL_SENT);

        $lead = LeadMagnetLead::firstOrFail();
        $this->assertSame('Pessoa de Teste', $lead->name);
        $this->assertSame('pessoa.teste@gmail.com', $lead->email);
        $this->assertFalse($lead->newsletter_consent);
        $this->assertNull($lead->newsletter_consented_at);
        $this->assertSame(LeadMagnetLead::LISTMONK_NOT_REQUESTED, $lead->listmonk_sync_status);
        $this->assertNotNull($lead->email_sent_at);
        $this->assertNotNull($lead->last_requested_at);
        $this->assertDatabaseCount('lead_magnet_leads', 1);

        Mail::assertSent(LeadMagnetDownloadMail::class, function (LeadMagnetDownloadMail $mail) use ($lead): bool {
            return $mail->hasTo($lead->email)
                && str_contains($mail->downloadUrl, '/lead-magnets/'.$lead->public_id.'/download')
                && str_contains($mail->downloadUrl, 'signature=');
        });
        Http::assertNothingSent();
    }

    public function test_it_does_not_duplicate_an_email_and_lead_magnet_after_the_cooldown(): void
    {
        $this->postJson('/api/v1/leads/lead-magnet', $this->payload())->assertCreated();
        $firstRequestedAt = LeadMagnetLead::firstOrFail()->last_requested_at;

        $this->travel(6)->minutes();
        $this->postJson('/api/v1/leads/lead-magnet', $this->payload([
            'name' => 'Nome Atualizado',
            'source_page' => '/blog/outro-artigo',
        ]))->assertCreated();

        $this->assertDatabaseCount('lead_magnet_leads', 1);
        $lead = LeadMagnetLead::firstOrFail();
        $this->assertSame('Nome Atualizado', $lead->name);
        $this->assertSame('/blog/outro-artigo', $lead->source_page);
        $this->assertTrue($lead->last_requested_at->greaterThan($firstRequestedAt));
        Mail::assertSentCount(2);
    }

    public function test_it_rate_limits_the_same_email_and_material_during_the_cooldown(): void
    {
        $this->postJson('/api/v1/leads/lead-magnet', $this->payload())->assertCreated();

        $this->postJson('/api/v1/leads/lead-magnet', $this->payload())
            ->assertTooManyRequests();

        $this->assertDatabaseCount('lead_magnet_leads', 1);
        Mail::assertSentCount(1);
    }

    public function test_it_limits_requests_per_ip_per_minute(): void
    {
        foreach (range(1, 3) as $attempt) {
            $this->postJson('/api/v1/leads/lead-magnet', $this->payload([
                'email' => "pessoa{$attempt}@gmail.com",
            ]))->assertCreated();
        }

        $this->postJson('/api/v1/leads/lead-magnet', $this->payload([
            'email' => 'quarta-pessoa@gmail.com',
        ]))->assertTooManyRequests();
    }

    public function test_it_limits_requests_per_ip_per_day(): void
    {
        foreach (range(1, 20) as $attempt) {
            $this->postJson('/api/v1/leads/lead-magnet', $this->payload([
                'email' => "diario{$attempt}@gmail.com",
            ]))->assertCreated();
            $this->travel(1)->minute();
        }

        $this->postJson('/api/v1/leads/lead-magnet', $this->payload([
            'email' => 'limite-diario@gmail.com',
        ]))->assertTooManyRequests();
    }

    public function test_it_limits_the_same_email_and_material_to_three_requests_per_day(): void
    {
        foreach (range(1, 3) as $attempt) {
            $this->postJson('/api/v1/leads/lead-magnet', $this->payload())->assertCreated();
            $this->travel(6)->minutes();
        }

        $this->postJson('/api/v1/leads/lead-magnet', $this->payload())
            ->assertTooManyRequests();
        Mail::assertSentCount(3);
    }

    public function test_it_rejects_invalid_payloads_and_a_filled_honeypot(): void
    {
        $this->postJson('/api/v1/leads/lead-magnet', [
            'name' => 'A',
            'email' => 'invalid',
            'lead_magnet' => 'unknown-file',
            'newsletter_consent' => 'yes',
            'company_website' => 'https://spam.test',
        ])->assertUnprocessable()->assertJsonValidationErrors([
            'name',
            'email',
            'lead_magnet',
            'newsletter_consent',
            'company_website',
        ]);

        $this->assertDatabaseCount('lead_magnet_leads', 0);
        Mail::assertNothingSent();
    }

    public function test_it_upserts_a_listmonk_subscriber_only_with_consent_without_a_template(): void
    {
        $this->configureListmonk();
        config()->set('services.listmonk.template_id', null);
        Http::fake([
            'https://listmonk.test/api/subscribers?*' => Http::response(['data' => ['results' => []]]),
            'https://listmonk.test/api/subscribers' => Http::response(['data' => ['id' => 42]], 201),
        ]);

        $this->postJson('/api/v1/leads/lead-magnet', $this->payload([
            'newsletter_consent' => true,
        ]))->assertCreated();

        $lead = LeadMagnetLead::firstOrFail();
        $this->assertTrue($lead->newsletter_consent);
        $this->assertNotNull($lead->newsletter_consented_at);
        $this->assertSame(LeadMagnetLead::LISTMONK_SYNCED, $lead->listmonk_sync_status);
        $this->assertSame(42, $lead->listmonk_subscriber_id);
        Mail::assertSentCount(1);
        Http::assertSent(fn (Request $request): bool => $request->method() === 'POST'
            && $request->url() === 'https://listmonk.test/api/subscribers'
            && $request['email'] === 'pessoa@gmail.com'
            && $request['lists'] === [7]
            && $request['preconfirm_subscriptions'] === true);
    }

    public function test_listmonk_failure_does_not_block_transactional_email(): void
    {
        $this->configureListmonk();
        Http::fake(['*' => Http::response(['message' => 'unavailable'], 503)]);

        $this->postJson('/api/v1/leads/lead-magnet', $this->payload([
            'newsletter_consent' => true,
        ]))->assertCreated();

        $lead = LeadMagnetLead::firstOrFail();
        $this->assertSame(LeadMagnetLead::EMAIL_SENT, $lead->email_status);
        $this->assertSame(LeadMagnetLead::LISTMONK_FAILED, $lead->listmonk_sync_status);
        $this->assertSame('Listmonk HTTP 503.', $lead->listmonk_sync_error);
        Mail::assertSentCount(1);
    }

    public function test_it_updates_an_existing_listmonk_subscriber_without_replacing_other_lists(): void
    {
        $this->configureListmonk();
        Http::fake(function (Request $request) {
            return match ($request->method()) {
                'GET' => Http::response(['data' => ['results' => [[
                    'id' => 91,
                    'email' => 'pessoa@gmail.com',
                ]]]]),
                'PATCH', 'PUT' => Http::response(['data' => true]),
                default => Http::response([], 404),
            };
        });

        $this->postJson('/api/v1/leads/lead-magnet', $this->payload([
            'newsletter_consent' => true,
        ]))->assertCreated();

        $this->assertSame(91, LeadMagnetLead::firstOrFail()->listmonk_subscriber_id);
        Http::assertSent(fn (Request $request): bool => $request->method() === 'PATCH'
            && $request->url() === 'https://listmonk.test/api/subscribers/91'
            && ! array_key_exists('lists', $request->data()));
        Http::assertSent(fn (Request $request): bool => $request->method() === 'PUT'
            && $request->url() === 'https://listmonk.test/api/subscribers/lists'
            && $request['action'] === 'add'
            && $request['target_list_ids'] === [7]);
        Http::assertNotSent(fn (Request $request): bool => $request->method() === 'POST');
    }

    public function test_a_valid_signed_link_downloads_the_pdf_and_sets_downloaded_at_once(): void
    {
        Storage::fake('local');
        Storage::disk('local')->put('lead-magnets/playbook-growth-ecommerce.pdf', '%PDF-test');
        $lead = $this->createLead();
        $url = $this->signedDownloadUrl($lead);

        $this->get($url)
            ->assertOk()
            ->assertDownload('playbook-growth-ecommerce-algoritmux.pdf');

        $downloadedAt = $lead->fresh()->downloaded_at;
        $this->assertNotNull($downloadedAt);

        $this->travel(1)->hour();
        $this->get($url)->assertOk();
        $this->assertTrue($lead->fresh()->downloaded_at->equalTo($downloadedAt));
    }

    public function test_an_expired_or_tampered_download_link_is_rejected(): void
    {
        Storage::fake('local');
        Storage::disk('local')->put('lead-magnets/playbook-growth-ecommerce.pdf', '%PDF-test');
        $lead = $this->createLead();
        $expiringUrl = URL::temporarySignedRoute(
            'lead-magnets.download',
            now()->addMinute(),
            ['publicId' => $lead->public_id],
        );
        $tamperedUrl = str_replace($lead->public_id, '00000000-0000-4000-8000-000000000000', $expiringUrl);

        $this->get($tamperedUrl)->assertForbidden();

        $this->travel(2)->minutes();
        $this->get($expiringUrl)->assertForbidden();
        $this->assertNull($lead->fresh()->downloaded_at);
    }

    /**
     * @param  array<string, mixed>  $overrides
     * @return array<string, mixed>
     */
    private function payload(array $overrides = []): array
    {
        return [
            'name' => 'Pessoa de Teste',
            'email' => 'pessoa@gmail.com',
            'lead_magnet' => 'growth-ecommerce-playbook',
            'newsletter_consent' => false,
            'source_page' => '/blog',
            'utm_source' => 'google',
            'utm_medium' => 'cpc',
            'utm_campaign' => 'ebook-2026',
            'utm_content' => 'card-blog',
            'utm_term' => 'growth-ecommerce',
            'company_website' => '',
            ...$overrides,
        ];
    }

    private function configureListmonk(): void
    {
        config()->set('services.listmonk.enabled', true);
        config()->set('services.listmonk.base_url', 'https://listmonk.test');
        config()->set('services.listmonk.api_username', 'api-user');
        config()->set('services.listmonk.api_token', 'secret-token');
        config()->set('services.listmonk.list_id', 7);
        config()->set('services.listmonk.timeout', 10);
    }

    private function createLead(): LeadMagnetLead
    {
        return LeadMagnetLead::create([
            'public_id' => '11111111-1111-4111-8111-111111111111',
            'name' => 'Pessoa de Teste',
            'email' => 'pessoa@gmail.com',
            'lead_magnet' => 'growth-ecommerce-playbook',
            'last_requested_at' => now(),
        ]);
    }

    private function signedDownloadUrl(LeadMagnetLead $lead): string
    {
        return URL::temporarySignedRoute(
            'lead-magnets.download',
            now()->addDays(7),
            ['publicId' => $lead->public_id],
        );
    }
}
