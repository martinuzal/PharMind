// ==================== CITA ====================

export interface Cita {
  id: string;
  codigoCita: string;
  agenteId: string;
  agenteNombre?: string;
  relacionId?: string;
  clienteId?: string;
  clienteNombre?: string;
  interaccionId?: string;
  titulo: string;
  descripcion?: string;
  fechaInicio: Date;
  fechaFin: Date;
  todoElDia: boolean;
  tipoCita?: string;
  estado: string;
  prioridad?: string;
  ubicacion?: string;
  latitud?: number;
  longitud?: number;
  color?: string;
  recordatorio: boolean;
  minutosAntes: number;
  notas?: string;
  orden?: number;
  distanciaKm?: number;
  tiempoEstimadoMinutos?: number;
  fechaCreacion: Date;
  // Helpers calculados
  esHoy: boolean;
  yaPaso: boolean;
  enProgreso: boolean;
  duracionMinutos: number;
}

export interface CreateCitaDto {
  agenteId: string;
  relacionId?: string;
  clienteId?: string;
  titulo: string;
  descripcion?: string;
  fechaInicio: Date;
  fechaFin: Date;
  todoElDia?: boolean;
  tipoCita?: string;
  estado?: string;
  prioridad?: string;
  ubicacion?: string;
  latitud?: number;
  longitud?: number;
  color?: string;
  recordatorio?: boolean;
  minutosAntes?: number;
  notas?: string;
}

export interface UpdateCitaDto {
  titulo?: string;
  descripcion?: string;
  fechaInicio?: Date;
  fechaFin?: Date;
  todoElDia?: boolean;
  tipoCita?: string;
  estado?: string;
  prioridad?: string;
  ubicacion?: string;
  latitud?: number;
  longitud?: number;
  color?: string;
  recordatorio?: boolean;
  minutosAntes?: number;
  notas?: string;
  orden?: number;
  distanciaKm?: number;
  tiempoEstimadoMinutos?: number;
}

export interface CambiarEstadoCitaDto {
  estado: string; // Programada, Completada, Cancelada, Reprogramada
}

export interface CompletarCitaDto {
  interaccionId: string;
}

export interface CitaFiltrosDto {
  agenteId?: string;
  desde?: Date;
  hasta?: Date;
  estado?: string;
  tipoCita?: string;
  prioridad?: string;
}

// Estados de cita
export const EstadosCita = {
  PROGRAMADA: 'Programada',
  COMPLETADA: 'Completada',
  CANCELADA: 'Cancelada',
  REPROGRAMADA: 'Reprogramada',
  NO_REALIZADA: 'NoRealizada'
} as const;

// Tipos de cita
export const TiposCita = {
  VISITA: 'Visita',
  LLAMADA: 'Llamada',
  EVENTO: 'Evento',
  REUNION: 'Reunión',
  OTRO: 'Otro'
} as const;

// Prioridades
export const Prioridades = {
  ALTA: 'Alta',
  MEDIA: 'Media',
  BAJA: 'Baja'
} as const;

// Colores para el calendario
export const ColoresCita = {
  AZUL: '#3B82F6',
  VERDE: '#10B981',
  AMARILLO: '#F59E0B',
  ROJO: '#EF4444',
  MORADO: '#8B5CF6',
  ROSA: '#EC4899',
  CYAN: '#06B6D4',
  GRIS: '#6B7280'
} as const;
