// Types for Dynamic Entity System

export interface EsquemaPersonalizado {
  id: string;
  empresaId?: string;
  entidadTipo: string;
  subTipo?: string;
  nombre: string;
  descripcion?: string;
  icono?: string;
  color?: string;
  schema: string;
  reglasValidacion?: string;
  reglasCorrelacion?: string;
  configuracionUI?: string;
  version?: number;
  activo: boolean;
  orden?: number;
}

export interface EntidadDinamica {
  id?: string;
  esquemaId: string;
  empresaId?: string;
  usuarioId?: string;
  datos: string; // JSON string
  fullDescription?: string;
  estado?: string;
  tags?: string;
  fechaCreacion?: string;
  creadoPor?: string;
  fechaModificacion?: string;
  modificadoPor?: string;
  status?: boolean;
}

export interface SchemaField {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  defaultValue?: any;
  validation?: any;
  options?: Array<{ value: string; label: string }>;
  multiple?: boolean;
  min?: number;
  max?: number;
  step?: number;
  rows?: number;
  accept?: string;
  fields?: SchemaField[]; // For nested fields
  [key: string]: any;
}
