import { useState, useEffect } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { clientesService } from '../../services/clientes.service';
import type {
  Cliente,
  CreateClienteDto,
  UpdateClienteDto
} from '../../services/clientes.service';
import './CRMPages.css';

const ClientesPage = () => {
  const { addNotification } = useNotifications();
  const [items, setItems] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedItem, setSelectedItem] = useState<Cliente | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 10;

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroTipoCliente, setFiltroTipoCliente] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroEspecialidad, setFiltroEspecialidad] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');

  // Form state
  const [formData, setFormData] = useState<CreateClienteDto>({
    codigoCliente: '',
    tipoCliente: 'Medico',
    razonSocial: '',
    especialidad: '',
    categoria: '',
    segmento: '',
    institucionId: '',
    email: '',
    telefono: '',
    direccionId: '',
    estado: 'Activo'
  });

  useEffect(() => {
    loadItems();
  }, [currentPage, searchTerm, filtroTipoCliente, filtroEstado, filtroEspecialidad, filtroCategoria]);

  const loadItems = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        pageSize: pageSize
      };
      if (searchTerm) params.razonSocial = searchTerm;
      if (filtroTipoCliente) params.tipoCliente = filtroTipoCliente;
      if (filtroEstado) params.estado = filtroEstado;
      if (filtroEspecialidad) params.especialidad = filtroEspecialidad;
      if (filtroCategoria) params.categoria = filtroCategoria;

      const response = await clientesService.getAll(params);
      setItems(response.items);
      setTotalPages(response.totalPages);
      setTotalItems(response.totalItems);
    } catch (error: any) {
      addNotification({
        title: 'Error',
        message: 'No se pudieron cargar los clientes',
        type: 'error',
        category: 'clientes'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (mode: 'create' | 'edit', item?: Cliente) => {
    setModalMode(mode);
    if (mode === 'edit' && item) {
      setSelectedItem(item);
      setFormData({
        codigoCliente: item.codigoCliente,
        tipoCliente: item.tipoCliente,
        razonSocial: item.razonSocial,
        especialidad: item.especialidad || '',
        categoria: item.categoria || '',
        segmento: item.segmento || '',
        institucionId: item.institucionId || '',
        email: item.email || '',
        telefono: item.telefono || '',
        direccionId: item.direccionId || '',
        estado: item.estado
      });
    } else {
      setSelectedItem(null);
      setFormData({
        codigoCliente: '',
        tipoCliente: 'Medico',
        razonSocial: '',
        especialidad: '',
        categoria: '',
        segmento: '',
        institucionId: '',
        email: '',
        telefono: '',
        direccionId: '',
        estado: 'Activo'
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (modalMode === 'create') {
        const createDto: CreateClienteDto = {
          ...formData,
          especialidad: formData.especialidad || undefined,
          categoria: formData.categoria || undefined,
          segmento: formData.segmento || undefined,
          institucionId: formData.institucionId || undefined,
          email: formData.email || undefined,
          telefono: formData.telefono || undefined,
          direccionId: formData.direccionId || undefined
        };
        await clientesService.create(createDto);
        addNotification({
          title: 'Cliente creado',
          message: 'El cliente se creo correctamente',
          type: 'success',
          category: 'clientes'
        });
      } else if (selectedItem) {
        const updateDto: UpdateClienteDto = {
          tipoCliente: formData.tipoCliente,
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
        await clientesService.update(selectedItem.id, updateDto);
        addNotification({
          title: 'Cliente actualizado',
          message: 'El cliente se actualizo correctamente',
          type: 'success',
          category: 'clientes'
        });
      }
      handleCloseModal();
      loadItems();
    } catch (error: any) {
      addNotification({
        title: 'Error',
        message: error.response?.data?.message || 'No se pudo guardar el cliente',
        type: 'error',
        category: 'clientes'
      });
    }
  };

  const handleDelete = async (item: Cliente) => {
    if (!window.confirm(`Esta seguro de eliminar al cliente ${item.razonSocial}?`)) {
      return;
    }

    try {
      await clientesService.delete(item.id);
      addNotification({
        title: 'Cliente eliminado',
        message: 'El cliente se elimino correctamente',
        type: 'success',
        category: 'clientes'
      });
      loadItems();
    } catch (error: any) {
      addNotification({
        title: 'Error',
        message: 'No se pudo eliminar el cliente',
        type: 'error',
        category: 'clientes'
      });
    }
  };

  const getTipoClienteBadgeClass = (tipo: string) => {
    switch (tipo) {
      case 'Medico':
        return 'badge badge-info';
      case 'Institucion':
        return 'badge badge-primary';
      case 'Farmacia':
        return 'badge badge-success';
      default:
        return 'badge badge-secondary';
    }
  };

  const getEstadoBadgeClass = (estado: string) => {
    const estadoLower = estado.toLowerCase();
    return `badge badge-${estadoLower}`;
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
            <span className="material-icons">business</span>
            Clientes
          </h1>
          <p className="page-description">
            Gestion de medicos, instituciones medicas y farmacias
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal('create')}>
          <span className="material-icons">add</span>
          Nuevo Cliente
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
                placeholder="Buscar cliente..."
              />
            </div>
          </div>
          <div className="form-group">
            <label>Tipo de Cliente</label>
            <select
              value={filtroTipoCliente}
              onChange={(e) => {
                setFiltroTipoCliente(e.target.value);
                setCurrentPage(1);
              }}
              className="form-control"
            >
              <option value="">Todos</option>
              <option value="Medico">Medico</option>
              <option value="Institucion">Institucion</option>
              <option value="Farmacia">Farmacia</option>
            </select>
          </div>
          <div className="form-group">
            <label>Estado</label>
            <select
              value={filtroEstado}
              onChange={(e) => {
                setFiltroEstado(e.target.value);
                setCurrentPage(1);
              }}
              className="form-control"
            >
              <option value="">Todos</option>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
          </div>
          <div className="form-group">
            <label>Especialidad</label>
            <input
              type="text"
              value={filtroEspecialidad}
              onChange={(e) => {
                setFiltroEspecialidad(e.target.value);
                setCurrentPage(1);
              }}
              className="form-control"
              placeholder="Especialidad"
            />
          </div>
          <div className="form-group">
            <label>Categoria</label>
            <input
              type="text"
              value={filtroCategoria}
              onChange={(e) => {
                setFiltroCategoria(e.target.value);
                setCurrentPage(1);
              }}
              className="form-control"
              placeholder="Categoria"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Codigo</th>
              <th>Razon Social</th>
              <th>Tipo</th>
              <th>Especialidad</th>
              <th>Categoria</th>
              <th>Segmento</th>
              <th>Email</th>
              <th>Telefono</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={10} className="no-data">
                  <span className="material-icons">inbox</span>
                  <p>No hay clientes para mostrar</p>
                </td>
              </tr>
            ) : (
              items.map(item => (
                <tr key={item.id}>
                  <td><strong>{item.codigoCliente}</strong></td>
                  <td>{item.razonSocial}</td>
                  <td>
                    <span className={getTipoClienteBadgeClass(item.tipoCliente)}>
                      {item.tipoCliente}
                    </span>
                  </td>
                  <td>{item.especialidad || '-'}</td>
                  <td>{item.categoria || '-'}</td>
                  <td>{item.segmento || '-'}</td>
                  <td>{item.email || '-'}</td>
                  <td>{item.telefono || '-'}</td>
                  <td>
                    <span className={getEstadoBadgeClass(item.estado)}>
                      {item.estado}
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
            Pagina {currentPage} de {totalPages} ({totalItems} registros)
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
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {modalMode === 'create' ? 'Nuevo Cliente' : 'Editar Cliente'}
              </h2>
              <button className="btn-close" onClick={handleCloseModal}>
                <span className="material-icons">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Codigo de Cliente *</label>
                    <input
                      type="text"
                      value={formData.codigoCliente}
                      onChange={(e) => setFormData({ ...formData, codigoCliente: e.target.value })}
                      className="form-control"
                      required
                      disabled={modalMode === 'edit'}
                    />
                  </div>

                  <div className="form-group">
                    <label>Tipo de Cliente *</label>
                    <select
                      value={formData.tipoCliente}
                      onChange={(e) => setFormData({ ...formData, tipoCliente: e.target.value })}
                      className="form-control"
                      required
                    >
                      <option value="Medico">Medico</option>
                      <option value="Institucion">Institucion</option>
                      <option value="Farmacia">Farmacia</option>
                    </select>
                  </div>

                  <div className="form-group full-width">
                    <label>Razon Social / Nombre *</label>
                    <input
                      type="text"
                      value={formData.razonSocial}
                      onChange={(e) => setFormData({ ...formData, razonSocial: e.target.value })}
                      className="form-control"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Especialidad</label>
                    <input
                      type="text"
                      value={formData.especialidad}
                      onChange={(e) => setFormData({ ...formData, especialidad: e.target.value })}
                      className="form-control"
                      placeholder="Ej: Cardiologia, Pediatria"
                    />
                  </div>

                  <div className="form-group">
                    <label>Categoria</label>
                    <select
                      value={formData.categoria}
                      onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                      className="form-control"
                    >
                      <option value="">Seleccionar</option>
                      <option value="A">A - Premium</option>
                      <option value="B">B - Alto</option>
                      <option value="C">C - Medio</option>
                      <option value="D">D - Bajo</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Segmento</label>
                    <input
                      type="text"
                      value={formData.segmento}
                      onChange={(e) => setFormData({ ...formData, segmento: e.target.value })}
                      className="form-control"
                      placeholder="Segmento de mercado"
                    />
                  </div>

                  <div className="form-group">
                    <label>ID Institucion</label>
                    <input
                      type="text"
                      value={formData.institucionId}
                      onChange={(e) => setFormData({ ...formData, institucionId: e.target.value })}
                      className="form-control"
                      placeholder="ID de institucion asociada"
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
                    <label>Telefono</label>
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
                    </select>
                  </div>
                </div>
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

export default ClientesPage;
