import { useEffect } from 'react';

type PageMetadataProps = {
  title: string;
  description: string;
  canonical?: string;
  image?: string;
  robots?: string;
};

const SITE_URL = 'https://algoritmux.com';

function resolveUrl(value: string) {
  return new URL(value, `${SITE_URL}/`).toString();
}

function setMetaTag(
  selector: string,
  attribute: 'name' | 'property',
  key: string,
  content: string
) {
  let meta = document.querySelector<HTMLMetaElement>(selector);

  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(attribute, key);
    document.head.appendChild(meta);
  }

  meta.content = content;
}

function removeMetaTag(selector: string) {
  const meta = document.querySelector(selector);

  if (meta) {
    meta.remove();
  }
}

export function PageMetadata({
  title,
  description,
  canonical,
  image,
  robots = 'index, follow',
}: PageMetadataProps) {
  useEffect(() => {
    document.title = title;

    setMetaTag(
      'meta[name="description"]',
      'name',
      'description',
      description
    );

    setMetaTag(
      'meta[name="robots"]',
      'name',
      'robots',
      robots
    );

    const canonicalUrl = canonical
      ? resolveUrl(canonical)
      : window.location.href;

    let canonicalLink =
      document.querySelector<HTMLLinkElement>(
        'link[rel="canonical"]'
      );

    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }

    canonicalLink.href = canonicalUrl;


    setMetaTag(
      'meta[property="og:title"]',
      'property',
      'og:title',
      title
    );

    setMetaTag(
      'meta[property="og:description"]',
      'property',
      'og:description',
      description
    );

    setMetaTag(
      'meta[property="og:url"]',
      'property',
      'og:url',
      canonicalUrl
    );

    setMetaTag(
      'meta[property="og:type"]',
      'property',
      'og:type',
      'website'
    );


    setMetaTag(
      'meta[name="twitter:card"]',
      'name',
      'twitter:card',
      image ? 'summary_large_image' : 'summary'
    );

    setMetaTag(
      'meta[name="twitter:title"]',
      'name',
      'twitter:title',
      title
    );

    setMetaTag(
      'meta[name="twitter:description"]',
      'name',
      'twitter:description',
      description
    );


    if (image) {
      const imageUrl = resolveUrl(image);

      setMetaTag(
        'meta[property="og:image"]',
        'property',
        'og:image',
        imageUrl
      );

      setMetaTag(
        'meta[name="twitter:image"]',
        'name',
        'twitter:image',
        imageUrl
      );
    } else {
      removeMetaTag('meta[property="og:image"]');
      removeMetaTag('meta[name="twitter:image"]');
    }

  }, [
    title,
    description,
    canonical,
    image,
    robots,
  ]);

  return null;
}
