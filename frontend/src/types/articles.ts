export type ArticleApiCoverImage = {
  url: string;
  alt: string | null;
};

export type ArticleApiAuthor = {
  name: string;
};

export type ArticleApiSeo = {
  title: string | null;
  description: string | null;
};

export type ArticleApiSummary = {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  reading_time_minutes: number;
  is_featured: boolean;
  published_at: string;
  cover_image: ArticleApiCoverImage | null;
  author: ArticleApiAuthor;
  seo: ArticleApiSeo;
};

export type ArticleApiDetail = ArticleApiSummary & {
  content: string;
};

export type ArticlesApiResponse = {
  data: ArticleApiSummary[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number | null;
    last_page: number;
    path: string;
    per_page: number;
    to: number | null;
    total: number;
  };
};

export type ArticleApiResponse = {
  data: ArticleApiDetail;
};
