import { Link } from 'react-router-dom';
import { ResponsiveImage } from '../common/ResponsiveImage';

export function BrandLogo() {
  return (
    <Link to="/" className="brand-logo" aria-label="Algoritmux — página inicial">
      <ResponsiveImage
        src="/images/branding/1.png"
        alt="Algoritmux"
        width={1024}
        height={241}
        priority
      />
    </Link>
  );
}
