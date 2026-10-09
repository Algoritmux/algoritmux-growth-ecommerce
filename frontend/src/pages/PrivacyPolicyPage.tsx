import { Link } from 'react-router-dom';
import { PageMetadata } from '../components/common/PageMetadata';
import {
  LegalDocument,
  type LegalSummaryItem,
} from '../components/legal/LegalDocument';

const summary: LegalSummaryItem[] = [
  { id: 'quem-somos', label: 'Quem somos e escopo' },
  { id: 'dados-coletados', label: 'Dados que tratamos' },
  { id: 'diagnostico', label: 'Diagnóstico comercial' },
  { id: 'ebook-newsletter', label: 'E-book e newsletter' },
  { id: 'origem-utms', label: 'Página de origem e UTMs' },
  { id: 'fornecedores', label: 'Fornecedores e compartilhamento' },
  { id: 'analytics-cookies', label: 'Analytics, marketing e cookies' },
  { id: 'seguranca-retencao', label: 'Segurança e retenção' },
  { id: 'direitos', label: 'Seus direitos' },
  { id: 'contato', label: 'Solicitações e contato' },
];

export function PrivacyPolicyPage() {
  return (
    <>
      <PageMetadata
        title="Política de Privacidade | Algoritmux"
        description="Entenda como a Algoritmux coleta, utiliza, compartilha e protege dados pessoais em seu site, formulários, e-book e newsletter."
        canonical="/politica-de-privacidade"
        robots="index, follow"
      />

      <LegalDocument
        eyebrow="Privacidade e proteção de dados"
        title="Política de Privacidade"
        description="Esta política explica, de forma transparente, como tratamos dados pessoais durante o uso do site e dos canais digitais da Algoritmux."
        updatedAt="9 de outubro de 2026"
        summary={summary}
      >
        <section id="quem-somos">
          <h2>1. Quem somos e qual é o escopo desta política</h2>
          <p>
            A <strong>ALGORITMUX LTDA.</strong>, nome fantasia <strong>ALGORITMUX</strong>,
            inscrita no CNPJ sob o nº 42.324.675/0001-36, é uma sociedade empresária
            limitada, de porte ME, com sede na Avenida Getúlio Vargas, 21-51, Jardim
            Europa, Bauru/SP, CEP 17017-383. Para as atividades descritas nesta política,
            a Algoritmux atua como controladora dos dados pessoais.
          </p>
          <p>
            Esta política se aplica ao site <a href="https://algoritmux.com">algoritmux.com</a>,
            ao blog, aos formulários de diagnóstico, à solicitação de materiais gratuitos,
            à newsletter e às integrações utilizadas para operar esses recursos.
          </p>
        </section>

        <section id="dados-coletados">
          <h2>2. Quais dados tratamos</h2>
          <p>Conforme a forma de interação com o site, podemos tratar:</p>
          <ul>
            <li>nome, e-mail e número de WhatsApp;</li>
            <li>nome da empresa e faixa de faturamento mensal;</li>
            <li>website e tipo de projeto, quando enviados por uma integração compatível com nossa API;</li>
            <li>material solicitado e opção de recebimento da newsletter;</li>
            <li>página de origem e parâmetros UTM de campanha;</li>
            <li>datas e estados operacionais de envio, sincronização e download do e-book;</li>
            <li>identificadores técnicos, endereço IP, informações do navegador e eventos de navegação, conforme a tecnologia utilizada.</li>
          </ul>
          <p>
            Solicitamos apenas os dados pertinentes a cada fluxo. Campos não preenchidos ou
            não enviados pelo recurso utilizado não são coletados por aquele formulário.
          </p>
        </section>

        <section id="diagnostico">
          <h2>3. Formulário de diagnóstico</h2>
          <p>
            O diagnóstico coleta nome, WhatsApp e e-mail corporativo, além de poder receber
            nome da empresa, faixa de faturamento, página de origem e UTMs. Esses dados são
            usados para receber a solicitação, entender o contexto informado, qualificar a
            oportunidade e permitir que nossa equipe realize o atendimento comercial.
          </p>
          <p>
            O envio do formulário não garante contratação, proposta ou resultado. O contato
            posterior depende da análise das informações e da disponibilidade da equipe.
          </p>
        </section>

        <section id="ebook-newsletter">
          <h2>4. E-book, entrega transacional e newsletter</h2>
          <h3>4.1 Entrega do e-book</h3>
          <p>
            Para entregar o material gratuito, tratamos nome, e-mail, material solicitado,
            página de origem e UTMs. O e-book é enviado por e-mail por meio do Resend, usado
            via SMTP como provedor de entrega transacional.
          </p>
          <p>
            O link de download é pessoal, assinado e expira em sete dias. Registramos estados
            operacionais de envio e a data do primeiro download para suporte e controle da
            entrega. O arquivo permanece em armazenamento privado e não é exposto por uma URL
            pública permanente.
          </p>
          <h3>4.2 Newsletter</h3>
          <p>
            A inscrição na newsletter é opcional e separada da entrega do e-book. O material
            é enviado mesmo quando a pessoa não marca a opção de receber novos conteúdos.
            Quando há consentimento, registramos essa escolha e sua data e podemos sincronizar
            nome, e-mail e dados de origem com o Listmonk.
          </p>
          <p>
            A automação que lê o RSS do blog cria campanhas como rascunho no Listmonk; ela não
            envia campanhas automaticamente. O envio depende de uma ação posterior no sistema
            de newsletter.
          </p>
        </section>

        <section id="origem-utms">
          <h2>5. Página de origem, UTMs e sessionStorage</h2>
          <p>
            Podemos registrar a página do site em que a solicitação foi realizada e os
            parâmetros <code>utm_source</code>, <code>utm_medium</code>, <code>utm_campaign</code>,
            <code>utm_content</code> e <code>utm_term</code>. Eles ajudam a compreender a origem
            de campanhas e a efetividade dos canais de comunicação.
          </p>
          <p>
            As UTMs são temporariamente mantidas no <code>sessionStorage</code> do navegador
            durante a sessão para preservar a atribuição entre páginas. Esse armazenamento é
            local ao navegador e não equivale, por si só, a um cookie. Os parâmetros são
            enviados ao backend quando um formulário compatível é submetido.
          </p>
        </section>

        <section id="fornecedores">
          <h2>6. Fornecedores e compartilhamento</h2>
          <p>
            Não comercializamos dados pessoais. Compartilhamos informações somente quando
            necessário para operar o site, atender solicitações, enviar materiais, organizar
            contatos comerciais, realizar medições ou cumprir obrigações legais.
          </p>
          <ul>
            <li>
              <strong>Pipedrive:</strong> o diagnóstico pode ser sincronizado com o CRM para
              criar ou localizar organização, pessoa e oportunidade comercial. Conforme a
              configuração, podem ser enviados dados de contato, empresa, website, receita,
              tipo de projeto, origem e UTMs.
            </li>
            <li>
              <strong>Listmonk:</strong> operado em <a href="https://emails.algoritmux.com">emails.algoritmux.com</a>,
              recebe nome, e-mail, lista e atributos de origem somente quando existe a opção
              registrada para newsletter.
            </li>
            <li>
              <strong>Resend:</strong> processa os dados necessários para encaminhar o e-mail
              transacional do material solicitado.
            </li>
            <li>
              <strong>Prestadores técnicos:</strong> infraestrutura de hospedagem, banco de
              dados, segurança e suporte podem tratar dados na medida necessária à operação.
            </li>
          </ul>
          <p>
            Também poderemos compartilhar dados quando exigido por lei, ordem de autoridade
            competente ou para o exercício regular de direitos.
          </p>
        </section>

        <section id="analytics-cookies">
          <h2>7. Analytics, marketing, cookies e tecnologias similares</h2>
          <p>
            O site utiliza Google Tag Manager para gerenciar tecnologias de mensuração e
            marketing. O conjunto atualmente configurado inclui Google Analytics, Google Ads,
            Meta Pixel e Hotjar. Essas ferramentas podem tratar eventos de navegação,
            interações, páginas acessadas, informações do dispositivo, navegador, endereço IP
            e identificadores associados a cookies ou tecnologias similares, de acordo com a
            configuração e as regras de cada serviço.
          </p>
          <p>
            Cookies também podem ser usados para funções técnicas e sessões do backend. A
            disponibilidade, a finalidade e a duração exata dos cookies podem variar conforme
            a configuração das ferramentas. O navegador permite visualizar, bloquear ou
            excluir cookies, embora isso possa afetar alguns recursos.
          </p>
        </section>

        <section id="seguranca-retencao">
          <h2>8. Segurança e retenção</h2>
          <p>
            Adotamos medidas técnicas e administrativas compatíveis com os fluxos do site,
            incluindo validação de dados, limitação de requisições, armazenamento privado do
            e-book, links assinados e controles de acesso administrativo. Nenhum ambiente é
            totalmente imune a riscos, mas buscamos reduzir acessos, alterações, perdas e
            divulgações indevidas.
          </p>
          <p>
            Os dados são mantidos pelo período necessário para cumprir as finalidades
            informadas, obrigações legais, exercício regular de direitos e requisitos
            operacionais, observados os critérios internos aplicáveis. Após esse período,
            poderão ser eliminados ou anonimizados, salvo quando a manutenção for permitida ou
            exigida pela legislação.
          </p>
        </section>

        <section id="direitos">
          <h2>9. Direitos do titular</h2>
          <p>Nos termos da legislação aplicável, você pode solicitar, conforme o caso:</p>
          <ul>
            <li>confirmação da existência de tratamento e acesso aos dados;</li>
            <li>correção de dados incompletos, inexatos ou desatualizados;</li>
            <li>anonimização, bloqueio ou eliminação de dados desnecessários, excessivos ou tratados em desconformidade;</li>
            <li>portabilidade, quando aplicável e observada a regulamentação;</li>
            <li>informações sobre entidades com as quais houve compartilhamento;</li>
            <li>eliminação dos dados tratados com consentimento, ressalvadas as hipóteses legais de conservação;</li>
            <li>revogação do consentimento e informação sobre suas consequências;</li>
            <li>oposição a tratamentos realizados em desconformidade com a legislação.</li>
          </ul>
          <p>
            Consulte também nossa <Link to="/lgpd">página sobre a LGPD</Link> para uma
            explicação didática sobre esses direitos.
          </p>
        </section>

        <section id="contato">
          <h2>10. Solicitações, contato e atualizações</h2>
          <p>
            Para exercer direitos ou esclarecer dúvidas sobre privacidade, escreva para
            <a href="mailto:contato@algoritmux.com"> contato@algoritmux.com</a> com o
            assunto “Privacidade e LGPD”. Também é possível entrar em contato pelo telefone
            <a href="tel:+5514991267766"> +55 (14) 99126-7766</a>. Poderemos solicitar
            informações razoáveis para confirmar a identidade do solicitante e proteger os
            dados contra acesso indevido.
          </p>
          <p>
            Esta política poderá ser atualizada para refletir mudanças legais, técnicas ou
            operacionais. A versão vigente e a data da revisão permanecerão disponíveis nesta
            página.
          </p>
        </section>
      </LegalDocument>
    </>
  );
}
