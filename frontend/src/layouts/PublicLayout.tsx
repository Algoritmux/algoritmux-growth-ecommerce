import { useCallback, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { DiagnosticModal } from '../components/diagnostic/DiagnosticModal';
import { Footer } from '../components/layout/Footer';
import { Header } from '../components/layout/Header';
import { ScrollToTop } from '../components/layout/ScrollToTop';
import { DiagnosticContext } from './DiagnosticContext';

export function PublicLayout() {
  const [diagnosticOpen, setDiagnosticOpen] = useState(false);
  const openDiagnostic = useCallback(() => setDiagnosticOpen(true), []);
  const closeDiagnostic = useCallback(() => setDiagnosticOpen(false), []);

  return (
    <DiagnosticContext.Provider value={openDiagnostic}>
      <ScrollToTop />
      <div className="background-decor" aria-hidden="true" />
      <Header onOpenDiagnostic={openDiagnostic} />
      <main id="conteudo-principal">
        <Outlet />
      </main>
      <Footer />
      <DiagnosticModal isOpen={diagnosticOpen} onClose={closeDiagnostic} />
    </DiagnosticContext.Provider>
  );
}
