import { Routes, Route, Navigate } from 'react-router-dom';

import { AuthGuard } from '@/components/layout/AuthGuard';
import { AppLayout } from '@/components/layout/AppLayout';
import { LoginPage } from '@/features/auth/components/LoginPage';
import { RegisterPage } from '@/features/auth/components/RegisterPage';
import { ProjectsPage } from '@/features/project/components/ProjectsPage';
import { ProjectDetailPage } from '@/features/project/components/ProjectDetailPage';
import { PageDetailPage } from '@/features/selector/components/PageDetailPage';
import { ElementInspector } from '@/features/inspector/components/ElementInspector';

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected routes */}
      <Route element={<AuthGuard />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/projects" replace />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:id" element={<ProjectDetailPage />} />
          <Route path="/pages/:id" element={<PageDetailPage />} />
        </Route>

        {/* Full-screen inspector (no sidebar) */}
        <Route path="/pages/:id/inspect/:selectorId" element={<ElementInspector />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
