import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Article } from '../../types/content';
import { ResponsiveImage } from '../common/ResponsiveImage';
import { ArticleContent } from './ArticleContent';

export function ArticleLayout({ article }: { article: Article }) {
  const [failedCoverUrl, setFailedCoverUrl] = useState<string | null>(null);
  const coverImage = article.image;
  const shouldShowCover = Boolean(
    coverImage && coverImage !== failedCoverUrl,
  );

  return (
    <article
      className={`article-layout${shouldShowCover ? ' article-layout--with-cover' : ''}`}
    >
      <header className="article-header">
        <div className="article-header__inner">
          <Link to="/blog" className="article-back-link">
            ← Voltar para o Blog
          </Link>
          <span className="article-category">{article.category}</span>
          <h1>{article.title}</h1>
          <span className="article-title-accent" aria-hidden="true" />
          <p className="article-summary">{article.summary}</p>
          <div className="article-meta">
            <span>
              Por <strong>{article.author}</strong>
            </span>
            <time>Publicado em {article.date}</time>
            <span>{article.readingTimeMinutes} min de leitura</span>
          </div>
        </div>
      </header>
      {shouldShowCover && coverImage ? (
        <div className="article-featured-media">
          <ResponsiveImage
            src={coverImage}
            alt={article.imageAlt}
            width={1200}
            height={675}
            aspectRatio="16 / 9"
            className="article-featured-image"
            priority
            onError={() => setFailedCoverUrl(coverImage)}
          />
        </div>
      ) : null}
      <div className="article-body">
        <ArticleContent html={article.contentHtml ?? ''} />
      </div>
    </article>
  );
}
