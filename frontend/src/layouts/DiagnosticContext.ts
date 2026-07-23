import { createContext, useContext } from 'react';

export const DiagnosticContext = createContext<(() => void) | null>(null);

export function useDiagnostic() {
  const value = useContext(DiagnosticContext);
  if (!value) {
    throw new Error('useDiagnostic deve ser usado dentro de PublicLayout.');
  }
  return value;
}
