import React, { useState, useEffect } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { usePage } from '../../contexts/PageContext';
import './AtlasPages.css';

interface Pais {
  id: number;
  nombre: string;
  codigo2: string;
  codigo3: string;
  codigoNumerico: string;
  activo: boolean;
}

interface CreatePaisDto {
  nombre: string;
  codigo2: string;
  codigo3: string;
  codigoNumerico: string;
  activo: boolean;
}

const PaisesPage: React.FC = () => {
  const { addNotification } = useNotifications();
  const { setToolbarContent, clearToolbarContent } = usePage();

  const [loading, setLoading] = useState(true);
  const [paises, setPaises] = useState<Pais[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPais, setEditingPais] = useState<Pais | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState<CreatePaisDto>({
    nombre: '',
    codigo2: '',
    codigo3: '',
    codigoNumerico: '',
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
          <span className="material-icons" style={{ color: 'white', fontSize: '1.5rem' }}>public</span>
        </div>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>Países</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>Gestión de países del sistema</p>
        </div>
      </div>
    );

    setToolbarContent(toolbarLeft);
    return () => clearToolbarContent();
  }, []);

  useEffect(() => {
    fetchPaises();
  }, []);

  const fetchPaises = async () => {
    setLoading(true);
    try {
      // Simulando datos mientras no tenemos el backend
      const mockData: Pais[] = [
        { id: 1, nombre: 'Argentina', codigo2: 'AR', codigo3: 'ARG', codigoNumerico: '032', activo: true },
        { id: 2, nombre: 'Brasil', codigo2: 'BR', codigo3: 'BRA', codigoNumerico: '076', activo: true },
        { id: 3, nombre: 'Chile', codigo2: 'CL', codigo3: 'CHL', codigoNumerico: '152', activo: true },
        { id: 4, nombre: 'Uruguay', codigo2: 'UY', codigo3: 'URY', codigoNumerico: '858', activo: true },
        { id: 5, nombre: 'Paraguay', codigo2: 'PY', codigo3: 'PRY', codigoNumerico: '600', activo: true }
      ];
      setPaises(mockData);
    } catch (error) {
      console.error('Error fetching países:', error);
      addNotification({
        title: 'Error',
        message: 'No se pudieron cargar los países',
        type: 'error',
        category: 'atlas'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingPais(null);
    setFormData({
      nombre: '',
      codigo2: '',
      codigo3: '',
      codigoNumerico: '',
      activo: true
    });
    setShowModal(true);
  };

  const handleEdit = (pais: Pais) => {
    setEditingPais(pais);
    setFormData({
      nombre: pais.nombre,
      codigo2: pais.codigo2,
      codigo3: pais.codigo3,
      codigoNumerico: pais.codigoNumerico,
      activo: pais.activo
    });
    setShowModal(true);
  };

  const handleDelete = async (pais: Pais) => {
    if (!confirm(`¿Está seguro de eliminar el país ${pais.nombre}?`)) {
      return;
    }

    try {
      // TODO: Implementar API call
      addNotification({
        title: 'Éxito',
        message: 'País eliminado correctamente',
        type: 'success',
        category: 'atlas'
      });
      fetchPaises();
    } catch (error) {
      console.error('Error deleting país:', error);
      addNotification({
        title: 'Error',
        message: 'No se pudo eliminar el país',
        type: 'error',
        category: 'atlas'
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!editingPais) {
        // TODO: Implementar API call para crear
        addNotification({
          title: 'Éxito',
          message: 'País creado correctamente',
          type: 'success',
          category: 'atlas'
        });
      } else {
        // TODO: Implementar API call para actualizar
        addNotification({
          title: 'Éxito',
          message: 'País actualizado correctamente',
          type: 'success',
          category: 'atlas'
        });
      }

      setShowModal(false);
      fetchPaises();
    } catch (error) {
      console.error('Error saving país:', error);
      addNotification({
        title: 'Error',
        message: 'No se pudo guardar el país',
        type: 'error',
        category: 'atlas'
      });
    }
  };

  const filteredPaises = paises.filter(pais =>
    pais.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pais.codigo2.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pais.codigo3.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="atlas-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando países...</p>
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
              placeholder="Buscar países..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          <button className="btn-add" onClick={handleCreate}>
            <span className="material-icons">add</span>
            Nuevo País
          </button>
        </div>
      </div>

      <div className="content-container">
        {filteredPaises.length === 0 ? (
          <div className="empty-state">
            <span className="material-icons">public</span>
            <h3>No hay países</h3>
            <p>Crea tu primer país para comenzar</p>
            <button className="btn-add" onClick={handleCreate}>
              <span className="material-icons">add</span>
              Crear País
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Código ISO 2</th>
                  <th>Código ISO 3</th>
                  <th>Código Numérico</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredPaises.map((pais) => (
                  <tr key={pais.id}>
                    <td><strong>{pais.nombre}</strong></td>
                    <td>{pais.codigo2}</td>
                    <td>{pais.codigo3}</td>
                    <td>{pais.codigoNumerico}</td>
                    <td>
                      <span className={`badge ${pais.activo ? 'badge-active' : 'badge-inactive'}`}>
                        {pais.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-icon btn-icon-edit"
                          onClick={() => handleEdit(pais)}
                          title="Editar"
                        >
                          <span className="material-icons">edit</span>
                        </button>
                        <button
                          className="btn-icon btn-icon-delete"
                          onClick={() => handleDelete(pais)}
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
              <h2>{editingPais ? 'Editar' : 'Nuevo'} País</h2>
              <button className="btn-close" onClick={() => setShowModal(false)}>
                <span className="material-icons">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
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
                    placeholder="Ej: Argentina"
                  />
                </div>

                <div className="form-group">
                  <label>
                    Código ISO 2 <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.codigo2}
                    onChange={(e) => setFormData({ ...formData, codigo2: e.target.value.toUpperCase() })}
                    className="form-control"
                    required
                    maxLength={2}
                    placeholder="Ej: AR"
                  />
                </div>

                <div className="form-group">
                  <label>
                    Código ISO 3 <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.codigo3}
                    onChange={(e) => setFormData({ ...formData, codigo3: e.target.value.toUpperCase() })}
                    className="form-control"
                    required
                    maxLength={3}
                    placeholder="Ej: ARG"
                  />
                </div>

                <div className="form-group">
                  <label>
                    Código Numérico <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.codigoNumerico}
                    onChange={(e) => setFormData({ ...formData, codigoNumerico: e.target.value })}
                    className="form-control"
                    required
                    pattern="[0-9]{3}"
                    maxLength={3}
                    placeholder="Ej: 032"
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
                  {editingPais ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaisesPage;
