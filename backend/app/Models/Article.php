<?php

namespace App\Models;

use App\Enums\ArticleStatus;
use App\Services\ArticleContentImageStorage;
use Database\Factories\ArticleFactory;
use Filament\Forms\Components\RichEditor\Models\Concerns\InteractsWithRichContent;
use Filament\Forms\Components\RichEditor\Models\Contracts\HasRichContent;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class Article extends Model implements HasRichContent
{
    /** @use HasFactory<ArticleFactory> */
    use HasFactory, InteractsWithRichContent, SoftDeletes;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'author_id',
        'title',
        'slug',
        'excerpt',
        'content',
        'cover_image',
        'cover_alt_text',
        'category',
        'reading_time_minutes',
        'status',
        'is_featured',
        'published_at',
        'seo_title',
        'seo_description',
    ];

    public function setUpRichContent(): void
    {
        $this->registerRichContent('content')
            ->fileAttachmentsDisk('public')
            ->fileAttachmentsVisibility('public')
            ->fileAttachmentProvider(app(ArticleContentImageStorage::class));
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    /**
     * @param  Builder<Article>  $query
     * @return Builder<Article>
     */
    public function scopePublished(Builder $query): Builder
    {
        return $query
            ->where('status', ArticleStatus::Published->value)
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now());
    }

    /**
     * @param  Builder<Article>  $query
     * @return Builder<Article>
     */
    public function scopeScheduled(Builder $query): Builder
    {
        return $query
            ->where('status', ArticleStatus::Published->value)
            ->where('published_at', '>', now());
    }

    public function isPublished(): bool
    {
        return $this->status === ArticleStatus::Published
            && $this->published_at !== null
            && $this->published_at->lessThanOrEqualTo(now());
    }

    public function isScheduled(): bool
    {
        return $this->status === ArticleStatus::Published
            && $this->published_at?->isFuture();
    }

    public static function generateUniqueSlug(string $value, ?int $ignoredId = null): string
    {
        $baseSlug = Str::slug($value) ?: 'artigo';
        $slug = $baseSlug;
        $suffix = 2;

        while (
            static::withTrashed()
                ->when($ignoredId, fn (Builder $query) => $query->whereKeyNot($ignoredId))
                ->where('slug', $slug)
                ->exists()
        ) {
            $slug = "{$baseSlug}-{$suffix}";
            $suffix++;
        }

        return $slug;
    }

    protected static function booted(): void
    {
        static::creating(function (Article $article): void {
            if (blank($article->slug)) {
                $article->slug = static::generateUniqueSlug($article->title);
            }
        });

        static::updated(function (Article $article): void {
            if (! $article->wasChanged('cover_image')) {
                return;
            }

            $oldCoverImage = $article->getOriginal('cover_image');

            if (filled($oldCoverImage) && $oldCoverImage !== $article->cover_image) {
                Storage::disk('public')->delete($oldCoverImage);
            }
        });

        static::forceDeleted(function (Article $article): void {
            if (filled($article->cover_image)) {
                Storage::disk('public')->delete($article->cover_image);
            }
        });
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_featured' => 'boolean',
            'published_at' => 'datetime',
            'status' => ArticleStatus::class,
        ];
    }
}
