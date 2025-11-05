import api from './api';

export interface Interaccion {
  id: string;
  codigoInteraccion: string;
  relacionId: string;
  relacionCodigo: string;
  agenteId: string;
  agenteNombre: string;
  clienteId: string;
  clienteNombre: string;
  tipoInteraccion: string;
  fecha: string;
  turno?: string;
  duracionMinutos?: number;
  resultado?: string;
  objetivoVisita?: string;
  resumenVisita?: string;
  proximaAccion?: string;
  fechaProximaAccion?: string;
  latitud?: number;
  longitud?: number;
  observaciones?: string;
  entidadDinamicaId?: string;
  fechaCreacion: Date;
  creadoPor?: string;
  fechaModificacion?: Date;
  modificadoPor?: string;
}

export interface CreateInteraccionDto {
  codigoInteraccion: string;
  relacionId: string;
  agenteId: string;
  clienteId: string;
  tipoInteraccion: string;
  fecha?: Date;
  turno?: string;
  duracionMinutos?: number;
  resultado?: string;
  objetivoVisita?: string;
  resumenVisita?: string;
  proximaAccion?: string;
  fechaProximaAccion?: Date;
  latitud?: number;
  longitud?: number;
  observaciones?: string;
  entidadDinamicaId?: string;
}

export interface UpdateInteraccionDto {
  tipoInteraccion: string;
  fecha: Date;
  turno?: string;
  duracionMinutos?: number;
  resultado?: string;
  objetivoVisita?: string;
  resumenVisita?: string;
  proximaAccion?: string;
  fechaProximaAccion?: Date;
  latitud?: number;
  longitud?: number;
  observaciones?: string;
  entidadDinamicaId?: string;
}

export interface InteraccionListResponse {
  items: Interaccion[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

export interface InteraccionEstadisticas {
  totalInteracciones: number;
  interaccionesPorTipo: Record<string, number>;
  interaccionesPorResultado: Record<string, number>;
  duracionPromedio: number;
  interaccionesPorAgente: Record<string, number>;
  interaccionesPorCliente: Record<string, number>;
}

export const interaccionesService = {
  // Obtener todas las interacciones con filtros opcionales
  getAll: async (params?: {
    page?: number;
    pageSize?: number;
    codigoInteraccion?: string;
    relacionId?: string;
    agenteId?: string;
    clienteId?: string;
    tipoInteraccion?: string;
    resultado?: string;
    fechaInicio?: string;
    fechaFin?: string;
    turno?: string;
  }): Promise<InteraccionListResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    else queryParams.append('pageSize', '1000');
    if (params?.codigoInteraccion) queryParams.append('codigoInteraccion', params.codigoInteraccion);
    if (params?.relacionId) queryParams.append('relacionId', params.relacionId);
    if (params?.agenteId) queryParams.append('agenteId', params.agenteId);
    if (params?.clienteId) queryParams.append('clienteId', params.clienteId);
    if (params?.tipoInteraccion) queryParams.append('tipoInteraccion', params.tipoInteraccion);
    if (params?.resultado) queryParams.append('resultado', params.resultado);
    if (params?.fechaInicio) queryParams.append('fechaInicio', params.fechaInicio);
    if (params?.fechaFin) queryParams.append('fechaFin', params.fechaFin);
    if (params?.turno) queryParams.append('turno', params.turno);

    const response = await api.get(`/Interacciones?${queryParams.toString()}`);
    return response.data;
  },

  // Obtener interacción por ID
  getById: async (id: string): Promise<Interaccion> => {
    const response = await api.get(`/Interacciones/${id}`);
    return response.data;
  },

  // Obtener interacción por código
  getByCodigo: async (codigo: string): Promise<Interaccion> => {
    const response = await api.get(`/Interacciones/codigo/${codigo}`);
    return response.data;
  },

  // Crear nueva interacción
  create: async (data: CreateInteraccionDto): Promise<Interaccion> => {
    const response = await api.post('/Interacciones', data);
    return response.data;
  },

  // Actualizar interacción
  update: async (id: string, data: UpdateInteraccionDto): Promise<Interaccion> => {
    const response = await api.put(`/Interacciones/${id}`, data);
    return response.data;
  },

  // Eliminar interacción (soft delete)
  delete: async (id: string): Promise<void> => {
    await api.delete(`/Interacciones/${id}`);
  },

  // Obtener interacciones por agente
  getByAgente: async (agenteId: string, params?: {
    page?: number;
    pageSize?: number;
    fechaInicio?: string;
    fechaFin?: string;
    tipoInteraccion?: string;
  }): Promise<InteraccionListResponse> => {
    const queryParams = new URLSearchParams();
    queryParams.append('agenteId', agenteId);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    else queryParams.append('pageSize', '1000');
    if (params?.fechaInicio) queryParams.append('fechaInicio', params.fechaInicio);
    if (params?.fechaFin) queryParams.append('fechaFin', params.fechaFin);
    if (params?.tipoInteraccion) queryParams.append('tipoInteraccion', params.tipoInteraccion);

    const response = await api.get(`/Interacciones?${queryParams.toString()}`);
    return response.data;
  },

  // Obtener interacciones por cliente
  getByCliente: async (clienteId: string, params?: {
    page?: number;
    pageSize?: number;
    fechaInicio?: string;
    fechaFin?: string;
    tipoInteraccion?: string;
  }): Promise<InteraccionListResponse> => {
    const queryParams = new URLSearchParams();
    queryParams.append('clienteId', clienteId);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    else queryParams.append('pageSize', '1000');
    if (params?.fechaInicio) queryParams.append('fechaInicio', params.fechaInicio);
    if (params?.fechaFin) queryParams.append('fechaFin', params.fechaFin);
    if (params?.tipoInteraccion) queryParams.append('tipoInteraccion', params.tipoInteraccion);

    const response = await api.get(`/Interacciones?${queryParams.toString()}`);
    return response.data;
  },

  // Obtener interacciones por relación
  getByRelacion: async (relacionId: string, params?: {
    page?: number;
    pageSize?: number;
    fechaInicio?: string;
    fechaFin?: string;
  }): Promise<InteraccionListResponse> => {
    const queryParams = new URLSearchParams();
    queryParams.append('relacionId', relacionId);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    else queryParams.append('pageSize', '1000');
    if (params?.fechaInicio) queryParams.append('fechaInicio', params.fechaInicio);
    if (params?.fechaFin) queryParams.append('fechaFin', params.fechaFin);

    const response = await api.get(`/Interacciones?${queryParams.toString()}`);
    return response.data;
  },

  // Obtener interacciones por tipo
  getByTipo: async (tipoInteraccion: string, params?: {
    page?: number;
    pageSize?: number;
    agenteId?: string;
    fechaInicio?: string;
    fechaFin?: string;
  }): Promise<InteraccionListResponse> => {
    const queryParams = new URLSearchParams();
    queryParams.append('tipoInteraccion', tipoInteraccion);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    else queryParams.append('pageSize', '1000');
    if (params?.agenteId) queryParams.append('agenteId', params.agenteId);
    if (params?.fechaInicio) queryParams.append('fechaInicio', params.fechaInicio);
    if (params?.fechaFin) queryParams.append('fechaFin', params.fechaFin);

    const response = await api.get(`/Interacciones?${queryParams.toString()}`);
    return response.data;
  },

  // Obtener estadísticas de interacciones
  getEstadisticas: async (params?: {
    agenteId?: string;
    clienteId?: string;
    relacionId?: string;
    fechaInicio?: string;
    fechaFin?: string;
  }): Promise<InteraccionEstadisticas> => {
    const queryParams = new URLSearchParams();
    if (params?.agenteId) queryParams.append('agenteId', params.agenteId);
    if (params?.clienteId) queryParams.append('clienteId', params.clienteId);
    if (params?.relacionId) queryParams.append('relacionId', params.relacionId);
    if (params?.fechaInicio) queryParams.append('fechaInicio', params.fechaInicio);
    if (params?.fechaFin) queryParams.append('fechaFin', params.fechaFin);

    const response = await api.get(`/Interacciones/estadisticas?${queryParams.toString()}`);
    return response.data;
  },

  // Obtener próximas acciones pendientes
  getProximasAcciones: async (params?: {
    agenteId?: string;
    fechaInicio?: string;
    fechaFin?: string;
    page?: number;
    pageSize?: number;
  }): Promise<InteraccionListResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.agenteId) queryParams.append('agenteId', params.agenteId);
    if (params?.fechaInicio) queryParams.append('fechaInicio', params.fechaInicio);
    if (params?.fechaFin) queryParams.append('fechaFin', params.fechaFin);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    else queryParams.append('pageSize', '1000');

    const response = await api.get(`/Interacciones/proximas-acciones?${queryParams.toString()}`);
    return response.data;
  }
};
