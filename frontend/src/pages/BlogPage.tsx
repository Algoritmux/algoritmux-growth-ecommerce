import { BlogCard } from '../components/blog/BlogCard';
import { Badge } from '../components/common/Badge';
import { PageMetadata } from '../components/common/PageMetadata';
import { articles } from '../data/articles';

export function BlogPage() {
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
        <div className="site-container blog-grid">
          {articles.map((article) => (
            <BlogCard key={article.slug} article={article} />
          ))}
        </div>
      </section>
    </>
  );
}
