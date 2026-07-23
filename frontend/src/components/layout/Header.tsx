import { useEffect, useState } from 'react';
import { Button } from '../common/Button';
import { BrandLogo } from './BrandLogo';
import { DesktopNavigation } from './DesktopNavigation';
import { MobileNavigation } from './MobileNavigation';

export function Header({ onOpenDiagnostic }: { onOpenDiagnostic: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const closeOnResize = () => {
      if (window.innerWidth >= 900) setMenuOpen(false);
    };
    window.addEventListener('resize', closeOnResize);
    return () => window.removeEventListener('resize', closeOnResize);
  }, []);

  return (
    <header className="site-header">
      <div className="site-container header-inner">
        <BrandLogo />
        <DesktopNavigation />
        <div className="header-actions">
          <Button
            type="button"
            size="sm"
            className="header-cta"
            onClick={onOpenDiagnostic}
          >
            Solicitar diagnóstico
          </Button>
          <button
            type="button"
            className={`menu-toggle ${menuOpen ? 'is-open' : ''}`}
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((value) => !value)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
      <MobileNavigation open={menuOpen} onNavigate={() => setMenuOpen(false)} />
    </header>
  );
}
