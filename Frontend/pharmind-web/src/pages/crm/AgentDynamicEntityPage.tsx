import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotifications } from '../../contexts/NotificationContext';
import { usePage } from '../../contexts/PageContext';
import api from '../../services/api';
import type { EsquemaPersonalizado } from '../../types/dynamic-entities';
import DynamicFormField from '../../components/dynamic/DynamicFormField';
import './CRMPages.css';

interface Agente {
  id: string;
  tipoAgenteId: string;
  tipoAgenteNombre?: string;
  codigoAgente: string;
  nombre: string;
  apellido?: string;
  email?: string;
  telefono?: string;
  regionId?: string;
  regionNombre?: string;
  distritoId?: string;
  distritoNombre?: string;
  lineaNegocioId?: string;
  lineaNegocioNombre?: string;
  managerId?: string;
  managerNombre?: string;
  timelineId?: string;
  timelineNombre?: string;
  fechaIngreso?: string;
  activo: boolean;
  observaciones?: string;
  datosDinamicos?: Record<string, any>;
  fechaCreacion: string;
  fechaModificacion?: string;
}

interface CreateAgenteDto {
  tipoAgenteId: string;
  codigoAgente: string;
  nombre: string;
  apellido?: string;
  email?: string;
  telefono?: string;
  regionId?: string;
  distritoId?: string;
  lineaNegocioId?: string;
  managerId?: string;
  timelineId?: string;
  fechaIngreso?: Date;
  activo: boolean;
  observaciones?: string;
  datosDinamicos?: Record<string, any>;
}

interface UpdateAgenteDto {
  nombre: string;
  apellido?: string;
  email?: string;
  telefono?: string;
  regionId?: string;
  distritoId?: string;
  lineaNegocioId?: string;
  managerId?: string;
  timelineId?: string;
  fechaIngreso?: Date;
  activo: boolean;
  observaciones?: string;
  datosDinamicos?: Record<string, any>;
}

interface Region {
  id: string;
  codigo: string;
  nombre: string;
}

interface Distrito {
  id: string;
  codigo: string;
  nombre: string;
}

interface LineaNegocio {
  id: string;
  codigo: string;
  nombre: string;
}

interface Manager {
  id: string;
  codigo: string;
  nombre: string;
}

interface Timeline {
  id: string;
  nombre: string;
  anio: number;
}

const AgentDynamicEntityPage = () => {
  const { subtipo } = useParams<{ subtipo: string }>();
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const { setToolbarContent, setToolbarCenterContent, setToolbarRightContent, clearToolbarContent } = usePage();

  const [esquema, setEsquema] = useState<EsquemaPersonalizado | null>(null);
  const [agentes, setAgentes] = useState<Agente[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAgente, setEditingAgente] = useState<Agente | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    const saved = localStorage.getItem('agentesViewMode');
    return (saved === 'list' || saved === 'grid') ? saved : 'list';
  });

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Opciones para selects
  const [regiones, setRegiones] = useState<Region[]>([]);
  const [distritos, setDistritos] = useState<Distrito[]>([]);
  const [lineasNegocio, setLineasNegocio] = useState<LineaNegocio[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [timelines, setTimelines] = useState<Timeline[]>([]);

  // Form state - Static fields
  const [formData, setFormData] = useState<CreateAgenteDto>({
    tipoAgenteId: '',
    codigoAgente: '',
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    regionId: '',
    distritoId: '',
    lineaNegocioId: '',
    managerId: '',
    fechaIngreso: undefined,
    activo: true,
    observaciones: '',
    datosDinamicos: {}
  });

  // Form state - Dynamic fields
  const [dynamicFormData, setDynamicFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    fetchEsquema();
    loadRegiones();
    loadDistritos();
    loadLineasNegocio();
    loadManagers();
    loadTimelines();
  }, [subtipo]);

  useEffect(() => {
    localStorage.setItem('agentesViewMode', viewMode);
  }, [viewMode]);

  useEffect(() => {
    if (esquema) {
      fetchAgentes();
    }
  }, [esquema]);

  // Actualizar toolbar cuando el esquema o estados cambien
  useEffect(() => {
    if (esquema) {
      // Izquierda: Icono + Título
      const toolbarLeft = (
        <>
          <div className="entity-icon" style={{
            backgroundColor: esquema.color || '#4db8b8',
            padding: '0.375rem',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '0.75rem',
            width: '32px',
            height: '32px'
          }}>
            <span className="material-icons" style={{ color: 'white', fontSize: '1.125rem' }}>{esquema.icono || 'badge'}</span>
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
              placeholder="Buscar agentes..."
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
          title={`Nuevo ${esquema.nombre}`}
          style={{
            backgroundColor: esquema.color || '#4db8b8',
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

  const fetchEsquema = async () => {
    if (!subtipo) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.get('/EsquemasPersonalizados/tipo/Agente');

      if (response.data) {
        const esquemas = response.data;

        // Try to find by subTipo (case-insensitive)
        let esquemaMatch = esquemas.find(
          (e: EsquemaPersonalizado) => e.subTipo?.toLowerCase() === subtipo?.toLowerCase()
        );

        // If not found by subTipo, try by nombre (case-insensitive)
        if (!esquemaMatch) {
          esquemaMatch = esquemas.find(
            (e: EsquemaPersonalizado) => e.nombre?.toLowerCase().includes(subtipo?.toLowerCase())
          );
        }

        // If only one schema exists for this type, use it
        if (!esquemaMatch && esquemas.length === 1) {
          esquemaMatch = esquemas[0];
        }

        if (esquemaMatch) {
          setEsquema(esquemaMatch);
          // Set tipoAgenteId in form data
          setFormData(prev => ({ ...prev, tipoAgenteId: esquemaMatch.id }));
        } else {
          addNotification({
            title: 'Error',
            message: `No se encontró el esquema especificado para "${subtipo}"`,
            type: 'error',
            category: 'system'
          });
        }
      }
    } catch (error) {
      console.error('Error fetching esquema:', error);
      addNotification({
        title: 'Error',
        message: 'No se pudo cargar el esquema',
        type: 'error',
        category: 'system'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAgentes = async () => {
    if (!esquema) return;

    try {
      const response = await api.get('/agentes', {
        params: { tipoAgenteId: esquema.id }
      });

      if (response.data) {
        setAgentes(response.data.items || response.data);
      }
    } catch (error) {
      console.error('Error fetching agentes:', error);
      addNotification({
        title: 'Error',
        message: 'No se pudieron cargar los agentes',
        type: 'error',
        category: 'agentes'
      });
    }
  };

  const loadRegiones = async () => {
    try {
      const response = await api.get('/regiones');
      setRegiones(response.data.items || response.data);
    } catch (error) {
      console.error('Error loading regiones:', error);
    }
  };

  const loadDistritos = async () => {
    try {
      const response = await api.get('/distritos');
      setDistritos(response.data.items || response.data);
    } catch (error) {
      console.error('Error loading distritos:', error);
    }
  };

  const loadLineasNegocio = async () => {
    try {
      const response = await api.get('/lineasnegocio');
      setLineasNegocio(response.data.items || response.data);
    } catch (error) {
      console.error('Error loading lineas de negocio:', error);
    }
  };

  const loadManagers = async () => {
    try {
      const response = await api.get('/managers');
      setManagers(response.data.items || response.data);
    } catch (error) {
      console.error('Error loading managers:', error);
    }
  };

  const loadTimelines = async () => {
    try {
      const response = await api.get('/timelines');
      setTimelines(response.data);
    } catch (error) {
      console.error('Error loading timelines:', error);
    }
  };

  const handleCreate = () => {
    setEditingAgente(null);
    setFormData({
      tipoAgenteId: esquema!.id,
      codigoAgente: '',
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      regionId: '',
      distritoId: '',
      lineaNegocioId: '',
      managerId: '',
      timelineId: '',
      fechaIngreso: undefined,
      activo: true,
      observaciones: '',
      datosDinamicos: {}
    });
    setDynamicFormData({});
    setShowModal(true);
  };

  const handleEdit = (agente: Agente) => {
    setEditingAgente(agente);
    setFormData({
      tipoAgenteId: agente.tipoAgenteId,
      codigoAgente: agente.codigoAgente,
      nombre: agente.nombre,
      apellido: agente.apellido || '',
      email: agente.email || '',
      telefono: agente.telefono || '',
      regionId: agente.regionId || '',
      distritoId: agente.distritoId || '',
      lineaNegocioId: agente.lineaNegocioId || '',
      managerId: agente.managerId || '',
      timelineId: agente.timelineId || '',
      fechaIngreso: agente.fechaIngreso ? new Date(agente.fechaIngreso) : undefined,
      activo: agente.activo,
      observaciones: agente.observaciones || '',
      datosDinamicos: agente.datosDinamicos || {}
    });
    setDynamicFormData(agente.datosDinamicos || {});
    setShowModal(true);
  };

  const handleDelete = async (agente: Agente) => {
    if (!confirm(`¿Está seguro de eliminar al agente ${agente.nombre}?`)) {
      return;
    }

    try {
      await api.delete(`/agentes/${agente.id}`);
      addNotification({
        title: 'Éxito',
        message: 'Agente eliminado correctamente',
        type: 'success',
        category: 'agentes'
      });
      fetchAgentes();
    } catch (error) {
      console.error('Error deleting agente:', error);
      addNotification({
        title: 'Error',
        message: 'No se pudo eliminar el agente',
        type: 'error',
        category: 'agentes'
      });
    }
  };

  const handleDynamicFieldChange = (fieldName: string, value: any) => {
    setDynamicFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const generateDemoData = async () => {
    try {
      // Preparar los campos estáticos
      const staticFields = [
        { name: 'codigoAgente', type: 'text', label: 'Código de Agente', required: true },
        { name: 'nombre', type: 'text', label: 'Nombre', required: true },
        { name: 'apellido', type: 'text', label: 'Apellido', required: false },
        { name: 'email', type: 'email', label: 'Email', required: false },
        { name: 'telefono', type: 'phone', label: 'Teléfono', required: false },
        { name: 'observaciones', type: 'textarea', label: 'Observaciones', required: false },
        { name: 'fechaIngreso', type: 'date', label: 'Fecha de Ingreso', required: false }
      ];

      // Preparar los campos dinámicos desde el esquema
      const schemaFields = getSchemaFields();
      const dynamicFields = schemaFields.map((field: any) => ({
        name: field.name,
        type: field.type,
        label: field.label || field.name,
        required: field.required || false,
        options: field.options?.map((opt: any) => typeof opt === 'string' ? opt : opt.value)
      }));

      // Llamar al endpoint de AI
      const response = await api.post('/ai/generate-demo-data', {
        entityType: 'Agente',
        subType: esquema?.subTipo || 'General',
        fields: [...staticFields, ...dynamicFields]
      });

      const demoData = response.data;

      // Separar datos estáticos y dinámicos
      const staticData: any = {};
      const dynamicData: any = {};

      Object.keys(demoData).forEach(key => {
        if (staticFields.some(f => f.name === key)) {
          staticData[key] = demoData[key];
        } else {
          dynamicData[key] = demoData[key];
        }
      });

      // Actualizar el formulario
      setFormData({
        ...formData,
        ...staticData,
        fechaIngreso: staticData.fechaIngreso ? new Date(staticData.fechaIngreso) : undefined,
        activo: true
      });

      setDynamicFormData(dynamicData);

      addNotification({
        title: 'Datos demo generados',
        message: 'Se han generado datos de demostración inteligentes para todos los campos',
        type: 'success',
        category: 'agentes'
      });
    } catch (error) {
      console.error('Error generating demo data:', error);
      addNotification({
        title: 'Error',
        message: 'No se pudieron generar los datos demo',
        type: 'error',
        category: 'agentes'
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!editingAgente) {
        // Create new agent
        const createDto: CreateAgenteDto = {
          ...formData,
          tipoAgenteId: esquema!.id, // Ensure tipoAgenteId is always set from the current schema
          datosDinamicos: Object.keys(dynamicFormData).length > 0 ? dynamicFormData : undefined,
          apellido: formData.apellido || undefined,
          email: formData.email || undefined,
          telefono: formData.telefono || undefined,
          regionId: formData.regionId || undefined,
          distritoId: formData.distritoId || undefined,
          lineaNegocioId: formData.lineaNegocioId || undefined,
          managerId: formData.managerId || undefined,
          timelineId: formData.timelineId || undefined,
          observaciones: formData.observaciones || undefined
        };

        await api.post('/agentes', createDto);
        addNotification({
          title: 'Éxito',
          message: 'Agente creado correctamente',
          type: 'success',
          category: 'agentes'
        });
      } else {
        // Update existing agent
        const updateDto: UpdateAgenteDto = {
          nombre: formData.nombre,
          datosDinamicos: Object.keys(dynamicFormData).length > 0 ? dynamicFormData : undefined,
          apellido: formData.apellido || undefined,
          email: formData.email || undefined,
          telefono: formData.telefono || undefined,
          regionId: formData.regionId || undefined,
          distritoId: formData.distritoId || undefined,
          lineaNegocioId: formData.lineaNegocioId || undefined,
          managerId: formData.managerId || undefined,
          timelineId: formData.timelineId || undefined,
          fechaIngreso: formData.fechaIngreso,
          activo: formData.activo,
          observaciones: formData.observaciones || undefined
        };

        await api.put(`/agentes/${editingAgente.id}`, updateDto);
        addNotification({
          title: 'Éxito',
          message: 'Agente actualizado correctamente',
          type: 'success',
          category: 'agentes'
        });
      }

      setShowModal(false);
      fetchAgentes();
    } catch (error: any) {
      console.error('Error saving agente:', error);
      addNotification({
        title: 'Error',
        message: error.response?.data?.message || 'No se pudo guardar el agente',
        type: 'error',
        category: 'agentes'
      });
    }
  };

  const getSchemaFields = () => {
    try {
      const schema = JSON.parse(esquema!.schema);
      const fields = schema.fields || [];
      // Sort fields by position (row, col) to respect visual layout
      return fields.sort((a: any, b: any) => {
        const rowA = a.position?.row ?? 0;
        const rowB = b.position?.row ?? 0;
        const colA = a.position?.col ?? 0;
        const colB = b.position?.col ?? 0;

        // First sort by row, then by column
        if (rowA !== rowB) {
          return rowA - rowB;
        }
        return colA - colB;
      });
    } catch {
      return [];
    }
  };

  // Helper functions for static fields configuration
  const getStaticFieldConfig = (fieldName: string) => {
    try {
      const schema = JSON.parse(esquema!.schema);
      return schema.staticFieldsConfig?.campos?.[fieldName] || null;
    } catch {
      return null;
    }
  };

  const isStaticFieldVisible = (fieldName: string): boolean => {
    const config = getStaticFieldConfig(fieldName);
    // Si no hay configuración, no mostrar el campo
    if (!config) return false;
    // Si hay configuración, verificar la propiedad visible (default true si existe config)
    return config.visible !== false;
  };

  const isStaticFieldRequired = (fieldName: string): boolean => {
    const config = getStaticFieldConfig(fieldName);
    if (!config) return false;
    return config.requerido === true;
  };

  const getStaticFieldLabel = (fieldName: string, defaultLabel: string): string => {
    const config = getStaticFieldConfig(fieldName);
    if (!config) return defaultLabel;
    return config.label || defaultLabel;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const filteredAgentes = agentes.filter(agente => {
    const searchLower = searchQuery.toLowerCase();
    return (
      agente.codigoAgente.toLowerCase().includes(searchLower) ||
      agente.nombre.toLowerCase().includes(searchLower) ||
      agente.apellido?.toLowerCase().includes(searchLower) ||
      agente.email?.toLowerCase().includes(searchLower) ||
      agente.regionNombre?.toLowerCase().includes(searchLower) ||
      agente.distritoNombre?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando...</p>
      </div>
    );
  }

  if (!esquema) {
    return (
      <div className="empty-state">
        <span className="material-icons">error_outline</span>
        <h3>Esquema no encontrado</h3>
        <p>No se pudo cargar la configuración de este tipo de agente</p>
        <button className="btn btn-secondary" onClick={() => navigate('/crm/agentes')}>
          Volver a Agentes
        </button>
      </div>
    );
  }

  return (
    <div className="page-container">
      {viewMode === 'grid' ? (
        <div className="entities-grid">
          {filteredAgentes.map((agente) => (
            <div key={agente.id} className="entity-card">
              <div className="entity-body">
                <div className="entity-title">
                  <h3>{agente.nombre} {agente.apellido}</h3>
                  <span className={`badge badge-${agente.activo ? 'activo' : 'inactivo'}`}>
                    {agente.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                <div className="entity-details">
                  <div className="entity-field">
                    <span className="field-label">Código:</span>
                    <span className="field-value">{agente.codigoAgente}</span>
                  </div>
                  {agente.email && (
                    <div className="entity-field">
                      <span className="field-label">Email:</span>
                      <span className="field-value">{agente.email}</span>
                    </div>
                  )}
                  {agente.telefono && (
                    <div className="entity-field">
                      <span className="field-label">Teléfono:</span>
                      <span className="field-value">{agente.telefono}</span>
                    </div>
                  )}
                  {agente.regionNombre && (
                    <div className="entity-field">
                      <span className="field-label">Región:</span>
                      <span className="field-value">{agente.regionNombre}</span>
                    </div>
                  )}
                  {agente.datosDinamicos && Object.keys(agente.datosDinamicos).length > 0 && (
                    <span className="more-fields">+{Object.keys(agente.datosDinamicos).length} campos adicionales</span>
                  )}
                </div>
              </div>
              <div className="entity-actions">
                <button
                  className="btn-icon btn-icon-edit"
                  onClick={() => handleEdit(agente)}
                  title="Editar"
                >
                  <span className="material-icons">edit</span>
                </button>
                <button
                  className="btn-icon btn-icon-delete"
                  onClick={() => handleDelete(agente)}
                  title="Eliminar"
                >
                  <span className="material-icons">delete</span>
                </button>
              </div>
            </div>
          ))}

          {filteredAgentes.length === 0 && (
            <div className="empty-state">
              <span className="material-icons">inbox</span>
              <h3>No hay agentes</h3>
              <p>Crea tu primer agente para comenzar</p>
              <button className="btn btn-primary" onClick={handleCreate}>
                <span className="material-icons">add</span>
                Crear Agente
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="entities-list">
          {filteredAgentes.length === 0 ? (
            <div className="empty-state">
              <span className="material-icons">inbox</span>
              <h3>No hay agentes</h3>
              <p>Crea tu primer agente para comenzar</p>
              <button className="btn btn-primary" onClick={handleCreate}>
                <span className="material-icons">add</span>
                Crear Agente
              </button>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Teléfono</th>
                    <th>Región</th>
                    <th>Distrito</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAgentes.map((agente) => (
                    <tr key={agente.id}>
                      <td><strong>{agente.codigoAgente}</strong></td>
                      <td>{agente.nombre} {agente.apellido}</td>
                      <td>{agente.email || '-'}</td>
                      <td>{agente.telefono || '-'}</td>
                      <td>{agente.regionNombre || '-'}</td>
                      <td>{agente.distritoNombre || '-'}</td>
                      <td>
                        <span className={`badge badge-${agente.activo ? 'activo' : 'inactivo'}`}>
                          {agente.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-icon btn-icon-edit"
                            onClick={() => handleEdit(agente)}
                            title="Editar"
                          >
                            <span className="material-icons">edit</span>
                          </button>
                          <button
                            className="btn-icon btn-icon-delete"
                            onClick={() => handleDelete(agente)}
                            title="Eliminar"
                          >
                            <span className="material-icons">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {editingAgente ? 'Editar' : 'Nuevo'} {esquema.nombre}
              </h2>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                {!editingAgente && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={generateDemoData}
                    title="Generar datos de demostración"
                  >
                    <span className="material-icons" style={{ fontSize: '18px' }}>auto_awesome</span>
                    Demo
                  </button>
                )}
                <button className="btn-close" onClick={() => setShowModal(false)}>
                  <span className="material-icons">close</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {/* Section 1: Información Base */}
                <div className="form-section">
                  <h3 className="form-section-title">Información Base</h3>
                  <div className="form-grid">
                    {isStaticFieldVisible('CodigoAgente') && (
                      <div className="form-group">
                        <label>{getStaticFieldLabel('CodigoAgente', 'Código de Agente')}{isStaticFieldRequired('CodigoAgente') ? ' *' : ''}</label>
                        <input
                          type="text"
                          value={formData.codigoAgente}
                          onChange={(e) => setFormData({ ...formData, codigoAgente: e.target.value })}
                          className="form-control"
                          required={isStaticFieldRequired('CodigoAgente')}
                          disabled={!!editingAgente}
                        />
                      </div>
                    )}

                    {isStaticFieldVisible('Nombre') && (
                      <div className="form-group">
                        <label>{getStaticFieldLabel('Nombre', 'Nombre')}{isStaticFieldRequired('Nombre') ? ' *' : ''}</label>
                        <input
                          type="text"
                          value={formData.nombre}
                          onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                          className="form-control"
                          required={isStaticFieldRequired('Nombre')}
                        />
                      </div>
                    )}

                    {isStaticFieldVisible('Apellido') && (
                      <div className="form-group">
                        <label>{getStaticFieldLabel('Apellido', 'Apellido')}{isStaticFieldRequired('Apellido') ? ' *' : ''}</label>
                        <input
                          type="text"
                          value={formData.apellido}
                          onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                          className="form-control"
                          required={isStaticFieldRequired('Apellido')}
                        />
                      </div>
                    )}

                    {isStaticFieldVisible('Email') && (
                      <div className="form-group">
                        <label>{getStaticFieldLabel('Email', 'Email')}{isStaticFieldRequired('Email') ? ' *' : ''}</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="form-control"
                          required={isStaticFieldRequired('Email')}
                        />
                      </div>
                    )}

                    {isStaticFieldVisible('Telefono') && (
                      <div className="form-group">
                        <label>{getStaticFieldLabel('Telefono', 'Teléfono')}{isStaticFieldRequired('Telefono') ? ' *' : ''}</label>
                        <input
                          type="tel"
                          value={formData.telefono}
                          onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                          className="form-control"
                          required={isStaticFieldRequired('Telefono')}
                        />
                      </div>
                    )}

                    {isStaticFieldVisible('FechaIngreso') && (
                      <div className="form-group">
                        <label>{getStaticFieldLabel('FechaIngreso', 'Fecha de Ingreso')}{isStaticFieldRequired('FechaIngreso') ? ' *' : ''}</label>
                        <input
                          type="date"
                          value={formData.fechaIngreso ? new Date(formData.fechaIngreso).toISOString().split('T')[0] : ''}
                          onChange={(e) => setFormData({ ...formData, fechaIngreso: e.target.value ? new Date(e.target.value) : undefined })}
                          className="form-control"
                          required={isStaticFieldRequired('FechaIngreso')}
                        />
                      </div>
                    )}

                    {isStaticFieldVisible('Activo') && (
                      <div className="form-group">
                        <label>{getStaticFieldLabel('Activo', 'Estado')}{isStaticFieldRequired('Activo') ? ' *' : ''}</label>
                        <select
                          value={formData.activo ? 'true' : 'false'}
                          onChange={(e) => setFormData({ ...formData, activo: e.target.value === 'true' })}
                          className="form-control"
                          required={isStaticFieldRequired('Activo')}
                        >
                          <option value="true">Activo</option>
                          <option value="false">Inactivo</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                {/* Section 2: Asignaciones */}
                {(isStaticFieldVisible('RegionId') || isStaticFieldVisible('DistritoId') || isStaticFieldVisible('LineaNegocioId') || isStaticFieldVisible('ManagerId') || isStaticFieldVisible('TimelineId')) && (
                  <div className="form-section">
                    <h3 className="form-section-title">Asignaciones</h3>
                    <div className="form-grid">
                      {isStaticFieldVisible('RegionId') && (
                        <div className="form-group">
                          <label>{getStaticFieldLabel('RegionId', 'Región')}{isStaticFieldRequired('RegionId') ? ' *' : ''}</label>
                          <select
                            value={formData.regionId}
                            onChange={(e) => setFormData({ ...formData, regionId: e.target.value })}
                            className="form-control"
                            required={isStaticFieldRequired('RegionId')}
                          >
                            <option value="">Seleccione región</option>
                            {regiones.map(region => (
                              <option key={region.id} value={region.id}>
                                {region.codigo} - {region.nombre}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {isStaticFieldVisible('DistritoId') && (
                        <div className="form-group">
                          <label>{getStaticFieldLabel('DistritoId', 'Distrito')}{isStaticFieldRequired('DistritoId') ? ' *' : ''}</label>
                          <select
                            value={formData.distritoId}
                            onChange={(e) => setFormData({ ...formData, distritoId: e.target.value })}
                            className="form-control"
                            required={isStaticFieldRequired('DistritoId')}
                          >
                            <option value="">Seleccione distrito</option>
                            {distritos.map(distrito => (
                              <option key={distrito.id} value={distrito.id}>
                                {distrito.codigo} - {distrito.nombre}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {isStaticFieldVisible('LineaNegocioId') && (
                        <div className="form-group">
                          <label>{getStaticFieldLabel('LineaNegocioId', 'Línea de Negocio')}{isStaticFieldRequired('LineaNegocioId') ? ' *' : ''}</label>
                          <select
                            value={formData.lineaNegocioId}
                            onChange={(e) => setFormData({ ...formData, lineaNegocioId: e.target.value })}
                            className="form-control"
                            required={isStaticFieldRequired('LineaNegocioId')}
                          >
                            <option value="">Seleccione línea de negocio</option>
                            {lineasNegocio.map(linea => (
                              <option key={linea.id} value={linea.id}>
                                {linea.codigo} - {linea.nombre}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {isStaticFieldVisible('ManagerId') && (
                        <div className="form-group">
                          <label>{getStaticFieldLabel('ManagerId', 'Manager')}{isStaticFieldRequired('ManagerId') ? ' *' : ''}</label>
                          <select
                            value={formData.managerId}
                            onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                            className="form-control"
                            required={isStaticFieldRequired('ManagerId')}
                          >
                            <option value="">Seleccione manager</option>
                            {managers.map(manager => (
                              <option key={manager.id} value={manager.id}>
                                {manager.codigo} - {manager.nombre}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {isStaticFieldVisible('TimelineId') && (
                        <div className="form-group">
                          <label>{getStaticFieldLabel('TimelineId', 'Timeline')}{isStaticFieldRequired('TimelineId') ? ' *' : ''}</label>
                          <select
                            value={formData.timelineId}
                            onChange={(e) => setFormData({ ...formData, timelineId: e.target.value })}
                            className="form-control"
                            required={isStaticFieldRequired('TimelineId')}
                          >
                            <option value="">Seleccione timeline</option>
                            {timelines.map(timeline => (
                              <option key={timeline.id} value={timeline.id}>
                                {timeline.nombre} ({timeline.anio})
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Section 3: Observaciones */}
                {isStaticFieldVisible('Observaciones') && (
                  <div className="form-section">
                    <h3 className="form-section-title">Observaciones</h3>
                    <div className="form-group">
                      <label>{getStaticFieldLabel('Observaciones', 'Observaciones')}{isStaticFieldRequired('Observaciones') ? ' *' : ''}</label>
                      <textarea
                        value={formData.observaciones}
                        onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                        className="form-control"
                        rows={3}
                        placeholder="Observaciones adicionales..."
                        required={isStaticFieldRequired('Observaciones')}
                      />
                    </div>
                  </div>
                )}

                {/* Section 4: Campos Adicionales (Dynamic fields) */}
                {getSchemaFields().length > 0 && (
                  <div className="form-section">
                    <h3 className="form-section-title">Campos Adicionales</h3>
                    <div className="form-grid">
                      {getSchemaFields().map((field: any) => (
                        <DynamicFormField
                          key={field.name}
                          field={field}
                          value={dynamicFormData[field.name]}
                          onChange={handleDynamicFieldChange}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingAgente ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentDynamicEntityPage;
