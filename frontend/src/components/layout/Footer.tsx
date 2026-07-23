import { Link } from 'react-router-dom';
import { navigation } from '../../data/navigation';
import { site } from '../../data/site';
import { ExternalLink } from '../common/ExternalLink';
import { BrandLogo } from './BrandLogo';

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-container footer-grid">
        <div>
          <BrandLogo />
          <p>{site.description}</p>
        </div>
        <div className="footer-links">
          <h2>Navegação</h2>
          {navigation.map((item) => (
            <Link key={item.path} to={item.path}>
              {item.label}
            </Link>
          ))}
        </div>
        <div className="footer-contact">
          <h2>Contato</h2>
          <a href={`mailto:${site.email}`}>{site.email}</a>
          <ExternalLink href={site.whatsapp}>{site.phone}</ExternalLink>
          <div className="social-links">
            {site.socials.map((social) => (
              <ExternalLink key={social.label} href={social.url}>
                {social.label}
              </ExternalLink>
            ))}
          </div>
          <small>© 2026 Algoritmux. Todos os direitos reservados.</small>
        </div>
      </div>
    </footer>
  );
}
