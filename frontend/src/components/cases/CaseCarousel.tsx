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

  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  const moveTo = useCallback(
    (index: number, userInitiated = false) => {
      if (!items.length) return;
      setActiveIndex((index + items.length) % items.length);
      if (userInitiated) {
        setInteractionPaused(true);
        window.clearTimeout(resumeTimer.current);
        resumeTimer.current = window.setTimeout(
          () => setInteractionPaused(false),
          9000,
        );
      }
    },
    [items.length],
  );

  useEffect(() => {
    if (
      items.length <= 1 ||
      hovered ||
      focused ||
      interactionPaused ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }
    const timer = window.setInterval(
      () => setActiveIndex((current) => (current + 1) % items.length),
      autoPlayInterval,
    );
    return () => window.clearInterval(timer);
  }, [autoPlayInterval, focused, hovered, interactionPaused, items.length]);

  useEffect(
    () => () => {
      window.clearTimeout(resumeTimer.current);
    },
    [],
  );

  if (!items.length) return null;
  const visibleItems = isMobile
    ? [items[activeIndex]]
    : items.length === 1
      ? items
      : [items[activeIndex], items[(activeIndex + 1) % items.length]];

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
          moveTo(activeIndex - 1, true);
        }
        if (event.key === 'ArrowRight') {
          event.preventDefault();
          moveTo(activeIndex + 1, true);
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
          moveTo(activeIndex + (distance < 0 ? 1 : -1), true);
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
      {items.length > 1 ? (
        <div className="carousel-footer">
          <CarouselIndicators
            count={items.length}
            activeIndex={activeIndex}
            onSelect={(index) => moveTo(index, true)}
            label="carrossel de cases"
          />
          <CarouselControls
            label="case"
            onPrevious={() => moveTo(activeIndex - 1, true)}
            onNext={() => moveTo(activeIndex + 1, true)}
          />
        </div>
      ) : null}
    </div>
  );
}
