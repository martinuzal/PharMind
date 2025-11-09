import api from './api';

export interface Direccion {
  id: string;
  calle?: string;
  numero?: string;
  ciudad?: string;
  provincia?: string;
  codigoPostal?: string;
  pais?: string;
}

export interface Cliente {
  id: string;
  codigoCliente: string;
  tipoCliente: string;
  razonSocial: string;
  especialidad?: string;
  categoria?: string;
  segmento?: string;
  institucionId?: string;
  institucionNombre?: string;
  email?: string;
  telefono?: string;
  direccionId?: string;
  direccion?: Direccion;
  codigoAudit?: string;
  estado: string;
  fechaCreacion: Date;
  creadoPor?: string;
  fechaModificacion?: Date;
  modificadoPor?: string;
}

export interface CreateClienteDto {
  codigoCliente: string;
  tipoCliente: string;
  razonSocial: string;
  especialidad?: string;
  categoria?: string;
  segmento?: string;
  institucionId?: string;
  email?: string;
  telefono?: string;
  direccionId?: string;
  codigoAudit?: string;
  estado?: string;
}

export interface UpdateClienteDto {
  tipoCliente: string;
  razonSocial: string;
  especialidad?: string;
  categoria?: string;
  segmento?: string;
  institucionId?: string;
  email?: string;
  telefono?: string;
  direccionId?: string;
  codigoAudit?: string;
  estado?: string;
}

export interface ClienteListResponse {
  items: Cliente[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

export const clientesService = {
  // Obtener todos los clientes con filtros opcionales
  getAll: async (params?: {
    page?: number;
    pageSize?: number;
    codigoCliente?: string;
    tipoCliente?: string;
    razonSocial?: string;
    especialidad?: string;
    categoria?: string;
    segmento?: string;
    institucionId?: string;
    estado?: string;
  }): Promise<ClienteListResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    else queryParams.append('pageSize', '1000');
    if (params?.codigoCliente) queryParams.append('codigoCliente', params.codigoCliente);
    if (params?.tipoCliente) queryParams.append('tipoCliente', params.tipoCliente);
    if (params?.razonSocial) queryParams.append('razonSocial', params.razonSocial);
    if (params?.especialidad) queryParams.append('especialidad', params.especialidad);
    if (params?.categoria) queryParams.append('categoria', params.categoria);
    if (params?.segmento) queryParams.append('segmento', params.segmento);
    if (params?.institucionId) queryParams.append('institucionId', params.institucionId);
    if (params?.estado) queryParams.append('estado', params.estado);

    const response = await api.get(`/Clientes?${queryParams.toString()}`);
    return response.data;
  },

  // Obtener cliente por ID
  getById: async (id: string): Promise<Cliente> => {
    const response = await api.get(`/Clientes/${id}`);
    return response.data;
  },

  // Obtener cliente por código
  getByCodigo: async (codigo: string): Promise<Cliente> => {
    const response = await api.get(`/Clientes/codigo/${codigo}`);
    return response.data;
  },

  // Crear nuevo cliente
  create: async (data: CreateClienteDto): Promise<Cliente> => {
    const response = await api.post('/Clientes', data);
    return response.data;
  },

  // Actualizar cliente
  update: async (id: string, data: UpdateClienteDto): Promise<Cliente> => {
    const response = await api.put(`/Clientes/${id}`, data);
    return response.data;
  },

  // Eliminar cliente (soft delete)
  delete: async (id: string): Promise<void> => {
    await api.delete(`/Clientes/${id}`);
  },

  // Obtener clientes por tipo
  getByTipo: async (tipoCliente: string, params?: {
    page?: number;
    pageSize?: number;
  }): Promise<ClienteListResponse> => {
    const queryParams = new URLSearchParams();
    queryParams.append('tipoCliente', tipoCliente);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    else queryParams.append('pageSize', '1000');

    const response = await api.get(`/Clientes?${queryParams.toString()}`);
    return response.data;
  },

  // Obtener clientes por institución
  getByInstitucion: async (institucionId: string, params?: {
    page?: number;
    pageSize?: number;
  }): Promise<ClienteListResponse> => {
    const queryParams = new URLSearchParams();
    queryParams.append('institucionId', institucionId);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    else queryParams.append('pageSize', '1000');

    const response = await api.get(`/Clientes?${queryParams.toString()}`);
    return response.data;
  },

  // Obtener clientes por especialidad
  getByEspecialidad: async (especialidad: string, params?: {
    page?: number;
    pageSize?: number;
  }): Promise<ClienteListResponse> => {
    const queryParams = new URLSearchParams();
    queryParams.append('especialidad', especialidad);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    else queryParams.append('pageSize', '1000');

    const response = await api.get(`/Clientes?${queryParams.toString()}`);
    return response.data;
  }
};
