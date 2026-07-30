<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class CreateAdminUserCommandTest extends TestCase
{
    use RefreshDatabase;

    public function test_command_creates_first_admin_with_normalized_email_and_hashed_password(): void
    {
        $password = 'SecureAdmin#2026';

        $this->artisan('admin:create')
            ->expectsQuestion('Nome do administrador', 'Administrador Algoritmux')
            ->expectsQuestion('E-mail do administrador', '  ADMIN@EXAMPLE.TEST  ')
            ->expectsQuestion('Senha', $password)
            ->expectsQuestion('Confirme a senha', $password)
            ->expectsOutputToContain('Administrador criado com sucesso.')
            ->assertSuccessful();

        $admin = User::query()->sole();

        $this->assertSame('Administrador Algoritmux', $admin->name);
        $this->assertSame('admin@example.test', $admin->email);
        $this->assertTrue($admin->is_admin);
        $this->assertNotSame($password, $admin->password);
        $this->assertTrue(Hash::check($password, $admin->password));
    }

    public function test_command_refuses_to_create_a_second_admin(): void
    {
        User::factory()->create(['is_admin' => true]);

        $this->artisan('admin:create')
            ->expectsOutputToContain('Já existe um administrador.')
            ->assertFailed();

        $this->assertSame(1, User::query()->where('is_admin', true)->count());
    }

    public function test_command_rejects_weak_password_without_creating_user(): void
    {
        $this->artisan('admin:create')
            ->expectsQuestion('Nome do administrador', 'Administrador')
            ->expectsQuestion('E-mail do administrador', 'admin@example.test')
            ->expectsQuestion('Senha', 'weak')
            ->expectsQuestion('Confirme a senha', 'weak')
            ->assertFailed();

        $this->assertDatabaseEmpty('users');
    }
}
