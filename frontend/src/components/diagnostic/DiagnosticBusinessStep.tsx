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
          type="url"
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
          <option value="1000_50000">R$ 1.000 a R$ 50.000</option>
          <option value="50001_200000">R$ 50.00 a R$ 200.000</option>
          <option value="200001_500000">R$ 200.00 a R$ 500.000</option>
          <option value="above_500000">Acima de R$ 500.000</option>
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
