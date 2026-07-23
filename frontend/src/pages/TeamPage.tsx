import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { PageMetadata } from '../components/common/PageMetadata';
import { SectionHeading } from '../components/common/SectionHeading';
import { TeamShowcase } from '../components/team/TeamShowcase';
import { team } from '../data/team';
import { useDiagnostic } from '../layouts/DiagnosticContext';

export function TeamPage() {
  const openDiagnostic = useDiagnostic();

  return (
    <>
      <PageMetadata
        title="A Equipe | Algoritmux"
        description="Conheça os especialistas multidisciplinares que conectam estratégia, dados, marketing e design na Algoritmux."
      />
      <section className="page-hero team-page-hero">
        <div className="site-container page-hero__inner">
          <Badge>Quem somos</Badge>
          <h1>
            Especialistas multidisciplinares trabalhando pelo seu{' '}
            <span className="gradient-text">crescimento.</span>
          </h1>
          <p>
            Unimos estratégia, ciência de dados, marketing e design para
            estruturar sistemas de crescimento previsíveis e eficientes.
          </p>
        </div>
      </section>
      <section className="section team-showcase-section">
        <div className="site-container">
          <SectionHeading
            eyebrow="Pessoas por trás da estratégia"
            title="Experiência multidisciplinar. Uma direção compartilhada."
            description="Conheça os profissionais que transformam dados, criatividade e tecnologia em decisões de crescimento."
            align="left"
          />
          <TeamShowcase members={team} />
        </div>
      </section>
      <section className="section conclusion-section">
        <div className="site-container conclusion-panel">
          <Badge>Conversa direta</Badge>
          <h2>Quer conversar com quem desenha e executa as soluções?</h2>
          <p>
            Apresente o momento da sua empresa e entenda como nossos especialistas
            podem estruturar o próximo ciclo de crescimento.
          </p>
          <Button type="button" size="lg" arrow onClick={openDiagnostic}>
            Solicitar diagnóstico
          </Button>
        </div>
      </section>
    </>
  );
}
