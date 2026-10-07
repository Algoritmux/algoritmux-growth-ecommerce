import { useEffect, useMemo, useRef, type ReactNode } from 'react';

type ArticleContentProps = {
  html: string;
  inlineLeadMagnet?: ReactNode;
};

export function ArticleContent({ html, inlineLeadMagnet }: ArticleContentProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const optimizedHtml = useMemo(() => {
    if (!html) {
      return { introduction: '', remainder: '' };
    }

    const document = new DOMParser().parseFromString(html, 'text/html');

    document.querySelectorAll<HTMLImageElement>('img').forEach((image) => {
      image.setAttribute('loading', 'lazy');
      image.setAttribute('decoding', 'async');
    });

    const blocks = [...document.body.children];
    let paragraphCount = 0;
    let splitIndex = blocks.findIndex((block) => {
      if (block.tagName === 'P') {
        paragraphCount += 1;
      }

      return paragraphCount === 2;
    });

    if (splitIndex < 0) {
      splitIndex = Math.min(1, blocks.length - 1);
    }

    return {
      introduction: blocks
        .slice(0, splitIndex + 1)
        .map((block) => block.outerHTML)
        .join(''),
      remainder: blocks
        .slice(splitIndex + 1)
        .map((block) => block.outerHTML)
        .join(''),
    };
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
    <div ref={contentRef} className="article-content">
      <div
        className="article-content__segment"
        dangerouslySetInnerHTML={{ __html: optimizedHtml.introduction }}
      />
      {inlineLeadMagnet ? (
        <div className="article-lead-magnet-inline">{inlineLeadMagnet}</div>
      ) : null}
      <div
        className="article-content__segment"
        dangerouslySetInnerHTML={{ __html: optimizedHtml.remainder }}
      />
    </div>
  );
}
