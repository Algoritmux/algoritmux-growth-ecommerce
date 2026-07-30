<?php

namespace App\Http\Resources;

use App\Models\Article;
use App\Services\ArticleCoverImageStorage;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Article */
class ArticleListResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var Article $article */
        $article = $this->resource;
        $coverImageUrl = app(ArticleCoverImageStorage::class)->url($article->cover_image);

        return [
            'title' => $article->title,
            'slug' => $article->slug,
            'excerpt' => $article->excerpt,
            'category' => $article->category,
            'reading_time_minutes' => $article->reading_time_minutes,
            'is_featured' => $article->is_featured,
            'published_at' => $article->published_at?->toIso8601String(),
            'cover_image' => filled($coverImageUrl)
                ? [
                    'url' => $coverImageUrl,
                    'alt' => $article->cover_alt_text,
                ]
                : null,
            'author' => $this->whenLoaded('author', fn (): array => [
                'name' => $article->author->name,
            ]),
            'seo' => [
                'title' => $article->seo_title,
                'description' => $article->seo_description,
            ],
        ];
    }
}
