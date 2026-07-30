<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ArticleDetailResource;
use App\Http\Resources\ArticleListResource;
use App\Models\Article;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;

class ArticleController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $validated = $request->validate([
            'category' => ['sometimes', 'nullable', 'string', 'max:100'],
            'featured' => ['sometimes', 'nullable', Rule::in(['0', '1', 'true', 'false'])],
            'per_page' => ['sometimes', 'nullable', 'integer', 'min:1', 'max:50'],
        ]);

        $articles = Article::query()
            ->published()
            ->with('author:id,name')
            ->when(
                filled($validated['category'] ?? null),
                fn ($query) => $query->where('category', trim($validated['category'])),
            )
            ->when(
                array_key_exists('featured', $validated) && $validated['featured'] !== null,
                fn ($query) => $query->where('is_featured', $request->boolean('featured')),
            )
            ->orderByDesc('published_at')
            ->orderByDesc('id')
            ->paginate($validated['per_page'] ?? 12)
            ->withQueryString();

        return ArticleListResource::collection($articles);
    }

    public function show(string $slug): ArticleDetailResource
    {
        $article = Article::query()
            ->published()
            ->with('author:id,name')
            ->where('slug', $slug)
            ->firstOrFail();

        return new ArticleDetailResource($article);
    }
}
