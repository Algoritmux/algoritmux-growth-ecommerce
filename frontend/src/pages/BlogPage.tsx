import { useEffect, useState } from 'react';
import { BlogCard } from '../components/blog/BlogCard';
import { Badge } from '../components/common/Badge';
import { PageMetadata } from '../components/common/PageMetadata';
import { fetchArticles } from '../services/articleService';
import type { Article } from '../types/content';

type BlogState =
  | { status: 'loading'; articles: Article[] }
  | { status: 'success'; articles: Article[] }
  | { status: 'empty'; articles: Article[] }
  | { status: 'error'; articles: Article[] };

export function BlogPage() {
  const [blogState, setBlogState] = useState<BlogState>({
    status: 'loading',
    articles: [],
  });

  useEffect(() => {
    const controller = new AbortController();

    fetchArticles({ signal: controller.signal })
      .then((apiArticles) => {
        setBlogState({
          status: apiArticles.length > 0 ? 'success' : 'empty',
          articles: apiArticles,
        });
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }

        setBlogState({ status: 'error', articles: [] });
      });

    return () => controller.abort();
  }, []);

  return (
    <>
      <PageMetadata
        title="Blog | Algoritmux"
        description="Insights de Growth, vendas, inteligência artificial e design de conversão para operações B2B."
      />
      <section className="page-hero blog-hero">
        <div className="site-container page-hero__inner">
          <Badge>Nosso blog</Badge>
          <h1>
            Inteligência de <span className="gradient-text">Growth & Vendas</span>
          </h1>
          <p>
            Análises de mercado e táticas avançadas criadas pelos especialistas da
            Algoritmux para escalar operações corporativas B2B.
          </p>
        </div>
      </section>
      <section className="section blog-section">
        <div className="site-container">
          {blogState.status === 'loading' ? (
            <div className="blog-state" role="status" aria-live="polite">
              <span className="blog-state__loader" aria-hidden="true" />
              <strong>Carregando artigos...</strong>
              <p>Buscando os conteúdos mais recentes para você.</p>
            </div>
          ) : null}

          {blogState.status === 'empty' ? (
            <div className="blog-state" role="status">
              <strong>Nenhum artigo publicado ainda.</strong>
              <p>Novos conteúdos aparecerão aqui assim que forem publicados.</p>
            </div>
          ) : null}

          {blogState.status === 'error' ? (
            <div className="blog-state" role="alert">
              <strong>Não foi possível carregar os artigos.</strong>
              <p>Verifique sua conexão e tente novamente em alguns instantes.</p>
            </div>
          ) : null}

          {blogState.articles.length > 0 ? (
            <div className="blog-grid">
              {blogState.articles.map((article) => (
                <BlogCard key={article.slug} article={article} />
              ))}
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}
