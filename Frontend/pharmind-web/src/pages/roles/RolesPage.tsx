import { useState, useEffect } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import rolesService from '../../services/roles.service';
import type { Rol, CreateRolDto, UpdateRolDto } from '../../services/roles.service';
import modulosService from '../../services/modulos.service';
import type { Modulo } from '../../services/modulos.service';
import empresasService from '../../services/empresas.service';
import type { Empresa } from '../../services/empresas.service';
import '../usuarios/UsuariosPage.css';

const RolesPage = () => {
  const { addNotification } = useNotifications();
  const [roles, setRoles] = useState<Rol[]>([]);
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedRol, setSelectedRol] = useState<Rol | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    empresaId: '',
    moduloIds: [] as string[]
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rolesData, modulosData, empresasData] = await Promise.all([
        rolesService.getAll(),
        modulosService.getAll(),
        empresasService.getAll()
      ]);
      setRoles(rolesData);
      setModulos(modulosData);
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

  const handleOpenModal = (mode: 'create' | 'edit', rol?: Rol) => {
    setModalMode(mode);
    if (mode === 'edit' && rol) {
      setSelectedRol(rol);
      setFormData({
        nombre: rol.nombre,
        descripcion: rol.descripcion || '',
        empresaId: rol.empresaId,
        moduloIds: [] // Se cargarán los módulos asignados
      });
      // Cargar módulos asignados al rol
      loadRolModulos(rol.id);
    } else {
      setSelectedRol(null);
      setFormData({
        nombre: '',
        descripcion: '',
        empresaId: '',
        moduloIds: []
      });
    }
    setShowModal(true);
  };

  const loadRolModulos = async (rolId: string) => {
    try {
      const modulosAsignados = await rolesService.getModulos(rolId);
      setFormData(prev => ({
        ...prev,
        moduloIds: modulosAsignados.map(m => m.id)
      }));
    } catch (error: any) {
      console.error('Error al cargar módulos del rol:', error);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedRol(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (modalMode === 'create') {
        const createDto: CreateRolDto = {
          empresaId: formData.empresaId,
          nombre: formData.nombre,
          descripcion: formData.descripcion || undefined,
          moduloIds: formData.moduloIds
        };
        await rolesService.create(createDto);
        addNotification({
          title: 'Rol creado',
          message: 'El rol se creó correctamente',
          type: 'success',
          category: 'roles'
        });
      } else if (selectedRol) {
        const updateDto: UpdateRolDto = {
          nombre: formData.nombre,
          descripcion: formData.descripcion || undefined,
          moduloIds: formData.moduloIds
        };
        await rolesService.update(selectedRol.id, updateDto);
        addNotification({
          title: 'Rol actualizado',
          message: 'El rol se actualizó correctamente',
          type: 'success',
          category: 'roles'
        });
      }
      handleCloseModal();
      loadData();
    } catch (error: any) {
      addNotification({
        title: 'Error',
        message: error.response?.data?.message || 'No se pudo guardar el rol',
        type: 'error',
        category: 'roles'
      });
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
      <div className="page-header">
        <div>
          <h1>Roles</h1>
          <p className="page-description">
            Gestión de roles y permisos del sistema
          </p>
        </div>
        <button className="btn-primary" onClick={() => handleOpenModal('create')}>
          <span className="material-icons">add</span>
          Nuevo Rol
        </button>
      </div>

      <div className="page-content">
        <div className="card">
          {/* Barra de búsqueda */}
          <div className="table-header">
            <div className="search-box">
              <span className="material-icons">search</span>
              <input
                type="text"
                placeholder="Buscar roles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

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
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modalMode === 'create' ? 'Nuevo Rol' : 'Editar Rol'}</h2>
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
                    <label>Descripción</label>
                    <textarea
                      value={formData.descripcion}
                      onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                      placeholder="Descripción del rol..."
                    />
                  </div>
                </div>

                {modalMode === 'create' && (
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
                )}

                <div className="form-row">
                  <div className="form-group">
                    <label>Módulos</label>
                    <div className="checkbox-group">
                      {modulos.map((modulo) => (
                        <label key={modulo.id} className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={formData.moduloIds.includes(modulo.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({ ...formData, moduloIds: [...formData.moduloIds, modulo.id] });
                              } else {
                                setFormData({ ...formData, moduloIds: formData.moduloIds.filter(id => id !== modulo.id) });
                              }
                            }}
                          />
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {modulo.icono && <span className="material-icons" style={{ fontSize: '1rem' }}>{modulo.icono}</span>}
                            {modulo.nombre}
                          </span>
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

export default RolesPage;
