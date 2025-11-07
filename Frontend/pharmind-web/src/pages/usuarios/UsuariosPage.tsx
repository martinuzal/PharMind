import { useState, useEffect } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { usePage } from '../../contexts/PageContext';
import { usuariosService } from '../../services/usuarios.service';
import type { Usuario } from '../../services/usuarios.service';
import UsuarioFormModal, { type UsuarioFormData } from '../../components/modals/UsuarioFormModal';
import './UsuariosPage.css';

const UsuariosPage = () => {
  const { addNotification } = useNotifications();
  const { setToolbarContent, setToolbarCenterContent, setToolbarRightContent, clearToolbarContent } = usePage();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedUsuario, setSelectedUsuario] = useState<UsuarioFormData | null>(null);

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
      const usuariosData = await usuariosService.getAll();
      setUsuarios(usuariosData);
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
      setSelectedUsuario({
        id: usuario.id,
        email: usuario.email,
        nombreCompleto: usuario.nombreCompleto,
        empresaId: usuario.empresaId,
        telefono: usuario.telefono,
        cargo: usuario.cargo,
        departamento: usuario.departamento,
        roleIds: usuario.roleIds || [],
        activo: usuario.activo,
        agenteId: usuario.agenteId,
        managerId: usuario.managerId,
        tipoAgenteId: usuario.tipoAgenteId
      });
    } else {
      setSelectedUsuario(null);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUsuario(null);
  };

  const handleSubmit = async (data: UsuarioFormData) => {
    try {
      if (modalMode === 'create') {
        await usuariosService.create({
          email: data.email,
          password: data.password!,
          nombreCompleto: data.nombreCompleto,
          empresaId: data.empresaId,
          telefono: data.telefono,
          cargo: data.cargo,
          departamento: data.departamento,
          roleIds: data.roleIds,
          agenteId: data.agenteId,
          managerId: data.managerId,
          tipoAgenteId: data.tipoAgenteId
        });
        addNotification({
          title: 'Usuario creado',
          message: 'El usuario se creó correctamente',
          type: 'success',
          category: 'usuarios'
        });
      } else if (data.id) {
        await usuariosService.update(data.id, {
          email: data.email,
          nombreCompleto: data.nombreCompleto,
          telefono: data.telefono,
          cargo: data.cargo,
          departamento: data.departamento,
          roleIds: data.roleIds,
          agenteId: data.agenteId,
          managerId: data.managerId,
          tipoAgenteId: data.tipoAgenteId
        });
        addNotification({
          title: 'Usuario actualizado',
          message: 'El usuario se actualizó correctamente',
          type: 'success',
          category: 'usuarios'
        });
      }
      loadData();
    } catch (error: any) {
      addNotification({
        title: 'Error',
        message: error.response?.data?.message || 'No se pudo guardar el usuario',
        type: 'error',
        category: 'usuarios'
      });
      throw error;
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
      <UsuarioFormModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        initialData={selectedUsuario}
        mode={modalMode}
      />
    </div>
  );
};

export default UsuariosPage;
