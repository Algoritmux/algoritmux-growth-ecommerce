<?php

namespace App\Http\Resources;

use App\Models\Article;
use Illuminate\Http\Request;

/** @mixin Article */
class ArticleDetailResource extends ArticleListResource
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

        return [
            ...parent::toArray($request),
            'updated_at' => $article->updated_at?->toIso8601String(),
            'content' => $article->getRichContentAttribute('content')->toHtml(),
        ];
    }
}
