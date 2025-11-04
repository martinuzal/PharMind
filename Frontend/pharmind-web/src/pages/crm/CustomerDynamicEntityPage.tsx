import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import DynamicFormField from '../../components/dynamic/DynamicFormField';
import { useNotifications } from '../../contexts/NotificationContext';
import './CRMPages.css';

// Types
interface EsquemaPersonalizado {
  id: string;
  nombre: string;
  descripcion?: string;
  entidadTipo: string;
  subTipo?: string;
  schema: string;
  version: number;
  icono?: string;
  color?: string;
  activo: boolean;
  orden: number;
}

interface Cliente {
  id: string;
  tipoClienteId: string;
  tipoClienteNombre?: string;
  entidadDinamicaId?: string;
  datosDinamicos?: Record<string, any>;
  codigoCliente: string;
  nombre: string;
  apellido?: string;
  razonSocial: string;
  especialidad?: string;
  categoria?: string;
  segmento?: string;
  institucionId?: string;
  institucionNombre?: string;
  email?: string;
  telefono?: string;
  direccionId?: string;
  direccion?: Direccion;
  estado: string;
  fechaCreacion: string;
  creadoPor?: string;
  fechaModificacion?: string;
  modificadoPor?: string;
}

interface Direccion {
  id: string;
  calle?: string;
  numero?: string;
  ciudad?: string;
  provincia?: string;
  codigoPostal?: string;
  pais?: string;
}

interface CreateClienteDto {
  tipoClienteId: string;
  datosDinamicos?: Record<string, any>;
  codigoCliente: string;
  nombre: string;
  apellido?: string;
  razonSocial: string;
  especialidad?: string;
  categoria?: string;
  segmento?: string;
  institucionId?: string;
  email?: string;
  telefono?: string;
  direccionId?: string;
  estado: string;
}

interface UpdateClienteDto {
  datosDinamicos?: Record<string, any>;
  nombre: string;
  apellido?: string;
  razonSocial: string;
  especialidad?: string;
  categoria?: string;
  segmento?: string;
  institucionId?: string;
  email?: string;
  telefono?: string;
  direccionId?: string;
  estado: string;
}

const CustomerDynamicEntityPage: React.FC = () => {
  const { subtipo } = useParams<{ subtipo: string }>();
  const navigate = useNavigate();
  const { addNotification } = useNotifications();

  // State
  const [loading, setLoading] = useState(true);
  const [esquema, setEsquema] = useState<EsquemaPersonalizado | null>(null);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);

  // View mode state with localStorage
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    const saved = localStorage.getItem('clientesViewMode');
    return (saved === 'list' || saved === 'grid') ? saved : 'grid';
  });

  // Form state - Static fields
  const [formData, setFormData] = useState<CreateClienteDto>({
    tipoClienteId: '',
    codigoCliente: '',
    nombre: '',
    apellido: '',
    razonSocial: '',
    especialidad: '',
    categoria: '',
    segmento: '',
    institucionId: '',
    email: '',
    telefono: '',
    direccionId: '',
    estado: 'Activo',
    datosDinamicos: {}
  });

  // Form state - Dynamic fields
  const [dynamicFormData, setDynamicFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    fetchEsquema();
  }, [subtipo]);

  useEffect(() => {
    localStorage.setItem('clientesViewMode', viewMode);
  }, [viewMode]);

  useEffect(() => {
    if (esquema) {
      fetchClientes();
    }
  }, [esquema]);

  const fetchEsquema = async () => {
    if (!subtipo) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.get('/EsquemasPersonalizados/tipo/Cliente');

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
          // Set tipoClienteId in form data
          setFormData(prev => ({ ...prev, tipoClienteId: esquemaMatch.id }));
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

  const fetchClientes = async () => {
    if (!esquema) return;

    try {
      const response = await api.get('/clientes', {
        params: { tipoClienteId: esquema.id }
      });

      if (response.data) {
        setClientes(response.data.items || response.data);
      }
    } catch (error) {
      console.error('Error fetching clientes:', error);
      addNotification({
        title: 'Error',
        message: 'No se pudieron cargar los clientes',
        type: 'error',
        category: 'clientes'
      });
    }
  };

  const handleCreate = () => {
    setEditingCliente(null);
    // Generar código automáticamente basado en el esquema y timestamp
    const timestamp = Date.now().toString().slice(-6);
    const prefix = esquema?.subTipo?.substring(0, 3).toUpperCase() || 'CLI';
    const autoCode = `${prefix}-${timestamp}`;

    setFormData({
      tipoClienteId: esquema!.id,
      codigoCliente: autoCode,
      nombre: '',
      apellido: '',
      razonSocial: '',
      especialidad: '',
      categoria: '',
      segmento: '',
      institucionId: '',
      email: '',
      telefono: '',
      direccionId: '',
      estado: 'Activo',
      datosDinamicos: {}
    });
    setDynamicFormData({});
    setShowModal(true);
  };

  const handleEdit = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setFormData({
      tipoClienteId: cliente.tipoClienteId,
      codigoCliente: cliente.codigoCliente,
      nombre: cliente.nombre,
      apellido: cliente.apellido || '',
      razonSocial: cliente.razonSocial,
      especialidad: cliente.especialidad || '',
      categoria: cliente.categoria || '',
      segmento: cliente.segmento || '',
      institucionId: cliente.institucionId || '',
      email: cliente.email || '',
      telefono: cliente.telefono || '',
      direccionId: cliente.direccionId || '',
      estado: cliente.estado,
      datosDinamicos: cliente.datosDinamicos || {}
    });
    setDynamicFormData(cliente.datosDinamicos || {});
    setShowModal(true);
  };

  const handleDelete = async (cliente: Cliente) => {
    if (!confirm(`¿Está seguro de eliminar al cliente ${cliente.nombre}?`)) {
      return;
    }

    try {
      await api.delete(`/clientes/${cliente.id}`);
      addNotification({
        title: 'Éxito',
        message: 'Cliente eliminado correctamente',
        type: 'success',
        category: 'clientes'
      });
      fetchClientes();
    } catch (error) {
      console.error('Error deleting cliente:', error);
      addNotification({
        title: 'Error',
        message: 'No se pudo eliminar el cliente',
        type: 'error',
        category: 'clientes'
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
        { name: 'nombre', type: 'text', label: 'Nombre', required: true },
        { name: 'apellido', type: 'text', label: 'Apellido', required: false },
        { name: 'razonSocial', type: 'text', label: 'Razón Social', required: true },
        { name: 'especialidad', type: 'text', label: 'Especialidad', required: false },
        { name: 'categoria', type: 'select', label: 'Categoría', required: false, options: ['A', 'B', 'C'] },
        { name: 'segmento', type: 'select', label: 'Segmento', required: false, options: ['Premium', 'Estándar', 'Básico'] },
        { name: 'email', type: 'email', label: 'Email', required: false },
        { name: 'telefono', type: 'phone', label: 'Teléfono', required: false }
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
        entityType: 'Cliente',
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
        estado: 'Activo'
      });

      setDynamicFormData(dynamicData);

      addNotification({
        title: 'Datos demo generados',
        message: 'Se han generado datos de demostración inteligentes para todos los campos',
        type: 'success',
        category: 'clientes'
      });
    } catch (error) {
      console.error('Error generating demo data:', error);
      addNotification({
        title: 'Error',
        message: 'No se pudieron generar los datos demo',
        type: 'error',
        category: 'clientes'
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!editingCliente) {
        // Create new client
        const createDto: CreateClienteDto = {
          ...formData,
          tipoClienteId: esquema!.id, // Ensure tipoClienteId is always set from the current schema
          datosDinamicos: Object.keys(dynamicFormData).length > 0 ? dynamicFormData : undefined,
          apellido: formData.apellido || undefined,
          especialidad: formData.especialidad || undefined,
          categoria: formData.categoria || undefined,
          segmento: formData.segmento || undefined,
          institucionId: formData.institucionId || undefined,
          email: formData.email || undefined,
          telefono: formData.telefono || undefined,
          direccionId: formData.direccionId || undefined
        };

        await api.post('/clientes', createDto);
        addNotification({
          title: 'Éxito',
          message: 'Cliente creado correctamente',
          type: 'success',
          category: 'clientes'
        });
      } else {
        // Update existing client
        const updateDto: UpdateClienteDto = {
          nombre: formData.nombre,
          datosDinamicos: Object.keys(dynamicFormData).length > 0 ? dynamicFormData : undefined,
          apellido: formData.apellido || undefined,
          razonSocial: formData.razonSocial,
          especialidad: formData.especialidad || undefined,
          categoria: formData.categoria || undefined,
          segmento: formData.segmento || undefined,
          institucionId: formData.institucionId || undefined,
          email: formData.email || undefined,
          telefono: formData.telefono || undefined,
          direccionId: formData.direccionId || undefined,
          estado: formData.estado
        };

        await api.put(`/clientes/${editingCliente.id}`, updateDto);
        addNotification({
          title: 'Éxito',
          message: 'Cliente actualizado correctamente',
          type: 'success',
          category: 'clientes'
        });
      }

      setShowModal(false);
      fetchClientes();
    } catch (error: any) {
      console.error('Error saving cliente:', error);
      addNotification({
        title: 'Error',
        message: error.response?.data?.message || 'No se pudo guardar el cliente',
        type: 'error',
        category: 'clientes'
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

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
        <p>No se pudo cargar la configuración de este tipo de cliente</p>
        <button className="btn btn-secondary" onClick={() => navigate('/crm/clientes')}>
          Volver a Clientes
        </button>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="header-content">
          <div className="entity-icon" style={{ backgroundColor: esquema.color || '#4db8b8' }}>
            <span className="material-icons">{esquema.icono || 'person'}</span>
          </div>
          <div>
            <h1>{esquema.nombre}</h1>
            <p className="page-description">{esquema.descripcion || `Gestión de ${esquema.nombre}`}</p>
          </div>
        </div>
        <div className="header-actions">
          <div className="view-toggle">
            <button
              className={`btn-view ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Vista de mosaico"
            >
              <span className="material-icons">grid_view</span>
            </button>
            <button
              className={`btn-view ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="Vista de lista"
            >
              <span className="material-icons">view_list</span>
            </button>
          </div>
          <button className="btn btn-primary" onClick={handleCreate}>
            <span className="material-icons">add</span>
            Nuevo {esquema.nombre}
          </button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="entities-grid">
          {clientes.map((cliente) => (
            <div key={cliente.id} className="entity-card">
              <div className="entity-body">
                <div className="entity-title">
                  <h3>{cliente.nombre} {cliente.apellido}</h3>
                  <span className={`badge badge-${cliente.estado.toLowerCase()}`}>
                    {cliente.estado}
                  </span>
                </div>
                <div className="entity-details">
                  <div className="entity-field">
                    <span className="field-label">Código:</span>
                    <span className="field-value">{cliente.codigoCliente}</span>
                  </div>
                  <div className="entity-field">
                    <span className="field-label">Razón Social:</span>
                    <span className="field-value">{cliente.razonSocial}</span>
                  </div>
                  {cliente.especialidad && (
                    <div className="entity-field">
                      <span className="field-label">Especialidad:</span>
                      <span className="field-value">{cliente.especialidad}</span>
                    </div>
                  )}
                  {cliente.email && (
                    <div className="entity-field">
                      <span className="field-label">Email:</span>
                      <span className="field-value">{cliente.email}</span>
                    </div>
                  )}
                  {cliente.telefono && (
                    <div className="entity-field">
                      <span className="field-label">Teléfono:</span>
                      <span className="field-value">{cliente.telefono}</span>
                    </div>
                  )}
                  {cliente.institucionNombre && (
                    <div className="entity-field">
                      <span className="field-label">Institución:</span>
                      <span className="field-value">{cliente.institucionNombre}</span>
                    </div>
                  )}
                  {cliente.datosDinamicos && Object.keys(cliente.datosDinamicos).length > 0 && (
                    <span className="more-fields">+{Object.keys(cliente.datosDinamicos).length} campos adicionales</span>
                  )}
                </div>
              </div>
              <div className="entity-actions">
                <button
                  className="btn-icon btn-icon-edit"
                  onClick={() => handleEdit(cliente)}
                  title="Editar"
                >
                  <span className="material-icons">edit</span>
                </button>
                <button
                  className="btn-icon btn-icon-delete"
                  onClick={() => handleDelete(cliente)}
                  title="Eliminar"
                >
                  <span className="material-icons">delete</span>
                </button>
              </div>
            </div>
          ))}

          {clientes.length === 0 && (
            <div className="empty-state">
              <span className="material-icons">inbox</span>
              <h3>No hay clientes</h3>
              <p>Crea tu primer cliente para comenzar</p>
              <button className="btn btn-primary" onClick={handleCreate}>
                <span className="material-icons">add</span>
                Crear Cliente
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="entities-list">
          {clientes.length === 0 ? (
            <div className="empty-state">
              <span className="material-icons">inbox</span>
              <h3>No hay clientes</h3>
              <p>Crea tu primer cliente para comenzar</p>
              <button className="btn btn-primary" onClick={handleCreate}>
                <span className="material-icons">add</span>
                Crear Cliente
              </button>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Nombre</th>
                    <th>Razón Social</th>
                    <th>Especialidad</th>
                    <th>Email</th>
                    <th>Teléfono</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {clientes.map((cliente) => (
                    <tr key={cliente.id}>
                      <td><strong>{cliente.codigoCliente}</strong></td>
                      <td>{cliente.nombre} {cliente.apellido}</td>
                      <td>{cliente.razonSocial}</td>
                      <td>{cliente.especialidad || '-'}</td>
                      <td>{cliente.email || '-'}</td>
                      <td>{cliente.telefono || '-'}</td>
                      <td>
                        <span className={`badge badge-${cliente.estado.toLowerCase()}`}>
                          {cliente.estado}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-icon btn-icon-edit"
                            onClick={() => handleEdit(cliente)}
                            title="Editar"
                          >
                            <span className="material-icons">edit</span>
                          </button>
                          <button
                            className="btn-icon btn-icon-delete"
                            onClick={() => handleDelete(cliente)}
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
                {editingCliente ? 'Editar' : 'Nuevo'} {esquema.nombre}
              </h2>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                {!editingCliente && (
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
                    <div className="form-group">
                      <label>Código de Cliente * (Autogenerado)</label>
                      <input
                        type="text"
                        value={formData.codigoCliente}
                        className="form-control"
                        required
                        readOnly
                        style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                      />
                    </div>

                    <div className="form-group">
                      <label>Nombre *</label>
                      <input
                        type="text"
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        className="form-control"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Apellido</label>
                      <input
                        type="text"
                        value={formData.apellido}
                        onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                        className="form-control"
                      />
                    </div>

                    <div className="form-group">
                      <label>Razón Social *</label>
                      <input
                        type="text"
                        value={formData.razonSocial}
                        onChange={(e) => setFormData({ ...formData, razonSocial: e.target.value })}
                        className="form-control"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="form-control"
                      />
                    </div>

                    <div className="form-group">
                      <label>Teléfono</label>
                      <input
                        type="tel"
                        value={formData.telefono}
                        onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                        className="form-control"
                      />
                    </div>

                    <div className="form-group">
                      <label>Estado *</label>
                      <select
                        value={formData.estado}
                        onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                        className="form-control"
                        required
                      >
                        <option value="Activo">Activo</option>
                        <option value="Inactivo">Inactivo</option>
                        <option value="Suspendido">Suspendido</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 2: Clasificación */}
                <div className="form-section">
                  <h3 className="form-section-title">Clasificación</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Especialidad</label>
                      <input
                        type="text"
                        value={formData.especialidad}
                        onChange={(e) => setFormData({ ...formData, especialidad: e.target.value })}
                        className="form-control"
                        placeholder="Ej: Cardiología, Pediatría..."
                      />
                    </div>

                    <div className="form-group">
                      <label>Categoría</label>
                      <input
                        type="text"
                        value={formData.categoria}
                        onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                        className="form-control"
                        placeholder="Ej: A, B, C..."
                      />
                    </div>

                    <div className="form-group">
                      <label>Segmento</label>
                      <input
                        type="text"
                        value={formData.segmento}
                        onChange={(e) => setFormData({ ...formData, segmento: e.target.value })}
                        className="form-control"
                        placeholder="Ej: Premium, Estándar..."
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Campos Adicionales (Dynamic fields) */}
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
                  {editingCliente ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDynamicEntityPage;
