<?php

namespace Tests\Feature\Admin;

use App\Enums\ArticleStatus;
use App\Filament\Resources\Articles\ArticleResource;
use App\Filament\Resources\Articles\Pages\CreateArticle;
use App\Filament\Resources\Articles\Pages\EditArticle;
use App\Filament\Resources\Articles\Pages\ListArticles;
use App\Models\Article;
use App\Models\User;
use App\Services\ArticleContentImageStorage;
use App\Services\ArticleCoverImageStorage;
use Filament\Actions\DeleteAction;
use Filament\Facades\Filament;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\RichEditor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Livewire\Features\SupportFileUploads\TemporaryUploadedFile;
use Livewire\Livewire;
use Tests\TestCase;

class ArticleResourceTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        Filament::setCurrentPanel('admin');

        $this->admin = User::factory()->create(['is_admin' => true]);
        $this->actingAs($this->admin);
    }

    public function test_admin_can_list_search_filter_and_sort_articles(): void
    {
        $published = Article::factory()
            ->for($this->admin, 'author')
            ->published()
            ->create([
                'title' => 'Estratégia de conversão',
                'slug' => 'estrategia-de-conversao',
                'category' => 'Marketing',
            ]);

        $draft = Article::factory()
            ->for($this->admin, 'author')
            ->create([
                'title' => 'Operação comercial previsível',
                'slug' => 'operacao-comercial-previsivel',
                'category' => 'Vendas',
            ]);

        Livewire::test(ListArticles::class)
            ->assertCanSeeTableRecords([$published, $draft])
            ->searchTable('conversão')
            ->assertCanSeeTableRecords([$published])
            ->assertCanNotSeeTableRecords([$draft])
            ->searchTable()
            ->filterTable('status', ArticleStatus::Draft->value)
            ->assertCanSeeTableRecords([$draft])
            ->assertCanNotSeeTableRecords([$published])
            ->resetTableFilters()
            ->sortTable('title', 'asc')
            ->assertCanSeeTableRecords([$published, $draft], inOrder: true);
    }

    public function test_admin_can_create_article_with_automatic_editable_slug_and_cover(): void
    {
        Storage::fake('public');

        $cover = UploadedFile::fake()->createWithContent(
            'capa.png',
            base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Zl1sAAAAASUVORK5CYII=', strict: true),
        );

        Livewire::test(CreateArticle::class)
            ->fillForm([
                'title' => 'Dados que geram crescimento',
            ])
            ->assertSchemaStateSet([
                'slug' => 'dados-que-geram-crescimento',
            ])
            ->fillForm([
                'title' => 'Dados que geram crescimento',
                'slug' => 'crescimento-orientado-por-dados',
                'excerpt' => 'Como transformar dados em decisões comerciais melhores.',
                'content' => '<p>Conteúdo completo do artigo.</p>',
                'cover_image' => $cover,
                'cover_alt_text' => 'Gráfico de crescimento orientado por dados',
                'category' => 'Marketing',
                'reading_time_minutes' => 7,
                'status' => ArticleStatus::Draft->value,
                'is_featured' => true,
                'seo_title' => 'Crescimento orientado por dados',
                'seo_description' => 'Entenda como usar dados para orientar decisões de crescimento.',
            ])
            ->call('create')
            ->assertHasNoFormErrors()
            ->assertRedirect(ArticleResource::getUrl('index'));

        $article = Article::query()->sole();

        $this->assertSame($this->admin->id, $article->author_id);
        $this->assertSame('crescimento-orientado-por-dados', $article->slug);
        $this->assertSame(ArticleStatus::Draft, $article->status);
        $this->assertTrue($article->is_featured);
        $this->assertNotNull($article->cover_image);
        $this->assertMatchesRegularExpression(
            '#\Aarticles/covers/[0-9A-Z]{26}\.(?:jpg|png|webp)\z#',
            $article->cover_image,
        );
        Storage::disk('public')->assertExists($article->cover_image);
    }

    public function test_cover_image_reaches_livewire_temporary_storage_before_article_is_saved(): void
    {
        Storage::fake('local');

        $cover = $this->fakePng('capa.png');

        $component = Livewire::test(CreateArticle::class)
            ->fillForm(['cover_image' => $cover])
            ->assertHasNoFormErrors(['cover_image']);

        $temporaryFile = collect($component->get('data.cover_image'))->first();

        $this->assertInstanceOf(TemporaryUploadedFile::class, $temporaryFile);
        $this->assertTrue($temporaryFile->exists());
        $this->assertGreaterThan(0, $temporaryFile->getSize());
    }

    public function test_cover_upload_has_safe_configuration_and_existing_preview_url(): void
    {
        Storage::fake('public');

        $coverPath = 'articles/covers/01KYTZZZZZZZZZZZZZZZZZZZZZ.png';
        Storage::disk('public')->put(
            $coverPath,
            $this->fakePng('capa.png')->getContent(),
        );

        $article = Article::factory()
            ->for($this->admin, 'author')
            ->create(['cover_image' => $coverPath]);

        Livewire::test(EditArticle::class, ['record' => $article->getRouteKey()])
            ->assertFormFieldExists(
                'cover_image',
                function (FileUpload $field) use ($coverPath): bool {
                    $uploadedFile = collect($field->getUploadedFiles())->first();
                    $validationMessages = $field->getValidationMessages();

                    return $field->getDiskName() === 'public'
                        && $field->getDirectory() === ArticleCoverImageStorage::DIRECTORY
                        && $field->getAcceptedFileTypes() === ['image/jpeg', 'image/png', 'image/webp']
                        && $field->getMaxSize() === ArticleCoverImageStorage::MAX_SIZE_KILOBYTES
                        && ! $field->hasImageEditor()
                        && $field->getPanelAspectRatio() === '16:9'
                        && $validationMessages['mimetypes'] === 'A capa deve ser uma imagem JPG, PNG ou WebP.'
                        && $validationMessages['max'] === 'A capa não pode exceder 5 MB.'
                        && $uploadedFile['url'] === "/storage/{$coverPath}"
                        && $uploadedFile['size'] > 0
                        && $uploadedFile['type'] === 'image/png';
                },
            );
    }

    public function test_livewire_temporary_upload_is_restricted_to_supported_cover_images(): void
    {
        $this->assertSame('local', config('livewire.temporary_file_upload.disk'));
        $this->assertSame('livewire-tmp', config('livewire.temporary_file_upload.directory'));
        $this->assertSame(
            [
                'required',
                'file',
                'mimetypes:image/jpeg,image/png,image/webp',
                'max:5120',
            ],
            config('livewire.temporary_file_upload.rules'),
        );
        $this->assertSame(
            ['jpg', 'jpeg', 'png', 'webp'],
            config('livewire.temporary_file_upload.preview_mimes'),
        );
    }

    public function test_admin_can_replace_existing_cover_image(): void
    {
        Storage::fake('public');

        $oldCoverPath = 'articles/covers/01KYTYYYYYYYYYYYYYYYYYYYYYY.png';
        Storage::disk('public')->put($oldCoverPath, 'old cover');

        $article = Article::factory()
            ->for($this->admin, 'author')
            ->create(['cover_image' => $oldCoverPath]);

        $newCover = $this->fakePng('nova-capa.png');

        Livewire::test(EditArticle::class, ['record' => $article->getRouteKey()])
            ->fillForm(['cover_image' => []])
            ->fillForm([
                'cover_image' => $newCover,
                'cover_alt_text' => 'Nova capa do artigo',
            ])
            ->call('save')
            ->assertHasNoFormErrors()
            ->assertRedirect(ArticleResource::getUrl('index'));

        $newCoverPath = $article->fresh()->cover_image;

        $this->assertNotSame($oldCoverPath, $newCoverPath);
        $this->assertStringStartsWith(ArticleCoverImageStorage::DIRECTORY.'/', $newCoverPath);
        Storage::disk('public')->assertExists($newCoverPath);
        Storage::disk('public')->assertMissing($oldCoverPath);
    }

    public function test_article_editor_has_safe_rich_content_tools_and_image_upload_configuration(): void
    {
        Storage::fake('public');

        $imagePath = 'articles/content/019444e8-7f9f-4abc-8def-0123456789ab.webp';
        Storage::disk('public')->put($imagePath, 'fake image');

        $expectedTools = [
            'bold',
            'italic',
            'underline',
            'strike',
            'subscript',
            'superscript',
            'link',
            'h2',
            'h3',
            'alignStart',
            'alignCenter',
            'alignEnd',
            'blockquote',
            'codeBlock',
            'bulletList',
            'orderedList',
            'table',
            'attachFiles',
            'undo',
            'redo',
        ];

        Livewire::test(CreateArticle::class)
            ->assertFormFieldExists(
                'content',
                function (RichEditor $field) use ($expectedTools, $imagePath): bool {
                    $configuredTools = collect($field->getToolbarButtons())
                        ->flatten()
                        ->all();

                    return collect($expectedTools)->every(
                        fn (string $tool): bool => in_array($tool, $configuredTools, true),
                    )
                        && $field->getFileAttachmentsDiskName() === 'public'
                        && $field->getFileAttachmentsDirectory() === ArticleContentImageStorage::DIRECTORY
                        && $field->getFileAttachmentsVisibility() === 'public'
                        && $field->getFileAttachmentsAcceptedFileTypes() === ['image/jpeg', 'image/png', 'image/webp']
                        && $field->getFileAttachmentsMaxSize() === ArticleContentImageStorage::MAX_SIZE_KILOBYTES
                        && $field->getFileAttachmentUrl($imagePath) === "/storage/{$imagePath}"
                        && $field->shouldPreventFileAttachmentPathTampering()
                        && $field->hasResizableImages()
                        && $field->getLinkProtocols() === ['http', 'https', 'mailto', 'tel'];
                },
            );
    }

    public function test_admin_can_edit_and_soft_delete_an_article(): void
    {
        $article = Article::factory()
            ->for($this->admin, 'author')
            ->create();

        Livewire::test(EditArticle::class, ['record' => $article->getRouteKey()])
            ->fillForm([
                'title' => 'Título atualizado',
                'slug' => 'titulo-atualizado',
                'category' => 'Tecnologia',
                'reading_time_minutes' => 9,
            ])
            ->call('save')
            ->assertHasNoFormErrors()
            ->assertRedirect(ArticleResource::getUrl('index'));

        $this->assertDatabaseHas('articles', [
            'id' => $article->id,
            'title' => 'Título atualizado',
            'slug' => 'titulo-atualizado',
            'category' => 'Tecnologia',
            'reading_time_minutes' => 9,
        ]);

        Livewire::test(EditArticle::class, ['record' => $article->getRouteKey()])
            ->callAction(DeleteAction::class);

        $this->assertSoftDeleted($article);
    }

    public function test_editing_an_article_preserves_internal_image_markup(): void
    {
        Storage::fake('public');

        $imagePath = 'articles/content/019444e8-7f9f-4abc-8def-0123456789ab.webp';
        $imageUrl = '/storage/articles/content/019444e8-7f9f-4abc-8def-0123456789ab.webp';
        Storage::disk('public')->put($imagePath, 'fake image');

        $article = Article::factory()
            ->for($this->admin, 'author')
            ->create([
                'content' => '<p>Texto.</p><img src="http://localhost'.$imageUrl.'" alt="Imagem interna" data-id="'.$imagePath.'" width="960" height="540">',
            ]);

        Livewire::test(EditArticle::class, ['record' => $article->getRouteKey()])
            ->fillForm([
                'excerpt' => 'Resumo atualizado sem substituir o conteúdo.',
            ])
            ->call('save')
            ->assertHasNoFormErrors()
            ->assertRedirect(ArticleResource::getUrl('index'));

        $content = (string) $article->fresh()->content;

        $this->assertStringContainsString($imageUrl, $content);
        $this->assertStringContainsString('alt="Imagem interna"', $content);
    }

    public function test_published_article_requires_publication_date_and_slugs_are_unique(): void
    {
        Article::factory()
            ->for($this->admin, 'author')
            ->create(['slug' => 'slug-existente']);

        Livewire::test(CreateArticle::class)
            ->fillForm([
                'title' => 'Novo artigo',
                'slug' => 'slug-existente',
                'excerpt' => 'Resumo válido do artigo.',
                'content' => '<p>Conteúdo válido.</p>',
                'category' => 'Marketing',
                'reading_time_minutes' => 5,
                'status' => ArticleStatus::Published->value,
                'published_at' => null,
            ])
            ->call('create')
            ->assertHasFormErrors([
                'slug' => 'unique',
                'published_at' => 'required',
            ]);

        $this->assertSame(1, Article::query()->count());
    }

    public function test_non_admin_cannot_access_article_resource(): void
    {
        auth()->logout();

        $user = User::factory()->create(['is_admin' => false]);

        $this->actingAs($user)
            ->get('/admin/artigos')
            ->assertForbidden();
    }

    private function fakePng(string $name): UploadedFile
    {
        return UploadedFile::fake()->createWithContent(
            $name,
            base64_decode(
                'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Zl1sAAAAASUVORK5CYII=',
                strict: true,
            ),
        );
    }
}
