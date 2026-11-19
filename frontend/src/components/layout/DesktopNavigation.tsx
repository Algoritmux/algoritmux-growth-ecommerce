import { Link, useLocation } from 'react-router-dom';
import { externalNavigation, navigation } from '../../data/navigation';
import { ExternalLink } from '../common/ExternalLink';

export function DesktopNavigation() {
  const { pathname } = useLocation();

  return (
    <nav className="desktop-nav" aria-label="Navegação principal">
      {navigation.map((item) => {
        const active =
          pathname === item.path ||
          item.aliases.includes(pathname) ||
          (item.path === '/blog' && pathname.startsWith('/blog/'));
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
      {externalNavigation.map((item) => (
        <ExternalLink key={item.href} href={item.href}>
          {item.label}
        </ExternalLink>
      ))}
    </nav>
  );
}
