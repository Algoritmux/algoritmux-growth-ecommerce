import type { TeamMember } from '../../types/content';
import { ExternalLink } from '../common/ExternalLink';
import { ResponsiveImage } from '../common/ResponsiveImage';

export function TeamMemberCard({ member }: { member: TeamMember }) {
  return (
    <article className="team-member-card" aria-live="polite">
      <div className="team-member-card__image">
        <span>Time Algoritmux</span>
        <div className="team-member-card__portrait-frame">
          <ResponsiveImage
            src={member.image}
            alt={member.imageAlt}
            width={720}
            height={720}
            aspectRatio="1"
          />
        </div>
      </div>
      <div className="team-member-card__content">
        <span>Conheça o especialista</span>
        <h2>{member.name}</h2>
        <strong>{member.role}</strong>
        <p>{member.description}</p>
        {member.professionalLinks?.map((link) => (
          <ExternalLink key={link.url} href={link.url}>
            {link.label}
          </ExternalLink>
        ))}
      </div>
    </article>
  );
}
