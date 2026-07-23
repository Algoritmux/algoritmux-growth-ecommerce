<?php

namespace Tests\Feature;

use App\Models\DiagnosticLead;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DiagnosticLeadApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_creates_a_normalized_diagnostic_lead(): void
    {
        $response = $this->postJson('/api/v1/leads/diagnostic', [
            'name' => 'Pessoa de Teste',
            'whatsapp' => '+55 (12) 99999-9999',
            'email' => 'PESSOA@EXAMPLE.TEST ',
            'company_name' => 'Empresa de Teste',
            'website' => 'https://empresa.example.test',
            'revenue_range' => '50001_200000',
            'source_page' => '/',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.status', 'new')
            ->assertJsonStructure(['message', 'data' => ['public_id', 'status']]);

        $lead = DiagnosticLead::firstOrFail();

        $this->assertSame('5512999999999', $lead->whatsapp);
        $this->assertSame('pessoa@example.test', $lead->email);
        $this->assertSame('new', $lead->status);
        $this->assertMatchesRegularExpression(
            '/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i',
            $lead->public_id,
        );
    }

    public function test_it_returns_json_validation_errors(): void
    {
        $response = $this->postJson('/api/v1/leads/diagnostic', [
            'name' => '',
            'whatsapp' => 'invalid',
            'email' => 'invalid-email',
            'company_name' => '',
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
}
