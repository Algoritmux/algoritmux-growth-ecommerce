import { readFileSync } from 'node:fs';
import { render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { App } from '../App';

type LegalPageExpectation = {
  path: string;
  heading: string;
  title: string;
  description: string;
  canonical: string;
};

const legalPages: LegalPageExpectation[] = [
  {
    path: '/politica-de-privacidade',
    heading: 'Política de Privacidade',
    title: 'Política de Privacidade | Algoritmux',
    description: 'Entenda como a Algoritmux coleta, utiliza, compartilha e protege dados pessoais em seu site, formulários, e-book e newsletter.',
    canonical: 'https://algoritmux.com/politica-de-privacidade',
  },
  {
    path: '/termos-de-uso',
    heading: 'Termos de Uso',
    title: 'Termos de Uso | Algoritmux',
    description: 'Conheça as condições de acesso e uso do site, blog, formulários e materiais gratuitos da Algoritmux.',
    canonical: 'https://algoritmux.com/termos-de-uso',
  },
  {
    path: '/lgpd',
    heading: 'LGPD e seus direitos',
    title: 'LGPD e Direitos do Titular | Algoritmux',
    description: 'Saiba quais são seus direitos previstos na LGPD e como solicitar acesso, correção, exclusão ou informações à Algoritmux.',
    canonical: 'https://algoritmux.com/lgpd',
  },
];

function renderLegalPage(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe('páginas legais', () => {
  it.each(legalPages)('renderiza $path no layout público com metadata própria', async (page) => {
    renderLegalPage(page.path);

    expect(
      await screen.findByRole('heading', { level: 1, name: page.heading }),
    ).toBeVisible();
    expect(screen.getByRole('banner')).toBeVisible();
    expect(screen.getByRole('contentinfo')).toBeVisible();
    expect(screen.getByRole('navigation', { name: `Sumário de ${page.heading}` })).toBeVisible();

    await waitFor(() => {
      expect(document.title).toBe(page.title);
      expect(document.querySelector('meta[name="description"]')).toHaveAttribute(
        'content',
        page.description,
      );
      expect(document.querySelector('meta[name="robots"]')).toHaveAttribute(
        'content',
        'index, follow',
      );
      expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute(
        'href',
        page.canonical,
      );
      expect(document.querySelector('meta[property="og:url"]')).toHaveAttribute(
        'content',
        page.canonical,
      );
    });
  });

  it('exibe as três rotas na seção Legal do footer', async () => {
    renderLegalPage('/politica-de-privacidade');

    await screen.findByRole('heading', { level: 1, name: 'Política de Privacidade' });
    const footer = within(screen.getByRole('contentinfo'));

    expect(footer.getByRole('heading', { name: 'Legal' })).toBeVisible();
    expect(footer.getByRole('link', { name: 'Política de Privacidade' })).toHaveAttribute(
      'href',
      '/politica-de-privacidade',
    );
    expect(footer.getByRole('link', { name: 'Termos de Uso' })).toHaveAttribute(
      'href',
      '/termos-de-uso',
    );
    expect(footer.getByRole('link', { name: 'LGPD' })).toHaveAttribute('href', '/lgpd');
  });

  it('inclui as páginas legais no sitemap institucional', () => {
    const sitemap = readFileSync('public/sitemap.xml', 'utf8');

    expect(sitemap).toContain('https://algoritmux.com/politica-de-privacidade');
    expect(sitemap).toContain('https://algoritmux.com/termos-de-uso');
    expect(sitemap).toContain('https://algoritmux.com/lgpd');
  });
});
