import { Link } from 'react-router-dom';
import { ResponsiveImage } from '../common/ResponsiveImage';

export function BrandLogo() {
  return (
    <Link to="/" className="brand-logo" aria-label="Algoritmux — página inicial">
      <ResponsiveImage
        src="/images/branding/logo.png"
        alt="Algoritmux"
        width={190}
        height={48}
        priority
      />
    </Link>
  );
}
