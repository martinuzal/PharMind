import { useState, useEffect } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { usePage } from '../../contexts/PageContext';
import empresasService from '../../services/empresas.service';
import type { Empresa, CreateEmpresaDto, UpdateEmpresaDto } from '../../services/empresas.service';
import '../usuarios/UsuariosPage.css';

const EmpresasPage = () => {
  const { addNotification } = useNotifications();
  const { setToolbarContent, setToolbarCenterContent, setToolbarRightContent, clearToolbarContent } = usePage();
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedEmpresa, setSelectedEmpresa] = useState<Empresa | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    nombre: '',
    razonSocial: '',
    cuit: '',
    direccion: '',
    telefono: '',
    email: '',
    logo: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  // Configurar toolbar
  useEffect(() => {
    const toolbarLeft = (
      <>
        <div className="entity-icon" style={{
          backgroundColor: '#EF4444',
          padding: '0.375rem',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: '0.75rem',
          width: '32px',
          height: '32px'
        }}>
          <span className="material-icons" style={{ color: 'white', fontSize: '1.125rem' }}>business</span>
        </div>
        <span style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>Empresas</span>
      </>
    );

    const toolbarCenter = (
      <div className="search-box">
        <span className="material-icons search-icon">search</span>
        <input
          type="text"
          placeholder="Buscar empresa..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>
    );

    const toolbarRight = (
      <button
        className="toolbar-icon-btn"
        onClick={() => handleOpenModal('create')}
        title="Nueva Empresa"
        style={{
          backgroundColor: '#EF4444',
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
    setToolbarCenterContent(toolbarCenter);
    setToolbarRightContent(toolbarRight);

    return () => {
      clearToolbarContent();
    };
  }, [searchTerm]);

  const loadData = async () => {
    try {
      setLoading(true);
      const empresasData = await empresasService.getAll();
      setEmpresas(empresasData);
    } catch (error: any) {
      addNotification({
        title: 'Error',
        message: 'No se pudieron cargar los datos',
        type: 'error',
        category: 'empresas'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (mode: 'create' | 'edit', empresa?: Empresa) => {
    setModalMode(mode);
    if (mode === 'edit' && empresa) {
      setSelectedEmpresa(empresa);
      setFormData({
        nombre: empresa.nombre,
        razonSocial: empresa.razonSocial,
        cuit: empresa.cuit || '',
        direccion: empresa.direccion || '',
        telefono: empresa.telefono || '',
        email: empresa.email || '',
        logo: empresa.logo || ''
      });
    } else {
      setSelectedEmpresa(null);
      setFormData({
        nombre: '',
        razonSocial: '',
        cuit: '',
        direccion: '',
        telefono: '',
        email: '',
        logo: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedEmpresa(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (modalMode === 'create') {
        const createDto: CreateEmpresaDto = {
          nombre: formData.nombre,
          razonSocial: formData.razonSocial,
          cuit: formData.cuit || undefined,
          direccion: formData.direccion || undefined,
          telefono: formData.telefono || undefined,
          email: formData.email || undefined,
          logo: formData.logo || undefined
        };
        await empresasService.create(createDto);
        addNotification({
          title: 'Empresa creada',
          message: 'La empresa se creó correctamente',
          type: 'success',
          category: 'empresas'
        });
      } else if (selectedEmpresa) {
        const updateDto: UpdateEmpresaDto = {
          nombre: formData.nombre,
          razonSocial: formData.razonSocial,
          cuit: formData.cuit || undefined,
          direccion: formData.direccion || undefined,
          telefono: formData.telefono || undefined,
          email: formData.email || undefined,
          logo: formData.logo || undefined
        };
        await empresasService.update(selectedEmpresa.id, updateDto);
        addNotification({
          title: 'Empresa actualizada',
          message: 'La empresa se actualizó correctamente',
          type: 'success',
          category: 'empresas'
        });
      }
      handleCloseModal();
      loadData();
    } catch (error: any) {
      addNotification({
        title: 'Error',
        message: error.response?.data?.message || 'No se pudo guardar la empresa',
        type: 'error',
        category: 'empresas'
      });
    }
  };

  const handleDelete = async (empresa: Empresa) => {
    if (!window.confirm(`¿Está seguro de eliminar la empresa ${empresa.nombre}?`)) {
      return;
    }

    try {
      await empresasService.delete(empresa.id);
      addNotification({
        title: 'Empresa eliminada',
        message: 'La empresa se eliminó correctamente',
        type: 'success',
        category: 'empresas'
      });
      loadData();
    } catch (error: any) {
      addNotification({
        title: 'Error',
        message: 'No se pudo eliminar la empresa',
        type: 'error',
        category: 'empresas'
      });
    }
  };

  const filteredEmpresas = empresas.filter(empresa =>
    empresa.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    empresa.razonSocial.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (empresa.cuit && empresa.cuit.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="page-container">
      <div className="page-content">
        <div className="card">
          {/* Tabla de empresas */}
          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Cargando empresas...</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Razón Social</th>
                    <th>CUIT</th>
                    <th>Email</th>
                    <th>Teléfono</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmpresas.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>
                        No se encontraron empresas
                      </td>
                    </tr>
                  ) : (
                    filteredEmpresas.map((empresa) => (
                      <tr key={empresa.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div className="user-avatar" style={{ background: 'var(--accent-color)' }}>
                              {empresa.nombre.charAt(0).toUpperCase()}
                            </div>
                            <span style={{ fontWeight: 500 }}>{empresa.nombre}</span>
                          </div>
                        </td>
                        <td>{empresa.razonSocial}</td>
                        <td>{empresa.cuit || '-'}</td>
                        <td>{empresa.email || '-'}</td>
                        <td>{empresa.telefono || '-'}</td>
                        <td>
                          <span className={`status-badge ${empresa.activo ? 'status-active' : 'status-inactive'}`}>
                            {empresa.activo ? 'Activa' : 'Inactiva'}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn-icon"
                              onClick={() => handleOpenModal('edit', empresa)}
                              title="Editar"
                            >
                              <span className="material-icons">edit</span>
                            </button>
                            <button
                              className="btn-icon btn-danger"
                              onClick={() => handleDelete(empresa)}
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
          )}
        </div>
      </div>

      {/* Modal de crear/editar empresa */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modalMode === 'create' ? 'Nueva Empresa' : 'Editar Empresa'}</h2>
              <button className="modal-close" onClick={handleCloseModal}>
                <span className="material-icons">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>Nombre *</label>
                    <input
                      type="text"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Razón Social *</label>
                    <input
                      type="text"
                      value={formData.razonSocial}
                      onChange={(e) => setFormData({ ...formData, razonSocial: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>CUIT</label>
                    <input
                      type="text"
                      value={formData.cuit}
                      onChange={(e) => setFormData({ ...formData, cuit: e.target.value })}
                      placeholder="XX-XXXXXXXX-X"
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Teléfono</label>
                    <input
                      type="text"
                      value={formData.telefono}
                      onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Dirección</label>
                    <textarea
                      value={formData.direccion}
                      onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                      placeholder="Dirección completa..."
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Logo URL</label>
                    <input
                      type="text"
                      value={formData.logo}
                      onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={handleCloseModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {modalMode === 'create' ? 'Crear' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmpresasPage;
