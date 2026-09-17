import { useEffect } from 'react';
import { site } from '../../data/site';

const SCRIPT_ID = 'algoritmux-site-schema';

export function SiteStructuredData() {
  useEffect(() => {
    const siteUrl = new URL('/', site.siteUrl).toString();
    const logoUrl = new URL(site.logo, siteUrl).toString();
    const organizationId = `${siteUrl}#organization`;
    const websiteId = `${siteUrl}#website`;
    const structuredData = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Organization',
          '@id': organizationId,
          name: site.name,
          url: siteUrl,
          description: site.description,
          logo: {
            '@type': 'ImageObject',
            url: logoUrl,
            width: 500,
            height: 500,
          },
        },
        {
          '@type': 'WebSite',
          '@id': websiteId,
          name: site.name,
          url: siteUrl,
          inLanguage: 'pt-BR',
          publisher: {
            '@id': organizationId,
          },
        },
      ],
    };

    document.getElementById(SCRIPT_ID)?.remove();

    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);

    return () => {
      if (document.getElementById(SCRIPT_ID) === script) {
        script.remove();
      }
    };
  }, []);

  return null;
}
