<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Filament\Auth\Pages\Login;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Livewire\Livewire;
use Tests\TestCase;

class AdminPanelAccessTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Filament::setCurrentPanel('admin');
    }

    public function test_guest_is_redirected_to_login(): void
    {
        $this->get('/admin')
            ->assertRedirect('/admin/login');
    }

    public function test_login_page_is_available_without_public_registration_or_password_reset(): void
    {
        $this->get('/admin/login')
            ->assertOk()
            ->assertSee('Algoritmux')
            ->assertDontSee('Register')
            ->assertDontSee('Forgot your password?');
    }

    public function test_non_admin_user_cannot_access_or_log_in_to_panel(): void
    {
        $password = 'RegularUser#2026';
        $user = User::factory()->create([
            'email' => 'regular@example.test',
            'is_admin' => false,
            'password' => $password,
        ]);

        $this->assertFalse($user->canAccessPanel(Filament::getPanel('admin')));

        $this->actingAs($user)
            ->get('/admin')
            ->assertForbidden();

        auth()->logout();

        Livewire::test(Login::class)
            ->fillForm([
                'email' => $user->email,
                'password' => $password,
            ])
            ->call('authenticate')
            ->assertHasFormErrors(['email']);

        $this->assertGuest();
    }

    public function test_admin_can_log_in_access_dashboard_and_log_out(): void
    {
        $password = 'AdminAccess#2026';
        $admin = User::factory()->create([
            'email' => 'admin@example.test',
            'is_admin' => true,
            'password' => $password,
        ]);

        $this->assertTrue($admin->canAccessPanel(Filament::getPanel('admin')));

        Livewire::test(Login::class)
            ->fillForm([
                'email' => $admin->email,
                'password' => $password,
            ])
            ->call('authenticate')
            ->assertHasNoFormErrors();

        $this->assertAuthenticatedAs($admin);

        $this->get('/admin')
            ->assertOk()
            ->assertSee('Dashboard');

        $this->post('/admin/logout')
            ->assertRedirect('/admin/login');

        $this->assertGuest();
    }
}
