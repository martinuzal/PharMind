import api from './api';

export interface Agente {
  id: string;
  tipoAgenteId: string;
  tipoAgenteNombre?: string;
  codigoAgente: string;
  nombre: string;
  apellido?: string;
  email?: string;
  telefono?: string;
  regionId?: string;
  regionNombre?: string;
  distritoId?: string;
  distritoNombre?: string;
  lineaNegocioId?: string;
  lineaNegocioNombre?: string;
  managerId?: string;
  managerNombre?: string;
  fechaIngreso?: string;
  activo: boolean;
  observaciones?: string;
  fechaCreacion: Date;
  creadoPor?: string;
  fechaModificacion?: Date;
  modificadoPor?: string;
}

export interface CreateAgenteDto {
  codigoAgente: string;
  nombre: string;
  codigoDistrito?: string;
  distritoNombre?: string;
  codigoLineaNegocio?: string;
  lineaNegocioNombre?: string;
  email?: string;
  telefono?: string;
  zonaGeografica?: string;
  supervisorId?: string;
  fechaIngreso?: Date;
  estado?: string;
}

export interface UpdateAgenteDto {
  nombre: string;
  codigoDistrito?: string;
  distritoNombre?: string;
  codigoLineaNegocio?: string;
  lineaNegocioNombre?: string;
  email?: string;
  telefono?: string;
  zonaGeografica?: string;
  supervisorId?: string;
  fechaIngreso?: Date;
  estado?: string;
}

export interface AgenteListResponse {
  items: Agente[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

export interface AuditoriaAgente {
  id: string;
  agenteId: string;
  agenteNombre: string;
  tipoOperacion: string;
  campoModificado?: string;
  valorAnterior?: string;
  valorNuevo?: string;
  descripcion?: string;
  fechaOperacion: Date;
  usuarioOperacion: string;
  direccionIP?: string;
}

export const agentesService = {
  // Obtener todos los agentes con filtros opcionales
  getAll: async (params?: {
    page?: number;
    pageSize?: number;
    codigoAgente?: string;
    nombre?: string;
    codigoDistrito?: string;
    codigoLineaNegocio?: string;
    supervisorId?: string;
    estado?: string;
  }): Promise<AgenteListResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    else queryParams.append('pageSize', '1000');
    if (params?.codigoAgente) queryParams.append('codigoAgente', params.codigoAgente);
    if (params?.nombre) queryParams.append('nombre', params.nombre);
    if (params?.codigoDistrito) queryParams.append('codigoDistrito', params.codigoDistrito);
    if (params?.codigoLineaNegocio) queryParams.append('codigoLineaNegocio', params.codigoLineaNegocio);
    if (params?.supervisorId) queryParams.append('supervisorId', params.supervisorId);
    if (params?.estado) queryParams.append('estado', params.estado);

    const response = await api.get(`/Agentes?${queryParams.toString()}`);
    return response.data;
  },

  // Obtener agente por ID
  getById: async (id: string): Promise<Agente> => {
    const response = await api.get(`/Agentes/${id}`);
    return response.data;
  },

  // Obtener agente por código
  getByCodigo: async (codigo: string): Promise<Agente> => {
    const response = await api.get(`/Agentes/codigo/${codigo}`);
    return response.data;
  },

  // Crear nuevo agente
  create: async (data: CreateAgenteDto): Promise<Agente> => {
    const response = await api.post('/Agentes', data);
    return response.data;
  },

  // Actualizar agente
  update: async (id: string, data: UpdateAgenteDto): Promise<Agente> => {
    const response = await api.put(`/Agentes/${id}`, data);
    return response.data;
  },

  // Eliminar agente (soft delete)
  delete: async (id: string): Promise<void> => {
    await api.delete(`/Agentes/${id}`);
  },

  // Obtener auditoría de un agente
  getAuditoria: async (agenteId: string, params?: {
    page?: number;
    pageSize?: number;
    fechaInicio?: string;
    fechaFin?: string;
  }): Promise<{ items: AuditoriaAgente[], totalItems: number }> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params?.fechaInicio) queryParams.append('fechaInicio', params.fechaInicio);
    if (params?.fechaFin) queryParams.append('fechaFin', params.fechaFin);

    const response = await api.get(`/Agentes/${agenteId}/auditoria?${queryParams.toString()}`);
    return response.data;
  },

  // Obtener agentes por supervisor
  getBySupervisor: async (supervisorId: string, params?: {
    page?: number;
    pageSize?: number;
  }): Promise<AgenteListResponse> => {
    const queryParams = new URLSearchParams();
    queryParams.append('supervisorId', supervisorId);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    else queryParams.append('pageSize', '1000');

    const response = await api.get(`/Agentes?${queryParams.toString()}`);
    return response.data;
  }
};
