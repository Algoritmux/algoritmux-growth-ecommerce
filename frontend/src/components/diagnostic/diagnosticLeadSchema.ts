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

const freeEmailDomains = new Set([
  // Google / Microsoft / Yahoo / Apple
  'gmail.com', 'gmail.com.br', 'googlemail.com',
  'hotmail.com', 'hotmail.com.br', 'outlook.com', 'outlook.com.br',
  'live.com', 'live.com.br', 'msn.com',
  'yahoo.com', 'yahoo.com.br', 'ymail.com',
  'icloud.com', 'me.com', 'mac.com',
  'aol.com',

  // Nacionais (BR)
  'bol.com.br', 'uol.com.br', 'terra.com.br', 'ig.com.br',
  'r7.com', 'zipmail.com.br', 'globo.com', 'globomail.com', 'oi.com.br',

  // Privacidade / Outros Globais
  'proton.me', 'protonmail.com', 'tutanota.com', 'tuta.io',
  'gmx.com', 'gmx.net', 'zoho.com', 'yandex.com', 'mail.com',

  // E-mails Descartáveis / Temp Mail
  'mailinator.com', '10minutemail.com', 'tempmail.com', 
  'guerrillamail.com', 'throwawaymail.com', 'dispostable.com',

  // Typos comuns (evita que e-mail errado passe como corporativo)
  'gmial.com', 'gamil.com', 'gmaill.com', 'hotmial.com', 'hotmai.com', 'outlok.com',

  // Testes / Placeholders
  'empresa.com', 'empresa.com.br', 'suaempresa.com', 'suaempresa.com.br', 'teste.com'
]);

const corporateEmailSchema = z
  .string()
  .trim()
  .min(1, 'Informe seu e-mail corporativo.')
  .max(254)
  .email('Informe um e-mail válido.')
  .refine(
    (value) => {
      const domain = value.split('@')[1]?.toLowerCase();
      return domain !== undefined && !freeEmailDomains.has(domain);
    },
    'Utilize um e-mail corporativo.',
  );

export const diagnosticLeadSchema = z.object({
  name: z.string().trim().min(2, 'Informe seu nome.').max(255),
  whatsapp: z
    .string()
    .trim()
    .min(1, 'Informe seu WhatsApp.')
    .max(25)
    .refine((value) => {
      const digits = normalizeWhatsApp(value);

      return /^(?:55)?\d{10,11}$/.test(digits);
    }, 'Informe um WhatsApp válido.'),
  email: corporateEmailSchema,
  company_name: z.string().trim().max(255),
  revenue_range: z.union([z.enum(revenueRangeValues), z.literal('')]),
});

export type DiagnosticLeadFormValues = z.infer<typeof diagnosticLeadSchema>;
