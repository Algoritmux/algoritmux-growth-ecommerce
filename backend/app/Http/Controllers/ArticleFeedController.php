<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Services\ArticleCoverImageStorage;
use DOMDocument;
use DOMElement;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Cache;
use RuntimeException;

class ArticleFeedController extends Controller
{
    private const CACHE_KEY = 'feed.articles.rss.v1';

    private const ATOM_NAMESPACE = 'http://www.w3.org/2005/Atom';

    private const DC_NAMESPACE = 'http://purl.org/dc/elements/1.1/';

    private const MEDIA_NAMESPACE = 'http://search.yahoo.com/mrss/';

    private const XMLNS_NAMESPACE = 'http://www.w3.org/2000/xmlns/';

    public function __construct(
        private readonly ArticleCoverImageStorage $coverImageStorage,
    ) {}

    public function __invoke(): Response
    {
        $xml = Cache::remember(
            self::CACHE_KEY,
            now()->addMinutes(5),
            fn (): string => $this->generateXml(),
        );

        return response($xml, 200, [
            'Content-Type' => 'application/rss+xml; charset=UTF-8',
            'Cache-Control' => 'public, max-age=300',
        ]);
    }

    private function generateXml(): string
    {
        $publicSiteUrl = rtrim((string) config('site.public_url'), '/');
        $apiUrl = rtrim((string) config('app.url'), '/');
        $feedPath = '/'.ltrim((string) config('site.feed.path', '/rss.xml'), '/');
        $feedLimit = (int) config('site.feed.limit', 50);
        $articles = Article::query()
            ->published()
            ->with('author:id,name')
            ->select([
                'id',
                'author_id',
                'title',
                'slug',
                'excerpt',
                'category',
                'cover_image',
                'published_at',
                'updated_at',
            ])
            ->orderByDesc('published_at')
            ->orderByDesc('id')
            ->limit($feedLimit)
            ->get();

        $document = new DOMDocument('1.0', 'UTF-8');
        $document->formatOutput = true;

        $rss = $document->createElement('rss');
        $rss->setAttribute('version', '2.0');
        $rss->setAttributeNS(self::XMLNS_NAMESPACE, 'xmlns:atom', self::ATOM_NAMESPACE);
        $rss->setAttributeNS(self::XMLNS_NAMESPACE, 'xmlns:media', self::MEDIA_NAMESPACE);
        $rss->setAttributeNS(self::XMLNS_NAMESPACE, 'xmlns:dc', self::DC_NAMESPACE);
        $document->appendChild($rss);

        $channel = $document->createElement('channel');
        $rss->appendChild($channel);

        $this->appendTextElement(
            $document,
            $channel,
            'title',
            (string) config('site.feed.title'),
        );
        $this->appendTextElement($document, $channel, 'link', $publicSiteUrl.'/blog');
        $this->appendTextElement(
            $document,
            $channel,
            'description',
            (string) config('site.feed.description'),
        );
        $this->appendTextElement($document, $channel, 'language', 'pt-BR');

        $lastUpdatedAt = $articles->max('updated_at') ?? now();
        $this->appendTextElement(
            $document,
            $channel,
            'lastBuildDate',
            $lastUpdatedAt->toRfc2822String(),
        );

        $selfLink = $document->createElementNS(self::ATOM_NAMESPACE, 'atom:link');
        $selfLink->setAttribute('href', $apiUrl.$feedPath);
        $selfLink->setAttribute('rel', 'self');
        $selfLink->setAttribute('type', 'application/rss+xml');
        $channel->appendChild($selfLink);

        foreach ($articles as $article) {
            $item = $document->createElement('item');
            $articleUrl = $publicSiteUrl.'/blog/'.rawurlencode($article->slug);

            $this->appendTextElement($document, $item, 'title', $article->title);
            $this->appendTextElement($document, $item, 'link', $articleUrl);

            $guid = $this->appendTextElement(
                $document,
                $item,
                'guid',
                "urn:algoritmux:article:{$article->id}",
            );
            $guid->setAttribute('isPermaLink', 'false');

            $this->appendTextElement(
                $document,
                $item,
                'pubDate',
                $article->published_at->toRfc2822String(),
            );
            $this->appendTextElement(
                $document,
                $item,
                'description',
                $this->plainText($article->excerpt),
            );

            if (filled($article->category)) {
                $this->appendTextElement($document, $item, 'category', $article->category);
            }

            if ($article->relationLoaded('author') && filled($article->author?->name)) {
                $creator = $document->createElementNS(self::DC_NAMESPACE, 'dc:creator');
                $creator->appendChild($document->createTextNode($article->author->name));
                $item->appendChild($creator);
            }

            $coverImage = $this->coverImageStorage->metadata($article->cover_image);

            if ($coverImage !== null) {
                $media = $document->createElementNS(self::MEDIA_NAMESPACE, 'media:content');
                $media->setAttribute('url', $apiUrl.$coverImage['url']);
                $media->setAttribute('medium', 'image');
                $media->setAttribute('type', $coverImage['type']);
                $media->setAttribute('fileSize', (string) $coverImage['size']);
                $item->appendChild($media);
            }

            $channel->appendChild($item);
        }

        $xml = $document->saveXML();

        if ($xml === false) {
            throw new RuntimeException('Unable to generate the article RSS feed.');
        }

        return $xml;
    }

    private function appendTextElement(
        DOMDocument $document,
        DOMElement $parent,
        string $name,
        string $value,
    ): DOMElement {
        $element = $document->createElement($name);
        $element->appendChild($document->createTextNode($value));
        $parent->appendChild($element);

        return $element;
    }

    private function plainText(string $value): string
    {
        $decoded = html_entity_decode($value, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $withoutTags = strip_tags($decoded);

        return trim(preg_replace('/\s+/u', ' ', $withoutTags) ?? $withoutTags);
    }
}
