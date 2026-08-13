<?php

namespace Tests\Feature;

use App\Models\DiagnosticLead;
use App\Support\WebsiteNormalizer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Tests\TestCase;

class DiagnosticLeadApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_creates_a_normalized_diagnostic_lead_and_syncs_it_with_pipedrive(): void
    {
        $this->configurePipedrive();
        Http::fakeSequence()
            ->push(['data' => ['items' => []]])
            ->push(['data' => ['id' => 101]])
            ->push(['data' => ['items' => []]])
            ->push(['data' => ['items' => []]])
            ->push(['data' => ['id' => 202]])
            ->push(['data' => ['items' => []]])
            ->push(['data' => ['id' => 303]]);

        $response = $this->postJson('/api/v1/leads/diagnostic', $this->leadPayload());

        $response
            ->assertCreated()
            ->assertJsonPath('data.status', 'new')
            ->assertJsonStructure(['message', 'data' => ['public_id', 'status']]);

        $lead = DiagnosticLead::firstOrFail();

        $this->assertSame('5512999999999', $lead->whatsapp);
        $this->assertSame('pessoa@example.test', $lead->email);
        $this->assertSame('https://empresa.com', $lead->website);
        $this->assertSame('google', $lead->utm_source);
        $this->assertSame('cpc', $lead->utm_medium);
        $this->assertSame('lancamento-2026', $lead->utm_campaign);
        $this->assertSame('banner-principal', $lead->utm_content);
        $this->assertSame('consultoria-ecommerce', $lead->utm_term);
        $this->assertSame('new', $lead->status);
        $this->assertSame(DiagnosticLead::PIPEDRIVE_SYNC_SYNCED, $lead->pipedrive_sync_status);
        $this->assertSame(101, $lead->pipedrive_organization_id);
        $this->assertSame(202, $lead->pipedrive_person_id);
        $this->assertSame(303, $lead->pipedrive_deal_id);
        $this->assertNotNull($lead->pipedrive_synced_at);
        $this->assertMatchesRegularExpression(
            '/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i',
            $lead->public_id,
        );

        Http::assertSentCount(7);
        Http::assertSent(fn (Request $request): bool => $request->method() === 'POST'
            && str_ends_with(parse_url($request->url(), PHP_URL_PATH), '/deals')
            && $request['title'] === 'Diagnóstico | Empresa de Teste | Pessoa de Teste'
            && $request['pipeline_id'] === 1
            && $request['stage_id'] === 1
            && $request['owner_id'] === 23227558
            && $request['custom_fields']['revenue_field'] === 60
            && $request['custom_fields']['source_field'] === 64
            && $request['custom_fields']['source_page_field'] === '/'
            && $request['custom_fields']['local_id_field'] === $lead->public_id
            && $request['custom_fields']['utm_source_field'] === 'google'
            && $request['custom_fields']['utm_medium_field'] === 'cpc'
            && $request['custom_fields']['utm_campaign_field'] === 'lancamento-2026'
            && $request['custom_fields']['utm_content_field'] === 'banner-principal'
            && $request['custom_fields']['utm_term_field'] === 'consultoria-ecommerce'
            && ! array_key_exists('revenue_field', $request->data())
            && ! array_key_exists('source_field', $request->data())
            && ! array_key_exists('source_page_field', $request->data())
            && ! array_key_exists('local_id_field', $request->data()));
        Http::assertSent(fn (Request $request): bool => $request->method() === 'POST'
            && str_ends_with(parse_url($request->url(), PHP_URL_PATH), '/organizations')
            && $request['website'] === 'https://empresa.com');
        Http::assertSent(fn (Request $request): bool => $request->method() === 'POST'
            && str_ends_with(parse_url($request->url(), PHP_URL_PATH), '/persons')
            && $request['emails'][0]['value'] === 'pessoa@example.test'
            && $request['phones'][0]['value'] === '5512999999999');
    }

    public function test_it_requires_name_whatsapp_and_corporate_email(): void
    {
        Config::set('services.pipedrive.api_token', null);
        Http::fake();

        $response = $this->postJson('/api/v1/leads/diagnostic', [
            'name' => 'Pessoa de Teste',
            'company_name' => null,
            'revenue_range' => null,
        ]);

        $response
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'whatsapp',
                'email',
            ]);

        $this->assertDatabaseCount('diagnostic_leads', 0);

        Http::assertNothingSent();
    }

    public function test_it_rejects_free_email_domains(): void
    {
        Config::set('services.pipedrive.api_token', null);
        Http::fake();

        foreach ([
            'pessoa@gmail.com',
            'pessoa@hotmail.com',
            'pessoa@outlook.com',
            'pessoa@yahoo.com',
            'pessoa@icloud.com',
        ] as $email) {
            $response = $this->postJson('/api/v1/leads/diagnostic', [
                'name' => 'Pessoa de Teste',
                'whatsapp' => '(18) 99999-9999',
                'email' => $email,
            ]);

            $response
                ->assertUnprocessable()
                ->assertJsonValidationErrors(['email']);
        }

        $this->assertDatabaseCount('diagnostic_leads', 0);

        Http::assertNothingSent();
    }

    public function test_it_accepts_common_brazilian_whatsapp_formats(): void
    {
        Config::set('services.pipedrive.api_token', null);
        Http::fake();

        foreach ([
            ['(18) 99999-9999', '18999999999'],
            ['18 99999-9999', '18999999999'],
            ['+55 18 99999-9999', '5518999999999'],
            ['5518999999999', '5518999999999'],
        ] as [$input, $expected]) {
            $this->postJson('/api/v1/leads/diagnostic', [
                'name' => 'Pessoa de Teste',
                'whatsapp' => $input,
                'email' => 'pessoa@algoritmux.com',
            ])->assertCreated();

            $this->assertSame(
                $expected,
                DiagnosticLead::query()
                    ->latest('id')
                    ->value('whatsapp'),
            );
        }

        Http::assertNothingSent();
    }

    public function test_it_returns_json_validation_errors(): void
    {
        $response = $this->postJson('/api/v1/leads/diagnostic', [
            'name' => '',
            'whatsapp' => 'invalid',
            'email' => 'invalid-email',
            'company_name' => ['invalid'],
            'revenue_range' => 'invalid-range',
        ]);

        $response
            ->assertUnprocessable()
            ->assertJsonPath('message', 'Os dados enviados são inválidos.')
            ->assertJsonValidationErrors([
                'name',
                'whatsapp',
                'email',
                'company_name',
                'revenue_range',
            ]);
    }

    public function test_it_rejects_utm_values_longer_than_255_characters(): void
    {
        $response = $this->postJson('/api/v1/leads/diagnostic', [
            ...$this->leadPayload(),
            'utm_source' => str_repeat('a', 256),
            'utm_medium' => str_repeat('a', 256),
            'utm_campaign' => str_repeat('a', 256),
            'utm_content' => str_repeat('a', 256),
            'utm_term' => str_repeat('a', 256),
        ]);

        $response->assertUnprocessable()->assertJsonValidationErrors([
            'utm_source',
            'utm_medium',
            'utm_campaign',
            'utm_content',
            'utm_term',
        ]);
        $this->assertDatabaseCount('diagnostic_leads', 0);
    }

    public function test_it_accepts_missing_utms_and_persists_them_as_null(): void
    {
        $this->configurePipedrive();
        Http::fakeSequence()
            ->push(['data' => ['items' => []]])
            ->push(['data' => ['id' => 101]])
            ->push(['data' => ['items' => []]])
            ->push(['data' => ['items' => []]])
            ->push(['data' => ['id' => 202]])
            ->push(['data' => ['items' => []]])
            ->push(['data' => ['id' => 303]]);
        $payload = $this->leadPayload();

        foreach (['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as $field) {
            unset($payload[$field]);
        }

        $this->postJson('/api/v1/leads/diagnostic', $payload)->assertCreated();

        $lead = DiagnosticLead::firstOrFail();
        $this->assertNull($lead->utm_source);
        $this->assertNull($lead->utm_medium);
        $this->assertNull($lead->utm_campaign);
        $this->assertNull($lead->utm_content);
        $this->assertNull($lead->utm_term);
    }

    public function test_it_normalizes_and_accepts_flexible_public_websites(): void
    {
        foreach ([
            'empresa.com' => 'https://empresa.com',
            'empresa.com.br' => 'https://empresa.com.br',
            'empresa.io' => 'https://empresa.io',
            'empresa.ai' => 'https://empresa.ai',
            'loja.empresa.com/pagina?origem=ads#form' => 'https://loja.empresa.com/pagina?origem=ads#form',
            'http://empresa.net/contato' => 'http://empresa.net/contato',
        ] as $input => $expected) {
            $website = WebsiteNormalizer::normalize($input);

            $this->assertSame($expected, $website);
            $this->assertTrue(WebsiteNormalizer::isValid($website));
        }

        $this->assertNull(WebsiteNormalizer::normalize('   '));

        foreach ([
            'www',
            'empresa',
            'javascript:alert(1)',
            'file:///arquivo',
            'ftp://empresa.com',
            'http://localhost',
            'http://127.0.0.1',
            'http://192.168.1.10',
        ] as $input) {
            $this->assertFalse(WebsiteNormalizer::isValid(WebsiteNormalizer::normalize($input)));
        }
    }

    public function test_it_rejects_an_invalid_website_without_saving_the_lead(): void
    {
        $response = $this->postJson('/api/v1/leads/diagnostic', [
            ...$this->leadPayload(),
            'website' => 'http://localhost',
        ]);

        $response->assertUnprocessable()->assertJsonValidationErrors(['website']);
        $this->assertDatabaseCount('diagnostic_leads', 0);
    }

    public function test_it_saves_the_lead_when_pipedrive_configuration_is_missing(): void
    {
        Config::set('services.pipedrive.api_token', null);

        $response = $this->postJson('/api/v1/leads/diagnostic', $this->leadPayload());

        $response->assertCreated();
        $lead = DiagnosticLead::firstOrFail();

        $this->assertSame(DiagnosticLead::PIPEDRIVE_SYNC_FAILED, $lead->pipedrive_sync_status);
        $this->assertSame('Pipedrive configuration is incomplete.', $lead->pipedrive_sync_error);
        Http::assertNothingSent();
    }

    public function test_it_saves_the_lead_when_pipedrive_times_out_without_exposing_sensitive_data(): void
    {
        $this->configurePipedrive();
        $requests = 0;
        Http::fake(function () use (&$requests): never {
            $requests++;

            throw new ConnectionException('api_token=fake-token pessoa@example.test 5512999999999');
        });

        $response = $this->postJson('/api/v1/leads/diagnostic', $this->leadPayload());

        $response->assertCreated();
        $lead = DiagnosticLead::firstOrFail();

        $this->assertSame(DiagnosticLead::PIPEDRIVE_SYNC_FAILED, $lead->pipedrive_sync_status);
        $this->assertSame('Pipedrive request timed out.', $lead->pipedrive_sync_error);
        $this->assertStringNotContainsString('fake-token', $lead->pipedrive_sync_error);
        $this->assertStringNotContainsString('pessoa@example.test', $lead->pipedrive_sync_error);
        $this->assertStringNotContainsString('5512999999999', $lead->pipedrive_sync_error);
        $this->assertSame(1, $requests);
    }

    public function test_it_handles_pipedrive_rate_limiting_without_failing_the_form_request(): void
    {
        $this->configurePipedrive();
        Http::fake(['*' => Http::response(['error' => 'rate limited'], 429)]);

        $this->postJson('/api/v1/leads/diagnostic', $this->leadPayload())->assertCreated();

        $lead = DiagnosticLead::firstOrFail();
        $this->assertSame(DiagnosticLead::PIPEDRIVE_SYNC_FAILED, $lead->pipedrive_sync_status);
        $this->assertSame('Pipedrive HTTP 429: rate limit reached.', $lead->pipedrive_sync_error);
        Http::assertSentCount(1);
    }

    public function test_it_handles_pipedrive_server_errors_without_failing_the_form_request(): void
    {
        $this->configurePipedrive();
        Http::fake(['*' => Http::response(['error' => 'service unavailable'], 503)]);

        $this->postJson('/api/v1/leads/diagnostic', $this->leadPayload())->assertCreated();

        $lead = DiagnosticLead::firstOrFail();
        $this->assertSame(DiagnosticLead::PIPEDRIVE_SYNC_FAILED, $lead->pipedrive_sync_status);
        $this->assertSame('Pipedrive HTTP 503: service is unavailable.', $lead->pipedrive_sync_error);
        Http::assertSentCount(1);
    }

    public function test_it_persists_partial_remote_ids_when_deal_creation_fails(): void
    {
        $this->configurePipedrive();
        Http::fakeSequence()
            ->push(['data' => ['items' => []]])
            ->push(['data' => ['id' => 101]])
            ->push(['data' => ['items' => []]])
            ->push(['data' => ['items' => []]])
            ->push(['data' => ['id' => 202]])
            ->push(['error' => 'service unavailable'], 503);

        $this->postJson('/api/v1/leads/diagnostic', $this->leadPayload())->assertCreated();

        $lead = DiagnosticLead::firstOrFail();
        $this->assertSame(101, $lead->pipedrive_organization_id);
        $this->assertSame(202, $lead->pipedrive_person_id);
        $this->assertNull($lead->pipedrive_deal_id);
        $this->assertSame(DiagnosticLead::PIPEDRIVE_SYNC_FAILED, $lead->pipedrive_sync_status);
        $this->assertSame('Pipedrive HTTP 503: service is unavailable.', $lead->pipedrive_sync_error);
    }

    public function test_it_updates_an_existing_organization_website_only_when_remote_value_is_empty(): void
    {
        $this->configurePipedrive();
        Http::fake(function (Request $request) {
            $path = parse_url($request->url(), PHP_URL_PATH);

            return match ([$request->method(), $path]) {
                ['GET', '/api/v2/organizations/search'] => Http::response(['data' => ['items' => [['item' => ['id' => 101]]]]]),
                ['GET', '/api/v2/organizations/101'] => Http::response(['data' => ['website' => null]]),
                ['PATCH', '/api/v2/organizations/101'] => Http::response(['data' => ['id' => 101]]),
                ['GET', '/api/v2/persons/search'] => Http::response(['data' => ['items' => [['item' => ['id' => 202]]]]]),
                ['GET', '/api/v2/deals/search'] => Http::response(['data' => ['items' => [['item' => ['id' => 303]]]]]),
                default => Http::response(['error' => 'Unexpected request'], 500),
            };
        });

        $this->postJson('/api/v1/leads/diagnostic', $this->leadPayload())->assertCreated();

        Http::assertSent(fn (Request $request): bool => $request->method() === 'PATCH'
            && str_ends_with(parse_url($request->url(), PHP_URL_PATH), '/organizations/101')
            && $request['website'] === 'https://empresa.com');
        Http::assertSent(fn (Request $request): bool => $request->method() === 'GET'
            && str_ends_with(parse_url($request->url(), PHP_URL_PATH), '/deals/search')
            && $request['term'] === 'Diagnóstico | Empresa de Teste | Pessoa de Teste');
    }

    public function test_it_does_not_overwrite_an_existing_organization_website(): void
    {
        $this->configurePipedrive();
        Http::fake(function (Request $request) {
            $path = parse_url($request->url(), PHP_URL_PATH);

            return match ([$request->method(), $path]) {
                ['GET', '/api/v2/organizations/search'] => Http::response(['data' => ['items' => [['item' => ['id' => 101]]]]]),
                ['GET', '/api/v2/organizations/101'] => Http::response(['data' => ['website' => 'https://existente.com']]),
                ['GET', '/api/v2/persons/search'] => Http::response(['data' => ['items' => [['item' => ['id' => 202]]]]]),
                ['GET', '/api/v2/deals/search'] => Http::response(['data' => ['items' => [['item' => ['id' => 303]]]]]),
                default => Http::response(['error' => 'Unexpected request'], 500),
            };
        });

        $this->postJson('/api/v1/leads/diagnostic', $this->leadPayload())->assertCreated();

        Http::assertNotSent(fn (Request $request): bool => $request->method() === 'PATCH'
            && str_ends_with(parse_url($request->url(), PHP_URL_PATH), '/organizations/101'));
    }

    public function test_it_uses_the_person_name_as_a_deal_title_fallback_when_company_name_is_empty(): void
    {
        $this->configurePipedrive();
        $this->createLead([
            'company_name' => '',
            'pipedrive_organization_id' => 101,
            'pipedrive_person_id' => 202,
            'pipedrive_sync_status' => DiagnosticLead::PIPEDRIVE_SYNC_FAILED,
        ]);
        Http::fakeSequence()
            ->push(['data' => ['items' => []]])
            ->push(['data' => ['id' => 303]]);

        $this->artisan('pipedrive:sync-leads', ['--limit' => 1])->assertExitCode(0);

        Http::assertSent(fn (Request $request): bool => $request->method() === 'POST'
            && str_ends_with(parse_url($request->url(), PHP_URL_PATH), '/deals')
            && $request['title'] === 'Diagnóstico | Pessoa de Teste');
    }

    public function test_it_marks_ambiguous_legacy_revenue_ranges_for_correction_without_calling_pipedrive(): void
    {
        $this->configurePipedrive();
        $lead = $this->createLead([
            'revenue_range' => '50001_200000',
            'pipedrive_sync_status' => DiagnosticLead::PIPEDRIVE_SYNC_PENDING,
        ]);

        $this->artisan('pipedrive:sync-leads', ['--limit' => 1])->assertExitCode(0);

        $lead->refresh();
        $this->assertSame(DiagnosticLead::PIPEDRIVE_SYNC_FAILED, $lead->pipedrive_sync_status);
        $this->assertSame('Pipedrive revenue range requires correction.', $lead->pipedrive_sync_error);
        Http::assertNothingSent();
    }

    public function test_the_reprocessing_command_reuses_remote_ids_and_syncs_the_deal(): void
    {
        $this->configurePipedrive();
        $lead = $this->createLead([
            'pipedrive_organization_id' => 101,
            'pipedrive_person_id' => 202,
            'pipedrive_sync_status' => DiagnosticLead::PIPEDRIVE_SYNC_FAILED,
            'utm_source' => 'newsletter',
            'utm_medium' => 'email',
            'utm_campaign' => 'reativacao',
            'utm_content' => 'cta-rodape',
            'utm_term' => 'clientes-inativos',
        ]);

        Http::fakeSequence()
            ->push(['data' => ['items' => []]])
            ->push(['data' => ['id' => 303]]);

        $this->artisan('pipedrive:sync-leads', ['--limit' => 1])
            ->expectsOutput('Pipedrive sync complete: processed=1 synced=1 failed=0.')
            ->assertExitCode(0);

        $lead->refresh();
        $this->assertSame(303, $lead->pipedrive_deal_id);
        $this->assertSame(DiagnosticLead::PIPEDRIVE_SYNC_SYNCED, $lead->pipedrive_sync_status);
        Http::assertSent(fn (Request $request): bool => $request->method() === 'POST'
            && str_ends_with(parse_url($request->url(), PHP_URL_PATH), '/deals')
            && $request['custom_fields']['utm_source_field'] === 'newsletter'
            && $request['custom_fields']['utm_medium_field'] === 'email'
            && $request['custom_fields']['utm_campaign_field'] === 'reativacao'
            && $request['custom_fields']['utm_content_field'] === 'cta-rodape'
            && $request['custom_fields']['utm_term_field'] === 'clientes-inativos');

        $this->artisan('pipedrive:sync-leads', ['--limit' => 1])
            ->expectsOutput('Pipedrive sync complete: processed=0 synced=0 failed=0.')
            ->assertExitCode(0);
        Http::assertSentCount(2);
    }

    public function test_it_does_not_send_empty_utm_values_to_pipedrive(): void
    {
        $this->configurePipedrive();
        $lead = $this->createLead([
            'pipedrive_organization_id' => 101,
            'pipedrive_person_id' => 202,
            'pipedrive_sync_status' => DiagnosticLead::PIPEDRIVE_SYNC_FAILED,
            'utm_source' => '',
            'utm_medium' => null,
            'utm_campaign' => '   ',
        ]);
        Http::fakeSequence()
            ->push(['data' => ['items' => []]])
            ->push(['data' => ['id' => 303]]);

        $this->artisan('pipedrive:sync-leads', ['--limit' => 1])->assertExitCode(0);

        $lead->refresh();
        $this->assertSame(DiagnosticLead::PIPEDRIVE_SYNC_SYNCED, $lead->pipedrive_sync_status);
        Http::assertSent(fn (Request $request): bool => $request->method() === 'POST'
            && str_ends_with(parse_url($request->url(), PHP_URL_PATH), '/deals')
            && ! array_key_exists('utm_source_field', $request['custom_fields'])
            && ! array_key_exists('utm_medium_field', $request['custom_fields'])
            && ! array_key_exists('utm_campaign_field', $request['custom_fields'])
            && ! array_key_exists('utm_content_field', $request['custom_fields'])
            && ! array_key_exists('utm_term_field', $request['custom_fields']));
    }

    public function test_it_creates_a_deal_without_custom_fields_when_optional_configuration_is_absent(): void
    {
        $this->configurePipedrive();
        Config::set('services.pipedrive.deal_revenue_field_key', null);
        Config::set('services.pipedrive.deal_source_field_key', null);
        Config::set('services.pipedrive.deal_source_page_field_key', null);
        Config::set('services.pipedrive.deal_local_id_field_key', null);

        $lead = $this->createLead([
            'pipedrive_organization_id' => 101,
            'pipedrive_person_id' => 202,
            'pipedrive_sync_status' => DiagnosticLead::PIPEDRIVE_SYNC_FAILED,
        ]);
        Http::fakeSequence()
            ->push(['data' => ['items' => []]])
            ->push(['data' => ['id' => 303]]);

        $this->artisan('pipedrive:sync-leads', ['--limit' => 1])->assertExitCode(0);

        $lead->refresh();
        $this->assertSame(DiagnosticLead::PIPEDRIVE_SYNC_SYNCED, $lead->pipedrive_sync_status);
        Http::assertSent(fn (Request $request): bool => $request->method() === 'POST'
            && str_ends_with(parse_url($request->url(), PHP_URL_PATH), '/deals')
            && ! array_key_exists('custom_fields', $request->data()));
    }

    private function configurePipedrive(): void
    {
        Config::set('services.pipedrive', [
            'company_domain' => 'metadevendasltda',
            'api_token' => 'fake-token',
            'pipeline_id' => 1,
            'stage_id' => 1,
            'owner_id' => 23227558,
            'timeout' => 2,
            'org_website_field_key' => 'website',
            'deal_revenue_field_key' => 'revenue_field',
            'deal_source_field_key' => 'source_field',
            'deal_source_option_id' => 64,
            'deal_source_page_field_key' => 'source_page_field',
            'deal_local_id_field_key' => 'local_id_field',
            'deal_utm_source_field_key' => 'utm_source_field',
            'deal_utm_medium_field_key' => 'utm_medium_field',
            'deal_utm_campaign_field_key' => 'utm_campaign_field',
            'deal_utm_content_field_key' => 'utm_content_field',
            'deal_utm_term_field_key' => 'utm_term_field',
            'revenue_option_ids' => [
                'up_to_50000' => 58,
                '50001_75000' => 59,
                '75001_150000' => 60,
                '150001_250000' => 61,
                '250001_500000' => 62,
                'above_500000' => 63,
            ],
        ]);
    }

    /**
     * @return array<string, string>
     */
    private function leadPayload(): array
    {
        return [
            'name' => 'Pessoa de Teste',
            'whatsapp' => '+55 (12) 99999-9999',
            'email' => 'PESSOA@EXAMPLE.TEST ',
            'company_name' => 'Empresa de Teste',
            'website' => 'empresa.com',
            'revenue_range' => '75001_150000',
            'source_page' => '/',
            'utm_source' => 'google',
            'utm_medium' => 'cpc',
            'utm_campaign' => 'lancamento-2026',
            'utm_content' => 'banner-principal',
            'utm_term' => 'consultoria-ecommerce',
        ];
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    private function createLead(array $attributes = []): DiagnosticLead
    {
        return DiagnosticLead::create([
            'public_id' => (string) Str::uuid(),
            'name' => 'Pessoa de Teste',
            'whatsapp' => '5512999999999',
            'email' => 'pessoa@example.test',
            'company_name' => 'Empresa de Teste',
            'revenue_range' => '75001_150000',
            'status' => 'new',
            ...$attributes,
        ]);
    }
}
