// Field types for the form designer
export type FieldType =
  | 'text'
  | 'number'
  | 'email'
  | 'phone'
  | 'select'
  | 'textarea'
  | 'date'
  | 'datetime'
  | 'time'
  | 'checkbox'
  | 'radio'
  | 'file'
  | 'image'
  | 'address'
  | 'location'
  | 'signature'
  | 'rating'
  | 'tags'
  | 'slider'
  | 'color'
  | 'url'
  | 'section'
  | 'repeater';

// Layout configuration
export interface LayoutConfig {
  columns: 1 | 2 | 3 | 4;
  spacing: 'compact' | 'normal' | 'spacious';
  style: 'modern' | 'classic' | 'minimal';
}

// Position in grid
export interface FieldPosition {
  row: number;
  col: number;
}

// Span (width) in columns
export interface FieldSpan {
  cols: 1 | 2 | 3 | 4;
}

// Validation rules
export interface ValidationRules {
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  message?: string;
  custom?: string; // JavaScript validation expression
}

// Repeater field configuration
export interface RepeaterField {
  type: FieldType;
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  options?: string[] | { label: string; value: string }[];
  validation?: ValidationRules;
  // Layout properties for visual designer
  position?: FieldPosition;
  span?: FieldSpan;
  icon?: string;
}

// Repeater layout configuration
export interface RepeaterLayout {
  displayMode: 'card' | 'inline' | 'table';
  columns: 1 | 2 | 3 | 4;
  spacing?: 'compact' | 'normal' | 'spacious';
}

// Repeater configuration
export interface RepeaterConfig {
  fields: RepeaterField[];
  minItems?: number;
  maxItems?: number;
  addButtonText?: string;
  removeButtonText?: string;
  itemLabelTemplate?: string; // e.g., "Contacto {index}"
  layout?: RepeaterLayout;
}

// Field schema definition
export interface FieldSchema {
  id: string;
  name: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  defaultValue?: any;
  options?: string[] | { label: string; value: string }[];
  validation?: ValidationRules;
  helpText?: string;

  // Layout properties
  position: FieldPosition;
  span: FieldSpan;
  order: number;

  // Conditional display
  conditional?: {
    field: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
    value: any;
  };

  // UI customization
  icon?: string;
  className?: string;
  disabled?: boolean;
  hidden?: boolean;

  // Repeater-specific configuration
  repeaterConfig?: RepeaterConfig;
}

// Complete form schema
export interface FormSchema {
  fields: FieldSchema[];
  layout: LayoutConfig;
  version: number;
  metadata?: {
    createdAt?: string;
    updatedAt?: string;
    createdBy?: string;
  };
}

// Toolbox item definition
export interface ToolboxItem {
  id: string;
  type: FieldType;
  label: string;
  icon: string;
  description: string;
  category: 'basic' | 'advanced' | 'specialized';
  defaultConfig: Partial<FieldSchema>;
}

// Preview device types
export type PreviewDevice = 'desktop' | 'tablet' | 'mobile';

// Preview mode
export type PreviewMode = 'web' | 'mobile-app';
