import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { useCallback, useState } from 'react';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { useModalAccessibility } from '../../hooks/useModalAccessibility';
import {
  DiagnosticLeadApiError,
  submitDiagnosticLead,
} from '../../services/diagnosticLeadService';
import { DiagnosticLeadForm } from './DiagnosticLeadForm';
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
  const [isComplete, setIsComplete] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const form = useForm<DiagnosticLeadFormValues>({
    resolver: zodResolver(diagnosticLeadSchema),
    defaultValues: {
      name: '',
      whatsapp: '',
      email: '',
      company_name: '',
      revenue_range: '',
    },
  });
  const close = useCallback(() => {
    setIsComplete(false);
    setSubmissionError(null);
    form.reset();
    onClose();
  }, [form, onClose]);
  const dialogRef = useModalAccessibility(isOpen, close);
  useBodyScrollLock(isOpen);

  const submit = form.handleSubmit(async (values) => {
    setSubmissionError(null);

    try {
      await submitDiagnosticLead(values);
      setIsComplete(true);
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
          {!isComplete ? (
            <form className="diagnostic-form" onSubmit={submit} noValidate>
              <DiagnosticLeadForm isSubmitting={form.formState.isSubmitting} />
              {submissionError ? (
                <p className="diagnostic-form__error" role="alert">
                  {submissionError}
                </p>
              ) : null}
            </form>
          ) : null}
          {isComplete ? (
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
