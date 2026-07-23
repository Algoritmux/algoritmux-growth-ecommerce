import { z } from 'zod';

export const revenueRangeValues = [
  '1000_50000',
  '50001_200000',
  '200001_500000',
  'above_500000',
] as const;

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
  website: z.union([
    z.literal(''),
    z.string().trim().url('Informe uma URL válida.').max(255),
  ]),
  revenue_range: z.enum(revenueRangeValues, {
    error: 'Selecione a faixa de faturamento mensal.',
  }),
});

export type DiagnosticLeadFormValues = z.infer<typeof diagnosticLeadSchema>;
