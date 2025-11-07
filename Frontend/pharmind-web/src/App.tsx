import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { usePreferences } from './contexts/PreferencesContext';
import Sidebar from './components/layout/Sidebar';
import Toolbar from './components/layout/Toolbar';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UsuariosPage from './pages/usuarios/UsuariosPage';
import RolesPage from './pages/roles/RolesPage';
import EmpresasPage from './pages/empresas/EmpresasPage';
import EntidadesPage from './pages/admin/EntidadesPage';
import TablasMaestrasPage from './pages/admin/TablasMaestrasPage';
import DynamicEntityPage from './pages/dynamic/DynamicEntityPage';
import AgentDynamicEntityPage from './pages/crm/AgentDynamicEntityPage';
import CustomerDynamicEntityPage from './pages/crm/CustomerDynamicEntityPage';
import RelationDynamicEntityPage from './pages/crm/RelationDynamicEntityPage';
import InteractionDynamicEntityPage from './pages/crm/InteractionDynamicEntityPage';
import ActividadVisitasPage from './pages/analytics/ActividadVisitasPage';
import DesempenoRepresentantesPage from './pages/analytics/DesempenoRepresentantesPage';
import TiempoUtilizadoPage from './pages/gestion/TiempoUtilizadoPage';
import TiposActividadPage from './pages/gestion/TiposActividadPage';
import AgentesPage from './pages/crm/AgentesPage';
import ClientesPage from './pages/crm/ClientesPage';
import RelacionesPage from './pages/crm/RelacionesPage';
import InteraccionesPage from './pages/crm/InteraccionesPage';
import RegionesPage from './pages/gestion/RegionesPage';
import DistritosPage from './pages/gestion/DistritosPage';
import LineasNegocioPage from './pages/gestion/LineasNegocioPage';
import ManagersPage from './pages/gestion/ManagersPage';
import MiCarteraPage from './pages/cartera/MiCarteraPage';
import PruebaDireccionPage from './pages/pruebas/PruebaDireccionPage';
import PaisesPage from './pages/atlas/PaisesPage';
import ProvinciasPage from './pages/atlas/ProvinciasPage';
import LocalidadesPage from './pages/atlas/LocalidadesPage';
import CallesPage from './pages/atlas/CallesPage';
import CodigosPostalesPage from './pages/atlas/CodigosPostalesPage';
import ImportacionesPage from './pages/auditoria/ImportacionesPage';
import PortfolioBEBPage from './pages/auditoria/PortfolioBEBPage';
import AnalisisMercadoPage from './pages/auditoria/AnalisisMercadoPage';
import MapaGeograficoPage from './pages/auditoria/MapaGeograficoPage';
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

// Layout con Sidebar y Toolbar
const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { sidebarCollapsed } = usePreferences();

  return (
    <div className="app">
      <Sidebar />
      <div className={`app-wrapper ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Toolbar />
        <div className="app-content app-content-with-toolbar">
          {children}
        </div>
      </div>
    </div>
  );
};

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <BrowserRouter>
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
          path="/mi-cartera"
          element={
            <ProtectedRoute>
              <AppLayout>
                <MiCarteraPage />
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
        <Route
          path="/analytics/actividad-visitas"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ActividadVisitasPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics/desempeno-representantes"
          element={
            <ProtectedRoute>
              <AppLayout>
                <DesempenoRepresentantesPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/gestion/tiempo-utilizado"
          element={
            <ProtectedRoute>
              <AppLayout>
                <TiempoUtilizadoPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/gestion/tipos-actividad"
          element={
            <ProtectedRoute>
              <AppLayout>
                <TiposActividadPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/gestion/regiones"
          element={
            <ProtectedRoute>
              <AppLayout>
                <RegionesPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/gestion/distritos"
          element={
            <ProtectedRoute>
              <AppLayout>
                <DistritosPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/gestion/lineas-negocio"
          element={
            <ProtectedRoute>
              <AppLayout>
                <LineasNegocioPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/gestion/managers"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ManagersPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/atlas/paises"
          element={
            <ProtectedRoute>
              <AppLayout>
                <PaisesPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/atlas/provincias"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ProvinciasPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/atlas/localidades"
          element={
            <ProtectedRoute>
              <AppLayout>
                <LocalidadesPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/atlas/calles"
          element={
            <ProtectedRoute>
              <AppLayout>
                <CallesPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/atlas/codigos-postales"
          element={
            <ProtectedRoute>
              <AppLayout>
                <CodigosPostalesPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/auditoria/importaciones"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ImportacionesPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/auditoria/portfolio"
          element={
            <ProtectedRoute>
              <AppLayout>
                <PortfolioBEBPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/auditoria/mercado"
          element={
            <ProtectedRoute>
              <AppLayout>
                <AnalisisMercadoPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/auditoria/mapa-geografico"
          element={
            <ProtectedRoute>
              <AppLayout>
                <MapaGeograficoPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/crm/agentes"
          element={
            <ProtectedRoute>
              <AppLayout>
                <AgentesPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/crm/clientes"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ClientesPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/crm/relaciones"
          element={
            <ProtectedRoute>
              <AppLayout>
                <RelacionesPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/crm/interacciones"
          element={
            <ProtectedRoute>
              <AppLayout>
                <InteraccionesPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Rutas dinámicas para entidades */}
        {/* Ruta específica para Agentes (debe ir ANTES de la ruta genérica) */}
        <Route
          path="/agentes/:subtipo"
          element={
            <ProtectedRoute>
              <AppLayout>
                <AgentDynamicEntityPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Ruta específica para Clientes (debe ir ANTES de la ruta genérica) */}
        <Route
          path="/clientes/:subtipo"
          element={
            <ProtectedRoute>
              <AppLayout>
                <CustomerDynamicEntityPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Ruta específica para Relaciones (debe ir ANTES de la ruta genérica) */}
        <Route
          path="/relaciones/:subtipo"
          element={
            <ProtectedRoute>
              <AppLayout>
                <RelationDynamicEntityPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Ruta específica para Interacciones (debe ir ANTES de la ruta genérica) */}
        <Route
          path="/interacciones/:subtipo"
          element={
            <ProtectedRoute>
              <AppLayout>
                <InteractionDynamicEntityPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Ruta genérica para otras entidades */}
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

        {/* Ruta de prueba para componente de direcciones */}
        <Route
          path="/pruebas/direccion"
          element={
            <ProtectedRoute>
              <AppLayout>
                <PruebaDireccionPage />
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
