import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { usePreferences } from '../../contexts/PreferencesContext';
import { useAuth } from '../../contexts/AuthContext';
import Logo from '../common/Logo';
import './Sidebar.css';

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  path: string;
}

interface EsquemaPersonalizado {
  id: string;
  nombre: string;
  entidadTipo: string;
  subTipo?: string;
  icono?: string;
  color?: string;
  activo: boolean;
  orden?: number;
}

const Sidebar = () => {
  const location = useLocation();
  const { theme, sidebarCollapsed, toggleTheme, toggleSidebar } = usePreferences();
  const { logout, user } = useAuth();

  const [clientesEsquemas, setClientesEsquemas] = useState<EsquemaPersonalizado[]>([]);
  const [agentesEsquemas, setAgentesEsquemas] = useState<EsquemaPersonalizado[]>([]);
  const [relacionesEsquemas, setRelacionesEsquemas] = useState<EsquemaPersonalizado[]>([]);
  const [interaccionesEsquemas, setInteraccionesEsquemas] = useState<EsquemaPersonalizado[]>([]);
  const [clientesExpanded, setClientesExpanded] = useState(false);
  const [agentesExpanded, setAgentesExpanded] = useState(false);
  const [relacionesExpanded, setRelacionesExpanded] = useState(false);
  const [interaccionesExpanded, setInteraccionesExpanded] = useState(false);
  const [analyticsExpanded, setAnalyticsExpanded] = useState(false);
  const [gestionExpanded, setGestionExpanded] = useState(false);
  const [adminExpanded, setAdminExpanded] = useState(false);

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'dashboard',
      path: '/dashboard'
    }
  ];

  const analyticsMenuItems: MenuItem[] = [
    {
      id: 'actividad-visitas',
      label: 'Actividad de Visitas',
      icon: 'analytics',
      path: '/analytics/actividad-visitas'
    },
    {
      id: 'desempeno-representantes',
      label: 'Desempeño de Representantes',
      icon: 'leaderboard',
      path: '/analytics/desempeno-representantes'
    }
  ];

  const gestionMenuItems: MenuItem[] = [
    {
      id: 'tiempo-utilizado',
      label: 'Tiempo Utilizado',
      icon: 'schedule',
      path: '/gestion/tiempo-utilizado'
    },
    {
      id: 'tipos-actividad',
      label: 'Tipos de Actividad',
      icon: 'category',
      path: '/gestion/tipos-actividad'
    }
  ];

  const adminMenuItems: MenuItem[] = [
    {
      id: 'usuarios',
      label: 'Usuarios',
      icon: 'people',
      path: '/usuarios'
    },
    {
      id: 'roles',
      label: 'Roles',
      icon: 'admin_panel_settings',
      path: '/roles'
    },
    {
      id: 'empresas',
      label: 'Empresas',
      icon: 'business',
      path: '/empresas'
    },
    {
      id: 'entidades',
      label: 'Gestión de Entidades',
      icon: 'category',
      path: '/admin/entidades'
    },
    {
      id: 'tablas-maestras',
      label: 'Tablas Maestras',
      icon: 'table_view',
      path: '/admin/tablas-maestras'
    }
  ];

  // Fetch entity schemas
  useEffect(() => {
    const fetchEsquemas = async () => {
      try {
        // Fetch Clientes schemas
        const clientesResponse = await fetch('http://localhost:5209/api/EsquemasPersonalizados/tipo/Cliente');
        if (clientesResponse.ok) {
          const clientesData = await clientesResponse.json();
          setClientesEsquemas(clientesData);
        }

        // Fetch Agentes schemas
        const agentesResponse = await fetch('http://localhost:5209/api/EsquemasPersonalizados/tipo/Agente');
        if (agentesResponse.ok) {
          const agentesData = await agentesResponse.json();
          setAgentesEsquemas(agentesData);
        }

        // Fetch Relaciones schemas
        const relacionesResponse = await fetch('http://localhost:5209/api/EsquemasPersonalizados/tipo/Relacion');
        if (relacionesResponse.ok) {
          const relacionesData = await relacionesResponse.json();
          setRelacionesEsquemas(relacionesData);
        }

        // Fetch Interacciones schemas
        const interaccionesResponse = await fetch('http://localhost:5209/api/EsquemasPersonalizados/tipo/Interaccion');
        if (interaccionesResponse.ok) {
          const interaccionesData = await interaccionesResponse.json();
          setInteraccionesEsquemas(interaccionesData);
        }
      } catch (error) {
        console.error('Error fetching esquemas:', error);
      }
    };

    fetchEsquemas();
  }, []);

  const handleLogout = () => {
    logout();
  };

  return (
    <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
      {/* Header */}
      <div className="sidebar-header">
        <Logo size="sm" showText={!sidebarCollapsed} />
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          <span className="material-icons">
            {sidebarCollapsed ? 'chevron_right' : 'chevron_left'}
          </span>
        </button>
      </div>

      {/* Usuario actual */}
      {user && (
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">
            <span className="material-icons">account_circle</span>
          </div>
          {!sidebarCollapsed && (
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user.nombreCompleto}</div>
              <div className="sidebar-user-email">{user.email}</div>
            </div>
          )}
        </div>
      )}

      {/* Menú */}
      <nav className="sidebar-menu">
        {/* Dashboard */}
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`sidebar-menu-item ${isActive ? 'active' : ''}`}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <span className="material-icons">{item.icon}</span>
              {!sidebarCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}

        {/* Mi Cartera */}
        <Link
          to="/mi-cartera"
          className={`sidebar-menu-item sidebar-menu-item-highlight ${location.pathname === '/mi-cartera' ? 'active' : ''}`}
          title={sidebarCollapsed ? 'MI CARTERA' : undefined}
        >
          <span className="material-icons">folder_shared</span>
          {!sidebarCollapsed && <span>MI CARTERA</span>}
        </Link>

        {/* Analytics Section */}
        <div
          className="sidebar-section-header"
          onClick={() => setAnalyticsExpanded(!analyticsExpanded)}
        >
          <span className="material-icons">bar_chart</span>
          {!sidebarCollapsed && <span>Analytics</span>}
          {!sidebarCollapsed && (
            <span className="material-icons sidebar-expand-icon">
              {analyticsExpanded ? 'expand_less' : 'expand_more'}
            </span>
          )}
        </div>
        {analyticsExpanded && !sidebarCollapsed && (
          <div className="sidebar-subsection">
            {analyticsMenuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`sidebar-menu-item sidebar-submenu-item ${isActive ? 'active' : ''}`}
                >
                  <span className="material-icons">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        )}

        {/* Gestión Section */}
        <div
          className="sidebar-section-header"
          onClick={() => setGestionExpanded(!gestionExpanded)}
        >
          <span className="material-icons">business_center</span>
          {!sidebarCollapsed && <span>Gestión</span>}
          {!sidebarCollapsed && (
            <span className="material-icons sidebar-expand-icon">
              {gestionExpanded ? 'expand_less' : 'expand_more'}
            </span>
          )}
        </div>
        {gestionExpanded && !sidebarCollapsed && (
          <div className="sidebar-subsection">
            {gestionMenuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`sidebar-menu-item sidebar-submenu-item ${isActive ? 'active' : ''}`}
                >
                  <span className="material-icons">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        )}

        {/* Clientes Section */}
        {clientesEsquemas.length > 0 && (
          <>
            <div
              className="sidebar-section-header"
              onClick={() => setClientesExpanded(!clientesExpanded)}
            >
              <span className="material-icons">groups</span>
              {!sidebarCollapsed && <span>Clientes</span>}
              {!sidebarCollapsed && (
                <span className="material-icons sidebar-expand-icon">
                  {clientesExpanded ? 'expand_less' : 'expand_more'}
                </span>
              )}
            </div>
            {clientesExpanded && !sidebarCollapsed && (
              <div className="sidebar-subsection">
                {clientesEsquemas.map((esquema) => (
                  <Link
                    key={esquema.id}
                    to={`/clientes/${esquema.subTipo || esquema.id}`}
                    className={`sidebar-menu-item sidebar-submenu-item ${
                      location.pathname === `/clientes/${esquema.subTipo || esquema.id}` ? 'active' : ''
                    }`}
                  >
                    <span className="material-icons">{esquema.icono || 'person'}</span>
                    <span>{esquema.nombre}</span>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}

        {/* Agentes Section */}
        <div
          className="sidebar-section-header"
          onClick={() => setAgentesExpanded(!agentesExpanded)}
        >
          <span className="material-icons">badge</span>
          {!sidebarCollapsed && <span>Agentes</span>}
          {!sidebarCollapsed && (
            <span className="material-icons sidebar-expand-icon">
              {agentesExpanded ? 'expand_less' : 'expand_more'}
            </span>
          )}
        </div>
        {agentesExpanded && !sidebarCollapsed && (
          <div className="sidebar-subsection">

            {/* Módulos fijos de gestión */}
            <Link
              to="/gestion/regiones"
              className={`sidebar-menu-item sidebar-submenu-item ${
                location.pathname === '/gestion/regiones' ? 'active' : ''
              }`}
            >
              <span className="material-icons">public</span>
              <span>Regiones</span>
            </Link>
            <Link
              to="/gestion/distritos"
              className={`sidebar-menu-item sidebar-submenu-item ${
                location.pathname === '/gestion/distritos' ? 'active' : ''
              }`}
            >
              <span className="material-icons">location_city</span>
              <span>Distritos</span>
            </Link>
            <Link
              to="/gestion/lineas-negocio"
              className={`sidebar-menu-item sidebar-submenu-item ${
                location.pathname === '/gestion/lineas-negocio' ? 'active' : ''
              }`}
            >
              <span className="material-icons">business_center</span>
              <span>Líneas de Negocio</span>
            </Link>
            <Link
              to="/gestion/managers"
              className={`sidebar-menu-item sidebar-submenu-item ${
                location.pathname === '/gestion/managers' ? 'active' : ''
              }`}
            >
              <span className="material-icons">manage_accounts</span>
              <span>Managers</span>
            </Link>

            {/* Entidades dinámicas de tipo Agente */}
            {agentesEsquemas.map((esquema) => (
              <Link
                key={esquema.id}
                to={`/agentes/${esquema.subTipo || esquema.id}`}
                className={`sidebar-menu-item sidebar-submenu-item ${
                  location.pathname === `/agentes/${esquema.subTipo || esquema.id}` ? 'active' : ''
                }`}
              >
                <span className="material-icons">{esquema.icono || 'badge'}</span>
                <span>{esquema.nombre}</span>
              </Link>
            ))}
          </div>
        )}

        {/* Relaciones Section */}
        {relacionesEsquemas.length > 0 && (
          <>
            <div
              className="sidebar-section-header"
              onClick={() => setRelacionesExpanded(!relacionesExpanded)}
            >
              <span className="material-icons">link</span>
              {!sidebarCollapsed && <span>Relaciones</span>}
              {!sidebarCollapsed && (
                <span className="material-icons sidebar-expand-icon">
                  {relacionesExpanded ? 'expand_less' : 'expand_more'}
                </span>
              )}
            </div>
            {relacionesExpanded && !sidebarCollapsed && (
              <div className="sidebar-subsection">
                {relacionesEsquemas.map((esquema) => (
                  <Link
                    key={esquema.id}
                    to={`/relaciones/${esquema.subTipo || esquema.id}`}
                    className={`sidebar-menu-item sidebar-submenu-item ${
                      location.pathname === `/relaciones/${esquema.subTipo || esquema.id}` ? 'active' : ''
                    }`}
                  >
                    <span className="material-icons">{esquema.icono || 'link'}</span>
                    <span>{esquema.nombre}</span>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}

        {/* Interacciones Section */}
        {interaccionesEsquemas.length > 0 && (
          <>
            <div
              className="sidebar-section-header"
              onClick={() => setInteraccionesExpanded(!interaccionesExpanded)}
            >
              <span className="material-icons">touch_app</span>
              {!sidebarCollapsed && <span>Interacciones</span>}
              {!sidebarCollapsed && (
                <span className="material-icons sidebar-expand-icon">
                  {interaccionesExpanded ? 'expand_less' : 'expand_more'}
                </span>
              )}
            </div>
            {interaccionesExpanded && !sidebarCollapsed && (
              <div className="sidebar-subsection">
                {interaccionesEsquemas.map((esquema) => (
                  <Link
                    key={esquema.id}
                    to={`/interacciones/${esquema.subTipo || esquema.id}`}
                    className={`sidebar-menu-item sidebar-submenu-item ${
                      location.pathname === `/interacciones/${esquema.subTipo || esquema.id}` ? 'active' : ''
                    }`}
                  >
                    <span className="material-icons">{esquema.icono || 'event'}</span>
                    <span>{esquema.nombre}</span>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}

        {/* Administración Section */}
        <div
          className="sidebar-section-header"
          onClick={() => setAdminExpanded(!adminExpanded)}
        >
          <span className="material-icons">settings</span>
          {!sidebarCollapsed && <span>Administración</span>}
          {!sidebarCollapsed && (
            <span className="material-icons sidebar-expand-icon">
              {adminExpanded ? 'expand_less' : 'expand_more'}
            </span>
          )}
        </div>
        {adminExpanded && !sidebarCollapsed && (
          <div className="sidebar-subsection">
            {adminMenuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`sidebar-menu-item sidebar-submenu-item ${isActive ? 'active' : ''}`}
                >
                  <span className="material-icons">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <button
          className="sidebar-footer-button"
          onClick={toggleTheme}
          title={theme === 'light' ? 'Modo oscuro' : 'Modo claro'}
        >
          <span className="material-icons">
            {theme === 'light' ? 'dark_mode' : 'light_mode'}
          </span>
          {!sidebarCollapsed && (
            <span>{theme === 'light' ? 'Modo oscuro' : 'Modo claro'}</span>
          )}
        </button>

        <button
          className="sidebar-footer-button"
          onClick={handleLogout}
          title="Cerrar sesión"
        >
          <span className="material-icons">logout</span>
          {!sidebarCollapsed && <span>Cerrar sesión</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
