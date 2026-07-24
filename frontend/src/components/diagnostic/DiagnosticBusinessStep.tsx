import { useFormContext } from 'react-hook-form';
import { Button } from '../common/Button';
import type { DiagnosticLeadFormValues } from './diagnosticLeadSchema';

export function DiagnosticBusinessStep({ onNext }: { onNext: () => void }) {
  const {
    register,
    formState: { errors },
  } = useFormContext<DiagnosticLeadFormValues>();

  return (
    <div>
      <p className="diagnostic-kicker">Etapa 1 de 3</p>
      <h2 id="diagnostic-title">Diagnóstico de performance</h2>
      <p>Conte um pouco sobre a sua operação atual.</p>
      <label>
        Nome da empresa
        <input
          {...register('company_name')}
          type="text"
          placeholder="Ex: TecnoCorp S/A"
          aria-invalid={Boolean(errors.company_name)}
          aria-describedby={errors.company_name ? 'company-name-error' : undefined}
        />
      </label>
      {errors.company_name ? (
        <p id="company-name-error" className="diagnostic-form__error" role="alert">
          {errors.company_name.message}
        </p>
      ) : null}
      <label>
        Site da empresa
        <input
          {...register('website')}
          type="text"
          inputMode="url"
          autoCapitalize="none"
          autoCorrect="off"
          placeholder="https://suaempresa.com.br"
          aria-invalid={Boolean(errors.website)}
          aria-describedby={errors.website ? 'website-error' : undefined}
        />
      </label>
      {errors.website ? (
        <p id="website-error" className="diagnostic-form__error" role="alert">
          {errors.website.message}
        </p>
      ) : null}
      <label>
        Faturamento mensal
        <select
          {...register('revenue_range')}
          defaultValue=""
          aria-invalid={Boolean(errors.revenue_range)}
          aria-describedby={errors.revenue_range ? 'revenue-range-error' : undefined}
        >
          <option value="" disabled>
            Selecione uma opção
          </option>
          <option value="up_to_50000">Até R$ 50.000,00</option>
          <option value="50001_75000">R$ 50.001,00 até R$ 75.000,00</option>
          <option value="75001_150000">R$ 75.001,00 até R$ 150.000,00</option>
          <option value="150001_250000">R$ 150.001,00 até R$ 250.000,00</option>
          <option value="250001_500000">R$ 250.001,00 até R$ 500.000,00</option>
          <option value="above_500000">Acima de R$ 500.000,00</option>
        </select>
      </label>
      {errors.revenue_range ? (
        <p id="revenue-range-error" className="diagnostic-form__error" role="alert">
          {errors.revenue_range.message}
        </p>
      ) : null}
      <Button type="button" size="lg" arrow onClick={onNext}>
        Continuar
      </Button>
    </div>
  );
}
