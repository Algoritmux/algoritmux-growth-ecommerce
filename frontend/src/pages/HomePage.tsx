import { Button } from "../components/common/Button";
import { Badge } from "../components/common/Badge";
import { PageMetadata } from "../components/common/PageMetadata";
import { ResponsiveImage } from "../components/common/ResponsiveImage";
import { ScrollReveal } from "../components/common/ScrollReveal";
import { SectionHeading } from "../components/common/SectionHeading";
import { CaseCarousel } from "../components/cases/CaseCarousel";
import { cases } from "../data/cases";
import { team } from "../data/team";
import { useDiagnostic } from "../layouts/DiagnosticContext";

const plans = [
  {
    name: "START",
    description:
      "Estruture sua operação e comece a gerar demanda com base e clareza.",
  },
  {
    name: "GROWTH",
    description:
      "Otimize o funil, aumente a eficiência da aquisição e melhore a conversão.",
  },
  {
    name: "SCALE",
    description:
      "Escale com inteligência de dados, previsibilidade e integração total.",
  },
];

const planRows = [
  {
    label: "Geração de Demanda",
    values: [
      "Captação direta de leads para formação da base.",
      "Campanhas multicanal, remarketing e testes de públicos, criativos, ofertas e mensagens.",
      "Estratégia de escala com expansão de públicos, canais, ofertas e jornadas de aquisição.",
    ],
  },
  {
    label: "Canais de Mídia",
    values: [
      "Meta Ads e/ou Google Ads Search, definidos conforme estratégia inicial.",
      "Meta Ads, Google Ads, YouTube Ads e LinkedIn Ads, conforme aderência ao negócio.",
      "Mix avançado de mídia paga, com Meta, Google, YouTube, LinkedIn e canais complementares.",
    ],
  },
  {
    label: "Setup Web",
    values: [
      "Landing page inicial para apresentação da oferta e conversão.",
      "Otimização contínua de landing pages com foco em experiência e conversão.",
      "Evolução de UX, CRO e páginas estratégicas para aumento contínuo de conversão.",
    ],
  },
  {
    label: "Inteligência de Dados",
    values: [
      "Configuração base de GA4, GTM, pixels, eventos e rastreamento de conversões.",
      "Dashboard de performance, rastreamento de funil e análise recorrente de gargalos.",
      "Dashboard integrado de marketing, vendas e receita, com leitura de CAC, ROI, LTV e funil.",
    ],
  },
  {
    label: "CRM & Processos",
    values: [
      "Integração básica entre formulários, WhatsApp e origem dos leads.",
      "Integração profunda com CRM, automações de entrada, distribuição e acompanhamento de leads.",
      "Automações avançadas, lead scoring, nutrição, retention, reativação e acompanhamento de base.",
    ],
  },
  {
    label: "Atuação Comercial",
    values: [
      "Definição de lead qualificado e processo inicial de repasse ao comercial.",
      "Revisão de funil, cadências de contato, motivos de perda e oportunidades de conversão.",
      "Forecast de vendas, análise de conversão por etapa e ajustes táticos com o time comercial.",
    ],
  },
  {
    label: "Reuniões",
    values: [
      "Reunião estratégica mensal de alinhamento e priorização.",
      "Forecast quinzenal para acompanhamento de metas, hipóteses e prioridades.",
      "Acompanhamento tático semanal e reunião executiva mensal.",
    ],
  },
  {
    label: "Relatórios",
    values: [
      "Relatório mensal com métricas essenciais, resultados e próximos passos.",
      "Dashboard personalizado, análises executivas e leitura de comportamento com Hotjar.",
      "Visão consolidada de aquisição, vendas e retenção para decisões orientadas por receita.",
    ],
  },
  {
    label: "Para quem é indicado",
    values: [
      "Empresas que estão começando ou precisam estruturar a operação digital e validar canais.",
      "Empresas que já geram demanda e querem otimizar o funil, integrar vendas e escalar resultados.",
      "Empresas que buscam escala sustentável, inteligência de receita e previsibilidade comercial.",
    ],
  },
  {
    label: "Foco principal",
    values: [
      "Estruturação e validação",
      "Otimização e eficiência",
      "Escala e previsibilidade",
    ],
  },
];

export function HomePage() {
  const openDiagnostic = useDiagnostic();

  return (
    <>
      <PageMetadata
        title="Algoritmux | Crescimento de Receita Previsível e Engenharia de Conversão"
        description="Marketing, vendas e inteligência de dados conectados em um sistema previsível de crescimento."
      />

      <section className="hero home-hero">
        <div className="site-container hero-grid">
          <div className="hero-content">
            <Badge>Growth Marketing</Badge>
            <h1>
              Crescimento não é ação isolada. <span>É um sistema.</span>
            </h1>
            <p>
              Estruturamos e operamos um sistema previsível que conecta
              Marketing, Vendas e Inteligência de Dados para escalar empresas
              que já vendem.{" "}
            </p>
            <div className="hero-actions">
              <Button type="button" size="lg" arrow onClick={openDiagnostic}>
                Solicitar diagnóstico de performance
              </Button>
              <small>Visão de negócio antes da execução.</small>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-orbit" aria-hidden="true" />
            <ResponsiveImage
              src="/images/equipe/diretores.png"
              alt="Diretores Algoritmux"
              width={780}
              height={700}
              priority
            />
          </div>
        </div>
      </section>

      <section className="section section--muted">
        <div className="site-container">
          <SectionHeading
            eyebrow="O cenário atual"
            title="O problema não é falta de leads. É a falta de um sistema que transforma marketing em vendas."
            description="Sua empresa investe em campanhas, faz testes e tenta de tudo. Mas sem uma lógica conectando marketing e vendas, o resultado é sempre o mesmo: crescimento instável e imprevisível."
          />
          <div className="feature-grid">
            {[
              {
                icon: "⌖",
                iconClass: "direction",
                title: "Execução sem direção",
                description:
                  "Campanhas geram tráfego, mas sem uma operação validada, o orçamento vira fumaça sem previsibilidade.",
              },
              {
                icon: "▥",
                iconClass: "metrics",
                title: "Métricas de vaidade",
                description:
                  "Dados usados para enfeitar relatórios, não para direcionar decisões estratégicas de negócio.",
              },
              {
                icon: "⇄",
                iconClass: "integration",
                title: "Desconexão Comercial",
                description:
                  "O marketing atrai, mas o comercial não fecha. Sem integração real, a oportunidade morre antes de virar caixa.",
              },
            ].map((item) => (
              <ScrollReveal key={item.title}>
                <article className="feature-card">
                  <span
                    className={`feature-card__icon feature-card__icon--${item.iconClass}`}
                    aria-hidden="true"
                  >
                    {item.icon}
                  </span>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </article>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section vision-section">
        <div className="site-container vision-layout">
          <ScrollReveal>
            <div className="vision-copy">
              <Badge>O MÉTODO ALGORITMUX</Badge>
              <h2>
                Crescimento previsível exige o marketing{" "}
                <span className="gradient-text">operando como sistema.</span>
              </h2>
              <p>
                Abandonamos o funil tradicional que morre na venda. Criamos uma
                engrenagem contínua (Flywheel) onde dados, execução e
                inteligência se retroalimentam para acelerar o seu crescimento
                em escala.
              </p>
            </div>
          </ScrollReveal>
          <div className="vision-content">
            <ScrollReveal>
              <div className="vision-visual">
                <ResponsiveImage
                  src="/images/layout/flywheel-4.png"
                  alt="Flywheel Algoritmux integrando dados, modelagem, execução e escala"
                  width={1080}
                  height={1080}
                  aspectRatio="1"
                />
              </div>
            </ScrollReveal>
            <ScrollReveal>
              <ul className="benefit-list benefit-list--cycles">
                <li className="benefit-card">
                  <span className="benefit-list__icon" aria-hidden="true">
                    01
                  </span>
                  <div className="benefit-card__content">
                    <span className="benefit-card__eyebrow">
                      Ciclo 1: O Motor
                    </span>
                    <strong className="benefit-card__title">
                      Growth Hacking &amp; Tração Contínua
                    </strong>
                    <p className="benefit-card__description">
                      Não rodamos campanhas na sorte. Implantamos uma
                      infraestrutura viva de testes rápidos e otimizações
                      semanais para transformar orçamento em receita previsível.
                    </p>
                  </div>
                </li>
                <li className="benefit-card">
                  <span className="benefit-list__icon" aria-hidden="true">
                    02
                  </span>
                  <div className="benefit-card__content">
                    <span className="benefit-card__eyebrow">
                      Ciclo 2: Os Ativos de Marketing
                    </span>
                    <strong className="benefit-card__title">
                      Onde seu marketing deixa de ser despesa e vira patrimônio.
                    </strong>
                    <p className="benefit-card__description">
                      Construir ativos significa encerrar o desperdício em mídia
                      solta para priorizar a eficiência máxima do LTV (Valor do
                      Tempo de Vida do Cliente ) e CAC (Custo de Aquisição de
                      Clientes).
                    </p>
                  </div>
                </li>
                <li className="benefit-card">
                  <span className="benefit-list__icon" aria-hidden="true">
                    03
                  </span>
                  <div className="benefit-card__content">
                    <span className="benefit-card__eyebrow">
                      Ciclo 3: O núcleo
                    </span>
                    <strong className="benefit-card__title">
                      A força gravitacional que elimina o caos operacional.
                    </strong>
                    <p className="benefit-card__description">
                      Unificamos marketing, vendas e tecnologia sob uma única
                      Métrica Estrela Guia (NSM). Eliminamos brigas de áreas e o
                      caos operacional para direcionar 100% dos esforços para o
                      lucro real.
                    </p>
                  </div>
                </li>
              </ul>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <section className="section section--muted">
        <div className="site-container split-section split-section--reverse">
          <ResponsiveImage
            src="/images/layout/pilares.png"
            alt="Pilares de experiência do cliente e conversão"
            width={700}
            height={620}
          />
          <div>
            <Badge>INTELIGÊNCIA DE MARKETING & CRO</Badge>
            <h2>
              Nenhum sistema de marketing sobrevive a{" "}
              <span className="gradient-text">uma jornada com atritos.</span>
            </h2>
            <p>
              Trazer tráfego para uma experiência com atritos é acelerar o
              desperdício de caixa. Unimos Inteligência de Dados, Design de
              Experiência (UX) e CRO (Otimização da Taxa de Conversão ) para
              criar jornadas sem fricção. Transformamos cada ponto de contato em
              uma decisão de compra fluida, científica e 100% mensurável.
            </p>
            <div className="mini-feature-list">
              <div>
                <h3>Mapeamento de Fricção Zero</h3>
                <p>
                  Identificamos as micro-barreiras da jornada do cliente para
                  criar um fluxo contínuo de ativação.
                </p>
              </div>
              <div>
                <h3>Engenharia de dados + CRO</h3>
                <p>
                  Metodologia de testes acelerados para transformar páginas de
                  destino em ferramentas de alta performance comercial.
                </p>
              </div>
              <div>
                <h3>UX Alimentado por Dados</h3>
                <p>
                  O design reage ao usuário. Construímos layouts responsivos e
                  estratégicos baseados em tagueamento de eventos e análise de
                  calor.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section leadership-section">
        <div className="site-container">
          <SectionHeading
            eyebrow="OS SÓCIOS"
            title="Sua empresa guiada diretamente pelos fundadores da Algoritmux."
            description="Na Algoritmux, você não é atendido por estagiários ou “juniores”. Sua operação conta com o acompanhamento direto de três fundadores com visões complementares de negócio:"
          />
          <div className="leadership-grid">
            {team.slice(0, 3).map((member) => (
              <article
                key={member.id}
                className={`leadership-card leadership-card--${member.id}`}
              >
                <div className="leadership-card__portrait">
                  <ResponsiveImage
                    src={member.image}
                    alt={member.imageAlt}
                    width={420}
                    height={420}
                    aspectRatio="1"
                  />
                </div>
                <div className="leadership-card__content">
                  <span>{member.role}</span>
                  <h3>{member.name}</h3>
                  <p>{member.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="site-container">
          <SectionHeading
            eyebrow="Modelos de aceleração"
            title="Uma estrutura para cada estágio de crescimento."
            description="Escolha o modelo adequado ao momento e ao objetivo da sua empresa."
          />
          <div
            className="plan-comparison-scroll"
            role="region"
            aria-label="Comparativo dos modelos de aceleração"
            tabIndex={0}
          >
            <table className="plan-comparison">
              <thead>
                <tr>
                  <th scope="col">Comparativo de planos</th>
                  {plans.map((plan) => (
                    <th key={plan.name} scope="col">
                      <strong>{plan.name}</strong>
                      <span>{plan.description}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {planRows.map((row) => (
                  <tr key={row.label}>
                    <th scope="row">{row.label}</th>
                    {row.values.map((value, index) => (
                      <td
                        key={`${row.label}-${plans[index].name}`}
                        className={
                          row.label === "Foco principal" ? "plan-focus" : ""
                        }
                      >
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="section-action acceleration-action">
            <Button type="button" size="lg" arrow onClick={openDiagnostic}>
              Quero ativar o modo Growth
            </Button>
          </div>
        </div>
      </section>

      <section className="section cases-section">
        <div className="site-container">
          <SectionHeading
            eyebrow="Cases reais"
            title="O resultado de uma operação alinhada."
            description="Estudos de caso reais de empresas que saíram de ações fragmentadas para uma previsibilidade de ponta a ponta."
          />
          <CaseCarousel items={cases} />
          <div className="section-action">
            <Button type="button" arrow onClick={openDiagnostic}>
              Quero resultados assim no meu negócio
            </Button>
          </div>
        </div>
      </section>

      <section className="section story-section">
        <div className="site-container story-panel">
          <Badge>O custo da desorganização</Badge>
          <h2>Tráfego não salva um funil quebrado.</h2>
          <p>
            Investir mais em mídia não resolve um processo de vendas
            desorganizado. Sem critérios claros de qualificação, o orçamento se
            transforma em cliques sem resultado.
          </p>
          <p>
            Em uma operação estagnada, reestruturamos o funil, automatizamos
            etapas e alinhamos os times. Com o mesmo investimento em mídia, a
            conversão em vendas triplicou em 90 dias.
          </p>
          <div className="story-result">
            <strong>3x</strong>
            <span>mais conversão em vendas em 90 dias</span>
          </div>
        </div>
      </section>

      <section className="section final-cta">
        <div className="site-container final-cta__inner">
          <ResponsiveImage
            src="/images/layout/performance.jpg"
            alt="Equipe acompanhando indicadores de performance"
            width={720}
            height={620}
          />
          <div>
            <Badge>Próximo passo</Badge>
            <h2>
              Sua operação de marketing está queimando caixa em vez de gerar
              ativos.
            </h2>
            <p>
              Investir em mídia sem uma arquitetura de conversão é colocar água
              em um balde furado. Nós auditamos o seu sistema atual, estancamos
              o desperdício de receita e reestruturamos sua máquina para focar
              na eficiência máxima do LTV e CAC.
            </p>
            <div className="hero-actions">
              <Button type="button" size="lg" arrow onClick={openDiagnostic}>
                Solicitar Raio-X da Operação
              </Button>
              <small>
                Avaliação gratuita do seu sistema de aquisição. Fale direto com
                um dos nossos especialistas.
              </small>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
