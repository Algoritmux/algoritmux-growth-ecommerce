import { z } from 'zod';

export const revenueRangeValues = [
  'up_to_50000',
  '50001_75000',
  '75001_150000',
  '150001_250000',
  '250001_500000',
  'above_500000',
] as const;

export function normalizeWebsite(value: string): string {
  const website = value.trim();

  if (!website || /^[a-z][a-z\d+.-]*:/i.test(website)) {
    return website;
  }

  return `https://${website}`;
}

export function isValidWebsite(value: string): boolean {
  if (!value) return true;

  let url: URL;

  try {
    url = new URL(value);
  } catch {
    return false;
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;

  const hostname = url.hostname.toLowerCase();

  if (!hostname || hostname === 'localhost' || /^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname)) {
    return false;
  }

  const labels = hostname.split('.');

  return labels.length >= 2
    && labels.at(-1)!.length >= 2
    && labels.every((label) => /^[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?$/i.test(label));
}

export function formatBrazilianWhatsApp(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);

  if (!digits) return '';
  if (digits.length <= 2) return `(${digits}`;

  const areaCode = digits.slice(0, 2);
  const phone = digits.slice(2);

  if (phone.length <= 5) return `(${areaCode}) ${phone}`;

  return `(${areaCode}) ${phone.slice(0, 5)}-${phone.slice(5)}`;
}

export const diagnosticLeadSchema = z.object({
  name: z.string().trim().min(2, 'Informe seu nome.').max(255),
  whatsapp: z
    .string()
    .regex(/^\(\d{2}\) 9\d{4}-\d{4}$/, 'Informe um WhatsApp válido.'),
  email: z.string().trim().email('Informe um e-mail válido.').max(254),
  company_name: z.string().trim().min(2, 'Informe o nome da empresa.').max(255),
  website: z
    .string()
    .max(255)
    .transform(normalizeWebsite)
    .refine(isValidWebsite, 'Informe um site válido.'),
  revenue_range: z.enum(revenueRangeValues, {
    error: 'Selecione a faixa de faturamento mensal.',
  }),
});

export type DiagnosticLeadFormValues = z.infer<typeof diagnosticLeadSchema>;
