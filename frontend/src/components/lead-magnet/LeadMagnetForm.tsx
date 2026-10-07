import { zodResolver } from '@hookform/resolvers/zod';
import { useId } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../common/Button';
import {
  leadMagnetSchema,
  type LeadMagnetFormValues,
} from './leadMagnetSchema';

type LeadMagnetFormProps = {
  isSubmitting: boolean;
  onSubmit: (values: LeadMagnetFormValues) => Promise<void>;
};

export function LeadMagnetForm({ isSubmitting, onSubmit }: LeadMagnetFormProps) {
  const fieldId = useId();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LeadMagnetFormValues>({
    resolver: zodResolver(leadMagnetSchema),
    defaultValues: {
      name: '',
      email: '',
      newsletter_consent: false,
      company_website: '',
    },
  });

  return (
    <form
      className="lead-magnet-form"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      aria-label="Receber e-book gratuito"
    >
      <div className="lead-magnet-form__fields">
        <div className="lead-magnet-form__field">
          <label htmlFor={`${fieldId}-name`}>Nome</label>
          <input
            {...register('name')}
            id={`${fieldId}-name`}
            type="text"
            autoComplete="name"
            placeholder="Como podemos chamar você?"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? `${fieldId}-name-error` : undefined}
          />
          {errors.name ? (
            <span id={`${fieldId}-name-error`} role="alert">
              {errors.name.message}
            </span>
          ) : null}
        </div>

        <div className="lead-magnet-form__field">
          <label htmlFor={`${fieldId}-email`}>E-mail</label>
          <input
            {...register('email')}
            id={`${fieldId}-email`}
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            placeholder="voce@email.com"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? `${fieldId}-email-error` : undefined}
          />
          {errors.email ? (
            <span id={`${fieldId}-email-error`} role="alert">
              {errors.email.message}
            </span>
          ) : null}
        </div>
      </div>

      <div className="lead-magnet-form__honeypot" aria-hidden="true">
        <label htmlFor={`${fieldId}-company-website`}>Site da empresa</label>
        <input
          {...register('company_website')}
          id={`${fieldId}-company-website`}
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <label className="lead-magnet-form__consent">
        <input {...register('newsletter_consent')} type="checkbox" />
        <span>
          Quero receber novos conteúdos e insights da Algoritmux por e-mail.
          A entrega do e-book não depende desta opção.
        </span>
      </label>

      <Button type="submit" size="lg" arrow loading={isSubmitting}>
        Receber e-book gratuito
      </Button>
    </form>
  );
}
