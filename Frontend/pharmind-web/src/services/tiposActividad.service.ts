import api from './api';

export interface TipoActividad {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  clasificacion: string; // 'Laboral' | 'ExtraLaboral'
  color?: string;
  icono?: string;
  activo: boolean;
  esSistema: boolean;
  orden?: number;
  cantidadUsos: number;
  fechaCreacion: Date;
}

export interface CreateTipoActividadDto {
  codigo: string;
  nombre: string;
  descripcion?: string;
  clasificacion: string;
  color?: string;
  icono?: string;
  orden?: number;
}

export interface UpdateTipoActividadDto {
  codigo: string;
  nombre: string;
  descripcion?: string;
  clasificacion: string;
  color?: string;
  icono?: string;
  activo: boolean;
  orden?: number;
}

export interface TipoActividadListResponse {
  items: TipoActividad[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

export const tiposActividadService = {
  // Obtener todos los tipos de actividad con filtros opcionales
  getAll: async (params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    clasificacion?: string;
    activo?: boolean;
  }): Promise<TipoActividadListResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    else queryParams.append('pageSize', '1000');
    if (params?.search) queryParams.append('search', params.search);
    if (params?.clasificacion) queryParams.append('clasificacion', params.clasificacion);
    if (params?.activo !== undefined) queryParams.append('activo', params.activo.toString());

    const response = await api.get(`/TiposActividad?${queryParams.toString()}`);
    return response.data;
  },

  // Obtener tipo de actividad por ID
  getById: async (id: string): Promise<TipoActividad> => {
    const response = await api.get(`/TiposActividad/${id}`);
    return response.data;
  },

  // Crear nuevo tipo de actividad
  create: async (data: CreateTipoActividadDto): Promise<TipoActividad> => {
    const response = await api.post('/TiposActividad', data);
    return response.data;
  },

  // Actualizar tipo de actividad
  update: async (id: string, data: UpdateTipoActividadDto): Promise<TipoActividad> => {
    const response = await api.put(`/TiposActividad/${id}`, data);
    return response.data;
  },

  // Eliminar tipo de actividad (soft delete)
  delete: async (id: string): Promise<void> => {
    await api.delete(`/TiposActividad/${id}`);
  }
};
