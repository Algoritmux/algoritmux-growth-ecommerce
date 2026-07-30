import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { App } from '../App';

const routeArticle = {
  title: 'Artigo servido pela API',
  slug: 'artigo-api',
  excerpt: 'Resumo do artigo servido pela API.',
  category: 'Growth',
  reading_time_minutes: 4,
  is_featured: false,
  published_at: '2026-07-30T12:00:00-03:00',
  cover_image: null,
  author: { name: 'Equipe Algoritmux' },
  seo: { title: null, description: null },
};

function renderRoute(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe('rotas públicas', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new TypeError('offline'))));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it.each([
    ['/', /Crescimento não é ação isolada/i],
    ['/index.html', /Crescimento não é ação isolada/i],
    ['/metodologia.html', /A Metodologia Algoritmux/i],
    ['/equipe.html', /Especialistas multidisciplinares/i],
    ['/blog', /Inteligência de Growth & Vendas/i],
  ])('carrega %s', (path, title) => {
    renderRoute(path);
    expect(screen.getByRole('heading', { level: 1, name: title })).toBeVisible();
  });

  it('preserva integralmente o texto atualizado do hero', () => {
    renderRoute('/index.html');
    expect(
      screen.getByText(
        'Estruturamos e operamos um sistema previsível que conecta Marketing, Vendas e Inteligência de Dados para escalar empresas que já vendem.',
      ),
    ).toBeVisible();
  });

  it('carrega um artigo pela rota dinâmica da API', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn((input: string | URL | Request) =>
        String(input).endsWith('/artigo-api')
          ? jsonResponse({ data: { ...routeArticle, content: '<p>Conteúdo.</p>' } })
          : jsonResponse({
              data: [routeArticle],
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
            }),
      ),
    );

    renderRoute('/blog/artigo-api');

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Artigo servido pela API',
      }),
    ).toBeVisible();
    expect(screen.getByRole('article')).toHaveClass('article-layout');
  });

  it.each([
    '/artigo-growth-ia.html',
    '/artigo-ux-conversao.html',
    '/artigo-marketing-vendas.html',
  ])('não mantém a rota estática %s', async (path) => {
    renderRoute(path);

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: /Crescimento não é ação isolada/i,
      }),
    ).toBeVisible();
  });
});

function jsonResponse(body: unknown, status = 200): Promise<Response> {
  return Promise.resolve(
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    }),
  );
}
