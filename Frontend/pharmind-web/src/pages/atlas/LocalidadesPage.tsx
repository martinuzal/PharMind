import React, { useState, useEffect } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { usePage } from '../../contexts/PageContext';
import './AtlasPages.css';

interface Provincia {
  id: number;
  paisId: number;
  nombre: string;
}

interface Localidad {
  id: number;
  provinciaId: number;
  provinciaNombre: string;
  nombre: string;
  codigoPostal: string;
  activo: boolean;
}

interface CreateLocalidadDto {
  provinciaId: number;
  nombre: string;
  codigoPostal: string;
  activo: boolean;
}

const LocalidadesPage: React.FC = () => {
  const { addNotification } = useNotifications();
  const { setToolbarContent, clearToolbarContent } = usePage();

  const [loading, setLoading] = useState(true);
  const [localidades, setLocalidades] = useState<Localidad[]>([]);
  const [provincias, setProvincias] = useState<Provincia[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingLocalidad, setEditingLocalidad] = useState<Localidad | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProvincia, setFilterProvincia] = useState<number | ''>('');

  const [formData, setFormData] = useState<CreateLocalidadDto>({
    provinciaId: 1,
    nombre: '',
    codigoPostal: '',
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
          <span className="material-icons" style={{ color: 'white', fontSize: '1.5rem' }}>location_city</span>
        </div>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>Localidades</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>Gestión de ciudades y localidades</p>
        </div>
      </div>
    );

    setToolbarContent(toolbarLeft);
    return () => clearToolbarContent();
  }, []);

  useEffect(() => {
    fetchProvincias();
    fetchLocalidades();
  }, []);

  const fetchProvincias = async () => {
    try {
      const mockData: Provincia[] = [
        { id: 1, paisId: 1, nombre: 'Ciudad Autónoma de Buenos Aires' },
        { id: 2, paisId: 1, nombre: 'Buenos Aires' },
        { id: 3, paisId: 1, nombre: 'Córdoba' },
        { id: 4, paisId: 1, nombre: 'Santa Fe' }
      ];
      setProvincias(mockData);
    } catch (error) {
      console.error('Error fetching provincias:', error);
    }
  };

  const fetchLocalidades = async () => {
    setLoading(true);
    try {
      const mockData: Localidad[] = [
        { id: 1, provinciaId: 1, provinciaNombre: 'CABA', nombre: 'Palermo', codigoPostal: 'C1414', activo: true },
        { id: 2, provinciaId: 1, provinciaNombre: 'CABA', nombre: 'Recoleta', codigoPostal: 'C1113', activo: true },
        { id: 3, provinciaId: 1, provinciaNombre: 'CABA', nombre: 'Belgrano', codigoPostal: 'C1428', activo: true },
        { id: 4, provinciaId: 2, provinciaNombre: 'Buenos Aires', nombre: 'La Plata', codigoPostal: 'B1900', activo: true },
        { id: 5, provinciaId: 2, provinciaNombre: 'Buenos Aires', nombre: 'Mar del Plata', codigoPostal: 'B7600', activo: true },
        { id: 6, provinciaId: 3, provinciaNombre: 'Córdoba', nombre: 'Córdoba Capital', codigoPostal: 'X5000', activo: true },
        { id: 7, provinciaId: 4, provinciaNombre: 'Santa Fe', nombre: 'Rosario', codigoPostal: 'S2000', activo: true }
      ];
      setLocalidades(mockData);
    } catch (error) {
      console.error('Error fetching localidades:', error);
      addNotification({
        title: 'Error',
        message: 'No se pudieron cargar las localidades',
        type: 'error',
        category: 'atlas'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingLocalidad(null);
    setFormData({
      provinciaId: filterProvincia ? Number(filterProvincia) : (provincias[0]?.id || 1),
      nombre: '',
      codigoPostal: '',
      activo: true
    });
    setShowModal(true);
  };

  const handleEdit = (localidad: Localidad) => {
    setEditingLocalidad(localidad);
    setFormData({
      provinciaId: localidad.provinciaId,
      nombre: localidad.nombre,
      codigoPostal: localidad.codigoPostal,
      activo: localidad.activo
    });
    setShowModal(true);
  };

  const handleDelete = async (localidad: Localidad) => {
    if (!confirm(`¿Está seguro de eliminar la localidad ${localidad.nombre}?`)) {
      return;
    }

    try {
      addNotification({
        title: 'Éxito',
        message: 'Localidad eliminada correctamente',
        type: 'success',
        category: 'atlas'
      });
      fetchLocalidades();
    } catch (error) {
      console.error('Error deleting localidad:', error);
      addNotification({
        title: 'Error',
        message: 'No se pudo eliminar la localidad',
        type: 'error',
        category: 'atlas'
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!editingLocalidad) {
        addNotification({
          title: 'Éxito',
          message: 'Localidad creada correctamente',
          type: 'success',
          category: 'atlas'
        });
      } else {
        addNotification({
          title: 'Éxito',
          message: 'Localidad actualizada correctamente',
          type: 'success',
          category: 'atlas'
        });
      }

      setShowModal(false);
      fetchLocalidades();
    } catch (error) {
      console.error('Error saving localidad:', error);
      addNotification({
        title: 'Error',
        message: 'No se pudo guardar la localidad',
        type: 'error',
        category: 'atlas'
      });
    }
  };

  const filteredLocalidades = localidades.filter(localidad => {
    const matchesSearch = localidad.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         localidad.codigoPostal.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         localidad.provinciaNombre.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProvincia = filterProvincia === '' || localidad.provinciaId === Number(filterProvincia);
    return matchesSearch && matchesProvincia;
  });

  if (loading) {
    return (
      <div className="atlas-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando localidades...</p>
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
              placeholder="Buscar localidades..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          <select
            value={filterProvincia}
            onChange={(e) => setFilterProvincia(e.target.value === '' ? '' : Number(e.target.value))}
            className="form-control"
            style={{ width: '250px' }}
          >
            <option value="">Todas las provincias</option>
            {provincias.map((provincia) => (
              <option key={provincia.id} value={provincia.id}>
                {provincia.nombre}
              </option>
            ))}
          </select>
          <button className="btn-add" onClick={handleCreate}>
            <span className="material-icons">add</span>
            Nueva Localidad
          </button>
        </div>
      </div>

      <div className="content-container">
        {filteredLocalidades.length === 0 ? (
          <div className="empty-state">
            <span className="material-icons">location_city</span>
            <h3>No hay localidades</h3>
            <p>Crea tu primera localidad para comenzar</p>
            <button className="btn-add" onClick={handleCreate}>
              <span className="material-icons">add</span>
              Crear Localidad
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Provincia</th>
                  <th>Nombre</th>
                  <th>Código Postal</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredLocalidades.map((localidad) => (
                  <tr key={localidad.id}>
                    <td>{localidad.provinciaNombre}</td>
                    <td><strong>{localidad.nombre}</strong></td>
                    <td>{localidad.codigoPostal}</td>
                    <td>
                      <span className={`badge ${localidad.activo ? 'badge-active' : 'badge-inactive'}`}>
                        {localidad.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-icon btn-icon-edit"
                          onClick={() => handleEdit(localidad)}
                          title="Editar"
                        >
                          <span className="material-icons">edit</span>
                        </button>
                        <button
                          className="btn-icon btn-icon-delete"
                          onClick={() => handleDelete(localidad)}
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
              <h2>{editingLocalidad ? 'Editar' : 'Nueva'} Localidad</h2>
              <button className="btn-close" onClick={() => setShowModal(false)}>
                <span className="material-icons">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>
                    Provincia <span className="required">*</span>
                  </label>
                  <select
                    value={formData.provinciaId}
                    onChange={(e) => setFormData({ ...formData, provinciaId: Number(e.target.value) })}
                    className="form-control"
                    required
                  >
                    {provincias.map((provincia) => (
                      <option key={provincia.id} value={provincia.id}>
                        {provincia.nombre}
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
                    placeholder="Ej: Palermo"
                  />
                </div>

                <div className="form-group">
                  <label>
                    Código Postal <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.codigoPostal}
                    onChange={(e) => setFormData({ ...formData, codigoPostal: e.target.value.toUpperCase() })}
                    className="form-control"
                    required
                    maxLength={10}
                    placeholder="Ej: C1414"
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
                  {editingLocalidad ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocalidadesPage;
