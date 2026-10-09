import type { ReactNode } from 'react';

export type LegalSummaryItem = {
  id: string;
  label: string;
};

type LegalDocumentProps = {
  eyebrow: string;
  title: string;
  description: string;
  updatedAt: string;
  summary: LegalSummaryItem[];
  children: ReactNode;
};

export function LegalDocument({
  eyebrow,
  title,
  description,
  updatedAt,
  summary,
  children,
}: LegalDocumentProps) {
  return (
    <article className="legal-document">
      <div className="legal-hero">
        <div className="legal-container legal-hero__inner">
          <p className="legal-eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p className="legal-hero__description">{description}</p>
          <p className="legal-updated">Última atualização: {updatedAt}</p>
        </div>
      </div>

      <div className="legal-container legal-layout">
        <nav className="legal-summary" aria-label={`Sumário de ${title}`}>
          <h2>Nesta página</h2>
          <ol>
            {summary.map((item) => (
              <li key={item.id}>
                <a href={`#${item.id}`}>{item.label}</a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="legal-content">{children}</div>
      </div>
    </article>
  );
}
