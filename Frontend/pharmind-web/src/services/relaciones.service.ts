import api from './api';

export interface Relacion {
  id: string;
  codigoRelacion: string;
  agenteId: string;
  agenteNombre: string;
  clientePrincipalId: string;
  clientePrincipalNombre: string;
  clienteSecundario1Id?: string;
  clienteSecundario1Nombre?: string;
  clienteSecundario2Id?: string;
  clienteSecundario2Nombre?: string;
  tipoRelacion?: string;
  fechaInicio: string;
  fechaFin?: string;
  estado: string;
  frecuenciaVisitas?: string;
  prioridad?: string;
  observaciones?: string;
  fechaCreacion: Date;
  creadoPor?: string;
  fechaModificacion?: Date;
  modificadoPor?: string;
}

export interface CreateRelacionDto {
  codigoRelacion: string;
  agenteId: string;
  clientePrincipalId: string;
  clienteSecundario1Id?: string;
  clienteSecundario2Id?: string;
  tipoRelacion?: string;
  fechaInicio?: Date;
  fechaFin?: Date;
  estado?: string;
  frecuenciaVisitas?: string;
  prioridad?: string;
  observaciones?: string;
}

export interface UpdateRelacionDto {
  clienteSecundario1Id?: string;
  clienteSecundario2Id?: string;
  tipoRelacion?: string;
  fechaInicio: Date;
  fechaFin?: Date;
  estado?: string;
  frecuenciaVisitas?: string;
  prioridad?: string;
  observaciones?: string;
}

export interface RelacionListResponse {
  items: Relacion[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

export const relacionesService = {
  // Obtener todas las relaciones con filtros opcionales
  getAll: async (params?: {
    page?: number;
    pageSize?: number;
    codigoRelacion?: string;
    agenteId?: string;
    clienteId?: string;
    tipoRelacion?: string;
    estado?: string;
    prioridad?: string;
    fechaInicio?: string;
    fechaFin?: string;
  }): Promise<RelacionListResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    else queryParams.append('pageSize', '1000');
    if (params?.codigoRelacion) queryParams.append('codigoRelacion', params.codigoRelacion);
    if (params?.agenteId) queryParams.append('agenteId', params.agenteId);
    if (params?.clienteId) queryParams.append('clienteId', params.clienteId);
    if (params?.tipoRelacion) queryParams.append('tipoRelacion', params.tipoRelacion);
    if (params?.estado) queryParams.append('estado', params.estado);
    if (params?.prioridad) queryParams.append('prioridad', params.prioridad);
    if (params?.fechaInicio) queryParams.append('fechaInicio', params.fechaInicio);
    if (params?.fechaFin) queryParams.append('fechaFin', params.fechaFin);

    const response = await api.get(`/Relaciones?${queryParams.toString()}`);
    return response.data;
  },

  // Obtener relación por ID
  getById: async (id: string): Promise<Relacion> => {
    const response = await api.get(`/Relaciones/${id}`);
    return response.data;
  },

  // Obtener relación por código
  getByCodigo: async (codigo: string): Promise<Relacion> => {
    const response = await api.get(`/Relaciones/codigo/${codigo}`);
    return response.data;
  },

  // Crear nueva relación
  create: async (data: CreateRelacionDto): Promise<Relacion> => {
    const response = await api.post('/Relaciones', data);
    return response.data;
  },

  // Actualizar relación
  update: async (id: string, data: UpdateRelacionDto): Promise<Relacion> => {
    const response = await api.put(`/Relaciones/${id}`, data);
    return response.data;
  },

  // Eliminar relación (soft delete)
  delete: async (id: string): Promise<void> => {
    await api.delete(`/Relaciones/${id}`);
  },

  // Obtener relaciones por agente
  getByAgente: async (agenteId: string, params?: {
    page?: number;
    pageSize?: number;
    estado?: string;
  }): Promise<RelacionListResponse> => {
    const queryParams = new URLSearchParams();
    queryParams.append('agenteId', agenteId);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    else queryParams.append('pageSize', '1000');
    if (params?.estado) queryParams.append('estado', params.estado);

    const response = await api.get(`/Relaciones?${queryParams.toString()}`);
    return response.data;
  },

  // Obtener relaciones por cliente
  getByCliente: async (clienteId: string, params?: {
    page?: number;
    pageSize?: number;
    estado?: string;
  }): Promise<RelacionListResponse> => {
    const queryParams = new URLSearchParams();
    queryParams.append('clienteId', clienteId);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    else queryParams.append('pageSize', '1000');
    if (params?.estado) queryParams.append('estado', params.estado);

    const response = await api.get(`/Relaciones?${queryParams.toString()}`);
    return response.data;
  },

  // Obtener relaciones activas
  getActivas: async (params?: {
    page?: number;
    pageSize?: number;
    agenteId?: string;
  }): Promise<RelacionListResponse> => {
    const queryParams = new URLSearchParams();
    queryParams.append('estado', 'Activa');
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    else queryParams.append('pageSize', '1000');
    if (params?.agenteId) queryParams.append('agenteId', params.agenteId);

    const response = await api.get(`/Relaciones?${queryParams.toString()}`);
    return response.data;
  },

  // Obtener relaciones por prioridad
  getByPrioridad: async (prioridad: string, params?: {
    page?: number;
    pageSize?: number;
    agenteId?: string;
  }): Promise<RelacionListResponse> => {
    const queryParams = new URLSearchParams();
    queryParams.append('prioridad', prioridad);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    else queryParams.append('pageSize', '1000');
    if (params?.agenteId) queryParams.append('agenteId', params.agenteId);

    const response = await api.get(`/Relaciones?${queryParams.toString()}`);
    return response.data;
  }
};
