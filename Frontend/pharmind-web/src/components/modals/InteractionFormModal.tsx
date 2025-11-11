import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import DynamicFormField from '../dynamic/DynamicFormField';
import ProductSelectorModal, { type SelectedProduct } from './ProductSelectorModal';
import type { InteractionConfiguracionUi } from '../../types/interactionConfig';
import { parseInteractionConfig, validateProductosPromocionados } from '../../types/interactionConfig';
import './InteractionFormModal.css';

interface InteractionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  prefilledData?: {
    relacionId?: string;
    agenteId?: string;
    clienteId?: string;
    tipoInteraccionId?: string;
  };
  editingInteraction?: Interaction | null;
  esquema: Schema;
}

interface Schema {
  id: string;
  nombre: string;
  descripcion?: string;
  tipoEntidad: string;
  subTipo: string;
  schema: string | any; // Can be string or object from API
  configuracionUi?: string | null;
  icono?: string;
  color?: string;
}

interface InteraccionProducto {
  id: string;
  productoId: string;
  productoNombre?: string;
  productoCodigoProducto?: string;
  productoPresentacion?: string;
  cantidad: number;
  observaciones?: string;
}

interface InteraccionProductoSolicitado extends InteraccionProducto {
  estado?: string;
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
  // Productos relacionados
  productosPromocionados?: InteraccionProducto[];
  muestrasEntregadas?: InteraccionProducto[];
  productosSolicitados?: InteraccionProductoSolicitado[];
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

interface TipoInteraccion {
  id: string;
  nombre: string;
  subTipo: string;
}

interface Producto {
  id: string;
  codigoProducto: string;
  nombre: string;
  nombreComercial?: string;
  presentacion?: string;
  categoria?: string;
  laboratorio?: string;
  esMuestra: boolean;
  activo: boolean;
}

const InteractionFormModal: React.FC<InteractionFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  prefilledData,
  editingInteraction,
  esquema
}) => {
  const [relaciones, setRelaciones] = useState<Relacion[]>([]);
  const [agentes, setAgentes] = useState<Agent[]>([]);
  const [clientes, setClientes] = useState<Client[]>([]);
  const [tiposInteraccion, setTiposInteraccion] = useState<TipoInteraccion[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [productosMuestra, setProductosMuestra] = useState<Producto[]>([]);
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
  const [isPrefilledForm, setIsPrefilledForm] = useState(false);
  const [interactionConfig, setInteractionConfig] = useState<InteractionConfiguracionUi | null>(null);
  const [productosPromocionados, setProductosPromocionados] = useState<any[]>([]);
  const [muestrasEntregadas, setMuestrasEntregadas] = useState<any[]>([]);
  const [pedidoProductos, setPedidoProductos] = useState<any[]>([]);

  // Estados para los modales de selección
  const [showProductoPromocionadoModal, setShowProductoPromocionadoModal] = useState(false);
  const [showMuestraModal, setShowMuestraModal] = useState(false);
  const [showPedidoModal, setShowPedidoModal] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadRelaciones();
      loadAgentes();
      loadClientes();
      loadTiposInteraccion();
      loadProductos();

      // Parse interaction configuration
      const config = parseInteractionConfig(esquema.configuracionUi);
      setInteractionConfig(config);
    }
  }, [isOpen, esquema]);

  useEffect(() => {
    if (isOpen && prefilledData) {
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
      setProductosPromocionados([]);
      setMuestrasEntregadas([]);
      setPedidoProductos([]);
      setIsPrefilledForm(hasPrefilled);
    } else if (isOpen && editingInteraction) {
      setFormData({
        codigoInteraccion: editingInteraction.codigoInteraccion,
        relacionId: editingInteraction.relacionId,
        agenteId: editingInteraction.agenteId,
        clienteId: editingInteraction.clienteId,
        tipoInteraccion: editingInteraction.tipoInteraccion,
        fecha: editingInteraction.fecha.split('T')[0],
        turno: editingInteraction.turno || '',
        duracionMinutos: editingInteraction.duracionMinutos || 0,
        resultado: editingInteraction.resultado || '',
        objetivoVisita: editingInteraction.objetivoVisita || '',
        resumenVisita: editingInteraction.resumenVisita || '',
        proximaAccion: editingInteraction.proximaAccion || '',
        fechaProximaAccion: editingInteraction.fechaProximaAccion ? editingInteraction.fechaProximaAccion.split('T')[0] : '',
        latitud: editingInteraction.latitud || null,
        longitud: editingInteraction.longitud || null,
        observaciones: editingInteraction.observaciones || ''
      });

      // Cargar datos dinámicos - soportar formato antiguo (solo valores) y nuevo (valores + schema)
      const dynamicData = editingInteraction.datosDinamicos || {};
      console.log('🔍 DEBUG - Cargando interacción para editar:');
      console.log('  - Interacción completa:', editingInteraction);
      console.log('  - datosDinamicos:', dynamicData);
      console.log('  - Tiene values?', !!dynamicData.values);
      console.log('  - productosPromocionados:', editingInteraction.productosPromocionados);
      console.log('  - muestrasEntregadas:', editingInteraction.muestrasEntregadas);
      console.log('  - productosSolicitados:', editingInteraction.productosSolicitados);

      // Cargar productos desde el objeto principal (ahora vienen del backend en las colecciones)
      const productosPromocionadosCargados = (editingInteraction.productosPromocionados || []).map((p: any) => ({
        productoId: p.productoId,
        productoNombre: p.productoNombre,
        presentacion: p.productoPresentacion,
        cantidad: p.cantidad,
        observaciones: p.observaciones
      }));

      const muestrasEntregadasCargadas = (editingInteraction.muestrasEntregadas || []).map((m: any) => ({
        productoId: m.productoId,
        productoNombre: m.productoNombre,
        presentacion: m.productoPresentacion,
        cantidad: m.cantidad
      }));

      const pedidoProductosCargados = (editingInteraction.productosSolicitados || []).map((p: any) => ({
        productoId: p.productoId,
        productoNombre: p.productoNombre,
        presentacion: p.productoPresentacion,
        cantidad: p.cantidad
      }));

      setProductosPromocionados(productosPromocionadosCargados);
      setMuestrasEntregadas(muestrasEntregadasCargadas);
      setPedidoProductos(pedidoProductosCargados);

      console.log('🔍 DEBUG - Productos cargados para edición:');
      console.log('  - productosPromocionados:', productosPromocionadosCargados.length);
      console.log('  - muestrasEntregadas:', muestrasEntregadasCargadas.length);
      console.log('  - pedidoProductos:', pedidoProductosCargados.length);

      if (dynamicData.values) {
        // Nuevo formato con schema - valores están en .values
        setDynamicFormData(dynamicData.values);
      } else {
        // Formato antiguo - valores están en el root (filtrar propiedades especiales)
        const { productosPromocionados, muestrasEntregadas, pedidoProductos, schema, configuracion, metadata, ...values } = dynamicData;
        setDynamicFormData(values);
      }

      setIsPrefilledForm(false);
    } else if (isOpen && !editingInteraction) {
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
      setProductosPromocionados([]);
      setMuestrasEntregadas([]);
      setPedidoProductos([]);
      setIsPrefilledForm(false);
    }
  }, [isOpen, prefilledData, editingInteraction]);

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
      const response = await api.get('/productos');
      // El endpoint /productos retorna directamente el array, no un objeto paginado
      const allProductos = Array.isArray(response.data) ? response.data : (response.data.items || []);
      console.log('🔍 DEBUG - Productos cargados:', allProductos.length);
      console.log('🔍 DEBUG - Primeros 3 productos:', allProductos.slice(0, 3).map((p: Producto) => ({
        nombre: p.nombre,
        nombreComercial: p.nombreComercial,
        presentacion: p.presentacion,
        esMuestra: p.esMuestra
      })));
      setProductos(allProductos);
      const muestras = allProductos.filter((p: Producto) => p.esMuestra);
      console.log('🔍 DEBUG - Productos muestra:', muestras.length);
      setProductosMuestra(muestras);
    } catch (err) {
      console.error('Error al cargar productos:', err);
    }
  };

  const generateInteractionCode = () => {
    const timestamp = Date.now();
    return `INT-${timestamp}`;
  };

  const handleStaticFieldChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleDynamicFieldChange = (fieldName: string, value: any) => {
    setDynamicFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

    try {
      // Preparar datos dinámicos con valores y definiciones de campos
      const schemaFields = getSchemaFields();
      const dynamicDataWithSchema = {
        values: dynamicFormData,
        schema: {
          fields: schemaFields.map(field => ({
            name: field.name,
            label: field.label,
            type: field.type,
            required: field.required,
            options: field.options,
            dataSource: field.dataSource,
            helpText: field.helpText
          })),
          version: esquema.version || '1.0',
          capturedAt: new Date().toISOString()
        },
        // Agregar productos promocionados, muestras y pedidos
        productosPromocionados: productosPromocionados.length > 0 ? productosPromocionados : undefined,
        muestrasEntregadas: muestrasEntregadas.length > 0 ? muestrasEntregadas : undefined,
        pedidoProductos: pedidoProductos.length > 0 ? pedidoProductos : undefined
      };

      console.log('🔍 DEBUG - Guardando interacción con datos:');
      console.log('  - Productos Promocionados:', productosPromocionados);
      console.log('  - Muestras Entregadas:', muestrasEntregadas);
      console.log('  - Pedido Productos:', pedidoProductos);
      console.log('  - DatosDinamicos completo:', dynamicDataWithSchema);

      // Preparar productos en formato backend
      const productosPromocionadosPayload = productosPromocionados.map(p => ({
        ProductoId: p.productoId,
        Cantidad: p.cantidad,
        Observaciones: p.observaciones || null
      }));

      const muestrasEntregadasPayload = muestrasEntregadas.map(m => ({
        ProductoId: m.productoId,
        Cantidad: m.cantidad,
        Observaciones: null
      }));

      const pedidoProductosPayload = pedidoProductos.map(p => ({
        ProductoId: p.productoId,
        Cantidad: p.cantidad,
        Estado: 'Pendiente',
        Observaciones: null
      }));

      if (editingInteraction) {
        // Actualizar
        const updatePayload = {
          DatosDinamicos: dynamicDataWithSchema,
          CodigoInteraccion: formData.codigoInteraccion,
          RelacionId: formData.relacionId,
          AgenteId: formData.agenteId,
          ClienteId: formData.clienteId,
          TipoInteraccion: formData.tipoInteraccion || esquema.id,
          Fecha: formData.fecha,
          Turno: formData.turno || null,
          DuracionMinutos: formData.duracionMinutos ? parseInt(formData.duracionMinutos) : null,
          Resultado: formData.resultado || null,
          ObjetivoVisita: formData.objetivoVisita || null,
          ResumenVisita: formData.resumenVisita || null,
          ProximaAccion: formData.proximaAccion || null,
          FechaProximaAccion: formData.fechaProximaAccion || null,
          Latitud: formData.latitud ? parseFloat(formData.latitud) : null,
          Longitud: formData.longitud ? parseFloat(formData.longitud) : null,
          Observaciones: formData.observaciones || null,
          // Productos al nivel raíz
          ProductosPromocionados: productosPromocionadosPayload.length > 0 ? productosPromocionadosPayload : null,
          MuestrasEntregadas: muestrasEntregadasPayload.length > 0 ? muestrasEntregadasPayload : null,
          ProductosSolicitados: pedidoProductosPayload.length > 0 ? pedidoProductosPayload : null
        };

        await api.put(`/interacciones/${editingInteraction.id}`, updatePayload);
      } else {
        // Crear
        const createPayload = {
          TipoInteraccionId: esquema.id,
          DatosDinamicos: dynamicDataWithSchema,
          CodigoInteraccion: formData.codigoInteraccion,
          RelacionId: formData.relacionId,
          AgenteId: formData.agenteId,
          ClienteId: formData.clienteId,
          TipoInteraccion: formData.tipoInteraccion || esquema.id,
          Fecha: formData.fecha,
          Turno: formData.turno || null,
          DuracionMinutos: formData.duracionMinutos ? parseInt(formData.duracionMinutos) : null,
          Resultado: formData.resultado || null,
          ObjetivoVisita: formData.objetivoVisita || null,
          ResumenVisita: formData.resumenVisita || null,
          ProximaAccion: formData.proximaAccion || null,
          FechaProximaAccion: formData.fechaProximaAccion || null,
          Latitud: formData.latitud ? parseFloat(formData.latitud) : null,
          Longitud: formData.longitud ? parseFloat(formData.longitud) : null,
          Observaciones: formData.observaciones || null,
          // Productos al nivel raíz
          ProductosPromocionados: productosPromocionadosPayload.length > 0 ? productosPromocionadosPayload : null,
          MuestrasEntregadas: muestrasEntregadasPayload.length > 0 ? muestrasEntregadasPayload : null,
          ProductosSolicitados: pedidoProductosPayload.length > 0 ? pedidoProductosPayload : null
        };

        await api.post('/interacciones', createPayload);
      }

      onSave();
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al guardar la interacción');
    }
  };

  const getAgentDisplayName = (agent: Agent) => {
    return agent.apellido ? `${agent.nombre} ${agent.apellido}` : agent.nombre;
  };

  const getClientDisplayName = (client: Client) => {
    if (client.razonSocial) return client.razonSocial;
    return client.apellido ? `${client.nombre} ${client.apellido}` : client.nombre || '';
  };

  const getStaticFieldsConfig = () => {
    if (!esquema || !esquema.schema) {
      return { campos: {} };
    }

    try {
      const schemaObj = typeof esquema.schema === 'string'
        ? JSON.parse(esquema.schema)
        : esquema.schema;

      return schemaObj.staticFieldsConfig || { campos: {} };
    } catch (error) {
      console.error('Error parsing staticFieldsConfig:', error);
      return { campos: {} };
    }
  };

  const isFieldVisible = (fieldName: string): boolean => {
    const config = getStaticFieldsConfig();
    const fieldConfig = config.campos?.[fieldName];
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

  const getSchemaFields = () => {
    try {
      const schemaObj = typeof esquema.schema === 'string'
        ? JSON.parse(esquema.schema)
        : esquema.schema;
      return schemaObj.fields || [];
    } catch {
      return [];
    }
  };

  // Productos Promocionados handlers
  const handleAddProductoPromocionado = (producto: Producto, cantidad: number) => {
    const nombreDisplay = producto.nombreComercial || producto.nombre;
    setProductosPromocionados(prev => [
      ...prev,
      {
        productoId: producto.id,
        productoNombre: nombreDisplay,
        presentacion: producto.presentacion,
        cantidad
      }
    ]);
  };

  const handleMultiSelectProductosPromocionados = (productosSeleccionados: SelectedProduct[]) => {
    const nuevosProductos = productosSeleccionados.map(sp => ({
      productoId: sp.producto.id,
      productoNombre: sp.producto.nombreComercial || sp.producto.nombre,
      presentacion: sp.producto.presentacion,
      cantidad: 1,
      observaciones: sp.resultado
    }));
    setProductosPromocionados(prev => [...prev, ...nuevosProductos]);
  };

  const handleRemoveProductoPromocionado = (index: number) => {
    setProductosPromocionados(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateCantidadPromocionado = (index: number, cantidad: number) => {
    setProductosPromocionados(prev => prev.map((item, i) =>
      i === index ? { ...item, cantidad } : item
    ));
  };

  // Muestras Entregadas handlers
  const handleAddMuestra = (producto: Producto, cantidad: number) => {
    const nombreDisplay = producto.nombreComercial || producto.nombre;
    const displayText = producto.presentacion ? `${nombreDisplay} - ${producto.presentacion}` : nombreDisplay;
    setMuestrasEntregadas(prev => [
      ...prev,
      {
        productoId: producto.id,
        productoNombre: displayText,
        presentacion: producto.presentacion,
        cantidad
      }
    ]);
  };

  const handleMultiSelectMuestras = (productosSeleccionados: SelectedProduct[]) => {
    const nuevasMuestras = productosSeleccionados.map(sp => {
      const nombreDisplay = sp.producto.nombreComercial || sp.producto.nombre;
      const displayText = sp.producto.presentacion ? `${nombreDisplay} - ${sp.producto.presentacion}` : nombreDisplay;
      return {
        productoId: sp.producto.id,
        productoNombre: displayText,
        presentacion: sp.producto.presentacion,
        cantidad: sp.cantidad || 1
      };
    });
    setMuestrasEntregadas(prev => [...prev, ...nuevasMuestras]);
  };

  const handleRemoveMuestra = (index: number) => {
    setMuestrasEntregadas(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateCantidadMuestra = (index: number, cantidad: number) => {
    setMuestrasEntregadas(prev => prev.map((item, i) =>
      i === index ? { ...item, cantidad } : item
    ));
  };

  // Pedido Productos handlers
  const handleAddPedidoProducto = (producto: Producto, cantidad: number) => {
    const nombreDisplay = producto.nombreComercial || producto.nombre;
    const displayText = producto.presentacion ? `${nombreDisplay} - ${producto.presentacion}` : nombreDisplay;
    setPedidoProductos(prev => [
      ...prev,
      {
        productoId: producto.id,
        productoNombre: displayText,
        presentacion: producto.presentacion,
        cantidad
      }
    ]);
  };

  const handleRemovePedidoProducto = (index: number) => {
    setPedidoProductos(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateCantidadPedido = (index: number, cantidad: number) => {
    setPedidoProductos(prev => prev.map((item, i) =>
      i === index ? { ...item, cantidad } : item
    ));
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content interaction-modal">
        <form onSubmit={handleSubmit}>
          <div className="modal-header">
            <h2>
              {editingInteraction ? 'Editar' : 'Nueva'} {esquema.nombre}
            </h2>
            <button type="button" className="btn-close" onClick={onClose}>
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
                    disabled={isPrefilledForm && !editingInteraction}
                    className={isPrefilledForm && !editingInteraction ? 'readonly' : ''}
                  >
                    <option value="">Seleccione una relación</option>
                    {relaciones.map(rel => (
                      <option key={rel.id} value={rel.id}>
                        {rel.codigoRelacion} - {rel.clientePrincipalNombre || 'N/A'}
                      </option>
                    ))}
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
                    disabled={isPrefilledForm && !editingInteraction}
                    className={isPrefilledForm && !editingInteraction ? 'readonly' : ''}
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
                    disabled={isPrefilledForm && !editingInteraction}
                    className={isPrefilledForm && !editingInteraction ? 'readonly' : ''}
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
                      disabled={isPrefilledForm && !editingInteraction}
                      className={isPrefilledForm && !editingInteraction ? 'readonly' : ''}
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
                    <option value="Pendiente">Pendiente</option>
                    <option value="Cancelada">Cancelada</option>
                  </select>
                </div>
              )}

              {isFieldVisible('ObjetivoVisita') && (
                <div className="form-field">
                  <label>
                    {getFieldLabel('ObjetivoVisita', 'Objetivo de Visita')}
                    {isFieldRequired('ObjetivoVisita') && ' *'}
                  </label>
                  <textarea
                    value={formData.objetivoVisita}
                    onChange={(e) => handleStaticFieldChange('objetivoVisita', e.target.value)}
                    rows={3}
                    required={isFieldRequired('ObjetivoVisita')}
                  />
                </div>
              )}

              {isFieldVisible('ResumenVisita') && (
                <div className="form-field">
                  <label>
                    {getFieldLabel('ResumenVisita', 'Resumen de Visita')}
                    {isFieldRequired('ResumenVisita') && ' *'}
                  </label>
                  <textarea
                    value={formData.resumenVisita}
                    onChange={(e) => handleStaticFieldChange('resumenVisita', e.target.value)}
                    rows={3}
                    required={isFieldRequired('ResumenVisita')}
                  />
                </div>
              )}

              {isFieldVisible('ProximaAccion') && (
                <div className="form-field">
                  <label>
                    {getFieldLabel('ProximaAccion', 'Próxima Acción')}
                    {isFieldRequired('ProximaAccion') && ' *'}
                  </label>
                  <textarea
                    value={formData.proximaAccion}
                    onChange={(e) => handleStaticFieldChange('proximaAccion', e.target.value)}
                    rows={2}
                    required={isFieldRequired('ProximaAccion')}
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

              {isFieldVisible('Latitud') && (
                <div className="form-field">
                  <label>
                    {getFieldLabel('Latitud', 'Latitud')}
                    {isFieldRequired('Latitud') && ' *'}
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.latitud || ''}
                    onChange={(e) => handleStaticFieldChange('latitud', e.target.value ? parseFloat(e.target.value) : null)}
                    required={isFieldRequired('Latitud')}
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
                    step="any"
                    value={formData.longitud || ''}
                    onChange={(e) => handleStaticFieldChange('longitud', e.target.value ? parseFloat(e.target.value) : null)}
                    required={isFieldRequired('Longitud')}
                  />
                </div>
              )}

              {isFieldVisible('Observaciones') && (
                <div className="form-field">
                  <label>
                    {getFieldLabel('Observaciones', 'Observaciones')}
                    {isFieldRequired('Observaciones') && ' *'}
                  </label>
                  <textarea
                    value={formData.observaciones}
                    onChange={(e) => handleStaticFieldChange('observaciones', e.target.value)}
                    rows={3}
                    required={isFieldRequired('Observaciones')}
                  />
                </div>
              )}
            </div>

            {/* Dynamic Fields */}
            {getSchemaFields().length > 0 && (
              <div className="form-section">
                <h3>Campos Adicionales</h3>
                {getSchemaFields().map((field: any) => (
                  <DynamicFormField
                    key={field.name}
                    field={field}
                    value={dynamicFormData[field.name]}
                    onChange={(fieldName, value) => handleDynamicFieldChange(fieldName, value)}
                  />
                ))}
              </div>
            )}

            {/* Productos Promocionados */}
            {interactionConfig?.productosPromocionados?.habilitado && (
              <div className="form-section">
                <h3>
                  {interactionConfig.productosPromocionados.label || 'Productos Promocionados'}
                  {interactionConfig.productosPromocionados.requerido && ' *'}
                </h3>
                {interactionConfig.productosPromocionados.helpText && (
                  <p className="help-text" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                    {interactionConfig.productosPromocionados.helpText}
                  </p>
                )}
                {interactionConfig.productosPromocionados.minCantidad !== undefined && (
                  <p className="info-text" style={{ fontSize: '0.875rem', color: 'var(--primary-color)', marginBottom: '1rem' }}>
                    📊 Cantidad de productos: mínimo {interactionConfig.productosPromocionados.minCantidad}, máximo {interactionConfig.productosPromocionados.maxCantidad}
                  </p>
                )}

                {/* Botón para agregar producto */}
                <div className="form-field">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      console.log('🔍 DEBUG - Abriendo modal de productos promocionados');
                      console.log('🔍 DEBUG - Total productos disponibles:', productos.length);
                      const filtrados = productos.filter(p => !productosPromocionados.find(pp => pp.productoId === p.id));
                      console.log('🔍 DEBUG - Productos filtrados para modal:', filtrados.length);
                      setShowProductoPromocionadoModal(true);
                    }}
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <span className="material-icons">add</span>
                    Agregar Producto Promocionado
                  </button>
                </div>

                {/* Lista de productos agregados */}
                {productosPromocionados.length > 0 && (
                  <div style={{ marginTop: '1rem' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                          <th style={{ textAlign: 'left', padding: '0.5rem', fontSize: '0.875rem' }}>Producto</th>
                          <th style={{ textAlign: 'center', padding: '0.5rem', fontSize: '0.875rem', width: '180px' }}>Resultado</th>
                          <th style={{ textAlign: 'center', padding: '0.5rem', width: '60px' }}></th>
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
                                onClick={() => handleRemoveProductoPromocionado(index)}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: 'var(--error-color)',
                                  cursor: 'pointer',
                                  padding: '0.25rem'
                                }}
                                title="Eliminar"
                              >
                                <span className="material-icons" style={{ fontSize: '1.25rem' }}>delete</span>
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

            {/* Muestras Entregadas */}
            {interactionConfig?.muestrasEntregadas?.habilitado && (
              <div className="form-section">
                <h3>
                  {interactionConfig.muestrasEntregadas.label || 'Muestras/Materiales Entregados'}
                  {interactionConfig.muestrasEntregadas.requerido && ' *'}
                </h3>
                {interactionConfig.muestrasEntregadas.helpText && (
                  <p className="help-text" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                    {interactionConfig.muestrasEntregadas.helpText}
                  </p>
                )}

                {/* Botón para agregar muestra */}
                <div className="form-field">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowMuestraModal(true)}
                    style={{ width: '100%', justifyContent: 'center' }}
                    disabled={productosMuestra.length === 0}
                  >
                    <span className="material-icons">add</span>
                    Agregar Muestra/Material
                  </button>
                  {productosMuestra.length === 0 && (
                    <small style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', display: 'block' }}>
                      No hay productos configurados como muestras
                    </small>
                  )}
                </div>

                {/* Lista de muestras agregadas */}
                {muestrasEntregadas.length > 0 && (
                  <div style={{ marginTop: '1rem' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                          <th style={{ textAlign: 'left', padding: '0.5rem', fontSize: '0.875rem' }}>Muestra/Material</th>
                          <th style={{ textAlign: 'center', padding: '0.5rem', fontSize: '0.875rem', width: '120px' }}>Cantidad</th>
                          <th style={{ textAlign: 'center', padding: '0.5rem', width: '60px' }}></th>
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
                                onChange={(e) => handleUpdateCantidadMuestra(index, parseInt(e.target.value) || 1)}
                                style={{ width: '80px', textAlign: 'center', padding: '0.25rem' }}
                              />
                            </td>
                            <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                              <button
                                type="button"
                                onClick={() => handleRemoveMuestra(index)}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: 'var(--error-color)',
                                  cursor: 'pointer',
                                  padding: '0.25rem'
                                }}
                                title="Eliminar"
                              >
                                <span className="material-icons" style={{ fontSize: '1.25rem' }}>delete</span>
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

            {/* Pedido de Productos */}
            {interactionConfig?.pedidoProductos?.habilitado && (
              <div className="form-section">
                <h3>
                  {interactionConfig.pedidoProductos.label || 'Pedido de Productos'}
                  {interactionConfig.pedidoProductos.requerido && ' *'}
                </h3>
                {interactionConfig.pedidoProductos.helpText && (
                  <p className="help-text" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                    {interactionConfig.pedidoProductos.helpText}
                  </p>
                )}

                {/* Botón para agregar producto al pedido */}
                <div className="form-field">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowPedidoModal(true)}
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <span className="material-icons">add</span>
                    Agregar Producto al Pedido
                  </button>
                </div>

                {/* Lista de productos en el pedido */}
                {pedidoProductos.length > 0 && (
                  <div style={{ marginTop: '1rem' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                          <th style={{ textAlign: 'left', padding: '0.5rem', fontSize: '0.875rem' }}>Producto</th>
                          <th style={{ textAlign: 'center', padding: '0.5rem', fontSize: '0.875rem', width: '120px' }}>Cantidad</th>
                          <th style={{ textAlign: 'center', padding: '0.5rem', width: '60px' }}></th>
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
                                onChange={(e) => handleUpdateCantidadPedido(index, parseInt(e.target.value) || 1)}
                                style={{ width: '80px', textAlign: 'center', padding: '0.25rem' }}
                              />
                            </td>
                            <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                              <button
                                type="button"
                                onClick={() => handleRemovePedidoProducto(index)}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: 'var(--error-color)',
                                  cursor: 'pointer',
                                  padding: '0.25rem'
                                }}
                                title="Eliminar"
                              >
                                <span className="material-icons" style={{ fontSize: '1.25rem' }}>delete</span>
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
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {editingInteraction ? 'Actualizar' : 'Crear'} Interacción
            </button>
          </div>
        </form>
      </div>

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
        productos={productos.filter(p => !p.esMuestra && !pedidoProductos.find(pp => pp.productoId === p.id))}
        title="Seleccionar Producto para Pedido"
        groupByNombreComercial={false}
        incluirPresentacion={true}
      />
    </div>
  );
};

export default InteractionFormModal;
