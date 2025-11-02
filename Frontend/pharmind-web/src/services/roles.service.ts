import api from './api';

export interface Rol {
  id: string;
  empresaId: string;
  nombre: string;
  descripcion?: string;
  esSistema: boolean;
  activo: boolean;
  fechaCreacion: Date;
  permisos?: string[];
}

export interface CreateRolDto {
  empresaId: string;
  nombre: string;
  descripcion?: string;
  moduloIds?: string[];
}

export interface UpdateRolDto {
  nombre?: string;
  descripcion?: string;
  activo?: boolean;
  moduloIds?: string[];
}

const rolesService = {
  // Obtener todos los roles
  getAll: async (): Promise<Rol[]> => {
    const response = await api.get('/roles');
    return response.data;
  },

  // Obtener rol por ID
  getById: async (id: string): Promise<Rol> => {
    const response = await api.get(`/roles/${id}`);
    return response.data;
  },

  // Crear nuevo rol
  create: async (data: CreateRolDto): Promise<Rol> => {
    const response = await api.post('/roles', data);
    return response.data;
  },

  // Actualizar rol
  update: async (id: string, data: UpdateRolDto): Promise<Rol> => {
    const response = await api.put(`/roles/${id}`, data);
    return response.data;
  },

  // Eliminar rol (soft delete)
  delete: async (id: string): Promise<void> => {
    await api.delete(`/roles/${id}`);
  },

  // Obtener módulos asignados a un rol
  getModulos: async (id: string): Promise<any[]> => {
    const response = await api.get(`/roles/${id}/modulos`);
    return response.data;
  },

  // Asignar módulos a un rol
  assignModulos: async (id: string, moduloIds: string[]): Promise<void> => {
    await api.post(`/roles/${id}/modulos`, { moduloIds });
  }
};

export default rolesService;
