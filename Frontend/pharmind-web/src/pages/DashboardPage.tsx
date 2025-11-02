import { useAuth } from '../contexts/AuthContext';

const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="page-description">
            Bienvenido al panel de control de PharMind
          </p>
        </div>
      </div>

      <div className="page-content">
        <div className="card">
          <h2 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>
            ¡Hola, {user?.nombreCompleto}!
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Bienvenido al sistema de gestión farmacéutica PharMind.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1rem',
            marginTop: '2rem'
          }}>
            <div className="card" style={{
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
              borderLeft: '4px solid #667eea'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span className="material-icons" style={{ fontSize: '2.5rem', color: '#667eea' }}>
                  people
                </span>
                <div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    Usuarios
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                    0
                  </div>
                </div>
              </div>
            </div>

            <div className="card" style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)',
              borderLeft: '4px solid #10b981'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span className="material-icons" style={{ fontSize: '2.5rem', color: '#10b981' }}>
                  admin_panel_settings
                </span>
                <div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    Roles
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                    0
                  </div>
                </div>
              </div>
            </div>

            <div className="card" style={{
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.1) 100%)',
              borderLeft: '4px solid #f59e0b'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span className="material-icons" style={{ fontSize: '2.5rem', color: '#f59e0b' }}>
                  business
                </span>
                <div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    Empresas
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                    0
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
