import { useState, useEffect } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { tiempoUtilizadoService } from '../../services/tiempoUtilizado.service';
import type {
  TiempoUtilizado,
  CreateTiempoUtilizadoDto,
  UpdateTiempoUtilizadoDto,
  TiempoUtilizadoEstadisticas
} from '../../services/tiempoUtilizado.service';
import type { Usuario } from '../../services/usuarios.service';
import { usuariosService } from '../../services/usuarios.service';
import { tiposActividadService } from '../../services/tiposActividad.service'; 
import type {TipoActividad } from '../../services/tiposActividad.service';
import './TiempoUtilizadoPage.css';

const TiempoUtilizadoPage = () => {
  const { addNotification } = useNotifications();
  const [items, setItems] = useState<TiempoUtilizado[]>([]);
  const [representantes, setRepresentantes] = useState<Usuario[]>([]);
  const [tiposActividad, setTiposActividad] = useState<TipoActividad[]>([]);
  const [estadisticas, setEstadisticas] = useState<TiempoUtilizadoEstadisticas | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedItem, setSelectedItem] = useState<TiempoUtilizado | null>(null);

  // Filtros
  const [filtroRepresentante, setFiltroRepresentante] = useState('');
  const [filtroTipoActividad, setFiltroTipoActividad] = useState('');
  const [filtroFechaInicio, setFiltroFechaInicio] = useState('');
  const [filtroFechaFin, setFiltroFechaFin] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    representanteId: '',
    fecha: new Date().toISOString().split('T')[0],
    tipoActividadId: '',
    descripcion: '',
    horasUtilizadas: 0,
    minutosUtilizados: 0,
    turno: 'TodoElDia',
    esRecurrente: false,
    observaciones: ''
  });

  useEffect(() => {
    loadData();
    loadTiposActividad();
  }, []);

  useEffect(() => {
    loadItems();
    loadEstadisticas();
  }, [filtroRepresentante, filtroTipoActividad, filtroFechaInicio, filtroFechaFin]);

  const loadData = async () => {
    try {
      setLoading(true);
      const usuariosData = await usuariosService.getAll();
      setRepresentantes(usuariosData);
    } catch (error: any) {
      addNotification({
        title: 'Error',
        message: 'No se pudieron cargar los representantes',
        type: 'error',
        category: 'tiempo-utilizado'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadItems = async () => {
    try {
      const params: any = {};
      if (filtroRepresentante) params.representanteId = filtroRepresentante;
      if (filtroTipoActividad) params.tipoActividad = filtroTipoActividad;
      if (filtroFechaInicio) params.fechaInicio = filtroFechaInicio;
      if (filtroFechaFin) params.fechaFin = filtroFechaFin;

      const data = await tiempoUtilizadoService.getAll(params);
      setItems(data.items);
    } catch (error: any) {
      addNotification({
        title: 'Error',
        message: 'No se pudieron cargar los registros',
        type: 'error',
        category: 'tiempo-utilizado'
      });
    }
  };

  const loadTiposActividad = async () => {
    try {
      const response = await tiposActividadService.getAll({ activo: true });
      setTiposActividad(response.items);
    } catch (error: any) {
      console.error('Error al cargar tipos de actividad:', error);
    }
  };

  const loadEstadisticas = async () => {
    try {
      const params: any = {};
      if (filtroRepresentante) params.representanteId = filtroRepresentante;
      if (filtroFechaInicio) params.fechaInicio = filtroFechaInicio;
      if (filtroFechaFin) params.fechaFin = filtroFechaFin;

      const stats = await tiempoUtilizadoService.getEstadisticas(params);
      setEstadisticas(stats);
    } catch (error: any) {
      console.error('Error al cargar estadísticas:', error);
    }
  };

  const handleOpenModal = (mode: 'create' | 'edit', item?: TiempoUtilizado) => {
    setModalMode(mode);
    if (mode === 'edit' && item) {
      setSelectedItem(item);
      setFormData({
        representanteId: item.representanteId,
        fecha: new Date(item.fecha).toISOString().split('T')[0],
        tipoActividadId: item.tipoActividadId,
        descripcion: item.descripcion || '',
        horasUtilizadas: item.horasUtilizadas,
        minutosUtilizados: item.minutosUtilizados,
        turno: item.turno || 'TodoElDia',
        esRecurrente: item.esRecurrente,
        observaciones: item.observaciones || ''
      });
    } else {
      setSelectedItem(null);
      setFormData({
        representanteId: '',
        fecha: new Date().toISOString().split('T')[0],
        tipoActividadId: '',
        descripcion: '',
        horasUtilizadas: 0,
        minutosUtilizados: 0,
        turno: 'TodoElDia',
        esRecurrente: false,
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
        const createDto: CreateTiempoUtilizadoDto = {
          representanteId: formData.representanteId,
          fecha: new Date(formData.fecha),
          tipoActividadId: formData.tipoActividadId,
          descripcion: formData.descripcion || undefined,
          horasUtilizadas: formData.horasUtilizadas,
          minutosUtilizados: formData.minutosUtilizados,
          turno: formData.turno,
          esRecurrente: formData.esRecurrente,
          observaciones: formData.observaciones || undefined
        };
        await tiempoUtilizadoService.create(createDto);
        addNotification({
          title: 'Registro creado',
          message: 'El registro de tiempo se creó correctamente',
          type: 'success',
          category: 'tiempo-utilizado'
        });
      } else if (selectedItem) {
        const updateDto: UpdateTiempoUtilizadoDto = {
          fecha: new Date(formData.fecha),
          tipoActividadId: formData.tipoActividadId,
          descripcion: formData.descripcion || undefined,
          horasUtilizadas: formData.horasUtilizadas,
          minutosUtilizados: formData.minutosUtilizados,
          turno: formData.turno,
          esRecurrente: formData.esRecurrente,
          observaciones: formData.observaciones || undefined
        };
        await tiempoUtilizadoService.update(selectedItem.id, updateDto);
        addNotification({
          title: 'Registro actualizado',
          message: 'El registro de tiempo se actualizó correctamente',
          type: 'success',
          category: 'tiempo-utilizado'
        });
      }
      handleCloseModal();
      loadItems();
      loadEstadisticas();
    } catch (error: any) {
      addNotification({
        title: 'Error',
        message: error.response?.data?.message || 'No se pudo guardar el registro',
        type: 'error',
        category: 'tiempo-utilizado'
      });
    }
  };

  const handleDelete = async (item: TiempoUtilizado) => {
    if (!window.confirm(`¿Está seguro de eliminar este registro de ${item.tipoActividadNombre}?`)) {
      return;
    }

    try {
      await tiempoUtilizadoService.delete(item.id);
      addNotification({
        title: 'Registro eliminado',
        message: 'El registro se eliminó correctamente',
        type: 'success',
        category: 'tiempo-utilizado'
      });
      loadItems();
      loadEstadisticas();
    } catch (error: any) {
      addNotification({
        title: 'Error',
        message: 'No se pudo eliminar el registro',
        type: 'error',
        category: 'tiempo-utilizado'
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatTiempoTotal = (horas: number, minutos: number) => {
    const totalHoras = horas + (minutos / 60);
    return `${totalHoras.toFixed(2)}h`;
  };

  if (loading) {
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
            <span className="material-icons">schedule</span>
            Tiempo Utilizado
          </h1>
          <p className="page-description">
            Gestión de tiempo dedicado a actividades no relacionadas con promoción médica
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal('create')}>
          <span className="material-icons">add</span>
          Nuevo Registro
        </button>
      </div>

      {/* Estadísticas */}
      {estadisticas && (
        <div className="stats-grid">
          <div className="stat-card">
            <span className="material-icons stat-icon">access_time</span>
            <div className="stat-content">
              <div className="stat-value">{estadisticas.totalHorasNoPromocion.toFixed(2)}h</div>
              <div className="stat-label">Total Horas</div>
            </div>
          </div>
          <div className="stat-card">
            <span className="material-icons stat-icon">trending_up</span>
            <div className="stat-content">
              <div className="stat-value">{estadisticas.promedioHorasDiarias.toFixed(2)}h</div>
              <div className="stat-label">Promedio Diario</div>
            </div>
          </div>
          <div className="stat-card">
            <span className="material-icons stat-icon">receipt_long</span>
            <div className="stat-content">
              <div className="stat-value">{estadisticas.totalRegistros}</div>
              <div className="stat-label">Total Registros</div>
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="filters-section">
        <div className="filters-grid">
          <div className="form-group">
            <label>Representante</label>
            <select
              value={filtroRepresentante}
              onChange={(e) => setFiltroRepresentante(e.target.value)}
              className="form-control"
            >
              <option value="">Todos</option>
              {representantes.map(rep => (
                <option key={rep.id} value={rep.id}>{rep.nombreCompleto}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Tipo de Actividad</label>
            <select
              value={filtroTipoActividad}
              onChange={(e) => setFiltroTipoActividad(e.target.value)}
              className="form-control"
            >
              <option value="">Todas</option>
              {tiposActividad.map(tipo => (
                <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Fecha Inicio</label>
            <input
              type="date"
              value={filtroFechaInicio}
              onChange={(e) => setFiltroFechaInicio(e.target.value)}
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label>Fecha Fin</label>
            <input
              type="date"
              value={filtroFechaFin}
              onChange={(e) => setFiltroFechaFin(e.target.value)}
              className="form-control"
            />
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Representante</th>
              <th>Tipo de Actividad</th>
              <th>Turno</th>
              <th>Descripción</th>
              <th>Tiempo</th>
              <th>Recurrente</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={8} className="no-data">
                  <span className="material-icons">inbox</span>
                  <p>No hay registros para mostrar</p>
                </td>
              </tr>
            ) : (
              items.map(item => (
                <tr key={item.id}>
                  <td>{formatDate(item.fecha)}</td>
                  <td>{item.representanteNombre}</td>
                  <td>
                    <span className="badge badge-info">{item.tipoActividadNombre}</span>
                  </td>
                  <td>
                    <span className="badge badge-primary">
                      {item.turno === 'Mañana' ? '☀️ Mañana' : item.turno === 'Tarde' ? '🌙 Tarde' : '📅 Todo el Día'}
                    </span>
                  </td>
                  <td>{item.descripcion || '-'}</td>
                  <td>
                    <strong>{formatTiempoTotal(item.horasUtilizadas, item.minutosUtilizados)}</strong>
                  </td>
                  <td>
                    {item.esRecurrente ? (
                      <span className="badge badge-success">
                        <span className="material-icons">check</span> Sí
                      </span>
                    ) : (
                      <span className="badge badge-secondary">No</span>
                    )}
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

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {modalMode === 'create' ? 'Nuevo Registro' : 'Editar Registro'}
              </h2>
              <button className="btn-close" onClick={handleCloseModal}>
                <span className="material-icons">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>Representante *</label>
                    <select
                      value={formData.representanteId}
                      onChange={(e) => setFormData({ ...formData, representanteId: e.target.value })}
                      className="form-control"
                      required
                      disabled={modalMode === 'edit'}
                    >
                      <option value="">Seleccione un representante</option>
                      {representantes.map(rep => (
                        <option key={rep.id} value={rep.id}>{rep.nombreCompleto}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Fecha *</label>
                    <input
                      type="date"
                      value={formData.fecha}
                      onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                      className="form-control"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Tipo de Actividad *</label>
                    <select
                      value={formData.tipoActividadId}
                      onChange={(e) => setFormData({ ...formData, tipoActividadId: e.target.value })}
                      className="form-control"
                      required
                    >
                      <option value="">Seleccione un tipo</option>
                      {tiposActividad.map(tipo => (
                        <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Horas *</label>
                    <input
                      type="number"
                      min="0"
                      max="24"
                      step="0.5"
                      value={formData.horasUtilizadas}
                      onChange={(e) => setFormData({ ...formData, horasUtilizadas: parseFloat(e.target.value) || 0 })}
                      className="form-control"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Minutos</label>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      step="1"
                      value={formData.minutosUtilizados}
                      onChange={(e) => setFormData({ ...formData, minutosUtilizados: parseInt(e.target.value) || 0 })}
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label>Turno *</label>
                    <select
                      value={formData.turno}
                      onChange={(e) => setFormData({ ...formData, turno: e.target.value })}
                      className="form-control"
                      required
                    >
                      <option value="Mañana">Mañana</option>
                      <option value="Tarde">Tarde</option>
                      <option value="TodoElDia">Todo el Día</option>
                    </select>
                  </div>

                  <div className="form-group full-width">
                    <label>Descripción</label>
                    <input
                      type="text"
                      value={formData.descripcion}
                      onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                      className="form-control"
                      maxLength={500}
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

                  <div className="form-group full-width">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.esRecurrente}
                        onChange={(e) => setFormData({ ...formData, esRecurrente: e.target.checked })}
                      />
                      <span>Es una actividad recurrente</span>
                    </label>
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

export default TiempoUtilizadoPage;
