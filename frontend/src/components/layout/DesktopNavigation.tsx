import { Link, useLocation } from 'react-router-dom';
import { navigation } from '../../data/navigation';

export function DesktopNavigation() {
  const { pathname } = useLocation();

  return (
    <nav className="desktop-nav" aria-label="Navegação principal">
      {navigation.map((item) => {
        const active = pathname === item.path || item.aliases.includes(pathname);
        return (
          <Link
            key={item.path}
            to={item.path}
            aria-current={active ? 'page' : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
