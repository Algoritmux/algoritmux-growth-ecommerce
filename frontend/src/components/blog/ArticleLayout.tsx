import { Link } from 'react-router-dom';
import type { Article } from '../../types/content';
import { ResponsiveImage } from '../common/ResponsiveImage';
import { ArticleContent } from './ArticleContent';

export function ArticleLayout({ article }: { article: Article }) {
  return (
    <article className="article-layout">
      <header className="article-header">
        <Link to="/blog.html" className="article-back-link">
          ← Voltar para o Blog
        </Link>
        <span className="article-category">{article.category}</span>
        <h1>{article.title}</h1>
        <p className="article-summary">{article.summary}</p>
        <div className="article-meta">
          <time>Publicado em {article.date}</time>
          <span>Conteúdo editorial Algoritmux</span>
        </div>
      </header>
      <ResponsiveImage
        src={article.image}
        alt={article.imageAlt}
        width={1200}
        height={675}
        aspectRatio="16 / 9"
        className="article-featured-image"
        priority
      />
      <ArticleContent blocks={article.content} />
    </article>
  );
}
