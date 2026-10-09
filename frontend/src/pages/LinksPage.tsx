import { lazy, Suspense, useCallback, useEffect, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PageMetadata } from '../components/common/PageMetadata';
import { LinksItem, type LinksClickPayload } from '../components/links/LinksItem';
import { LinksSocials } from '../components/links/LinksSocials';
import { ScrollToTop } from '../components/layout/ScrollToTop';
import { site } from '../data/site';
import { captureUtmParameters } from '../services/utmService';

const DiagnosticModal = lazy(() =>
  import('../components/diagnostic/DiagnosticModal').then((module) => ({
    default: module.DiagnosticModal,
  })),
);

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const icons = {
  diagnostic: (
    <Icon>
      <path d="M4 17.5 9.2 12l3.2 3.1L20 6.5" />
      <path d="M15 6.5h5v5" />
    </Icon>
  ),
  site: (
    <Icon>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.4 2.5 3.6 5.5 3.6 9S14.4 18.5 12 21c-2.4-2.5-3.6-5.5-3.6-9S9.6 5.5 12 3Z" />
    </Icon>
  ),
  whatsapp: (
    <Icon>
      <path d="M20 11.6a8 8 0 0 1-11.8 7l-4.2 1.1 1.1-4.1A8 8 0 1 1 20 11.6Z" />
      <path d="M8.6 8.3c.5 3 2.1 4.6 5.1 5.1" />
    </Icon>
  ),
  whatsappGroup: (
    <Icon>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19v-1.5A4.5 4.5 0 0 1 8 13h2a4.5 4.5 0 0 1 4.5 4.5V19" />
      <path d="M15 5.3a3 3 0 0 1 0 5.4M16.5 13a4 4 0 0 1 4 4v2" />
    </Icon>
  ),
  blog: (
    <Icon>
      <path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4Z" />
      <path d="M8 20a3 3 0 0 1 3-3h8M9 8h6M9 12h5" />
    </Icon>
  ),
  methodology: (
    <Icon>
      <path d="M5 7.5 12 4l7 3.5-7 3.5-7-3.5Z" />
      <path d="m5 12 7 3.5 7-3.5M5 16.5l7 3.5 7-3.5" />
    </Icon>
  ),
  instagram: (
    <Icon>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <path d="M17.5 6.5h.01" />
    </Icon>
  ),
  linkedin: (
    <Icon>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M8 10v7M8 7v.01M12 17v-4a3 3 0 0 1 6 0v4M12 10v7" />
    </Icon>
  ),
};

const whatsappGroupUrl =
  'https://chat.whatsapp.com/IOCHuvUWZIk4sxBgWjipPl?s=cl&p=a&mlu=4&ilr=4';

function getSocialUrl(label: string) {
  return site.socials.find((social) => social.label === label)?.url ?? '';
}

function trackLinksClick({ linkId, linkUrl, linkType }: LinksClickPayload) {
  window.dataLayer?.push({
    event: 'links_click',
    link_id: linkId,
    link_url: linkUrl,
    link_type: linkType,
  });
}

export function LinksPage() {
  const { search } = useLocation();
  const [diagnosticOpen, setDiagnosticOpen] = useState(false);
  const closeDiagnostic = useCallback(() => setDiagnosticOpen(false), []);

  useEffect(() => {
    captureUtmParameters(search);
  }, [search]);

  const instagramUrl = getSocialUrl('Instagram');
  const linkedinUrl = getSocialUrl('LinkedIn');
  const socialLinks = [
    { id: 'instagram', label: 'Instagram', url: instagramUrl, icon: icons.instagram },
    { id: 'linkedin', label: 'LinkedIn', url: linkedinUrl, icon: icons.linkedin },
    { id: 'whatsapp', label: 'WhatsApp', url: site.whatsapp, icon: icons.whatsapp },
  ];

  return (
    <>
      <PageMetadata
        title="Algoritmux | Links oficiais"
        description="Acesse os canais oficiais, conteúdos, metodologia e atendimento da Algoritmux em um só lugar."
        canonical="/links"
        image="/images/branding/1.png"
        robots="index, follow"
      />
      <ScrollToTop />
      <div className="links-page">
        <div className="links-page__grid" aria-hidden="true" />
        <main id="conteudo-principal" className="links-shell">
          <section className="links-hero" aria-labelledby="links-page-title">
            <Link to="/" className="links-hero__logo" aria-label="Algoritmux — página inicial">
              <img
                src="/images/branding/1.png"
                alt="Algoritmux Growth Marketing"
                width="1014"
                height="250"
              />
            </Link>
            <p className="links-hero__eyebrow">ALGORITMUX</p>
            <h1 id="links-page-title">
              <span className="links-hero__lead">Engenharia de conversão</span> para transformar
              marketing em <span className="links-hero__accent">receita previsível.</span>
            </h1>
            <p className="links-hero__disciplines">
              <span>Growth</span>
              <span>Conversão</span>
              <span>Dados</span>
              <span>Tecnologia</span>
            </p>
          </section>

          <section className="links-list" aria-label="Links oficiais">
            <LinksItem
              icon={icons.diagnostic}
              title="Solicite um diagnóstico"
              description="Descubra os gargalos que limitam seu crescimento."
              linkId="diagnostic"
              linkUrl="diagnostic_modal"
              linkType="action"
              featured
              onAction={() => setDiagnosticOpen(true)}
              onTrack={trackLinksClick}
            />
            <LinksItem
              icon={icons.site}
              title="Conheça a Algoritmux"
              description="Estratégia, tecnologia e conversão em um único sistema."
              linkId="site"
              linkUrl="/"
              linkType="internal"
              onTrack={trackLinksClick}
            />
            <LinksItem
              icon={icons.whatsapp}
              title="Fale conosco no WhatsApp"
              description="Converse diretamente com a nossa equipe."
              linkId="whatsapp"
              linkUrl={site.whatsapp}
              linkType="external"
              onTrack={trackLinksClick}
            />
            <LinksItem
              icon={icons.whatsappGroup}
              title="Entre no nosso grupo do WhatsApp"
              description="Receba novidades, conteúdos e atualizações da Algoritmux."
              linkId="whatsapp_group"
              linkUrl={whatsappGroupUrl}
              linkType="external"
              onTrack={trackLinksClick}
            />
            <LinksItem
              icon={icons.blog}
              title="Conteúdos e insights"
              description="Growth, vendas, dados e engenharia de conversão."
              linkId="blog"
              linkUrl="/blog"
              linkType="internal"
              onTrack={trackLinksClick}
            />
            <LinksItem
              icon={icons.methodology}
              title="Conheça nossa metodologia"
              description="Veja como estruturamos crescimento com previsibilidade."
              linkId="methodology"
              linkUrl="/metodologia"
              linkType="internal"
              onTrack={trackLinksClick}
            />
          </section>

          <LinksSocials links={socialLinks} onTrack={trackLinksClick} />
        </main>

        <footer className="links-footer">
          <div className="links-footer__identity">
            <strong>ALGORITMUX LTDA.</strong>
            <span>© 2026 Algoritmux</span>
          </div>
          <nav aria-label="Links legais">
            <Link to="/politica-de-privacidade">Privacidade</Link>
            <Link to="/termos-de-uso">Termos</Link>
            <Link to="/lgpd">LGPD</Link>
          </nav>
        </footer>
      </div>

      {diagnosticOpen ? (
        <Suspense fallback={null}>
          <DiagnosticModal isOpen onClose={closeDiagnostic} />
        </Suspense>
      ) : null}
    </>
  );
}
