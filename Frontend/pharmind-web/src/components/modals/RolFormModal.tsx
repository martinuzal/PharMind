import React, { useState, useEffect } from 'react';
import modulosService, { type Modulo } from '../../services/modulos.service';
import empresasService, { type Empresa } from '../../services/empresas.service';
import './RolFormModal.css';

interface PermisosModulo {
  moduloId: string;
  puedeVer: boolean;
  puedeCrear: boolean;
  puedeEditar: boolean;
  puedeEliminar: boolean;
}

export interface RolFormData {
  id?: string;
  nombre: string;
  descripcion: string;
  empresaId: string;
  activo?: boolean;
  permisos: PermisosModulo[];
}

interface RolFormModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  rolId?: string;
  initialData?: RolFormData | null;
  onClose: () => void;
  onSubmit: (data: RolFormData) => Promise<void>;
}

const RolFormModal = ({ isOpen, mode, initialData, onClose, onSubmit }: RolFormModalProps) => {
  const [formData, setFormData] = useState({
    id: undefined,
    nombre: '',
    descripcion: '',
    empresaId: '',
    activo: true,
  });

  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [permisos, setPermisos] = useState<PermisosModulo[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  // Actualizar formData cuando cambia initialData o mode
  useEffect(() => {
    if (modulos.length > 0) {
      if (mode === 'edit' && initialData) {
        // Modo edición: cargar datos del rol
        setFormData({
          id: initialData.id,
          nombre: initialData.nombre || '',
          descripcion: initialData.descripcion || '',
          empresaId: initialData.empresaId || '',
          activo: initialData.activo !== undefined ? initialData.activo : true,
        });

        // Merge permisos con todos los módulos disponibles
        const permisosActualizados: PermisosModulo[] = modulos.map(m => {
          const permisoExistente = initialData.permisos.find(p => p.moduloId === m.id);
          return permisoExistente || {
            moduloId: m.id,
            puedeVer: false,
            puedeCrear: false,
            puedeEditar: false,
            puedeEliminar: false
          };
        });
        setPermisos(permisosActualizados);
      } else if (mode === 'create') {
        // Modo creación: limpiar formulario
        setFormData({
          id: undefined,
          nombre: '',
          descripcion: '',
          empresaId: '',
          activo: true,
        });

        // Inicializar permisos vacíos
        const permisosVacios: PermisosModulo[] = modulos.map(m => ({
          moduloId: m.id,
          puedeVer: false,
          puedeCrear: false,
          puedeEditar: false,
          puedeEliminar: false
        }));
        setPermisos(permisosVacios);
      }
    }
  }, [initialData, modulos, mode]);

  // Función para aplanar la jerarquía de módulos (incluir submódulos)
  const flattenModulos = (modulos: Modulo[]): Modulo[] => {
    const result: Modulo[] = [];
    modulos.forEach(modulo => {
      result.push(modulo);
      if (modulo.subModulos && modulo.subModulos.length > 0) {
        result.push(...flattenModulos(modulo.subModulos));
      }
    });
    return result;
  };

  const loadData = async () => {
    try {
      const [modulosData, empresasData] = await Promise.all([
        modulosService.getAll(),
        empresasService.getAll()
      ]);

      // Aplanar la jerarquía de módulos para incluir todos (padres + hijos)
      const modulosPlanos = flattenModulos(modulosData);
      setModulos(modulosPlanos);
      setEmpresas(empresasData);

      // El useEffect de initialData/mode se encargará de inicializar formData y permisos
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePermisoChange = (moduloId: string, permiso: keyof Omit<PermisosModulo, 'moduloId'>, value: boolean) => {
    setPermisos(prev => {
      const index = prev.findIndex(p => p.moduloId === moduloId);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = { ...updated[index], [permiso]: value };

        // Si se marca algún permiso, automáticamente marcar "Leer"
        if (value && permiso !== 'puedeVer') {
          updated[index].puedeVer = true;
        }

        // Si se desmarca "Leer", desmarcar todos los demás
        if (!value && permiso === 'puedeVer') {
          updated[index].puedeCrear = false;
          updated[index].puedeEditar = false;
          updated[index].puedeEliminar = false;
        }

        return updated;
      }
      return prev;
    });
  };

  const getPermisoValue = (moduloId: string, permiso: keyof Omit<PermisosModulo, 'moduloId'>): boolean => {
    const permisoModulo = permisos.find(p => p.moduloId === moduloId);
    return permisoModulo?.[permiso] || false;
  };

  const handleSelectAll = (permiso: keyof Omit<PermisosModulo, 'moduloId'>) => {
    setPermisos(prev => prev.map(p => ({
      ...p,
      [permiso]: true,
      // Si seleccionamos algo que no sea "Leer", también marcar "Leer"
      ...(permiso !== 'puedeVer' ? { puedeVer: true } : {})
    })));
  };

  const handleDeselectAll = (permiso: keyof Omit<PermisosModulo, 'moduloId'>) => {
    setPermisos(prev => prev.map(p => ({
      ...p,
      [permiso]: false,
      // Si deseleccionamos "Leer", desmarcar todo
      ...(permiso === 'puedeVer' ? {
        puedeCrear: false,
        puedeEditar: false,
        puedeEliminar: false
      } : {})
    })));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        permisos: permisos.filter(p => p.puedeVer) // Solo enviar módulos con al menos permiso de lectura
      });
      onClose(); // Cerrar modal después de guardar exitosamente
    } catch (error) {
      // Si hay error, el onSubmit ya maneja la notificación, solo mantenemos el modal abierto
      console.error('Error en handleSubmit:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Organizar módulos por jerarquía
  const modulosPrincipales = modulos.filter(m => !m.moduloPadreId);
  const getSubmodulos = (padreId: string) => modulos.filter(m => m.moduloPadreId === padreId);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="rol-modal-container">
        <div className="rol-modal-header">
          <div className="rol-modal-title">
            <div className="rol-modal-icon">
              <span className="material-icons">shield</span>
            </div>
            <h2>{mode === 'create' ? 'Nuevo Rol' : 'Editar Rol'}</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose} type="button">
            <span className="material-icons">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="rol-modal-body">
            {loading ? (
              <div className="loading-section">
                <div className="spinner"></div>
                <p>Cargando...</p>
              </div>
            ) : (
              <>
                {/* Información básica */}
                <section className="form-section">
                  <h3 className="section-title">
                    <span className="material-icons">info</span>
                    Información Básica
                  </h3>
                  <div className="form-grid">
                    <div className="form-field">
                      <label className="field-label">
                        Nombre del Rol <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        className="field-input"
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        placeholder="Ej: Supervisor de Ventas"
                        required
                      />
                    </div>

                    {mode === 'create' && (
                      <div className="form-field">
                        <label className="field-label">
                          Empresa <span className="required">*</span>
                        </label>
                        <select
                          className="field-select"
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
                    )}
                  </div>

                  <div className="form-field">
                    <label className="field-label">Descripción</label>
                    <textarea
                      className="field-textarea"
                      value={formData.descripcion}
                      onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                      placeholder="Describe las responsabilidades y alcance de este rol..."
                      rows={3}
                    />
                  </div>
                </section>

                {/* Matriz de permisos */}
                <section className="form-section">
                  <h3 className="section-title">
                    <span className="material-icons">security</span>
                    Permisos por Módulo
                  </h3>
                  <p className="section-description">
                    Define los permisos específicos para cada módulo del sistema
                  </p>

                  <div className="permissions-table-container">
                    <table className="permissions-table">
                      <thead>
                        <tr>
                          <th className="module-column">Módulo</th>
                          <th className="permission-column">
                            <div className="permission-header">
                              <span>Leer</span>
                              <div className="permission-actions">
                                <button
                                  type="button"
                                  className="select-all-btn"
                                  onClick={() => handleSelectAll('puedeVer')}
                                  title="Seleccionar todos"
                                >
                                  <span className="material-icons">check_box</span>
                                </button>
                                <button
                                  type="button"
                                  className="select-all-btn"
                                  onClick={() => handleDeselectAll('puedeVer')}
                                  title="Deseleccionar todos"
                                >
                                  <span className="material-icons">check_box_outline_blank</span>
                                </button>
                              </div>
                            </div>
                          </th>
                          <th className="permission-column">
                            <div className="permission-header">
                              <span>Crear</span>
                              <div className="permission-actions">
                                <button
                                  type="button"
                                  className="select-all-btn"
                                  onClick={() => handleSelectAll('puedeCrear')}
                                  title="Seleccionar todos"
                                >
                                  <span className="material-icons">check_box</span>
                                </button>
                                <button
                                  type="button"
                                  className="select-all-btn"
                                  onClick={() => handleDeselectAll('puedeCrear')}
                                  title="Deseleccionar todos"
                                >
                                  <span className="material-icons">check_box_outline_blank</span>
                                </button>
                              </div>
                            </div>
                          </th>
                          <th className="permission-column">
                            <div className="permission-header">
                              <span>Editar</span>
                              <div className="permission-actions">
                                <button
                                  type="button"
                                  className="select-all-btn"
                                  onClick={() => handleSelectAll('puedeEditar')}
                                  title="Seleccionar todos"
                                >
                                  <span className="material-icons">check_box</span>
                                </button>
                                <button
                                  type="button"
                                  className="select-all-btn"
                                  onClick={() => handleDeselectAll('puedeEditar')}
                                  title="Deseleccionar todos"
                                >
                                  <span className="material-icons">check_box_outline_blank</span>
                                </button>
                              </div>
                            </div>
                          </th>
                          <th className="permission-column">
                            <div className="permission-header">
                              <span>Eliminar</span>
                              <div className="permission-actions">
                                <button
                                  type="button"
                                  className="select-all-btn"
                                  onClick={() => handleSelectAll('puedeEliminar')}
                                  title="Seleccionar todos"
                                >
                                  <span className="material-icons">check_box</span>
                                </button>
                                <button
                                  type="button"
                                  className="select-all-btn"
                                  onClick={() => handleDeselectAll('puedeEliminar')}
                                  title="Deseleccionar todos"
                                >
                                  <span className="material-icons">check_box_outline_blank</span>
                                </button>
                              </div>
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {modulosPrincipales.map((moduloPrincipal) => (
                          <React.Fragment key={moduloPrincipal.id}>
                            <tr className="module-row module-parent">
                              <td className="module-name">
                                <div className="module-info">
                                  {moduloPrincipal.icono && (
                                    <span className="material-icons module-icon">{moduloPrincipal.icono}</span>
                                  )}
                                  <span className="module-title">{moduloPrincipal.nombre}</span>
                                </div>
                              </td>
                              <td className="permission-cell">
                                <label className="permission-checkbox">
                                  <input
                                    type="checkbox"
                                    checked={getPermisoValue(moduloPrincipal.id, 'puedeVer')}
                                    onChange={(e) => handlePermisoChange(moduloPrincipal.id, 'puedeVer', e.target.checked)}
                                  />
                                  <span className="checkmark"></span>
                                </label>
                              </td>
                              <td className="permission-cell">
                                <label className="permission-checkbox">
                                  <input
                                    type="checkbox"
                                    checked={getPermisoValue(moduloPrincipal.id, 'puedeCrear')}
                                    onChange={(e) => handlePermisoChange(moduloPrincipal.id, 'puedeCrear', e.target.checked)}
                                    disabled={!getPermisoValue(moduloPrincipal.id, 'puedeVer')}
                                  />
                                  <span className="checkmark"></span>
                                </label>
                              </td>
                              <td className="permission-cell">
                                <label className="permission-checkbox">
                                  <input
                                    type="checkbox"
                                    checked={getPermisoValue(moduloPrincipal.id, 'puedeEditar')}
                                    onChange={(e) => handlePermisoChange(moduloPrincipal.id, 'puedeEditar', e.target.checked)}
                                    disabled={!getPermisoValue(moduloPrincipal.id, 'puedeVer')}
                                  />
                                  <span className="checkmark"></span>
                                </label>
                              </td>
                              <td className="permission-cell">
                                <label className="permission-checkbox">
                                  <input
                                    type="checkbox"
                                    checked={getPermisoValue(moduloPrincipal.id, 'puedeEliminar')}
                                    onChange={(e) => handlePermisoChange(moduloPrincipal.id, 'puedeEliminar', e.target.checked)}
                                    disabled={!getPermisoValue(moduloPrincipal.id, 'puedeVer')}
                                  />
                                  <span className="checkmark"></span>
                                </label>
                              </td>
                            </tr>
                            {/* Submódulos */}
                            {getSubmodulos(moduloPrincipal.id).map((submodulo) => (
                              <tr key={submodulo.id} className="module-row module-child">
                                <td className="module-name">
                                  <div className="module-info module-subinfo">
                                    <span className="material-icons submodule-indicator">subdirectory_arrow_right</span>
                                    {submodulo.icono && (
                                      <span className="material-icons module-icon">{submodulo.icono}</span>
                                    )}
                                    <span className="module-title">{submodulo.nombre}</span>
                                  </div>
                                </td>
                                <td className="permission-cell">
                                  <label className="permission-checkbox">
                                    <input
                                      type="checkbox"
                                      checked={getPermisoValue(submodulo.id, 'puedeVer')}
                                      onChange={(e) => handlePermisoChange(submodulo.id, 'puedeVer', e.target.checked)}
                                    />
                                    <span className="checkmark"></span>
                                  </label>
                                </td>
                                <td className="permission-cell">
                                  <label className="permission-checkbox">
                                    <input
                                      type="checkbox"
                                      checked={getPermisoValue(submodulo.id, 'puedeCrear')}
                                      onChange={(e) => handlePermisoChange(submodulo.id, 'puedeCrear', e.target.checked)}
                                      disabled={!getPermisoValue(submodulo.id, 'puedeVer')}
                                    />
                                    <span className="checkmark"></span>
                                  </label>
                                </td>
                                <td className="permission-cell">
                                  <label className="permission-checkbox">
                                    <input
                                      type="checkbox"
                                      checked={getPermisoValue(submodulo.id, 'puedeEditar')}
                                      onChange={(e) => handlePermisoChange(submodulo.id, 'puedeEditar', e.target.checked)}
                                      disabled={!getPermisoValue(submodulo.id, 'puedeVer')}
                                    />
                                    <span className="checkmark"></span>
                                  </label>
                                </td>
                                <td className="permission-cell">
                                  <label className="permission-checkbox">
                                    <input
                                      type="checkbox"
                                      checked={getPermisoValue(submodulo.id, 'puedeEliminar')}
                                      onChange={(e) => handlePermisoChange(submodulo.id, 'puedeEliminar', e.target.checked)}
                                      disabled={!getPermisoValue(submodulo.id, 'puedeVer')}
                                    />
                                    <span className="checkmark"></span>
                                  </label>
                                </td>
                              </tr>
                            ))}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </>
            )}
          </div>

          <div className="rol-modal-footer">
            <button
              type="button"
              className="btn-secondary-modal"
              onClick={onClose}
              disabled={submitting}
            >
              <span className="material-icons">close</span>
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary-modal"
              disabled={submitting || loading}
            >
              {submitting ? (
                <>
                  <div className="spinner-small"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <span className="material-icons">save</span>
                  {mode === 'create' ? 'Crear Rol' : 'Guardar Cambios'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RolFormModal;
