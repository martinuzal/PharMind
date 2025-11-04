import api from './api';

export interface LineaNegocio {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  legacyCode?: string;
  legajo?: string;
  color?: string;
  icono?: string;
  activo: boolean;
  orden?: number;
  cantidadAgentes: number;
  fechaCreacion: Date;
  fechaModificacion?: Date;
}

export interface CreateLineaNegocioDto {
  codigo: string;
  nombre: string;
  descripcion?: string;
  legacyCode?: string;
  legajo?: string;
  color?: string;
  icono?: string;
  activo?: boolean;
  orden?: number;
}

export interface UpdateLineaNegocioDto {
  codigo: string;
  nombre: string;
  descripcion?: string;
  legacyCode?: string;
  legajo?: string;
  color?: string;
  icono?: string;
  activo?: boolean;
  orden?: number;
}

export interface LineaNegocioListResponse {
  items: LineaNegocio[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

export const lineasNegocioService = {
  getAll: async (params?: {
    page?: number;
    pageSize?: number;
    codigo?: string;
    nombre?: string;
    activo?: boolean;
  }): Promise<LineaNegocioListResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    else queryParams.append('pageSize', '1000');
    if (params?.codigo) queryParams.append('codigo', params.codigo);
    if (params?.nombre) queryParams.append('nombre', params.nombre);
    if (params?.activo !== undefined) queryParams.append('activo', params.activo.toString());

    const response = await api.get('/LineasNegocio?' + queryParams.toString());
    return response.data;
  },

  getById: async (id: string): Promise<LineaNegocio> => {
    const response = await api.get('/LineasNegocio/' + id);
    return response.data;
  },

  getByCodigo: async (codigo: string): Promise<LineaNegocio> => {
    const response = await api.get('/LineasNegocio/codigo/' + codigo);
    return response.data;
  },

  create: async (data: CreateLineaNegocioDto): Promise<LineaNegocio> => {
    const response = await api.post('/LineasNegocio', data);
    return response.data;
  },

  update: async (id: string, data: UpdateLineaNegocioDto): Promise<LineaNegocio> => {
    const response = await api.put('/LineasNegocio/' + id, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete('/LineasNegocio/' + id);
  }
};
