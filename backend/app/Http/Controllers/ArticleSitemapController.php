<?php

namespace App\Http\Controllers;

use App\Models\Article;
use DOMDocument;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Cache;
use RuntimeException;

class ArticleSitemapController extends Controller
{
    private const CACHE_KEY = 'sitemap.articles.xml';

    private const XML_NAMESPACE = 'http://www.sitemaps.org/schemas/sitemap/0.9';

    public function __invoke(): Response
    {
        $xml = Cache::remember(
            self::CACHE_KEY,
            now()->addMinutes(5),
            fn (): string => $this->generateXml(),
        );

        return response($xml, 200, [
            'Content-Type' => 'application/xml; charset=UTF-8',
            'Cache-Control' => 'public, max-age=300',
        ]);
    }

    private function generateXml(): string
    {
        $publicSiteUrl = rtrim((string) config('site.public_url'), '/');
        $document = new DOMDocument('1.0', 'UTF-8');
        $document->formatOutput = true;

        $urlset = $document->createElementNS(self::XML_NAMESPACE, 'urlset');
        $document->appendChild($urlset);

        Article::query()
            ->published()
            ->select(['slug', 'updated_at', 'published_at'])
            ->orderBy('published_at')
            ->orderBy('slug')
            ->each(function (Article $article) use ($document, $urlset, $publicSiteUrl): void {
                $url = $document->createElementNS(self::XML_NAMESPACE, 'url');
                $location = $document->createElementNS(self::XML_NAMESPACE, 'loc');
                $lastModified = $document->createElementNS(self::XML_NAMESPACE, 'lastmod');

                $location->appendChild($document->createTextNode(
                    $publicSiteUrl.'/blog/'.rawurlencode($article->slug),
                ));
                $lastModified->appendChild($document->createTextNode(
                    $article->updated_at->toIso8601String(),
                ));

                $url->appendChild($location);
                $url->appendChild($lastModified);
                $urlset->appendChild($url);
            });

        $xml = $document->saveXML();

        if ($xml === false) {
            throw new RuntimeException('Unable to generate the article sitemap.');
        }

        return $xml;
    }
}
