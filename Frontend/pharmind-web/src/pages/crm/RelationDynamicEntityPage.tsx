import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import DynamicFormField from '../../components/dynamic/DynamicFormField';
import InteractionFormModal from '../../components/modals/InteractionFormModal';
import DireccionForm from '../../components/direccion/DireccionForm';
import type { DireccionData } from '../../components/direccion/DireccionForm';
import EntityFilterBuilder, { type ActiveFilter } from '../../components/filters/EntityFilterBuilder';
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

interface Relation {
  id: string;
  tipoRelacionId: string;
  tipoRelacionNombre?: string;
  entidadDinamicaId?: string;
  datosDinamicos?: Record<string, any>;
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
  frecuenciaVisitas?: number;
  prioridad?: string;
  observaciones?: string;
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
  tipoClienteId: string;
}

interface TipoCliente {
  id: string;
  nombre: string;
  subTipo: string;
  schema?: string;
}

interface ClientFieldConfig {
  visible: boolean;
  requerido: boolean;
  tiposPermitidos: string[];
  etiqueta: string;
}

interface ClientesConfig {
  clientePrincipal?: ClientFieldConfig;
  clienteSecundario1?: ClientFieldConfig;
  clienteSecundario2?: ClientFieldConfig;
}

interface TipoInteraccion {
  id: string;
  nombre: string;
  subTipo: string;
  icono?: string;
  color?: string;
}

const RelationDynamicEntityPage: React.FC = () => {
  const { subtipo } = useParams<{ subtipo: string }>();
  const navigate = useNavigate();
  const { setToolbarContent, setToolbarCenterContent, setToolbarRightContent, setFiltersButton, clearToolbarContent } = usePage();

  const [esquema, setEsquema] = useState<Schema | null>(null);
  const [relaciones, setRelaciones] = useState<Relation[]>([]);
  const [agentes, setAgentes] = useState<Agent[]>([]);
  const [clientes, setClientes] = useState<Client[]>([]);
  const [tiposCliente, setTiposCliente] = useState<TipoCliente[]>([]);
  const [tiposInteraccion, setTiposInteraccion] = useState<TipoInteraccion[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [menuAbiertoId, setMenuAbiertoId] = useState<string | null>(null);
  const [editingRelacion, setEditingRelacion] = useState<Relation | null>(null);
  const [formData, setFormData] = useState<any>({
    codigoRelacion: '',
    agenteId: '',
    clientePrincipalId: '',
    clienteSecundario1Id: '',
    clienteSecundario2Id: '',
    tipoRelacion: '',
    fechaInicio: new Date().toISOString().split('T')[0],
    fechaFin: '',
    estado: 'Activa',
    frecuenciaVisitas: 1,
    prioridad: 'Media',
    observaciones: ''
  });
  const [dynamicFormData, setDynamicFormData] = useState<Record<string, any>>({});
  const [direccionData, setDireccionData] = useState<DireccionData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [showInteractionModal, setShowInteractionModal] = useState(false);
  const [modalPrefilledData, setModalPrefilledData] = useState<any>(null);
  const [selectedTipoInteraccion, setSelectedTipoInteraccion] = useState<TipoInteraccion | null>(null);
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadEsquema();
    loadAgentes();
    loadClientes();
    loadTiposCliente();
    loadTiposInteraccion();
  }, [subtipo]);

  useEffect(() => {
    if (esquema) {
      loadRelaciones();
    }
  }, [esquema]);

  // Actualizar toolbar cuando el esquema o estados cambien
  useEffect(() => {
    if (esquema) {
      // Izquierda: Icono + Título
      const toolbarLeft = (
        <>
          <div className="entity-icon" style={{
            backgroundColor: esquema.color || '#3B82F6',
            padding: '0.375rem',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '0.75rem',
            width: '32px',
            height: '32px'
          }}>
            <span className="material-icons" style={{ color: 'white', fontSize: '1.125rem' }}>{esquema.icono || 'link'}</span>
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
              placeholder="Buscar relaciones..."
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
          title="Nueva Relación"
          style={{
            backgroundColor: esquema.color || '#3B82F6',
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
      setFiltersButton(true, activeFilters.length, () => setShowFilters(!showFilters));
    }

    return () => {
      clearToolbarContent();
    };
  }, [esquema, searchQuery, viewMode, activeFilters.length, showFilters]);

  const loadEsquema = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/esquemaspersonalizados/tipo/Relacion/subtipo/${subtipo}`);
      setEsquema(response.data);
      setError(null);
    } catch (err: any) {
      console.error('Error al cargar esquema:', err);
      setError(err.response?.data?.message || 'Error al cargar el esquema');
    } finally {
      setLoading(false);
    }
  };

  const loadRelaciones = async () => {
    if (!esquema) return;

    try {
      const response = await api.get('/relaciones', {
        params: { page: 1, pageSize: 100 }
      });

      // Filtrar relaciones por TipoRelacionId
      const relacionesFiltradas = response.data.items.filter(
        (rel: Relation) => rel.tipoRelacionId === esquema.id
      );

      setRelaciones(relacionesFiltradas);
    } catch (err: any) {
      console.error('Error al cargar relaciones:', err);
      setError(err.response?.data?.message || 'Error al cargar las relaciones');
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

  const loadTiposCliente = async () => {
    try {
      const response = await api.get('/esquemaspersonalizados/tipo/Cliente');
      setTiposCliente(response.data || []);
    } catch (err) {
      console.error('Error al cargar tipos de cliente:', err);
    }
  };

  const loadTiposInteraccion = async () => {
    try {
      const response = await api.get('/esquemaspersonalizados/tipo/Interaccion');
      setTiposInteraccion(response.data || []);
    } catch (err) {
      console.error('Error al cargar tipos de interacción:', err);
    }
  };

  const generateRelationCode = () => {
    const timestamp = Date.now();
    return `REL-${timestamp}`;
  };

  const handleCreate = () => {
    const code = generateRelationCode();
    setFormData({
      codigoRelacion: code,
      agenteId: '',
      clientePrincipalId: '',
      clienteSecundario1Id: '',
      clienteSecundario2Id: '',
      tipoRelacion: '',
      fechaInicio: new Date().toISOString().split('T')[0],
      fechaFin: '',
      estado: 'Activa',
      frecuenciaVisitas: 1,
      prioridad: 'Media',
      observaciones: ''
    });
    setDynamicFormData({});
    setEditingRelacion(null);
    setShowModal(true);
  };

  const handleEdit = (relacion: Relation) => {
    setFormData({
      codigoRelacion: relacion.codigoRelacion,
      agenteId: relacion.agenteId,
      clientePrincipalId: relacion.clientePrincipalId,
      clienteSecundario1Id: relacion.clienteSecundario1Id || '',
      clienteSecundario2Id: relacion.clienteSecundario2Id || '',
      tipoRelacion: relacion.tipoRelacion || '',
      fechaInicio: relacion.fechaInicio.split('T')[0],
      fechaFin: relacion.fechaFin ? relacion.fechaFin.split('T')[0] : '',
      estado: relacion.estado,
      frecuenciaVisitas: relacion.frecuenciaVisitas || 1,
      prioridad: relacion.prioridad || 'Media',
      observaciones: relacion.observaciones || ''
    });
    setDynamicFormData(relacion.datosDinamicos || {});
    setEditingRelacion(relacion);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar esta relación?')) return;

    try {
      await api.delete(`/relaciones/${id}`);
      await loadRelaciones();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al eliminar la relación');
    }
  };

  // Obtener interacciones disponibles según configuración del tipo de relación
  const getInteraccionesDisponibles = (tipoRelacionId: string): TipoInteraccion[] => {
    if (!esquema) return [];

    try {
      let interaccionesPermitidas: string[] = [];

      // Intentar leer desde configuracionUI del esquema
      if (esquema.schema) {
        const schema = JSON.parse(esquema.schema);
        const configuracionUI = schema.configuracionUI || {};
        interaccionesPermitidas = configuracionUI.interactionsConfig || [];
      }

      // Si no hay configuración, permitir todas
      if (interaccionesPermitidas.length === 0) {
        return tiposInteraccion;
      }

      // Filtrar solo las interacciones permitidas
      return tiposInteraccion.filter(tipoInt =>
        interaccionesPermitidas.includes(tipoInt.id)
      );
    } catch (error) {
      console.error('Error parsing schema configuracionUI:', error);
      return tiposInteraccion;
    }
  };

  // Manejar creación de interacción desde relación
  const handleCrearInteraccion = async (relacion: Relation, tipoInteraccion: TipoInteraccion) => {
    try {
      // Cargar esquema completo de la interacción
      const esquemaResponse = await api.get(`/esquemaspersonalizados/tipo/Interaccion/subtipo/${tipoInteraccion.subTipo}`);

      // Preparar datos prellenados
      setModalPrefilledData({
        relacionId: relacion.id,
        agenteId: relacion.agenteId,
        clienteId: relacion.clientePrincipalId,
        tipoInteraccionId: tipoInteraccion.id
      });

      // Configurar esquema seleccionado
      setSelectedTipoInteraccion({
        ...tipoInteraccion,
        ...esquemaResponse.data
      });

      // Abrir modal
      setShowInteractionModal(true);
      setMenuAbiertoId(null);
    } catch (error) {
      console.error('Error al cargar esquema de interacción:', error);
      alert('Error al abrir formulario de interacción');
    }
  };

  const handleInteractionModalClose = () => {
    setShowInteractionModal(false);
    setModalPrefilledData(null);
    setSelectedTipoInteraccion(null);
  };

  const handleInteractionModalSave = async () => {
    // Opcionalmente recargar datos si es necesario
    console.log('Interacción guardada exitosamente');
  };

  const generateDemoData = async () => {
    if (!esquema) return;

    try {
      // Static fields for Relacion
      const staticFields = [
        { name: 'tipoRelacion', type: 'text', label: 'Tipo de Relación', required: false },
        { name: 'frecuenciaVisitas', type: 'select', label: 'Frecuencia de Visitas', required: false, options: ['Semanal', 'Quincenal', 'Mensual', 'Bimensual', 'Trimestral'] },
        { name: 'observaciones', type: 'textarea', label: 'Observaciones', required: false }
      ];

      // Dynamic fields from schema
      const schemaFields = getSchemaFields();
      const dynamicFields = schemaFields.map((field: any) => ({
        name: field.name || field.nombre,
        type: field.type || field.tipo,
        label: field.label || field.etiqueta || field.name || field.nombre,
        required: field.required || field.requerido || false,
        options: field.options?.map((opt: any) => typeof opt === 'string' ? opt : opt.value) || field.opciones
      }));

      const response = await api.post('/ai/generate-demo-data', {
        entityType: 'Relacion',
        subType: esquema.subTipo,
        fields: [...staticFields, ...dynamicFields]
      });

      const demoData = response.data;

      // Separate static and dynamic data
      const staticData: any = {};
      const dynamicData: any = {};

      Object.keys(demoData).forEach(key => {
        if (staticFields.some(f => f.name === key)) {
          staticData[key] = demoData[key];
        } else {
          dynamicData[key] = demoData[key];
        }
      });

      // Randomly select an agent and client if available
      if (agentes.length > 0) {
        staticData.agenteId = agentes[Math.floor(Math.random() * agentes.length)].id;
      }
      if (clientes.length > 0) {
        staticData.clientePrincipalId = clientes[Math.floor(Math.random() * clientes.length)].id;
      }

      setFormData({ ...formData, ...staticData });
      setDynamicFormData(dynamicData);
    } catch (err) {
      console.error('Error generating demo data:', err);
      alert('Error al generar datos de demostración');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!esquema) return;

    const clientesConfig = getClientesConfig();

    // Validate required fields
    if (!formData.agenteId) {
      alert('Debe seleccionar un Agente');
      return;
    }

    // Validar Cliente Principal según configuración
    const clientePrincipalConfig = clientesConfig.clientePrincipal;
    const isClientePrincipalVisible = clientePrincipalConfig?.visible !== false;
    const isClientePrincipalRequired = clientePrincipalConfig?.requerido !== false;

    if (isClientePrincipalVisible && isClientePrincipalRequired && !formData.clientePrincipalId) {
      const label = clientePrincipalConfig?.etiqueta || 'Cliente Principal';
      alert(`Debe seleccionar ${label}`);
      return;
    }

    // Validar Cliente Secundario 1 según configuración
    const clienteSecundario1Config = clientesConfig.clienteSecundario1;
    if (clienteSecundario1Config?.visible && clienteSecundario1Config?.requerido && !formData.clienteSecundario1Id) {
      const label = clienteSecundario1Config?.etiqueta || 'Cliente Secundario 1';
      alert(`Debe seleccionar ${label}`);
      return;
    }

    // Validar Cliente Secundario 2 según configuración
    const clienteSecundario2Config = clientesConfig.clienteSecundario2;
    if (clienteSecundario2Config?.visible && clienteSecundario2Config?.requerido && !formData.clienteSecundario2Id) {
      const label = clienteSecundario2Config?.etiqueta || 'Cliente Secundario 2';
      alert(`Debe seleccionar ${label}`);
      return;
    }

    try {
      if (editingRelacion) {
        // Para actualización, usar UpdateRelacionDto con PascalCase
        const updatePayload = {
          DatosDinamicos: dynamicFormData,
          ClienteSecundario1Id: formData.clienteSecundario1Id || null,
          ClienteSecundario2Id: formData.clienteSecundario2Id || null,
          TipoRelacion: formData.tipoRelacion,
          FechaInicio: formData.fechaInicio,
          FechaFin: formData.fechaFin || null,
          Estado: formData.estado,
          FrecuenciaVisitas: formData.frecuenciaVisitas,
          Prioridad: formData.prioridad,
          Observaciones: formData.observaciones
        };
        await api.put(`/relaciones/${editingRelacion.id}`, updatePayload);
      } else {
        // Para creación, usar CreateRelacionDto con PascalCase
        const createPayload = {
          TipoRelacionId: esquema.id,
          DatosDinamicos: dynamicFormData,
          CodigoRelacion: formData.codigoRelacion,
          AgenteId: formData.agenteId,
          ClientePrincipalId: formData.clientePrincipalId,
          ClienteSecundario1Id: formData.clienteSecundario1Id || null,
          ClienteSecundario2Id: formData.clienteSecundario2Id || null,
          TipoRelacion: formData.tipoRelacion,
          FechaInicio: formData.fechaInicio,
          FechaFin: formData.fechaFin || null,
          Estado: formData.estado,
          FrecuenciaVisitas: formData.frecuenciaVisitas,
          Prioridad: formData.prioridad,
          Observaciones: formData.observaciones
        };
        await api.post('/relaciones', createPayload);
      }

      setShowModal(false);
      await loadRelaciones();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al guardar la relación');
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

  const getClientesConfig = (): ClientesConfig => {
    if (!esquema || !esquema.schema) return {};

    try {
      const schemaObj = typeof esquema.schema === 'string'
        ? JSON.parse(esquema.schema)
        : esquema.schema;

      return schemaObj.clientesConfig || {};
    } catch (error) {
      console.error('Error parsing clientesConfig:', error);
      return {};
    }
  };

  const filterClientesByType = (allowedTypes: string[]) => {
    if (!allowedTypes || allowedTypes.length === 0) {
      return clientes;
    }
    return clientes.filter(client => allowedTypes.includes(client.tipoClienteId));
  };

  const handleStaticFieldChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleDynamicFieldChange = (field: string, value: any) => {
    setDynamicFormData({ ...dynamicFormData, [field]: value });
  };

  const getClientDisplayName = (client: Client) => {
    // Find the client's tipo (schema)
    const tipoCliente = tiposCliente.find(t => t.id === client.tipoClienteId);

    if (tipoCliente?.schema) {
      try {
        const schema = JSON.parse(tipoCliente.schema);
        const tipoEntidad = schema.staticFieldsConfig?.tipoEntidad || 'Persona';

        if (tipoEntidad === 'Persona') {
          // For Persona: concatenate nombre + apellido
          const nombre = client.nombre || '';
          const apellido = client.apellido || '';
          return `${nombre} ${apellido}`.trim() || client.razonSocial || client.codigoCliente;
        } else {
          // For Entidad (institution): use razonSocial
          return client.razonSocial || `${client.nombre || ''} ${client.apellido || ''}`.trim() || client.codigoCliente;
        }
      } catch {
        // Fallback if schema parsing fails
      }
    }

    // Fallback logic if no schema or error
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

  const getClientTypeLabel = (allowedTypes: string[], fallbackLabel: string) => {
    if (!allowedTypes || allowedTypes.length === 0) {
      return fallbackLabel;
    }
    const typeNames = allowedTypes
      .map(id => tiposCliente.find(t => t.id === id)?.nombre)
      .filter(Boolean);
    return typeNames.length > 0 ? typeNames.join(' / ') : fallbackLabel;
  };

  const getClientFieldLabel = (fieldName: 'clientePrincipal' | 'clienteSecundario1' | 'clienteSecundario2') => {
    const clientesConfig = getClientesConfig();
    const config = clientesConfig[fieldName];

    if (!config) {
      const fallbacks = {
        clientePrincipal: 'Cliente Principal',
        clienteSecundario1: 'Cliente Secundario 1',
        clienteSecundario2: 'Cliente Secundario 2'
      };
      return fallbacks[fieldName];
    }

    const allowedTypes = config.tiposPermitidos || [];
    const fallbacks = {
      clientePrincipal: 'Cliente Principal',
      clienteSecundario1: 'Cliente Secundario 1',
      clienteSecundario2: 'Cliente Secundario 2'
    };

    return getClientTypeLabel(allowedTypes, fallbacks[fieldName]);
  };

  const handleFiltersChange = (filters: ActiveFilter[]) => {
    setActiveFilters(filters);
  };

  const applyFilters = (relacion: Relation): boolean => {
    // Si no hay filtros activos, mostrar todo
    if (activeFilters.length === 0) return true;

    // Aplicar cada filtro
    for (const filter of activeFilters) {
      let fieldValue: any;
      let matches = false;

      // Obtener el valor del campo
      if (filter.field.startsWith('dynamic.')) {
        const dynamicField = filter.field.replace('dynamic.', '');
        fieldValue = relacion.datosDinamicos?.[dynamicField];
      } else {
        // Campo estático
        fieldValue = (relacion as any)[filter.field];
      }

      // Aplicar operador
      switch (filter.operator) {
        case 'eq':
          matches = fieldValue == filter.value;
          break;
        case 'neq':
          matches = fieldValue != filter.value;
          break;
        case 'contains':
          matches = fieldValue?.toString().toLowerCase().includes(filter.value?.toString().toLowerCase());
          break;
        case 'startsWith':
          matches = fieldValue?.toString().toLowerCase().startsWith(filter.value?.toString().toLowerCase());
          break;
        case 'endsWith':
          matches = fieldValue?.toString().toLowerCase().endsWith(filter.value?.toString().toLowerCase());
          break;
        case 'gt':
          matches = fieldValue > filter.value;
          break;
        case 'gte':
          matches = fieldValue >= filter.value;
          break;
        case 'lt':
          matches = fieldValue < filter.value;
          break;
        case 'lte':
          matches = fieldValue <= filter.value;
          break;
        case 'between':
          matches = fieldValue >= filter.value && fieldValue <= filter.value2;
          break;
        case 'in':
          matches = Array.isArray(filter.value) && filter.value.includes(fieldValue);
          break;
        case 'notIn':
          matches = Array.isArray(filter.value) && !filter.value.includes(fieldValue);
          break;
        case 'isNull':
          matches = fieldValue == null || fieldValue === '';
          break;
        case 'isNotNull':
          matches = fieldValue != null && fieldValue !== '';
          break;
        default:
          matches = true;
      }

      // Si es el primer filtro o el operador lógico es AND, aplicar AND
      if (filter.logicalOperator === 'AND' || !filter.logicalOperator) {
        if (!matches) return false;
      } else {
        // Si el operador lógico es OR, aplicar OR (TODO: mejorar lógica para grupos)
        if (matches) return true;
      }
    }

    return true;
  };

  const filteredRelaciones = relaciones.filter(rel => {
    // Aplicar búsqueda de texto
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || (
      rel.codigoRelacion.toLowerCase().includes(searchLower) ||
      rel.agenteNombre?.toLowerCase().includes(searchLower) ||
      rel.clientePrincipalNombre?.toLowerCase().includes(searchLower) ||
      rel.estado.toLowerCase().includes(searchLower)
    );

    // Aplicar filtros avanzados
    const matchesFilters = applyFilters(rel);

    return matchesSearch && matchesFilters;
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
      {/* Panel de Filtros */}
      {showFilters && esquema && (
        <div style={{ marginBottom: '1.5rem' }}>
          <EntityFilterBuilder
            esquema={esquema}
            onFiltersChange={handleFiltersChange}
            initialFilters={activeFilters}
          />
        </div>
      )}

      {viewMode === 'grid' ? (
        <div className="entities-grid">
          {filteredRelaciones.map((relacion) => (
            <div key={relacion.id} className="entity-card">
              <div className="entity-body">
                <div className="entity-title">
                  <h3>{relacion.codigoRelacion}</h3>
                  <span className={`badge badge-${relacion.estado.toLowerCase()}`}>
                    {relacion.estado}
                  </span>
                </div>
                <div className="entity-details">
                  <div className="entity-field">
                    <span className="field-label">Tipo:</span>
                    <span className="field-value">{relacion.tipoRelacionNombre || esquema.nombre}</span>
                  </div>
                  <div className="entity-field">
                    <span className="field-label">Agente:</span>
                    <span className="field-value">{relacion.agenteNombre || 'N/A'}</span>
                  </div>
                  <div className="entity-field">
                    <span className="field-label">{getClientFieldLabel('clientePrincipal')}:</span>
                    <span className="field-value">{relacion.clientePrincipalNombre || 'N/A'}</span>
                  </div>
                  {relacion.clienteSecundario1Nombre && (
                    <div className="entity-field">
                      <span className="field-label">{getClientFieldLabel('clienteSecundario1')}:</span>
                      <span className="field-value">{relacion.clienteSecundario1Nombre}</span>
                    </div>
                  )}
                  {relacion.clienteSecundario2Nombre && (
                    <div className="entity-field">
                      <span className="field-label">{getClientFieldLabel('clienteSecundario2')}:</span>
                      <span className="field-value">{relacion.clienteSecundario2Nombre}</span>
                    </div>
                  )}
                  <div className="entity-field">
                    <span className="field-label">Fecha Inicio:</span>
                    <span className="field-value">{new Date(relacion.fechaInicio).toLocaleDateString()}</span>
                  </div>
                  {relacion.prioridad && (
                    <div className="entity-field">
                      <span className="field-label">Prioridad:</span>
                      <span className="field-value">
                        <span className={`badge badge-${relacion.prioridad.toLowerCase()}`}>
                          {relacion.prioridad}
                        </span>
                      </span>
                    </div>
                  )}
                  {relacion.datosDinamicos && Object.keys(relacion.datosDinamicos).length > 0 && (
                    <span className="more-fields">+{Object.keys(relacion.datosDinamicos).length} campos adicionales</span>
                  )}
                </div>
              </div>
              <div className="entity-actions">
                <button
                  className="btn-icon btn-icon-edit"
                  onClick={() => handleEdit(relacion)}
                  title="Editar"
                >
                  <span className="material-icons">edit</span>
                </button>
                <button
                  className="btn-icon btn-icon-delete"
                  onClick={() => handleDelete(relacion.id)}
                  title="Eliminar"
                >
                  <span className="material-icons">delete</span>
                </button>
                <div style={{ position: 'relative' }}>
                  <button
                    className="btn-icon btn-icon-primary"
                    onClick={() => setMenuAbiertoId(menuAbiertoId === relacion.id ? null : relacion.id)}
                    title="Nueva Interacción"
                  >
                    <span className="material-icons">add_circle</span>
                  </button>
                  {menuAbiertoId === relacion.id && (
                    <>
                      <div
                        style={{
                          position: 'fixed',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          zIndex: 999
                        }}
                        onClick={() => setMenuAbiertoId(null)}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          top: '100%',
                          right: 0,
                          marginTop: '0.5rem',
                          backgroundColor: 'white',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                          minWidth: '200px',
                          zIndex: 1000,
                          maxHeight: '300px',
                          overflowY: 'auto'
                        }}
                      >
                        {getInteraccionesDisponibles(relacion.tipoRelacionId).length > 0 ? (
                          getInteraccionesDisponibles(relacion.tipoRelacionId).map((tipoInt) => (
                            <button
                              key={tipoInt.id}
                              onClick={() => handleCrearInteraccion(relacion, tipoInt)}
                              style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                border: 'none',
                                backgroundColor: 'transparent',
                                textAlign: 'left',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                fontSize: '0.9rem',
                                transition: 'background-color 0.2s'
                              }}
                              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--hover-bg)'}
                              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                              <span
                                className="material-icons"
                                style={{
                                  fontSize: '1.25rem',
                                  color: tipoInt.color || '#10B981'
                                }}
                              >
                                {tipoInt.icono || 'assignment'}
                              </span>
                              <span>{tipoInt.nombre}</span>
                            </button>
                          ))
                        ) : (
                          <div style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                            No hay tipos de interacción configurados para este tipo de relación
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filteredRelaciones.length === 0 && (
            <div className="empty-state">
              <span className="material-icons">inbox</span>
              <h3>No hay relaciones</h3>
              <p>Crea tu primera relación para comenzar</p>
              <button className="btn btn-primary" onClick={handleCreate}>
                <span className="material-icons">add</span>
                Nueva Relación
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="entities-list">
          {filteredRelaciones.map((relacion) => (
            <div key={relacion.id} className="entity-list-item">
              <div className="entity-list-content">
                <div className="entity-list-main">
                  <h3>{relacion.codigoRelacion}</h3>
                  <p className="entity-list-subtitle">{relacion.tipoRelacionNombre || esquema.nombre}</p>
                </div>
                <div className="entity-list-details">
                  <span>{relacion.agenteNombre}</span>
                  <span className="separator">•</span>
                  <span>{relacion.clientePrincipalNombre}</span>
                  <span className="separator">•</span>
                  <span>{new Date(relacion.fechaInicio).toLocaleDateString()}</span>
                  <span className={`badge badge-${relacion.estado.toLowerCase()}`}>
                    {relacion.estado}
                  </span>
                </div>
              </div>
              <div className="entity-list-actions">
                <button
                  className="btn-icon btn-icon-edit"
                  onClick={() => handleEdit(relacion)}
                  title="Editar"
                >
                  <span className="material-icons">edit</span>
                </button>
                <button
                  className="btn-icon btn-icon-delete"
                  onClick={() => handleDelete(relacion.id)}
                  title="Eliminar"
                >
                  <span className="material-icons">delete</span>
                </button>
                <div style={{ position: 'relative' }}>
                  <button
                    className="btn-icon btn-icon-primary"
                    onClick={() => setMenuAbiertoId(menuAbiertoId === relacion.id ? null : relacion.id)}
                    title="Nueva Interacción"
                  >
                    <span className="material-icons">add_circle</span>
                  </button>
                  {menuAbiertoId === relacion.id && (
                    <>
                      <div
                        style={{
                          position: 'fixed',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          zIndex: 999
                        }}
                        onClick={() => setMenuAbiertoId(null)}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          top: '100%',
                          right: 0,
                          marginTop: '0.5rem',
                          backgroundColor: 'white',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                          minWidth: '200px',
                          zIndex: 1000,
                          maxHeight: '300px',
                          overflowY: 'auto'
                        }}
                      >
                        {getInteraccionesDisponibles(relacion.tipoRelacionId).length > 0 ? (
                          getInteraccionesDisponibles(relacion.tipoRelacionId).map((tipoInt) => (
                            <button
                              key={tipoInt.id}
                              onClick={() => handleCrearInteraccion(relacion, tipoInt)}
                              style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                border: 'none',
                                backgroundColor: 'transparent',
                                textAlign: 'left',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                fontSize: '0.9rem',
                                transition: 'background-color 0.2s'
                              }}
                              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--hover-bg)'}
                              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                              <span
                                className="material-icons"
                                style={{
                                  fontSize: '1.25rem',
                                  color: tipoInt.color || '#10B981'
                                }}
                              >
                                {tipoInt.icono || 'assignment'}
                              </span>
                              <span>{tipoInt.nombre}</span>
                            </button>
                          ))
                        ) : (
                          <div style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                            No hay tipos de interacción configurados para este tipo de relación
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filteredRelaciones.length === 0 && (
            <div className="empty-state">
              <span className="material-icons">inbox</span>
              <h3>No hay relaciones</h3>
              <p>Crea tu primera relación para comenzar</p>
              <button className="btn btn-primary" onClick={handleCreate}>
                <span className="material-icons">add</span>
                Nueva Relación
              </button>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <form onSubmit={handleSubmit}>
              <div className="modal-header">
                <h2>
                  {editingRelacion ? 'Editar' : 'Nueva'} {esquema.nombre}
                </h2>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  {!editingRelacion && (
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
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}>
                    <span className="material-icons">close</span>
                  </button>
                </div>
              </div>

              <div className="modal-body">
                {/* Static Fields */}
                <div className="form-section">
                  <h3>Información General</h3>

                  <div className="form-field">
                    <label>Código de Relación *</label>
                    <input
                      type="text"
                      value={formData.codigoRelacion}
                      readOnly
                      className="readonly"
                    />
                    <small>Código generado automáticamente</small>
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

                  {(() => {
                    const clientesConfig = getClientesConfig();
                    const clientePrincipalConfig = clientesConfig.clientePrincipal;
                    const isVisible = clientePrincipalConfig?.visible !== false;
                    const isRequired = clientePrincipalConfig?.requerido !== false;
                    const allowedTypes = clientePrincipalConfig?.tiposPermitidos || [];
                    const label = getClientTypeLabel(allowedTypes, 'Cliente Principal');
                    const filteredClientes = filterClientesByType(allowedTypes);

                    if (!isVisible) return null;

                    return (
                      <div className="form-field">
                        <label>{label} {isRequired && '*'}</label>
                        <select
                          value={formData.clientePrincipalId}
                          onChange={(e) => handleStaticFieldChange('clientePrincipalId', e.target.value)}
                          required={isRequired}
                        >
                          <option value="">Seleccione un cliente</option>
                          {filteredClientes.map(client => (
                            <option key={client.id} value={client.id}>
                              {getClientDisplayName(client)} ({client.codigoCliente})
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  })()}

                  {(() => {
                    const clientesConfig = getClientesConfig();
                    const clienteSecundario1Config = clientesConfig.clienteSecundario1;
                    const isVisible = clienteSecundario1Config?.visible === true;
                    const isRequired = clienteSecundario1Config?.requerido === true;
                    const allowedTypes = clienteSecundario1Config?.tiposPermitidos || [];
                    const label = getClientTypeLabel(allowedTypes, 'Cliente Secundario 1');
                    const filteredClientes = filterClientesByType(allowedTypes);

                    if (!isVisible) return null;

                    return (
                      <div className="form-field">
                        <label>{label} {isRequired && '*'}</label>
                        <select
                          value={formData.clienteSecundario1Id}
                          onChange={(e) => handleStaticFieldChange('clienteSecundario1Id', e.target.value)}
                          required={isRequired}
                        >
                          <option value="">Ninguno</option>
                          {filteredClientes.map(client => (
                            <option key={client.id} value={client.id}>
                              {getClientDisplayName(client)} ({client.codigoCliente})
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  })()}

                  {(() => {
                    const clientesConfig = getClientesConfig();
                    const clienteSecundario2Config = clientesConfig.clienteSecundario2;
                    const isVisible = clienteSecundario2Config?.visible === true;
                    const isRequired = clienteSecundario2Config?.requerido === true;
                    const allowedTypes = clienteSecundario2Config?.tiposPermitidos || [];
                    const label = getClientTypeLabel(allowedTypes, 'Cliente Secundario 2');
                    const filteredClientes = filterClientesByType(allowedTypes);

                    if (!isVisible) return null;

                    return (
                      <div className="form-field">
                        <label>{label} {isRequired && '*'}</label>
                        <select
                          value={formData.clienteSecundario2Id}
                          onChange={(e) => handleStaticFieldChange('clienteSecundario2Id', e.target.value)}
                          required={isRequired}
                        >
                          <option value="">Ninguno</option>
                          {filteredClientes.map(client => (
                            <option key={client.id} value={client.id}>
                              {getClientDisplayName(client)} ({client.codigoCliente})
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  })()}

                  <div className="form-row">
                    <div className="form-field">
                      <label>Fecha Inicio *</label>
                      <input
                        type="date"
                        value={formData.fechaInicio}
                        onChange={(e) => handleStaticFieldChange('fechaInicio', e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-field">
                      <label>Fecha Fin</label>
                      <input
                        type="date"
                        value={formData.fechaFin}
                        onChange={(e) => handleStaticFieldChange('fechaFin', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-field">
                      <label>Estado *</label>
                      <select
                        value={formData.estado}
                        onChange={(e) => handleStaticFieldChange('estado', e.target.value)}
                        required
                      >
                        <option value="Activa">Activa</option>
                        <option value="Suspendida">Suspendida</option>
                        <option value="Finalizada">Finalizada</option>
                      </select>
                    </div>

                    <div className="form-field">
                      <label>Prioridad</label>
                      <select
                        value={formData.prioridad}
                        onChange={(e) => handleStaticFieldChange('prioridad', e.target.value)}
                      >
                        <option value="Alta">Alta</option>
                        <option value="Media">Media</option>
                        <option value="Baja">Baja</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-field">
                    <label>Tipo de Relación</label>
                    <input
                      type="text"
                      value={formData.tipoRelacion}
                      onChange={(e) => handleStaticFieldChange('tipoRelacion', e.target.value)}
                      placeholder="Ej: Comercial, Promocional, etc."
                    />
                  </div>

                  <div className="form-field">
                    <label>Frecuencia de Visitas al Mes *</label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={formData.frecuenciaVisitas}
                      onChange={(e) => handleStaticFieldChange('frecuenciaVisitas', parseInt(e.target.value) || 1)}
                      placeholder="Ej: 1, 2, 4..."
                      required
                    />
                    <small style={{ fontSize: '12px', color: '#666', marginTop: '4px', display: 'block' }}>
                      Cantidad de veces que la cartera debe ser visitada al mes
                    </small>
                  </div>

                  <div className="form-field">
                    <label>Observaciones</label>
                    <textarea
                      value={formData.observaciones}
                      onChange={(e) => handleStaticFieldChange('observaciones', e.target.value)}
                      rows={3}
                      placeholder="Notas adicionales sobre la relación"
                    />
                  </div>
                </div>

                {/* Dirección */}
                <div className="form-section">
                  <h3 className="form-section-title">Dirección</h3>
                  <DireccionForm
                    value={direccionData}
                    onChange={setDireccionData}
                    required={false}
                  />
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
                  {editingRelacion ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Interacción */}
      {selectedTipoInteraccion && (
        <InteractionFormModal
          isOpen={showInteractionModal}
          onClose={handleInteractionModalClose}
          onSave={handleInteractionModalSave}
          prefilledData={modalPrefilledData}
          esquema={selectedTipoInteraccion as any}
        />
      )}
    </div>
  );
};

export default RelationDynamicEntityPage;
