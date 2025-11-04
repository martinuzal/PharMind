import { useState, useEffect } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { interaccionesService } from '../../services/interacciones.service';
import { relacionesService } from '../../services/relaciones.service';
import { agentesService } from '../../services/agentes.service';
import type {
  Interaccion,
  CreateInteraccionDto,
  UpdateInteraccionDto
} from '../../services/interacciones.service';
import type { Relacion } from '../../services/relaciones.service';
import type { Agente } from '../../services/agentes.service';
import './CRMPages.css';

const InteraccionesPage = () => {
  const { addNotification } = useNotifications();
  const [items, setItems] = useState<Interaccion[]>([]);
  const [relaciones, setRelaciones] = useState<Relacion[]>([]);
  const [agentes, setAgentes] = useState<Agente[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedItem, setSelectedItem] = useState<Interaccion | null>(null);
  const [selectedRelacion, setSelectedRelacion] = useState<Relacion | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 10;

  // Filters
  const [filtroAgente, setFiltroAgente] = useState('');
  const [filtroTipoInteraccion, setFiltroTipoInteraccion] = useState('');
  const [filtroResultado, setFiltroResultado] = useState('');
  const [filtroFechaInicio, setFiltroFechaInicio] = useState('');
  const [filtroFechaFin, setFiltroFechaFin] = useState('');

  // Form state
  const [formData, setFormData] = useState<CreateInteraccionDto>({
    codigoInteraccion: '',
    relacionId: '',
    agenteId: '',
    clienteId: '',
    tipoInteraccion: 'VisitaMedica',
    fecha: new Date(),
    turno: 'Mañana',
    duracionMinutos: 30,
    resultado: 'Exitosa',
    objetivoVisita: '',
    resumenVisita: '',
    proximaAccion: '',
    fechaProximaAccion: undefined,
    latitud: undefined,
    longitud: undefined,
    observaciones: '',
    entidadDinamicaId: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadItems();
  }, [currentPage, filtroAgente, filtroTipoInteraccion, filtroResultado, filtroFechaInicio, filtroFechaFin]);

  const loadData = async () => {
    try {
      const [relacionesData, agentesData] = await Promise.all([
        relacionesService.getAll({ estado: 'Activa' }),
        agentesService.getAll({ estado: 'Activo' })
      ]);
      setRelaciones(relacionesData.items);
      setAgentes(agentesData.items);
    } catch (error: any) {
      addNotification({
        title: 'Error',
        message: 'No se pudieron cargar los datos necesarios',
        type: 'error',
        category: 'interacciones'
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
      if (filtroAgente) params.agenteId = filtroAgente;
      if (filtroTipoInteraccion) params.tipoInteraccion = filtroTipoInteraccion;
      if (filtroResultado) params.resultado = filtroResultado;
      if (filtroFechaInicio) params.fechaInicio = filtroFechaInicio;
      if (filtroFechaFin) params.fechaFin = filtroFechaFin;

      const response = await interaccionesService.getAll(params);
      setItems(response.items);
      setTotalPages(response.totalPages);
      setTotalItems(response.totalItems);
    } catch (error: any) {
      addNotification({
        title: 'Error',
        message: 'No se pudieron cargar las interacciones',
        type: 'error',
        category: 'interacciones'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRelacionChange = (relacionId: string) => {
    const relacion = relaciones.find(r => r.id === relacionId);
    setSelectedRelacion(relacion || null);

    if (relacion) {
      setFormData({
        ...formData,
        relacionId: relacionId,
        agenteId: relacion.agenteId,
        clienteId: relacion.clientePrincipalId
      });
    } else {
      setFormData({
        ...formData,
        relacionId: '',
        agenteId: '',
        clienteId: ''
      });
    }
  };

  const handleOpenModal = (mode: 'create' | 'edit', item?: Interaccion) => {
    setModalMode(mode);
    if (mode === 'edit' && item) {
      setSelectedItem(item);
      const relacion = relaciones.find(r => r.id === item.relacionId);
      setSelectedRelacion(relacion || null);

      setFormData({
        codigoInteraccion: item.codigoInteraccion,
        relacionId: item.relacionId,
        agenteId: item.agenteId,
        clienteId: item.clienteId,
        tipoInteraccion: item.tipoInteraccion,
        fecha: new Date(item.fecha),
        turno: item.turno || 'Mañana',
        duracionMinutos: item.duracionMinutos || 30,
        resultado: item.resultado || 'Exitosa',
        objetivoVisita: item.objetivoVisita || '',
        resumenVisita: item.resumenVisita || '',
        proximaAccion: item.proximaAccion || '',
        fechaProximaAccion: item.fechaProximaAccion ? new Date(item.fechaProximaAccion) : undefined,
        latitud: item.latitud,
        longitud: item.longitud,
        observaciones: item.observaciones || '',
        entidadDinamicaId: item.entidadDinamicaId || ''
      });
    } else {
      setSelectedItem(null);
      setSelectedRelacion(null);
      setFormData({
        codigoInteraccion: '',
        relacionId: '',
        agenteId: '',
        clienteId: '',
        tipoInteraccion: 'VisitaMedica',
        fecha: new Date(),
        turno: 'Mañana',
        duracionMinutos: 30,
        resultado: 'Exitosa',
        objetivoVisita: '',
        resumenVisita: '',
        proximaAccion: '',
        fechaProximaAccion: undefined,
        latitud: undefined,
        longitud: undefined,
        observaciones: '',
        entidadDinamicaId: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedItem(null);
    setSelectedRelacion(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (modalMode === 'create') {
        const createDto: CreateInteraccionDto = {
          ...formData,
          turno: formData.turno || undefined,
          duracionMinutos: formData.duracionMinutos || undefined,
          resultado: formData.resultado || undefined,
          objetivoVisita: formData.objetivoVisita || undefined,
          resumenVisita: formData.resumenVisita || undefined,
          proximaAccion: formData.proximaAccion || undefined,
          observaciones: formData.observaciones || undefined,
          entidadDinamicaId: formData.entidadDinamicaId || undefined
        };
        await interaccionesService.create(createDto);
        addNotification({
          title: 'Interaccion creada',
          message: 'La interaccion se creo correctamente',
          type: 'success',
          category: 'interacciones'
        });
      } else if (selectedItem) {
        const updateDto: UpdateInteraccionDto = {
          tipoInteraccion: formData.tipoInteraccion,
          fecha: formData.fecha,
          turno: formData.turno || undefined,
          duracionMinutos: formData.duracionMinutos || undefined,
          resultado: formData.resultado || undefined,
          objetivoVisita: formData.objetivoVisita || undefined,
          resumenVisita: formData.resumenVisita || undefined,
          proximaAccion: formData.proximaAccion || undefined,
          fechaProximaAccion: formData.fechaProximaAccion,
          latitud: formData.latitud,
          longitud: formData.longitud,
          observaciones: formData.observaciones || undefined,
          entidadDinamicaId: formData.entidadDinamicaId || undefined
        };
        await interaccionesService.update(selectedItem.id, updateDto);
        addNotification({
          title: 'Interaccion actualizada',
          message: 'La interaccion se actualizo correctamente',
          type: 'success',
          category: 'interacciones'
        });
      }
      handleCloseModal();
      loadItems();
    } catch (error: any) {
      addNotification({
        title: 'Error',
        message: error.response?.data?.message || 'No se pudo guardar la interaccion',
        type: 'error',
        category: 'interacciones'
      });
    }
  };

  const handleDelete = async (item: Interaccion) => {
    if (!window.confirm(`Esta seguro de eliminar la interaccion ${item.codigoInteraccion}?`)) {
      return;
    }

    try {
      await interaccionesService.delete(item.id);
      addNotification({
        title: 'Interaccion eliminada',
        message: 'La interaccion se elimino correctamente',
        type: 'success',
        category: 'interacciones'
      });
      loadItems();
    } catch (error: any) {
      addNotification({
        title: 'Error',
        message: 'No se pudo eliminar la interaccion',
        type: 'error',
        category: 'interacciones'
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

  const getTipoInteraccionBadgeClass = (tipo: string) => {
    switch (tipo) {
      case 'VisitaMedica':
        return 'badge badge-primary';
      case 'LlamadaTelefonica':
        return 'badge badge-info';
      case 'EmailCorreo':
        return 'badge badge-secondary';
      case 'Videoconferencia':
        return 'badge badge-success';
      case 'Evento':
        return 'badge badge-warning';
      default:
        return 'badge badge-secondary';
    }
  };

  const getResultadoBadgeClass = (resultado?: string) => {
    if (!resultado) return 'badge badge-secondary';
    switch (resultado) {
      case 'Exitosa':
        return 'badge badge-success';
      case 'Pendiente':
        return 'badge badge-warning';
      case 'NoRealizada':
        return 'badge badge-danger';
      default:
        return 'badge badge-secondary';
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
            <span className="material-icons">event</span>
            Interacciones
          </h1>
          <p className="page-description">
            Registro de visitas, llamadas y eventos con clientes
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal('create')}>
          <span className="material-icons">add</span>
          Nueva Interaccion
        </button>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-grid">
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
            <label>Tipo de Interaccion</label>
            <select
              value={filtroTipoInteraccion}
              onChange={(e) => {
                setFiltroTipoInteraccion(e.target.value);
                setCurrentPage(1);
              }}
              className="form-control"
            >
              <option value="">Todos</option>
              <option value="VisitaMedica">Visita Medica</option>
              <option value="LlamadaTelefonica">Llamada Telefonica</option>
              <option value="EmailCorreo">Email / Correo</option>
              <option value="Videoconferencia">Videoconferencia</option>
              <option value="Evento">Evento</option>
            </select>
          </div>
          <div className="form-group">
            <label>Resultado</label>
            <select
              value={filtroResultado}
              onChange={(e) => {
                setFiltroResultado(e.target.value);
                setCurrentPage(1);
              }}
              className="form-control"
            >
              <option value="">Todos</option>
              <option value="Exitosa">Exitosa</option>
              <option value="Pendiente">Pendiente</option>
              <option value="NoRealizada">No Realizada</option>
            </select>
          </div>
          <div className="form-group">
            <label>Fecha Inicio</label>
            <input
              type="date"
              value={filtroFechaInicio}
              onChange={(e) => {
                setFiltroFechaInicio(e.target.value);
                setCurrentPage(1);
              }}
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label>Fecha Fin</label>
            <input
              type="date"
              value={filtroFechaFin}
              onChange={(e) => {
                setFiltroFechaFin(e.target.value);
                setCurrentPage(1);
              }}
              className="form-control"
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
              <th>Fecha</th>
              <th>Agente</th>
              <th>Cliente</th>
              <th>Tipo</th>
              <th>Turno</th>
              <th>Duracion</th>
              <th>Resultado</th>
              <th>Objetivo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={10} className="no-data">
                  <span className="material-icons">inbox</span>
                  <p>No hay interacciones para mostrar</p>
                </td>
              </tr>
            ) : (
              items.map(item => (
                <tr key={item.id}>
                  <td><strong>{item.codigoInteraccion}</strong></td>
                  <td>{formatDate(item.fecha)}</td>
                  <td>{item.agenteNombre}</td>
                  <td>{item.clienteNombre}</td>
                  <td>
                    <span className={getTipoInteraccionBadgeClass(item.tipoInteraccion)}>
                      {item.tipoInteraccion.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  </td>
                  <td>{item.turno || '-'}</td>
                  <td>{item.duracionMinutos ? `${item.duracionMinutos} min` : '-'}</td>
                  <td>
                    <span className={getResultadoBadgeClass(item.resultado)}>
                      {item.resultado || '-'}
                    </span>
                  </td>
                  <td>{item.objetivoVisita || '-'}</td>
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
                {modalMode === 'create' ? 'Nueva Interaccion' : 'Editar Interaccion'}
              </h2>
              <button className="btn-close" onClick={handleCloseModal}>
                <span className="material-icons">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Codigo de Interaccion *</label>
                    <input
                      type="text"
                      value={formData.codigoInteraccion}
                      onChange={(e) => setFormData({ ...formData, codigoInteraccion: e.target.value })}
                      className="form-control"
                      required
                      disabled={modalMode === 'edit'}
                    />
                  </div>

                  <div className="form-group">
                    <label>Tipo de Interaccion *</label>
                    <select
                      value={formData.tipoInteraccion}
                      onChange={(e) => setFormData({ ...formData, tipoInteraccion: e.target.value })}
                      className="form-control"
                      required
                    >
                      <option value="VisitaMedica">Visita Medica</option>
                      <option value="LlamadaTelefonica">Llamada Telefonica</option>
                      <option value="EmailCorreo">Email / Correo</option>
                      <option value="Videoconferencia">Videoconferencia</option>
                      <option value="Evento">Evento</option>
                    </select>
                  </div>

                  <div className="form-group full-width">
                    <label>Relacion Agente-Cliente *</label>
                    <select
                      value={formData.relacionId}
                      onChange={(e) => handleRelacionChange(e.target.value)}
                      className="form-control"
                      required
                      disabled={modalMode === 'edit'}
                    >
                      <option value="">Seleccione una relacion</option>
                      {relaciones.map(relacion => (
                        <option key={relacion.id} value={relacion.id}>
                          {relacion.codigoRelacion} - {relacion.agenteNombre} / {relacion.clientePrincipalNombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedRelacion && (
                    <div className="form-group full-width">
                      <div className="info-box">
                        <span className="material-icons">info</span>
                        <div className="info-box-content">
                          <div className="info-box-title">Informacion de la Relacion</div>
                          <div className="info-box-text">
                            <strong>Agente:</strong> {selectedRelacion.agenteNombre}<br />
                            <strong>Cliente Principal:</strong> {selectedRelacion.clientePrincipalNombre}
                            {selectedRelacion.clienteSecundario1Nombre && (
                              <><br /><strong>Cliente Secundario 1:</strong> {selectedRelacion.clienteSecundario1Nombre}</>
                            )}
                            {selectedRelacion.clienteSecundario2Nombre && (
                              <><br /><strong>Cliente Secundario 2:</strong> {selectedRelacion.clienteSecundario2Nombre}</>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="form-group">
                    <label>Fecha *</label>
                    <input
                      type="date"
                      value={formData.fecha ? new Date(formData.fecha).toISOString().split('T')[0] : ''}
                      onChange={(e) => setFormData({ ...formData, fecha: new Date(e.target.value) })}
                      className="form-control"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Turno</label>
                    <select
                      value={formData.turno}
                      onChange={(e) => setFormData({ ...formData, turno: e.target.value })}
                      className="form-control"
                    >
                      <option value="Mañana">Mañana</option>
                      <option value="Tarde">Tarde</option>
                      <option value="Noche">Noche</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Duracion (minutos)</label>
                    <input
                      type="number"
                      min="0"
                      step="5"
                      value={formData.duracionMinutos || ''}
                      onChange={(e) => setFormData({ ...formData, duracionMinutos: parseInt(e.target.value) || undefined })}
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label>Resultado</label>
                    <select
                      value={formData.resultado}
                      onChange={(e) => setFormData({ ...formData, resultado: e.target.value })}
                      className="form-control"
                    >
                      <option value="Exitosa">Exitosa</option>
                      <option value="Pendiente">Pendiente</option>
                      <option value="NoRealizada">No Realizada</option>
                    </select>
                  </div>

                  <div className="form-group full-width">
                    <label>Objetivo de la Visita</label>
                    <input
                      type="text"
                      value={formData.objetivoVisita}
                      onChange={(e) => setFormData({ ...formData, objetivoVisita: e.target.value })}
                      className="form-control"
                      maxLength={500}
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>Resumen de la Visita</label>
                    <textarea
                      value={formData.resumenVisita}
                      onChange={(e) => setFormData({ ...formData, resumenVisita: e.target.value })}
                      className="form-control"
                      rows={3}
                      maxLength={2000}
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>Proxima Accion</label>
                    <input
                      type="text"
                      value={formData.proximaAccion}
                      onChange={(e) => setFormData({ ...formData, proximaAccion: e.target.value })}
                      className="form-control"
                      maxLength={500}
                    />
                  </div>

                  <div className="form-group">
                    <label>Fecha Proxima Accion</label>
                    <input
                      type="date"
                      value={formData.fechaProximaAccion ? new Date(formData.fechaProximaAccion).toISOString().split('T')[0] : ''}
                      onChange={(e) => setFormData({ ...formData, fechaProximaAccion: e.target.value ? new Date(e.target.value) : undefined })}
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label>Latitud (Geolocalizacion)</label>
                    <input
                      type="number"
                      step="0.000001"
                      value={formData.latitud || ''}
                      onChange={(e) => setFormData({ ...formData, latitud: e.target.value ? parseFloat(e.target.value) : undefined })}
                      className="form-control"
                      placeholder="-34.603722"
                    />
                  </div>

                  <div className="form-group">
                    <label>Longitud (Geolocalizacion)</label>
                    <input
                      type="number"
                      step="0.000001"
                      value={formData.longitud || ''}
                      onChange={(e) => setFormData({ ...formData, longitud: e.target.value ? parseFloat(e.target.value) : undefined })}
                      className="form-control"
                      placeholder="-58.381592"
                    />
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

export default InteraccionesPage;
