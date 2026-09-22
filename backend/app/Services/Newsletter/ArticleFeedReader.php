<?php

namespace App\Services\Newsletter;

use Carbon\CarbonImmutable;
use DOMDocument;
use DOMElement;
use DOMXPath;
use Illuminate\Support\Facades\Http;
use RuntimeException;
use Throwable;

class ArticleFeedReader
{
    private const ARTICLE_HOST = 'algoritmux.com';

    private const DC_NAMESPACE = 'http://purl.org/dc/elements/1.1/';

    private const MEDIA_NAMESPACE = 'http://search.yahoo.com/mrss/';

    /**
     * @return list<array{
     *     guid: string,
     *     title: string,
     *     link: string,
     *     description: string,
     *     published_at: CarbonImmutable,
     *     category: string|null,
     *     creator: string|null,
     *     image_url: string|null
     * }>
     */
    public function read(int $limit = 50): array
    {
        $feedUrl = (string) config('services.listmonk.feed_url');
        $timeout = (int) config('services.listmonk.timeout', 10);

        if (! $this->isHttpsUrl($feedUrl) || $timeout < 1) {
            throw new RuntimeException('The newsletter feed configuration is invalid.');
        }

        $response = Http::accept('application/rss+xml')
            ->timeout($timeout)
            ->connectTimeout($timeout)
            ->retry(3, 250, throw: false)
            ->get($feedUrl);

        if (! $response->successful()) {
            throw new RuntimeException("Newsletter feed HTTP {$response->status()}.");
        }

        return $this->parse($response->body(), $limit, (string) parse_url($feedUrl, PHP_URL_HOST));
    }

    /**
     * @return list<array{
     *     guid: string,
     *     title: string,
     *     link: string,
     *     description: string,
     *     published_at: CarbonImmutable,
     *     category: string|null,
     *     creator: string|null,
     *     image_url: string|null
     * }>
     */
    private function parse(string $xml, int $limit, string $mediaHost): array
    {
        if ($limit < 1 || $limit > 50 || $mediaHost === '') {
            throw new RuntimeException('The newsletter feed options are invalid.');
        }

        $document = new DOMDocument;
        $previousInternalErrors = libxml_use_internal_errors(true);

        try {
            $loaded = $document->loadXML($xml, LIBXML_NONET | LIBXML_NOCDATA);
        } finally {
            libxml_clear_errors();
            libxml_use_internal_errors($previousInternalErrors);
        }

        if (! $loaded || $document->documentElement?->nodeName !== 'rss') {
            throw new RuntimeException('The newsletter feed contains invalid XML.');
        }

        $xpath = new DOMXPath($document);
        $xpath->registerNamespace('dc', self::DC_NAMESPACE);
        $xpath->registerNamespace('media', self::MEDIA_NAMESPACE);
        $items = [];

        foreach ($xpath->query('/rss/channel/item') ?: [] as $node) {
            if (! $node instanceof DOMElement || count($items) >= $limit) {
                break;
            }

            $guid = $this->text($xpath, $node, 'guid');
            $title = $this->text($xpath, $node, 'title');
            $link = $this->text($xpath, $node, 'link');
            $publishedAt = $this->text($xpath, $node, 'pubDate');

            if ($guid === '' || $title === '' || $link === '' || $publishedAt === '') {
                throw new RuntimeException('A newsletter feed item is missing required fields.');
            }

            if (! $this->isHttpsUrl($link, self::ARTICLE_HOST)) {
                throw new RuntimeException('A newsletter feed item contains an invalid article URL.');
            }

            try {
                $publishedAtValue = CarbonImmutable::parse($publishedAt);
            } catch (Throwable) {
                throw new RuntimeException('A newsletter feed item contains an invalid publication date.');
            }

            $media = $xpath->query('media:content', $node)?->item(0);
            $imageUrl = $media instanceof DOMElement ? trim($media->getAttribute('url')) : null;

            if ($imageUrl === '' || ($imageUrl !== null && ! $this->isHttpsUrl($imageUrl, $mediaHost))) {
                $imageUrl = null;
            }

            $category = $this->text($xpath, $node, 'category');
            $creator = $this->text($xpath, $node, 'dc:creator');

            $items[] = [
                'guid' => $guid,
                'title' => $title,
                'link' => $link,
                'description' => $this->plainText($this->text($xpath, $node, 'description')),
                'published_at' => $publishedAtValue,
                'category' => $category !== '' ? $category : null,
                'creator' => $creator !== '' ? $creator : null,
                'image_url' => $imageUrl,
            ];
        }

        return $items;
    }

    private function text(DOMXPath $xpath, DOMElement $item, string $expression): string
    {
        return trim((string) $xpath->evaluate("string({$expression})", $item));
    }

    private function plainText(string $value): string
    {
        $decoded = html_entity_decode($value, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $withoutTags = strip_tags($decoded);

        return trim(preg_replace('/\s+/u', ' ', $withoutTags) ?? $withoutTags);
    }

    private function isHttpsUrl(string $url, ?string $expectedHost = null): bool
    {
        if (filter_var($url, FILTER_VALIDATE_URL) === false) {
            return false;
        }

        if (strtolower((string) parse_url($url, PHP_URL_SCHEME)) !== 'https') {
            return false;
        }

        $host = strtolower((string) parse_url($url, PHP_URL_HOST));

        return $host !== '' && ($expectedHost === null || $host === strtolower($expectedHost));
    }
}
