import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

export type LinksClickType = 'action' | 'internal' | 'external';

export type LinksClickPayload = {
  linkId: string;
  linkUrl: string;
  linkType: LinksClickType;
};

type LinksItemProps = LinksClickPayload & {
  icon: ReactNode;
  title: string;
  description?: string;
  featured?: boolean;
  onAction?: () => void;
  onTrack: (payload: LinksClickPayload) => void;
};

export function LinksItem({
  icon,
  title,
  description,
  featured = false,
  linkId,
  linkUrl,
  linkType,
  onAction,
  onTrack,
}: LinksItemProps) {
  const className = `links-item${featured ? ' links-item--featured' : ''}`;
  const content = (
    <>
      <span className="links-item__icon" aria-hidden="true">
        {icon}
      </span>
      <span className="links-item__copy">
        <strong>{title}</strong>
        {description ? <span>{description}</span> : null}
      </span>
      <span className="links-item__arrow" aria-hidden="true">
        →
      </span>
    </>
  );
  const track = () => onTrack({ linkId, linkUrl, linkType });

  if (linkType === 'action') {
    return (
      <button
        type="button"
        className={className}
        onClick={() => {
          track();
          onAction?.();
        }}
      >
        {content}
      </button>
    );
  }

  if (linkType === 'external') {
    return (
      <a
        className={className}
        href={linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={track}
      >
        {content}
      </a>
    );
  }

  return (
    <Link className={className} to={linkUrl} onClick={track}>
      {content}
    </Link>
  );
}
