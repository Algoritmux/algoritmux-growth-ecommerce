import { StrictMode } from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { App } from '../App';
import { SiteStructuredData } from '../components/seo/SiteStructuredData';
import { site } from '../data/site';

function getSiteSchemas() {
  return document.head.querySelectorAll<HTMLScriptElement>(
    '#algoritmux-site-schema',
  );
}

describe('SiteStructuredData', () => {
  beforeEach(() => {
    getSiteSchemas().forEach((script) => script.remove());
  });

  it('publica Organization e WebSite na home', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    );

    const scripts = getSiteSchemas();
    const schema = JSON.parse(scripts[0]?.textContent ?? '{}');

    expect(scripts).toHaveLength(1);
    expect(scripts[0]).toHaveAttribute('type', 'application/ld+json');
    expect(schema).toEqual({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Organization',
          '@id': 'https://algoritmux.com/#organization',
          name: site.name,
          url: 'https://algoritmux.com/',
          description: site.description,
          logo: {
            '@type': 'ImageObject',
            url: 'https://algoritmux.com/images/branding/logo.png',
            width: 500,
            height: 500,
          },
        },
        {
          '@type': 'WebSite',
          '@id': 'https://algoritmux.com/#website',
          name: site.name,
          url: 'https://algoritmux.com/',
          inLanguage: 'pt-BR',
          publisher: {
            '@id': 'https://algoritmux.com/#organization',
          },
        },
      ],
    });
  });

  it('não duplica o script e executa cleanup', () => {
    const { rerender, unmount } = render(
      <StrictMode>
        <SiteStructuredData />
      </StrictMode>,
    );

    rerender(
      <StrictMode>
        <SiteStructuredData />
      </StrictMode>,
    );

    expect(getSiteSchemas()).toHaveLength(1);

    unmount();

    expect(getSiteSchemas()).toHaveLength(0);
  });
});
