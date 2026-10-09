import { lazy, Suspense, type ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { PublicLayout } from './layouts/PublicLayout';
import { HomePage } from './pages/HomePage';

const ArticlePage = lazy(() =>
  import('./pages/ArticlePage').then((module) => ({ default: module.ArticlePage })),
);
const BlogPage = lazy(() =>
  import('./pages/BlogPage').then((module) => ({ default: module.BlogPage })),
);
const MethodologyPage = lazy(() =>
  import('./pages/MethodologyPage').then((module) => ({ default: module.MethodologyPage })),
);
const PrivacyPolicyPage = lazy(() =>
  import('./pages/PrivacyPolicyPage').then((module) => ({ default: module.PrivacyPolicyPage })),
);
const TermsOfUsePage = lazy(() =>
  import('./pages/TermsOfUsePage').then((module) => ({ default: module.TermsOfUsePage })),
);
const LgpdPage = lazy(() =>
  import('./pages/LgpdPage').then((module) => ({ default: module.LgpdPage })),
);
const TeamPage = lazy(() =>
  import('./pages/TeamPage').then((module) => ({ default: module.TeamPage })),
);

function RouteSuspense({ children }: { children: ReactNode }) {
  return <Suspense fallback={null}>{children}</Suspense>;
}

export function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="/index.html" element={<HomePage />} />
        <Route
          path="/metodologia"
          element={
            <RouteSuspense>
              <MethodologyPage />
            </RouteSuspense>
          }
        />
        <Route
          path="/metodologia.html"
          element={<Navigate to="/metodologia" replace />}
        />
        <Route
          path="/equipe"
          element={
            <RouteSuspense>
              <TeamPage />
            </RouteSuspense>
          }
        />
        <Route
          path="/equipe.html"
          element={<Navigate to="/equipe" replace />}
        />
        <Route
          path="/blog"
          element={
            <RouteSuspense>
              <BlogPage />
            </RouteSuspense>
          }
        />
        <Route path="/blog.html" element={<Navigate to="/blog" replace />} />
        <Route
          path="/politica-de-privacidade"
          element={
            <RouteSuspense>
              <PrivacyPolicyPage />
            </RouteSuspense>
          }
        />
        <Route
          path="/termos-de-uso"
          element={
            <RouteSuspense>
              <TermsOfUsePage />
            </RouteSuspense>
          }
        />
        <Route
          path="/lgpd"
          element={
            <RouteSuspense>
              <LgpdPage />
            </RouteSuspense>
          }
        />
        <Route
          path="/blog/:slug"
          element={
            <RouteSuspense>
              <ArticlePage />
            </RouteSuspense>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
