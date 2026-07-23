import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { useCallback, useState } from 'react';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { useModalAccessibility } from '../../hooks/useModalAccessibility';
import {
  DiagnosticLeadApiError,
  submitDiagnosticLead,
} from '../../services/diagnosticLeadService';
import { DiagnosticBusinessStep } from './DiagnosticBusinessStep';
import { DiagnosticContactStep } from './DiagnosticContactStep';
import { DiagnosticStepIndicator } from './DiagnosticStepIndicator';
import { DiagnosticUnavailableNotice } from './DiagnosticUnavailableNotice';
import {
  diagnosticLeadSchema,
  type DiagnosticLeadFormValues,
} from './diagnosticLeadSchema';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export function DiagnosticModal({ isOpen, onClose }: Props) {
  const [step, setStep] = useState(1);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const form = useForm<DiagnosticLeadFormValues>({
    resolver: zodResolver(diagnosticLeadSchema),
    defaultValues: {
      name: '',
      whatsapp: '',
      email: '',
      company_name: '',
      website: '',
      revenue_range: undefined,
    },
  });
  const close = useCallback(() => {
    setStep(1);
    setSubmissionError(null);
    form.reset();
    onClose();
  }, [form, onClose]);
  const dialogRef = useModalAccessibility(isOpen, close);
  useBodyScrollLock(isOpen);

  const moveToContact = async () => {
    const isBusinessStepValid = await form.trigger([
      'company_name',
      'website',
      'revenue_range',
    ]);

    if (isBusinessStepValid) {
      setSubmissionError(null);
      setStep(2);
    }
  };

  const submit = form.handleSubmit(async (values) => {
    setSubmissionError(null);

    try {
      await submitDiagnosticLead(values);
      setStep(3);
    } catch (error) {
      if (error instanceof DiagnosticLeadApiError) {
        Object.entries(error.fieldErrors ?? {}).forEach(([field, messages]) => {
          form.setError(field as keyof DiagnosticLeadFormValues, {
            type: 'server',
            message: messages[0],
          });
        });
        setSubmissionError(error.message);
        return;
      }

      setSubmissionError('Não foi possível enviar seu diagnóstico. Tente novamente.');
    }
  });

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div
        ref={dialogRef}
        className="diagnostic-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="diagnostic-title"
      >
        <button
          type="button"
          className="modal-close"
          onClick={close}
          aria-label="Fechar diagnóstico"
        >
          ×
        </button>
        <FormProvider {...form}>
          <DiagnosticStepIndicator step={step} />
          {step < 3 ? (
            <form className="diagnostic-form" onSubmit={submit} noValidate>
              {step === 1 ? <DiagnosticBusinessStep onNext={moveToContact} /> : null}
              {step === 2 ? (
                <DiagnosticContactStep
                  onBack={() => {
                    setSubmissionError(null);
                    setStep(1);
                  }}
                  isSubmitting={form.formState.isSubmitting}
                />
              ) : null}
              {submissionError ? (
                <p className="diagnostic-form__error" role="alert">
                  {submissionError}
                </p>
              ) : null}
            </form>
          ) : null}
          {step === 3 ? (
            <DiagnosticUnavailableNotice
              companyName={form.getValues('company_name')}
              onClose={close}
            />
          ) : null}
        </FormProvider>
      </div>
    </div>
  );
}
