import { readFileSync } from 'node:fs';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { App } from '../App';
import { site } from '../data/site';

const whatsappGroupUrl =
  'https://chat.whatsapp.com/IOCHuvUWZIk4sxBgWjipPl?s=cl&p=a&mlu=4&ilr=4';

function renderLinksPage() {
  return render(
    <MemoryRouter initialEntries={['/links?utm_source=instagram']}>
      <App />
    </MemoryRouter>,
  );
}

describe('central de links', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    window.sessionStorage.clear();
  });

  it('renderiza o hero independente e configura metadata e canonical', async () => {
    renderLinksPage();

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Engenharia de conversão para transformar marketing em receita previsível.',
      }),
    ).toBeVisible();
    expect(screen.getByAltText('Algoritmux Growth Marketing')).toHaveAttribute(
      'src',
      '/images/branding/1.png',
    );
    expect(screen.queryByRole('banner')).not.toBeInTheDocument();

    await waitFor(() => {
      expect(document.title).toBe('Algoritmux | Links oficiais');
      expect(document.querySelector('meta[name="description"]')).toHaveAttribute(
        'content',
        'Acesse os canais oficiais, conteúdos, metodologia e atendimento da Algoritmux em um só lugar.',
      );
      expect(document.querySelector('meta[name="robots"]')).toHaveAttribute(
        'content',
        'index, follow',
      );
      expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute(
        'href',
        'https://algoritmux.com/links',
      );
      expect(document.querySelector('meta[property="og:url"]')).toHaveAttribute(
        'content',
        'https://algoritmux.com/links',
      );
      expect(document.querySelector('meta[property="og:image"]')).toHaveAttribute(
        'content',
        'https://algoritmux.com/images/branding/1.png',
      );
    });
  });

  it('usa Link nas rotas internas e protege os destinos externos', async () => {
    renderLinksPage();
    const links = within(await screen.findByRole('region', { name: 'Links oficiais' }));

    expect(links.getByRole('link', { name: /Conheça a Algoritmux/ })).toHaveAttribute('href', '/');
    expect(links.getByRole('link', { name: /Conteúdos e insights/ })).toHaveAttribute(
      'href',
      '/blog',
    );
    expect(links.getByRole('link', { name: /Conheça nossa metodologia/ })).toHaveAttribute(
      'href',
      '/metodologia',
    );

    const whatsapp = links.getByRole('link', { name: /Fale conosco no WhatsApp/ });
    expect(whatsapp).toHaveAttribute('href', site.whatsapp);
    expect(whatsapp).toHaveAttribute('target', '_blank');
    expect(whatsapp).toHaveAttribute('rel', 'noopener noreferrer');

    const whatsappGroup = links.getByRole('link', { name: /Entre no nosso grupo do WhatsApp/ });
    expect(whatsappGroup).toHaveAttribute('href', whatsappGroupUrl);
    expect(whatsappGroup).toHaveAttribute('target', '_blank');
    expect(whatsappGroup).toHaveAttribute('rel', 'noopener noreferrer');

    expect(links.queryByRole('link', { name: /^Instagram/ })).not.toBeInTheDocument();
  });

  it('abre o diagnóstico e registra exatamente um evento por clique', async () => {
    vi.stubGlobal('dataLayer', []);
    renderLinksPage();

    await userEvent.setup().click(
      await screen.findByRole('button', { name: /Solicite um diagnóstico/ }),
    );

    expect(await screen.findByRole('dialog')).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Diagnóstico de performance' })).toBeVisible();
    expect(window.dataLayer).toEqual([
      {
        event: 'links_click',
        link_id: 'diagnostic',
        link_url: 'diagnostic_modal',
        link_type: 'action',
      },
    ]);
  });

  it('continua funcional quando dataLayer não existe', async () => {
    vi.stubGlobal('dataLayer', undefined);
    renderLinksPage();

    await userEvent.setup().click(
      await screen.findByRole('button', { name: /Solicite um diagnóstico/ }),
    );

    expect(await screen.findByRole('dialog')).toBeVisible();
    expect(window.dataLayer).toBeUndefined();
  });

  it('identifica cliques internos e externos com o mesmo schema', async () => {
    vi.stubGlobal('dataLayer', []);
    renderLinksPage();
    const links = within(await screen.findByRole('region', { name: 'Links oficiais' }));

    await userEvent.setup().click(links.getByRole('link', { name: /Fale conosco no WhatsApp/ }));

    expect(window.dataLayer).toEqual([
      {
        event: 'links_click',
        link_id: 'whatsapp',
        link_url: site.whatsapp,
        link_type: 'external',
      },
    ]);
  });

  it('posiciona e rastreia o grupo do WhatsApp uma única vez', async () => {
    vi.stubGlobal('dataLayer', []);
    renderLinksPage();
    const linksRegion = await screen.findByRole('region', { name: 'Links oficiais' });
    const links = within(linksRegion);
    const items = Array.from(linksRegion.children);
    const whatsappGroup = links.getByRole('link', {
      name: /Entre no nosso grupo do WhatsApp/,
    });

    expect(items[3]).toBe(whatsappGroup);

    await userEvent.setup().click(whatsappGroup);

    expect(window.dataLayer).toEqual([
      {
        event: 'links_click',
        link_id: 'whatsapp_group',
        link_url: whatsappGroupUrl,
        link_type: 'external',
      },
    ]);
  });

  it('exibe somente as redes aprovadas e os três links legais', async () => {
    renderLinksPage();
    const socialNavigation = await screen.findByRole('navigation', {
      name: 'Redes sociais da Algoritmux',
    });

    expect(within(socialNavigation).getAllByRole('link')).toHaveLength(3);
    expect(within(socialNavigation).getByLabelText('Instagram da Algoritmux')).toBeVisible();
    expect(within(socialNavigation).getByLabelText('LinkedIn da Algoritmux')).toBeVisible();
    expect(within(socialNavigation).getByLabelText('WhatsApp da Algoritmux')).toBeVisible();

    const footer = within(screen.getByRole('contentinfo'));
    expect(footer.getByRole('link', { name: 'Privacidade' })).toHaveAttribute(
      'href',
      '/politica-de-privacidade',
    );
    expect(footer.getByRole('link', { name: 'Termos' })).toHaveAttribute(
      'href',
      '/termos-de-uso',
    );
    expect(footer.getByRole('link', { name: 'LGPD' })).toHaveAttribute('href', '/lgpd');
  });

  it('inclui /links no sitemap institucional', () => {
    const sitemap = readFileSync('public/sitemap.xml', 'utf8');

    expect(sitemap).toContain('https://algoritmux.com/links');
  });
});
