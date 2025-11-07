import React, { useState, useEffect } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { usePage } from '../../contexts/PageContext';
import './AtlasPages.css';

interface Pais {
  id: number;
  nombre: string;
}

interface Provincia {
  id: number;
  paisId: number;
  paisNombre: string;
  nombre: string;
  codigo: string;
  activo: boolean;
}

interface CreateProvinciaDto {
  paisId: number;
  nombre: string;
  codigo: string;
  activo: boolean;
}

const ProvinciasPage: React.FC = () => {
  const { addNotification } = useNotifications();
  const { setToolbarContent, clearToolbarContent } = usePage();

  const [loading, setLoading] = useState(true);
  const [provincias, setProvincias] = useState<Provincia[]>([]);
  const [paises, setPaises] = useState<Pais[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProvincia, setEditingProvincia] = useState<Provincia | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPais, setFilterPais] = useState<number | ''>('');

  const [formData, setFormData] = useState<CreateProvinciaDto>({
    paisId: 1,
    nombre: '',
    codigo: '',
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
          <span className="material-icons" style={{ color: 'white', fontSize: '1.5rem' }}>map</span>
        </div>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>Provincias / Estados</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>Gestión de divisiones administrativas de primer nivel</p>
        </div>
      </div>
    );

    setToolbarContent(toolbarLeft);
    return () => clearToolbarContent();
  }, []);

  useEffect(() => {
    fetchPaises();
    fetchProvincias();
  }, []);

  const fetchPaises = async () => {
    try {
      const mockData: Pais[] = [
        { id: 1, nombre: 'Argentina' },
        { id: 2, nombre: 'Brasil' },
        { id: 3, nombre: 'Chile' }
      ];
      setPaises(mockData);
    } catch (error) {
      console.error('Error fetching países:', error);
    }
  };

  const fetchProvincias = async () => {
    setLoading(true);
    try {
      const mockData: Provincia[] = [
        { id: 1, paisId: 1, paisNombre: 'Argentina', nombre: 'Ciudad Autónoma de Buenos Aires', codigo: 'CABA', activo: true },
        { id: 2, paisId: 1, paisNombre: 'Argentina', nombre: 'Buenos Aires', codigo: 'BA', activo: true },
        { id: 3, paisId: 1, paisNombre: 'Argentina', nombre: 'Córdoba', codigo: 'CB', activo: true },
        { id: 4, paisId: 1, paisNombre: 'Argentina', nombre: 'Santa Fe', codigo: 'SF', activo: true },
        { id: 5, paisId: 1, paisNombre: 'Argentina', nombre: 'Mendoza', codigo: 'MZ', activo: true },
        { id: 6, paisId: 2, paisNombre: 'Brasil', nombre: 'São Paulo', codigo: 'SP', activo: true },
        { id: 7, paisId: 2, paisNombre: 'Brasil', nombre: 'Rio de Janeiro', codigo: 'RJ', activo: true }
      ];
      setProvincias(mockData);
    } catch (error) {
      console.error('Error fetching provincias:', error);
      addNotification({
        title: 'Error',
        message: 'No se pudieron cargar las provincias',
        type: 'error',
        category: 'atlas'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingProvincia(null);
    setFormData({
      paisId: filterPais ? Number(filterPais) : (paises[0]?.id || 1),
      nombre: '',
      codigo: '',
      activo: true
    });
    setShowModal(true);
  };

  const handleEdit = (provincia: Provincia) => {
    setEditingProvincia(provincia);
    setFormData({
      paisId: provincia.paisId,
      nombre: provincia.nombre,
      codigo: provincia.codigo,
      activo: provincia.activo
    });
    setShowModal(true);
  };

  const handleDelete = async (provincia: Provincia) => {
    if (!confirm(`¿Está seguro de eliminar la provincia ${provincia.nombre}?`)) {
      return;
    }

    try {
      addNotification({
        title: 'Éxito',
        message: 'Provincia eliminada correctamente',
        type: 'success',
        category: 'atlas'
      });
      fetchProvincias();
    } catch (error) {
      console.error('Error deleting provincia:', error);
      addNotification({
        title: 'Error',
        message: 'No se pudo eliminar la provincia',
        type: 'error',
        category: 'atlas'
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!editingProvincia) {
        addNotification({
          title: 'Éxito',
          message: 'Provincia creada correctamente',
          type: 'success',
          category: 'atlas'
        });
      } else {
        addNotification({
          title: 'Éxito',
          message: 'Provincia actualizada correctamente',
          type: 'success',
          category: 'atlas'
        });
      }

      setShowModal(false);
      fetchProvincias();
    } catch (error) {
      console.error('Error saving provincia:', error);
      addNotification({
        title: 'Error',
        message: 'No se pudo guardar la provincia',
        type: 'error',
        category: 'atlas'
      });
    }
  };

  const filteredProvincias = provincias.filter(provincia => {
    const matchesSearch = provincia.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         provincia.codigo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         provincia.paisNombre.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPais = filterPais === '' || provincia.paisId === Number(filterPais);
    return matchesSearch && matchesPais;
  });

  if (loading) {
    return (
      <div className="atlas-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando provincias...</p>
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
              placeholder="Buscar provincias..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          <select
            value={filterPais}
            onChange={(e) => setFilterPais(e.target.value === '' ? '' : Number(e.target.value))}
            className="form-control"
            style={{ width: '200px' }}
          >
            <option value="">Todos los países</option>
            {paises.map((pais) => (
              <option key={pais.id} value={pais.id}>
                {pais.nombre}
              </option>
            ))}
          </select>
          <button className="btn-add" onClick={handleCreate}>
            <span className="material-icons">add</span>
            Nueva Provincia
          </button>
        </div>
      </div>

      <div className="content-container">
        {filteredProvincias.length === 0 ? (
          <div className="empty-state">
            <span className="material-icons">map</span>
            <h3>No hay provincias</h3>
            <p>Crea tu primera provincia para comenzar</p>
            <button className="btn-add" onClick={handleCreate}>
              <span className="material-icons">add</span>
              Crear Provincia
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>País</th>
                  <th>Nombre</th>
                  <th>Código</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredProvincias.map((provincia) => (
                  <tr key={provincia.id}>
                    <td>{provincia.paisNombre}</td>
                    <td><strong>{provincia.nombre}</strong></td>
                    <td>{provincia.codigo}</td>
                    <td>
                      <span className={`badge ${provincia.activo ? 'badge-active' : 'badge-inactive'}`}>
                        {provincia.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-icon btn-icon-edit"
                          onClick={() => handleEdit(provincia)}
                          title="Editar"
                        >
                          <span className="material-icons">edit</span>
                        </button>
                        <button
                          className="btn-icon btn-icon-delete"
                          onClick={() => handleDelete(provincia)}
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
              <h2>{editingProvincia ? 'Editar' : 'Nueva'} Provincia</h2>
              <button className="btn-close" onClick={() => setShowModal(false)}>
                <span className="material-icons">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>
                    País <span className="required">*</span>
                  </label>
                  <select
                    value={formData.paisId}
                    onChange={(e) => setFormData({ ...formData, paisId: Number(e.target.value) })}
                    className="form-control"
                    required
                  >
                    {paises.map((pais) => (
                      <option key={pais.id} value={pais.id}>
                        {pais.nombre}
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
                    placeholder="Ej: Buenos Aires"
                  />
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
                    placeholder="Ej: BA"
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
                  {editingProvincia ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProvinciasPage;
