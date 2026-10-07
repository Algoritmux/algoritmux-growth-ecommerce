import type { LeadMagnetFormValues } from '../components/lead-magnet/leadMagnetSchema';
import { getUtmPayload } from './utmService';

type ApiValidationErrors = Record<string, string[]>;

export type LeadMagnetResponse = {
  data: {
    public_id: string;
    email_status: 'sent';
  };
  message: string;
};

export class LeadMagnetApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly fieldErrors?: ApiValidationErrors,
  ) {
    super(message);
    this.name = 'LeadMagnetApiError';
  }
}

function getApiBaseUrl(): string {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '');

  if (!apiBaseUrl) {
    throw new LeadMagnetApiError(
      'A entrega do e-book não está configurada. Tente novamente mais tarde.',
    );
  }

  return apiBaseUrl;
}

export async function submitLeadMagnet(
  values: LeadMagnetFormValues,
  leadMagnet: string,
): Promise<LeadMagnetResponse> {
  const response = await fetch(`${getApiBaseUrl()}/api/v1/leads/lead-magnet`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: values.name.trim(),
      email: values.email.trim().toLowerCase(),
      lead_magnet: leadMagnet,
      newsletter_consent: values.newsletter_consent,
      company_website: values.company_website ?? '',
      source_page: window.location.pathname,
      ...getUtmPayload(),
    }),
  }).catch(() => {
    throw new LeadMagnetApiError(
      'Não foi possível conectar ao serviço. Verifique sua conexão e tente novamente.',
    );
  });

  const body = (await response.json().catch(() => null)) as {
    message?: string;
    errors?: ApiValidationErrors;
  } | null;

  if (response.status === 422) {
    throw new LeadMagnetApiError(
      body?.message ?? 'Revise os campos informados e tente novamente.',
      response.status,
      body?.errors,
    );
  }

  if (response.status === 429) {
    throw new LeadMagnetApiError(
      'Você já solicitou este material recentemente. Aguarde alguns minutos e tente novamente.',
      response.status,
    );
  }

  if (!response.ok) {
    throw new LeadMagnetApiError(
      body?.message ?? 'Não foi possível enviar o e-book agora. Tente novamente em alguns instantes.',
      response.status,
    );
  }

  return body as LeadMagnetResponse;
}
