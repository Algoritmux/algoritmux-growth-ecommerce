import type { Article } from '../../types/content';
import { BlogCard } from './BlogCard';

export function ArticleRecommendations({ articles }: { articles: Article[] }) {
  return (
    <section className="article-recommendations" aria-labelledby="recommendations-title">
      <h2 id="recommendations-title">Mais artigos recomendados</h2>
      <div className="blog-grid blog-grid--recommendations">
        {articles.map((article) => (
          <BlogCard key={article.slug} article={article} />
        ))}
      </div>
    </section>
  );
}
