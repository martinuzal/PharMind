import api from './api';

export interface Region {
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
  cantidadDistritos: number;
  cantidadAgentes: number;
  fechaCreacion: Date;
  fechaModificacion?: Date;
}

export interface CreateRegionDto {
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

export interface UpdateRegionDto {
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

export interface RegionListResponse {
  items: Region[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

export const regionesService = {
  getAll: async (params?: {
    page?: number;
    pageSize?: number;
    codigo?: string;
    nombre?: string;
    activo?: boolean;
  }): Promise<RegionListResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    else queryParams.append('pageSize', '1000');
    if (params?.codigo) queryParams.append('codigo', params.codigo);
    if (params?.nombre) queryParams.append('nombre', params.nombre);
    if (params?.activo !== undefined) queryParams.append('activo', params.activo.toString());

    const response = await api.get('/Regiones?' + queryParams.toString());
    return response.data;
  },

  getById: async (id: string): Promise<Region> => {
    const response = await api.get('/Regiones/' + id);
    return response.data;
  },

  getByCodigo: async (codigo: string): Promise<Region> => {
    const response = await api.get('/Regiones/codigo/' + codigo);
    return response.data;
  },

  create: async (data: CreateRegionDto): Promise<Region> => {
    const response = await api.post('/Regiones', data);
    return response.data;
  },

  update: async (id: string, data: UpdateRegionDto): Promise<Region> => {
    const response = await api.put('/Regiones/' + id, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete('/Regiones/' + id);
  }
};
