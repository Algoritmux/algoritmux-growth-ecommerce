import { z } from 'zod';

export const leadMagnetSchema = z.object({
  name: z.string().trim().min(2, 'Informe seu nome.').max(255),
  email: z
    .string()
    .trim()
    .min(1, 'Informe seu e-mail.')
    .max(254)
    .email('Informe um e-mail válido.'),
  newsletter_consent: z.boolean(),
  company_website: z.string().max(0).optional(),
});

export type LeadMagnetFormValues = z.infer<typeof leadMagnetSchema>;
