import api from './api';

export interface Modulo {
  id: string;
  nombre: string;
  descripcion?: string;
  icono?: string;
  ruta?: string;
  orden: number;
  activo: boolean;
  esSistema: boolean;
  fechaCreacion: Date;
}

export interface CreateModuloDto {
  nombre: string;
  descripcion?: string;
  icono?: string;
  ruta?: string;
  orden: number;
}

export interface UpdateModuloDto {
  nombre?: string;
  descripcion?: string;
  icono?: string;
  ruta?: string;
  orden?: number;
  activo?: boolean;
}

export const modulosService = {
  // Obtener todos los módulos
  getAll: async (): Promise<Modulo[]> => {
    const response = await api.get('/modulos');
    return response.data;
  },

  // Obtener módulo por ID
  getById: async (id: string): Promise<Modulo> => {
    const response = await api.get(`/modulos/${id}`);
    return response.data;
  },

  // Crear nuevo módulo
  create: async (data: CreateModuloDto): Promise<Modulo> => {
    const response = await api.post('/modulos', data);
    return response.data;
  },

  // Actualizar módulo
  update: async (id: string, data: UpdateModuloDto): Promise<Modulo> => {
    const response = await api.put(`/modulos/${id}`, data);
    return response.data;
  },

  // Eliminar módulo (soft delete)
  delete: async (id: string): Promise<void> => {
    await api.delete(`/modulos/${id}`);
  },

  // Activar/desactivar módulo
  toggleActive: async (id: string, activo: boolean): Promise<void> => {
    await api.patch(`/modulos/${id}/toggle-active`, { activo });
  }
};

export default modulosService;
