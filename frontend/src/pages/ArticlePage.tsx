import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArticleLayout } from '../components/blog/ArticleLayout';
import { ArticleRecommendations } from '../components/blog/ArticleRecommendations';
import { PageMetadata } from '../components/common/PageMetadata';
import {
  ArticleApiError,
  fetchArticle,
  fetchArticles,
} from '../services/articleService';
import type { Article } from '../types/content';

type ArticleState =
  | { status: 'loading' }
  | { status: 'success'; article: Article }
  | { status: 'not-found' }
  | { status: 'error' };

function ArticleLoadingSkeleton() {
  return (
    <section className="article-section">
      <div className="site-container article-container">
        <article
          className="article-layout article-layout--with-cover article-loading"
          role="status"
          aria-live="polite"
          aria-label="Carregando artigo"
        >
          <span className="article-loading__announcement">
            Carregando artigo...
          </span>

          <header
            className="article-header article-loading__header"
            aria-hidden="true"
          >
            <div className="article-header__inner">
              <span className="article-loading__line article-loading__line--back" />
              <span className="article-loading__category article-loading__line article-loading__line--category" />

              <div className="article-loading__title">
                <span className="article-loading__line" />
                <span className="article-loading__line" />
              </div>

              <span className="article-loading__line article-loading__line--accent" />

              <div className="article-loading__summary">
                <span className="article-loading__line" />
                <span className="article-loading__line" />
              </div>

              <div className="article-loading__meta">
                <span className="article-loading__line" />
                <span className="article-loading__line" />
                <span className="article-loading__line" />
              </div>
            </div>
          </header>

          <div
            className="article-featured-media article-loading__media"
            aria-hidden="true"
          >
            <div className="article-loading__cover" />
          </div>

          <div
            className="article-body article-loading__body"
            aria-hidden="true"
          >
            <div className="article-loading__content">
              <span className="article-loading__line article-loading__line--heading" />
              <div className="article-loading__paragraph">
                <span className="article-loading__line" />
                <span className="article-loading__line" />
                <span className="article-loading__line" />
                <span className="article-loading__line" />
              </div>
              <span className="article-loading__line article-loading__line--subheading" />
              <div className="article-loading__paragraph">
                <span className="article-loading__line" />
                <span className="article-loading__line" />
                <span className="article-loading__line" />
                <span className="article-loading__line" />
              </div>
              <div className="article-loading__paragraph">
                <span className="article-loading__line" />
                <span className="article-loading__line" />
                <span className="article-loading__line" />
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

export function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const [requestState, setRequestState] = useState<{
    slug: string | undefined;
    result: ArticleState;
  }>({
    slug,
    result: { status: 'loading' },
  });
  const [recommendationsState, setRecommendationsState] = useState<{
    slug: string | undefined;
    articles: Article[];
  }>({
    slug,
    articles: [],
  });

  useEffect(() => {
    if (!slug) {
      return;
    }

    const controller = new AbortController();

    fetchArticle(slug, { signal: controller.signal })
      .then((article) =>
        setRequestState({
          slug,
          result: { status: 'success', article },
        }),
      )
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }

        setRequestState({
          slug,
          result: {
            status:
              error instanceof ArticleApiError && error.status === 404
                ? 'not-found'
                : 'error',
          },
        });
      });

    fetchArticles({ signal: controller.signal })
      .then((apiArticles) =>
        setRecommendationsState({
          slug,
          articles: apiArticles
            .filter((article) => article.slug !== slug)
            .slice(0, 2),
        }),
      )
      .catch(() => undefined);

    return () => controller.abort();
  }, [slug]);

  const articleState: ArticleState =
    requestState.slug === slug
      ? requestState.result
      : { status: 'loading' };
  const recommendations =
    recommendationsState.slug === slug
      ? recommendationsState.articles
      : [];

  if (!slug || articleState.status === 'not-found') {
    return (
      <>
        <PageMetadata
          title="Artigo não encontrado | Algoritmux"
          description="O artigo solicitado não foi encontrado no Blog Algoritmux."
        />
        <section className="article-section">
          <div className="article-container blog-state">
            <strong>Artigo não encontrado</strong>
            <p>O conteúdo pode ter sido removido ou ainda não está publicado.</p>
            <Link to="/blog" className="article-back-link">
              ← Voltar para o Blog
            </Link>
          </div>
        </section>
      </>
    );
  }

  if (articleState.status === 'loading') {
    return <ArticleLoadingSkeleton />;
  }

  if (articleState.status === 'error') {
    return (
      <>
        <PageMetadata
          title="Blog temporariamente indisponível | Algoritmux"
          description="Não foi possível carregar este artigo no momento."
        />
        <section className="article-section">
          <div className="article-container blog-state" role="alert">
            <strong>Não foi possível carregar este artigo.</strong>
            <p>Verifique sua conexão e tente novamente em alguns instantes.</p>
            <Link to="/blog" className="article-back-link">
              ← Voltar para o Blog
            </Link>
          </div>
        </section>
      </>
    );
  }

  const { article } = articleState;

  return (
    <>
      <PageMetadata
        title={article.metadata.title}
        description={article.metadata.description}
      />
      <section className="article-section">
        <div className="site-container article-container">
          <ArticleLayout article={article} />
          {recommendations.length > 0 ? (
            <ArticleRecommendations articles={recommendations} />
          ) : null}
        </div>
      </section>
    </>
  );
}
