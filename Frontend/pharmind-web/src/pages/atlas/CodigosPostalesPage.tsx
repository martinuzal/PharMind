import React, { useState, useEffect } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { usePage } from '../../contexts/PageContext';
import './AtlasPages.css';

interface Localidad {
  id: number;
  nombre: string;
  provinciaNombre: string;
}

interface CodigoPostal {
  id: number;
  localidadId: number;
  localidadNombre: string;
  codigo: string;
  descripcion?: string;
  activo: boolean;
}

interface CreateCodigoPostalDto {
  localidadId: number;
  codigo: string;
  descripcion?: string;
  activo: boolean;
}

const CodigosPostalesPage: React.FC = () => {
  const { addNotification } = useNotifications();
  const { setToolbarContent, clearToolbarContent } = usePage();

  const [loading, setLoading] = useState(true);
  const [codigosPostales, setCodigosPostales] = useState<CodigoPostal[]>([]);
  const [localidades, setLocalidades] = useState<Localidad[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCodigoPostal, setEditingCodigoPostal] = useState<CodigoPostal | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLocalidad, setFilterLocalidad] = useState<number | ''>('');

  const [formData, setFormData] = useState<CreateCodigoPostalDto>({
    localidadId: 1,
    codigo: '',
    descripcion: '',
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
          <span className="material-icons" style={{ color: 'white', fontSize: '1.5rem' }}>markunread_mailbox</span>
        </div>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>Códigos Postales</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>Gestión de códigos postales y zonas</p>
        </div>
      </div>
    );

    setToolbarContent(toolbarLeft);
    return () => clearToolbarContent();
  }, []);

  useEffect(() => {
    fetchLocalidades();
    fetchCodigosPostales();
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

  const fetchCodigosPostales = async () => {
    setLoading(true);
    try {
      const mockData: CodigoPostal[] = [
        { id: 1, localidadId: 1, localidadNombre: 'Palermo', codigo: 'C1414', descripcion: 'Palermo Soho', activo: true },
        { id: 2, localidadId: 1, localidadNombre: 'Palermo', codigo: 'C1425', descripcion: 'Palermo Hollywood', activo: true },
        { id: 3, localidadId: 2, localidadNombre: 'Recoleta', codigo: 'C1113', descripcion: 'Recoleta Norte', activo: true },
        { id: 4, localidadId: 2, localidadNombre: 'Recoleta', codigo: 'C1115', descripcion: 'Recoleta Sur', activo: true },
        { id: 5, localidadId: 3, localidadNombre: 'Belgrano', codigo: 'C1428', descripcion: 'Belgrano C', activo: true },
        { id: 6, localidadId: 3, localidadNombre: 'Belgrano', codigo: 'C1430', descripcion: 'Belgrano R', activo: true },
        { id: 7, localidadId: 4, localidadNombre: 'La Plata', codigo: 'B1900', descripcion: 'Centro', activo: true }
      ];
      setCodigosPostales(mockData);
    } catch (error) {
      console.error('Error fetching códigos postales:', error);
      addNotification({
        title: 'Error',
        message: 'No se pudieron cargar los códigos postales',
        type: 'error',
        category: 'atlas'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingCodigoPostal(null);
    setFormData({
      localidadId: filterLocalidad ? Number(filterLocalidad) : (localidades[0]?.id || 1),
      codigo: '',
      descripcion: '',
      activo: true
    });
    setShowModal(true);
  };

  const handleEdit = (cp: CodigoPostal) => {
    setEditingCodigoPostal(cp);
    setFormData({
      localidadId: cp.localidadId,
      codigo: cp.codigo,
      descripcion: cp.descripcion || '',
      activo: cp.activo
    });
    setShowModal(true);
  };

  const handleDelete = async (cp: CodigoPostal) => {
    if (!confirm(`¿Está seguro de eliminar el código postal ${cp.codigo}?`)) {
      return;
    }

    try {
      addNotification({
        title: 'Éxito',
        message: 'Código postal eliminado correctamente',
        type: 'success',
        category: 'atlas'
      });
      fetchCodigosPostales();
    } catch (error) {
      console.error('Error deleting código postal:', error);
      addNotification({
        title: 'Error',
        message: 'No se pudo eliminar el código postal',
        type: 'error',
        category: 'atlas'
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!editingCodigoPostal) {
        addNotification({
          title: 'Éxito',
          message: 'Código postal creado correctamente',
          type: 'success',
          category: 'atlas'
        });
      } else {
        addNotification({
          title: 'Éxito',
          message: 'Código postal actualizado correctamente',
          type: 'success',
          category: 'atlas'
        });
      }

      setShowModal(false);
      fetchCodigosPostales();
    } catch (error) {
      console.error('Error saving código postal:', error);
      addNotification({
        title: 'Error',
        message: 'No se pudo guardar el código postal',
        type: 'error',
        category: 'atlas'
      });
    }
  };

  const filteredCodigosPostales = codigosPostales.filter(cp => {
    const matchesSearch = cp.codigo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         cp.localidadNombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         cp.descripcion?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocalidad = filterLocalidad === '' || cp.localidadId === Number(filterLocalidad);
    return matchesSearch && matchesLocalidad;
  });

  if (loading) {
    return (
      <div className="atlas-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando códigos postales...</p>
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
              placeholder="Buscar códigos postales..."
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
          <button className="btn-add" onClick={handleCreate}>
            <span className="material-icons">add</span>
            Nuevo Código Postal
          </button>
        </div>
      </div>

      <div className="content-container">
        {filteredCodigosPostales.length === 0 ? (
          <div className="empty-state">
            <span className="material-icons">markunread_mailbox</span>
            <h3>No hay códigos postales</h3>
            <p>Crea tu primer código postal para comenzar</p>
            <button className="btn-add" onClick={handleCreate}>
              <span className="material-icons">add</span>
              Crear Código Postal
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Localidad</th>
                  <th>Descripción</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredCodigosPostales.map((cp) => (
                  <tr key={cp.id}>
                    <td><strong>{cp.codigo}</strong></td>
                    <td>{cp.localidadNombre}</td>
                    <td>{cp.descripcion || '-'}</td>
                    <td>
                      <span className={`badge ${cp.activo ? 'badge-active' : 'badge-inactive'}`}>
                        {cp.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-icon btn-icon-edit"
                          onClick={() => handleEdit(cp)}
                          title="Editar"
                        >
                          <span className="material-icons">edit</span>
                        </button>
                        <button
                          className="btn-icon btn-icon-delete"
                          onClick={() => handleDelete(cp)}
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
              <h2>{editingCodigoPostal ? 'Editar' : 'Nuevo'} Código Postal</h2>
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
                    Código <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value.toUpperCase() })}
                    className="form-control"
                    required
                    maxLength={10}
                    placeholder="Ej: C1414"
                  />
                </div>

                <div className="form-group">
                  <label>Descripción</label>
                  <input
                    type="text"
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    className="form-control"
                    placeholder="Ej: Palermo Soho"
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
                  {editingCodigoPostal ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodigosPostalesPage;
