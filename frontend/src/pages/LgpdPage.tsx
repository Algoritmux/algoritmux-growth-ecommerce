import { Link } from 'react-router-dom';
import { PageMetadata } from '../components/common/PageMetadata';
import {
  LegalDocument,
  type LegalSummaryItem,
} from '../components/legal/LegalDocument';

const summary: LegalSummaryItem[] = [
  { id: 'compromisso', label: 'Nosso compromisso' },
  { id: 'papeis', label: 'Titular e controlador' },
  { id: 'direitos', label: 'Direitos previstos na LGPD' },
  { id: 'consentimento-oposicao', label: 'Consentimento e oposição' },
  { id: 'limites', label: 'Limites à eliminação' },
  { id: 'solicitacao', label: 'Como solicitar' },
  { id: 'anpd', label: 'Reclamação à ANPD' },
];

export function LgpdPage() {
  return (
    <>
      <PageMetadata
        title="LGPD e Direitos do Titular | Algoritmux"
        description="Saiba quais são seus direitos previstos na LGPD e como solicitar acesso, correção, exclusão ou informações à Algoritmux."
        canonical="/lgpd"
        robots="index, follow"
      />

      <LegalDocument
        eyebrow="Lei Geral de Proteção de Dados"
        title="LGPD e seus direitos"
        description="Conheça seus direitos sobre dados pessoais e saiba como encaminhar uma solicitação à Algoritmux."
        updatedAt="9 de outubro de 2026"
        summary={summary}
      >
        <section id="compromisso">
          <h2>1. Nosso compromisso com a proteção de dados</h2>
          <p>
            A Algoritmux busca tratar dados pessoais com finalidade, necessidade,
            transparência, segurança e respeito aos direitos das pessoas. Esta página resume
            os principais direitos previstos na Lei nº 13.709/2018, a Lei Geral de Proteção de
            Dados Pessoais — LGPD.
          </p>
          <p>
            Os detalhes sobre dados, finalidades, tecnologias e fornecedores estão na nossa
            <Link to="/politica-de-privacidade"> Política de Privacidade</Link>.
          </p>
        </section>

        <section id="papeis">
          <h2>2. Quem é o titular e quem é o controlador</h2>
          <p>
            <strong>Titular</strong> é a pessoa natural a quem os dados pessoais se referem.
            Por exemplo, a pessoa que preenche o diagnóstico, solicita o e-book ou se inscreve
            na newsletter.
          </p>
          <p>
            <strong>Controlador</strong> é quem toma as principais decisões sobre o tratamento.
            Nos fluxos descritos neste site, o controlador é a <strong>ALGORITMUX LTDA.</strong>,
            CNPJ 42.324.675/0001-36, com sede na Avenida Getúlio Vargas, 21-51, Jardim Europa,
            Bauru/SP, CEP 17017-383.
          </p>
        </section>

        <section id="direitos">
          <h2>3. Seus direitos previstos na LGPD</h2>
          <div className="legal-rights-grid">
            <div>
              <h3>Confirmação e acesso</h3>
              <p>Solicitar confirmação de que tratamos seus dados e, quando for o caso, acesso a eles.</p>
            </div>
            <div>
              <h3>Correção</h3>
              <p>Pedir a atualização ou correção de informações incompletas, inexatas ou desatualizadas.</p>
            </div>
            <div>
              <h3>Anonimização, bloqueio ou exclusão</h3>
              <p>Solicitar essas medidas para dados desnecessários, excessivos ou tratados em desconformidade, quando aplicável.</p>
            </div>
            <div>
              <h3>Portabilidade</h3>
              <p>Solicitar a portabilidade a outro fornecedor, quando aplicável e observadas as regras da autoridade competente.</p>
            </div>
            <div>
              <h3>Informações sobre compartilhamento</h3>
              <p>Saber com quais entidades públicas e privadas houve uso compartilhado de seus dados.</p>
            </div>
            <div>
              <h3>Decisões automatizadas</h3>
              <p>Solicitar informações e revisão quando uma decisão que afete seus interesses for tomada unicamente por tratamento automatizado, se houver.</p>
            </div>
          </div>
        </section>

        <section id="consentimento-oposicao">
          <h2>4. Consentimento, revogação e oposição</h2>
          <p>
            Quando o tratamento depender de consentimento, você pode revogá-lo por procedimento
            gratuito e facilitado. Na newsletter, a opção de receber conteúdos é separada da
            entrega do e-book. A revogação não invalida tratamentos realizados anteriormente
            de forma legítima.
          </p>
          <p>
            Você também pode se opor a um tratamento que considere realizado em desconformidade
            com a LGPD. Explique o contexto em sua solicitação para que possamos avaliar a
            operação e responder de forma adequada.
          </p>
        </section>

        <section id="limites">
          <h2>5. Quando a eliminação pode ser limitada</h2>
          <p>
            O direito à eliminação não é absoluto. Alguns dados podem ser conservados para
            cumprimento de obrigação legal ou regulatória, estudo por órgão de pesquisa,
            transferência permitida pela legislação, uso exclusivo do controlador com
            anonimização, exercício regular de direitos, prevenção de fraude ou outras
            hipóteses legalmente admitidas.
          </p>
          <p>
            Quando não for possível atender integralmente ao pedido, informaremos a justificativa
            aplicável. Sempre que viável, restringiremos o tratamento ao necessário para a
            finalidade de conservação.
          </p>
        </section>

        <section id="solicitacao">
          <h2>6. Como exercer seus direitos</h2>
          <p>
            Envie sua solicitação para
            <a href="mailto:contato@algoritmux.com"> contato@algoritmux.com</a> com o
            assunto “Privacidade e LGPD”. Se preferir, use o telefone
            <a href="tel:+5514982073282"> +55 14 98207-3282</a> para receber orientação
            sobre o canal de atendimento.
          </p>
          <p>Para facilitar a análise, informe:</p>
          <ul>
            <li>seu nome e um meio seguro para retorno;</li>
            <li>qual direito deseja exercer;</li>
            <li>em qual formulário, material ou interação os dados foram fornecidos;</li>
            <li>informações adicionais necessárias para localizar o registro.</li>
          </ul>
          <p>
            Poderemos solicitar informações ou documentos proporcionais para verificar a
            identidade e impedir que terceiros obtenham acesso indevido. Não é necessário
            enviar documentos sensíveis no primeiro contato. O pedido será analisado conforme
            sua natureza, a legislação aplicável e a segurança do titular.
          </p>
          <aside className="legal-callout" aria-label="Canal institucional de privacidade">
            <strong>Canal institucional atual</strong>
            <span>contato@algoritmux.com</span>
            <p>
              A Algoritmux não declara nesta página a existência de um encarregado formalmente
              indicado. O canal acima recebe solicitações de titulares e dúvidas de privacidade.
            </p>
          </aside>
        </section>

        <section id="anpd">
          <h2>7. Reclamação ou petição à ANPD</h2>
          <p>
            Caso entenda que uma solicitação não foi tratada adequadamente, você pode buscar os
            órgãos de defesa do consumidor, quando aplicável, e apresentar petição ou reclamação
            à Autoridade Nacional de Proteção de Dados — ANPD, observados os procedimentos
            disponibilizados pela autoridade em seu site oficial.
          </p>
          <p>
            Recomendamos primeiro entrar em contato conosco para que possamos compreender o caso
            e buscar uma solução direta.
          </p>
        </section>
      </LegalDocument>
    </>
  );
}
