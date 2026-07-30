import type {
  ArticleApiResponse,
  ArticleApiSummary,
  ArticlesApiResponse,
} from '../types/articles';
import type { Article } from '../types/content';

type RequestOptions = {
  signal?: AbortSignal;
};

export class ArticleApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = 'ArticleApiError';
  }
}

function getApiBaseUrl(): string {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '');

  if (!apiBaseUrl) {
    throw new ArticleApiError(
      'A conexão com o blog não está configurada no momento.',
    );
  }

  return apiBaseUrl;
}

function resolveCoverImageUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  return new URL(url, `${getApiBaseUrl()}/`).toString();
}

export function resolveArticleContentHtml(html: string): string {
  if (!html) {
    return '';
  }

  const document = new DOMParser().parseFromString(html, 'text/html');
  const apiBaseUrl = getApiBaseUrl();

  document.querySelectorAll<HTMLImageElement>('img[src]').forEach((image) => {
    const source = image.getAttribute('src')?.trim();

    if (!source) {
      image.removeAttribute('src');
      return;
    }

    try {
      const parsedUrl = new URL(source, `${apiBaseUrl}/`);

      if (parsedUrl.pathname.startsWith('/storage/articles/content/')) {
        image.src = new URL(
          `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`,
          `${apiBaseUrl}/`,
        ).toString();
        return;
      }

      if (!/^https?:\/\//i.test(source)) {
        image.src = parsedUrl.toString();
      }
    } catch {
      image.removeAttribute('src');
    }
  });

  document.querySelectorAll<HTMLParagraphElement>('p').forEach((paragraph) => {
    const image = paragraph.querySelector<HTMLImageElement>(':scope > img:only-child');

    if (!image || paragraph.textContent?.trim()) {
      return;
    }

    const captionParagraph = paragraph.nextElementSibling;
    const captionLabel = captionParagraph?.querySelector(':scope > strong:first-child');

    if (
      captionParagraph?.tagName !== 'P' ||
      !captionLabel?.textContent?.trim().toLowerCase().startsWith('legenda:')
    ) {
      return;
    }

    const figure = document.createElement('figure');
    const caption = document.createElement('figcaption');

    figure.append(image);
    caption.innerHTML = captionParagraph.innerHTML;
    figure.append(caption);
    paragraph.replaceWith(figure);
    captionParagraph.remove();
  });

  return document.body.innerHTML;
}

function formatPublishedDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Sao_Paulo',
  }).format(date);
}

export function getPublicArticlePath(slug: string): string {
  return `/blog/${encodeURIComponent(slug)}`;
}

function mapApiArticle(
  article: ArticleApiSummary,
  contentHtml?: string,
): Article {
  const image = article.cover_image?.url
    ? resolveCoverImageUrl(article.cover_image.url)
    : undefined;

  return {
    slug: article.slug,
    path: getPublicArticlePath(article.slug),
    title: article.title,
    summary: article.excerpt,
    category: article.category,
    date: formatPublishedDate(article.published_at),
    author: article.author.name,
    readingTimeMinutes: article.reading_time_minutes,
    image,
    imageAlt:
      article.cover_image?.alt ??
      `Capa do artigo ${article.title}`,
    contentHtml:
      contentHtml === undefined
        ? undefined
        : resolveArticleContentHtml(contentHtml),
    metadata: {
      title:
        article.seo.title ??
        `${article.title} | Blog Algoritmux`,
      description:
        article.seo.description ??
        article.excerpt,
    },
  };
}

async function request<T>(
  path: string,
  { signal }: RequestOptions = {},
): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    headers: {
      Accept: 'application/json',
    },
    signal,
  }).catch((error: unknown) => {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error;
    }

    throw new ArticleApiError(
      'Não foi possível conectar ao blog. Verifique sua conexão e tente novamente.',
    );
  });

  if (!response.ok) {
    throw new ArticleApiError(
      response.status === 404
        ? 'Artigo não encontrado.'
        : 'Não foi possível carregar os artigos agora.',
      response.status,
    );
  }

  return (await response.json()) as T;
}

export async function fetchArticles(
  options?: RequestOptions,
): Promise<Article[]> {
  const response = await request<ArticlesApiResponse>(
    '/api/v1/articles',
    options,
  );

  return response.data.map((article) => mapApiArticle(article));
}

export async function fetchArticle(
  slug: string,
  options?: RequestOptions,
): Promise<Article> {
  const response = await request<ArticleApiResponse>(
    `/api/v1/articles/${encodeURIComponent(slug)}`,
    options,
  );

  return mapApiArticle(response.data, response.data.content);
}
