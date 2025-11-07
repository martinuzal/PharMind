import { useState, useEffect } from 'react';
import './EntityFilterBuilder.css';

// Tipos de filtros
export type FilterType = 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'daterange' | 'boolean';

export type FilterOperator =
  | 'eq' | 'neq' | 'contains' | 'startsWith' | 'endsWith'
  | 'gt' | 'gte' | 'lt' | 'lte'
  | 'in' | 'notIn' | 'between'
  | 'isNull' | 'isNotNull';

// Configuración de filtro de campo
export interface FieldFilterConfig {
  field: string;
  label: string;
  type: FilterType;
  operators: FilterOperator[];
  defaultOperator?: FilterOperator;
  tablaMaestra?: string;
  options?: Array<{ value: any; label: string }>;
  group?: string;
  isStatic?: boolean;
  isDynamic?: boolean;
}

// Filtro activo
export interface ActiveFilter {
  id: string;
  field: string;
  label: string;
  operator: FilterOperator;
  value: any;
  value2?: any;
  logicalOperator?: 'AND' | 'OR';
}

interface EntityFilterBuilderProps {
  esquema: any; // Esquema de la entidad
  onFiltersChange: (filters: ActiveFilter[]) => void;
  initialFilters?: ActiveFilter[];
}

const EntityFilterBuilder = ({ esquema, onFiltersChange, initialFilters = [] }: EntityFilterBuilderProps) => {
  const [availableFields, setAvailableFields] = useState<FieldFilterConfig[]>([]);
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>(initialFilters);
  const [showFieldSelector, setShowFieldSelector] = useState(false);

  // Generar campos filtrables desde el esquema
  useEffect(() => {
    if (!esquema) return;

    const fields: FieldFilterConfig[] = [];
    const schema = typeof esquema.schema === 'string' ? JSON.parse(esquema.schema) : esquema.schema;

    console.log('Schema completo:', schema);
    console.log('Tipo entidad:', esquema.tipoEntidad);

    // 1. Campos estáticos configurados
    if (schema.staticFieldsConfig?.campos) {
      console.log('Procesando campos estáticos:', schema.staticFieldsConfig.campos);
      Object.entries(schema.staticFieldsConfig.campos).forEach(([fieldName, config]: [string, any]) => {
        if (config.visible === false) return;

        const fieldConfig = mapStaticFieldToFilter(fieldName, config, esquema.tipoEntidad);
        if (fieldConfig) {
          fields.push(fieldConfig);
        }
      });
    } else {
      console.warn('No se encontró staticFieldsConfig.campos en el esquema');

      // Fallback: Agregar campos básicos manualmente según el tipo de entidad
      if (esquema.tipoEntidad === 'Relacion') {
        const basicFields = [
          { name: 'codigoRelacion', label: 'Código Relación', type: 'text' as FilterType },
          { name: 'estado', label: 'Estado', type: 'text' as FilterType },
          { name: 'prioridad', label: 'Prioridad', type: 'text' as FilterType },
          { name: 'fechaInicio', label: 'Fecha Inicio', type: 'date' as FilterType },
          { name: 'fechaFin', label: 'Fecha Fin', type: 'date' as FilterType },
          { name: 'frecuenciaVisitas', label: 'Frecuencia Visitas', type: 'number' as FilterType },
          { name: 'tipoRelacion', label: 'Tipo Relación', type: 'text' as FilterType },
          { name: 'observaciones', label: 'Observaciones', type: 'text' as FilterType }
        ];

        basicFields.forEach(field => {
          const operators = getOperatorsForType(field.type);
          fields.push({
            field: field.name,
            label: field.label,
            type: field.type,
            operators,
            defaultOperator: operators[0],
            isStatic: true,
            group: 'Información General'
          });
        });
      }
    }

    // 2. Campos dinámicos (pueden estar en 'campos' o 'fields')
    const dynamicFields = schema.campos || schema.fields || [];
    if (dynamicFields.length > 0) {
      console.log('Procesando campos dinámicos:', dynamicFields);
      dynamicFields.forEach((campo: any) => {
        const fieldConfig = mapDynamicFieldToFilter(campo);
        if (fieldConfig) {
          fields.push(fieldConfig);
        }
      });
    } else {
      console.log('No se encontraron campos dinámicos en el esquema');
    }

    console.log('Campos disponibles generados:', fields);
    setAvailableFields(fields);
  }, [esquema]);

  // Mapear campo estático a configuración de filtro
  const mapStaticFieldToFilter = (fieldName: string, config: any, entityType: string): FieldFilterConfig | null => {
    const fieldType = inferFieldType(fieldName, entityType);
    const operators = getOperatorsForType(fieldType);

    return {
      field: fieldName,
      label: config.label || fieldName,
      type: fieldType,
      operators,
      defaultOperator: operators[0],
      tablaMaestra: config.tablaMaestra,
      isStatic: true,
      group: inferFieldGroup(fieldName)
    };
  };

  // Mapear campo dinámico a configuración de filtro
  const mapDynamicFieldToFilter = (campo: any): FieldFilterConfig | null => {
    // Soportar ambas nomenclaturas: español (nombre, etiqueta, tipo) e inglés (name, label, type)
    const fieldName = campo.nombre || campo.name;
    const fieldLabel = campo.etiqueta || campo.label;
    const fieldType = campo.tipo || campo.type;

    if (!fieldName || !fieldType) return null;

    const operators = getOperatorsForType(fieldType);

    return {
      field: `dynamic.${fieldName}`,
      label: fieldLabel || fieldName,
      type: fieldType,
      operators,
      defaultOperator: operators[0],
      tablaMaestra: campo.tablaMaestraId || campo.masterTable,
      options: campo.opciones || campo.options,
      isDynamic: true,
      group: 'Campos Personalizados'
    };
  };

  // Inferir tipo de filtro desde nombre de campo
  const inferFieldType = (fieldName: string, entityType: string): FilterType => {
    if (fieldName.includes('Fecha')) return 'date';
    if (fieldName === 'Activo' || fieldName === 'Status') return 'boolean';
    if (fieldName.endsWith('Id')) return 'select';
    if (fieldName.includes('Codigo')) return 'text';
    if (fieldName === 'FrecuenciaVisitas') return 'number';
    if (fieldName.includes('Cantidad') || fieldName.includes('Numero')) return 'number';

    return 'text';
  };

  // Inferir grupo del campo
  const inferFieldGroup = (fieldName: string): string => {
    if (fieldName.includes('Codigo') || fieldName.includes('Nombre') || fieldName.includes('Apellido')) {
      return 'Información Básica';
    }
    if (fieldName.includes('Especialidad') || fieldName.includes('Categoria') || fieldName.includes('Segment')) {
      return 'Segmentación';
    }
    if (fieldName.includes('Fecha')) {
      return 'Fechas';
    }
    if (fieldName.includes('Estado') || fieldName.includes('Activo') || fieldName.includes('Prioridad')) {
      return 'Estado';
    }
    return 'Otros';
  };

  // Obtener operadores según tipo de filtro
  const getOperatorsForType = (type: FilterType): FilterOperator[] => {
    const operatorMap: Record<FilterType, FilterOperator[]> = {
      text: ['contains', 'eq', 'neq', 'startsWith', 'endsWith', 'isNull', 'isNotNull'],
      number: ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'between', 'isNull'],
      date: ['eq', 'between', 'gte', 'lte'],
      daterange: ['between'],
      select: ['eq', 'neq', 'in', 'isNull', 'isNotNull'],
      multiselect: ['in', 'notIn'],
      boolean: ['eq']
    };

    return operatorMap[type] || ['eq'];
  };

  // Agregar nuevo filtro
  const addFilter = (fieldConfig: FieldFilterConfig) => {
    const newFilter: ActiveFilter = {
      id: crypto.randomUUID(),
      field: fieldConfig.field,
      label: fieldConfig.label,
      operator: fieldConfig.defaultOperator || fieldConfig.operators[0],
      value: '',
      logicalOperator: activeFilters.length > 0 ? 'AND' : undefined
    };

    const updated = [...activeFilters, newFilter];
    setActiveFilters(updated);
    onFiltersChange(updated);
    setShowFieldSelector(false);
  };

  // Eliminar filtro
  const removeFilter = (filterId: string) => {
    const updated = activeFilters.filter(f => f.id !== filterId);
    setActiveFilters(updated);
    onFiltersChange(updated);
  };

  // Actualizar filtro
  const updateFilter = (filterId: string, updates: Partial<ActiveFilter>) => {
    const updated = activeFilters.map(f =>
      f.id === filterId ? { ...f, ...updates } : f
    );
    setActiveFilters(updated);
    onFiltersChange(updated);
  };

  // Limpiar todos los filtros
  const clearAllFilters = () => {
    setActiveFilters([]);
    onFiltersChange([]);
  };

  // Agrupar campos disponibles
  const groupedFields = availableFields.reduce((acc, field) => {
    const group = field.group || 'Otros';
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(field);
    return acc;
  }, {} as Record<string, FieldFilterConfig[]>);

  return (
    <div className="entity-filter-builder">
      <div className="filter-header">
        <div className="filter-title">
          <span className="material-icons">filter_list</span>
          <h3>Filtros</h3>
          {activeFilters.length > 0 && (
            <span className="filter-count">{activeFilters.length}</span>
          )}
        </div>
        <div className="filter-actions-header">
          <button
            className="btn-add-filter"
            onClick={() => setShowFieldSelector(!showFieldSelector)}
          >
            <span className="material-icons">add</span>
            Agregar filtro
          </button>
          {activeFilters.length > 0 && (
            <button
              className="btn-clear-filters"
              onClick={clearAllFilters}
            >
              <span className="material-icons">clear_all</span>
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Selector de campos */}
      {showFieldSelector && (
        <div className="field-selector">
          <div className="field-selector-header">
            <h4>Seleccionar campo para filtrar</h4>
            <button
              className="btn-close"
              onClick={() => setShowFieldSelector(false)}
            >
              <span className="material-icons">close</span>
            </button>
          </div>
          <div className="field-selector-groups">
            {Object.entries(groupedFields).map(([group, fields]) => (
              <div key={group} className="field-group">
                <div className="field-group-title">{group}</div>
                <div className="field-group-items">
                  {fields.map(field => (
                    <button
                      key={field.field}
                      className="field-item"
                      onClick={() => addFilter(field)}
                      disabled={activeFilters.some(f => f.field === field.field)}
                    >
                      <span className="field-item-label">{field.label}</span>
                      <span className="field-item-type">{field.type}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filtros activos */}
      {activeFilters.length > 0 && (
        <div className="active-filters">
          {activeFilters.map((filter, index) => {
            const fieldConfig = availableFields.find(f => f.field === filter.field);
            if (!fieldConfig) return null;

            return (
              <FilterRow
                key={filter.id}
                filter={filter}
                fieldConfig={fieldConfig}
                showLogicalOperator={index > 0}
                onUpdate={(updates) => updateFilter(filter.id, updates)}
                onRemove={() => removeFilter(filter.id)}
              />
            );
          })}
        </div>
      )}

      {activeFilters.length === 0 && !showFieldSelector && (
        <div className="no-filters">
          <span className="material-icons">filter_list_off</span>
          <p>No hay filtros activos</p>
          <p className="text-muted">Haz clic en "Agregar filtro" para comenzar</p>
        </div>
      )}
    </div>
  );
};

// Componente para cada fila de filtro
interface FilterRowProps {
  filter: ActiveFilter;
  fieldConfig: FieldFilterConfig;
  showLogicalOperator: boolean;
  onUpdate: (updates: Partial<ActiveFilter>) => void;
  onRemove: () => void;
}

const FilterRow = ({ filter, fieldConfig, showLogicalOperator, onUpdate, onRemove }: FilterRowProps) => {
  const [masterData, setMasterData] = useState<any[]>([]);
  const [loadingMasterData, setLoadingMasterData] = useState(false);

  // Cargar datos de tabla maestra si es necesario
  useEffect(() => {
    if (fieldConfig.tablaMaestra && !fieldConfig.options) {
      loadMasterTableData(fieldConfig.tablaMaestra);
    }
  }, [fieldConfig.tablaMaestra]);

  const loadMasterTableData = async (tablaMaestra: string) => {
    setLoadingMasterData(true);
    try {
      // TODO: Implementar carga desde API
      // const response = await fetch(`/api/tablas-maestras/${tablaMaestra}`);
      // const data = await response.json();
      // setMasterData(data);
      setMasterData([]);
    } catch (error) {
      console.error('Error cargando tabla maestra:', error);
    } finally {
      setLoadingMasterData(false);
    }
  };

  const renderValueInput = () => {
    const needsValue = !['isNull', 'isNotNull'].includes(filter.operator);
    if (!needsValue) return null;

    switch (fieldConfig.type) {
      case 'text':
        return (
          <input
            type="text"
            className="filter-input"
            value={filter.value || ''}
            onChange={(e) => onUpdate({ value: e.target.value })}
            placeholder={`Ingrese ${fieldConfig.label.toLowerCase()}`}
          />
        );

      case 'number':
        if (filter.operator === 'between') {
          return (
            <div className="filter-range">
              <input
                type="number"
                className="filter-input"
                value={filter.value || ''}
                onChange={(e) => onUpdate({ value: parseFloat(e.target.value) || '' })}
                placeholder="Desde"
              />
              <span>y</span>
              <input
                type="number"
                className="filter-input"
                value={filter.value2 || ''}
                onChange={(e) => onUpdate({ value2: parseFloat(e.target.value) || '' })}
                placeholder="Hasta"
              />
            </div>
          );
        }
        return (
          <input
            type="number"
            className="filter-input"
            value={filter.value || ''}
            onChange={(e) => onUpdate({ value: parseFloat(e.target.value) || '' })}
            placeholder="Ingrese valor"
          />
        );

      case 'date':
        if (filter.operator === 'between') {
          return (
            <div className="filter-range">
              <input
                type="date"
                className="filter-input"
                value={filter.value || ''}
                onChange={(e) => onUpdate({ value: e.target.value })}
              />
              <span>y</span>
              <input
                type="date"
                className="filter-input"
                value={filter.value2 || ''}
                onChange={(e) => onUpdate({ value2: e.target.value })}
              />
            </div>
          );
        }
        return (
          <input
            type="date"
            className="filter-input"
            value={filter.value || ''}
            onChange={(e) => onUpdate({ value: e.target.value })}
          />
        );

      case 'select':
        const options = fieldConfig.options || masterData;
        return (
          <select
            className="filter-select"
            value={filter.value || ''}
            onChange={(e) => onUpdate({ value: e.target.value })}
            disabled={loadingMasterData}
          >
            <option value="">Seleccionar...</option>
            {options.map((opt: any) => (
              <option key={opt.value || opt.id} value={opt.value || opt.id}>
                {opt.label || opt.nombre}
              </option>
            ))}
          </select>
        );

      case 'boolean':
        return (
          <select
            className="filter-select"
            value={filter.value === '' ? '' : filter.value.toString()}
            onChange={(e) => onUpdate({ value: e.target.value === '' ? '' : e.target.value === 'true' })}
          >
            <option value="">Todos</option>
            <option value="true">Sí</option>
            <option value="false">No</option>
          </select>
        );

      default:
        return null;
    }
  };

  return (
    <div className="filter-row">
      {showLogicalOperator && (
        <select
          className="logical-operator"
          value={filter.logicalOperator || 'AND'}
          onChange={(e) => onUpdate({ logicalOperator: e.target.value as 'AND' | 'OR' })}
        >
          <option value="AND">Y</option>
          <option value="OR">O</option>
        </select>
      )}

      <div className="filter-field">
        <span className="field-label">{filter.label}</span>
        {fieldConfig.isDynamic && (
          <span className="field-badge">Personalizado</span>
        )}
      </div>

      <select
        className="filter-operator"
        value={filter.operator}
        onChange={(e) => onUpdate({ operator: e.target.value as FilterOperator })}
      >
        {fieldConfig.operators.map(op => (
          <option key={op} value={op}>
            {getOperatorLabel(op)}
          </option>
        ))}
      </select>

      <div className="filter-value">
        {renderValueInput()}
      </div>

      <button
        className="btn-remove-filter"
        onClick={onRemove}
        title="Eliminar filtro"
      >
        <span className="material-icons">close</span>
      </button>
    </div>
  );
};

function getOperatorLabel(operator: FilterOperator): string {
  const labels: Record<FilterOperator, string> = {
    eq: 'es igual a',
    neq: 'no es igual a',
    contains: 'contiene',
    startsWith: 'empieza con',
    endsWith: 'termina con',
    gt: 'mayor que',
    gte: 'mayor o igual',
    lt: 'menor que',
    lte: 'menor o igual',
    in: 'está en',
    notIn: 'no está en',
    between: 'entre',
    isNull: 'está vacío',
    isNotNull: 'no está vacío'
  };
  return labels[operator] || operator;
}

export default EntityFilterBuilder;
