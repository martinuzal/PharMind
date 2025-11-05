import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import DynamicFormField from '../../components/dynamic/DynamicFormField';
import { usePage } from '../../contexts/PageContext';
import './CRMPages.css';

interface Schema {
  id: string;
  nombre: string;
  descripcion?: string;
  tipoEntidad: string;
  subTipo: string;
  schema: string;
  icono?: string;
  color?: string;
}

interface Interaction {
  id: string;
  tipoInteraccionId: string;
  tipoInteraccionNombre?: string;
  entidadDinamicaId?: string;
  datosDinamicos?: Record<string, any>;
  codigoInteraccion: string;
  relacionId: string;
  relacionCodigo?: string;
  agenteId: string;
  agenteNombre?: string;
  clienteId: string;
  clienteNombre?: string;
  tipoInteraccion: string;
  fecha: string;
  turno?: string;
  duracionMinutos?: number;
  resultado?: string;
  objetivoVisita?: string;
  resumenVisita?: string;
  proximaAccion?: string;
  fechaProximaAccion?: string;
  latitud?: number;
  longitud?: number;
  observaciones?: string;
}

interface Relacion {
  id: string;
  codigoRelacion: string;
  tipoRelacionNombre?: string;
  clientePrincipalNombre?: string;
}

interface Agent {
  id: string;
  nombre: string;
  apellido?: string;
  codigoAgente: string;
}

interface Client {
  id: string;
  nombre?: string;
  apellido?: string;
  razonSocial?: string;
  codigoCliente: string;
}

interface TipoRelacion {
  id: string;
  nombre: string;
  subTipo: string;
}

interface EntitiesConfig {
  relacionesPermitidas?: string[];
}

const InteractionDynamicEntityPage: React.FC = () => {
  const { subtipo } = useParams<{ subtipo: string }>();
  const navigate = useNavigate();
  const { setToolbarContent, setToolbarCenterContent, setToolbarRightContent, clearToolbarContent } = usePage();

  const [esquema, setEsquema] = useState<Schema | null>(null);
  const [interacciones, setInteracciones] = useState<Interaction[]>([]);
  const [relaciones, setRelaciones] = useState<Relacion[]>([]);
  const [agentes, setAgentes] = useState<Agent[]>([]);
  const [clientes, setClientes] = useState<Client[]>([]);
  const [tiposRelacion, setTiposRelacion] = useState<TipoRelacion[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingInteraccion, setEditingInteraccion] = useState<Interaction | null>(null);
  const [formData, setFormData] = useState<any>({
    codigoInteraccion: '',
    relacionId: '',
    agenteId: '',
    clienteId: '',
    tipoInteraccion: '',
    fecha: new Date().toISOString().split('T')[0],
    turno: '',
    duracionMinutos: 0,
    resultado: '',
    objetivoVisita: '',
    resumenVisita: '',
    proximaAccion: '',
    fechaProximaAccion: '',
    latitud: null,
    longitud: null,
    observaciones: ''
  });
  const [dynamicFormData, setDynamicFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadEsquema();
    loadRelaciones();
    loadAgentes();
    loadClientes();
    loadTiposRelacion();
  }, [subtipo]);

  useEffect(() => {
    if (esquema) {
      loadInteracciones();
    }
  }, [esquema]);

  // Actualizar toolbar cuando el esquema o estados cambien
  useEffect(() => {
    if (esquema) {
      // Izquierda: Icono + Título
      const toolbarLeft = (
        <>
          <div className="entity-icon" style={{
            backgroundColor: esquema.color || '#10B981',
            padding: '0.375rem',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '0.75rem',
            width: '32px',
            height: '32px'
          }}>
            <span className="material-icons" style={{ color: 'white', fontSize: '1.125rem' }}>{esquema.icono || 'assignment'}</span>
          </div>
          <span style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>{esquema.nombre}</span>
        </>
      );

      // Centro: Búsqueda + Vista
      const toolbarCenter = (
        <>
          <div className="search-box" style={{ marginRight: '0.5rem' }}>
            <span className="material-icons search-icon">search</span>
            <input
              type="text"
              placeholder="Buscar interacciones..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="view-toggle">
            <button
              className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="Vista Lista"
            >
              <span className="material-icons">view_list</span>
            </button>
            <button
              className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Vista Mosaico"
            >
              <span className="material-icons">grid_view</span>
            </button>
          </div>
        </>
      );

      // Derecha: Botón de agregar
      const toolbarRight = (
        <button
          className="toolbar-icon-btn"
          onClick={handleCreate}
          title="Nueva Interacción"
          style={{
            backgroundColor: esquema.color || '#10B981',
            color: 'white',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <span className="material-icons">add</span>
        </button>
      );

      setToolbarContent(toolbarLeft);
      setToolbarCenterContent(toolbarCenter);
      setToolbarRightContent(toolbarRight);
    }

    return () => {
      clearToolbarContent();
    };
  }, [esquema, searchQuery, viewMode]);

  const loadEsquema = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/esquemaspersonalizados/tipo/Interaccion/subtipo/${subtipo}`);
      setEsquema(response.data);
      setError(null);
    } catch (err: any) {
      console.error('Error al cargar esquema:', err);
      setError(err.response?.data?.message || 'Error al cargar el esquema');
    } finally {
      setLoading(false);
    }
  };

  const loadInteracciones = async () => {
    if (!esquema) return;

    try {
      const response = await api.get('/interacciones', {
        params: { page: 1, pageSize: 100 }
      });

      // Filtrar interacciones por TipoInteraccionId
      const interaccionesFiltradas = response.data.items.filter(
        (int: Interaction) => int.tipoInteraccionId === esquema.id
      );

      setInteracciones(interaccionesFiltradas);
    } catch (err: any) {
      console.error('Error al cargar interacciones:', err);
      setError(err.response?.data?.message || 'Error al cargar las interacciones');
    }
  };

  const loadRelaciones = async () => {
    try {
      const response = await api.get('/relaciones', {
        params: { page: 1, pageSize: 500 }
      });
      setRelaciones(response.data.items || []);
    } catch (err) {
      console.error('Error al cargar relaciones:', err);
    }
  };

  const loadAgentes = async () => {
    try {
      const response = await api.get('/agentes', {
        params: { page: 1, pageSize: 500 }
      });
      setAgentes(response.data.items || []);
    } catch (err) {
      console.error('Error al cargar agentes:', err);
    }
  };

  const loadClientes = async () => {
    try {
      const response = await api.get('/clientes', {
        params: { page: 1, pageSize: 500 }
      });
      setClientes(response.data.items || []);
    } catch (err) {
      console.error('Error al cargar clientes:', err);
    }
  };

  const loadTiposRelacion = async () => {
    try {
      const response = await api.get('/esquemaspersonalizados/tipo/Relacion');
      setTiposRelacion(response.data || []);
    } catch (err) {
      console.error('Error al cargar tipos de relación:', err);
    }
  };

  const generateInteractionCode = () => {
    const timestamp = Date.now();
    return `INT-${timestamp}`;
  };

  const handleCreate = () => {
    const code = generateInteractionCode();
    setFormData({
      codigoInteraccion: code,
      relacionId: '',
      agenteId: '',
      clienteId: '',
      tipoInteraccion: '',
      fecha: new Date().toISOString().split('T')[0],
      turno: '',
      duracionMinutos: 0,
      resultado: '',
      objetivoVisita: '',
      resumenVisita: '',
      proximaAccion: '',
      fechaProximaAccion: '',
      latitud: null,
      longitud: null,
      observaciones: ''
    });
    setDynamicFormData({});
    setEditingInteraccion(null);
    setShowModal(true);
  };

  const handleEdit = (interaccion: Interaction) => {
    setFormData({
      codigoInteraccion: interaccion.codigoInteraccion,
      relacionId: interaccion.relacionId,
      agenteId: interaccion.agenteId,
      clienteId: interaccion.clienteId,
      tipoInteraccion: interaccion.tipoInteraccion,
      fecha: interaccion.fecha.split('T')[0],
      turno: interaccion.turno || '',
      duracionMinutos: interaccion.duracionMinutos || 0,
      resultado: interaccion.resultado || '',
      objetivoVisita: interaccion.objetivoVisita || '',
      resumenVisita: interaccion.resumenVisita || '',
      proximaAccion: interaccion.proximaAccion || '',
      fechaProximaAccion: interaccion.fechaProximaAccion ? interaccion.fechaProximaAccion.split('T')[0] : '',
      latitud: interaccion.latitud || null,
      longitud: interaccion.longitud || null,
      observaciones: interaccion.observaciones || ''
    });
    setDynamicFormData(interaccion.datosDinamicos || {});
    setEditingInteraccion(interaccion);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar esta interacción?')) return;

    try {
      await api.delete(`/interacciones/${id}`);
      await loadInteracciones();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al eliminar la interacción');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!esquema) return;

    // Validate required fields
    if (!formData.relacionId) {
      alert('Debe seleccionar una Relación');
      return;
    }

    if (!formData.agenteId) {
      alert('Debe seleccionar un Agente');
      return;
    }

    if (!formData.clienteId) {
      alert('Debe seleccionar un Cliente');
      return;
    }

    try {
      if (editingInteraccion) {
        // Para actualización, usar UpdateInteraccionDto con PascalCase
        const updatePayload = {
          DatosDinamicos: dynamicFormData,
          TipoInteraccion: formData.tipoInteraccion,
          Fecha: formData.fecha,
          Turno: formData.turno || null,
          DuracionMinutos: formData.duracionMinutos || null,
          Resultado: formData.resultado,
          ObjetivoVisita: formData.objetivoVisita,
          ResumenVisita: formData.resumenVisita,
          ProximaAccion: formData.proximaAccion,
          FechaProximaAccion: formData.fechaProximaAccion || null,
          Latitud: formData.latitud || null,
          Longitud: formData.longitud || null,
          Observaciones: formData.observaciones
        };
        await api.put(`/interacciones/${editingInteraccion.id}`, updatePayload);
      } else {
        // Para creación, usar CreateInteraccionDto con PascalCase
        const createPayload = {
          TipoInteraccionId: esquema.id,
          DatosDinamicos: dynamicFormData,
          CodigoInteraccion: formData.codigoInteraccion,
          RelacionId: formData.relacionId,
          AgenteId: formData.agenteId,
          ClienteId: formData.clienteId,
          TipoInteraccion: formData.tipoInteraccion,
          Fecha: formData.fecha,
          Turno: formData.turno || null,
          DuracionMinutos: formData.duracionMinutos || null,
          Resultado: formData.resultado,
          ObjetivoVisita: formData.objetivoVisita,
          ResumenVisita: formData.resumenVisita,
          ProximaAccion: formData.proximaAccion,
          FechaProximaAccion: formData.fechaProximaAccion || null,
          Latitud: formData.latitud || null,
          Longitud: formData.longitud || null,
          Observaciones: formData.observaciones
        };
        await api.post('/interacciones', createPayload);
      }

      setShowModal(false);
      await loadInteracciones();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al guardar la interacción');
    }
  };

  const getSchemaFields = () => {
    if (!esquema || !esquema.schema) return [];

    try {
      const schemaObj = typeof esquema.schema === 'string'
        ? JSON.parse(esquema.schema)
        : esquema.schema;

      return schemaObj.fields || schemaObj.campos || [];
    } catch (error) {
      console.error('Error parsing schema:', error);
      return [];
    }
  };

  const getEntitiesConfig = (): EntitiesConfig => {
    if (!esquema || !esquema.schema) return {};

    try {
      const schemaObj = typeof esquema.schema === 'string'
        ? JSON.parse(esquema.schema)
        : esquema.schema;

      return schemaObj.entitiesConfig || {};
    } catch (error) {
      console.error('Error parsing entitiesConfig:', error);
      return {};
    }
  };

  const filterRelacionesByType = (allowedTypes: string[]) => {
    if (!allowedTypes || allowedTypes.length === 0) {
      return relaciones;
    }
    return relaciones.filter(rel => allowedTypes.includes(rel.id));
  };

  const handleStaticFieldChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleDynamicFieldChange = (field: string, value: any) => {
    setDynamicFormData({ ...dynamicFormData, [field]: value });
  };

  const getClientDisplayName = (client: Client) => {
    if (client.nombre && client.apellido) {
      return `${client.nombre} ${client.apellido}`;
    }
    return client.nombre || client.razonSocial || client.codigoCliente;
  };

  const getAgentDisplayName = (agent: Agent) => {
    if (agent.apellido) {
      return `${agent.nombre} ${agent.apellido}`;
    }
    return agent.nombre;
  };

  const filteredInteracciones = interacciones.filter(int => {
    const searchLower = searchQuery.toLowerCase();
    return (
      int.codigoInteraccion.toLowerCase().includes(searchLower) ||
      int.relacionCodigo?.toLowerCase().includes(searchLower) ||
      int.agenteNombre?.toLowerCase().includes(searchLower) ||
      int.clienteNombre?.toLowerCase().includes(searchLower) ||
      int.resultado?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="dynamic-entity-page">
        <div className="loading">Cargando...</div>
      </div>
    );
  }

  if (error || !esquema) {
    return (
      <div className="dynamic-entity-page">
        <div className="error-state">
          <span className="material-icons">error_outline</span>
          <h3>Error</h3>
          <p>{error || 'No se pudo cargar el esquema'}</p>
          <button onClick={() => navigate('/crm')} className="btn btn-secondary">
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dynamic-entity-page" style={{ paddingTop: '2rem' }}>
      {viewMode === 'grid' ? (
        <div className="entities-grid">
          {filteredInteracciones.map((interaccion) => (
            <div key={interaccion.id} className="entity-card">
              <div className="entity-body">
                <div className="entity-title">
                  <h3>{interaccion.codigoInteraccion}</h3>
                  {interaccion.resultado && (
                    <span className={`badge badge-${interaccion.resultado.toLowerCase()}`}>
                      {interaccion.resultado}
                    </span>
                  )}
                </div>
                <div className="entity-details">
                  <div className="entity-field">
                    <span className="field-label">Tipo:</span>
                    <span className="field-value">{interaccion.tipoInteraccionNombre || esquema.nombre}</span>
                  </div>
                  <div className="entity-field">
                    <span className="field-label">Relación:</span>
                    <span className="field-value">{interaccion.relacionCodigo || 'N/A'}</span>
                  </div>
                  <div className="entity-field">
                    <span className="field-label">Agente:</span>
                    <span className="field-value">{interaccion.agenteNombre || 'N/A'}</span>
                  </div>
                  <div className="entity-field">
                    <span className="field-label">Cliente:</span>
                    <span className="field-value">{interaccion.clienteNombre || 'N/A'}</span>
                  </div>
                  <div className="entity-field">
                    <span className="field-label">Fecha:</span>
                    <span className="field-value">{new Date(interaccion.fecha).toLocaleDateString()}</span>
                  </div>
                  {interaccion.duracionMinutos && (
                    <div className="entity-field">
                      <span className="field-label">Duración:</span>
                      <span className="field-value">{interaccion.duracionMinutos} min</span>
                    </div>
                  )}
                  {interaccion.datosDinamicos && Object.keys(interaccion.datosDinamicos).length > 0 && (
                    <span className="more-fields">+{Object.keys(interaccion.datosDinamicos).length} campos adicionales</span>
                  )}
                </div>
              </div>
              <div className="entity-actions">
                <button
                  className="btn-icon btn-icon-edit"
                  onClick={() => handleEdit(interaccion)}
                  title="Editar"
                >
                  <span className="material-icons">edit</span>
                </button>
                <button
                  className="btn-icon btn-icon-delete"
                  onClick={() => handleDelete(interaccion.id)}
                  title="Eliminar"
                >
                  <span className="material-icons">delete</span>
                </button>
              </div>
            </div>
          ))}

          {filteredInteracciones.length === 0 && (
            <div className="empty-state">
              <span className="material-icons">inbox</span>
              <h3>No hay interacciones</h3>
              <p>Crea tu primera interacción para comenzar</p>
              <button className="btn btn-primary" onClick={handleCreate}>
                <span className="material-icons">add</span>
                Nueva Interacción
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="entities-list">
          {filteredInteracciones.map((interaccion) => (
            <div key={interaccion.id} className="entity-list-item">
              <div className="entity-list-content">
                <div className="entity-list-main">
                  <h3>{interaccion.codigoInteraccion}</h3>
                  <p className="entity-list-subtitle">{interaccion.tipoInteraccionNombre || esquema.nombre}</p>
                </div>
                <div className="entity-list-details">
                  <span>{interaccion.relacionCodigo}</span>
                  <span className="separator">•</span>
                  <span>{interaccion.agenteNombre}</span>
                  <span className="separator">•</span>
                  <span>{new Date(interaccion.fecha).toLocaleDateString()}</span>
                  {interaccion.resultado && (
                    <>
                      <span className="separator">•</span>
                      <span className={`badge badge-${interaccion.resultado.toLowerCase()}`}>
                        {interaccion.resultado}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="entity-list-actions">
                <button
                  className="btn-icon btn-icon-edit"
                  onClick={() => handleEdit(interaccion)}
                  title="Editar"
                >
                  <span className="material-icons">edit</span>
                </button>
                <button
                  className="btn-icon btn-icon-delete"
                  onClick={() => handleDelete(interaccion.id)}
                  title="Eliminar"
                >
                  <span className="material-icons">delete</span>
                </button>
              </div>
            </div>
          ))}

          {filteredInteracciones.length === 0 && (
            <div className="empty-state">
              <span className="material-icons">inbox</span>
              <h3>No hay interacciones</h3>
              <p>Crea tu primera interacción para comenzar</p>
              <button className="btn btn-primary" onClick={handleCreate}>
                <span className="material-icons">add</span>
                Nueva Interacción
              </button>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleSubmit}>
              <div className="modal-header">
                <h2>
                  {editingInteraccion ? 'Editar' : 'Nueva'} {esquema.nombre}
                </h2>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}>
                  <span className="material-icons">close</span>
                </button>
              </div>

              <div className="modal-body">
                {/* Static Fields */}
                <div className="form-section">
                  <h3>Información General</h3>

                  <div className="form-field">
                    <label>Código de Interacción *</label>
                    <input
                      type="text"
                      value={formData.codigoInteraccion}
                      readOnly
                      className="readonly"
                    />
                    <small>Código generado automáticamente</small>
                  </div>

                  <div className="form-field">
                    <label>Relación *</label>
                    <select
                      value={formData.relacionId}
                      onChange={(e) => handleStaticFieldChange('relacionId', e.target.value)}
                      required
                    >
                      <option value="">Seleccione una relación</option>
                      {(() => {
                        const entitiesConfig = getEntitiesConfig();
                        const allowedTypes = entitiesConfig.relacionesPermitidas || [];
                        const filteredRels = filterRelacionesByType(allowedTypes);

                        return filteredRels.map(rel => (
                          <option key={rel.id} value={rel.id}>
                            {rel.codigoRelacion} - {rel.clientePrincipalNombre || 'N/A'}
                          </option>
                        ));
                      })()}
                    </select>
                  </div>

                  <div className="form-field">
                    <label>Agente *</label>
                    <select
                      value={formData.agenteId}
                      onChange={(e) => handleStaticFieldChange('agenteId', e.target.value)}
                      required
                    >
                      <option value="">Seleccione un agente</option>
                      {agentes.map(agent => (
                        <option key={agent.id} value={agent.id}>
                          {getAgentDisplayName(agent)} ({agent.codigoAgente})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-field">
                    <label>Cliente *</label>
                    <select
                      value={formData.clienteId}
                      onChange={(e) => handleStaticFieldChange('clienteId', e.target.value)}
                      required
                    >
                      <option value="">Seleccione un cliente</option>
                      {clientes.map(client => (
                        <option key={client.id} value={client.id}>
                          {getClientDisplayName(client)} ({client.codigoCliente})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-row">
                    <div className="form-field">
                      <label>Fecha *</label>
                      <input
                        type="date"
                        value={formData.fecha}
                        onChange={(e) => handleStaticFieldChange('fecha', e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-field">
                      <label>Turno</label>
                      <select
                        value={formData.turno}
                        onChange={(e) => handleStaticFieldChange('turno', e.target.value)}
                      >
                        <option value="">Seleccione un turno</option>
                        <option value="Mañana">Mañana</option>
                        <option value="Tarde">Tarde</option>
                        <option value="TodoElDia">Todo el Día</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-field">
                      <label>Tipo de Interacción</label>
                      <input
                        type="text"
                        value={formData.tipoInteraccion}
                        onChange={(e) => handleStaticFieldChange('tipoInteraccion', e.target.value)}
                        placeholder="Ej: Visita, Llamada, Email"
                      />
                    </div>

                    <div className="form-field">
                      <label>Duración (minutos)</label>
                      <input
                        type="number"
                        value={formData.duracionMinutos}
                        onChange={(e) => handleStaticFieldChange('duracionMinutos', parseInt(e.target.value) || 0)}
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="form-field">
                    <label>Resultado</label>
                    <select
                      value={formData.resultado}
                      onChange={(e) => handleStaticFieldChange('resultado', e.target.value)}
                    >
                      <option value="">Seleccione un resultado</option>
                      <option value="Exitosa">Exitosa</option>
                      <option value="NoContacto">No Contacto</option>
                      <option value="Rechazada">Rechazada</option>
                      <option value="Pendiente">Pendiente</option>
                    </select>
                  </div>

                  <div className="form-field">
                    <label>Objetivo de la Visita</label>
                    <textarea
                      value={formData.objetivoVisita}
                      onChange={(e) => handleStaticFieldChange('objetivoVisita', e.target.value)}
                      rows={2}
                      placeholder="Describa el objetivo de la visita"
                    />
                  </div>

                  <div className="form-field">
                    <label>Resumen de la Visita</label>
                    <textarea
                      value={formData.resumenVisita}
                      onChange={(e) => handleStaticFieldChange('resumenVisita', e.target.value)}
                      rows={3}
                      placeholder="Resumen de lo tratado en la visita"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-field">
                      <label>Próxima Acción</label>
                      <input
                        type="text"
                        value={formData.proximaAccion}
                        onChange={(e) => handleStaticFieldChange('proximaAccion', e.target.value)}
                        placeholder="Describa la próxima acción"
                      />
                    </div>

                    <div className="form-field">
                      <label>Fecha Próxima Acción</label>
                      <input
                        type="date"
                        value={formData.fechaProximaAccion}
                        onChange={(e) => handleStaticFieldChange('fechaProximaAccion', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-field">
                      <label>Latitud</label>
                      <input
                        type="number"
                        step="0.0000001"
                        value={formData.latitud || ''}
                        onChange={(e) => handleStaticFieldChange('latitud', parseFloat(e.target.value) || null)}
                        placeholder="Ej: -34.603722"
                      />
                    </div>

                    <div className="form-field">
                      <label>Longitud</label>
                      <input
                        type="number"
                        step="0.0000001"
                        value={formData.longitud || ''}
                        onChange={(e) => handleStaticFieldChange('longitud', parseFloat(e.target.value) || null)}
                        placeholder="Ej: -58.381592"
                      />
                    </div>
                  </div>

                  <div className="form-field">
                    <label>Observaciones</label>
                    <textarea
                      value={formData.observaciones}
                      onChange={(e) => handleStaticFieldChange('observaciones', e.target.value)}
                      rows={3}
                      placeholder="Observaciones adicionales"
                    />
                  </div>
                </div>

                {/* Dynamic Fields */}
                {getSchemaFields().length > 0 && (
                  <div className="form-section">
                    <h3 className="form-section-title">Campos Adicionales</h3>
                    <div className="form-grid">
                      {getSchemaFields().map((field: any) => (
                        <DynamicFormField
                          key={field.name}
                          field={field}
                          value={dynamicFormData[field.name]}
                          onChange={(value) => handleDynamicFieldChange(field.name, value)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingInteraccion ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractionDynamicEntityPage;
