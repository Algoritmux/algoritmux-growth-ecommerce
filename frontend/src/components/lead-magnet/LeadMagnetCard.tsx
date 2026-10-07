import { useState } from 'react';
import {
  LeadMagnetApiError,
  submitLeadMagnet,
} from '../../services/leadMagnetService';
import { LeadMagnetForm } from './LeadMagnetForm';
import type { LeadMagnetFormValues } from './leadMagnetSchema';

type LeadMagnetCardProps = {
  variant?: 'blog' | 'sidebar' | 'inline';
};

type SubmissionState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success' }
  | { status: 'error'; message: string };

const leadMagnet = 'growth-ecommerce-playbook';

const copyByVariant = {
  blog: {
    title: 'O guia para transformar Growth em crescimento previsível',
    description:
      'Descubra como estruturar aquisição, conversão e retenção para escalar seu negócio com método — sem depender de ações isoladas.',
  },
  sidebar: {
    title: 'Leve o guia completo com você',
    description:
      'Um passo a passo prático para aplicar Growth Marketing no seu negócio.',
  },
  inline: {
    title: 'Aprofunde o que você está lendo',
    description:
      'Baixe o guia completo e transforme os insights deste artigo em um plano de crescimento.',
  },
} as const;

export function LeadMagnetCard({ variant = 'blog' }: LeadMagnetCardProps) {
  const [submission, setSubmission] = useState<SubmissionState>({ status: 'idle' });
  const copy = copyByVariant[variant];

  async function handleSubmit(values: LeadMagnetFormValues) {
    setSubmission({ status: 'loading' });

    try {
      await submitLeadMagnet(values, leadMagnet);
      setSubmission({ status: 'success' });
    } catch (error) {
      setSubmission({
        status: 'error',
        message:
          error instanceof LeadMagnetApiError
            ? error.message
            : 'Não foi possível enviar o e-book agora. Tente novamente.',
      });
    }
  }

  return (
    <aside
      className={`lead-magnet-card lead-magnet-card--${variant}`}
      aria-labelledby={`lead-magnet-title-${variant}`}
    >
      <div className="lead-magnet-card__visual">
        <span className="lead-magnet-card__glow" aria-hidden="true" />
        <img
          src="/images/layout/capa.png"
          alt="Capa do e-book Guia definitivo do Growth Marketing"
          width="1055"
          height="1491"
          loading={variant === 'blog' ? 'eager' : 'lazy'}
        />
      </div>

      <div className="lead-magnet-card__content">
        <span className="lead-magnet-card__badge">E-book gratuito</span>
        <h2 id={`lead-magnet-title-${variant}`}>{copy.title}</h2>
        <p>{copy.description}</p>

        {submission.status === 'success' ? (
          <div className="lead-magnet-card__success" role="status" aria-live="polite">
            <strong>O e-book está a caminho.</strong>
            <span>Confira sua caixa de entrada e também a pasta de spam.</span>
          </div>
        ) : (
          <>
            <LeadMagnetForm
              isSubmitting={submission.status === 'loading'}
              onSubmit={handleSubmit}
            />
            {submission.status === 'error' ? (
              <p className="lead-magnet-card__error" role="alert">
                {submission.message}
              </p>
            ) : null}
          </>
        )}
      </div>
    </aside>
  );
}
