export function DiagnosticStepIndicator({ step }: { step: number }) {
  return (
    <ol className="diagnostic-steps" aria-label={`Etapa ${step} de 3`}>
      {[1, 2, 3].map((item) => (
        <li
          key={item}
          className={item <= step ? 'is-active' : ''}
          aria-current={item === step ? 'step' : undefined}
        >
          <span>{item}</span>
        </li>
      ))}
    </ol>
  );
}
