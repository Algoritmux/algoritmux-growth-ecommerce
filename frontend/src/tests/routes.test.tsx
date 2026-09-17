import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
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
      <LocationProbe />
    </MemoryRouter>,
  );
}

function LocationProbe() {
  const location = useLocation();

  return <output data-testid="current-path">{location.pathname}</output>;
}

describe('rotas públicas', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new TypeError('offline'))));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it.each([
    ['/', /Seu marketing gera movimento, mas gera venda\?/i],
    ['/index.html', /Seu marketing gera movimento, mas gera venda\?/i],
    ['/metodologia', /A Metodologia Algoritmux/i],
    ['/equipe', /Especialistas multidisciplinares/i],
    ['/blog', /Inteligência de Growth & Vendas/i],
  ])('carrega %s', async (path, title) => {
    renderRoute(path);
    expect(await screen.findByRole('heading', { level: 1, name: title })).toBeVisible();
  });

  it.each([
    ['/metodologia.html', '/metodologia', /A Metodologia Algoritmux/i],
    ['/equipe.html', '/equipe', /Especialistas multidisciplinares/i],
  ])('redireciona o alias %s para %s', async (legacyPath, cleanPath, title) => {
    renderRoute(legacyPath);

    await waitFor(() => {
      expect(screen.getByTestId('current-path')).toHaveTextContent(cleanPath);
    });
    expect(await screen.findByRole('heading', { level: 1, name: title })).toBeVisible();
  });

  it.each([
    ['/metodologia', 'https://algoritmux.com/metodologia'],
    ['/equipe', 'https://algoritmux.com/equipe'],
  ])('usa canonical limpo em %s', async (path, canonical) => {
    renderRoute(path);

    await waitFor(() => {
      expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute(
        'href',
        canonical,
      );
    });
  });

  it('preserva integralmente o texto atualizado do hero', () => {
    renderRoute('/index.html');
    expect(
      screen.getByText(
        'Conectamos marketing, vendas e inteligência de dados em um sistema previsível, e escalamos o que já funciona no seu negócio.',
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
        name: /Seu marketing gera movimento, mas gera venda\?/i,
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
