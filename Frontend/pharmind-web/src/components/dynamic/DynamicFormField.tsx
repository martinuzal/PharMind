import { useState, useEffect } from 'react';

interface SchemaField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'tel' | 'date' | 'datetime-local' | 'time' | 'url' | 'color' |
        'textarea' | 'select' | 'multiselect' | 'checkbox' | 'radio' | 'file' | 'rating' | 'slider' |
        'fieldset' | 'repeater' | 'address' | 'section';
  required?: boolean;
  placeholder?: string;
  options?: string[] | { label: string; value: string }[];
  dataSource?: {
    type: 'static' | 'sql';
    tableName?: string;
    valueField?: string;
    labelField?: string;
  };
  defaultValue?: any;
  layout?: {
    column?: 'left' | 'right' | 'full';
    width?: 'half' | 'full';
  };
  // Grid layout properties from FormDesigner
  position?: { row: number; col: number };
  span?: { cols: 1 | 2 | 3 | 4 };
  // For repeater fields
  repeaterConfig?: {
    fields: RepeaterField[];
    minItems?: number;
    maxItems?: number;
    addButtonText?: string;
    removeButtonText?: string;
    itemLabelTemplate?: string;
    layout?: {
      displayMode: 'card' | 'inline' | 'table';
      columns: 1 | 2 | 3 | 4;
      spacing?: 'compact' | 'normal' | 'spacious';
    };
  };
  fields?: SchemaField[];
  collapsible?: boolean;
  minItems?: number;
  maxItems?: number;
  addButtonLabel?: string;
  removeButtonLabel?: string;
  enableGeolocation?: boolean;
  helpText?: string;
  icon?: string;
}

interface RepeaterField {
  type: string;
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  options?: string[] | { label: string; value: string }[];
  validation?: any;
  position?: { row: number; col: number };
  span?: { cols: 1 | 2 | 3 | 4 };
  icon?: string;
}

interface DynamicFormFieldProps {
  field: SchemaField;
  value: any;
  onChange: (name: string, value: any) => void;
}

interface SelectOption {
  value: string;
  label: string;
}

const DynamicFormField = ({ field, value, onChange }: DynamicFormFieldProps) => {
  const [sqlOptions, setSqlOptions] = useState<SelectOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  useEffect(() => {
    if (field.type === 'select' && field.dataSource?.type === 'sql') {
      loadSqlOptions();
    }
  }, [field]);

  const loadSqlOptions = async () => {
    if (!field.dataSource?.tableName || !field.dataSource?.valueField || !field.dataSource?.labelField) {
      return;
    }

    setLoadingOptions(true);
    try {
      const response = await fetch(
        `http://localhost:5209/api/DynamicData/${field.dataSource.tableName}?valueField=${field.dataSource.valueField}&labelField=${field.dataSource.labelField}`
      );

      if (response.ok) {
        const data = await response.json();
        setSqlOptions(data);
      }
    } catch (error) {
      console.error('Error loading SQL options:', error);
    } finally {
      setLoadingOptions(false);
    }
  };

  const renderField = () => {
    const baseProps = {
      id: field.name,
      name: field.name,
      required: field.required,
      placeholder: field.placeholder,
      value: value || field.defaultValue || '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const newValue = field.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
        onChange(field.name, newValue);
      }
    };

    switch (field.type) {
      case 'textarea':
        return <textarea {...baseProps} rows={4} />;

      case 'select':
        // Si es origen SQL, usar las opciones cargadas desde SQL
        if (field.dataSource?.type === 'sql') {
          return (
            <select {...baseProps} disabled={loadingOptions}>
              <option value="">{loadingOptions ? 'Cargando...' : 'Seleccione una opción'}</option>
              {sqlOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          );
        }

        // Si es origen estático, usar las opciones definidas
        return (
          <select {...baseProps}>
            <option value="">Seleccione una opción</option>
            {field.options?.map((option) => {
              // Manejar tanto strings como objetos {label, value}
              const optValue = typeof option === 'string' ? option : option.value;
              const optLabel = typeof option === 'string' ? option : option.label;
              return (
                <option key={optValue} value={optValue}>
                  {optLabel}
                </option>
              );
            })}
          </select>
        );

      case 'multiselect':
        // Multiselect con origen SQL o estático
        const multiOptions = field.dataSource?.type === 'sql' ? sqlOptions :
          (field.options || []).map(opt => ({ value: opt, label: opt }));

        return (
          <select
            {...baseProps}
            multiple
            disabled={loadingOptions}
            value={value || []}
            onChange={(e) => {
              const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
              onChange(field.name, selectedOptions);
            }}
            style={{ minHeight: '120px' }}
          >
            {multiOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'fieldset':
        return (
          <fieldset className="dynamic-fieldset">
            <legend>{field.label}</legend>
            {field.fields?.map((subField) => (
              <DynamicFormField
                key={subField.name}
                field={subField}
                value={value?.[subField.name]}
                onChange={(subName, subValue) => {
                  onChange(field.name, { ...(value || {}), [subName]: subValue });
                }}
              />
            ))}
          </fieldset>
        );

      case 'repeater':
        const items = value || [];
        const repeaterConfig = field.repeaterConfig;
        const minItems = repeaterConfig?.minItems || 0;
        const maxItems = repeaterConfig?.maxItems || 10;
        const displayMode = repeaterConfig?.layout?.displayMode || 'card';
        const columns = repeaterConfig?.layout?.columns || 2;
        const spacing = repeaterConfig?.layout?.spacing || 'normal';

        const renderRepeaterField = (repeaterField: RepeaterField, itemValue: any, onItemChange: (name: string, val: any) => void) => {
          // For repeater fields, we use a simplified rendering
          const inputProps = {
            id: `${field.name}_${repeaterField.name}`,
            name: repeaterField.name,
            placeholder: repeaterField.placeholder,
            value: itemValue || '',
            onChange: (e: any) => {
              const newValue = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
              onItemChange(repeaterField.name, newValue);
            }
          };

          let inputElement;
          if (repeaterField.type === 'textarea') {
            inputElement = <textarea {...inputProps} rows={3} />;
          } else if (repeaterField.type === 'select') {
            const options = Array.isArray(repeaterField.options) ? repeaterField.options : [];
            inputElement = (
              <select {...inputProps}>
                <option value="">Seleccione...</option>
                {options.map((opt: any) => {
                  const optValue = typeof opt === 'string' ? opt : opt.value;
                  const optLabel = typeof opt === 'string' ? opt : opt.label;
                  return <option key={optValue} value={optValue}>{optLabel}</option>;
                })}
              </select>
            );
          } else if (repeaterField.type === 'checkbox') {
            inputElement = (
              <div className="checkbox-wrapper">
                <input
                  {...inputProps}
                  type="checkbox"
                  checked={itemValue || false}
                  onChange={(e) => onItemChange(repeaterField.name, e.target.checked)}
                />
                <label htmlFor={inputProps.id}>{repeaterField.label}</label>
              </div>
            );
          } else {
            inputElement = <input {...inputProps} type={repeaterField.type} />;
          }

          return (
            <div
              key={repeaterField.name}
              className="repeater-field-item"
              style={{
                gridColumn: repeaterField.span?.cols ? `span ${repeaterField.span.cols}` : 'span 2'
              }}
            >
              {repeaterField.type !== 'checkbox' && (
                <label htmlFor={inputProps.id}>
                  {repeaterField.label}
                  {repeaterField.required && <span className="required"> *</span>}
                </label>
              )}
              {inputElement}
            </div>
          );
        };

        return (
          <div className={`dynamic-repeater dynamic-repeater--${displayMode}`}>
            {items.map((item: any, index: number) => {
              const itemLabel = repeaterConfig?.itemLabelTemplate
                ? repeaterConfig.itemLabelTemplate.replace('{index}', String(index + 1))
                : `Item ${index + 1}`;

              return (
                <div
                  key={index}
                  className={`repeater-item repeater-item--${displayMode}`}
                >
                  <div className="repeater-item-header">
                    <span className="repeater-item-title">
                      <span className="material-icons">{field.icon || 'article'}</span>
                      {itemLabel}
                    </span>
                    {items.length > minItems && (
                      <button
                        type="button"
                        className="btn-icon btn-delete"
                        onClick={() => {
                          const newItems = items.filter((_: any, i: number) => i !== index);
                          onChange(field.name, newItems);
                        }}
                        title={repeaterConfig?.removeButtonText || 'Eliminar'}
                      >
                        <span className="material-icons">delete</span>
                      </button>
                    )}
                  </div>
                  <div
                    className="repeater-item-fields"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: `repeat(${columns}, 1fr)`,
                      gap: spacing === 'compact' ? '0.75rem' :
                           spacing === 'spacious' ? '1.5rem' : '1rem'
                    }}
                  >
                    {repeaterConfig?.fields?.map((repeaterField) =>
                      renderRepeaterField(
                        repeaterField,
                        item?.[repeaterField.name],
                        (subName, subValue) => {
                          const newItems = [...items];
                          newItems[index] = { ...newItems[index], [subName]: subValue };
                          onChange(field.name, newItems);
                        }
                      )
                    )}
                  </div>
                </div>
              );
            })}
            {items.length < maxItems && (
              <button
                type="button"
                className="btn-add-repeater"
                onClick={() => {
                  onChange(field.name, [...items, {}]);
                }}
              >
                <span className="material-icons">add</span>
                {repeaterConfig?.addButtonText || 'Agregar Item'}
              </button>
            )}
          </div>
        );

      case 'address':
        const addressValue = value || {};
        const handleAddressChange = (addressField: string, addressFieldValue: string) => {
          onChange(field.name, { ...addressValue, [addressField]: addressFieldValue });
        };

        return (
          <div className="address-field-wrapper">
            <h4>
              <span className="material-icons">location_on</span>
              {field.label}
            </h4>
            <div className="form-row">
              <div className="form-group" style={{ flex: '2' }}>
                <label htmlFor={`${field.name}_calle`}>Calle</label>
                <input
                  type="text"
                  id={`${field.name}_calle`}
                  value={addressValue.calle || ''}
                  onChange={(e) => handleAddressChange('calle', e.target.value)}
                  placeholder="Nombre de la calle"
                />
              </div>
              <div className="form-group" style={{ flex: '1' }}>
                <label htmlFor={`${field.name}_numero`}>Número</label>
                <input
                  type="text"
                  id={`${field.name}_numero`}
                  value={addressValue.numero || ''}
                  onChange={(e) => handleAddressChange('numero', e.target.value)}
                  placeholder="Núm."
                />
              </div>
              <div className="form-group" style={{ flex: '1' }}>
                <label htmlFor={`${field.name}_apartamento`}>Apto/Depto</label>
                <input
                  type="text"
                  id={`${field.name}_apartamento`}
                  value={addressValue.apartamento || ''}
                  onChange={(e) => handleAddressChange('apartamento', e.target.value)}
                  placeholder="Opcional"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor={`${field.name}_colonia`}>Colonia/Barrio</label>
                <input
                  type="text"
                  id={`${field.name}_colonia`}
                  value={addressValue.colonia || ''}
                  onChange={(e) => handleAddressChange('colonia', e.target.value)}
                  placeholder="Colonia"
                />
              </div>
              <div className="form-group">
                <label htmlFor={`${field.name}_ciudad`}>Ciudad</label>
                <input
                  type="text"
                  id={`${field.name}_ciudad`}
                  value={addressValue.ciudad || ''}
                  onChange={(e) => handleAddressChange('ciudad', e.target.value)}
                  placeholder="Ciudad"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor={`${field.name}_estado`}>Estado/Provincia</label>
                <input
                  type="text"
                  id={`${field.name}_estado`}
                  value={addressValue.estado || ''}
                  onChange={(e) => handleAddressChange('estado', e.target.value)}
                  placeholder="Estado"
                />
              </div>
              <div className="form-group">
                <label htmlFor={`${field.name}_codigoPostal`}>Código Postal</label>
                <input
                  type="text"
                  id={`${field.name}_codigoPostal`}
                  value={addressValue.codigoPostal || ''}
                  onChange={(e) => handleAddressChange('codigoPostal', e.target.value)}
                  placeholder="C.P."
                />
              </div>
              <div className="form-group">
                <label htmlFor={`${field.name}_pais`}>País</label>
                <input
                  type="text"
                  id={`${field.name}_pais`}
                  value={addressValue.pais || ''}
                  onChange={(e) => handleAddressChange('pais', e.target.value)}
                  placeholder="País"
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor={`${field.name}_referencia`}>Referencias</label>
              <textarea
                id={`${field.name}_referencia`}
                value={addressValue.referencia || ''}
                onChange={(e) => handleAddressChange('referencia', e.target.value)}
                placeholder="Referencias adicionales para ubicar la dirección"
                rows={2}
              />
            </div>
            {field.enableGeolocation && (
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor={`${field.name}_latitud`}>Latitud</label>
                  <input
                    type="number"
                    step="any"
                    id={`${field.name}_latitud`}
                    value={addressValue.latitud || ''}
                    onChange={(e) => handleAddressChange('latitud', e.target.value)}
                    placeholder="Latitud"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor={`${field.name}_longitud`}>Longitud</label>
                  <input
                    type="number"
                    step="any"
                    id={`${field.name}_longitud`}
                    value={addressValue.longitud || ''}
                    onChange={(e) => handleAddressChange('longitud', e.target.value)}
                    placeholder="Longitud"
                  />
                </div>
                <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      if ('geolocation' in navigator) {
                        navigator.geolocation.getCurrentPosition(
                          (position) => {
                            // Update both fields in a single onChange call to avoid React batching issues
                            onChange(field.name, {
                              ...addressValue,
                              latitud: position.coords.latitude.toString(),
                              longitud: position.coords.longitude.toString()
                            });
                          },
                          (error) => {
                            console.error('Error obteniendo ubicación:', error);
                            alert('No se pudo obtener la ubicación actual');
                          }
                        );
                      } else {
                        alert('Geolocalización no soportada por el navegador');
                      }
                    }}
                  >
                    <span className="material-icons">my_location</span>
                    Ubicación Actual
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      case 'checkbox':
        return (
          <div className="checkbox-wrapper">
            <input
              {...baseProps}
              type="checkbox"
              checked={value || false}
              onChange={(e) => onChange(field.name, e.target.checked)}
            />
            <label htmlFor={field.name}>{field.label}</label>
          </div>
        );

      case 'radio':
        return (
          <div className="radio-group">
            {field.options?.map((option) => {
              const optValue = typeof option === 'string' ? option : option.value;
              const optLabel = typeof option === 'string' ? option : option.label;
              const radioId = `${field.name}_${optValue}`;
              return (
                <div key={optValue} className="radio-wrapper">
                  <input
                    type="radio"
                    id={radioId}
                    name={field.name}
                    value={optValue}
                    checked={value === optValue}
                    onChange={(e) => onChange(field.name, e.target.value)}
                    required={field.required}
                  />
                  <label htmlFor={radioId}>{optLabel}</label>
                </div>
              );
            })}
          </div>
        );

      case 'rating':
        const maxRating = 5;
        return (
          <div className="rating-wrapper">
            {[...Array(maxRating)].map((_, index) => {
              const ratingValue = index + 1;
              return (
                <span
                  key={ratingValue}
                  className={`rating-star ${value >= ratingValue ? 'rating-star--active' : ''}`}
                  onClick={() => onChange(field.name, ratingValue)}
                  style={{ cursor: 'pointer', fontSize: '1.5rem', color: value >= ratingValue ? '#fbbf24' : '#d1d5db' }}
                >
                  ★
                </span>
              );
            })}
          </div>
        );

      case 'slider':
        return (
          <div className="slider-wrapper">
            <input
              type="range"
              id={field.name}
              name={field.name}
              min="0"
              max="100"
              value={value || 0}
              onChange={(e) => onChange(field.name, parseInt(e.target.value))}
              required={field.required}
              style={{ width: '100%' }}
            />
            <span className="slider-value">{value || 0}</span>
          </div>
        );

      case 'file':
        return (
          <input
            type="file"
            id={field.name}
            name={field.name}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                onChange(field.name, file.name);
              }
            }}
            required={field.required}
          />
        );

      default:
        return <input {...baseProps} type={field.type} />;
    }
  };

  // Handle section separator
  if (field.type === 'section') {
    return (
      <div
        className="dynamic-section-separator"
        style={{
          gridColumn: '1 / -1'
        }}
      >
        <div className="section-line"></div>
        <div className="section-title">{field.label}</div>
        <div className="section-line"></div>
      </div>
    );
  }

  // Grid positioning styles based on position and span from FormDesigner
  const gridStyle: React.CSSProperties = {};
  if (field.span?.cols) {
    gridStyle.gridColumn = `span ${field.span.cols}`;
  }

  // Fieldset, Repeater and Address have their own wrapper
  if (field.type === 'fieldset' || field.type === 'repeater' || field.type === 'address') {
    return (
      <div className="form-group form-group--full" style={gridStyle}>
        {renderField()}
      </div>
    );
  }

  if (field.type === 'checkbox') {
    return (
      <div className="form-group" style={gridStyle}>
        {renderField()}
      </div>
    );
  }

  // Regular fields with label
  return (
    <div className="form-group" style={gridStyle}>
      <label htmlFor={field.name}>
        {field.label}
        {field.required && <span className="required"> *</span>}
      </label>
      {renderField()}
      {field.helpText && (
        <small className="field-help-text">{field.helpText}</small>
      )}
    </div>
  );
};

export default DynamicFormField;
