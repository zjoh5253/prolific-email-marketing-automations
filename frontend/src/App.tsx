import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useAuthStore } from '@/stores/auth';
import { useThemeEffect } from '@/hooks/useThemeEffect';
import { AppLayout } from '@/components/layout/AppLayout';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { ClientsPage } from '@/pages/ClientsPage';
import { ClientDetailPage } from '@/pages/ClientDetailPage';
import { ClientFormPage } from '@/pages/ClientFormPage';
import { CampaignsPage } from '@/pages/CampaignsPage';
import { CalendarPage } from '@/pages/CalendarPage';
import { AlertsPage } from '@/pages/AlertsPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { OnboardingPage } from '@/pages/OnboardingPage';
import { OnboardingSubmissionsPage } from '@/pages/OnboardingSubmissionsPage';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  useThemeEffect();

  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/onboard" element={<OnboardingPage />} />

        <Route
          path="/"
          element={
            <PrivateRoute>
              <AppLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="clients" element={<ClientsPage />} />
          <Route path="clients/new" element={<ClientFormPage />} />
          <Route path="clients/:id" element={<ClientDetailPage />} />
          <Route path="campaigns" element={<CampaignsPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="alerts" element={<AlertsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="onboarding-submissions" element={<OnboardingSubmissionsPage />} />
        </Route>
      </Routes>

      <Toaster position="top-right" richColors closeButton />
    </>
  );
}

export default App;
