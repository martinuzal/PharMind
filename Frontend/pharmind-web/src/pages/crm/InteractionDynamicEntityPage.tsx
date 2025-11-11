import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import DynamicFormField from '../../components/dynamic/DynamicFormField';
import ProductSelectorModal, { type SelectedProduct } from '../../components/modals/ProductSelectorModal';
import { usePage } from '../../contexts/PageContext';
import type { InteractionConfiguracionUi } from '../../types/interactionConfig';
import { parseInteractionConfig, validateProductosPromocionados } from '../../types/interactionConfig';
import './CRMPages.css';

interface Schema {
  id: string;
  nombre: string;
  descripcion?: string;
  tipoEntidad: string;
  subTipo: string;
  schema: string | any; // Puede venir como string o como objeto ya parseado
  configuracionUi?: string;
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

interface TipoInteraccion {
  id: string;
  nombre: string;
  subTipo: string;
}

const InteractionDynamicEntityPage: React.FC = () => {
  const { subtipo } = useParams<{ subtipo: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { setToolbarContent, setToolbarCenterContent, setToolbarRightContent, clearToolbarContent } = usePage();

  const [esquema, setEsquema] = useState<Schema | null>(null);
  const [interacciones, setInteracciones] = useState<Interaction[]>([]);
  const [relaciones, setRelaciones] = useState<Relacion[]>([]);
  const [agentes, setAgentes] = useState<Agent[]>([]);
  const [clientes, setClientes] = useState<Client[]>([]);
  const [tiposRelacion, setTiposRelacion] = useState<TipoRelacion[]>([]);
  const [tiposInteraccion, setTiposInteraccion] = useState<TipoInteraccion[]>([]);
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
  const [isPrefilledForm, setIsPrefilledForm] = useState(false);
  const [interactionConfig, setInteractionConfig] = useState<InteractionConfiguracionUi | null>(null);
  const [productosPromocionados, setProductosPromocionados] = useState<any[]>([]);
  const [muestrasEntregadas, setMuestrasEntregadas] = useState<any[]>([]);
  const [pedidoProductos, setPedidoProductos] = useState<any[]>([]);

  // Estados para productos y modales
  const [productos, setProductos] = useState<any[]>([]);
  const [productosMuestra, setProductosMuestra] = useState<any[]>([]);
  const [showProductoPromocionadoModal, setShowProductoPromocionadoModal] = useState(false);
  const [showMuestraModal, setShowMuestraModal] = useState(false);
  const [showPedidoModal, setShowPedidoModal] = useState(false);

  useEffect(() => {
    loadEsquema();
    loadRelaciones();
    loadAgentes();
    loadClientes();
    loadTiposRelacion();
    loadTiposInteraccion();
    loadProductos();
  }, [subtipo]);

  useEffect(() => {
    if (esquema) {
      console.log('✅ Esquema cargado:', esquema.nombre);
      console.log('✅ Esquema completo:', esquema);

      loadInteracciones();
      // Parse configuration from ConfiguracionUi JSON
      const config = parseInteractionConfig(esquema.configuracionUi);
      setInteractionConfig(config);
    }
  }, [esquema]);

  // Detectar si llegamos con datos pre-poblados desde navegación
  useEffect(() => {
    const navigationState = location.state as any;
    if (navigationState && navigationState.relacionId) {
      // Abrir modal automáticamente con datos pre-poblados
      handleCreate({
        relacionId: navigationState.relacionId,
        agenteId: navigationState.agenteId,
        clienteId: navigationState.clienteId,
        tipoInteraccionId: navigationState.tipoInteraccionId
      });

      // Limpiar el estado de navegación para evitar que se vuelva a abrir
      window.history.replaceState({}, document.title);
    }
  }, [esquema, relaciones.length, agentes.length, clientes.length]);

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

  const loadTiposInteraccion = async () => {
    try {
      const response = await api.get('/esquemaspersonalizados/tipo/Interaccion');
      setTiposInteraccion(response.data || []);
    } catch (err) {
      console.error('Error al cargar tipos de interacción:', err);
    }
  };

  const loadProductos = async () => {
    try {
      const response = await api.get('/productos', {
        params: { page: 1, pageSize: 500 }
      });
      const todosProductos = response.data.items || [];
      setProductos(todosProductos);
      // Filtrar solo muestras para el modal de muestras
      setProductosMuestra(todosProductos.filter((p: any) => p.esMuestra));
    } catch (err) {
      console.error('Error al cargar productos:', err);
    }
  };

  const generateInteractionCode = () => {
    const timestamp = Date.now();
    return `INT-${timestamp}`;
  };

  // Handlers para productos
  const handleAddProductoPromocionado = (producto: any, cantidad: number) => {
    setProductosPromocionados([...productosPromocionados, {
      productoId: producto.id,
      productoNombre: producto.nombreComercial || producto.nombre,
      presentacion: producto.presentacion,
      cantidad
    }]);
  };

  const handleMultiSelectProductosPromocionados = (productosSeleccionados: SelectedProduct[]) => {
    const nuevosProductos = productosSeleccionados.map(sp => ({
      productoId: sp.producto.id,
      productoNombre: sp.producto.nombreComercial || sp.producto.nombre,
      presentacion: sp.producto.presentacion,
      cantidad: 1, // Para productos promocionados, cantidad no es relevante
      observaciones: sp.resultado // Guardar el resultado en observaciones
    }));
    setProductosPromocionados([...productosPromocionados, ...nuevosProductos]);
  };

  const handleRemoveProductoPromocionado = (index: number) => {
    setProductosPromocionados(productosPromocionados.filter((_, i) => i !== index));
  };

  const handleAddMuestra = (producto: any, cantidad: number) => {
    setMuestrasEntregadas([...muestrasEntregadas, {
      productoId: producto.id,
      productoNombre: producto.nombreComercial || producto.nombre,
      presentacion: producto.presentacion,
      cantidad
    }]);
  };

  const handleMultiSelectMuestras = (productosSeleccionados: SelectedProduct[]) => {
    const nuevasMuestras = productosSeleccionados.map(sp => ({
      productoId: sp.producto.id,
      productoNombre: sp.producto.nombreComercial || sp.producto.nombre,
      presentacion: sp.producto.presentacion,
      cantidad: sp.cantidad || 1
    }));
    setMuestrasEntregadas([...muestrasEntregadas, ...nuevasMuestras]);
  };

  const handleRemoveMuestra = (index: number) => {
    setMuestrasEntregadas(muestrasEntregadas.filter((_, i) => i !== index));
  };

  const handleAddPedidoProducto = (producto: any, cantidad: number) => {
    setPedidoProductos([...pedidoProductos, {
      productoId: producto.id,
      productoNombre: producto.nombreComercial || producto.nombre,
      presentacion: producto.presentacion,
      cantidad
    }]);
  };

  const handleRemovePedidoProducto = (index: number) => {
    setPedidoProductos(pedidoProductos.filter((_, i) => i !== index));
  };

  const handleCreate = (prefilledData?: any) => {
    console.log('🚀 handleCreate called - Modal opening!');

    const code = generateInteractionCode();
    const hasPrefilled = !!(prefilledData?.relacionId);

    setFormData({
      codigoInteraccion: code,
      relacionId: prefilledData?.relacionId || '',
      agenteId: prefilledData?.agenteId || '',
      clienteId: prefilledData?.clienteId || '',
      tipoInteraccion: prefilledData?.tipoInteraccionId || '',
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
    setIsPrefilledForm(hasPrefilled);

    // Limpiar productos
    setProductosPromocionados([]);
    setMuestrasEntregadas([]);
    setPedidoProductos([]);

    setShowModal(true);

    console.log('🚀 Modal should be visible now');
    console.log('🚀 Calling getStaticFieldsConfig...');
    const testConfig = getStaticFieldsConfig();
    console.log('🚀 testConfig result:', testConfig);
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

    // Cargar datos dinámicos - soportar formato antiguo (solo valores) y nuevo (valores + schema)
    const dynamicData = interaccion.datosDinamicos || {};
    if (dynamicData.values) {
      // Nuevo formato con schema
      setDynamicFormData(dynamicData.values);
    } else {
      // Formato antiguo - solo valores
      setDynamicFormData(dynamicData);
    }

    // Cargar productos desde las propiedades de la interacción (tablas relacionales)
    const productosPromocionadosCargados = ((interaccion as any).productosPromocionados || []).map((p: any) => ({
      productoId: p.productoId,
      productoNombre: p.productoNombre,
      presentacion: p.productoPresentacion,
      cantidad: p.cantidad,
      observaciones: p.observaciones
    }));

    const muestrasEntregadasCargadas = ((interaccion as any).muestrasEntregadas || []).map((m: any) => ({
      productoId: m.productoId,
      productoNombre: m.productoNombre,
      presentacion: m.productoPresentacion,
      cantidad: m.cantidad
    }));

    const pedidoProductosCargados = ((interaccion as any).productosSolicitados || []).map((p: any) => ({
      productoId: p.productoId,
      productoNombre: p.productoNombre,
      presentacion: p.productoPresentacion,
      cantidad: p.cantidad
    }));

    setProductosPromocionados(productosPromocionadosCargados);
    setMuestrasEntregadas(muestrasEntregadasCargadas);
    setPedidoProductos(pedidoProductosCargados);

    console.log('🔍 DEBUG - Productos cargados al editar:');
    console.log('  - productosPromocionados:', productosPromocionadosCargados.length);
    console.log('  - muestrasEntregadas:', muestrasEntregadasCargadas.length);
    console.log('  - pedidoProductos:', pedidoProductosCargados.length);

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

    // Validate required fields based on schema configuration
    if (isFieldRequired('RelacionId') && !formData.relacionId) {
      alert('Debe seleccionar una Relación');
      return;
    }

    if (isFieldRequired('AgenteId') && !formData.agenteId) {
      alert('Debe seleccionar un Agente');
      return;
    }

    if (isFieldRequired('ClienteId') && !formData.clienteId) {
      alert('Debe seleccionar un Cliente');
      return;
    }

    if (isFieldRequired('Fecha') && !formData.fecha) {
      alert('Debe seleccionar una Fecha');
      return;
    }

    // Validate productos promocionados if required
    if (interactionConfig?.productosPromocionados?.habilitado) {
      const validation = validateProductosPromocionados(
        productosPromocionados,
        interactionConfig.productosPromocionados
      );
      if (!validation.isValid) {
        alert(validation.error);
        return;
      }
    }

    // Validate muestras entregadas if required
    if (interactionConfig?.muestrasEntregadas?.habilitado &&
        interactionConfig?.muestrasEntregadas?.requerido &&
        muestrasEntregadas.length === 0) {
      alert('Debe informar al menos una muestra/material entregado');
      return;
    }

    // Validate pedido productos if required
    if (interactionConfig?.pedidoProductos?.habilitado &&
        interactionConfig?.pedidoProductos?.requerido &&
        pedidoProductos.length === 0) {
      alert('Debe registrar al menos un pedido de producto');
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
          Observaciones: formData.observaciones,
          ProductosPromocionados: productosPromocionados.map(p => ({
            ProductoId: p.productoId,
            Cantidad: p.cantidad,
            Observaciones: p.observaciones || null
          })),
          MuestrasEntregadas: muestrasEntregadas.map(m => ({
            ProductoId: m.productoId,
            Cantidad: m.cantidad,
            Observaciones: null
          })),
          ProductosSolicitados: pedidoProductos.map(p => ({
            ProductoId: p.productoId,
            Cantidad: p.cantidad,
            Estado: 'Pendiente',
            Observaciones: null
          }))
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
          Observaciones: formData.observaciones,
          ProductosPromocionados: productosPromocionados.map(p => ({
            ProductoId: p.productoId,
            Cantidad: p.cantidad,
            Observaciones: p.observaciones || null
          })),
          MuestrasEntregadas: muestrasEntregadas.map(m => ({
            ProductoId: m.productoId,
            Cantidad: m.cantidad,
            Observaciones: null
          })),
          ProductosSolicitados: pedidoProductos.map(p => ({
            ProductoId: p.productoId,
            Cantidad: p.cantidad,
            Estado: 'Pendiente',
            Observaciones: null
          }))
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

  const getStaticFieldsConfig = () => {
    if (!esquema || !esquema.schema) {
      console.log('❌ No hay esquema o schema');
      return { campos: {} };
    }

    try {
      console.log('🔍 Tipo de esquema.schema:', typeof esquema.schema);
      console.log('🔍 esquema.schema completo:', esquema.schema);

      const schemaObj = typeof esquema.schema === 'string'
        ? JSON.parse(esquema.schema)
        : esquema.schema;

      console.log('🔍 schemaObj después de parse:', schemaObj);
      console.log('🔍 schemaObj.staticFieldsConfig:', schemaObj.staticFieldsConfig);

      const config = schemaObj.staticFieldsConfig || { campos: {} };
      console.log('📋 Static Fields Config FINAL:', config);
      console.log('📋 Número de campos configurados:', Object.keys(config.campos || {}).length);

      return config;
    } catch (error) {
      console.error('❌ Error parsing staticFieldsConfig:', error);
      console.error('❌ esquema.schema era:', esquema.schema);
      return { campos: {} };
    }
  };

  const isFieldVisible = (fieldName: string): boolean => {
    const config = getStaticFieldsConfig();
    const fieldConfig = config.campos?.[fieldName];

    // Debug log
    if (fieldName === 'CodigoInteraccion' || fieldName === 'Turno') {
      console.log(`🔍 isFieldVisible(${fieldName}):`, {
        fieldConfig,
        visible: fieldConfig?.visible,
        result: fieldConfig === undefined ? true : fieldConfig.visible !== false
      });
    }

    if (fieldConfig === undefined) return true; // Si no hay config, mostrar por defecto
    return fieldConfig.visible !== false;
  };

  const isFieldRequired = (fieldName: string): boolean => {
    const config = getStaticFieldsConfig();
    const fieldConfig = config.campos?.[fieldName];
    if (fieldConfig === undefined) return false; // Si no hay config, no requerido por defecto
    return fieldConfig.requerido === true;
  };

  const getFieldLabel = (fieldName: string, defaultLabel: string): string => {
    const config = getStaticFieldsConfig();
    const fieldConfig = config.campos?.[fieldName];
    return fieldConfig?.label || defaultLabel;
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
        <div className="modal-overlay">
          <div className="modal-content">
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

                  {isFieldVisible('CodigoInteraccion') && (
                    <div className="form-field">
                      <label>
                        {getFieldLabel('CodigoInteraccion', 'Código de Interacción')}
                        {isFieldRequired('CodigoInteraccion') && ' *'}
                      </label>
                      <input
                        type="text"
                        value={formData.codigoInteraccion}
                        readOnly
                        className="readonly"
                      />
                      <small>Código generado automáticamente</small>
                    </div>
                  )}

                  {isFieldVisible('RelacionId') && (
                    <div className="form-field">
                      <label>
                        {getFieldLabel('RelacionId', 'Relación')}
                        {isFieldRequired('RelacionId') && ' *'}
                      </label>
                      <select
                        value={formData.relacionId}
                        onChange={(e) => handleStaticFieldChange('relacionId', e.target.value)}
                        required={isFieldRequired('RelacionId')}
                        disabled={isPrefilledForm && !editingInteraccion}
                        className={isPrefilledForm && !editingInteraccion ? 'readonly' : ''}
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
                  )}

                  {isFieldVisible('AgenteId') && (
                    <div className="form-field">
                      <label>
                        {getFieldLabel('AgenteId', 'Agente')}
                        {isFieldRequired('AgenteId') && ' *'}
                      </label>
                      <select
                        value={formData.agenteId}
                        onChange={(e) => handleStaticFieldChange('agenteId', e.target.value)}
                        required={isFieldRequired('AgenteId')}
                        disabled={isPrefilledForm && !editingInteraccion}
                        className={isPrefilledForm && !editingInteraccion ? 'readonly' : ''}
                      >
                        <option value="">Seleccione un agente</option>
                        {agentes.map(agent => (
                          <option key={agent.id} value={agent.id}>
                            {getAgentDisplayName(agent)} ({agent.codigoAgente})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {isFieldVisible('ClienteId') && (
                    <div className="form-field">
                      <label>
                        {getFieldLabel('ClienteId', 'Cliente')}
                        {isFieldRequired('ClienteId') && ' *'}
                      </label>
                      <select
                        value={formData.clienteId}
                        onChange={(e) => handleStaticFieldChange('clienteId', e.target.value)}
                        required={isFieldRequired('ClienteId')}
                        disabled={isPrefilledForm && !editingInteraccion}
                        className={isPrefilledForm && !editingInteraccion ? 'readonly' : ''}
                      >
                        <option value="">Seleccione un cliente</option>
                        {clientes.map(client => (
                          <option key={client.id} value={client.id}>
                            {getClientDisplayName(client)} ({client.codigoCliente})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="form-row">
                    {isFieldVisible('Fecha') && (
                      <div className="form-field">
                        <label>
                          {getFieldLabel('Fecha', 'Fecha')}
                          {isFieldRequired('Fecha') && ' *'}
                        </label>
                        <input
                          type="date"
                          value={formData.fecha}
                          onChange={(e) => handleStaticFieldChange('fecha', e.target.value)}
                          required={isFieldRequired('Fecha')}
                        />
                      </div>
                    )}

                    {isFieldVisible('Turno') && (
                      <div className="form-field">
                        <label>
                          {getFieldLabel('Turno', 'Turno')}
                          {isFieldRequired('Turno') && ' *'}
                        </label>
                        <select
                          value={formData.turno}
                          onChange={(e) => handleStaticFieldChange('turno', e.target.value)}
                          required={isFieldRequired('Turno')}
                        >
                          <option value="">Seleccione un turno</option>
                          <option value="Mañana">Mañana</option>
                          <option value="Tarde">Tarde</option>
                          <option value="TodoElDia">Todo el Día</option>
                        </select>
                      </div>
                    )}
                  </div>

                  <div className="form-row">
                    {isFieldVisible('TipoInteraccion') && (
                      <div className="form-field">
                        <label>
                          {getFieldLabel('TipoInteraccion', 'Tipo de Interacción')}
                          {isFieldRequired('TipoInteraccion') && ' *'}
                        </label>
                        <select
                          value={formData.tipoInteraccion}
                          onChange={(e) => handleStaticFieldChange('tipoInteraccion', e.target.value)}
                          required={isFieldRequired('TipoInteraccion')}
                          disabled={isPrefilledForm && !editingInteraccion}
                          className={isPrefilledForm && !editingInteraccion ? 'readonly' : ''}
                        >
                          <option value="">Seleccione un tipo</option>
                          {tiposInteraccion.map(tipo => (
                            <option key={tipo.id} value={tipo.id}>
                              {tipo.nombre}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {isFieldVisible('DuracionMinutos') && (
                      <div className="form-field">
                        <label>
                          {getFieldLabel('DuracionMinutos', 'Duración (minutos)')}
                          {isFieldRequired('DuracionMinutos') && ' *'}
                        </label>
                        <input
                          type="number"
                          value={formData.duracionMinutos}
                          onChange={(e) => handleStaticFieldChange('duracionMinutos', parseInt(e.target.value) || 0)}
                          required={isFieldRequired('DuracionMinutos')}
                          min="0"
                        />
                      </div>
                    )}
                  </div>

                  {isFieldVisible('Resultado') && (
                    <div className="form-field">
                      <label>
                        {getFieldLabel('Resultado', 'Resultado')}
                        {isFieldRequired('Resultado') && ' *'}
                      </label>
                      <select
                        value={formData.resultado}
                        onChange={(e) => handleStaticFieldChange('resultado', e.target.value)}
                        required={isFieldRequired('Resultado')}
                      >
                        <option value="">Seleccione un resultado</option>
                        <option value="Exitosa">Exitosa</option>
                        <option value="NoContacto">No Contacto</option>
                        <option value="Rechazada">Rechazada</option>
                        <option value="Pendiente">Pendiente</option>
                      </select>
                    </div>
                  )}

                  {isFieldVisible('ObjetivoVisita') && (
                    <div className="form-field">
                      <label>
                        {getFieldLabel('ObjetivoVisita', 'Objetivo de la Visita')}
                        {isFieldRequired('ObjetivoVisita') && ' *'}
                      </label>
                      <textarea
                        value={formData.objetivoVisita}
                        onChange={(e) => handleStaticFieldChange('objetivoVisita', e.target.value)}
                        required={isFieldRequired('ObjetivoVisita')}
                        rows={2}
                        placeholder="Describa el objetivo de la visita"
                      />
                    </div>
                  )}

                  {isFieldVisible('ResumenVisita') && (
                    <div className="form-field">
                      <label>
                        {getFieldLabel('ResumenVisita', 'Resumen de la Visita')}
                        {isFieldRequired('ResumenVisita') && ' *'}
                      </label>
                      <textarea
                        value={formData.resumenVisita}
                        onChange={(e) => handleStaticFieldChange('resumenVisita', e.target.value)}
                        required={isFieldRequired('ResumenVisita')}
                        rows={3}
                        placeholder="Resumen de lo tratado en la visita"
                      />
                    </div>
                  )}

                  <div className="form-row">
                    {isFieldVisible('ProximaAccion') && (
                      <div className="form-field">
                        <label>
                          {getFieldLabel('ProximaAccion', 'Próxima Acción')}
                          {isFieldRequired('ProximaAccion') && ' *'}
                        </label>
                        <input
                          type="text"
                          value={formData.proximaAccion}
                          onChange={(e) => handleStaticFieldChange('proximaAccion', e.target.value)}
                          required={isFieldRequired('ProximaAccion')}
                          placeholder="Describa la próxima acción"
                        />
                      </div>
                    )}

                    {isFieldVisible('FechaProximaAccion') && (
                      <div className="form-field">
                        <label>
                          {getFieldLabel('FechaProximaAccion', 'Fecha Próxima Acción')}
                          {isFieldRequired('FechaProximaAccion') && ' *'}
                        </label>
                        <input
                          type="date"
                          value={formData.fechaProximaAccion}
                          onChange={(e) => handleStaticFieldChange('fechaProximaAccion', e.target.value)}
                          required={isFieldRequired('FechaProximaAccion')}
                        />
                      </div>
                    )}
                  </div>

                  <div className="form-row">
                    {isFieldVisible('Latitud') && (
                      <div className="form-field">
                        <label>
                          {getFieldLabel('Latitud', 'Latitud')}
                          {isFieldRequired('Latitud') && ' *'}
                        </label>
                        <input
                          type="number"
                          step="0.0000001"
                          value={formData.latitud || ''}
                          onChange={(e) => handleStaticFieldChange('latitud', parseFloat(e.target.value) || null)}
                          required={isFieldRequired('Latitud')}
                          placeholder="Ej: -34.603722"
                        />
                      </div>
                    )}

                    {isFieldVisible('Longitud') && (
                      <div className="form-field">
                        <label>
                          {getFieldLabel('Longitud', 'Longitud')}
                          {isFieldRequired('Longitud') && ' *'}
                        </label>
                        <input
                          type="number"
                          step="0.0000001"
                          value={formData.longitud || ''}
                          onChange={(e) => handleStaticFieldChange('longitud', parseFloat(e.target.value) || null)}
                          required={isFieldRequired('Longitud')}
                          placeholder="Ej: -58.381592"
                        />
                      </div>
                    )}
                  </div>

                  {isFieldVisible('Observaciones') && (
                    <div className="form-field">
                      <label>
                        {getFieldLabel('Observaciones', 'Observaciones')}
                        {isFieldRequired('Observaciones') && ' *'}
                      </label>
                      <textarea
                        value={formData.observaciones}
                        onChange={(e) => handleStaticFieldChange('observaciones', e.target.value)}
                        required={isFieldRequired('Observaciones')}
                        rows={3}
                        placeholder="Observaciones adicionales"
                      />
                    </div>
                  )}
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

                {/* Productos Promocionados Section */}
                {interactionConfig?.productosPromocionados?.habilitado && (
                  <div className="form-section">
                    <h3 className="form-section-title">
                      <span className="material-icons" style={{ marginRight: '0.5rem', verticalAlign: 'middle' }}>
                        local_offer
                      </span>
                      {interactionConfig.productosPromocionados.label || 'Productos Promocionados'}
                      {interactionConfig.productosPromocionados.requerido && <span style={{ color: 'red' }}> *</span>}
                    </h3>
                    {interactionConfig.productosPromocionados.helpText && (
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                        {interactionConfig.productosPromocionados.helpText}
                      </p>
                    )}
                    {interactionConfig.productosPromocionados.minCantidad !== undefined && (
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                        Mínimo: {interactionConfig.productosPromocionados.minCantidad} - Máximo: {interactionConfig.productosPromocionados.maxCantidad || 'Sin límite'}
                      </p>
                    )}

                    <div className="productos-action-buttons" style={{ marginBottom: '1rem' }}>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setShowProductoPromocionadoModal(true)}
                      >
                        <span className="material-icons">add</span>
                        Agregar Producto
                      </button>
                    </div>

                    {productosPromocionados.length > 0 && (
                      <div style={{ marginTop: '1rem' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                              <th style={{ padding: '0.5rem', textAlign: 'left', fontSize: '0.875rem' }}>Producto</th>
                              <th style={{ padding: '0.5rem', textAlign: 'center', fontSize: '0.875rem', width: '180px' }}>Resultado</th>
                              <th style={{ padding: '0.5rem', textAlign: 'center', fontSize: '0.875rem' }}>Acciones</th>
                            </tr>
                          </thead>
                          <tbody>
                            {productosPromocionados.map((item, index) => (
                              <tr key={index} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <td style={{ padding: '0.5rem', fontSize: '0.875rem' }}>{item.productoNombre}</td>
                                <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                                  <span style={{
                                    display: 'inline-block',
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '6px',
                                    fontSize: '0.875rem',
                                    fontWeight: 600,
                                    background: item.observaciones === 'Muy Positivo' ? 'rgba(40, 167, 69, 0.1)' :
                                               item.observaciones === 'Positivo' ? 'rgba(23, 162, 184, 0.1)' :
                                               item.observaciones === 'Neutral' ? 'rgba(108, 117, 125, 0.1)' :
                                               item.observaciones === 'Negativo' ? 'rgba(220, 53, 69, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                                    color: item.observaciones === 'Muy Positivo' ? '#28a745' :
                                           item.observaciones === 'Positivo' ? '#17a2b8' :
                                           item.observaciones === 'Neutral' ? '#6c757d' :
                                           item.observaciones === 'Negativo' ? '#dc3545' : '#666'
                                  }}>
                                    {item.observaciones || 'Sin resultado'}
                                  </span>
                                </td>
                                <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                                  <button
                                    type="button"
                                    className="btn btn-danger btn-sm"
                                    onClick={() => handleRemoveProductoPromocionado(index)}
                                    style={{ padding: '0.25rem 0.5rem' }}
                                  >
                                    <span className="material-icons" style={{ fontSize: '1rem' }}>delete</span>
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                          Total: {productosPromocionados.length} producto(s)
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Muestras Entregadas Section */}
                {interactionConfig?.muestrasEntregadas?.habilitado && (
                  <div className="form-section">
                    <h3 className="form-section-title">
                      <span className="material-icons" style={{ marginRight: '0.5rem', verticalAlign: 'middle' }}>
                        inventory_2
                      </span>
                      {interactionConfig.muestrasEntregadas.label || 'Muestras/Materiales Entregados'}
                      {interactionConfig.muestrasEntregadas.requerido && <span style={{ color: 'red' }}> *</span>}
                    </h3>
                    {interactionConfig.muestrasEntregadas.helpText && (
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                        {interactionConfig.muestrasEntregadas.helpText}
                      </p>
                    )}

                    <div className="productos-action-buttons" style={{ marginBottom: '1rem' }}>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setShowMuestraModal(true)}
                      >
                        <span className="material-icons">add</span>
                        Agregar Muestra
                      </button>
                    </div>

                    {muestrasEntregadas.length > 0 && (
                      <div style={{ marginTop: '1rem' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                              <th style={{ padding: '0.5rem', textAlign: 'left', fontSize: '0.875rem' }}>Muestra</th>
                              <th style={{ padding: '0.5rem', textAlign: 'center', fontSize: '0.875rem' }}>Cantidad</th>
                              <th style={{ padding: '0.5rem', textAlign: 'center', fontSize: '0.875rem' }}>Acciones</th>
                            </tr>
                          </thead>
                          <tbody>
                            {muestrasEntregadas.map((item, index) => (
                              <tr key={index} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <td style={{ padding: '0.5rem', fontSize: '0.875rem' }}>{item.productoNombre}</td>
                                <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                                  <input
                                    type="number"
                                    min="1"
                                    value={item.cantidad}
                                    onChange={(e) => {
                                      const newList = [...muestrasEntregadas];
                                      newList[index].cantidad = parseInt(e.target.value) || 1;
                                      setMuestrasEntregadas(newList);
                                    }}
                                    style={{ width: '80px', textAlign: 'center' }}
                                  />
                                </td>
                                <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                                  <button
                                    type="button"
                                    className="btn btn-danger btn-sm"
                                    onClick={() => handleRemoveMuestra(index)}
                                    style={{ padding: '0.25rem 0.5rem' }}
                                  >
                                    <span className="material-icons" style={{ fontSize: '1rem' }}>delete</span>
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                          Total: {muestrasEntregadas.length} muestra(s)
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Pedido de Productos Section */}
                {interactionConfig?.pedidoProductos?.habilitado && (
                  <div className="form-section">
                    <h3 className="form-section-title">
                      <span className="material-icons" style={{ marginRight: '0.5rem', verticalAlign: 'middle' }}>
                        shopping_cart
                      </span>
                      {interactionConfig.pedidoProductos.label || 'Pedido de Productos'}
                      {interactionConfig.pedidoProductos.requerido && <span style={{ color: 'red' }}> *</span>}
                    </h3>
                    {interactionConfig.pedidoProductos.helpText && (
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                        {interactionConfig.pedidoProductos.helpText}
                      </p>
                    )}

                    <div className="productos-action-buttons" style={{ marginBottom: '1rem' }}>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setShowPedidoModal(true)}
                      >
                        <span className="material-icons">add</span>
                        Agregar Producto
                      </button>
                    </div>

                    {pedidoProductos.length > 0 && (
                      <div style={{ marginTop: '1rem' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                              <th style={{ padding: '0.5rem', textAlign: 'left', fontSize: '0.875rem' }}>Producto</th>
                              <th style={{ padding: '0.5rem', textAlign: 'center', fontSize: '0.875rem' }}>Cantidad</th>
                              <th style={{ padding: '0.5rem', textAlign: 'center', fontSize: '0.875rem' }}>Acciones</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pedidoProductos.map((item, index) => (
                              <tr key={index} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <td style={{ padding: '0.5rem', fontSize: '0.875rem' }}>{item.productoNombre}</td>
                                <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                                  <input
                                    type="number"
                                    min="1"
                                    value={item.cantidad}
                                    onChange={(e) => {
                                      const newList = [...pedidoProductos];
                                      newList[index].cantidad = parseInt(e.target.value) || 1;
                                      setPedidoProductos(newList);
                                    }}
                                    style={{ width: '80px', textAlign: 'center' }}
                                  />
                                </td>
                                <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                                  <button
                                    type="button"
                                    className="btn btn-danger btn-sm"
                                    onClick={() => handleRemovePedidoProducto(index)}
                                    style={{ padding: '0.25rem 0.5rem' }}
                                  >
                                    <span className="material-icons" style={{ fontSize: '1rem' }}>delete</span>
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                          Total: {pedidoProductos.length} producto(s)
                        </p>
                      </div>
                    )}
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

      {/* Modales de Selección de Productos */}
      <ProductSelectorModal
        isOpen={showProductoPromocionadoModal}
        onClose={() => setShowProductoPromocionadoModal(false)}
        onSelect={handleAddProductoPromocionado}
        onMultiSelect={handleMultiSelectProductosPromocionados}
        productos={productos.filter(p => !productosPromocionados.find(pp => pp.productoId === p.id))}
        title="Seleccionar Productos Promocionados"
        groupByNombreComercial={true}
        incluirPresentacion={false}
        multiSelect={true}
        showResultado={true}
      />

      <ProductSelectorModal
        isOpen={showMuestraModal}
        onClose={() => setShowMuestraModal(false)}
        onSelect={handleAddMuestra}
        onMultiSelect={handleMultiSelectMuestras}
        productos={productosMuestra.filter(p => !muestrasEntregadas.find(m => m.productoId === p.id))}
        title="Seleccionar Muestras/Materiales"
        groupByNombreComercial={false}
        incluirPresentacion={true}
        multiSelect={true}
        showCantidad={true}
      />

      <ProductSelectorModal
        isOpen={showPedidoModal}
        onClose={() => setShowPedidoModal(false)}
        onSelect={handleAddPedidoProducto}
        productos={productos.filter(p => !pedidoProductos.find(pp => pp.productoId === p.id))}
        title="Seleccionar Producto para Pedido"
        groupByNombreComercial={false}
        incluirPresentacion={true}
      />
    </div>
  );
};

export default InteractionDynamicEntityPage;
