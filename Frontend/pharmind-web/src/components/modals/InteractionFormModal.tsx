import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import DynamicFormField from '../dynamic/DynamicFormField';
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

interface TipoInteraccion {
  id: string;
  nombre: string;
  subTipo: string;
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

  useEffect(() => {
    if (isOpen) {
      loadRelaciones();
      loadAgentes();
      loadClientes();
      loadTiposInteraccion();
    }
  }, [isOpen]);

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
      if (dynamicData.values) {
        // Nuevo formato con schema
        setDynamicFormData(dynamicData.values);
      } else {
        // Formato antiguo - solo valores
        setDynamicFormData(dynamicData);
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
        }
      };

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
          Observaciones: formData.observaciones || null
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
          Observaciones: formData.observaciones || null
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

  const getSchemaFields = () => {
    try {
      const schemaObj = JSON.parse(esquema.schema);
      return schemaObj.fields || [];
    } catch {
      return [];
    }
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

              <div className="form-field">
                <label>Agente *</label>
                <select
                  value={formData.agenteId}
                  onChange={(e) => handleStaticFieldChange('agenteId', e.target.value)}
                  required
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

              <div className="form-field">
                <label>Cliente *</label>
                <select
                  value={formData.clienteId}
                  onChange={(e) => handleStaticFieldChange('clienteId', e.target.value)}
                  required
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
                  <select
                    value={formData.tipoInteraccion}
                    onChange={(e) => handleStaticFieldChange('tipoInteraccion', e.target.value)}
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

                <div className="form-field">
                  <label>Duración (minutos)</label>
                  <input
                    type="number"
                    value={formData.duracionMinutos}
                    onChange={(e) => handleStaticFieldChange('duracionMinutos', parseInt(e.target.value) || 0)}
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
                  <option value="Pendiente">Pendiente</option>
                  <option value="Cancelada">Cancelada</option>
                </select>
              </div>

              <div className="form-field">
                <label>Objetivo de Visita</label>
                <textarea
                  value={formData.objetivoVisita}
                  onChange={(e) => handleStaticFieldChange('objetivoVisita', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="form-field">
                <label>Resumen de Visita</label>
                <textarea
                  value={formData.resumenVisita}
                  onChange={(e) => handleStaticFieldChange('resumenVisita', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="form-field">
                <label>Próxima Acción</label>
                <textarea
                  value={formData.proximaAccion}
                  onChange={(e) => handleStaticFieldChange('proximaAccion', e.target.value)}
                  rows={2}
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

              <div className="form-field">
                <label>Observaciones</label>
                <textarea
                  value={formData.observaciones}
                  onChange={(e) => handleStaticFieldChange('observaciones', e.target.value)}
                  rows={3}
                />
              </div>
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
    </div>
  );
};

export default InteractionFormModal;
