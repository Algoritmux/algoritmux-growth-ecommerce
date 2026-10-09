import { Link } from 'react-router-dom';
import { PageMetadata } from '../components/common/PageMetadata';
import {
  LegalDocument,
  type LegalSummaryItem,
} from '../components/legal/LegalDocument';

const summary: LegalSummaryItem[] = [
  { id: 'aceitacao', label: 'Aceitação e identificação' },
  { id: 'conteudo', label: 'Site, blog e conteúdo' },
  { id: 'formularios', label: 'Formulários e diagnóstico' },
  { id: 'materiais', label: 'Materiais gratuitos' },
  { id: 'uso-permitido', label: 'Uso permitido' },
  { id: 'propriedade-intelectual', label: 'Propriedade intelectual' },
  { id: 'terceiros', label: 'Serviços de terceiros' },
  { id: 'disponibilidade', label: 'Disponibilidade e responsabilidade' },
  { id: 'privacidade', label: 'Privacidade e alterações' },
  { id: 'legislacao-contato', label: 'Legislação e contato' },
];

export function TermsOfUsePage() {
  return (
    <>
      <PageMetadata
        title="Termos de Uso | Algoritmux"
        description="Conheça as condições de acesso e uso do site, blog, formulários e materiais gratuitos da Algoritmux."
        canonical="/termos-de-uso"
        robots="index, follow"
      />

      <LegalDocument
        eyebrow="Condições de uso"
        title="Termos de Uso"
        description="Estes termos apresentam as regras para acesso ao site, aos conteúdos e aos recursos digitais disponibilizados pela Algoritmux."
        updatedAt="9 de outubro de 2026"
        summary={summary}
      >
        <section id="aceitacao">
          <h2>1. Aceitação, escopo e identificação</h2>
          <p>
            Ao acessar ou utilizar este site, você declara ter lido e compreendido estes
            Termos de Uso. Caso não concorde com suas condições, recomendamos interromper a
            navegação e não utilizar os formulários ou materiais disponibilizados.
          </p>
          <p>
            O site é operado por <strong>ALGORITMUX LTDA.</strong>, nome fantasia
            <strong> ALGORITMUX</strong>, CNPJ 42.324.675/0001-36, sociedade empresária
            limitada de porte ME, com sede na Avenida Getúlio Vargas, 21-51, Jardim Europa,
            Bauru/SP, CEP 17017-383, cuja atividade principal é a prestação de serviços como
            agência de publicidade.
          </p>
        </section>

        <section id="conteudo">
          <h2>2. Natureza institucional, blog e conteúdo editorial</h2>
          <p>
            O site apresenta a Algoritmux, sua metodologia, equipe, serviços, cases e
            conteúdos sobre marketing, vendas, tecnologia, dados, design e temas relacionados.
            O blog tem finalidade informativa e educacional e pode ser atualizado, corrigido
            ou removido a qualquer momento.
          </p>
          <p>
            Conteúdos gerais não constituem consultoria individual, proposta comercial,
            promessa de desempenho ou garantia de resultados. Decisões de negócio devem
            considerar o contexto específico, informações completas e, quando necessário,
            orientação profissional apropriada.
          </p>
        </section>

        <section id="formularios">
          <h2>3. Formulários e diagnóstico</h2>
          <p>
            Ao enviar um formulário, o usuário deve fornecer informações verdadeiras,
            atualizadas e pertinentes à finalidade indicada. A solicitação de diagnóstico
            permite que a Algoritmux conheça o contexto informado e avalie um possível
            atendimento comercial.
          </p>
          <p>
            O envio não cria obrigação de contratação, exclusividade, resposta imediata ou
            apresentação de proposta. Uma eventual prestação de serviços dependerá de análise,
            disponibilidade e instrumento contratual próprio.
          </p>
        </section>

        <section id="materiais">
          <h2>4. Materiais gratuitos e e-book</h2>
          <p>
            Materiais gratuitos são disponibilizados para uso pessoal, informativo e não
            exclusivo. A entrega do e-book ocorre por link pessoal e assinado, enviado ao
            e-mail informado e válido por sete dias. O usuário não deve compartilhar o link,
            tentar contornar sua expiração ou explorar o mecanismo de download de forma
            abusiva.
          </p>
          <p>
            A inscrição na newsletter é opcional e não é condição para receber o e-book.
            Salvo autorização expressa, o recebimento de um material não concede direito de
            revenda, redistribuição, alteração ou uso comercial do conteúdo.
          </p>
        </section>

        <section id="uso-permitido">
          <h2>5. Uso permitido e condutas proibidas</h2>
          <p>O usuário deve utilizar o site de forma lícita e respeitosa. É proibido:</p>
          <ul>
            <li>violar a legislação ou direitos da Algoritmux e de terceiros;</li>
            <li>enviar dados falsos, fraudulentos ou pertencentes a terceiros sem autorização;</li>
            <li>introduzir malware, explorar vulnerabilidades ou interferir no funcionamento do site;</li>
            <li>tentar acessar áreas, contas, sistemas ou dados sem autorização;</li>
            <li>realizar scraping, varredura ou automação em volume que prejudique o serviço ou contorne controles técnicos;</li>
            <li>copiar, republicar ou explorar comercialmente conteúdo sem permissão;</li>
            <li>usar os canais para spam, assédio ou finalidade incompatível com sua proposta.</li>
          </ul>
          <p>
            A Algoritmux pode adotar medidas razoáveis de proteção, limitar requisições e
            restringir acessos abusivos, preservadas as medidas legais cabíveis.
          </p>
        </section>

        <section id="propriedade-intelectual">
          <h2>6. Propriedade intelectual</h2>
          <p>
            Marcas, nomes, logotipos, identidade visual, textos, imagens, vídeos, layouts,
            códigos, métodos, materiais e demais elementos do site pertencem à Algoritmux ou
            aos respectivos licenciantes, salvo indicação em contrário. O acesso ao site não
            transfere direitos de propriedade intelectual ao usuário.
          </p>
          <p>
            Citações e usos permitidos por lei devem preservar autoria, integridade e fonte.
            Qualquer outro uso depende de autorização prévia e expressa do titular aplicável.
          </p>
        </section>

        <section id="terceiros">
          <h2>7. Links, integrações e serviços de terceiros</h2>
          <p>
            O site pode conter links para redes sociais, WhatsApp e outros ambientes externos,
            além de integrações necessárias ao funcionamento de formulários, analytics,
            marketing, CRM, newsletter e e-mail. Esses terceiros mantêm seus próprios termos,
            políticas e práticas, que devem ser consultados pelo usuário.
          </p>
          <p>
            A existência de um link não representa endosso irrestrito, controle ou
            responsabilidade da Algoritmux sobre o conteúdo, a disponibilidade ou as práticas
            do destino externo.
          </p>
        </section>

        <section id="disponibilidade">
          <h2>8. Disponibilidade, alterações e responsabilidade</h2>
          <p>
            Empregamos esforços razoáveis para manter o site seguro, atualizado e disponível,
            mas podem ocorrer interrupções, manutenção, falhas de rede, indisponibilidade de
            fornecedores, erros ou eventos fora de nosso controle. Recursos e conteúdos podem
            ser alterados, suspensos ou descontinuados.
          </p>
          <p>
            A Algoritmux não garante aumento de receita, conversão, vendas ou qualquer resultado
            comercial decorrente da leitura do conteúdo ou do simples uso do site. Dentro dos
            limites da legislação aplicável, não nos responsabilizamos por decisões tomadas
            exclusivamente com base em conteúdo geral, por uso indevido do site ou por serviços
            externos fora de nosso controle.
          </p>
          <p>
            Estes termos não excluem nem limitam responsabilidades que não possam ser afastadas
            por lei.
          </p>
        </section>

        <section id="privacidade">
          <h2>9. Privacidade e alterações destes termos</h2>
          <p>
            O tratamento de dados pessoais relacionado ao site é explicado na
            <Link to="/politica-de-privacidade"> Política de Privacidade</Link> e na
            <Link to="/lgpd"> página LGPD</Link>, que integram a experiência de uso dos canais
            digitais da Algoritmux.
          </p>
          <p>
            Estes termos podem ser atualizados para acompanhar mudanças no site, nas operações
            ou na legislação. A data da versão vigente ficará indicada no início da página.
          </p>
        </section>

        <section id="legislacao-contato">
          <h2>10. Legislação aplicável e contato</h2>
          <p>
            Estes termos são regidos pela legislação da República Federativa do Brasil, sem
            prejuízo de normas obrigatórias aplicáveis ao usuário e às relações de consumo.
          </p>
          <p>
            Dúvidas podem ser encaminhadas para
            <a href="mailto:contato@algoritmux.com"> contato@algoritmux.com</a> ou pelo
            telefone <a href="tel:+5514991267766">+55 (14) 99126-7766</a>.
          </p>
        </section>
      </LegalDocument>
    </>
  );
}
