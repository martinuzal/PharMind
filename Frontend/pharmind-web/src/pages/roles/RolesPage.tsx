import { useState, useEffect } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { usePage } from '../../contexts/PageContext';
import rolesService from '../../services/roles.service';
import type { Rol } from '../../services/roles.service';
import empresasService from '../../services/empresas.service';
import type { Empresa } from '../../services/empresas.service';
import RolFormModal, { type RolFormData } from '../../components/modals/RolFormModal';
import '../usuarios/UsuariosPage.css';

const RolesPage = () => {
  const { addNotification } = useNotifications();
  const { setToolbarContent, setToolbarCenterContent, setToolbarRightContent, clearToolbarContent } = usePage();
  const [roles, setRoles] = useState<Rol[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedRol, setSelectedRol] = useState<RolFormData | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  // Configurar toolbar
  useEffect(() => {
    const toolbarLeft = (
      <>
        <div className="entity-icon" style={{
          backgroundColor: '#F59E0B',
          padding: '0.375rem',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: '0.75rem',
          width: '32px',
          height: '32px'
        }}>
          <span className="material-icons" style={{ color: 'white', fontSize: '1.125rem' }}>shield</span>
        </div>
        <span style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>Roles</span>
      </>
    );

    const toolbarCenter = (
      <div className="search-box">
        <span className="material-icons search-icon">search</span>
        <input
          type="text"
          placeholder="Buscar rol..."
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
        title="Nuevo Rol"
        style={{
          backgroundColor: '#F59E0B',
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
      const [rolesData, empresasData] = await Promise.all([
        rolesService.getAll(),
        empresasService.getAll()
      ]);
      setRoles(rolesData);
      setEmpresas(empresasData);
    } catch (error: any) {
      addNotification({
        title: 'Error',
        message: 'No se pudieron cargar los datos',
        type: 'error',
        category: 'roles'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = async (mode: 'create' | 'edit', rol?: Rol) => {
    setModalMode(mode);
    if (mode === 'edit' && rol) {
      try {
        // Cargar el rol completo con permisos desde el backend
        const rolCompleto = await rolesService.getById(rol.id);
        setSelectedRol({
          id: rolCompleto.id,
          nombre: rolCompleto.nombre,
          descripcion: rolCompleto.descripcion || '',
          empresaId: rolCompleto.empresaId,
          activo: rolCompleto.activo,
          permisos: rolCompleto.permisos || []
        });
      } catch (error) {
        console.error('Error al cargar rol:', error);
        addNotification({
          title: 'Error',
          message: 'No se pudo cargar el rol',
          type: 'error',
          category: 'roles'
        });
        return;
      }
    } else {
      setSelectedRol(null);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedRol(null);
  };

  const handleSubmit = async (data: RolFormData) => {
    try {
      if (modalMode === 'create') {
        await rolesService.create({
          empresaId: data.empresaId,
          nombre: data.nombre,
          descripcion: data.descripcion || undefined,
          permisos: data.permisos
        });
        addNotification({
          title: 'Rol creado',
          message: 'El rol se creó correctamente',
          type: 'success',
          category: 'roles'
        });
      } else if (data.id) {
        await rolesService.update(data.id, {
          nombre: data.nombre,
          descripcion: data.descripcion || undefined,
          activo: data.activo,
          permisos: data.permisos
        });
        addNotification({
          title: 'Rol actualizado',
          message: 'El rol se actualizó correctamente',
          type: 'success',
          category: 'roles'
        });
      }
      loadData();
    } catch (error: any) {
      addNotification({
        title: 'Error',
        message: error.response?.data?.message || 'No se pudo guardar el rol',
        type: 'error',
        category: 'roles'
      });
      throw error;
    }
  };

  const handleDelete = async (rol: Rol) => {
    if (rol.esSistema) {
      addNotification({
        title: 'No permitido',
        message: 'No se pueden eliminar roles del sistema',
        type: 'warning',
        category: 'roles'
      });
      return;
    }

    if (!window.confirm(`¿Está seguro de eliminar el rol ${rol.nombre}?`)) {
      return;
    }

    try {
      await rolesService.delete(rol.id);
      addNotification({
        title: 'Rol eliminado',
        message: 'El rol se eliminó correctamente',
        type: 'success',
        category: 'roles'
      });
      loadData();
    } catch (error: any) {
      addNotification({
        title: 'Error',
        message: 'No se pudo eliminar el rol',
        type: 'error',
        category: 'roles'
      });
    }
  };

  const filteredRoles = roles.filter(rol =>
    rol.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (rol.descripcion && rol.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getEmpresaNombre = (empresaId: string) => {
    const empresa = empresas.find(e => e.id === empresaId);
    return empresa?.nombre || 'N/A';
  };

  return (
    <div className="page-container">
      <div className="page-content">
        <div className="card">
          {/* Tabla de roles */}
          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Cargando roles...</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Descripción</th>
                    <th>Empresa</th>
                    <th>Tipo</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRoles.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>
                        No se encontraron roles
                      </td>
                    </tr>
                  ) : (
                    filteredRoles.map((rol) => (
                      <tr key={rol.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span className="material-icons" style={{ color: 'var(--accent-color)', fontSize: '1.25rem' }}>
                              shield
                            </span>
                            <span style={{ fontWeight: 500 }}>{rol.nombre}</span>
                          </div>
                        </td>
                        <td>{rol.descripcion || '-'}</td>
                        <td>{getEmpresaNombre(rol.empresaId)}</td>
                        <td>
                          {rol.esSistema ? (
                            <span className="badge badge-primary">Sistema</span>
                          ) : (
                            <span className="badge" style={{ background: 'rgba(107, 114, 128, 0.1)', color: 'var(--text-secondary)' }}>
                              Personalizado
                            </span>
                          )}
                        </td>
                        <td>
                          <span className={`status-badge ${rol.activo ? 'status-active' : 'status-inactive'}`}>
                            {rol.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn-icon"
                              onClick={() => handleOpenModal('edit', rol)}
                              title="Editar"
                            >
                              <span className="material-icons">edit</span>
                            </button>
                            <button
                              className={`btn-icon ${rol.esSistema ? '' : 'btn-danger'}`}
                              onClick={() => handleDelete(rol)}
                              title={rol.esSistema ? 'No se puede eliminar' : 'Eliminar'}
                              disabled={rol.esSistema}
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

      {/* Modal de crear/editar rol */}
      <RolFormModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        initialData={selectedRol}
        mode={modalMode}
      />
    </div>
  );
};

export default RolesPage;
