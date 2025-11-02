import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { usePreferences } from './contexts/PreferencesContext';
import Sidebar from './components/layout/Sidebar';
import NotificationCenter from './components/notifications/NotificationCenter';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UsuariosPage from './pages/usuarios/UsuariosPage';
import RolesPage from './pages/roles/RolesPage';
import EmpresasPage from './pages/empresas/EmpresasPage';
import EntidadesPage from './pages/admin/EntidadesPage';
import TablasMaestrasPage from './pages/admin/TablasMaestrasPage';
import DynamicEntityPage from './pages/dynamic/DynamicEntityPage';
import './styles/App.css';
import './styles/dark-mode.css';

// Componente para rutas protegidas
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Layout con Sidebar
const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { sidebarCollapsed } = usePreferences();

  return (
    <div className="app">
      <Sidebar />
      <div className={`app-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {children}
      </div>
    </div>
  );
};

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <BrowserRouter>
      {isAuthenticated && <NotificationCenter />}
      <Routes>
        {/* Ruta de Login */}
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
          }
        />

        {/* Rutas protegidas con Layout */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppLayout>
                <DashboardPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/usuarios"
          element={
            <ProtectedRoute>
              <AppLayout>
                <UsuariosPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/roles"
          element={
            <ProtectedRoute>
              <AppLayout>
                <RolesPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/empresas"
          element={
            <ProtectedRoute>
              <AppLayout>
                <EmpresasPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/entidades"
          element={
            <ProtectedRoute>
              <AppLayout>
                <EntidadesPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/tablas-maestras"
          element={
            <ProtectedRoute>
              <AppLayout>
                <TablasMaestrasPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Rutas dinámicas para entidades */}
        <Route
          path="/:tipo/:subtipo"
          element={
            <ProtectedRoute>
              <AppLayout>
                <DynamicEntityPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Ruta por defecto */}
        <Route
          path="/"
          element={
            <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />
          }
        />

        {/* 404 - Redireccionar a dashboard o login */}
        <Route
          path="*"
          element={
            <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
