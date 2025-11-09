import React, { useState, useEffect } from 'react';
import './PerfilPrescriptivoModal.css';
import auditCustomerService, { type AuditCustomer, type PerfilPrescriptivo } from '../../services/auditCustomer.service';

interface PerfilPrescriptivoModalProps {
  isOpen: boolean;
  onClose: () => void;
  medico: AuditCustomer;
}

export const PerfilPrescriptivoModal: React.FC<PerfilPrescriptivoModalProps> = ({
  isOpen,
  onClose,
  medico
}) => {
  const [perfil, setPerfil] = useState<PerfilPrescriptivo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && medico.cdgmeD_REG) {
      loadPerfilPrescriptivo();
    }
  }, [isOpen, medico]);

  const loadPerfilPrescriptivo = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await auditCustomerService.getPerfilPrescriptivo(medico.cdgmeD_REG!);
      setPerfil(data);
    } catch (err) {
      console.error('Error al cargar perfil prescriptivo:', err);
      setError('Error al cargar el perfil prescriptivo del médico');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPerfil(null);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="perfil-prescriptivo-modal-container">
        {/* Header */}
        <div className="perfil-modal-header">
          <div className="perfil-modal-title">
            <div className="perfil-modal-icon">
              <span className="material-icons">assessment</span>
            </div>
            <div>
              <h2>Perfil Prescriptivo</h2>
              <p className="medico-name">{medico.nome || 'Sin nombre'}</p>
            </div>
          </div>
          <button
            className="modal-close-btn"
            onClick={handleClose}
            type="button"
          >
            <span className="material-icons">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="perfil-modal-body">
          {loading ? (
            <div className="loading-section">
              <div className="spinner"></div>
              <p>Cargando perfil prescriptivo...</p>
            </div>
          ) : error ? (
            <div className="error-section">
              <span className="material-icons">error_outline</span>
              <p>{error}</p>
            </div>
          ) : perfil ? (
            <>
              {/* Resumen General */}
              <div className="perfil-section">
                <div className="section-header">
                  <span className="material-icons">summarize</span>
                  <h3>Resumen General</h3>
                </div>
                <div className="resumen-cards">
                  <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                      <span className="material-icons">assignment</span>
                    </div>
                    <div className="stat-content">
                      <div className="stat-label">Total Prescripciones</div>
                      <div className="stat-value">{perfil.resumen.totalPrescripciones.toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                      <span className="material-icons">store</span>
                    </div>
                    <div className="stat-content">
                      <div className="stat-label">Total Mercados</div>
                      <div className="stat-value">{perfil.resumen.totalMercados}</div>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                      <span className="material-icons">trending_up</span>
                    </div>
                    <div className="stat-content">
                      <div className="stat-label">Market Share Promedio</div>
                      <div className="stat-value">{perfil.resumen.promedioMarketShare.toFixed(2)}%</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Perfil por Mercado */}
              <div className="perfil-section">
                <div className="section-header">
                  <span className="material-icons">business</span>
                  <h3>Perfil por Mercado</h3>
                </div>
                <div className="table-scroll">
                  <table className="perfil-table">
                    <thead>
                      <tr>
                        <th>Mercado</th>
                        <th>Total Rx</th>
                        <th>Rx Laboratorio</th>
                        <th>Rx Mercado</th>
                        <th>Market Share</th>
                        <th>Categorías</th>
                      </tr>
                    </thead>
                    <tbody>
                      {perfil.perfilPorMercado.map((item, index) => (
                        <tr key={index}>
                          <td className="mercado-cell">
                            <span className="mercado-badge">{item.mercado}</span>
                          </td>
                          <td className="number-cell">{item.totalPrescripciones.toLocaleString()}</td>
                          <td className="number-cell">{item.prescripcionesLaboratorio.toLocaleString()}</td>
                          <td className="number-cell">{item.prescripcionesMercado.toLocaleString()}</td>
                          <td className="number-cell">
                            <span className="market-share-badge">{item.marketShare.toFixed(2)}%</span>
                          </td>
                          <td className="number-cell">{item.categorias}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Top Categorías */}
              <div className="perfil-section">
                <div className="section-header">
                  <span className="material-icons">emoji_events</span>
                  <h3>Top 10 Categorías</h3>
                </div>
                <div className="categorias-grid">
                  {perfil.topCategorias.map((categoria, index) => (
                    <div key={index} className="categoria-card">
                      <div className="categoria-rank">#{index + 1}</div>
                      <div className="categoria-content">
                        <div className="categoria-name">{categoria.categoria}</div>
                        <div className="categoria-prescripciones">
                          <span className="material-icons">medication</span>
                          {categoria.prescripciones.toLocaleString()} Rx
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {perfil.topCategorias.length === 0 && (
                  <div className="empty-state">
                    <span className="material-icons">inbox</span>
                    <p>No hay categorías registradas</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="empty-state">
              <span className="material-icons">search_off</span>
              <p>No se encontró información del perfil prescriptivo</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="perfil-modal-footer">
          <button
            type="button"
            className="btn-secondary-modal"
            onClick={handleClose}
          >
            <span className="material-icons">close</span>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default PerfilPrescriptivoModal;
