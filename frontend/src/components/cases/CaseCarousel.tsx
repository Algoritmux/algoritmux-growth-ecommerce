import { useCallback, useEffect, useRef, useState } from 'react';
import type { CaseStudy } from '../../types/content';
import { CarouselControls } from './CarouselControls';
import { CarouselIndicators } from './CarouselIndicators';
import { CaseCard } from './CaseCard';

type Props = {
  items: CaseStudy[];
  autoPlayInterval?: number;
};

export function CaseCarousel({ items, autoPlayInterval = 6000 }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [interactionPaused, setInteractionPaused] = useState(false);
  const touchStart = useRef<number | null>(null);
  const resumeTimer = useRef<number | undefined>(undefined);
  const itemsPerPage = isMobile ? 1 : 2;
  const pageCount = Math.ceil(items.length / itemsPerPage);
  const activePage = pageCount > 0
    ? Math.min(Math.floor(activeIndex / itemsPerPage), pageCount - 1)
    : 0;

  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  const moveTo = useCallback(
    (pageIndex: number, userInitiated = false) => {
      if (!pageCount) return;
      const normalizedPage = (pageIndex + pageCount) % pageCount;
      setActiveIndex(normalizedPage * itemsPerPage);
      if (userInitiated) {
        setInteractionPaused(true);
        window.clearTimeout(resumeTimer.current);
        resumeTimer.current = window.setTimeout(
          () => setInteractionPaused(false),
          9000,
        );
      }
    },
    [itemsPerPage, pageCount],
  );

  useEffect(() => {
    if (
      pageCount <= 1 ||
      hovered ||
      focused ||
      interactionPaused ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }
    const timer = window.setInterval(
      () => setActiveIndex((current) => {
        const currentPage = Math.floor(current / itemsPerPage);

        return ((currentPage + 1) % pageCount) * itemsPerPage;
      }),
      autoPlayInterval,
    );
    return () => window.clearInterval(timer);
  }, [autoPlayInterval, focused, hovered, interactionPaused, itemsPerPage, pageCount]);

  useEffect(
    () => () => {
      window.clearTimeout(resumeTimer.current);
    },
    [],
  );

  if (!items.length) return null;
  const firstVisibleIndex = activePage * itemsPerPage;
  const visibleItems = items.slice(firstVisibleIndex, firstVisibleIndex + itemsPerPage);

  return (
    <div
      className="case-carousel"
      role="region"
      aria-roledescription="carrossel"
      aria-label="Cases de sucesso"
      tabIndex={0}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      }}
      onKeyDown={(event) => {
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          moveTo(activePage - 1, true);
        }
        if (event.key === 'ArrowRight') {
          event.preventDefault();
          moveTo(activePage + 1, true);
        }
      }}
      onTouchStart={(event) => {
        touchStart.current = event.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(event) => {
        if (touchStart.current === null) return;
        const distance = (event.changedTouches[0]?.clientX ?? touchStart.current) -
          touchStart.current;
        if (Math.abs(distance) > 45) {
          moveTo(activePage + (distance < 0 ? 1 : -1), true);
        }
        touchStart.current = null;
      }}
    >
      <div className="case-carousel__viewport" aria-live="polite">
        {visibleItems.map((item, index) => (
          <CaseCard
            key={`${item.id}-${index}`}
            item={item}
            active={index === 0}
          />
        ))}
      </div>
      {pageCount > 1 ? (
        <div className="carousel-footer">
          <CarouselIndicators
            count={pageCount}
            activeIndex={activePage}
            onSelect={(index) => moveTo(index, true)}
            label="carrossel de cases"
            itemLabel={isMobile ? 'item' : 'página'}
          />
          <CarouselControls
            label="case"
            onPrevious={() => moveTo(activePage - 1, true)}
            onNext={() => moveTo(activePage + 1, true)}
          />
        </div>
      ) : null}
    </div>
  );
}
