import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { usePage } from '../../contexts/PageContext';
import InteractionFormModal from '../../components/modals/InteractionFormModal';
import FrecuenciaIndicator from '../../components/common/FrecuenciaIndicator';
import type { FrecuenciaIndicadorData } from '../../components/common/FrecuenciaIndicator';
import './MiCarteraPage.css';

interface TipoRelacion {
  id: string;
  nombre: string;
  subTipo: string;
  icono?: string;
  color?: string;
  configuracionUI?: string;
}

interface TipoInteraccion {
  id: string;
  nombre: string;
  subTipo: string;
  icono?: string;
  color?: string;
  schema?: string | any;
  configuracionUi?: string | null;
}

interface Relacion {
  id: string;
  tipoRelacionId: string;
  tipoRelacionNombre?: string;
  codigoRelacion: string;
  agenteId: string;
  agenteNombre?: string;
  clientePrincipalId: string;
  clientePrincipalNombre?: string;
  clienteSecundario1Id?: string;
  clienteSecundario1Nombre?: string;
  clienteSecundario2Id?: string;
  clienteSecundario2Nombre?: string;
  tipoRelacion?: string;
  fechaInicio: string;
  fechaFin?: string;
  estado: string;
  frecuenciaVisitas?: string;
  prioridad?: string;
  observaciones?: string;
  datosDinamicos?: Record<string, any>;
  frecuencia?: FrecuenciaIndicadorData;
}

const MiCarteraPage: React.FC = () => {
  const navigate = useNavigate();
  const { setToolbarContent, setToolbarCenterContent, setToolbarRightContent, clearToolbarContent } = usePage();

  const [relaciones, setRelaciones] = useState<Relacion[]>([]);
  const [relacionesFiltradas, setRelacionesFiltradas] = useState<Relacion[]>([]);
  const [tiposRelacion, setTiposRelacion] = useState<TipoRelacion[]>([]);
  const [tiposInteraccion, setTiposInteraccion] = useState<TipoInteraccion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState<string>('todos');
  const [soloConPendientes, setSoloConPendientes] = useState(false);
  const [viewMode, setViewMode] = useState<'mosaico' | 'lista'>('mosaico');
  const [menuAbiertoId, setMenuAbiertoId] = useState<string | null>(null);
  const [showInteractionModal, setShowInteractionModal] = useState(false);
  const [modalPrefilledData, setModalPrefilledData] = useState<any>(null);
  const [selectedTipoInteraccion, setSelectedTipoInteraccion] = useState<TipoInteraccion | null>(null);

  useEffect(() => {
    loadData();
    return () => clearToolbarContent();
  }, []);

  useEffect(() => {
    setupToolbar();
  }, [searchTerm, tipoFiltro, viewMode, tiposRelacion, soloConPendientes]);

  useEffect(() => {
    filterRelaciones();
  }, [relaciones, searchTerm, tipoFiltro, soloConPendientes]);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = () => {
      if (menuAbiertoId) {
        setMenuAbiertoId(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [menuAbiertoId]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Cargar tipos de relación
      const tiposResponse = await api.get('/EsquemasPersonalizados/tipo/Relacion');
      console.log('Tipos Response:', tiposResponse.data);
      const tipos = Array.isArray(tiposResponse.data) ? tiposResponse.data : [];
      setTiposRelacion(tipos);

      // Cargar tipos de interacción
      const interaccionesResponse = await api.get('/EsquemasPersonalizados/tipo/Interaccion');
      console.log('Tipos Interaccion Response:', interaccionesResponse.data);
      const tiposInt = Array.isArray(interaccionesResponse.data) ? interaccionesResponse.data : [];
      setTiposInteraccion(tiposInt);

      // Cargar todas las relaciones del usuario (con paginación grande para obtener todas)
      const relacionesResponse = await api.get('/Relaciones?pageSize=1000&incluirFrecuencia=true');
      console.log('Relaciones Response:', relacionesResponse.data);

      // El backend devuelve un objeto con items, no un array directo
      const rels = relacionesResponse.data?.items || [];
      console.log('Relaciones procesadas:', rels);
      console.log('Primera relación con frecuencia:', rels[0]);
      console.log('¿Tiene frecuencia?:', rels[0]?.frecuencia);
      setRelaciones(rels);
      setRelacionesFiltradas(rels);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setRelaciones([]);
      setRelacionesFiltradas([]);
      setTiposRelacion([]);
      setTiposInteraccion([]);
    } finally {
      setLoading(false);
    }
  };

  const filterRelaciones = () => {
    // Validar que relaciones sea un array
    if (!Array.isArray(relaciones)) {
      setRelacionesFiltradas([]);
      return;
    }

    let filtered = [...relaciones];

    // Filtrar por búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(rel =>
        rel.codigoRelacion?.toLowerCase().includes(term) ||
        rel.clientePrincipalNombre?.toLowerCase().includes(term) ||
        rel.agenteNombre?.toLowerCase().includes(term) ||
        rel.tipoRelacionNombre?.toLowerCase().includes(term)
      );
    }

    // Filtrar por tipo
    if (tipoFiltro !== 'todos') {
      filtered = filtered.filter(rel => rel.tipoRelacionId === tipoFiltro);
    }

    // Filtrar por visitas pendientes
    if (soloConPendientes) {
      filtered = filtered.filter(rel =>
        rel.frecuencia && rel.frecuencia.visitasPendientes > 0
      );
    }

    setRelacionesFiltradas(filtered);
  };

  const setupToolbar = () => {
    // Título y búsqueda
    setToolbarContent(
      <div className="toolbar-left">
        <span className="material-icons toolbar-icon">folder_shared</span>
        <h1 className="toolbar-title">MI CARTERA</h1>
        <div className="toolbar-search">
          <span className="material-icons">search</span>
          <input
            type="text"
            placeholder="Buscar relaciones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="toolbar-search-input"
          />
          {searchTerm && (
            <button
              className="toolbar-search-clear"
              onClick={() => setSearchTerm('')}
            >
              <span className="material-icons">clear</span>
            </button>
          )}
        </div>
      </div>
    );

    // Filtro por tipo con botones (solo icono + cantidad)
    const tipoActual = tipoFiltro === 'todos'
      ? 'Todos los tipos'
      : tiposRelacion.find(t => t.id === tipoFiltro)?.nombre || 'Todos';

    setToolbarCenterContent(
      <div className="toolbar-center">
        <span className="toolbar-label">Filtrar por tipo:</span>
        <div className="filtro-buttons">
          <button
            className={`btn-filtro-chip ${tipoFiltro === 'todos' ? 'active' : ''}`}
            onClick={() => setTipoFiltro('todos')}
            title="Todos los tipos"
          >
            <span className="material-icons">select_all</span>
            <span className="badge-count">{relaciones.length}</span>
          </button>
          {tiposRelacion.map(tipo => {
            const count = relaciones.filter(r => r.tipoRelacionId === tipo.id).length;
            return (
              <button
                key={tipo.id}
                className={`btn-filtro-chip ${tipoFiltro === tipo.id ? 'active' : ''}`}
                onClick={() => setTipoFiltro(tipo.id)}
                title={tipo.nombre}
                style={tipoFiltro === tipo.id ? {
                  borderColor: tipo.color || 'var(--accent-color)',
                  background: `${tipo.color || 'var(--accent-color)'}15`
                } : {}}
              >
                <span className="material-icons" style={{ color: tipo.color || 'var(--accent-color)' }}>
                  {tipo.icono || 'link'}
                </span>
                <span className="badge-count">{count}</span>
              </button>
            );
          })}
        </div>
        <span className="toolbar-current-filter">{tipoActual}</span>
      </div>
    );

    // Cambio de vista y filtro de pendientes
    setToolbarRightContent(
      <div className="toolbar-right">
        <button
          className={`btn-filter ${soloConPendientes ? 'active' : ''}`}
          onClick={() => setSoloConPendientes(!soloConPendientes)}
          title="Solo con visitas pendientes"
          style={{
            marginRight: '0.75rem',
            padding: '0.5rem 0.875rem',
            background: soloConPendientes ? 'var(--accent-color)' : 'transparent',
            color: soloConPendientes ? 'white' : 'var(--text-secondary)',
            border: '1px solid',
            borderColor: soloConPendientes ? 'var(--accent-color)' : 'var(--border-color)',
            borderRadius: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <span className="material-icons" style={{ fontSize: '1.125rem' }}>event_busy</span>
          <span>Pendientes</span>
        </button>
        <div className="view-toggle">
          <button
            className={`btn-view ${viewMode === 'mosaico' ? 'active' : ''}`}
            onClick={() => setViewMode('mosaico')}
            title="Vista Mosaico"
          >
            <span className="material-icons">grid_view</span>
          </button>
          <button
            className={`btn-view ${viewMode === 'lista' ? 'active' : ''}`}
            onClick={() => setViewMode('lista')}
            title="Vista Lista"
          >
            <span className="material-icons">view_list</span>
          </button>
        </div>
      </div>
    );
  };

  const handleRelacionClick = (relacion: Relacion) => {
    // Navegar a la página de detalle de la relación
    const tipo = tiposRelacion.find(t => t.id === relacion.tipoRelacionId);
    if (tipo) {
      navigate(`/relaciones/${tipo.subTipo}?id=${relacion.id}`);
    }
  };

  const getInteraccionesDisponibles = (tipoRelacionId: string): TipoInteraccion[] => {
    // Obtener el tipo de relación
    const tipoRelacion = tiposRelacion.find(t => t.id === tipoRelacionId);
    if (!tipoRelacion) return [];

    try {
      let interaccionesPermitidas: string[] = [];

      // Primero intentar leer de configuracionUI
      if (tipoRelacion.configuracionUI) {
        const config = JSON.parse(tipoRelacion.configuracionUI);
        interaccionesPermitidas = config.interactionsConfig || [];
      }

      // Si no hay en configuracionUI, intentar leer del schema (compatibilidad con versiones anteriores)
      if (interaccionesPermitidas.length === 0 && (tipoRelacion as any).schema) {
        const schema = typeof (tipoRelacion as any).schema === 'string'
          ? JSON.parse((tipoRelacion as any).schema)
          : (tipoRelacion as any).schema;
        interaccionesPermitidas = schema.interactionsConfig || [];
      }

      // Si no hay interacciones específicas configuradas, permitir todas
      if (interaccionesPermitidas.length === 0) {
        return tiposInteraccion;
      }

      // Filtrar solo las interacciones que están en la lista de permitidas
      const disponibles = tiposInteraccion.filter(tipoInt =>
        interaccionesPermitidas.includes(tipoInt.id)
      );

      return disponibles;
    } catch (error) {
      console.error('Error parsing configuracionUI:', error);
      return tiposInteraccion;
    }
  };

  const toggleMenuInteracciones = (e: React.MouseEvent, relacionId: string) => {
    e.stopPropagation();
    setMenuAbiertoId(menuAbiertoId === relacionId ? null : relacionId);
  };

  const handleCrearInteraccion = async (relacion: Relacion, tipoInteraccion: TipoInteraccion) => {
    try {
      // Abrir modal con datos pre-poblados
      setModalPrefilledData({
        relacionId: relacion.id,
        agenteId: relacion.agenteId,
        clienteId: relacion.clientePrincipalId,
        tipoInteraccionId: tipoInteraccion.id
      });
      setSelectedTipoInteraccion(tipoInteraccion);
      setShowInteractionModal(true);
      setMenuAbiertoId(null);
    } catch (error) {
      console.error('Error al abrir formulario de interacción:', error);
      alert('Error al abrir formulario de interacción');
    }
  };

  const handleModalClose = () => {
    setShowInteractionModal(false);
    setModalPrefilledData(null);
    setSelectedTipoInteraccion(null);
  };

  const handleModalSave = async () => {
    // Recargar relaciones después de guardar
    await loadData();
  };

  const getEstadoBadgeClass = (estado: string) => {
    switch (estado?.toLowerCase()) {
      case 'activa':
        return 'badge-success';
      case 'inactiva':
        return 'badge-danger';
      case 'pausada':
        return 'badge-warning';
      default:
        return 'badge-secondary';
    }
  };

  const getPrioridadBadgeClass = (prioridad: string) => {
    switch (prioridad?.toLowerCase()) {
      case 'alta':
        return 'badge-danger';
      case 'media':
        return 'badge-warning';
      case 'baja':
        return 'badge-info';
      default:
        return 'badge-secondary';
    }
  };

  if (loading) {
    return (
      <div className="mi-cartera-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando cartera...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mi-cartera-page">
      <div className="cartera-stats">
        <div className="stat-card">
          <span className="material-icons stat-icon">link</span>
          <div className="stat-info">
            <span className="stat-value">{Array.isArray(relacionesFiltradas) ? relacionesFiltradas.length : 0}</span>
            <span className="stat-label">Relaciones</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="material-icons stat-icon">check_circle</span>
          <div className="stat-info">
            <span className="stat-value">
              {Array.isArray(relacionesFiltradas) ? relacionesFiltradas.filter(r => r.estado === 'Activa').length : 0}
            </span>
            <span className="stat-label">Activas</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="material-icons stat-icon">priority_high</span>
          <div className="stat-info">
            <span className="stat-value">
              {Array.isArray(relacionesFiltradas) ? relacionesFiltradas.filter(r => r.prioridad === 'Alta').length : 0}
            </span>
            <span className="stat-label">Prioridad Alta</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="material-icons stat-icon">category</span>
          <div className="stat-info">
            <span className="stat-value">{Array.isArray(tiposRelacion) ? tiposRelacion.length : 0}</span>
            <span className="stat-label">Tipos</span>
          </div>
        </div>
      </div>

      {!Array.isArray(relacionesFiltradas) || relacionesFiltradas.length === 0 ? (
        <div className="empty-state">
          <span className="material-icons">folder_open</span>
          <h3>No se encontraron relaciones</h3>
          <p>
            {searchTerm || tipoFiltro !== 'todos'
              ? 'Intenta ajustar los filtros de búsqueda'
              : 'No tienes relaciones en tu cartera aún'}
          </p>
        </div>
      ) : (
        <div className={`relaciones-container view-${viewMode}`}>
          {viewMode === 'mosaico' ? (
            relacionesFiltradas.map(relacion => {
              const tipo = tiposRelacion.find(t => t.id === relacion.tipoRelacionId);
              const interaccionesDisponibles = getInteraccionesDisponibles(relacion.tipoRelacionId);
              const menuAbierto = menuAbiertoId === relacion.id;

              return (
                <div
                  key={relacion.id}
                  className="relacion-card frecuencia-container"
                  onClick={() => handleRelacionClick(relacion)}
                >
                  <FrecuenciaIndicator frecuencia={relacion.frecuencia} />
                  <div className="card-content-wrapper">
                  <div className="card-header">
                    <div className="card-icon" style={{ background: tipo?.color || '#4DB8B8' }}>
                      <span className="material-icons">{tipo?.icono || 'link'}</span>
                    </div>
                    <div className="card-title-section">
                      <h3 className="card-title">{relacion.codigoRelacion}</h3>
                      <span className="card-subtitle">{tipo?.nombre || 'Relación'}</span>
                    </div>
                    {interaccionesDisponibles.length > 0 && (
                      <div className="card-actions">
                        <button
                          className="btn-actions"
                          onClick={(e) => toggleMenuInteracciones(e, relacion.id)}
                          title="Crear interacción"
                        >
                          <span className="material-icons">add_circle</span>
                        </button>
                        {menuAbierto && (
                          <div className="actions-dropdown">
                            <div className="dropdown-header">
                              <span className="material-icons">assignment</span>
                              <span>Nueva Interacción</span>
                            </div>
                            <div className="dropdown-items">
                              {interaccionesDisponibles.map(tipoInt => (
                                <button
                                  key={tipoInt.id}
                                  className="dropdown-item"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCrearInteraccion(relacion, tipoInt);
                                  }}
                                >
                                  <span
                                    className="material-icons"
                                    style={{ color: tipoInt.color || 'var(--accent-color)' }}
                                  >
                                    {tipoInt.icono || 'assignment'}
                                  </span>
                                  <span>{tipoInt.nombre}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="card-content">
                    <div className="card-field">
                      <span className="material-icons field-icon">person</span>
                      <div className="field-content">
                        <span className="field-label">Cliente Principal</span>
                        <span className="field-value">{relacion.clientePrincipalNombre}</span>
                      </div>
                    </div>

                    <div className="card-field">
                      <span className="material-icons field-icon">badge</span>
                      <div className="field-content">
                        <span className="field-label">Agente</span>
                        <span className="field-value">{relacion.agenteNombre}</span>
                      </div>
                    </div>

                    {relacion.frecuenciaVisitas && (
                      <div className="card-field">
                        <span className="material-icons field-icon">schedule</span>
                        <div className="field-content">
                          <span className="field-label">Frecuencia</span>
                          <span className="field-value">{relacion.frecuenciaVisitas}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="card-footer">
                    <span className={`badge ${getEstadoBadgeClass(relacion.estado)}`}>
                      {relacion.estado}
                    </span>
                    {relacion.prioridad && (
                      <span className={`badge ${getPrioridadBadgeClass(relacion.prioridad)}`}>
                        {relacion.prioridad}
                      </span>
                    )}
                    <span className="card-date">
                      <span className="material-icons">event</span>
                      {new Date(relacion.fechaInicio).toLocaleDateString()}
                    </span>
                  </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="relaciones-table">
              <table>
                <thead>
                  <tr>
                    <th>Tipo</th>
                    <th>Código</th>
                    <th>Cliente Principal</th>
                    <th>Agente</th>
                    <th>Frecuencia</th>
                    <th>Estado</th>
                    <th>Prioridad</th>
                    <th>Fecha Inicio</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {relacionesFiltradas.map(relacion => {
                    const tipo = tiposRelacion.find(t => t.id === relacion.tipoRelacionId);
                    const interaccionesDisponibles = getInteraccionesDisponibles(relacion.tipoRelacionId);
                    const menuAbierto = menuAbiertoId === relacion.id;

                    return (
                      <tr
                        key={relacion.id}
                        onClick={() => handleRelacionClick(relacion)}
                        className="table-row-clickable"
                      >
                        <td style={{ position: 'relative' }}>
                          <FrecuenciaIndicator frecuencia={relacion.frecuencia} />
                          <div className="table-tipo">
                            <span className="material-icons" style={{ color: tipo?.color || '#4DB8B8' }}>
                              {tipo?.icono || 'link'}
                            </span>
                            <span>{tipo?.nombre || 'Relación'}</span>
                          </div>
                        </td>
                        <td><strong>{relacion.codigoRelacion}</strong></td>
                        <td>{relacion.clientePrincipalNombre}</td>
                        <td>{relacion.agenteNombre}</td>
                        <td>{relacion.frecuenciaVisitas || '-'}</td>
                        <td>
                          <span className={`badge ${getEstadoBadgeClass(relacion.estado)}`}>
                            {relacion.estado}
                          </span>
                        </td>
                        <td>
                          {relacion.prioridad ? (
                            <span className={`badge ${getPrioridadBadgeClass(relacion.prioridad)}`}>
                              {relacion.prioridad}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td>{new Date(relacion.fechaInicio).toLocaleDateString()}</td>
                        <td>
                          {interaccionesDisponibles.length > 0 && (
                            <div className="table-actions">
                              <button
                                className="btn-actions"
                                onClick={(e) => toggleMenuInteracciones(e, relacion.id)}
                                title="Crear interacción"
                              >
                                <span className="material-icons">add_circle</span>
                              </button>
                              {menuAbierto && (
                                <div className="actions-dropdown">
                                  <div className="dropdown-header">
                                    <span className="material-icons">assignment</span>
                                    <span>Nueva Interacción</span>
                                  </div>
                                  <div className="dropdown-items">
                                    {interaccionesDisponibles.map(tipoInt => (
                                      <button
                                        key={tipoInt.id}
                                        className="dropdown-item"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleCrearInteraccion(relacion, tipoInt);
                                        }}
                                      >
                                        <span
                                          className="material-icons"
                                          style={{ color: tipoInt.color || 'var(--accent-color)' }}
                                        >
                                          {tipoInt.icono || 'assignment'}
                                        </span>
                                        <span>{tipoInt.nombre}</span>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal de Interacción */}
      {selectedTipoInteraccion && (
        <InteractionFormModal
          isOpen={showInteractionModal}
          onClose={handleModalClose}
          onSave={handleModalSave}
          prefilledData={modalPrefilledData}
          esquema={selectedTipoInteraccion as any}
        />
      )}
    </div>
  );
};

export default MiCarteraPage;
