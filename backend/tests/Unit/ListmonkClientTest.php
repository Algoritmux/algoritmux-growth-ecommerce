<?php

namespace Tests\Unit;

use App\Services\Listmonk\ListmonkClient;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class ListmonkClientTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        Http::preventStrayRequests();
        config()->set('services.listmonk.base_url', 'https://listmonk.test');
        config()->set('services.listmonk.api_username', 'api-user');
        config()->set('services.listmonk.api_token', 'api-token');
        config()->set('services.listmonk.list_id', 7);
        config()->set('services.listmonk.timeout', 5);
    }

    public function test_it_finds_an_existing_subscriber_by_exact_normalized_email_without_sql_query(): void
    {
        Http::fake(function (Request $request) {
            return match ($request->method()) {
                'GET' => Http::response(['data' => ['results' => [
                    ['id' => 12, 'email' => 'other@example.com'],
                    ['id' => 91, 'email' => 'existing@example.com'],
                ]]]),
                'PUT' => Http::response(['data' => true]),
                default => Http::response([], 404),
            };
        });

        $subscriberId = app(ListmonkClient::class)->upsertSubscriber(
            'Existing Subscriber',
            ' Existing@Example.COM ',
        );

        $this->assertSame(91, $subscriberId);
        Http::assertSent(function (Request $request): bool {
            parse_str((string) parse_url($request->url(), PHP_URL_QUERY), $query);

            return $request->method() === 'GET'
                && parse_url($request->url(), PHP_URL_PATH) === '/api/subscribers'
                && $query['search'] === 'existing@example.com'
                && $query['page'] === '1'
                && $query['per_page'] === '100'
                && ! array_key_exists('query', $query);
        });
        Http::assertSent(fn (Request $request): bool => $request->method() === 'PUT'
            && $request->url() === 'https://listmonk.test/api/subscribers/lists'
            && $request['action'] === 'add'
            && $request['target_list_ids'] === [7]
            && $request['status'] === 'confirmed');
        Http::assertNotSent(fn (Request $request): bool => in_array($request->method(), ['PATCH', 'POST'], true));
    }

    public function test_it_creates_a_subscriber_when_search_has_no_exact_email_match(): void
    {
        Http::fake(function (Request $request) {
            if ($request->method() === 'GET') {
                return Http::response(['data' => ['results' => [
                    ['id' => 12, 'email' => 'new-user@example.com.br'],
                ]]]);
            }

            if ($request->method() === 'POST') {
                return Http::response(['data' => ['id' => 42]], 201);
            }

            return Http::response([], 404);
        });

        $subscriberId = app(ListmonkClient::class)->upsertSubscriber(
            'New Subscriber',
            'new-user@example.com',
        );

        $this->assertSame(42, $subscriberId);
        Http::assertSent(function (Request $request): bool {
            parse_str((string) parse_url($request->url(), PHP_URL_QUERY), $query);

            return $request->method() === 'GET'
                && $query['search'] === 'new-user@example.com'
                && ! array_key_exists('query', $query);
        });
        Http::assertSent(fn (Request $request): bool => $request->method() === 'POST'
            && $request->url() === 'https://listmonk.test/api/subscribers'
            && $request['email'] === 'new-user@example.com'
            && $request['lists'] === [7]);
        Http::assertNotSent(fn (Request $request): bool => $request->method() === 'PATCH');
    }
}
