import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import articlesCss from '../assets/styles/articles.css?raw';
import { ArticleContent } from '../components/blog/ArticleContent';
import { ArticlePage } from '../pages/ArticlePage';
import { BlogPage } from '../pages/BlogPage';

const apiArticle = {
  title: 'Growth orientado por dados',
  slug: 'growth-orientado-por-dados',
  excerpt: 'Como transformar dados em decisões de crescimento.',
  category: 'Growth',
  reading_time_minutes: 6,
  is_featured: true,
  published_at: '2026-07-30T12:00:00-03:00',
  cover_image: {
    url: '/storage/articles/capa.jpg',
    alt: 'Painel com métricas de crescimento',
  },
  author: {
    name: 'Equipe Algoritmux',
  },
  seo: {
    title: 'Growth orientado por dados | Algoritmux',
    description: 'Estratégias para crescer com inteligência de dados.',
  },
};

const articlesCollection = {
  data: [apiArticle],
  links: { first: null, last: null, prev: null, next: null },
  meta: {
    current_page: 1,
    from: 1,
    last_page: 1,
    path: 'http://127.0.0.1:8000/api/v1/articles',
    per_page: 12,
    to: 1,
    total: 1,
  },
};

function jsonResponse(body: unknown, status = 200): Promise<Response> {
  return Promise.resolve(
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    }),
  );
}

function renderBlog() {
  return render(
    <MemoryRouter>
      <BlogPage />
    </MemoryRouter>,
  );
}

function renderArticle(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/blog/:slug" element={<ArticlePage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('integração pública de artigos', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_BASE_URL', 'http://127.0.0.1:8000');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('exibe carregamento enquanto consulta a listagem', () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>(() => undefined)));

    renderBlog();

    expect(screen.getByRole('status')).toHaveTextContent('Carregando artigos');
  });

  it('reserva a estrutura do artigo enquanto carrega o detalhe', () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>(() => undefined)));

    renderArticle('/blog/artigo-em-carregamento');

    const loading = screen.getByRole('status', {
      name: 'Carregando artigo',
    });

    expect(loading).toHaveClass(
      'article-layout',
      'article-layout--with-cover',
      'article-loading',
    );
    expect(loading.querySelector('.article-loading__header')).not.toBeNull();
    expect(loading.querySelector('.article-loading__category')).not.toBeNull();
    expect(loading.querySelector('.article-loading__title')).not.toBeNull();
    expect(loading.querySelector('.article-loading__summary')).not.toBeNull();
    expect(loading.querySelector('.article-loading__meta')).not.toBeNull();
    expect(loading.querySelector('.article-loading__cover')).not.toBeNull();
    expect(loading.querySelector('.article-loading__body')).not.toBeNull();
    expect(loading.querySelectorAll('.article-loading__paragraph')).toHaveLength(
      3,
    );
    expect(loading.querySelector('.blog-state__loader')).toBeNull();
  });

  it('lista somente os artigos retornados pela API', async () => {
    const fetchMock = vi.fn(() => jsonResponse(articlesCollection));
    vi.stubGlobal('fetch', fetchMock);

    renderBlog();

    expect(
      await screen.findByRole('heading', {
        name: 'Growth orientado por dados',
      }),
    ).toBeVisible();
    expect(fetchMock).toHaveBeenCalledWith(
      'http://127.0.0.1:8000/api/v1/articles',
      expect.objectContaining({
        headers: { Accept: 'application/json' },
      }),
    );
    expect(screen.getByRole('link', { name: /Growth orientado por dados/i }))
      .toHaveAttribute('href', '/blog/growth-orientado-por-dados');
    expect(screen.getByAltText('Painel com métricas de crescimento'))
      .toHaveAttribute(
        'src',
        'http://127.0.0.1:8000/storage/articles/capa.jpg',
      );
  });

  it('exibe estado vazio quando a API não possui publicações', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        jsonResponse({
          ...articlesCollection,
          data: [],
          meta: {
            ...articlesCollection.meta,
            from: null,
            to: null,
            total: 0,
          },
        }),
      ),
    );

    renderBlog();

    expect(
      await screen.findByText('Nenhum artigo publicado ainda.'),
    ).toBeVisible();
  });

  it('exibe erro sem carregar conteúdo local quando a API falha', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new TypeError('offline'))));

    renderBlog();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível carregar os artigos',
    );
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
  });

  it('carrega o detalhe, recomendações, HTML sanitizado e SEO pela API', async () => {
    const recommendation = {
      ...apiArticle,
      slug: 'recomendacao-api',
      title: 'Recomendação carregada pela API',
    };
    const fetchMock = vi.fn((input: string | URL | Request) => {
      const url = String(input);

      if (url.endsWith('/growth-orientado-por-dados')) {
        return jsonResponse({
          data: {
            ...apiArticle,
            content:
              '<p>Conteúdo vindo da API.</p><p><img src="http://localhost/storage/articles/content/019444e8-7f9f-4abc-8def-0123456789ab.webp" alt="Imagem interna"></p><p><strong>Legenda:</strong> Crescimento conectado.</p><h2>Decisões melhores</h2><ul><li>Marcador principal<ul><li>Marcador aninhado</li></ul></li></ul><ol><li>Primeiro passo</li><li>Segundo passo</li></ol>',
          },
        });
      }

      return jsonResponse({
        ...articlesCollection,
        data: [apiArticle, recommendation],
        meta: { ...articlesCollection.meta, to: 2, total: 2 },
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    renderArticle('/blog/growth-orientado-por-dados');

    const articleTitle = await screen.findByRole('heading', {
      level: 1,
      name: 'Growth orientado por dados',
    });
    expect(articleTitle).toBeVisible();
    expect(articleTitle.closest('header')).toHaveClass('article-header');
    expect(screen.getByText('Equipe Algoritmux')).toBeVisible();
    expect(screen.getByText('6 min de leitura')).toBeVisible();
    expect(
      screen.getByText('Growth', { selector: '.article-category' }),
    ).toBeVisible();
    expect(
      document.querySelector('.article-featured-media img'),
    ).toHaveAttribute('alt', 'Painel com métricas de crescimento');
    expect(screen.getByText('Conteúdo vindo da API.')).toBeVisible();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Decisões melhores' }),
    ).toBeVisible();
    const internalImage = screen.getByAltText('Imagem interna');
    expect(internalImage).toHaveAttribute(
      'src',
      'http://127.0.0.1:8000/storage/articles/content/019444e8-7f9f-4abc-8def-0123456789ab.webp',
    );
    expect(internalImage.closest('figure')).not.toBeNull();
    expect(screen.getByText('Crescimento conectado.')).toBeVisible();
    expect(screen.getByText('Marcador principal').closest('ul')).toBeVisible();
    expect(screen.getByText('Marcador aninhado').closest('ul')).toBeVisible();
    expect(screen.getByText('Primeiro passo').closest('ol')).toBeVisible();
    expect(screen.getByText('Segundo passo').closest('ol')).toBeVisible();
    expect(
      await screen.findByRole('heading', {
        name: 'Recomendação carregada pela API',
      }),
    ).toBeVisible();
    expect(fetchMock).toHaveBeenCalledWith(
      'http://127.0.0.1:8000/api/v1/articles/growth-orientado-por-dados',
      expect.any(Object),
    );
    expect(
      fetchMock.mock.calls.filter(([input]) =>
        String(input).endsWith('/growth-orientado-por-dados'),
      ),
    ).toHaveLength(1);
    await waitFor(() => {
      expect(document.title).toBe('Growth orientado por dados | Algoritmux');
      expect(document.querySelector('meta[name="description"]')).toHaveAttribute(
        'content',
        'Estratégias para crescer com inteligência de dados.',
      );
    });

    const featuredImage = document.querySelector(
      '.article-featured-media img',
    );
    expect(featuredImage).not.toBeNull();
    fireEvent.error(featuredImage as HTMLImageElement);
    expect(document.querySelector('.article-featured-media')).toBeNull();
    expect(document.querySelector('.article-layout')).not.toHaveClass(
      'article-layout--with-cover',
    );
  });

  it('mantém marcadores e numeração escopados ao conteúdo do artigo', () => {
    expect(articlesCss).toMatch(
      /\.article-content ul\s*\{[^}]*list-style-type:\s*disc;/s,
    );
    expect(articlesCss).toMatch(
      /\.article-content ol\s*\{[^}]*list-style-type:\s*decimal;/s,
    );
    expect(articlesCss).toContain('.article-content ul ul');
    expect(articlesCss).toContain('.article-content ol ol');
    expect(articlesCss).toContain('.article-content li');
  });

  it('exibe 404 para um slug inexistente ou não publicado', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => jsonResponse({ message: 'Not Found' }, 404)),
    );

    renderArticle('/blog/artigo-inexistente');

    expect(
      await screen.findByText('Artigo não encontrado', { selector: 'strong' }),
    ).toBeVisible();
  });

  it('exibe erro de conexão no detalhe', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new TypeError('offline'))));

    renderArticle('/blog/artigo-novo');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível carregar este artigo',
    );
  });

  it('remove o espaço reservado quando uma imagem interna falha', () => {
    render(
      <ArticleContent
        html='<p><img src="http://127.0.0.1:8000/storage/articles/content/inexistente.webp" alt="Imagem indisponível"></p><p>Texto seguinte.</p>'
      />,
    );

    const image = screen.getByAltText('Imagem indisponível');
    const wrapper = image.parentElement;

    fireEvent.error(image);

    expect(image).not.toBeVisible();
    expect(wrapper).not.toBeVisible();
    expect(screen.getByText('Texto seguinte.')).toBeVisible();
  });
});
