import { useState, useEffect } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { usePage } from '../../contexts/PageContext';
import { usuariosService } from '../../services/usuarios.service';
import type { Usuario, CreateUsuarioDto, UpdateUsuarioDto } from '../../services/usuarios.service';
import type { Rol } from '../../services/roles.service';
import rolesService from '../../services/roles.service';
import type { Empresa } from '../../services/empresas.service';
import empresasService from '../../services/empresas.service';
import './UsuariosPage.css';

const UsuariosPage = () => {
  const { addNotification } = useNotifications();
  const { setToolbarContent, setToolbarCenterContent, setToolbarRightContent, clearToolbarContent } = usePage();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nombreCompleto: '',
    empresaId: '',
    telefono: '',
    cargo: '',
    departamento: '',
    roleIds: [] as string[]
  });

  useEffect(() => {
    loadData();
  }, []);

  // Configurar toolbar
  useEffect(() => {
    // Izquierda: Icono + Título
    const toolbarLeft = (
      <>
        <div className="entity-icon" style={{
          backgroundColor: '#3B82F6',
          padding: '0.375rem',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: '0.75rem',
          width: '32px',
          height: '32px'
        }}>
          <span className="material-icons" style={{ color: 'white', fontSize: '1.125rem' }}>person</span>
        </div>
        <span style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>Usuarios</span>
      </>
    );

    // Centro: Búsqueda
    const toolbarCenter = (
      <div className="search-box">
        <span className="material-icons search-icon">search</span>
        <input
          type="text"
          placeholder="Buscar usuario..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>
    );

    // Derecha: Botón de agregar
    const toolbarRight = (
      <button
        className="toolbar-icon-btn"
        onClick={() => handleOpenModal('create')}
        title="Nuevo Usuario"
        style={{
          backgroundColor: '#3B82F6',
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
      const [usuariosData, rolesData, empresasData] = await Promise.all([
        usuariosService.getAll(),
        rolesService.getAll(),
        empresasService.getAll()
      ]);
      setUsuarios(usuariosData);
      setRoles(rolesData);
      setEmpresas(empresasData);
    } catch (error: any) {
      addNotification({
        title: 'Error',
        message: 'No se pudieron cargar los datos',
        type: 'error',
        category: 'usuarios'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (mode: 'create' | 'edit', usuario?: Usuario) => {
    setModalMode(mode);
    if (mode === 'edit' && usuario) {
      setSelectedUsuario(usuario);
      setFormData({
        email: usuario.email,
        password: '',
        nombreCompleto: usuario.nombreCompleto,
        empresaId: usuario.empresaId,
        telefono: usuario.telefono || '',
        cargo: usuario.cargo || '',
        departamento: usuario.departamento || '',
        roleIds: usuario.roles || []
      });
    } else {
      setSelectedUsuario(null);
      setFormData({
        email: '',
        password: '',
        nombreCompleto: '',
        empresaId: '',
        telefono: '',
        cargo: '',
        departamento: '',
        roleIds: []
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUsuario(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (modalMode === 'create') {
        const createDto: CreateUsuarioDto = {
          email: formData.email,
          password: formData.password,
          nombreCompleto: formData.nombreCompleto,
          empresaId: formData.empresaId,
          telefono: formData.telefono || undefined,
          cargo: formData.cargo || undefined,
          departamento: formData.departamento || undefined,
          roleIds: formData.roleIds
        };
        await usuariosService.create(createDto);
        addNotification({
          title: 'Usuario creado',
          message: 'El usuario se creó correctamente',
          type: 'success',
          category: 'usuarios'
        });
      } else if (selectedUsuario) {
        const updateDto: UpdateUsuarioDto = {
          email: formData.email,
          nombreCompleto: formData.nombreCompleto,
          telefono: formData.telefono || undefined,
          cargo: formData.cargo || undefined,
          departamento: formData.departamento || undefined,
          roleIds: formData.roleIds
        };
        await usuariosService.update(selectedUsuario.id, updateDto);
        addNotification({
          title: 'Usuario actualizado',
          message: 'El usuario se actualizó correctamente',
          type: 'success',
          category: 'usuarios'
        });
      }
      handleCloseModal();
      loadData();
    } catch (error: any) {
      addNotification({
        title: 'Error',
        message: error.response?.data?.message || 'No se pudo guardar el usuario',
        type: 'error',
        category: 'usuarios'
      });
    }
  };

  const handleDelete = async (usuario: Usuario) => {
    if (!window.confirm(`¿Está seguro de eliminar el usuario ${usuario.nombreCompleto}?`)) {
      return;
    }

    try {
      await usuariosService.delete(usuario.id);
      addNotification({
        title: 'Usuario eliminado',
        message: 'El usuario se eliminó correctamente',
        type: 'success',
        category: 'usuarios'
      });
      loadData();
    } catch (error: any) {
      addNotification({
        title: 'Error',
        message: 'No se pudo eliminar el usuario',
        type: 'error',
        category: 'usuarios'
      });
    }
  };

  const filteredUsuarios = usuarios.filter(usuario =>
    usuario.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-container">
      <div className="page-content">
        <div className="card">
          {/* Tabla de usuarios */}
          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Cargando usuarios...</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Empresa</th>
                    <th>Roles</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsuarios.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>
                        No se encontraron usuarios
                      </td>
                    </tr>
                  ) : (
                    filteredUsuarios.map((usuario) => (
                      <tr key={usuario.id}>
                        <td>
                          <div className="user-cell">
                            <div className="user-avatar">
                              {usuario.nombreCompleto.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="user-name">{usuario.nombreCompleto}</div>
                              {usuario.cargo && <div className="user-cargo">{usuario.cargo}</div>}
                            </div>
                          </div>
                        </td>
                        <td>{usuario.email}</td>
                        <td>{usuario.empresaNombre}</td>
                        <td>
                          <div className="roles-badges">
                            {usuario.roles.map((rol, index) => (
                              <span key={index} className="badge badge-primary">{rol}</span>
                            ))}
                          </div>
                        </td>
                        <td>
                          <span className={`status-badge ${usuario.activo ? 'status-active' : 'status-inactive'}`}>
                            {usuario.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn-icon"
                              onClick={() => handleOpenModal('edit', usuario)}
                              title="Editar"
                            >
                              <span className="material-icons">edit</span>
                            </button>
                            <button
                              className="btn-icon btn-danger"
                              onClick={() => handleDelete(usuario)}
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

      {/* Modal de crear/editar usuario */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modalMode === 'create' ? 'Nuevo Usuario' : 'Editar Usuario'}</h2>
              <button className="modal-close" onClick={handleCloseModal}>
                <span className="material-icons">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>Nombre Completo *</label>
                    <input
                      type="text"
                      value={formData.nombreCompleto}
                      onChange={(e) => setFormData({ ...formData, nombreCompleto: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {modalMode === 'create' && (
                  <div className="form-row">
                    <div className="form-group">
                      <label>Contraseña *</label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required={modalMode === 'create'}
                        minLength={6}
                      />
                    </div>
                  </div>
                )}

                <div className="form-row">
                  <div className="form-group">
                    <label>Empresa *</label>
                    <select
                      value={formData.empresaId}
                      onChange={(e) => setFormData({ ...formData, empresaId: e.target.value })}
                      required
                    >
                      <option value="">Seleccione una empresa</option>
                      {empresas.map((empresa) => (
                        <option key={empresa.id} value={empresa.id}>
                          {empresa.nombre}
                        </option>
                      ))}
                    </select>
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
                  <div className="form-group">
                    <label>Cargo</label>
                    <input
                      type="text"
                      value={formData.cargo}
                      onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Departamento</label>
                    <input
                      type="text"
                      value={formData.departamento}
                      onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Roles</label>
                    <div className="checkbox-group">
                      {roles.map((rol) => (
                        <label key={rol.id} className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={formData.roleIds.includes(rol.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({ ...formData, roleIds: [...formData.roleIds, rol.id] });
                              } else {
                                setFormData({ ...formData, roleIds: formData.roleIds.filter(id => id !== rol.id) });
                              }
                            }}
                          />
                          {rol.nombre}
                        </label>
                      ))}
                    </div>
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

export default UsuariosPage;
