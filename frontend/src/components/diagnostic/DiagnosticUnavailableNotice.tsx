import { Button } from '../common/Button';

export function DiagnosticUnavailableNotice({
  onClose,
  companyName,
}: {
  onClose: () => void;
  companyName: string;
}) {
  const openWhatsApp = () => {
    const message = `Olá! Acabei de solicitar meu diagnóstico de performance para a empresa ${companyName}. Gostaria de agendar a análise técnica de 15 minutos.`;
    window.open(
      `https://wa.me/5512992474969?text=${encodeURIComponent(message)}`,
      '_blank',
      'noopener,noreferrer',
    );
  };

  return (
    <div className="diagnostic-unavailable">
      <span className="diagnostic-unavailable__icon" aria-hidden="true">
        ✓
      </span>
      <p className="diagnostic-kicker">Etapa 3 de 3</p>
      <h2 id="diagnostic-title">Diagnóstico recebido</h2>
      <p className="diagnostic-unavailable__message">
        Obrigado! Nosso time receberá seus dados para preparar a próxima conversa.
      </p>
      <p>Se preferir, você já pode falar conosco pelo WhatsApp.</p>
      <div className="diagnostic-actions">
        <Button type="button" variant="ghost" onClick={onClose}>
          Fechar
        </Button>
        <Button type="button" onClick={openWhatsApp}>
          Conversar com nosso time
        </Button>
      </div>
    </div>
  );
}
