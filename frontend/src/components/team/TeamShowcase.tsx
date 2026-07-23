import { useRef, useState } from 'react';
import type { TeamMember } from '../../types/content';
import { CarouselIndicators } from '../cases/CarouselIndicators';
import { TeamCarouselControls } from './TeamCarouselControls';
import { TeamMemberCard } from './TeamMemberCard';
import { TeamMemberPreview } from './TeamMemberPreview';

export function TeamShowcase({ members }: { members: TeamMember[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStart = useRef<number | null>(null);

  if (!members.length) return null;
  const moveTo = (index: number) =>
    setActiveIndex((index + members.length) % members.length);

  return (
    <div
      className="team-showcase"
      role="region"
      aria-roledescription="carrossel"
      aria-label="Equipe Algoritmux"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          moveTo(activeIndex - 1);
        }
        if (event.key === 'ArrowRight') {
          event.preventDefault();
          moveTo(activeIndex + 1);
        }
      }}
      onTouchStart={(event) => {
        touchStart.current = event.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(event) => {
        if (touchStart.current === null) return;
        const distance = (event.changedTouches[0]?.clientX ?? touchStart.current) -
          touchStart.current;
        if (Math.abs(distance) > 45) moveTo(activeIndex + (distance < 0 ? 1 : -1));
        touchStart.current = null;
      }}
    >
      <div className="team-showcase__main">
        <div className="team-showcase__navigation">
          <span>
            {String(activeIndex + 1).padStart(2, '0')} /{' '}
            {String(members.length).padStart(2, '0')}
          </span>
          <TeamCarouselControls
            onPrevious={() => moveTo(activeIndex - 1)}
            onNext={() => moveTo(activeIndex + 1)}
          />
        </div>
        <TeamMemberCard member={members[activeIndex]} />
      </div>
      <aside className="team-showcase__previews" aria-label="Escolher integrante">
        <div className="team-showcase__rail-heading">
          <strong>Conheça nosso time</strong>
          <span>Selecione um perfil para explorar.</span>
        </div>
        <div className="team-showcase__rail">
          {members.map((member, index) => (
            <TeamMemberPreview
              key={member.id}
              member={member}
              active={index === activeIndex}
              onSelect={() => moveTo(index)}
            />
          ))}
        </div>
      </aside>
      <div className="team-showcase__mobile-indicators">
        <CarouselIndicators
          count={members.length}
          activeIndex={activeIndex}
          onSelect={moveTo}
          label="equipe"
        />
      </div>
    </div>
  );
}
