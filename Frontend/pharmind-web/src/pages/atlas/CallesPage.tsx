import React, { useState, useEffect } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { usePage } from '../../contexts/PageContext';
import './AtlasPages.css';

interface Localidad {
  id: number;
  nombre: string;
  provinciaNombre: string;
}

interface Calle {
  id: number;
  localidadId: number;
  localidadNombre: string;
  nombre: string;
  tipo: string;
  activo: boolean;
}

interface CreateCalleDto {
  localidadId: number;
  nombre: string;
  tipo: string;
  activo: boolean;
}

const tiposCalle = [
  'Calle',
  'Avenida',
  'Boulevard',
  'Pasaje',
  'Diagonal',
  'Camino',
  'Ruta',
  'Autopista',
  'Plaza',
  'Parque'
];

const CallesPage: React.FC = () => {
  const { addNotification } = useNotifications();
  const { setToolbarContent, clearToolbarContent } = usePage();

  const [loading, setLoading] = useState(true);
  const [calles, setCalles] = useState<Calle[]>([]);
  const [localidades, setLocalidades] = useState<Localidad[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCalle, setEditingCalle] = useState<Calle | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLocalidad, setFilterLocalidad] = useState<number | ''>('');
  const [filterTipo, setFilterTipo] = useState<string>('');

  const [formData, setFormData] = useState<CreateCalleDto>({
    localidadId: 1,
    nombre: '',
    tipo: 'Calle',
    activo: true
  });

  useEffect(() => {
    const toolbarLeft = (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{
          backgroundColor: '#4db8b8',
          padding: '0.5rem',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <span className="material-icons" style={{ color: 'white', fontSize: '1.5rem' }}>signpost</span>
        </div>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>Calles</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>Gestión de calles y vías</p>
        </div>
      </div>
    );

    setToolbarContent(toolbarLeft);
    return () => clearToolbarContent();
  }, []);

  useEffect(() => {
    fetchLocalidades();
    fetchCalles();
  }, []);

  const fetchLocalidades = async () => {
    try {
      const mockData: Localidad[] = [
        { id: 1, nombre: 'Palermo', provinciaNombre: 'CABA' },
        { id: 2, nombre: 'Recoleta', provinciaNombre: 'CABA' },
        { id: 3, nombre: 'Belgrano', provinciaNombre: 'CABA' },
        { id: 4, nombre: 'La Plata', provinciaNombre: 'Buenos Aires' }
      ];
      setLocalidades(mockData);
    } catch (error) {
      console.error('Error fetching localidades:', error);
    }
  };

  const fetchCalles = async () => {
    setLoading(true);
    try {
      const mockData: Calle[] = [
        { id: 1, localidadId: 1, localidadNombre: 'Palermo', nombre: 'Corrientes', tipo: 'Avenida', activo: true },
        { id: 2, localidadId: 1, localidadNombre: 'Palermo', nombre: 'Santa Fe', tipo: 'Avenida', activo: true },
        { id: 3, localidadId: 1, localidadNombre: 'Palermo', nombre: 'Scalabrini Ortiz', tipo: 'Avenida', activo: true },
        { id: 4, localidadId: 2, localidadNombre: 'Recoleta', nombre: '9 de Julio', tipo: 'Avenida', activo: true },
        { id: 5, localidadId: 2, localidadNombre: 'Recoleta', nombre: 'Callao', tipo: 'Avenida', activo: true },
        { id: 6, localidadId: 3, localidadNombre: 'Belgrano', nombre: 'Cabildo', tipo: 'Avenida', activo: true },
        { id: 7, localidadId: 3, localidadNombre: 'Belgrano', nombre: 'Monroe', tipo: 'Calle', activo: true }
      ];
      setCalles(mockData);
    } catch (error) {
      console.error('Error fetching calles:', error);
      addNotification({
        title: 'Error',
        message: 'No se pudieron cargar las calles',
        type: 'error',
        category: 'atlas'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingCalle(null);
    setFormData({
      localidadId: filterLocalidad ? Number(filterLocalidad) : (localidades[0]?.id || 1),
      nombre: '',
      tipo: 'Calle',
      activo: true
    });
    setShowModal(true);
  };

  const handleEdit = (calle: Calle) => {
    setEditingCalle(calle);
    setFormData({
      localidadId: calle.localidadId,
      nombre: calle.nombre,
      tipo: calle.tipo,
      activo: calle.activo
    });
    setShowModal(true);
  };

  const handleDelete = async (calle: Calle) => {
    if (!confirm(`¿Está seguro de eliminar la calle ${calle.nombre}?`)) {
      return;
    }

    try {
      addNotification({
        title: 'Éxito',
        message: 'Calle eliminada correctamente',
        type: 'success',
        category: 'atlas'
      });
      fetchCalles();
    } catch (error) {
      console.error('Error deleting calle:', error);
      addNotification({
        title: 'Error',
        message: 'No se pudo eliminar la calle',
        type: 'error',
        category: 'atlas'
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!editingCalle) {
        addNotification({
          title: 'Éxito',
          message: 'Calle creada correctamente',
          type: 'success',
          category: 'atlas'
        });
      } else {
        addNotification({
          title: 'Éxito',
          message: 'Calle actualizada correctamente',
          type: 'success',
          category: 'atlas'
        });
      }

      setShowModal(false);
      fetchCalles();
    } catch (error) {
      console.error('Error saving calle:', error);
      addNotification({
        title: 'Error',
        message: 'No se pudo guardar la calle',
        type: 'error',
        category: 'atlas'
      });
    }
  };

  const filteredCalles = calles.filter(calle => {
    const matchesSearch = calle.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         calle.localidadNombre.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocalidad = filterLocalidad === '' || calle.localidadId === Number(filterLocalidad);
    const matchesTipo = filterTipo === '' || calle.tipo === filterTipo;
    return matchesSearch && matchesLocalidad && matchesTipo;
  });

  if (loading) {
    return (
      <div className="atlas-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando calles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="atlas-page">
      <div className="page-header">
        <div className="page-actions">
          <div className="search-box">
            <span className="material-icons search-icon">search</span>
            <input
              type="text"
              placeholder="Buscar calles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          <select
            value={filterLocalidad}
            onChange={(e) => setFilterLocalidad(e.target.value === '' ? '' : Number(e.target.value))}
            className="form-control"
            style={{ width: '200px' }}
          >
            <option value="">Todas las localidades</option>
            {localidades.map((localidad) => (
              <option key={localidad.id} value={localidad.id}>
                {localidad.nombre}
              </option>
            ))}
          </select>
          <select
            value={filterTipo}
            onChange={(e) => setFilterTipo(e.target.value)}
            className="form-control"
            style={{ width: '150px' }}
          >
            <option value="">Todos los tipos</option>
            {tiposCalle.map((tipo) => (
              <option key={tipo} value={tipo}>
                {tipo}
              </option>
            ))}
          </select>
          <button className="btn-add" onClick={handleCreate}>
            <span className="material-icons">add</span>
            Nueva Calle
          </button>
        </div>
      </div>

      <div className="content-container">
        {filteredCalles.length === 0 ? (
          <div className="empty-state">
            <span className="material-icons">signpost</span>
            <h3>No hay calles</h3>
            <p>Crea tu primera calle para comenzar</p>
            <button className="btn-add" onClick={handleCreate}>
              <span className="material-icons">add</span>
              Crear Calle
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Localidad</th>
                  <th>Tipo</th>
                  <th>Nombre</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredCalles.map((calle) => (
                  <tr key={calle.id}>
                    <td>{calle.localidadNombre}</td>
                    <td>{calle.tipo}</td>
                    <td><strong>{calle.nombre}</strong></td>
                    <td>
                      <span className={`badge ${calle.activo ? 'badge-active' : 'badge-inactive'}`}>
                        {calle.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-icon btn-icon-edit"
                          onClick={() => handleEdit(calle)}
                          title="Editar"
                        >
                          <span className="material-icons">edit</span>
                        </button>
                        <button
                          className="btn-icon btn-icon-delete"
                          onClick={() => handleDelete(calle)}
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

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingCalle ? 'Editar' : 'Nueva'} Calle</h2>
              <button className="btn-close" onClick={() => setShowModal(false)}>
                <span className="material-icons">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>
                    Localidad <span className="required">*</span>
                  </label>
                  <select
                    value={formData.localidadId}
                    onChange={(e) => setFormData({ ...formData, localidadId: Number(e.target.value) })}
                    className="form-control"
                    required
                  >
                    {localidades.map((localidad) => (
                      <option key={localidad.id} value={localidad.id}>
                        {localidad.nombre} ({localidad.provinciaNombre})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    Tipo <span className="required">*</span>
                  </label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    className="form-control"
                    required
                  >
                    {tiposCalle.map((tipo) => (
                      <option key={tipo} value={tipo}>
                        {tipo}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    Nombre <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="form-control"
                    required
                    placeholder="Ej: Corrientes"
                  />
                </div>

                <div className="form-group">
                  <label>Estado</label>
                  <select
                    value={formData.activo ? 'true' : 'false'}
                    onChange={(e) => setFormData({ ...formData, activo: e.target.value === 'true' })}
                    className="form-control"
                  >
                    <option value="true">Activo</option>
                    <option value="false">Inactivo</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingCalle ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CallesPage;
