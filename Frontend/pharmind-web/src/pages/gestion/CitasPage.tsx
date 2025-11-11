import { useState, useEffect } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { usePage } from '../../contexts/PageContext';
import { useAuth } from '../../contexts/AuthContext';
import citasService from '../../services/citas.service';
import { agentesService, type Agente } from '../../services/agentes.service';
import type { Cita, CreateCitaDto, UpdateCitaDto, EstadosCita, TiposCita, Prioridades, ColoresCita } from '../../types/citas';
import '../crm/CRMPages.css';

type VistaCalendario = 'mes' | 'semana' | 'dia' | 'lista';

const CitasPage = () => {
  const { addNotification } = useNotifications();
  const { setToolbarContent, setToolbarCenterContent, setToolbarRightContent, clearToolbarContent } = usePage();
  const { user } = useAuth();

  // Data state
  const [citas, setCitas] = useState<Cita[]>([]);
  const [citasFiltradas, setCitasFiltradas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  const [agentes, setAgentes] = useState<Agente[]>([]);
  const [selectedAgenteId, setSelectedAgenteId] = useState<string>('');

  // View state
  const [vistaActual, setVistaActual] = useState<VistaCalendario>('lista');
  const [fechaActual, setFechaActual] = useState(new Date());

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string>('');
  const [filtroTipo, setFiltroTipo] = useState<string>('');
  const [filtroPrioridad, setFiltroPrioridad] = useState<string>('');

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCita, setSelectedCita] = useState<Cita | null>(null);

  // Form state
  const [formData, setFormData] = useState<CreateCitaDto>({
    agenteId: '',
    titulo: '',
    descripcion: '',
    fechaInicio: new Date(),
    fechaFin: new Date(),
    todoElDia: false,
    tipoCita: 'Visita',
    estado: 'Programada',
    prioridad: 'Media',
    color: '#3B82F6',
    recordatorio: true,
    minutosAntes: 30
  });

  useEffect(() => {
    if (user?.agenteId) {
      setSelectedAgenteId(user.agenteId);
      loadCitas(user.agenteId);
    } else {
      loadAgentes();
    }
  }, [user]);

  useEffect(() => {
    if (selectedAgenteId) {
      loadCitas(selectedAgenteId);
    }
  }, [selectedAgenteId, fechaActual, vistaActual]);

  useEffect(() => {
    aplicarFiltros();
  }, [citas, searchTerm, filtroEstado, filtroTipo, filtroPrioridad]);

  const loadAgentes = async () => {
    try {
      const response = await agentesService.getAll({ pageSize: 1000 });
      setAgentes(response.items.filter(a => a.activo));

      if (response.items.length > 0) {
        setSelectedAgenteId(response.items[0].id);
      }
    } catch (error) {
      addNotification({
        title: 'Error',
        message: 'No se pudieron cargar los agentes',
        type: 'error',
        category: 'citas'
      });
    }
  };

  const loadCitas = async (agenteId?: string) => {
    const targetAgenteId = agenteId || selectedAgenteId;

    if (!targetAgenteId) {
      setCitas([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      let data: Cita[];

      if (vistaActual === 'mes') {
        data = await citasService.getCitasMes(
          targetAgenteId,
          fechaActual.getFullYear(),
          fechaActual.getMonth()
        );
      } else if (vistaActual === 'dia') {
        data = await citasService.getCitasDelDia(targetAgenteId, fechaActual);
      } else {
        // Para lista y semana, cargamos el mes completo
        data = await citasService.getCitasMes(
          targetAgenteId,
          fechaActual.getFullYear(),
          fechaActual.getMonth()
        );
      }

      setCitas(data);
    } catch (error: any) {
      addNotification({
        title: 'Error',
        message: 'No se pudieron cargar las citas',
        type: 'error',
        category: 'citas'
      });
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = () => {
    let filtered = [...citas];

    if (searchTerm) {
      filtered = filtered.filter(c =>
        c.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.clienteNombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.ubicacion?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filtroEstado) {
      filtered = filtered.filter(c => c.estado === filtroEstado);
    }

    if (filtroTipo) {
      filtered = filtered.filter(c => c.tipoCita === filtroTipo);
    }

    if (filtroPrioridad) {
      filtered = filtered.filter(c => c.prioridad === filtroPrioridad);
    }

    setCitasFiltradas(filtered);
  };

  // Configurar toolbar
  useEffect(() => {
    const toolbarLeft = (
      <>
        <div className="entity-icon" style={{
          backgroundColor: '#8B5CF6',
          padding: '0.375rem',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: '0.75rem',
          width: '32px',
          height: '32px'
        }}>
          <span className="material-icons" style={{ color: 'white', fontSize: '1.125rem' }}>event</span>
        </div>
        <span style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          {user?.agenteId ? 'Mi Calendario' : 'Calendario de Agentes'}
        </span>
      </>
    );

    const toolbarCenter = (
      <div className="search-box">
        <span className="material-icons search-icon">search</span>
        <input
          type="text"
          placeholder="Buscar citas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>
    );

    const toolbarRight = (
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          className="toolbar-icon-btn"
          onClick={handleOpenCreateModal}
          title="Nueva Cita"
          style={{
            backgroundColor: '#8B5CF6',
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
        <button
          className="toolbar-icon-btn"
          onClick={() => loadCitas()}
          title="Recargar"
          style={{
            backgroundColor: '#8B5CF6',
            color: 'white',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <span className="material-icons">refresh</span>
        </button>
      </div>
    );

    setToolbarContent(toolbarLeft);
    setToolbarCenterContent(toolbarCenter);
    setToolbarRightContent(toolbarRight);

    return () => {
      clearToolbarContent();
    };
  }, [searchTerm, user, agentes, selectedAgenteId]);

  const handleOpenCreateModal = () => {
    if (!selectedAgenteId) return;

    setFormData({
      agenteId: selectedAgenteId,
      titulo: '',
      descripcion: '',
      fechaInicio: new Date(),
      fechaFin: new Date(Date.now() + 60 * 60 * 1000), // 1 hora después
      todoElDia: false,
      tipoCita: 'Visita',
      estado: 'Programada',
      prioridad: 'Media',
      color: '#3B82F6',
      recordatorio: true,
      minutosAntes: 30
    });

    setShowCreateModal(true);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await citasService.create(formData);
      addNotification({
        title: 'Éxito',
        message: 'Cita creada correctamente',
        type: 'success',
        category: 'citas'
      });
      handleCloseCreateModal();
      loadCitas();
    } catch (error: any) {
      addNotification({
        title: 'Error',
        message: error.response?.data?.error || 'Error al crear la cita',
        type: 'error',
        category: 'citas'
      });
    }
  };

  const handleViewDetail = (cita: Cita) => {
    setSelectedCita(cita);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedCita(null);
  };

  const handleCambiarEstado = async (citaId: string, nuevoEstado: string) => {
    try {
      await citasService.cambiarEstado(citaId, { estado: nuevoEstado });
      addNotification({
        title: 'Éxito',
        message: 'Estado de la cita actualizado',
        type: 'success',
        category: 'citas'
      });
      loadCitas();
    } catch (error: any) {
      addNotification({
        title: 'Error',
        message: error.response?.data?.error || 'Error al cambiar el estado',
        type: 'error',
        category: 'citas'
      });
    }
  };

  const handleDelete = async (citaId: string) => {
    if (!confirm('¿Está seguro de eliminar esta cita?')) return;

    try {
      await citasService.delete(citaId);
      addNotification({
        title: 'Éxito',
        message: 'Cita eliminada correctamente',
        type: 'success',
        category: 'citas'
      });
      loadCitas();
    } catch (error: any) {
      addNotification({
        title: 'Error',
        message: error.response?.data?.error || 'Error al eliminar la cita',
        type: 'error',
        category: 'citas'
      });
    }
  };

  const getEstadoColor = (estado: string): string => {
    switch (estado) {
      case 'Completada':
        return '#10B981';
      case 'Cancelada':
        return '#EF4444';
      case 'Reprogramada':
        return '#F59E0B';
      case 'NoRealizada':
        return '#6B7280';
      default:
        return '#3B82F6';
    }
  };

  const getPrioridadColor = (prioridad?: string): string => {
    switch (prioridad) {
      case 'Alta':
        return '#EF4444';
      case 'Baja':
        return '#10B981';
      default:
        return '#F59E0B';
    }
  };

  const formatearFechaHora = (fecha: Date): string => {
    const d = new Date(fecha);
    return d.toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatearHora = (fecha: Date): string => {
    const d = new Date(fecha);
    return d.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const cambiarMes = (direccion: number) => {
    const nuevaFecha = new Date(fechaActual);
    nuevaFecha.setMonth(nuevaFecha.getMonth() + direccion);
    setFechaActual(nuevaFecha);
  };

  const irAHoy = () => {
    setFechaActual(new Date());
  };

  if (loading) {
    return <div className="page-container">Cargando...</div>;
  }

  return (
    <div className="page-container">
      {/* Selector de Agente - Solo para usuarios que NO son agentes */}
      {!user?.agenteId && agentes.length > 0 && (
        <div style={{
          marginBottom: '1rem',
          padding: '1rem',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '8px',
          border: '1px solid var(--border-color)'
        }}>
          <label style={{
            display: 'block',
            fontWeight: 600,
            marginBottom: '0.5rem',
            color: 'var(--text-primary)'
          }}>
            Seleccionar Agente:
          </label>
          <select
            className="form-control"
            value={selectedAgenteId}
            onChange={(e) => setSelectedAgenteId(e.target.value)}
            style={{ maxWidth: '400px' }}
          >
            {agentes.map(agente => (
              <option key={agente.id} value={agente.id}>
                {agente.nombre} {agente.apellido || ''} - {agente.codigoAgente}
                {agente.regionNombre && ` (${agente.regionNombre})`}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Controles de navegación y filtros */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
        gap: '1rem',
        flexWrap: 'wrap'
      }}>
        {/* Navegación de fecha */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            onClick={() => cambiarMes(-1)}
            style={{
              padding: '0.5rem',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              backgroundColor: 'var(--bg-secondary)',
              cursor: 'pointer'
            }}
          >
            <span className="material-icons" style={{ fontSize: '1.25rem' }}>chevron_left</span>
          </button>

          <button
            onClick={irAHoy}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              backgroundColor: 'var(--bg-secondary)',
              cursor: 'pointer',
              fontWeight: 500
            }}
          >
            Hoy
          </button>

          <span style={{ fontWeight: 600, fontSize: '1.125rem', minWidth: '200px', textAlign: 'center' }}>
            {fechaActual.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
          </span>

          <button
            onClick={() => cambiarMes(1)}
            style={{
              padding: '0.5rem',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              backgroundColor: 'var(--bg-secondary)',
              cursor: 'pointer'
            }}
          >
            <span className="material-icons" style={{ fontSize: '1.25rem' }}>chevron_right</span>
          </button>
        </div>

        {/* Filtros */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <select
            className="form-control"
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            style={{ width: 'auto', minWidth: '140px' }}
          >
            <option value="">Todos los estados</option>
            <option value="Programada">Programada</option>
            <option value="Completada">Completada</option>
            <option value="Cancelada">Cancelada</option>
            <option value="Reprogramada">Reprogramada</option>
          </select>

          <select
            className="form-control"
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            style={{ width: 'auto', minWidth: '120px' }}
          >
            <option value="">Todos los tipos</option>
            <option value="Visita">Visita</option>
            <option value="Llamada">Llamada</option>
            <option value="Evento">Evento</option>
            <option value="Reunión">Reunión</option>
          </select>

          <select
            className="form-control"
            value={filtroPrioridad}
            onChange={(e) => setFiltroPrioridad(e.target.value)}
            style={{ width: 'auto', minWidth: '120px' }}
          >
            <option value="">Todas</option>
            <option value="Alta">Alta</option>
            <option value="Media">Media</option>
            <option value="Baja">Baja</option>
          </select>
        </div>
      </div>

      {/* Vista de lista de citas */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '30px' }}></th>
              <th>Título</th>
              <th>Cliente</th>
              <th>Fecha y Hora</th>
              <th>Tipo</th>
              <th style={{ textAlign: 'center' }}>Prioridad</th>
              <th style={{ textAlign: 'center' }}>Estado</th>
              <th style={{ textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {citasFiltradas.map(cita => (
              <tr key={cita.id}>
                <td>
                  <div style={{
                    width: '4px',
                    height: '40px',
                    backgroundColor: cita.color || '#3B82F6',
                    borderRadius: '2px'
                  }} />
                </td>
                <td>
                  <div style={{ fontWeight: 500 }}>{cita.titulo}</div>
                  {cita.descripcion && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {cita.descripcion.length > 60
                        ? cita.descripcion.substring(0, 60) + '...'
                        : cita.descripcion}
                    </div>
                  )}
                </td>
                <td>
                  {cita.clienteNombre || '-'}
                  {cita.ubicacion && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      <span className="material-icons" style={{ fontSize: '0.75rem', verticalAlign: 'middle' }}>
                        location_on
                      </span>
                      {cita.ubicacion}
                    </div>
                  )}
                </td>
                <td>
                  <div>{new Date(cita.fechaInicio).toLocaleDateString('es-AR')}</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {formatearHora(cita.fechaInicio)} - {formatearHora(cita.fechaFin)}
                  </div>
                </td>
                <td>
                  <span className="badge-info">{cita.tipoCita || 'Visita'}</span>
                </td>
                <td style={{ textAlign: 'center' }}>
                  {cita.prioridad && (
                    <span
                      className="badge-info"
                      style={{
                        backgroundColor: `${getPrioridadColor(cita.prioridad)}20`,
                        color: getPrioridadColor(cita.prioridad),
                        borderColor: getPrioridadColor(cita.prioridad)
                      }}
                    >
                      {cita.prioridad}
                    </span>
                  )}
                </td>
                <td style={{ textAlign: 'center' }}>
                  <span
                    className="badge-info"
                    style={{
                      backgroundColor: `${getEstadoColor(cita.estado)}20`,
                      color: getEstadoColor(cita.estado),
                      borderColor: getEstadoColor(cita.estado)
                    }}
                  >
                    {cita.estado}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn-icon-view"
                      onClick={() => handleViewDetail(cita)}
                      title="Ver detalles"
                    >
                      <span className="material-icons">visibility</span>
                    </button>
                    {cita.estado === 'Programada' && (
                      <button
                        className="btn-icon-edit"
                        onClick={() => handleCambiarEstado(cita.id, 'Completada')}
                        title="Marcar como completada"
                        style={{ backgroundColor: '#D1FAE5', color: '#065F46' }}
                      >
                        <span className="material-icons">check</span>
                      </button>
                    )}
                    <button
                      className="btn-icon-delete"
                      onClick={() => handleDelete(cita.id)}
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

        {citasFiltradas.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
            No se encontraron citas para este período
          </div>
        )}
      </div>

      {/* Modal Crear Cita */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={handleCloseCreateModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2>Nueva Cita</h2>
              <button className="modal-close" onClick={handleCloseCreateModal}>
                <span className="material-icons">close</span>
              </button>
            </div>
            <form onSubmit={handleCreateSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Título *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    required
                    maxLength={200}
                  />
                </div>

                <div className="form-group">
                  <label>Descripción</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    maxLength={1000}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Fecha Inicio *</label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      value={formData.fechaInicio instanceof Date
                        ? formData.fechaInicio.toISOString().slice(0, 16)
                        : new Date().toISOString().slice(0, 16)}
                      onChange={(e) => setFormData({ ...formData, fechaInicio: new Date(e.target.value) })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Fecha Fin *</label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      value={formData.fechaFin instanceof Date
                        ? formData.fechaFin.toISOString().slice(0, 16)
                        : new Date().toISOString().slice(0, 16)}
                      onChange={(e) => setFormData({ ...formData, fechaFin: new Date(e.target.value) })}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Tipo</label>
                    <select
                      className="form-control"
                      value={formData.tipoCita}
                      onChange={(e) => setFormData({ ...formData, tipoCita: e.target.value })}
                    >
                      <option value="Visita">Visita</option>
                      <option value="Llamada">Llamada</option>
                      <option value="Evento">Evento</option>
                      <option value="Reunión">Reunión</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Prioridad</label>
                    <select
                      className="form-control"
                      value={formData.prioridad}
                      onChange={(e) => setFormData({ ...formData, prioridad: e.target.value })}
                    >
                      <option value="Alta">Alta</option>
                      <option value="Media">Media</option>
                      <option value="Baja">Baja</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Ubicación</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.ubicacion}
                    onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                    maxLength={500}
                  />
                </div>

                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.recordatorio}
                      onChange={(e) => setFormData({ ...formData, recordatorio: e.target.checked })}
                      style={{ marginRight: '0.5rem' }}
                    />
                    Activar recordatorio
                  </label>
                  {formData.recordatorio && (
                    <input
                      type="number"
                      className="form-control"
                      value={formData.minutosAntes}
                      onChange={(e) => setFormData({ ...formData, minutosAntes: parseInt(e.target.value) || 0 })}
                      min={0}
                      max={1440}
                      style={{ marginTop: '0.5rem' }}
                      placeholder="Minutos antes"
                    />
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={handleCloseCreateModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Crear Cita
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detalle */}
      {showDetailModal && selectedCita && (
        <div className="modal-overlay" onClick={handleCloseDetailModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
            <div className="modal-header">
              <h2>Detalle de la Cita</h2>
              <button className="modal-close" onClick={handleCloseDetailModal}>
                <span className="material-icons">close</span>
              </button>
            </div>
            <div className="modal-body">
              <div style={{
                borderLeft: `4px solid ${selectedCita.color || '#3B82F6'}`,
                paddingLeft: '1rem',
                marginBottom: '1.5rem'
              }}>
                <h3 style={{ margin: '0 0 0.5rem 0' }}>{selectedCita.titulo}</h3>
                {selectedCita.descripcion && (
                  <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                    {selectedCita.descripcion}
                  </p>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '0.75rem', fontSize: '0.9rem' }}>
                <div style={{ fontWeight: 600 }}>Cliente:</div>
                <div>{selectedCita.clienteNombre || 'No especificado'}</div>

                <div style={{ fontWeight: 600 }}>Fecha y Hora:</div>
                <div>
                  {formatearFechaHora(selectedCita.fechaInicio)} - {formatearHora(selectedCita.fechaFin)}
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Duración: {selectedCita.duracionMinutos} minutos
                  </div>
                </div>

                <div style={{ fontWeight: 600 }}>Tipo:</div>
                <div><span className="badge-info">{selectedCita.tipoCita || 'Visita'}</span></div>

                <div style={{ fontWeight: 600 }}>Prioridad:</div>
                <div>
                  <span
                    className="badge-info"
                    style={{
                      backgroundColor: `${getPrioridadColor(selectedCita.prioridad)}20`,
                      color: getPrioridadColor(selectedCita.prioridad),
                      borderColor: getPrioridadColor(selectedCita.prioridad)
                    }}
                  >
                    {selectedCita.prioridad || 'Media'}
                  </span>
                </div>

                <div style={{ fontWeight: 600 }}>Estado:</div>
                <div>
                  <span
                    className="badge-info"
                    style={{
                      backgroundColor: `${getEstadoColor(selectedCita.estado)}20`,
                      color: getEstadoColor(selectedCita.estado),
                      borderColor: getEstadoColor(selectedCita.estado)
                    }}
                  >
                    {selectedCita.estado}
                  </span>
                </div>

                {selectedCita.ubicacion && (
                  <>
                    <div style={{ fontWeight: 600 }}>Ubicación:</div>
                    <div>
                      <span className="material-icons" style={{ fontSize: '1rem', verticalAlign: 'middle', marginRight: '0.25rem' }}>
                        location_on
                      </span>
                      {selectedCita.ubicacion}
                    </div>
                  </>
                )}

                {selectedCita.notas && (
                  <>
                    <div style={{ fontWeight: 600 }}>Notas:</div>
                    <div style={{
                      padding: '0.75rem',
                      backgroundColor: 'var(--bg-primary)',
                      borderRadius: '6px',
                      fontSize: '0.875rem'
                    }}>
                      {selectedCita.notas}
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={handleCloseDetailModal}>
                Cerrar
              </button>
              {selectedCita.estado === 'Programada' && (
                <button
                  className="btn-primary"
                  onClick={() => {
                    handleCambiarEstado(selectedCita.id, 'Completada');
                    handleCloseDetailModal();
                  }}
                  style={{ backgroundColor: '#10B981' }}
                >
                  Marcar Completada
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CitasPage;
