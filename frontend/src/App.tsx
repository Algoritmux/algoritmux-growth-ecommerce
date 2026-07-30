import { Navigate, Route, Routes } from 'react-router-dom';
import { PublicLayout } from './layouts/PublicLayout';
import { ArticlePage } from './pages/ArticlePage';
import { BlogPage } from './pages/BlogPage';
import { HomePage } from './pages/HomePage';
import { MethodologyPage } from './pages/MethodologyPage';
import { TeamPage } from './pages/TeamPage';

export function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="/index.html" element={<HomePage />} />
        <Route path="/metodologia.html" element={<MethodologyPage />} />
        <Route path="/equipe.html" element={<TeamPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog.html" element={<Navigate to="/blog" replace />} />
        <Route path="/blog/:slug" element={<ArticlePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
