import { Controller, useFormContext } from 'react-hook-form';
import { Button } from '../common/Button';
import {
  formatBrazilianWhatsApp,
  type DiagnosticLeadFormValues,
} from './diagnosticLeadSchema';

export function DiagnosticLeadForm({ isSubmitting }: { isSubmitting: boolean }) {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<DiagnosticLeadFormValues>();

  return (
    <div>
      <h2 id="diagnostic-title">Diagnóstico de performance</h2>
      <p>Conte um pouco sobre você e sua operação atual.</p>

      <div className="diagnostic-form__fields">
        <div className="diagnostic-form__field">
          <label htmlFor="diagnostic-name">
            Nome *
            <input
              {...register('name')}
              id="diagnostic-name"
              type="text"
              autoComplete="name"
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
        </div>

        <div className="diagnostic-form__field">
          <label htmlFor="diagnostic-whatsapp">
            WhatsApp *
            <Controller
              control={control}
              name="whatsapp"
              render={({ field }) => (
                <input
                  {...field}
                  id="diagnostic-whatsapp"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  maxLength={19}
                  placeholder="(18) 99999-9999"
                  onChange={(event) =>
                    field.onChange(formatBrazilianWhatsApp(event.target.value))
                  }
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
        </div>

        <div className="diagnostic-form__field">
          <label htmlFor="diagnostic-company-name">
            Nome da empresa
            <input
              {...register('company_name')}
              id="diagnostic-company-name"
              type="text"
              autoComplete="organization"
              placeholder="Ex: TecnoCorp S/A"
              aria-invalid={Boolean(errors.company_name)}
              aria-describedby={errors.company_name ? 'company-name-error' : undefined}
            />
          </label>
          {errors.company_name ? (
            <p
              id="company-name-error"
              className="diagnostic-form__error"
              role="alert"
            >
              {errors.company_name.message}
            </p>
          ) : null}
        </div>

        <div className="diagnostic-form__field">
          <label htmlFor="diagnostic-email">
            E-mail corporativo * 
            <input
              {...register('email')}
              id="diagnostic-email"
              type="email"
              autoComplete="email"
              inputMode="email"
              autoCapitalize="none"
              placeholder="voce@suaempresa.com.br"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
          </label>
          {errors.email ? (
            <p id="email-error" className="diagnostic-form__error" role="alert">
              {errors.email.message}
            </p>
          ) : null}
        </div>

        <div className="diagnostic-form__field diagnostic-form__field--wide">
          <label htmlFor="diagnostic-revenue-range">
            Faturamento mensal
            <select
              {...register('revenue_range')}
              id="diagnostic-revenue-range"
              aria-invalid={Boolean(errors.revenue_range)}
              aria-describedby={
                errors.revenue_range ? 'revenue-range-error' : undefined
              }
            >
              <option value="">Selecione uma opção</option>
              <option value="up_to_50000">Até R$ 50.000,00</option>
              <option value="50001_75000">R$ 50.001,00 até R$ 75.000,00</option>
              <option value="75001_150000">R$ 75.001,00 até R$ 150.000,00</option>
              <option value="150001_250000">R$ 150.001,00 até R$ 250.000,00</option>
              <option value="250001_500000">R$ 250.001,00 até R$ 500.000,00</option>
              <option value="above_500000">Acima de R$ 500.000,00</option>
            </select>
          </label>
          {errors.revenue_range ? (
            <p
              id="revenue-range-error"
              className="diagnostic-form__error"
              role="alert"
            >
              {errors.revenue_range.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="diagnostic-actions diagnostic-actions--submit">
        <Button type="submit" size="lg" arrow loading={isSubmitting}>
          Enviar diagnóstico
        </Button>
      </div>
    </div>
  );
}
