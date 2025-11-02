import { useState, useEffect } from 'react';

interface SchemaField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'tel' | 'date' | 'textarea' | 'select' | 'multiselect' | 'checkbox' | 'fieldset' | 'repeater' | 'address';
  required: boolean;
  placeholder?: string;
  options?: string[];
  dataSource?: {
    type: 'static' | 'sql';
    tableName?: string;
    valueField?: string;
    labelField?: string;
  };
  defaultValue?: string;
  layout?: {
    column?: 'left' | 'right' | 'full';
    width?: 'half' | 'full';
  };
  fields?: SchemaField[];
  collapsible?: boolean;
  minItems?: number;
  maxItems?: number;
  addButtonLabel?: string;
  removeButtonLabel?: string;
  enableGeolocation?: boolean;
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
            {field.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
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
        const minItems = field.minItems || 0;
        const maxItems = field.maxItems || 10;

        return (
          <div className="dynamic-repeater">
            {items.map((item: any, index: number) => (
              <div key={index} className="repeater-item">
                <div className="repeater-item-header">
                  <span>Item {index + 1}</span>
                  {items.length > minItems && (
                    <button
                      type="button"
                      className="btn-icon btn-delete"
                      onClick={() => {
                        const newItems = items.filter((_: any, i: number) => i !== index);
                        onChange(field.name, newItems);
                      }}
                      title={field.removeButtonLabel || 'Eliminar'}
                    >
                      <span className="material-icons">delete</span>
                    </button>
                  )}
                </div>
                <div className="repeater-item-fields">
                  {field.fields?.map((subField) => (
                    <DynamicFormField
                      key={subField.name}
                      field={subField}
                      value={item?.[subField.name]}
                      onChange={(subName, subValue) => {
                        const newItems = [...items];
                        newItems[index] = { ...newItems[index], [subName]: subValue };
                        onChange(field.name, newItems);
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
            {items.length < maxItems && (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  onChange(field.name, [...items, {}]);
                }}
              >
                <span className="material-icons">add</span>
                {field.addButtonLabel || 'Agregar Item'}
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

      default:
        return <input {...baseProps} type={field.type} />;
    }
  };

  // Fieldset y Repeater tienen su propio wrapper
  if (field.type === 'fieldset' || field.type === 'repeater' || field.type === 'address') {
    return <div className="form-group">{renderField()}</div>;
  }

  if (field.type === 'checkbox') {
    return <div className="form-group">{renderField()}</div>;
  }

  // Aplicar clases de layout si están definidas
  const layoutClass = field.layout?.column ? `field-column-${field.layout.column}` : '';
  const widthClass = field.layout?.width ? `field-width-${field.layout.width}` : '';

  return (
    <div className={`form-group ${layoutClass} ${widthClass}`.trim()}>
      <label htmlFor={field.name}>
        {field.label}
        {field.required && <span className="required"> *</span>}
      </label>
      {renderField()}
    </div>
  );
};

export default DynamicFormField;
