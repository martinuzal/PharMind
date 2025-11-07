import api from './api';

export interface Usuario {
  id: string;
  email: string;
  nombreCompleto: string;
  empresaId: string;
  empresaNombre?: string;
  telefono?: string;
  avatar?: string;
  cargo?: string;
  departamento?: string;
  activo: boolean;
  emailVerificado: boolean;
  proveedorSSO?: string;
  fechaCreacion: Date;
  roles: string[];
  roleIds: string[];
  agenteId?: string;
  managerId?: string;
  tipoAgenteId?: string;
}

export interface CreateUsuarioDto {
  email: string;
  password: string;
  nombreCompleto: string;
  empresaId: string;
  telefono?: string;
  cargo?: string;
  departamento?: string;
  roleIds: string[];
  agenteId?: string;
  managerId?: string;
  tipoAgenteId?: string;
}

export interface UpdateUsuarioDto {
  email?: string;
  nombreCompleto?: string;
  telefono?: string;
  cargo?: string;
  departamento?: string;
  activo?: boolean;
  roleIds?: string[];
  agenteId?: string;
  managerId?: string;
  tipoAgenteId?: string;
}

export const usuariosService = {
  // Obtener todos los usuarios
  getAll: async (): Promise<Usuario[]> => {
    const response = await api.get('/usuarios?pageSize=1000');
    return response.data.usuarios || [];
  },

  // Obtener usuario por ID
  getById: async (id: string): Promise<Usuario> => {
    const response = await api.get(`/usuarios/${id}`);
    return response.data;
  },

  // Crear nuevo usuario
  create: async (data: CreateUsuarioDto): Promise<Usuario> => {
    const response = await api.post('/usuarios', data);
    return response.data;
  },

  // Actualizar usuario
  update: async (id: string, data: UpdateUsuarioDto): Promise<Usuario> => {
    const response = await api.put(`/usuarios/${id}`, data);
    return response.data;
  },

  // Eliminar usuario (soft delete)
  delete: async (id: string): Promise<void> => {
    await api.delete(`/usuarios/${id}`);
  },

  // Cambiar contraseña
  changePassword: async (id: string, newPassword: string): Promise<void> => {
    await api.post(`/usuarios/${id}/change-password`, { newPassword });
  },

  // Activar/desactivar usuario
  toggleActive: async (id: string, activo: boolean): Promise<void> => {
    await api.patch(`/usuarios/${id}/toggle-active`, { activo });
  }
};

export default usuariosService;
