import api from './api';

export interface Manager {
  id: string;
  usuarioId: string;
  usuarioNombre: string;
  codigo: string;
  nombre: string;
  apellido?: string;
  email?: string;
  telefono?: string;
  cargo?: string;
  fechaIngreso?: string;
  legacyCode?: string;
  legajo?: string;
  activo: boolean;
  observaciones?: string;
  fechaCreacion: Date;
  fechaModificacion?: Date;
  regionIds: string[];
  distritoIds: string[];
  lineaNegocioIds: string[];
  cantidadRegiones: number;
  cantidadDistritos: number;
  cantidadLineasNegocio: number;
}

export interface CreateManagerDto {
  usuarioId: string;
  codigo: string;
  nombre: string;
  apellido?: string;
  email?: string;
  telefono?: string;
  cargo?: string;
  fechaIngreso?: Date;
  legacyCode?: string;
  legajo?: string;
  activo?: boolean;
  observaciones?: string;
  regionIds?: string[];
  distritoIds?: string[];
  lineaNegocioIds?: string[];
}

export interface UpdateManagerDto {
  codigo: string;
  nombre: string;
  apellido?: string;
  email?: string;
  telefono?: string;
  cargo?: string;
  fechaIngreso?: Date;
  legacyCode?: string;
  legajo?: string;
  activo?: boolean;
  observaciones?: string;
  regionIds?: string[];
  distritoIds?: string[];
  lineaNegocioIds?: string[];
}

export interface ManagerListResponse {
  items: Manager[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

export const managersService = {
  getAll: async (params?: {
    page?: number;
    pageSize?: number;
    codigo?: string;
    nombre?: string;
    cargo?: string;
    activo?: boolean;
  }): Promise<ManagerListResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    else queryParams.append('pageSize', '1000');
    if (params?.codigo) queryParams.append('codigo', params.codigo);
    if (params?.nombre) queryParams.append('nombre', params.nombre);
    if (params?.cargo) queryParams.append('cargo', params.cargo);
    if (params?.activo !== undefined) queryParams.append('activo', params.activo.toString());

    const response = await api.get('/Managers?' + queryParams.toString());
    return response.data;
  },

  getById: async (id: string): Promise<Manager> => {
    const response = await api.get('/Managers/' + id);
    return response.data;
  },

  getByCodigo: async (codigo: string): Promise<Manager> => {
    const response = await api.get('/Managers/codigo/' + codigo);
    return response.data;
  },

  create: async (data: CreateManagerDto): Promise<Manager> => {
    const response = await api.post('/Managers', data);
    return response.data;
  },

  update: async (id: string, data: UpdateManagerDto): Promise<Manager> => {
    const response = await api.put('/Managers/' + id, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete('/Managers/' + id);
  }
};
