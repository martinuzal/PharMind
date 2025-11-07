import api from './api';

export interface Period {
  id?: string;
  timelineId?: string;
  nombre: string;
  codigo?: string;
  orden: number;
  fechaInicio: string;
  fechaFin: string;
  color?: string;
  descripcion?: string;
  activo: boolean;
}

export interface Timeline {
  id: string;
  nombre: string;
  descripcion?: string;
  color?: string;
  anio: number;
  activo: boolean;
  esDefault: boolean;
  fechaCreacion: string;
  creadoPor?: string;
  fechaModificacion?: string;
  modificadoPor?: string;
  periods: Period[];
}

export interface CreateTimelineDto {
  nombre: string;
  descripcion?: string;
  color?: string;
  anio: number;
  activo: boolean;
  esDefault: boolean;
  periods: Period[];
}

export interface UpdateTimelineDto {
  nombre: string;
  descripcion?: string;
  color?: string;
  anio: number;
  activo: boolean;
  esDefault: boolean;
  periods: Period[];
}

const timelinesService = {
  // Obtener todos los timelines
  async getAll(): Promise<Timeline[]> {
    const response = await api.get('/timelines');
    return response.data;
  },

  // Obtener timeline por ID
  async getById(id: string): Promise<Timeline> {
    const response = await api.get(`/timelines/${id}`);
    return response.data;
  },

  // Crear nuevo timeline
  async create(data: CreateTimelineDto): Promise<Timeline> {
    const response = await api.post('/timelines', data);
    return response.data;
  },

  // Actualizar timeline
  async update(id: string, data: UpdateTimelineDto): Promise<Timeline> {
    const response = await api.put(`/timelines/${id}`, data);
    return response.data;
  },

  // Eliminar timeline
  async delete(id: string): Promise<void> {
    await api.delete(`/timelines/${id}`);
  },

  // Establecer como default
  async setDefault(id: string): Promise<void> {
    await api.post(`/timelines/${id}/set-default`);
  },

  // Obtener agentes asignados
  async getAgentes(id: string): Promise<any[]> {
    const response = await api.get(`/timelines/${id}/agentes`);
    return response.data;
  },

  // Generar períodos mensuales para un año
  generateMonthlyPeriods(anio: number): Period[] {
    const meses = [
      { nombre: 'Enero', codigo: 'ENE', dias: 31 },
      { nombre: 'Febrero', codigo: 'FEB', dias: anio % 4 === 0 && (anio % 100 !== 0 || anio % 400 === 0) ? 29 : 28 },
      { nombre: 'Marzo', codigo: 'MAR', dias: 31 },
      { nombre: 'Abril', codigo: 'ABR', dias: 30 },
      { nombre: 'Mayo', codigo: 'MAY', dias: 31 },
      { nombre: 'Junio', codigo: 'JUN', dias: 30 },
      { nombre: 'Julio', codigo: 'JUL', dias: 31 },
      { nombre: 'Agosto', codigo: 'AGO', dias: 31 },
      { nombre: 'Septiembre', codigo: 'SEP', dias: 30 },
      { nombre: 'Octubre', codigo: 'OCT', dias: 31 },
      { nombre: 'Noviembre', codigo: 'NOV', dias: 30 },
      { nombre: 'Diciembre', codigo: 'DIC', dias: 31 }
    ];

    return meses.map((mes, index) => ({
      nombre: mes.nombre,
      codigo: mes.codigo,
      orden: index + 1,
      fechaInicio: `${anio}-${String(index + 1).padStart(2, '0')}-01`,
      fechaFin: `${anio}-${String(index + 1).padStart(2, '0')}-${String(mes.dias).padStart(2, '0')}`,
      color: '#2196F3',
      activo: true
    }));
  },

  // Generar períodos trimestrales para un año
  generateQuarterlyPeriods(anio: number): Period[] {
    return [
      {
        nombre: 'Q1 - Primer Trimestre',
        codigo: 'Q1',
        orden: 1,
        fechaInicio: `${anio}-01-01`,
        fechaFin: `${anio}-03-31`,
        color: '#4CAF50',
        activo: true
      },
      {
        nombre: 'Q2 - Segundo Trimestre',
        codigo: 'Q2',
        orden: 2,
        fechaInicio: `${anio}-04-01`,
        fechaFin: `${anio}-06-30`,
        color: '#2196F3',
        activo: true
      },
      {
        nombre: 'Q3 - Tercer Trimestre',
        codigo: 'Q3',
        orden: 3,
        fechaInicio: `${anio}-07-01`,
        fechaFin: `${anio}-09-30`,
        color: '#FF9800',
        activo: true
      },
      {
        nombre: 'Q4 - Cuarto Trimestre',
        codigo: 'Q4',
        orden: 4,
        fechaInicio: `${anio}-10-01`,
        fechaFin: `${anio}-12-31`,
        color: '#F44336',
        activo: true
      }
    ];
  },

  // Generar períodos bimestrales para un año
  generateBimonthlyPeriods(anio: number): Period[] {
    return [
      {
        nombre: 'B1 - Enero-Febrero',
        codigo: 'B1',
        orden: 1,
        fechaInicio: `${anio}-01-01`,
        fechaFin: `${anio}-02-${anio % 4 === 0 && (anio % 100 !== 0 || anio % 400 === 0) ? '29' : '28'}`,
        color: '#4CAF50',
        activo: true
      },
      {
        nombre: 'B2 - Marzo-Abril',
        codigo: 'B2',
        orden: 2,
        fechaInicio: `${anio}-03-01`,
        fechaFin: `${anio}-04-30`,
        color: '#2196F3',
        activo: true
      },
      {
        nombre: 'B3 - Mayo-Junio',
        codigo: 'B3',
        orden: 3,
        fechaInicio: `${anio}-05-01`,
        fechaFin: `${anio}-06-30`,
        color: '#9C27B0',
        activo: true
      },
      {
        nombre: 'B4 - Julio-Agosto',
        codigo: 'B4',
        orden: 4,
        fechaInicio: `${anio}-07-01`,
        fechaFin: `${anio}-08-31`,
        color: '#FF9800',
        activo: true
      },
      {
        nombre: 'B5 - Septiembre-Octubre',
        codigo: 'B5',
        orden: 5,
        fechaInicio: `${anio}-09-01`,
        fechaFin: `${anio}-10-31`,
        color: '#F44336',
        activo: true
      },
      {
        nombre: 'B6 - Noviembre-Diciembre',
        codigo: 'B6',
        orden: 6,
        fechaInicio: `${anio}-11-01`,
        fechaFin: `${anio}-12-31`,
        color: '#795548',
        activo: true
      }
    ];
  }
};

export default timelinesService;
