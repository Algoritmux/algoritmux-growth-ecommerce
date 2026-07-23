import { useLocation } from 'react-router-dom';
import { ArticleLayout } from '../components/blog/ArticleLayout';
import { ArticleRecommendations } from '../components/blog/ArticleRecommendations';
import { PageMetadata } from '../components/common/PageMetadata';
import { articles } from '../data/articles';

export function ArticlePage() {
  const { pathname } = useLocation();
  const article = articles.find((item) => item.path === pathname);

  if (!article) {
    return (
      <section className="page-hero">
        <div className="site-container page-hero__inner">
          <h1>Artigo não encontrado</h1>
        </div>
      </section>
    );
  }

  return (
    <>
      <PageMetadata
        title={article.metadata.title}
        description={article.metadata.description}
      />
      <section className="article-section">
        <div className="site-container article-container">
          <ArticleLayout article={article} />
          <ArticleRecommendations
            articles={articles.filter((item) => item.slug !== article.slug)}
          />
        </div>
      </section>
    </>
  );
}
