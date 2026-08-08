import { z } from 'zod';

export const revenueRangeValues = [
  'up_to_50000',
  '50001_75000',
  '75001_150000',
  '150001_250000',
  '250001_500000',
  'above_500000',
] as const;

export function normalizeWhatsApp(value: string): string {
  return value.replace(/\D/g, '');
}

export function formatBrazilianWhatsApp(value: string): string {
  const rawValue = value.trim();

  if (rawValue === '+' || rawValue === '+5') return rawValue;

  const allDigits = normalizeWhatsApp(value);
  const hasCountryCode = rawValue.startsWith('+55')
    || (allDigits.startsWith('55') && allDigits.length > 11);
  const digits = allDigits
    .slice(hasCountryCode ? 2 : 0, hasCountryCode ? 13 : 11);
  const prefix = hasCountryCode ? '+55 ' : '';

  if (!digits) return hasCountryCode ? '+55' : '';
  if (digits.length <= 2) return `${prefix}(${digits}`;

  const areaCode = digits.slice(0, 2);
  const phone = digits.slice(2);

  if (phone.length <= 4) return `${prefix}(${areaCode}) ${phone}`;

  const firstBlockLength = phone.length > 8 ? 5 : 4;

  return `${prefix}(${areaCode}) ${phone.slice(0, firstBlockLength)}-${phone.slice(firstBlockLength)}`;
}

const optionalEmailSchema = z
  .string()
  .trim()
  .max(254)
  .refine(
    (value) => value === '' || z.string().email().safeParse(value).success,
    'Informe um e-mail válido.',
  );

export const diagnosticLeadSchema = z.object({
  name: z.string().trim().min(2, 'Informe seu nome.').max(255),
  whatsapp: z
    .string()
    .trim()
    .max(25)
    .refine((value) => {
      const digits = normalizeWhatsApp(value);

      return digits === '' || /^(?:55)?\d{10,11}$/.test(digits);
    }, 'Informe um WhatsApp válido.'),
  email: optionalEmailSchema,
  company_name: z.string().trim().max(255),
  revenue_range: z.union([z.enum(revenueRangeValues), z.literal('')]),
});

export type DiagnosticLeadFormValues = z.infer<typeof diagnosticLeadSchema>;
