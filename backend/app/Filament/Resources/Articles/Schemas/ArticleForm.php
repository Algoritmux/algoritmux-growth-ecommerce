<?php

namespace App\Filament\Resources\Articles\Schemas;

use App\Enums\ArticleStatus;
use App\Models\Article;
use App\Services\ArticleContentImageStorage;
use App\Services\ArticleCoverImageStorage;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Utilities\Get;
use Filament\Schemas\Components\Utilities\Set;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Illuminate\Support\Str;
use Livewire\Features\SupportFileUploads\TemporaryUploadedFile;

class ArticleForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Grid::make([
                    'default' => 1,
                    'xl' => 3,
                ])
                    ->schema([
                        Section::make('Conteúdo')
                            ->description('Informações principais exibidas no artigo.')
                            ->icon(Heroicon::OutlinedDocumentText)
                            ->schema([
                                TextInput::make('title')
                                    ->label('Título')
                                    ->required()
                                    ->maxLength(255)
                                    ->live(onBlur: true)
                                    ->afterStateUpdated(function (Get $get, Set $set, ?string $old, ?string $state): void {
                                        $currentSlug = (string) $get('slug');

                                        if (filled($currentSlug) && $currentSlug !== Str::slug((string) $old)) {
                                            return;
                                        }

                                        $set('slug', Str::slug((string) $state));
                                    }),
                                TextInput::make('slug')
                                    ->label('Slug')
                                    ->helperText('Gerado pelo título, mas pode ser editado.')
                                    ->required()
                                    ->maxLength(255)
                                    ->regex('/^[a-z0-9]+(?:-[a-z0-9]+)*$/')
                                    ->unique(Article::class, 'slug', ignoreRecord: true),
                                Textarea::make('excerpt')
                                    ->label('Resumo')
                                    ->required()
                                    ->rows(4)
                                    ->maxLength(500)
                                    ->columnSpanFull(),
                                RichEditor::make('content')
                                    ->label('Conteúdo')
                                    ->required()
                                    ->toolbarButtons([
                                        ['bold', 'italic', 'underline', 'strike', 'subscript', 'superscript', 'link'],
                                        ['h2', 'h3'],
                                        ['alignStart', 'alignCenter', 'alignEnd'],
                                        ['blockquote', 'codeBlock', 'bulletList', 'orderedList'],
                                        ['table', 'attachFiles'],
                                        ['undo', 'redo'],
                                    ])
                                    ->linkProtocols(['http', 'https', 'mailto', 'tel'])
                                    ->fileAttachmentsDisk('public')
                                    ->fileAttachmentsDirectory(ArticleContentImageStorage::DIRECTORY)
                                    ->fileAttachmentsVisibility('public')
                                    ->fileAttachmentsAcceptedFileTypes(['image/jpeg', 'image/png', 'image/webp'])
                                    ->fileAttachmentsMaxSize(ArticleContentImageStorage::MAX_SIZE_KILOBYTES)
                                    ->saveUploadedFileAttachmentUsing(
                                        fn (TemporaryUploadedFile $file): string => app(ArticleContentImageStorage::class)->store($file),
                                    )
                                    ->getFileAttachmentUrlUsing(
                                        fn (mixed $file): ?string => app(ArticleContentImageStorage::class)->url($file),
                                    )
                                    ->preventFileAttachmentPathTampering()
                                    ->resizableImages()
                                    ->helperText('Imagens internas: JPG, PNG ou WebP, com até 5 MB.')
                                    ->extraAttributes(['class' => 'article-content-editor'])
                                    ->columnSpanFull(),
                            ])
                            ->columns([
                                'default' => 1,
                                'md' => 2,
                            ])
                            ->columnSpan(2),
                        Section::make('Publicação')
                            ->description('Controle a autoria, visibilidade e agendamento.')
                            ->icon(Heroicon::OutlinedCalendarDays)
                            ->schema([
                                Select::make('status')
                                    ->label('Status')
                                    ->options(ArticleStatus::options())
                                    ->default(ArticleStatus::Draft->value)
                                    ->required()
                                    ->live(),
                                DateTimePicker::make('published_at')
                                    ->label('Data de publicação')
                                    ->seconds(false)
                                    ->helperText('Use uma data futura para agendar a publicação.')
                                    ->required(fn (Get $get): bool => $get('status') === ArticleStatus::Published->value),
                                Select::make('author_id')
                                    ->label('Autor')
                                    ->relationship('author', 'name')
                                    ->default(fn (): ?int => auth()->id())
                                    ->disabled()
                                    ->dehydrated()
                                    ->required(),
                                TextInput::make('category')
                                    ->label('Categoria')
                                    ->required()
                                    ->maxLength(100),
                                TextInput::make('reading_time_minutes')
                                    ->label('Tempo de leitura')
                                    ->numeric()
                                    ->integer()
                                    ->minValue(1)
                                    ->maxValue(999)
                                    ->default(5)
                                    ->suffix('min')
                                    ->required(),
                                Toggle::make('is_featured')
                                    ->label('Artigo em destaque')
                                    ->default(false),
                            ])
                            ->columns([
                                'default' => 1,
                                'sm' => 2,
                                'xl' => 1,
                            ])
                            ->columnSpan(1),
                        Section::make('Imagem de capa')
                            ->description('Use uma imagem horizontal, nítida e coerente com o conteúdo.')
                            ->icon(Heroicon::OutlinedPhoto)
                            ->schema([
                                FileUpload::make('cover_image')
                                    ->label('Imagem')
                                    ->disk('public')
                                    ->directory(ArticleCoverImageStorage::DIRECTORY)
                                    ->visibility('public')
                                    ->image()
                                    ->acceptedFileTypes(['image/jpeg', 'image/png', 'image/webp'])
                                    ->maxSize(ArticleCoverImageStorage::MAX_SIZE_KILOBYTES)
                                    ->getUploadedFileNameForStorageUsing(
                                        fn (TemporaryUploadedFile $file): string => app(ArticleCoverImageStorage::class)->filename($file),
                                    )
                                    ->getUploadedFileUsing(
                                        fn (string $file): ?array => app(ArticleCoverImageStorage::class)->metadata($file),
                                    )
                                    ->getOpenableFileUrlUsing(
                                        fn (string $file): ?string => app(ArticleCoverImageStorage::class)->url($file),
                                    )
                                    ->getDownloadableFileUrlUsing(
                                        fn (string $file): ?string => app(ArticleCoverImageStorage::class)->url($file),
                                    )
                                    ->panelAspectRatio('16:9')
                                    ->imagePreviewHeight('220')
                                    ->validationMessages([
                                        'mimetypes' => 'A capa deve ser uma imagem JPG, PNG ou WebP.',
                                        'max' => 'A capa não pode exceder 5 MB.',
                                    ])
                                    ->showAllValidationMessages()
                                    ->helperText('Formatos aceitos: JPG, PNG ou WebP. Máximo de 5 MB.')
                                    ->openable()
                                    ->downloadable(),
                                TextInput::make('cover_alt_text')
                                    ->label('Texto alternativo')
                                    ->helperText('Descreva objetivamente o conteúdo visual da capa.')
                                    ->maxLength(255)
                                    ->required(fn (Get $get): bool => filled($get('cover_image'))),
                            ])
                            ->columns([
                                'default' => 1,
                                'md' => 2,
                            ])
                            ->columnSpanFull(),
                        Section::make('SEO')
                            ->description('Metadados opcionais para mecanismos de busca e compartilhamento.')
                            ->icon(Heroicon::OutlinedMagnifyingGlass)
                            ->schema([
                                TextInput::make('seo_title')
                                    ->label('Título SEO')
                                    ->maxLength(70),
                                Textarea::make('seo_description')
                                    ->label('Descrição SEO')
                                    ->rows(3)
                                    ->maxLength(160),
                            ])
                            ->columns([
                                'default' => 1,
                                'md' => 2,
                            ])
                            ->collapsible()
                            ->columnSpanFull(),
                    ])
                    ->columnSpanFull(),
            ]);
    }
}
