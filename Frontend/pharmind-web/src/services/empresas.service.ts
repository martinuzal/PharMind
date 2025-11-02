import api from './api';

export interface Empresa {
  id: string;
  nombre: string;
  razonSocial: string;
  cuit?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  logo?: string;
  activo: boolean;
  fechaCreacion: Date;
}

export interface CreateEmpresaDto {
  nombre: string;
  razonSocial: string;
  cuit?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  logo?: string;
}

export interface UpdateEmpresaDto {
  nombre?: string;
  razonSocial?: string;
  cuit?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  logo?: string;
  activo?: boolean;
}

const empresasService = {
  // Obtener todas las empresas
  getAll: async (): Promise<Empresa[]> => {
    const response = await api.get('/empresas');
    return response.data;
  },

  // Obtener empresa por ID
  getById: async (id: string): Promise<Empresa> => {
    const response = await api.get(`/empresas/${id}`);
    return response.data;
  },

  // Crear nueva empresa
  create: async (data: CreateEmpresaDto): Promise<Empresa> => {
    const response = await api.post('/empresas', data);
    return response.data;
  },

  // Actualizar empresa
  update: async (id: string, data: UpdateEmpresaDto): Promise<Empresa> => {
    const response = await api.put(`/empresas/${id}`, data);
    return response.data;
  },

  // Eliminar empresa (soft delete)
  delete: async (id: string): Promise<void> => {
    await api.delete(`/empresas/${id}`);
  },

  // Activar/desactivar empresa
  toggleActive: async (id: string, activo: boolean): Promise<void> => {
    await api.patch(`/empresas/${id}/toggle-active`, { activo });
  }
};

export default empresasService;
