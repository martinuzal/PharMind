import api from './api';

export interface Distrito {
  id: string;
  regionId: string;
  regionNombre: string;
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

export interface CreateDistritoDto {
  regionId: string;
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

export interface UpdateDistritoDto {
  regionId: string;
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

export interface DistritoListResponse {
  items: Distrito[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

export const distritosService = {
  getAll: async (params?: {
    page?: number;
    pageSize?: number;
    regionId?: string;
    codigo?: string;
    nombre?: string;
    activo?: boolean;
  }): Promise<DistritoListResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    else queryParams.append('pageSize', '1000');
    if (params?.regionId) queryParams.append('regionId', params.regionId);
    if (params?.codigo) queryParams.append('codigo', params.codigo);
    if (params?.nombre) queryParams.append('nombre', params.nombre);
    if (params?.activo !== undefined) queryParams.append('activo', params.activo.toString());

    const response = await api.get('/Distritos?' + queryParams.toString());
    return response.data;
  },

  getById: async (id: string): Promise<Distrito> => {
    const response = await api.get('/Distritos/' + id);
    return response.data;
  },

  getByCodigo: async (codigo: string): Promise<Distrito> => {
    const response = await api.get('/Distritos/codigo/' + codigo);
    return response.data;
  },

  create: async (data: CreateDistritoDto): Promise<Distrito> => {
    const response = await api.post('/Distritos', data);
    return response.data;
  },

  update: async (id: string, data: UpdateDistritoDto): Promise<Distrito> => {
    const response = await api.put('/Distritos/' + id, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete('/Distritos/' + id);
  }
};
