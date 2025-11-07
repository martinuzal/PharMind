import React, { useState, useEffect } from 'react';
import { usePage } from '../../contexts/PageContext';
import auditCustomerService, { type AuditCustomer, type AuditCustomerEstadisticas } from '../../services/auditCustomer.service';
import './AuditoriaPages.css';

const MedicosAuditoriaPage: React.FC = () => {
  const { setToolbarContent, setToolbarCenterContent, setToolbarRightContent, clearToolbarContent } = usePage();

  const [medicos, setMedicos] = useState<AuditCustomer[]>([]);
  const [estadisticas, setEstadisticas] = useState<AuditCustomerEstadisticas | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize] = useState(50);
  const [searchName, setSearchName] = useState('');
  const [searchOther, setSearchOther] = useState('');
  const [searchNameInput, setSearchNameInput] = useState('');
  const [searchOtherInput, setSearchOtherInput] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchName(searchNameInput);
    setSearchOther(searchOtherInput);
    setCurrentPage(1);
  };

  const handleClearSearchName = () => {
    setSearchNameInput('');
    setSearchName('');
    setCurrentPage(1);
  };

  const handleClearSearchOther = () => {
    setSearchOtherInput('');
    setSearchOther('');
    setCurrentPage(1);
  };

  // Configure toolbar sections
  useEffect(() => {
    const toolbarLeft = (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          boxShadow: '0 4px 6px rgba(102, 126, 234, 0.3)'
        }}>
          <span className="material-icons" style={{ fontSize: '24px', color: 'white' }}>medical_services</span>
        </div>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>
          Médicos de Auditoría
        </h1>
      </div>
    );

    const toolbarCenter = (
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem', width: '100%', maxWidth: '900px' }}>
        {/* Búsqueda por nombre */}
        <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center', minWidth: '250px' }}>
          <span className="material-icons" style={{ position: 'absolute', left: '16px', fontSize: '1.25rem', color: '#9ca3af', pointerEvents: 'none' }}>
            person
          </span>
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={searchNameInput}
            onChange={(e) => setSearchNameInput(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 3rem 0.75rem 3rem',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '0.9375rem',
              outline: 'none',
              transition: 'all 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#2563eb'}
            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
          />
          {searchNameInput && (
            <button
              type="button"
              onClick={handleClearSearchName}
              style={{
                position: 'absolute',
                right: '10px',
                background: 'none',
                border: 'none',
                padding: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                color: '#9ca3af',
                borderRadius: '4px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
            >
              <span className="material-icons" style={{ fontSize: '1.125rem' }}>close</span>
            </button>
          )}
        </div>

        {/* Búsqueda por otros campos */}
        <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center', minWidth: '250px' }}>
          <span className="material-icons" style={{ position: 'absolute', left: '16px', fontSize: '1.25rem', color: '#9ca3af', pointerEvents: 'none' }}>
            search
          </span>
          <input
            type="text"
            placeholder="CRM, código, ubicación..."
            value={searchOtherInput}
            onChange={(e) => setSearchOtherInput(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 3rem 0.75rem 3rem',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '0.9375rem',
              outline: 'none',
              transition: 'all 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#2563eb'}
            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
          />
          {searchOtherInput && (
            <button
              type="button"
              onClick={handleClearSearchOther}
              style={{
                position: 'absolute',
                right: '10px',
                background: 'none',
                border: 'none',
                padding: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                color: '#9ca3af',
                borderRadius: '4px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
            >
              <span className="material-icons" style={{ fontSize: '1.125rem' }}>close</span>
            </button>
          )}
        </div>

        <button
          type="submit"
          style={{
            padding: '0.75rem 1.5rem',
            background: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '0.9375rem',
            fontWeight: 600,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'all 0.2s',
            boxShadow: '0 1px 3px rgba(37, 99, 235, 0.2)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#1d4ed8';
            e.currentTarget.style.boxShadow = '0 4px 6px rgba(37, 99, 235, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#2563eb';
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(37, 99, 235, 0.2)';
          }}
        >
          Buscar
        </button>
      </form>
    );

    const toolbarRight = (
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        {estadisticas && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.125rem', background: '#f3f4f6', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
              <span className="material-icons" style={{ fontSize: '1.25rem', color: '#6b7280' }}>people</span>
              <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#374151' }}>{estadisticas.totalMedicos.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.125rem', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
              <span className="material-icons" style={{ fontSize: '1.25rem', color: '#2563eb' }}>badge</span>
              <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1e40af' }}>{estadisticas.medicosConCRM.toLocaleString()}</span>
            </div>
          </>
        )}
      </div>
    );

    setToolbarContent(toolbarLeft);
    setToolbarCenterContent(toolbarCenter);
    setToolbarRightContent(toolbarRight);

    return () => clearToolbarContent();
  }, [setToolbarContent, setToolbarCenterContent, setToolbarRightContent, clearToolbarContent, estadisticas, searchNameInput, searchOtherInput]);

  useEffect(() => {
    loadMedicos();
  }, [currentPage, searchName, searchOther]);

  useEffect(() => {
    loadEstadisticas();
  }, []);

  const loadMedicos = async () => {
    try {
      setLoading(true);
      const response = await auditCustomerService.getAll(
        currentPage,
        pageSize,
        searchName || undefined,
        searchOther || undefined
      );
      setMedicos(response.items);
      setTotalPages(response.totalPages);
      setTotalItems(response.totalItems);
    } catch (error) {
      console.error('Error al cargar médicos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEstadisticas = async () => {
    try {
      const stats = await auditCustomerService.getEstadisticas();
      setEstadisticas(stats);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const getPaginationRange = () => {
    const delta = 2;
    const range: (number | string)[] = [];
    const rangeWithDots: (number | string)[] = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  return (
    <div className="auditoria-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1.5rem', minHeight: 'calc(100vh - 70px)' }}>
      {/* Tabla */}
      <div className="table-container" style={{ width: '100%', maxWidth: '95%' }}>
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Cargando médicos...</p>
          </div>
        ) : medicos.length === 0 ? (
          <div className="empty-state">
            <span className="material-icons empty-icon">search_off</span>
            <h3>No se encontraron médicos</h3>
            <p>
              {searchName || searchOther
                ? 'Intenta con otros términos de búsqueda'
                : 'No hay médicos registrados en la base de datos'}
            </p>
          </div>
        ) : (
          <>
            <div className="table-info">
              <p>
                Mostrando {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, totalItems)} de {totalItems} médicos
              </p>
            </div>
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Código Registro</th>
                    <th>CRM</th>
                    <th>Nombre</th>
                    <th>Especialidad 1</th>
                    <th>Especialidad 2</th>
                    <th>Región PMIX</th>
                    <th>Localidad</th>
                    <th>Barrio</th>
                    <th>CEP</th>
                    <th>Código Visita</th>
                    <th className="actions-column">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {medicos.map((medico) => (
                    <tr key={medico.id}>
                      <td className="codigo-cell">{medico.cdgmeD_REG || '-'}</td>
                      <td>
                        {medico.crm ? (
                          <span className="crm-badge">
                            <span className="material-icons">badge</span>
                            {medico.crm}
                          </span>
                        ) : (
                          <span style={{ color: '#9ca3af' }}>-</span>
                        )}
                      </td>
                      <td className="nombre-cell">{medico.nome || '-'}</td>
                      <td className="especialidad-cell">{medico.cdgesp1 || '-'}</td>
                      <td className="especialidad-cell">{medico.cdgesp2 || '-'}</td>
                      <td className="codigo-cell">{medico.cdgreG_PMIX || '-'}</td>
                      <td className="ubicacion-cell">{medico.local || '-'}</td>
                      <td className="ubicacion-cell">{medico.bairro || '-'}</td>
                      <td className="codigo-cell">{medico.cep || '-'}</td>
                      <td className="codigo-cell">{medico.cdgmeD_VIS || '-'}</td>
                      <td className="actions-column">
                        <div className="action-buttons">
                          <button
                            className="action-button view-button"
                            title="Ver detalles"
                            onClick={() => console.log('Ver médico:', medico.id)}
                          >
                            <span className="material-icons">visibility</span>
                          </button>
                          <button
                            className="action-button edit-button"
                            title="Editar"
                            onClick={() => console.log('Editar médico:', medico.id)}
                          >
                            <span className="material-icons">edit</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <span className="material-icons">chevron_left</span>
                </button>

                {getPaginationRange().map((page, index) => (
                  <React.Fragment key={index}>
                    {typeof page === 'number' ? (
                      <button
                        className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </button>
                    ) : (
                      <span className="pagination-dots">{page}</span>
                    )}
                  </React.Fragment>
                ))}

                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <span className="material-icons">chevron_right</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MedicosAuditoriaPage;
