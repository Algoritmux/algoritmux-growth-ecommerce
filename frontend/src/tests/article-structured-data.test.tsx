import { render } from '@testing-library/react';
import { ArticleStructuredData } from '../components/blog/ArticleStructuredData';
import type { Article } from '../types/content';

const article: Article = {
  slug: 'growth-orientado-por-dados',
  path: '/blog/growth-orientado-por-dados',
  title: 'Growth orientado por dados',
  summary: 'Como transformar dados em decisões de crescimento.',
  category: 'Growth',
  date: '30 de julho de 2026',
  publishedAt: '2026-07-30T12:00:00-03:00',
  updatedAt: '2026-08-02T09:30:00-03:00',
  author: 'Equipe Algoritmux',
  readingTimeMinutes: 6,
  image: 'https://api.algoritmux.com/storage/articles/capa.jpg',
  imageAlt: 'Painel com métricas de crescimento',
  contentHtml: '<p>Conteúdo do artigo.</p>',
  metadata: {
    title: 'Growth orientado por dados | Algoritmux',
    description: 'Estratégias para crescer com inteligência de dados.',
  },
};

function getArticleSchema() {
  return document.head.querySelector<HTMLScriptElement>(
    '#algoritmux-article-schema',
  );
}

describe('ArticleStructuredData', () => {
  beforeEach(() => {
    getArticleSchema()?.remove();
  });

  it('publica um BlogPosting com os dados do artigo', () => {
    render(<ArticleStructuredData article={article} />);

    const script = getArticleSchema();
    const schema = JSON.parse(script?.textContent ?? '{}');

    expect(script).toHaveAttribute('type', 'application/ld+json');
    expect(schema).toEqual({
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      '@id': 'https://algoritmux.com/blog/growth-orientado-por-dados#article',
      url: 'https://algoritmux.com/blog/growth-orientado-por-dados',
      headline: article.title,
      description: article.summary,
      articleSection: article.category,
      inLanguage: 'pt-BR',
      datePublished: article.publishedAt,
      dateModified: article.updatedAt,
      author: {
        '@type': 'Organization',
        name: 'Algoritmux',
      },
      publisher: {
        '@type': 'Organization',
        name: 'Algoritmux',
      },
      image: article.image,
    });
  });

  it('atualiza o schema sem duplicar o script e o remove no cleanup', () => {
    const { rerender, unmount } = render(
      <ArticleStructuredData article={article} />,
    );
    const updatedArticle: Article = {
      ...article,
      slug: 'segundo-artigo',
      path: '/blog/segundo-artigo',
      title: 'Segundo artigo',
      updatedAt: undefined,
      image: undefined,
    };

    rerender(<ArticleStructuredData article={updatedArticle} />);

    const scripts = document.head.querySelectorAll(
      '#algoritmux-article-schema',
    );
    const schema = JSON.parse(scripts[0]?.textContent ?? '{}');

    expect(scripts).toHaveLength(1);
    expect(schema.url).toBe('https://algoritmux.com/blog/segundo-artigo');
    expect(schema.dateModified).toBe(updatedArticle.publishedAt);
    expect(schema).not.toHaveProperty('image');

    unmount();

    expect(getArticleSchema()).toBeNull();
  });
});
