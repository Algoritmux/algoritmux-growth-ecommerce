import { Link, useLocation } from 'react-router-dom';
import { navigation } from '../../data/navigation';

type Props = {
  open: boolean;
  onNavigate: () => void;
};

export function MobileNavigation({ open, onNavigate }: Props) {
  const { pathname } = useLocation();

  return (
    <nav
      id="mobile-navigation"
      className={`mobile-nav ${open ? 'is-open' : ''}`}
      aria-label="Navegação mobile"
      hidden={!open}
    >
      {navigation.map((item) => {
        const active = pathname === item.path || item.aliases.includes(pathname);
        return (
          <Link
            key={item.path}
            to={item.path}
            aria-current={active ? 'page' : undefined}
            onClick={onNavigate}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
