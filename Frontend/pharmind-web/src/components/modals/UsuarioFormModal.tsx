import React, { useState, useEffect } from 'react';
import './UsuarioFormModal.css';
import rolesService, { type Rol } from '../../services/roles.service';
import empresasService, { type Empresa } from '../../services/empresas.service';
import { managersService, type Manager } from '../../services/managers.service';
import { agentesService, type Agente } from '../../services/agentes.service';
import api from '../../services/api';

interface UsuarioFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UsuarioFormData) => Promise<void>;
  initialData?: UsuarioFormData | null;
  mode: 'create' | 'edit';
}

export interface UsuarioFormData {
  id?: string;
  nombreCompleto: string;
  email: string;
  password?: string;
  empresaId: string;
  telefono?: string;
  cargo?: string;
  departamento?: string;
  roleIds: string[];
  activo?: boolean;
  managerId?: string;
  agenteId?: string;
  tipoAgenteId?: string;
}

interface TipoAgente {
  id: string;
  nombre: string;
  tipoEntidad: string;
}

export const UsuarioFormModal: React.FC<UsuarioFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode
}) => {
  const [formData, setFormData] = useState<UsuarioFormData>({
    nombreCompleto: '',
    email: '',
    password: '',
    empresaId: '',
    telefono: '',
    cargo: '',
    departamento: '',
    roleIds: [],
    activo: true
  });

  const [roles, setRoles] = useState<Rol[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [tiposAgente, setTiposAgente] = useState<TipoAgente[]>([]);
  const [agentes, setAgentes] = useState<Agente[]>([]);
  const [userType, setUserType] = useState<'normal' | 'manager' | 'agente'>('normal');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialData) {
      console.log('=== DEBUG initialData ===');
      console.log('initialData:', initialData);
      console.log('agenteId:', initialData.agenteId);
      console.log('tipoAgenteId:', initialData.tipoAgenteId);
      setFormData(initialData);
      // Determine user type based on initialData
      if (initialData.managerId) {
        setUserType('manager');
      } else if (initialData.agenteId) {
        setUserType('agente');
      } else {
        setUserType('normal');
      }
    } else {
      setFormData({
        nombreCompleto: '',
        email: '',
        password: '',
        empresaId: '',
        telefono: '',
        cargo: '',
        departamento: '',
        roleIds: [],
        activo: true
      });
      setUserType('normal');
    }
  }, [initialData, isOpen]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rolesData, empresasData, managersData, tiposAgenteData, agentesData] = await Promise.all([
        rolesService.getAll(),
        empresasService.getAll(),
        managersService.getAll({ activo: true }),
        api.get('/EsquemasPersonalizados?entidadTipo=Agente').then(res => res.data || []),
        agentesService.getAll()
      ]);

      console.log('=== DEBUG loadData ===');
      console.log('Managers cargados:', managersData);
      console.log('Tipos Agente cargados:', tiposAgenteData);
      console.log('Agentes cargados:', agentesData);

      setRoles(rolesData.filter(r => r.activo));
      setEmpresas(empresasData.filter(e => e.activo));
      setManagers(managersData.items.filter(m => m.activo));
      setTiposAgente(tiposAgenteData);
      setAgentes(agentesData.items);

      console.log('Managers en state:', managersData.items.filter(m => m.activo));
      console.log('TiposAgente en state:', tiposAgenteData);
      console.log('Agentes en state:', agentesData.items);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombreCompleto.trim()) {
      newErrors.nombreCompleto = 'El nombre completo es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (mode === 'create' && !formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (!formData.empresaId) {
      newErrors.empresaId = 'Debe seleccionar una empresa';
    }

    if (formData.roleIds.length === 0) {
      newErrors.roleIds = 'Debe seleccionar al menos un rol';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit(formData);
      handleClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUserTypeChange = (type: 'normal' | 'manager' | 'agente') => {
    setUserType(type);

    // Clear conflicting fields based on user type
    setFormData(prev => ({
      ...prev,
      managerId: type === 'manager' ? prev.managerId : undefined,
      agenteId: type === 'agente' ? prev.agenteId : undefined,
      tipoAgenteId: type === 'agente' ? prev.tipoAgenteId : undefined
    }));
  };

  const handleClose = () => {
    setFormData({
      nombreCompleto: '',
      email: '',
      password: '',
      empresaId: '',
      telefono: '',
      cargo: '',
      departamento: '',
      roleIds: [],
      activo: true,
      managerId: undefined,
      agenteId: undefined,
      tipoAgenteId: undefined
    });
    setErrors({});
    setUserType('normal');
    onClose();
  };

  const handleRoleToggle = (roleId: string) => {
    setFormData(prev => ({
      ...prev,
      roleIds: prev.roleIds.includes(roleId)
        ? prev.roleIds.filter(id => id !== roleId)
        : [...prev.roleIds, roleId]
    }));
    // Clear role error when user selects a role
    if (errors.roleIds) {
      setErrors(prev => ({ ...prev, roleIds: '' }));
    }
  };

  const handleSelectAllRoles = () => {
    setFormData(prev => ({
      ...prev,
      roleIds: roles.map(r => r.id)
    }));
    if (errors.roleIds) {
      setErrors(prev => ({ ...prev, roleIds: '' }));
    }
  };

  const handleDeselectAllRoles = () => {
    setFormData(prev => ({
      ...prev,
      roleIds: []
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="usuario-modal-container">
        {/* Header */}
        <div className="usuario-modal-header">
          <div className="usuario-modal-title">
            <div className="usuario-modal-icon">
              <span className="material-icons">
                {mode === 'create' ? 'person_add' : 'edit'}
              </span>
            </div>
            <h2>{mode === 'create' ? 'Nuevo Usuario' : 'Editar Usuario'}</h2>
          </div>
          <button
            className="modal-close-btn"
            onClick={handleClose}
            type="button"
          >
            <span className="material-icons">close</span>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="usuario-modal-body">
            {loading ? (
              <div className="loading-section">
                <div className="spinner"></div>
                <p>Cargando datos...</p>
              </div>
            ) : (
              <>
                {/* Información Personal */}
                <div className="form-section">
                  <div className="section-title">
                    <span className="material-icons">badge</span>
                    Información Personal
                  </div>
                  <p className="section-description">
                    Datos básicos del usuario y credenciales de acceso
                  </p>

                  <div className="form-grid">
                    <div className="form-field">
                      <label className="field-label">
                        Nombre Completo <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        className={`field-input ${errors.nombreCompleto ? 'error' : ''}`}
                        value={formData.nombreCompleto}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, nombreCompleto: e.target.value }));
                          if (errors.nombreCompleto) {
                            setErrors(prev => ({ ...prev, nombreCompleto: '' }));
                          }
                        }}
                        placeholder="Juan Pérez"
                      />
                      {errors.nombreCompleto && (
                        <span className="field-error">{errors.nombreCompleto}</span>
                      )}
                    </div>

                    <div className="form-field">
                      <label className="field-label">
                        Email <span className="required">*</span>
                      </label>
                      <input
                        type="email"
                        className={`field-input ${errors.email ? 'error' : ''}`}
                        value={formData.email}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, email: e.target.value }));
                          if (errors.email) {
                            setErrors(prev => ({ ...prev, email: '' }));
                          }
                        }}
                        placeholder="usuario@empresa.com"
                      />
                      {errors.email && (
                        <span className="field-error">{errors.email}</span>
                      )}
                    </div>

                    {mode === 'create' && (
                      <div className="form-field">
                        <label className="field-label">
                          Contraseña <span className="required">*</span>
                        </label>
                        <input
                          type="password"
                          className={`field-input ${errors.password ? 'error' : ''}`}
                          value={formData.password}
                          onChange={(e) => {
                            setFormData(prev => ({ ...prev, password: e.target.value }));
                            if (errors.password) {
                              setErrors(prev => ({ ...prev, password: '' }));
                            }
                          }}
                          placeholder="Mínimo 6 caracteres"
                        />
                        {errors.password && (
                          <span className="field-error">{errors.password}</span>
                        )}
                      </div>
                    )}

                    <div className="form-field">
                      <label className="field-label">
                        Empresa <span className="required">*</span>
                      </label>
                      <select
                        className={`field-select ${errors.empresaId ? 'error' : ''}`}
                        value={formData.empresaId}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, empresaId: e.target.value }));
                          if (errors.empresaId) {
                            setErrors(prev => ({ ...prev, empresaId: '' }));
                          }
                        }}
                      >
                        <option value="">Seleccionar empresa...</option>
                        {empresas.map(empresa => (
                          <option key={empresa.id} value={empresa.id}>
                            {empresa.nombre}
                          </option>
                        ))}
                      </select>
                      {errors.empresaId && (
                        <span className="field-error">{errors.empresaId}</span>
                      )}
                    </div>

                    <div className="form-field">
                      <label className="field-label">Teléfono</label>
                      <input
                        type="tel"
                        className="field-input"
                        value={formData.telefono || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
                        placeholder="+54 11 1234-5678"
                      />
                    </div>
                  </div>
                </div>

                {/* Información Laboral */}
                <div className="form-section">
                  <div className="section-title">
                    <span className="material-icons">work</span>
                    Información Laboral
                  </div>
                  <p className="section-description">
                    Detalles sobre la posición y departamento del usuario
                  </p>

                  <div className="form-grid">
                    <div className="form-field">
                      <label className="field-label">Cargo</label>
                      <input
                        type="text"
                        className="field-input"
                        value={formData.cargo || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, cargo: e.target.value }))}
                        placeholder="Ej: Gerente de Ventas"
                      />
                    </div>

                    <div className="form-field">
                      <label className="field-label">Departamento</label>
                      <input
                        type="text"
                        className="field-input"
                        value={formData.departamento || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, departamento: e.target.value }))}
                        placeholder="Ej: Ventas"
                      />
                    </div>
                  </div>
                </div>

                {/* Tipo de Usuario */}
                <div className="form-section">
                  <div className="section-title">
                    <span className="material-icons">person_pin</span>
                    Tipo de Usuario
                  </div>
                  <p className="section-description">
                    Define si este usuario es un Manager o un Agente con asignaciones específicas
                  </p>

                  <div className="form-field">
                    <label className="field-label">Tipo</label>
                    <select
                      className="field-select"
                      value={userType}
                      onChange={(e) => handleUserTypeChange(e.target.value as 'normal' | 'manager' | 'agente')}
                    >
                      <option value="normal">Usuario Normal</option>
                      <option value="manager">Manager</option>
                      <option value="agente">Agente</option>
                    </select>
                  </div>

                  {userType === 'manager' && (
                    <div className="form-field">
                      <label className="field-label">Manager</label>
                      <select
                        className="field-select"
                        value={formData.managerId || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, managerId: e.target.value }))}
                      >
                        <option value="">Seleccionar manager...</option>
                        {managers.map(manager => (
                          <option key={manager.id} value={manager.id}>
                            {manager.codigo} - {manager.nombre} {manager.apellido || ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {userType === 'agente' && (
                    <>
                      <div className="form-field">
                        <label className="field-label">Tipo de Agente</label>
                        <select
                          className="field-select"
                          value={formData.tipoAgenteId || ''}
                          onChange={(e) => {
                            setFormData(prev => ({
                              ...prev,
                              tipoAgenteId: e.target.value,
                              agenteId: undefined // Reset agente when tipo changes
                            }));
                          }}
                        >
                          <option value="">Seleccionar tipo de agente...</option>
                          {tiposAgente.map(tipo => (
                            <option key={tipo.id} value={tipo.id}>
                              {tipo.nombre}
                            </option>
                          ))}
                        </select>
                      </div>

                      {formData.tipoAgenteId && (
                        <div className="form-field">
                          <label className="field-label">Agente</label>
                          <select
                            className="field-select"
                            value={formData.agenteId || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, agenteId: e.target.value }))}
                          >
                            <option value="">Seleccionar agente...</option>
                            {agentes
                              .filter(agente => agente.tipoAgenteId?.toUpperCase() === formData.tipoAgenteId?.toUpperCase())
                              .map(agente => (
                                <option key={agente.id} value={agente.id}>
                                  {agente.codigoAgente} - {agente.nombre}
                                </option>
                              ))}
                          </select>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Roles */}
                <div className="form-section">
                  <div className="section-title">
                    <span className="material-icons">verified_user</span>
                    Roles y Permisos
                  </div>
                  <p className="section-description">
                    Seleccione uno o más roles para el usuario. Los permisos se heredan de los roles asignados.
                  </p>

                  <div className="roles-actions">
                    <button
                      type="button"
                      className="btn-select-action"
                      onClick={handleSelectAllRoles}
                    >
                      <span className="material-icons">done_all</span>
                      Seleccionar Todos
                    </button>
                    <button
                      type="button"
                      className="btn-select-action"
                      onClick={handleDeselectAllRoles}
                    >
                      <span className="material-icons">remove_done</span>
                      Deseleccionar Todos
                    </button>
                  </div>

                  {errors.roleIds && (
                    <div className="roles-error">
                      <span className="material-icons">error</span>
                      {errors.roleIds}
                    </div>
                  )}

                  <div className="roles-grid">
                    {roles.map(rol => (
                      <div
                        key={rol.id}
                        className={`role-card ${formData.roleIds.includes(rol.id) ? 'selected' : ''} ${rol.esSistema ? 'system' : ''}`}
                        onClick={() => handleRoleToggle(rol.id)}
                      >
                        <div className="role-card-header">
                          <div className="role-checkbox">
                            <input
                              type="checkbox"
                              checked={formData.roleIds.includes(rol.id)}
                              onChange={() => {}}
                              readOnly
                            />
                            <span className="checkmark"></span>
                          </div>
                          <div className="role-info">
                            <h4 className="role-name">
                              {rol.nombre}
                              {rol.esSistema && (
                                <span className="system-badge">Sistema</span>
                              )}
                            </h4>
                            {rol.descripcion && (
                              <p className="role-description">{rol.descripcion}</p>
                            )}
                          </div>
                        </div>
                        {formData.roleIds.includes(rol.id) && (
                          <div className="role-selected-indicator">
                            <span className="material-icons">check_circle</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {roles.length === 0 && (
                    <div className="empty-state">
                      <span className="material-icons">inbox</span>
                      <p>No hay roles disponibles</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="usuario-modal-footer">
            <button
              type="button"
              className="btn-secondary-modal"
              onClick={handleClose}
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
                  {mode === 'create' ? 'Crear Usuario' : 'Guardar Cambios'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UsuarioFormModal;
