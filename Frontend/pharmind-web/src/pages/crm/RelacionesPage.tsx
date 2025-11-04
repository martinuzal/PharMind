import { useState, useEffect } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { relacionesService } from '../../services/relaciones.service';
import { agentesService } from '../../services/agentes.service';
import { clientesService } from '../../services/clientes.service';
import type {
  Relacion,
  CreateRelacionDto,
  UpdateRelacionDto
} from '../../services/relaciones.service';
import type { Agente } from '../../services/agentes.service';
import type { Cliente } from '../../services/clientes.service';
import './CRMPages.css';

const RelacionesPage = () => {
  const { addNotification } = useNotifications();
  const [items, setItems] = useState<Relacion[]>([]);
  const [agentes, setAgentes] = useState<Agente[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedItem, setSelectedItem] = useState<Relacion | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 10;

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroAgente, setFiltroAgente] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroPrioridad, setFiltroPrioridad] = useState('');

  // Form state
  const [formData, setFormData] = useState<CreateRelacionDto>({
    codigoRelacion: '',
    agenteId: '',
    clientePrincipalId: '',
    clienteSecundario1Id: '',
    clienteSecundario2Id: '',
    tipoRelacion: 'DirectaMedico',
    fechaInicio: new Date(),
    fechaFin: undefined,
    estado: 'Activa',
    frecuenciaVisitas: 'Semanal',
    prioridad: 'Media',
    observaciones: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadItems();
  }, [currentPage, searchTerm, filtroAgente, filtroEstado, filtroPrioridad]);

  const loadData = async () => {
    try {
      const [agentesData, clientesData] = await Promise.all([
        agentesService.getAll({ estado: 'Activo' }),
        clientesService.getAll({ estado: 'Activo' })
      ]);
      setAgentes(agentesData.items);
      setClientes(clientesData.items);
    } catch (error: any) {
      addNotification({
        title: 'Error',
        message: 'No se pudieron cargar los datos necesarios',
        type: 'error',
        category: 'relaciones'
      });
    }
  };

  const loadItems = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        pageSize: pageSize
      };
      if (searchTerm) params.codigoRelacion = searchTerm;
      if (filtroAgente) params.agenteId = filtroAgente;
      if (filtroEstado) params.estado = filtroEstado;
      if (filtroPrioridad) params.prioridad = filtroPrioridad;

      const response = await relacionesService.getAll(params);
      setItems(response.items);
      setTotalPages(response.totalPages);
      setTotalItems(response.totalItems);
    } catch (error: any) {
      addNotification({
        title: 'Error',
        message: 'No se pudieron cargar las relaciones',
        type: 'error',
        category: 'relaciones'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (mode: 'create' | 'edit', item?: Relacion) => {
    setModalMode(mode);
    if (mode === 'edit' && item) {
      setSelectedItem(item);
      setFormData({
        codigoRelacion: item.codigoRelacion,
        agenteId: item.agenteId,
        clientePrincipalId: item.clientePrincipalId,
        clienteSecundario1Id: item.clienteSecundario1Id || '',
        clienteSecundario2Id: item.clienteSecundario2Id || '',
        tipoRelacion: item.tipoRelacion || 'DirectaMedico',
        fechaInicio: new Date(item.fechaInicio),
        fechaFin: item.fechaFin ? new Date(item.fechaFin) : undefined,
        estado: item.estado,
        frecuenciaVisitas: item.frecuenciaVisitas || 'Semanal',
        prioridad: item.prioridad || 'Media',
        observaciones: item.observaciones || ''
      });
    } else {
      setSelectedItem(null);
      setFormData({
        codigoRelacion: '',
        agenteId: '',
        clientePrincipalId: '',
        clienteSecundario1Id: '',
        clienteSecundario2Id: '',
        tipoRelacion: 'DirectaMedico',
        fechaInicio: new Date(),
        fechaFin: undefined,
        estado: 'Activa',
        frecuenciaVisitas: 'Semanal',
        prioridad: 'Media',
        observaciones: ''
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
        const createDto: CreateRelacionDto = {
          ...formData,
          clienteSecundario1Id: formData.clienteSecundario1Id || undefined,
          clienteSecundario2Id: formData.clienteSecundario2Id || undefined,
          tipoRelacion: formData.tipoRelacion || undefined,
          observaciones: formData.observaciones || undefined
        };
        await relacionesService.create(createDto);
        addNotification({
          title: 'Relacion creada',
          message: 'La relacion se creo correctamente',
          type: 'success',
          category: 'relaciones'
        });
      } else if (selectedItem) {
        const updateDto: UpdateRelacionDto = {
          clienteSecundario1Id: formData.clienteSecundario1Id || undefined,
          clienteSecundario2Id: formData.clienteSecundario2Id || undefined,
          tipoRelacion: formData.tipoRelacion || undefined,
          fechaInicio: formData.fechaInicio,
          fechaFin: formData.fechaFin,
          estado: formData.estado,
          frecuenciaVisitas: formData.frecuenciaVisitas || undefined,
          prioridad: formData.prioridad || undefined,
          observaciones: formData.observaciones || undefined
        };
        await relacionesService.update(selectedItem.id, updateDto);
        addNotification({
          title: 'Relacion actualizada',
          message: 'La relacion se actualizo correctamente',
          type: 'success',
          category: 'relaciones'
        });
      }
      handleCloseModal();
      loadItems();
    } catch (error: any) {
      addNotification({
        title: 'Error',
        message: error.response?.data?.message || 'No se pudo guardar la relacion',
        type: 'error',
        category: 'relaciones'
      });
    }
  };

  const handleDelete = async (item: Relacion) => {
    if (!window.confirm(`Esta seguro de eliminar la relacion ${item.codigoRelacion}?`)) {
      return;
    }

    try {
      await relacionesService.delete(item.id);
      addNotification({
        title: 'Relacion eliminada',
        message: 'La relacion se elimino correctamente',
        type: 'success',
        category: 'relaciones'
      });
      loadItems();
    } catch (error: any) {
      addNotification({
        title: 'Error',
        message: 'No se pudo eliminar la relacion',
        type: 'error',
        category: 'relaciones'
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

  const getEstadoBadgeClass = (estado: string) => {
    const estadoLower = estado.toLowerCase();
    return `badge badge-${estadoLower}`;
  };

  const getPrioridadBadgeClass = (prioridad?: string) => {
    if (!prioridad) return 'badge badge-secondary';
    const prioridadLower = prioridad.toLowerCase();
    return `badge badge-${prioridadLower}`;
  };

  const getClienteNombre = (clienteId: string) => {
    const cliente = clientes.find(c => c.id === clienteId);
    return cliente?.razonSocial || 'Seleccionar...';
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
            <span className="material-icons">group</span>
            Relaciones Agente-Cliente
          </h1>
          <p className="page-description">
            Gestion de relaciones entre representantes y clientes medicos
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal('create')}>
          <span className="material-icons">add</span>
          Nueva Relacion
        </button>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-grid">
          <div className="form-group">
            <label>Buscar por codigo</label>
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
                placeholder="Buscar relacion..."
              />
            </div>
          </div>
          <div className="form-group">
            <label>Agente</label>
            <select
              value={filtroAgente}
              onChange={(e) => {
                setFiltroAgente(e.target.value);
                setCurrentPage(1);
              }}
              className="form-control"
            >
              <option value="">Todos</option>
              {agentes.map(agente => (
                <option key={agente.id} value={agente.id}>{agente.nombre}</option>
              ))}
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
              <option value="Activa">Activa</option>
              <option value="Inactiva">Inactiva</option>
              <option value="Suspendida">Suspendida</option>
              <option value="Finalizada">Finalizada</option>
            </select>
          </div>
          <div className="form-group">
            <label>Prioridad</label>
            <select
              value={filtroPrioridad}
              onChange={(e) => {
                setFiltroPrioridad(e.target.value);
                setCurrentPage(1);
              }}
              className="form-control"
            >
              <option value="">Todas</option>
              <option value="Alta">Alta</option>
              <option value="Media">Media</option>
              <option value="Baja">Baja</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Codigo</th>
              <th>Agente</th>
              <th>Cliente Principal</th>
              <th>Clientes Secundarios</th>
              <th>Tipo</th>
              <th>Fecha Inicio</th>
              <th>Frecuencia</th>
              <th>Prioridad</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={10} className="no-data">
                  <span className="material-icons">inbox</span>
                  <p>No hay relaciones para mostrar</p>
                </td>
              </tr>
            ) : (
              items.map(item => (
                <tr key={item.id}>
                  <td><strong>{item.codigoRelacion}</strong></td>
                  <td>{item.agenteNombre}</td>
                  <td>{item.clientePrincipalNombre}</td>
                  <td>
                    {item.clienteSecundario1Nombre && (
                      <div className="badge badge-info" style={{ marginBottom: '0.25rem' }}>
                        {item.clienteSecundario1Nombre}
                      </div>
                    )}
                    {item.clienteSecundario2Nombre && (
                      <div className="badge badge-info">
                        {item.clienteSecundario2Nombre}
                      </div>
                    )}
                    {!item.clienteSecundario1Nombre && !item.clienteSecundario2Nombre && '-'}
                  </td>
                  <td>{item.tipoRelacion || '-'}</td>
                  <td>{formatDate(item.fechaInicio)}</td>
                  <td>{item.frecuenciaVisitas || '-'}</td>
                  <td>
                    <span className={getPrioridadBadgeClass(item.prioridad)}>
                      {item.prioridad || '-'}
                    </span>
                  </td>
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
                {modalMode === 'create' ? 'Nueva Relacion' : 'Editar Relacion'}
              </h2>
              <button className="btn-close" onClick={handleCloseModal}>
                <span className="material-icons">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Codigo de Relacion *</label>
                    <input
                      type="text"
                      value={formData.codigoRelacion}
                      onChange={(e) => setFormData({ ...formData, codigoRelacion: e.target.value })}
                      className="form-control"
                      required
                      disabled={modalMode === 'edit'}
                    />
                  </div>

                  <div className="form-group">
                    <label>Agente / Representante *</label>
                    <select
                      value={formData.agenteId}
                      onChange={(e) => setFormData({ ...formData, agenteId: e.target.value })}
                      className="form-control"
                      required
                      disabled={modalMode === 'edit'}
                    >
                      <option value="">Seleccione un agente</option>
                      {agentes.map(agente => (
                        <option key={agente.id} value={agente.id}>
                          {agente.codigoAgente} - {agente.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group full-width">
                    <label>Cliente Principal *</label>
                    <select
                      value={formData.clientePrincipalId}
                      onChange={(e) => setFormData({ ...formData, clientePrincipalId: e.target.value })}
                      className="form-control"
                      required
                      disabled={modalMode === 'edit'}
                    >
                      <option value="">Seleccione un cliente</option>
                      {clientes.map(cliente => (
                        <option key={cliente.id} value={cliente.id}>
                          {cliente.codigoCliente} - {cliente.razonSocial} ({cliente.tipoCliente})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group full-width">
                    <label>Cliente Secundario 1 (Opcional)</label>
                    <select
                      value={formData.clienteSecundario1Id}
                      onChange={(e) => setFormData({ ...formData, clienteSecundario1Id: e.target.value })}
                      className="form-control"
                    >
                      <option value="">Ninguno</option>
                      {clientes
                        .filter(c => c.id !== formData.clientePrincipalId && c.id !== formData.clienteSecundario2Id)
                        .map(cliente => (
                          <option key={cliente.id} value={cliente.id}>
                            {cliente.codigoCliente} - {cliente.razonSocial} ({cliente.tipoCliente})
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="form-group full-width">
                    <label>Cliente Secundario 2 (Opcional)</label>
                    <select
                      value={formData.clienteSecundario2Id}
                      onChange={(e) => setFormData({ ...formData, clienteSecundario2Id: e.target.value })}
                      className="form-control"
                    >
                      <option value="">Ninguno</option>
                      {clientes
                        .filter(c => c.id !== formData.clientePrincipalId && c.id !== formData.clienteSecundario1Id)
                        .map(cliente => (
                          <option key={cliente.id} value={cliente.id}>
                            {cliente.codigoCliente} - {cliente.razonSocial} ({cliente.tipoCliente})
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Tipo de Relacion</label>
                    <select
                      value={formData.tipoRelacion}
                      onChange={(e) => setFormData({ ...formData, tipoRelacion: e.target.value })}
                      className="form-control"
                    >
                      <option value="DirectaMedico">Directa Medico</option>
                      <option value="InstitucionMedica">Institucion Medica</option>
                      <option value="Farmacia">Farmacia</option>
                      <option value="Mixta">Mixta</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Fecha de Inicio *</label>
                    <input
                      type="date"
                      value={formData.fechaInicio ? new Date(formData.fechaInicio).toISOString().split('T')[0] : ''}
                      onChange={(e) => setFormData({ ...formData, fechaInicio: new Date(e.target.value) })}
                      className="form-control"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Fecha de Fin</label>
                    <input
                      type="date"
                      value={formData.fechaFin ? new Date(formData.fechaFin).toISOString().split('T')[0] : ''}
                      onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value ? new Date(e.target.value) : undefined })}
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label>Frecuencia de Visitas</label>
                    <select
                      value={formData.frecuenciaVisitas}
                      onChange={(e) => setFormData({ ...formData, frecuenciaVisitas: e.target.value })}
                      className="form-control"
                    >
                      <option value="Diaria">Diaria</option>
                      <option value="Semanal">Semanal</option>
                      <option value="Quincenal">Quincenal</option>
                      <option value="Mensual">Mensual</option>
                      <option value="Bimestral">Bimestral</option>
                      <option value="Trimestral">Trimestral</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Prioridad</label>
                    <select
                      value={formData.prioridad}
                      onChange={(e) => setFormData({ ...formData, prioridad: e.target.value })}
                      className="form-control"
                    >
                      <option value="Alta">Alta</option>
                      <option value="Media">Media</option>
                      <option value="Baja">Baja</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Estado *</label>
                    <select
                      value={formData.estado}
                      onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                      className="form-control"
                      required
                    >
                      <option value="Activa">Activa</option>
                      <option value="Inactiva">Inactiva</option>
                      <option value="Suspendida">Suspendida</option>
                      <option value="Finalizada">Finalizada</option>
                    </select>
                  </div>

                  <div className="form-group full-width">
                    <label>Observaciones</label>
                    <textarea
                      value={formData.observaciones}
                      onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                      className="form-control"
                      rows={3}
                      maxLength={1000}
                    />
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

export default RelacionesPage;
