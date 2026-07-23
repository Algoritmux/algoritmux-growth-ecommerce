import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { App } from '../App';

function renderRoute(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe('rotas públicas', () => {
  it.each([
    ['/', /Crescimento não é ação isolada/i],
    ['/index.html', /Crescimento não é ação isolada/i],
    ['/metodologia.html', /A Metodologia Algoritmux/i],
    ['/equipe.html', /Especialistas multidisciplinares/i],
    ['/blog.html', /Inteligência de Growth & Vendas/i],
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

  it.each([
    [
      '/artigo-growth-ia.html',
      /O futuro do growth hacking: inteligência artificial/i,
    ],
    [
      '/artigo-ux-conversao.html',
      /Design de conversão \(UX\/UI\): como a psicologia visual/i,
    ],
    [
      '/artigo-marketing-vendas.html',
      /Sinergia entre marketing e vendas/i,
    ],
  ])('carrega o artigo %s', (path, title) => {
    renderRoute(path);
    expect(screen.getByRole('heading', { level: 1, name: title })).toBeVisible();
    expect(screen.getAllByRole('article')[0]).toHaveClass('article-layout');
  });
});
