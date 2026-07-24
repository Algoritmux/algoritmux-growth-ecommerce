import {
  normalizeWebsite,
  type DiagnosticLeadFormValues,
} from '../components/diagnostic/diagnosticLeadSchema';

type ApiValidationErrors = Record<string, string[]>;

type DiagnosticLeadResponse = {
  data: {
    public_id: string;
    status: 'new';
  };
  message: string;
};

export class DiagnosticLeadApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly fieldErrors?: ApiValidationErrors,
  ) {
    super(message);
    this.name = 'DiagnosticLeadApiError';
  }
}

function getApiBaseUrl(): string {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '');

  if (!apiBaseUrl) {
    throw new DiagnosticLeadApiError(
      'A conexão com o diagnóstico não está configurada. Tente novamente mais tarde.',
    );
  }

  return apiBaseUrl;
}

export async function submitDiagnosticLead(
  values: DiagnosticLeadFormValues,
): Promise<DiagnosticLeadResponse> {
  const response = await fetch(`${getApiBaseUrl()}/api/v1/leads/diagnostic`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: values.name.trim(),
      whatsapp: values.whatsapp.replace(/\D/g, ''),
      email: values.email.trim().toLowerCase(),
      company_name: values.company_name.trim(),
      website: normalizeWebsite(values.website) || undefined,
      revenue_range: values.revenue_range,
      source_page: window.location.pathname,
    }),
  }).catch(() => {
    throw new DiagnosticLeadApiError(
      'Não foi possível conectar ao diagnóstico. Verifique sua conexão e tente novamente.',
    );
  });

  const body = (await response.json().catch(() => null)) as {
    message?: string;
    errors?: ApiValidationErrors;
  } | null;

  if (response.status === 422) {
    throw new DiagnosticLeadApiError(
      body?.message ?? 'Revise os campos informados e tente novamente.',
      response.status,
      body?.errors,
    );
  }

  if (!response.ok) {
    throw new DiagnosticLeadApiError(
      'Não foi possível enviar seu diagnóstico agora. Tente novamente em alguns instantes.',
      response.status,
    );
  }

  return body as DiagnosticLeadResponse;
}
