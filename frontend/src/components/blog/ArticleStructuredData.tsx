import { useEffect } from 'react';
import type { Article } from '../../types/content';

type ArticleStructuredDataProps = {
  article: Article;
};

const SITE_URL = 'https://algoritmux.com';
const SCRIPT_ID = 'algoritmux-article-schema';

export function ArticleStructuredData({
  article,
}: ArticleStructuredDataProps) {
  useEffect(() => {
    const canonicalUrl = new URL(article.path, `${SITE_URL}/`).toString();
    const organization = {
      '@type': 'Organization',
      name: 'Algoritmux',
    };
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      '@id': `${canonicalUrl}#article`,
      url: canonicalUrl,
      headline: article.title,
      description: article.summary,
      articleSection: article.category,
      inLanguage: 'pt-BR',
      datePublished: article.publishedAt,
      dateModified: article.updatedAt ?? article.publishedAt,
      author: organization,
      publisher: organization,
      ...(article.image ? { image: article.image } : {}),
    };

    document.getElementById(SCRIPT_ID)?.remove();

    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);

    return () => {
      if (document.getElementById(SCRIPT_ID) === script) {
        script.remove();
      }
    };
  }, [article]);

  return null;
}
