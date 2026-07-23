import type { TeamMember } from '../../types/content';
import { ResponsiveImage } from '../common/ResponsiveImage';

type Props = {
  member: TeamMember;
  active: boolean;
  onSelect: () => void;
};

export function TeamMemberPreview({ member, active, onSelect }: Props) {
  return (
    <button
      type="button"
      className={`team-preview ${active ? 'is-active' : ''}`}
      onClick={onSelect}
      aria-pressed={active}
      aria-label={`Ver perfil de ${member.name}`}
    >
      <ResponsiveImage
        src={member.image}
        alt=""
        width={88}
        height={88}
        aspectRatio="1"
      />
      <span>
        <strong>{member.name}</strong>
        <small>{member.role}</small>
      </span>
    </button>
  );
}
