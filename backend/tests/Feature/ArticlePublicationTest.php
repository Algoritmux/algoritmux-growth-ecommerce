<?php

namespace Tests\Feature;

use App\Enums\ArticleStatus;
use App\Filament\Resources\Articles\Pages\CreateArticle;
use App\Models\Article;
use App\Models\User;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Livewire\Livewire;
use Tests\TestCase;

class ArticlePublicationTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        Carbon::setTestNow('2026-07-30 15:00:00');
        Filament::setCurrentPanel('admin');

        $this->admin = User::factory()->create(['is_admin' => true]);
        $this->actingAs($this->admin);
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();

        parent::tearDown();
    }

    public function test_only_published_articles_with_reached_date_are_publicly_eligible(): void
    {
        $live = Article::factory()
            ->for($this->admin, 'author')
            ->published()
            ->create(['published_at' => now()->subMinute()]);

        $scheduled = Article::factory()
            ->for($this->admin, 'author')
            ->scheduled()
            ->create(['published_at' => now()->addMinute()]);

        $draft = Article::factory()
            ->for($this->admin, 'author')
            ->create(['published_at' => now()->subDay()]);

        $archived = Article::factory()
            ->for($this->admin, 'author')
            ->archived()
            ->create(['published_at' => now()->subDay()]);

        $this->assertTrue($live->isPublished());
        $this->assertFalse($live->isScheduled());
        $this->assertTrue($scheduled->isScheduled());
        $this->assertFalse($scheduled->isPublished());

        $this->assertEquals(
            [$live->id],
            Article::query()->published()->pluck('id')->all(),
        );
        $this->assertEquals(
            [$scheduled->id],
            Article::query()->scheduled()->pluck('id')->all(),
        );
        $this->assertNotContains($draft->id, Article::query()->published()->pluck('id')->all());
        $this->assertNotContains($archived->id, Article::query()->published()->pluck('id')->all());
    }

    public function test_admin_can_schedule_a_future_publication(): void
    {
        Livewire::test(CreateArticle::class)
            ->fillForm([
                'title' => 'Artigo agendado',
                'slug' => 'artigo-agendado',
                'excerpt' => 'Resumo do conteúdo agendado.',
                'content' => '<p>Conteúdo que será publicado no futuro.</p>',
                'category' => 'Marketing',
                'reading_time_minutes' => 6,
                'status' => ArticleStatus::Published->value,
                'published_at' => now()->addDays(2),
            ])
            ->call('create')
            ->assertHasNoFormErrors();

        $article = Article::query()->sole();

        $this->assertSame(ArticleStatus::Published, $article->status);
        $this->assertTrue($article->isScheduled());
        $this->assertFalse($article->isPublished());
        $this->assertSame(0, Article::query()->published()->count());
        $this->assertSame(1, Article::query()->scheduled()->count());
    }
}
