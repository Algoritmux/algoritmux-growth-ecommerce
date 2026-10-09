import type { ReactNode } from 'react';
import type { LinksClickPayload } from './LinksItem';

type SocialLink = {
  id: string;
  label: string;
  url: string;
  icon: ReactNode;
};

type LinksSocialsProps = {
  links: SocialLink[];
  onTrack: (payload: LinksClickPayload) => void;
};

export function LinksSocials({ links, onTrack }: LinksSocialsProps) {
  return (
    <nav className="links-socials" aria-label="Redes sociais da Algoritmux">
      {links.map((social) => (
        <a
          key={social.id}
          href={social.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${social.label} da Algoritmux`}
          onClick={() =>
            onTrack({
              linkId: social.id,
              linkUrl: social.url,
              linkType: 'external',
            })
          }
        >
          {social.icon}
          <span>{social.label}</span>
        </a>
      ))}
    </nav>
  );
}
