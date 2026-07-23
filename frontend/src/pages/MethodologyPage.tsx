import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { PageMetadata } from '../components/common/PageMetadata';
import { ResponsiveImage } from '../components/common/ResponsiveImage';
import { useDiagnostic } from '../layouts/DiagnosticContext';

const cycles = [
  {
    eyebrow: 'Ciclo estratégico 01',
    title: 'Descobrir, executar e escalar',
    image: '/images/layout/ciclo1.png',
    imageAlt: 'Flywheel Ciclo 1',
    steps: [
      [
        'Coleta e análise de dados',
        'Tudo começa com dados que embasam decisões e revelam oportunidades de crescimento.',
      ],
      [
        'Modelagem de estratégias',
        'Definimos planos de ação e simulamos cenários alinhados aos objetivos do negócio.',
      ],
      [
        'Execução ágil',
        'Transformamos a modelagem em campanhas mensuráveis, rápidas e focadas.',
      ],
      [
        'Avaliação de resultados',
        'Medimos KPIs, coletamos feedback e verificamos o impacto das hipóteses.',
      ],
      [
        'Escala',
        'Expandimos o que funciona para ampliar o impacto e sustentar os resultados.',
      ],
    ],
  },
  {
    eyebrow: 'Ciclo estratégico 02',
    title: 'Fortalecer produto e reputação',
    image: '/images/layout/ciclo2.png',
    imageAlt: 'Flywheel Ciclo 2',
    steps: [
      [
        'Otimização do produto',
        'Aprimoramos continuamente a oferta a partir das necessidades dos clientes.',
      ],
      [
        'Reputação sólida',
        'Fortalecemos experiência, percepção e credibilidade da marca no mercado.',
      ],
      [
        'Expansão',
        'Levamos uma proposta validada a novos públicos e espaços de mercado.',
      ],
    ],
  },
];

export function MethodologyPage() {
  const openDiagnostic = useDiagnostic();

  return (
    <>
      <PageMetadata
        title="Metodologia | Algoritmux | Engenharia de Conversão"
        description="Conheça o flywheel Algoritmux e seus ciclos contínuos de dados, execução, otimização e escala."
      />
      <section className="page-hero">
        <div className="site-container page-hero__inner">
          <Badge>Nossa metodologia</Badge>
          <h1>
            A Metodologia <span className="gradient-text">Algoritmux</span>
          </h1>
          <p>
            Três ciclos concêntricos que se reforçam mutuamente e geram um
            movimento contínuo de crescimento.
          </p>
        </div>
      </section>

      {cycles.map((cycle, cycleIndex) => (
        <section
          key={cycle.title}
          className={`section cycle-section ${cycleIndex % 2 ? 'section--muted' : ''}`}
        >
          <div
            className={`site-container cycle-grid ${cycleIndex % 2 ? 'cycle-grid--reverse' : ''}`}
          >
            <div>
              <header className="cycle-heading">
                <span>{cycle.eyebrow}</span>
                <h2>{cycle.title}</h2>
              </header>
              <div className="timeline">
                {cycle.steps.map(([title, description], index) => (
                  <article key={title}>
                    <span>{index + 1}</span>
                    <div>
                      <h3>{title}</h3>
                      <p>{description}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
            <div
              className={`flywheel-stage ${
                cycle.image.endsWith('.jpg') ? 'flywheel-stage--blend' : ''
              }`.trim()}
            >
              <ResponsiveImage
                src={cycle.image}
                alt={cycle.imageAlt}
                width={720}
                height={720}
                aspectRatio="1"
              />
            </div>
          </div>
        </section>
      ))}

      <section className="section">
        <div className="site-container cycle-grid">
          <div>
            <header className="cycle-heading">
              <span>Ciclo estratégico 03</span>
              <h2>Growth em movimento contínuo</h2>
            </header>
            <p className="lead-copy">
              No centro do flywheel está o <strong>Growth</strong>: o objetivo e o
              motor que impulsiona todos os ciclos. É a soma de esforços
              coordenados em busca de crescimento sustentável e escalável.
            </p>
            <p>
              Otimização do produto, reputação, execução estratégica e ampliação
              da escala criam um movimento constante de melhoria.
            </p>
          </div>
          <div className="flywheel-stage">
            <ResponsiveImage
              src="/images/layout/ciclo3.png"
              alt="Flywheel Ciclo 3"
              width={720}
              height={720}
              aspectRatio="1"
            />
          </div>
        </div>
      </section>

      <section className="section conclusion-section">
        <div className="site-container conclusion-panel">
          <Badge>Conclusão</Badge>
          <h2>Sinergia e previsibilidade</h2>
          <p>
            Os três níveis trabalham juntos para que cada aspecto do processo de
            growth seja otimizado e potencializado. Assim, o crescimento se torna
            constante, eficiente e sustentável.
          </p>
          <Button type="button" size="lg" arrow onClick={openDiagnostic}>
            Estruturar meu sistema de crescimento
          </Button>
        </div>
      </section>

      <section className="methodology-light-cta">
        <div className="site-container methodology-light-cta__inner">
          <div>
            <span>Estratégia antes da execução</span>
            <h2>Pronto para estruturar seu sistema de crescimento?</h2>
            <p>
              Converse com nossos estrategistas e identifique o próximo ciclo de
              evolução da sua operação.
            </p>
          </div>
          <Button type="button" size="lg" arrow onClick={openDiagnostic}>
            Solicitar diagnóstico
          </Button>
        </div>
      </section>
    </>
  );
}
