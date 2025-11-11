import api from './api';
import type {
  Cita,
  CreateCitaDto,
  UpdateCitaDto,
  CambiarEstadoCitaDto,
  CompletarCitaDto,
  CitaFiltrosDto
} from '../types/citas';

const citasService = {
  // ==================== CITAS ====================

  // Obtener citas con filtros
  getAll: async (filtros?: CitaFiltrosDto): Promise<Cita[]> => {
    const params = new URLSearchParams();

    if (filtros?.agenteId) params.append('agenteId', filtros.agenteId);
    if (filtros?.desde) params.append('desde', filtros.desde.toISOString());
    if (filtros?.hasta) params.append('hasta', filtros.hasta.toISOString());
    if (filtros?.estado) params.append('estado', filtros.estado);
    if (filtros?.tipoCita) params.append('tipoCita', filtros.tipoCita);
    if (filtros?.prioridad) params.append('prioridad', filtros.prioridad);

    const response = await api.get(`/citas?${params.toString()}`);
    return response.data;
  },

  // Obtener cita por ID
  getById: async (id: string): Promise<Cita> => {
    const response = await api.get(`/citas/${id}`);
    return response.data;
  },

  // Obtener citas de un agente
  getCitasAgente: async (agenteId: string, filtros?: Omit<CitaFiltrosDto, 'agenteId'>): Promise<Cita[]> => {
    const params = new URLSearchParams();
    params.append('agenteId', agenteId);

    if (filtros?.desde) params.append('desde', filtros.desde.toISOString());
    if (filtros?.hasta) params.append('hasta', filtros.hasta.toISOString());
    if (filtros?.estado) params.append('estado', filtros.estado);
    if (filtros?.tipoCita) params.append('tipoCita', filtros.tipoCita);
    if (filtros?.prioridad) params.append('prioridad', filtros.prioridad);

    const response = await api.get(`/citas?${params.toString()}`);
    return response.data;
  },

  // Obtener citas del mes actual para un agente
  getCitasMes: async (agenteId: string, year: number, month: number): Promise<Cita[]> => {
    const desde = new Date(year, month, 1);
    const hasta = new Date(year, month + 1, 0, 23, 59, 59);

    return citasService.getCitasAgente(agenteId, { desde, hasta });
  },

  // Obtener citas del día para un agente
  getCitasDelDia: async (agenteId: string, fecha: Date): Promise<Cita[]> => {
    const desde = new Date(fecha);
    desde.setHours(0, 0, 0, 0);

    const hasta = new Date(fecha);
    hasta.setHours(23, 59, 59, 999);

    return citasService.getCitasAgente(agenteId, { desde, hasta });
  },

  // Obtener citas próximas (siguientes 7 días)
  getCitasProximas: async (agenteId: string): Promise<Cita[]> => {
    const desde = new Date();
    const hasta = new Date();
    hasta.setDate(hasta.getDate() + 7);

    return citasService.getCitasAgente(agenteId, { desde, hasta, estado: 'Programada' });
  },

  // Crear nueva cita
  create: async (data: CreateCitaDto): Promise<Cita> => {
    const response = await api.post('/citas', data);
    return response.data;
  },

  // Actualizar cita
  update: async (id: string, data: UpdateCitaDto): Promise<Cita> => {
    const response = await api.put(`/citas/${id}`, data);
    return response.data;
  },

  // Cambiar estado de la cita
  cambiarEstado: async (id: string, data: CambiarEstadoCitaDto): Promise<Cita> => {
    const response = await api.patch(`/citas/${id}/estado`, data);
    return response.data;
  },

  // Completar cita (vincular con interacción)
  completar: async (id: string, data: CompletarCitaDto): Promise<Cita> => {
    const response = await api.post(`/citas/${id}/completar`, data);
    return response.data;
  },

  // Eliminar cita (soft delete)
  delete: async (id: string): Promise<void> => {
    await api.delete(`/citas/${id}`);
  },

  // Reordenar citas del día (optimizar ruta)
  reordenarCitas: async (citasIds: string[]): Promise<Cita[]> => {
    const response = await api.post('/citas/reordenar', { citasIds });
    return response.data;
  }
};

export default citasService;
