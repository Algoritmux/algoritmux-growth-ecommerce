import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Footer } from '../components/layout/Footer';
import { Header } from '../components/layout/Header';
import { ScrollToTop } from '../components/layout/ScrollToTop';
import { captureUtmParameters } from '../services/utmService';
import { DiagnosticContext } from './DiagnosticContext';

const DiagnosticModal = lazy(() =>
  import('../components/diagnostic/DiagnosticModal').then((module) => ({
    default: module.DiagnosticModal,
  })),
);

export function PublicLayout() {
  const { search } = useLocation();
  const [diagnosticOpen, setDiagnosticOpen] = useState(false);
  const openDiagnostic = useCallback(() => setDiagnosticOpen(true), []);
  const closeDiagnostic = useCallback(() => setDiagnosticOpen(false), []);

  useEffect(() => {
    captureUtmParameters(search);
  }, [search]);

  return (
    <DiagnosticContext.Provider value={openDiagnostic}>
      <ScrollToTop />
      <div className="background-decor" aria-hidden="true" />
      <Header onOpenDiagnostic={openDiagnostic} />
      <main id="conteudo-principal">
        <Outlet />
      </main>
      <Footer />
      {diagnosticOpen ? (
        <Suspense fallback={null}>
          <DiagnosticModal isOpen onClose={closeDiagnostic} />
        </Suspense>
      ) : null}
    </DiagnosticContext.Provider>
  );
}
