import { useState, useEffect } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import api from '../../services/api';
import type { EsquemaPersonalizado } from '../../types/dynamic-entities';
import DynamicFormField from '../../components/dynamic/DynamicFormField';
import './CRMPages.css';

interface Agente {
  id: string;
  tipoAgenteId: string;
  tipoAgenteNombre?: string;
  entidadDinamicaId?: string;
  datosDinamicos?: Record<string, any>;
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
  fechaIngreso?: string;
  activo: boolean;
  observaciones?: string;
  fechaCreacion: string;
  fechaModificacion?: string;
}

interface CreateAgenteDto {
  tipoAgenteId: string;
  datosDinamicos?: Record<string, any>;
  codigoAgente: string;
  nombre: string;
  apellido?: string;
  email?: string;
  telefono?: string;
  regionId?: string;
  distritoId?: string;
  lineaNegocioId?: string;
  managerId?: string;
  fechaIngreso?: Date;
  activo: boolean;
  observaciones?: string;
}

interface UpdateAgenteDto {
  datosDinamicos?: Record<string, any>;
  nombre: string;
  apellido?: string;
  email?: string;
  telefono?: string;
  regionId?: string;
  distritoId?: string;
  lineaNegocioId?: string;
  managerId?: string;
  fechaIngreso?: Date;
  activo: boolean;
  observaciones?: string;
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

const AgentesPage = () => {
  const { addNotification } = useNotifications();
  const [items, setItems] = useState<Agente[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedItem, setSelectedItem] = useState<Agente | null>(null);

  // Tipos de agente y esquemas
  const [tiposAgente, setTiposAgente] = useState<EsquemaPersonalizado[]>([]);
  const [selectedTipoAgente, setSelectedTipoAgente] = useState<EsquemaPersonalizado | null>(null);

  // Opciones para selects
  const [regiones, setRegiones] = useState<Region[]>([]);
  const [distritos, setDistritos] = useState<Distrito[]>([]);
  const [lineasNegocio, setLineasNegocio] = useState<LineaNegocio[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 10;

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroTipoAgente, setFiltroTipoAgente] = useState('');
  const [filtroActivo, setFiltroActivo] = useState('');

  // Form state - Campos estáticos
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

  // Form state - Datos dinámicos
  const [dynamicFormData, setDynamicFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    loadTiposAgente();
    loadRegiones();
    loadDistritos();
    loadLineasNegocio();
    loadManagers();
  }, []);

  useEffect(() => {
    loadItems();
  }, [currentPage, searchTerm, filtroTipoAgente, filtroActivo]);

  const loadTiposAgente = async () => {
    try {
      const response = await api.get('/agentes/tipos');
      setTiposAgente(response.data);
    } catch (error) {
      console.error('Error loading tipos de agente:', error);
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

  const loadItems = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        pageSize: pageSize
      };
      if (filtroTipoAgente) params.tipoAgenteId = filtroTipoAgente;

      const response = await api.get('/agentes', { params });
      setItems(response.data.items);
      setTotalPages(response.data.totalPages);
      setTotalItems(response.data.totalItems);
    } catch (error: any) {
      addNotification({
        title: 'Error',
        message: 'No se pudieron cargar los agentes',
        type: 'error',
        category: 'agentes'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (mode: 'create' | 'edit', item?: Agente) => {
    setModalMode(mode);
    if (mode === 'edit' && item) {
      setSelectedItem(item);
      setFormData({
        tipoAgenteId: item.tipoAgenteId,
        codigoAgente: item.codigoAgente,
        nombre: item.nombre,
        apellido: item.apellido || '',
        email: item.email || '',
        telefono: item.telefono || '',
        regionId: item.regionId || '',
        distritoId: item.distritoId || '',
        lineaNegocioId: item.lineaNegocioId || '',
        managerId: item.managerId || '',
        fechaIngreso: item.fechaIngreso ? new Date(item.fechaIngreso) : undefined,
        activo: item.activo,
        observaciones: item.observaciones || '',
        datosDinamicos: item.datosDinamicos || {}
      });
      setDynamicFormData(item.datosDinamicos || {});

      // Cargar el esquema del tipo de agente
      const tipo = tiposAgente.find(t => t.id === item.tipoAgenteId);
      setSelectedTipoAgente(tipo || null);
    } else {
      setSelectedItem(null);
      setFormData({
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
      setDynamicFormData({});
      setSelectedTipoAgente(null);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedItem(null);
    setSelectedTipoAgente(null);
  };

  const handleTipoAgenteChange = (tipoAgenteId: string) => {
    setFormData({ ...formData, tipoAgenteId });
    const tipo = tiposAgente.find(t => t.id === tipoAgenteId);
    setSelectedTipoAgente(tipo || null);
    setDynamicFormData({});
  };

  const handleDynamicFieldChange = (fieldName: string, value: any) => {
    setDynamicFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (modalMode === 'create') {
        const createDto: CreateAgenteDto = {
          ...formData,
          datosDinamicos: Object.keys(dynamicFormData).length > 0 ? dynamicFormData : undefined,
          apellido: formData.apellido || undefined,
          email: formData.email || undefined,
          telefono: formData.telefono || undefined,
          regionId: formData.regionId || undefined,
          distritoId: formData.distritoId || undefined,
          lineaNegocioId: formData.lineaNegocioId || undefined,
          managerId: formData.managerId || undefined,
          observaciones: formData.observaciones || undefined
        };
        await api.post('/agentes', createDto);
        addNotification({
          title: 'Agente creado',
          message: 'El agente se creó correctamente',
          type: 'success',
          category: 'agentes'
        });
      } else if (selectedItem) {
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
          fechaIngreso: formData.fechaIngreso,
          activo: formData.activo,
          observaciones: formData.observaciones || undefined
        };
        await api.put(`/agentes/${selectedItem.id}`, updateDto);
        addNotification({
          title: 'Agente actualizado',
          message: 'El agente se actualizó correctamente',
          type: 'success',
          category: 'agentes'
        });
      }
      handleCloseModal();
      loadItems();
    } catch (error: any) {
      addNotification({
        title: 'Error',
        message: error.response?.data?.message || 'No se pudo guardar el agente',
        type: 'error',
        category: 'agentes'
      });
    }
  };

  const handleDelete = async (item: Agente) => {
    if (!window.confirm(`¿Está seguro de eliminar al agente ${item.nombre}?`)) {
      return;
    }

    try {
      await api.delete(`/agentes/${item.id}`);
      addNotification({
        title: 'Agente eliminado',
        message: 'El agente se eliminó correctamente',
        type: 'success',
        category: 'agentes'
      });
      loadItems();
    } catch (error: any) {
      addNotification({
        title: 'Error',
        message: 'No se pudo eliminar el agente',
        type: 'error',
        category: 'agentes'
      });
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

  const parseSchemaFields = (schema: string): any[] => {
    try {
      const parsed = JSON.parse(schema);
      return parsed.fields || [];
    } catch {
      return [];
    }
  };

  if (loading && items.length === 0) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="header-content">
          <h1>
            <span className="material-icons">person</span>
            Agentes / Representantes
          </h1>
          <p className="page-description">
            Gestión de representantes de ventas y agentes médicos
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal('create')}>
          <span className="material-icons">add</span>
          Nuevo Agente
        </button>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-grid">
          <div className="form-group">
            <label>Buscar por nombre</label>
            <div className="search-bar">
              <span className="material-icons">search</span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="form-control"
                placeholder="Buscar agente..."
              />
            </div>
          </div>
          <div className="form-group">
            <label>Tipo de Agente</label>
            <select
              value={filtroTipoAgente}
              onChange={(e) => {
                setFiltroTipoAgente(e.target.value);
                setCurrentPage(1);
              }}
              className="form-control"
            >
              <option value="">Todos</option>
              {tiposAgente.map(tipo => (
                <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Estado</label>
            <select
              value={filtroActivo}
              onChange={(e) => {
                setFiltroActivo(e.target.value);
                setCurrentPage(1);
              }}
              className="form-control"
            >
              <option value="">Todos</option>
              <option value="true">Activo</option>
              <option value="false">Inactivo</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th>Tipo</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Región</th>
              <th>Distrito</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={9} className="no-data">
                  <span className="material-icons">inbox</span>
                  <p>No hay agentes para mostrar</p>
                </td>
              </tr>
            ) : (
              items.map(item => (
                <tr key={item.id}>
                  <td><strong>{item.codigoAgente}</strong></td>
                  <td>{item.nombre} {item.apellido}</td>
                  <td>{item.tipoAgenteNombre || '-'}</td>
                  <td>{item.email || '-'}</td>
                  <td>{item.telefono || '-'}</td>
                  <td>{item.regionNombre || '-'}</td>
                  <td>{item.distritoNombre || '-'}</td>
                  <td>
                    <span className={`badge badge-${item.activo ? 'activo' : 'inactivo'}`}>
                      {item.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-icon btn-icon-edit"
                        onClick={() => handleOpenModal('edit', item)}
                        title="Editar"
                      >
                        <span className="material-icons">edit</span>
                      </button>
                      <button
                        className="btn-icon btn-icon-delete"
                        onClick={() => handleDelete(item)}
                        title="Eliminar"
                      >
                        <span className="material-icons">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <span className="material-icons">chevron_left</span>
            Anterior
          </button>
          <span className="pagination-info">
            Página {currentPage} de {totalPages} ({totalItems} registros)
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Siguiente
            <span className="material-icons">chevron_right</span>
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {modalMode === 'create' ? 'Nuevo Agente' : 'Editar Agente'}
              </h2>
              <button className="btn-close" onClick={handleCloseModal}>
                <span className="material-icons">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {/* Sección: Información Base */}
                <div className="form-section">
                  <h3 className="form-section-title">Información Base</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Tipo de Agente *</label>
                      <select
                        value={formData.tipoAgenteId}
                        onChange={(e) => handleTipoAgenteChange(e.target.value)}
                        className="form-control"
                        required
                        disabled={modalMode === 'edit'}
                      >
                        <option value="">Seleccione un tipo</option>
                        {tiposAgente.map(tipo => (
                          <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Código de Agente *</label>
                      <input
                        type="text"
                        value={formData.codigoAgente}
                        onChange={(e) => setFormData({ ...formData, codigoAgente: e.target.value })}
                        className="form-control"
                        required
                        disabled={modalMode === 'edit'}
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
                      <label>Fecha de Ingreso</label>
                      <input
                        type="date"
                        value={formData.fechaIngreso ? new Date(formData.fechaIngreso).toISOString().split('T')[0] : ''}
                        onChange={(e) => setFormData({ ...formData, fechaIngreso: e.target.value ? new Date(e.target.value) : undefined })}
                        className="form-control"
                      />
                    </div>

                    <div className="form-group">
                      <label>Estado *</label>
                      <select
                        value={formData.activo ? 'true' : 'false'}
                        onChange={(e) => setFormData({ ...formData, activo: e.target.value === 'true' })}
                        className="form-control"
                        required
                      >
                        <option value="true">Activo</option>
                        <option value="false">Inactivo</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Sección: Asignaciones */}
                <div className="form-section">
                  <h3 className="form-section-title">Asignaciones</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Región</label>
                      <select
                        value={formData.regionId}
                        onChange={(e) => setFormData({ ...formData, regionId: e.target.value })}
                        className="form-control"
                      >
                        <option value="">Seleccione región</option>
                        {regiones.map(region => (
                          <option key={region.id} value={region.id}>
                            {region.codigo} - {region.nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Distrito</label>
                      <select
                        value={formData.distritoId}
                        onChange={(e) => setFormData({ ...formData, distritoId: e.target.value })}
                        className="form-control"
                      >
                        <option value="">Seleccione distrito</option>
                        {distritos.map(distrito => (
                          <option key={distrito.id} value={distrito.id}>
                            {distrito.codigo} - {distrito.nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Línea de Negocio</label>
                      <select
                        value={formData.lineaNegocioId}
                        onChange={(e) => setFormData({ ...formData, lineaNegocioId: e.target.value })}
                        className="form-control"
                      >
                        <option value="">Seleccione línea de negocio</option>
                        {lineasNegocio.map(linea => (
                          <option key={linea.id} value={linea.id}>
                            {linea.codigo} - {linea.nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Manager</label>
                      <select
                        value={formData.managerId}
                        onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                        className="form-control"
                      >
                        <option value="">Seleccione manager</option>
                        {managers.map(manager => (
                          <option key={manager.id} value={manager.id}>
                            {manager.codigo} - {manager.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Sección: Observaciones */}
                <div className="form-section">
                  <div className="form-group">
                    <label>Observaciones</label>
                    <textarea
                      value={formData.observaciones}
                      onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                      className="form-control"
                      rows={3}
                      placeholder="Observaciones adicionales..."
                    />
                  </div>
                </div>

                {/* Sección: Campos Dinámicos */}
                {selectedTipoAgente && selectedTipoAgente.schema && (
                  <div className="form-section">
                    <h3 className="form-section-title">Campos Adicionales ({selectedTipoAgente.nombre})</h3>
                    <div className="form-grid">
                      {parseSchemaFields(selectedTipoAgente.schema).map((field: any) => (
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
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {modalMode === 'create' ? 'Crear' : 'Actualizar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentesPage;
