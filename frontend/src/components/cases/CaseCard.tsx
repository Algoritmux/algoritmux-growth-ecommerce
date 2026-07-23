import type { CaseStudy } from '../../types/content';

export function CaseCard({ item, active }: { item: CaseStudy; active: boolean }) {
  return (
    <article
      className={`case-card ${active ? 'is-active' : ''}`}
      aria-label={item.ariaLabel}
    >
      <div className="case-card__header">
        <div>
          <span className="case-card__label">Case de crescimento</span>
          <h3>{item.company}</h3>
        </div>
        <span className="case-card__segment">{item.segment}</span>
      </div>
      <div className="case-card__metrics">
        <div>
          <span>Crescimento</span>
          <strong>{item.growth}</strong>
        </div>
        <div>
          <span>ROAS alcançado</span>
          <strong>{item.roas}</strong>
        </div>
      </div>
      <p>{item.description}</p>
    </article>
  );
}
