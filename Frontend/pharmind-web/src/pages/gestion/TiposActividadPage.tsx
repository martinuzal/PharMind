import React, { useState, useEffect } from 'react';
import { tiposActividadService } from '../../services/tiposActividad.service';
import type { TipoActividad,
  CreateTipoActividadDto,
  UpdateTipoActividadDto} from '../../services/tiposActividad.service';
import { usePage } from '../../contexts/PageContext';
import './TiposActividadPage.css';

const TiposActividadPage: React.FC = () => {
  const { setToolbarContent, setToolbarRightContent, clearToolbarContent } = usePage();
  const [tiposActividad, setTiposActividad] = useState<TipoActividad[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingTipo, setEditingTipo] = useState<TipoActividad | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [clasificacionFilter, setClasificacionFilter] = useState<string>('');
  const [activoFilter, setActivoFilter] = useState<string>('');
  const [searchFilter, setSearchFilter] = useState<string>('');

  // Form state
  const [formData, setFormData] = useState<CreateTipoActividadDto | UpdateTipoActividadDto>({
    codigo: '',
    nombre: '',
    descripcion: '',
    clasificacion: 'Laboral',
    color: '#1976d2',
    icono: 'work',
    orden: 0
  });

  useEffect(() => {
    loadTiposActividad();
  }, [clasificacionFilter, activoFilter, searchFilter]);

  // Configurar toolbar
  useEffect(() => {
    // Izquierda: Icono + Título
    const toolbarLeft = (
      <>
        <div className="entity-icon" style={{
          backgroundColor: '#4db8b8',
          padding: '0.375rem',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: '0.75rem',
          width: '32px',
          height: '32px'
        }}>
          <span className="material-icons" style={{ color: 'white', fontSize: '1.125rem' }}>category</span>
        </div>
        <span style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>Tipos de Actividad</span>
      </>
    );

    // Derecha: Botón de agregar
    const toolbarRight = (
      <button
        className="toolbar-icon-btn"
        onClick={() => handleOpenModal()}
        title="Nuevo Tipo"
        style={{
          backgroundColor: '#4db8b8',
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
    setToolbarRightContent(toolbarRight);

    return () => {
      clearToolbarContent();
    };
  }, []);

  const loadTiposActividad = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = {};

      if (clasificacionFilter) params.clasificacion = clasificacionFilter;
      if (activoFilter !== '') params.activo = activoFilter === 'true';
      if (searchFilter) params.search = searchFilter;

      const response = await tiposActividadService.getAll(params);
      setTiposActividad(response.items);
    } catch (err: any) {
      console.error('Error al cargar tipos de actividad:', err);
      setError(err.response?.data?.message || 'Error al cargar tipos de actividad');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (tipo?: TipoActividad) => {
    if (tipo) {
      // Editar tipo existente
      setEditingTipo(tipo);
      setFormData({
        codigo: tipo.codigo,
        nombre: tipo.nombre,
        descripcion: tipo.descripcion || '',
        clasificacion: tipo.clasificacion,
        color: tipo.color || '#1976d2',
        icono: tipo.icono || 'work',
        activo: tipo.activo,
        orden: tipo.orden || 0
      });
    } else {
      // Nuevo tipo
      setEditingTipo(null);
      setFormData({
        codigo: '',
        nombre: '',
        descripcion: '',
        clasificacion: 'Laboral',
        color: '#1976d2',
        icono: 'work',
        orden: 0
      });
    }
    setShowModal(true);
    setError(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTipo(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      if (editingTipo) {
        await tiposActividadService.update(editingTipo.id, formData as UpdateTipoActividadDto);
      } else {
        await tiposActividadService.create(formData as CreateTipoActividadDto);
      }

      handleCloseModal();
      loadTiposActividad();
    } catch (err: any) {
      console.error('Error al guardar tipo de actividad:', err);
      setError(err.response?.data?.message || 'Error al guardar tipo de actividad');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (tipo: TipoActividad) => {
    if (tipo.esSistema) {
      setError('No se pueden eliminar tipos de actividad del sistema');
      return;
    }

    if (tipo.cantidadUsos > 0) {
      setError('No se puede eliminar un tipo de actividad que está siendo utilizado');
      return;
    }

    if (!window.confirm(`¿Está seguro de eliminar el tipo de actividad "${tipo.nombre}"?`)) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await tiposActividadService.delete(tipo.id);
      loadTiposActividad();
    } catch (err: any) {
      console.error('Error al eliminar tipo de actividad:', err);
      setError(err.response?.data?.message || 'Error al eliminar tipo de actividad');
    } finally {
      setLoading(false);
    }
  };

  const getClasificacionBadge = (clasificacion: string) => {
    return clasificacion === 'Laboral'
      ? <span className="badge badge-laboral">Laboral</span>
      : <span className="badge badge-extralaboral">Extra-Laboral</span>;
  };

  const getActivoBadge = (activo: boolean) => {
    return activo
      ? <span className="badge badge-activo">Activo</span>
      : <span className="badge badge-inactivo">Inactivo</span>;
  };

  return (
    <div className="tipos-actividad-page">
      {error && (
        <div className="alert alert-error">
          <span className="material-icons">error</span>
          {error}
        </div>
      )}

      {/* Filtros */}
      <div className="filters-card">
        <div className="filters-grid">
          <div className="filter-field">
            <label>Buscar</label>
            <input
              type="text"
              placeholder="Código o nombre..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
            />
          </div>

          <div className="filter-field">
            <label>Clasificación</label>
            <select
              value={clasificacionFilter}
              onChange={(e) => setClasificacionFilter(e.target.value)}
            >
              <option value="">Todas</option>
              <option value="Laboral">Laboral</option>
              <option value="ExtraLaboral">Extra-Laboral</option>
            </select>
          </div>

          <div className="filter-field">
            <label>Estado</label>
            <select
              value={activoFilter}
              onChange={(e) => setActivoFilter(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="true">Activos</option>
              <option value="false">Inactivos</option>
            </select>
          </div>

          <div className="filter-actions">
            <button
              className="btn btn-secondary"
              onClick={() => {
                setClasificacionFilter('');
                setActivoFilter('');
                setSearchFilter('');
              }}
            >
              <span className="material-icons">clear</span>
              Limpiar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="table-card">
        {loading && <div className="loading">Cargando...</div>}

        {!loading && tiposActividad.length === 0 && (
          <div className="empty-state">
            <span className="material-icons">inbox</span>
            <p>No se encontraron tipos de actividad</p>
          </div>
        )}

        {!loading && tiposActividad.length > 0 && (
          <table className="data-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Clasificación</th>
                <th>Estado</th>
                <th>Sistema</th>
                <th>Usos</th>
                <th>Orden</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tiposActividad.map((tipo) => (
                <tr key={tipo.id}>
                  <td>
                    <div className="tipo-codigo" style={{ borderLeftColor: tipo.color }}>
                      {tipo.codigo}
                    </div>
                  </td>
                  <td>
                    <div className="tipo-nombre">
                      {tipo.icono && <span className="material-icons tipo-icono">{tipo.icono}</span>}
                      <div>
                        <div className="nombre">{tipo.nombre}</div>
                        {tipo.descripcion && <div className="descripcion">{tipo.descripcion}</div>}
                      </div>
                    </div>
                  </td>
                  <td>{getClasificacionBadge(tipo.clasificacion)}</td>
                  <td>{getActivoBadge(tipo.activo)}</td>
                  <td>
                    {tipo.esSistema && <span className="badge badge-sistema">Sistema</span>}
                  </td>
                  <td>{tipo.cantidadUsos}</td>
                  <td>{tipo.orden || '-'}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="btn-icon"
                        onClick={() => handleOpenModal(tipo)}
                        disabled={tipo.esSistema}
                        title={tipo.esSistema ? 'No se puede editar tipos del sistema' : 'Editar'}
                      >
                        <span className="material-icons">edit</span>
                      </button>
                      <button
                        className="btn-icon btn-danger"
                        onClick={() => handleDelete(tipo)}
                        disabled={tipo.esSistema || tipo.cantidadUsos > 0}
                        title={
                          tipo.esSistema
                            ? 'No se puede eliminar tipos del sistema'
                            : tipo.cantidadUsos > 0
                            ? 'No se puede eliminar tipos en uso'
                            : 'Eliminar'
                        }
                      >
                        <span className="material-icons">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingTipo ? 'Editar Tipo de Actividad' : 'Nuevo Tipo de Actividad'}</h2>
              <button className="btn-close" onClick={handleCloseModal}>
                <span className="material-icons">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-field">
                    <label>Código *</label>
                    <input
                      type="text"
                      required
                      maxLength={50}
                      value={formData.codigo}
                      onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                    />
                  </div>

                  <div className="form-field">
                    <label>Nombre *</label>
                    <input
                      type="text"
                      required
                      maxLength={200}
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label>Descripción</label>
                  <textarea
                    maxLength={500}
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="form-row">
                  <div className="form-field">
                    <label>Clasificación *</label>
                    <select
                      required
                      value={formData.clasificacion}
                      onChange={(e) => setFormData({ ...formData, clasificacion: e.target.value })}
                    >
                      <option value="Laboral">Laboral</option>
                      <option value="ExtraLaboral">Extra-Laboral</option>
                    </select>
                  </div>

                  <div className="form-field">
                    <label>Color</label>
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-field">
                    <label>Icono (Material Icons)</label>
                    <input
                      type="text"
                      maxLength={50}
                      value={formData.icono}
                      onChange={(e) => setFormData({ ...formData, icono: e.target.value })}
                      placeholder="work, schedule, event..."
                    />
                  </div>

                  <div className="form-field">
                    <label>Orden</label>
                    <input
                      type="number"
                      min={0}
                      value={formData.orden}
                      onChange={(e) => setFormData({ ...formData, orden: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                {editingTipo && 'activo' in formData && (
                  <div className="form-field">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={(formData as UpdateTipoActividadDto).activo}
                        onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                      />
                      <span>Activo</span>
                    </label>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TiposActividadPage;
