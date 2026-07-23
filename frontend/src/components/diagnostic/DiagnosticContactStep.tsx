import { Controller, useFormContext } from 'react-hook-form';
import { Button } from '../common/Button';
import {
  formatBrazilianWhatsApp,
  type DiagnosticLeadFormValues,
} from './diagnosticLeadSchema';

type Props = {
  onBack: () => void;
  isSubmitting: boolean;
};

export function DiagnosticContactStep({ onBack, isSubmitting }: Props) {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<DiagnosticLeadFormValues>();

  return (
    <div>
      <p className="diagnostic-kicker">Etapa 2 de 3</p>
      <h2 id="diagnostic-title">Configurações de contato</h2>
      <p>Usaremos estes dados para preparar o próximo passo da sua análise.</p>
      <label>
        Seu nome
        <input
          {...register('name')}
          type="text"
          placeholder="Como podemos chamar você?"
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? 'name-error' : undefined}
        />
      </label>
      {errors.name ? (
        <p id="name-error" className="diagnostic-form__error" role="alert">
          {errors.name.message}
        </p>
      ) : null}
      <label>
        WhatsApp
        <Controller
          control={control}
          name="whatsapp"
          render={({ field }) => (
            <input
              {...field}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              maxLength={16}
              placeholder="(21) 99999-4070"
              onChange={(event) => field.onChange(formatBrazilianWhatsApp(event.target.value))}
              aria-invalid={Boolean(errors.whatsapp)}
              aria-describedby={errors.whatsapp ? 'whatsapp-error' : undefined}
            />
          )}
        />
      </label>
      {errors.whatsapp ? (
        <p id="whatsapp-error" className="diagnostic-form__error" role="alert">
          {errors.whatsapp.message}
        </p>
      ) : null}
      <label>
        E-mail corporativo
        <input
          {...register('email')}
          type="email"
          placeholder="voce@empresa.com"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
      </label>
      {errors.email ? (
        <p id="email-error" className="diagnostic-form__error" role="alert">
          {errors.email.message}
        </p>
      ) : null}
      <div className="diagnostic-actions">
        <Button type="button" variant="ghost" onClick={onBack} disabled={isSubmitting}>
          Voltar
        </Button>
        <Button type="submit" arrow loading={isSubmitting}>
          Enviar diagnóstico
        </Button>
      </div>
    </div>
  );
}
