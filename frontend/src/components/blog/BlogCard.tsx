import { Link } from 'react-router-dom';
import type { Article } from '../../types/content';
import { ResponsiveImage } from '../common/ResponsiveImage';

export function BlogCard({ article }: { article: Article }) {
  return (
    <article className="blog-card">
      <Link to={article.path} aria-label={`Ler artigo: ${article.title}`}>
        <div className="blog-card__image">
          <ResponsiveImage
            src={article.image}
            alt={article.imageAlt}
            width={720}
            height={405}
            aspectRatio="16 / 9"
          />
        </div>
        <div className="blog-card__content">
          <div className="blog-card__meta">
            <span>{article.category}</span>
            <time>{article.date}</time>
          </div>
          <h2>{article.title}</h2>
          <p>{article.summary}</p>
          <strong className="blog-card__action">Ler artigo completo →</strong>
        </div>
      </Link>
    </article>
  );
}
