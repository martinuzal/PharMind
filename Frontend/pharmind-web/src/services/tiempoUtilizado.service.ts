import api from './api';

export interface TiempoUtilizado {
  id: string;
  representanteId: string;
  representanteNombre: string;
  fecha: string;
  tipoActividadId: string;
  tipoActividadNombre: string;
  descripcion?: string;
  horasUtilizadas: number;
  minutosUtilizados: number;
  turno: string;
  tiempoTotalHoras: number;
  esRecurrente: boolean;
  observaciones?: string;
  fechaCreacion: Date;
  creadoPor?: string;
  fechaModificacion?: Date;
  modificadoPor?: string;
}

export interface CreateTiempoUtilizadoDto {
  representanteId: string;
  fecha: Date;
  tipoActividadId: string;
  descripcion?: string;
  horasUtilizadas: number;
  minutosUtilizados: number;
  turno: string;
  esRecurrente: boolean;
  observaciones?: string;
}

export interface UpdateTiempoUtilizadoDto {
  fecha: Date;
  tipoActividadId: string;
  descripcion?: string;
  horasUtilizadas: number;
  minutosUtilizados: number;
  turno: string;
  esRecurrente: boolean;
  observaciones?: string;
}

export interface TiempoUtilizadoListResponse {
  items: TiempoUtilizado[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

export interface TiempoUtilizadoEstadisticas {
  totalHorasNoPromocion: number;
  promedioHorasDiarias: number;
  totalRegistros: number;
  horasPorTipoActividad: Record<string, number>;
  registrosPorRepresentante: Record<string, number>;
}

export const tiempoUtilizadoService = {
  // Obtener todos los registros con filtros opcionales
  getAll: async (params?: {
    page?: number;
    pageSize?: number;
    representanteId?: string;
    tipoActividad?: string;
    fechaInicio?: string;
    fechaFin?: string;
  }): Promise<TiempoUtilizadoListResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    else queryParams.append('pageSize', '1000');
    if (params?.representanteId) queryParams.append('representanteId', params.representanteId);
    if (params?.tipoActividad) queryParams.append('tipoActividad', params.tipoActividad);
    if (params?.fechaInicio) queryParams.append('fechaInicio', params.fechaInicio);
    if (params?.fechaFin) queryParams.append('fechaFin', params.fechaFin);

    const response = await api.get(`/TiempoUtilizado?${queryParams.toString()}`);
    return response.data;
  },

  // Obtener registro por ID
  getById: async (id: string): Promise<TiempoUtilizado> => {
    const response = await api.get(`/TiempoUtilizado/${id}`);
    return response.data;
  },

  // Crear nuevo registro
  create: async (data: CreateTiempoUtilizadoDto): Promise<TiempoUtilizado> => {
    const response = await api.post('/TiempoUtilizado', data);
    return response.data;
  },

  // Actualizar registro
  update: async (id: string, data: UpdateTiempoUtilizadoDto): Promise<TiempoUtilizado> => {
    const response = await api.put(`/TiempoUtilizado/${id}`, data);
    return response.data;
  },

  // Eliminar registro (soft delete)
  delete: async (id: string): Promise<void> => {
    await api.delete(`/TiempoUtilizado/${id}`);
  },

  // Obtener estadísticas
  getEstadisticas: async (params?: {
    representanteId?: string;
    fechaInicio?: string;
    fechaFin?: string;
  }): Promise<TiempoUtilizadoEstadisticas> => {
    const queryParams = new URLSearchParams();
    if (params?.representanteId) queryParams.append('representanteId', params.representanteId);
    if (params?.fechaInicio) queryParams.append('fechaInicio', params.fechaInicio);
    if (params?.fechaFin) queryParams.append('fechaFin', params.fechaFin);

    const response = await api.get(`/TiempoUtilizado/estadisticas?${queryParams.toString()}`);
    return response.data;
  }
};
