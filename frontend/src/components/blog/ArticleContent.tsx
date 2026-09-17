import { useEffect, useMemo, useRef } from 'react';

type ArticleContentProps = {
  html: string;
};

export function ArticleContent({ html }: ArticleContentProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const optimizedHtml = useMemo(() => {
    if (!html) {
      return '';
    }

    const document = new DOMParser().parseFromString(html, 'text/html');

    document.querySelectorAll<HTMLImageElement>('img').forEach((image) => {
      image.setAttribute('loading', 'lazy');
      image.setAttribute('decoding', 'async');
    });

    return document.body.innerHTML;
  }, [html]);

  useEffect(() => {
    const content = contentRef.current;

    if (!content) {
      return;
    }

    const images = [...content.querySelectorAll<HTMLImageElement>('img')];
    const cleanups = images.map((image) => {
      const hideBrokenImage = () => {
        image.hidden = true;

        const figure = image.closest('figure');

        if (figure) {
          figure.hidden = true;
          return;
        }

        const wrapper = image.parentElement;
        const wrapperHasOnlyImages =
          wrapper?.tagName === 'P' &&
          wrapper.textContent?.trim() === '' &&
          [...wrapper.children].every((child) => child.tagName === 'IMG');

        if (wrapperHasOnlyImages) {
          wrapper.hidden = true;
        }
      };

      image.addEventListener('error', hideBrokenImage);

      if (!image.getAttribute('src') || (image.complete && image.naturalWidth === 0)) {
        hideBrokenImage();
      }

      return () => image.removeEventListener('error', hideBrokenImage);
    });

    return () => cleanups.forEach((cleanup) => cleanup());
  }, [optimizedHtml]);

  return (
    <div
      ref={contentRef}
      className="article-content"
      dangerouslySetInnerHTML={{ __html: optimizedHtml }}
    />
  );
}
