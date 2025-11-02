import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import FormDesigner from '../formDesigner/FormDesigner';
import type { FormSchema } from '../../types/formDesigner';
import '../../styles/FormDesigner.css';
import './SchemaBuilder.css';

interface SchemaField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'tel' | 'date' | 'textarea' | 'select' | 'multiselect' | 'checkbox' | 'fieldset' | 'repeater' | 'address';
  required: boolean;
  placeholder?: string;
  options?: string[]; // Para select estático
  dataSource?: {
    type: 'static' | 'sql';
    tableName?: string;
    valueField?: string;
    labelField?: string;
  };
  defaultValue?: string;
  validations?: {
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: string;
  };
  layout?: {
    column?: 'left' | 'right' | 'full';
    width?: 'half' | 'full';
  };
  // Para fieldset (agrupador)
  fields?: SchemaField[];
  collapsible?: boolean;
  // Para repeater (grupos repetitivos)
  minItems?: number;
  maxItems?: number;
  addButtonLabel?: string;
  removeButtonLabel?: string;
  // Para address (dirección con geolocalización)
  enableGeolocation?: boolean;
}

interface SchemaBuilderProps {
  initialSchema?: string;
  onChange: (schema: string) => void;
}

const SchemaBuilder = ({ initialSchema = '{}', onChange }: SchemaBuilderProps) => {
  const [designMode, setDesignMode] = useState<'classic' | 'visual'>('visual');
  const [fields, setFields] = useState<SchemaField[]>(() => {
    try {
      const parsed = JSON.parse(initialSchema);
      return parsed.fields || [];
    } catch {
      return [];
    }
  });

  const [showFieldModal, setShowFieldModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [currentField, setCurrentField] = useState<SchemaField>({
    name: '',
    label: '',
    type: 'text',
    required: false,
    dataSource: {
      type: 'static'
    }
  });

  // Convert initialSchema to FormDesigner format
  const getFormDesignerSchema = (): FormSchema | undefined => {
    try {
      const parsed = JSON.parse(initialSchema);
      if (!parsed.fields || parsed.fields.length === 0) {
        return undefined;
      }

      // Convert fields to FormDesigner format
      // Use saved layout info if available, otherwise use defaults
      const formFields = parsed.fields.map((field: any, index: number) => ({
        id: `field_${index}_${Date.now()}`,
        name: field.name,
        type: field.type,
        label: field.label,
        placeholder: field.placeholder,
        required: field.required,
        defaultValue: field.defaultValue,
        options: field.options,
        validation: field.validations,
        helpText: field.helpText || '',
        // Use saved position/span if available, otherwise use defaults
        position: field.position || { row: index, col: 0 },
        span: field.span || { cols: 2 as 1 | 2 | 3 | 4 },
        order: field.order !== undefined ? field.order : index,
        // CRITICAL: Preserve repeaterConfig when loading from database
        ...(field.repeaterConfig && { repeaterConfig: field.repeaterConfig }),
        // CRITICAL: Preserve dataSource when loading from database
        ...(field.dataSource && { dataSource: field.dataSource }),
        // Preserve icon and helpText
        ...(field.icon && { icon: field.icon }),
      }));

      return {
        fields: formFields,
        layout: parsed.layout || { columns: 4, spacing: 'normal', style: 'modern' },
        version: parsed.version || 1,
      };
    } catch {
      return undefined;
    }
  };

  // Handle FormDesigner schema changes
  const handleFormDesignerChange = (formSchema: FormSchema) => {
    const schema = {
      fields: formSchema.fields.map(field => ({
        name: field.name,
        label: field.label,
        type: field.type,
        required: field.required,
        placeholder: field.placeholder,
        options: field.options,
        defaultValue: field.defaultValue,
        validations: field.validation,
        // Include layout information for visual designer
        position: field.position,
        span: field.span,
        order: field.order,
        // CRITICAL: Preserve repeaterConfig for repeater fields
        ...(field.repeaterConfig && { repeaterConfig: field.repeaterConfig }),
        // CRITICAL: Preserve dataSource for fields with SQL data sources
        ...(field.dataSource && { dataSource: field.dataSource }),
        // Preserve icon and helpText
        ...(field.icon && { icon: field.icon }),
        ...(field.helpText && { helpText: field.helpText }),
      })),
      layout: formSchema.layout,
      version: formSchema.version
    };
    onChange(JSON.stringify(schema, null, 2));
  };

  const fieldTypes = [
    { value: 'text', label: 'Texto' },
    { value: 'number', label: 'Número' },
    { value: 'email', label: 'Email' },
    { value: 'tel', label: 'Teléfono' },
    { value: 'date', label: 'Fecha' },
    { value: 'textarea', label: 'Área de Texto' },
    { value: 'select', label: 'Lista Desplegable' },
    { value: 'multiselect', label: 'Selección Múltiple' },
    { value: 'checkbox', label: 'Casilla de Verificación' },
    { value: 'fieldset', label: 'Agrupador de Campos' },
    { value: 'repeater', label: 'Grupo Repetitivo' },
    { value: 'address', label: 'Dirección' }
  ];

  const updateSchema = (newFields: SchemaField[]) => {
    const schema = {
      fields: newFields,
      version: 1
    };
    onChange(JSON.stringify(schema, null, 2));
  };

  const handleAddField = () => {
    setEditingIndex(null);
    setCurrentField({
      name: '',
      label: '',
      type: 'text',
      required: false,
      dataSource: {
        type: 'static'
      }
    });
    setShowFieldModal(true);
  };

  const handleEditField = (index: number) => {
    setEditingIndex(index);
    setCurrentField({ ...fields[index] });
    setShowFieldModal(true);
  };

  const handleSaveField = () => {
    if (!currentField.name || !currentField.label) {
      alert('El nombre y la etiqueta son requeridos');
      return;
    }

    const newFields = [...fields];
    if (editingIndex !== null) {
      newFields[editingIndex] = currentField;
    } else {
      newFields.push(currentField);
    }

    setFields(newFields);
    updateSchema(newFields);
    setShowFieldModal(false);
  };

  const handleDeleteField = (index: number) => {
    if (!confirm('¿Está seguro de eliminar este campo?')) return;

    const newFields = fields.filter((_, i) => i !== index);
    setFields(newFields);
    updateSchema(newFields);
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    const newFields = [...fields];
    const newIndex = direction === 'up' ? index - 1 : index + 1;

    if (newIndex < 0 || newIndex >= fields.length) return;

    [newFields[index], newFields[newIndex]] = [newFields[newIndex], newFields[index]];
    setFields(newFields);
    updateSchema(newFields);
  };

  return (
    <>
      <div className="schema-builder">
        <div className="schema-builder-header">
          <h3>Campos del Formulario</h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div className="mode-toggle" style={{
              display: 'flex',
              gap: '4px',
              backgroundColor: '#f0f0f0',
              padding: '4px',
              borderRadius: '6px'
            }}>
              <button
                type="button"
                className={designMode === 'visual' ? 'btn-primary btn-sm' : 'btn-secondary btn-sm'}
                onClick={() => setDesignMode('visual')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span className="material-icons" style={{ fontSize: '18px' }}>dashboard</span>
                Visual
              </button>
              <button
                type="button"
                className={designMode === 'classic' ? 'btn-primary btn-sm' : 'btn-secondary btn-sm'}
                onClick={() => setDesignMode('classic')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span className="material-icons" style={{ fontSize: '18px' }}>list</span>
                Clásico
              </button>
            </div>
            {designMode === 'classic' && (
              <button type="button" className="btn-primary btn-sm" onClick={handleAddField}>
                <span className="material-icons">add</span>
                Agregar Campo
              </button>
            )}
          </div>
        </div>

        {designMode === 'visual' ? (
          <FormDesigner
            initialSchema={getFormDesignerSchema()}
            onChange={handleFormDesignerChange}
          />
        ) : (
          <div className="fields-list">
            {fields.length === 0 ? (
              <div className="empty-fields">
                <span className="material-icons">view_agenda</span>
                <p>No hay campos definidos</p>
                <p className="text-sm">Agrega campos para construir tu formulario</p>
              </div>
            ) : (
              fields.map((field, index) => (
                <div key={index} className="field-item">
                <div className="field-info">
                  <div className="field-icon">
                    <span className="material-icons">
                      {field.type === 'text' ? 'text_fields' :
                       field.type === 'number' ? 'pin' :
                       field.type === 'email' ? 'email' :
                       field.type === 'date' ? 'calendar_today' :
                       field.type === 'select' ? 'arrow_drop_down_circle' :
                       field.type === 'checkbox' ? 'check_box' :
                       field.type === 'textarea' ? 'notes' : 'phone'}
                    </span>
                  </div>
                  <div className="field-details">
                    <div className="field-name">
                      {field.label}
                      {field.required && <span className="required-badge">Requerido</span>}
                    </div>
                    <div className="field-meta">
                      <span className="field-type">{fieldTypes.find(t => t.value === field.type)?.label}</span>
                      <span className="field-key">Clave: {field.name}</span>
                    </div>
                  </div>
                </div>

                <div className="field-actions">
                  <button
                    type="button"
                    className="btn-icon"
                    onClick={() => moveField(index, 'up')}
                    disabled={index === 0}
                    title="Mover arriba"
                  >
                    <span className="material-icons">arrow_upward</span>
                  </button>
                  <button
                    type="button"
                    className="btn-icon"
                    onClick={() => moveField(index, 'down')}
                    disabled={index === fields.length - 1}
                    title="Mover abajo"
                  >
                    <span className="material-icons">arrow_downward</span>
                  </button>
                  <button
                    type="button"
                    className="btn-icon"
                    onClick={() => handleEditField(index)}
                    title="Editar"
                  >
                    <span className="material-icons">edit</span>
                  </button>
                  <button
                    type="button"
                    className="btn-icon btn-delete"
                    onClick={() => handleDeleteField(index)}
                    title="Eliminar"
                  >
                    <span className="material-icons">delete</span>
                  </button>
                </div>
              </div>
            ))
            )}
          </div>
        )}
      </div>

      {showFieldModal && createPortal(
        <div className="modal-overlay" onClick={(e) => {
          e.stopPropagation();
          setShowFieldModal(false);
        }}>
          <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingIndex !== null ? 'Editar Campo' : 'Nuevo Campo'}</h2>
              <button className="btn-close" onClick={(e) => {
                e.stopPropagation();
                setShowFieldModal(false);
              }}>
                <span className="material-icons">close</span>
              </button>
            </div>

            <div className="modal-form">
              <div className="form-section">
                <h3>Información Básica</h3>

                <div className="form-row">
                  <div className="form-group">
                    <label>Nombre del Campo <span className="required">*</span></label>
                    <input
                      type="text"
                      value={currentField.name}
                      onChange={(e) => setCurrentField({ ...currentField, name: e.target.value.replace(/\s/g, '_') })}
                      placeholder="nombre_campo"
                    />
                    <small>Sin espacios ni caracteres especiales</small>
                  </div>

                  <div className="form-group">
                    <label>Etiqueta <span className="required">*</span></label>
                    <input
                      type="text"
                      value={currentField.label}
                      onChange={(e) => setCurrentField({ ...currentField, label: e.target.value })}
                      placeholder="Etiqueta visible"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Tipo de Campo</label>
                    <select
                      value={currentField.type}
                      onChange={(e) => setCurrentField({ ...currentField, type: e.target.value as any })}
                    >
                      {fieldTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Placeholder</label>
                    <input
                      type="text"
                      value={currentField.placeholder || ''}
                      onChange={(e) => setCurrentField({ ...currentField, placeholder: e.target.value })}
                      placeholder="Texto de ayuda"
                    />
                  </div>
                </div>

                {(currentField.type === 'select' || currentField.type === 'multiselect') && (
                  <>
                    <div className="form-group">
                      <label>Origen de Datos</label>
                      <select
                        value={currentField.dataSource?.type || 'static'}
                        onChange={(e) => setCurrentField({
                          ...currentField,
                          dataSource: {
                            ...currentField.dataSource,
                            type: e.target.value as 'static' | 'sql'
                          }
                        })}
                      >
                        <option value="static">Opciones Estáticas</option>
                        <option value="sql">Tabla SQL</option>
                      </select>
                    </div>

                    {currentField.dataSource?.type === 'static' ? (
                      <div className="form-group">
                        <label>Opciones (separadas por coma)</label>
                        <input
                          type="text"
                          value={currentField.options?.join(', ') || ''}
                          onChange={(e) => setCurrentField({
                            ...currentField,
                            options: e.target.value.split(',').map(o => o.trim()).filter(o => o)
                          })}
                          placeholder="Opción 1, Opción 2, Opción 3"
                        />
                      </div>
                    ) : (
                      <>
                        <div className="form-group">
                          <label>Nombre de la Tabla</label>
                          <input
                            type="text"
                            value={currentField.dataSource?.tableName || ''}
                            onChange={(e) => setCurrentField({
                              ...currentField,
                              dataSource: {
                                ...currentField.dataSource,
                                type: 'sql',
                                tableName: e.target.value
                              }
                            })}
                            placeholder="ej: Usuarios, Productos, Clientes"
                          />
                        </div>
                        <div className="form-row">
                          <div className="form-group">
                            <label>Campo Valor (ID)</label>
                            <input
                              type="text"
                              value={currentField.dataSource?.valueField || ''}
                              onChange={(e) => setCurrentField({
                                ...currentField,
                                dataSource: {
                                  ...currentField.dataSource,
                                  type: 'sql',
                                  valueField: e.target.value
                                }
                              })}
                              placeholder="ej: Id, UsuarioId"
                            />
                          </div>
                          <div className="form-group">
                            <label>Campo Etiqueta</label>
                            <input
                              type="text"
                              value={currentField.dataSource?.labelField || ''}
                              onChange={(e) => setCurrentField({
                                ...currentField,
                                dataSource: {
                                  ...currentField.dataSource,
                                  type: 'sql',
                                  labelField: e.target.value
                                }
                              })}
                              placeholder="ej: Nombre, Descripcion"
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </>
                )}

                {currentField.type === 'repeater' && (
                  <>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Mínimo de Items</label>
                        <input
                          type="number"
                          value={currentField.minItems || 0}
                          onChange={(e) => setCurrentField({
                            ...currentField,
                            minItems: parseInt(e.target.value) || 0
                          })}
                          placeholder="0"
                          min="0"
                        />
                      </div>
                      <div className="form-group">
                        <label>Máximo de Items</label>
                        <input
                          type="number"
                          value={currentField.maxItems || 10}
                          onChange={(e) => setCurrentField({
                            ...currentField,
                            maxItems: parseInt(e.target.value) || 10
                          })}
                          placeholder="10"
                          min="1"
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Etiqueta Botón Agregar</label>
                        <input
                          type="text"
                          value={currentField.addButtonLabel || ''}
                          onChange={(e) => setCurrentField({
                            ...currentField,
                            addButtonLabel: e.target.value
                          })}
                          placeholder="Agregar Item"
                        />
                      </div>
                      <div className="form-group">
                        <label>Etiqueta Botón Eliminar</label>
                        <input
                          type="text"
                          value={currentField.removeButtonLabel || ''}
                          onChange={(e) => setCurrentField({
                            ...currentField,
                            removeButtonLabel: e.target.value
                          })}
                          placeholder="Eliminar"
                        />
                      </div>
                    </div>
                    <p className="text-sm text-secondary">
                      Nota: Los campos del grupo repetitivo se configuran después de crear este campo.
                    </p>
                  </>
                )}

                {currentField.type === 'address' && (
                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={currentField.enableGeolocation || false}
                        onChange={(e) => setCurrentField({
                          ...currentField,
                          enableGeolocation: e.target.checked
                        })}
                      />
                      <span>Habilitar captura de geolocalización</span>
                    </label>
                    <p className="text-sm text-secondary">
                      La dirección se guardará en la tabla Direcciones con todos los campos necesarios.
                    </p>
                  </div>
                )}

                {currentField.type === 'fieldset' && (
                  <div className="form-group-checkbox">
                    <input
                      type="checkbox"
                      id="collapsible"
                      checked={currentField.collapsible || false}
                      onChange={(e) => setCurrentField({ ...currentField, collapsible: e.target.checked })}
                    />
                    <label htmlFor="collapsible">Permitir colapsar/expandir</label>
                  </div>
                )}
              </div>

              <div className="form-section">
                <h3>Diseño y Presentación</h3>

                <div className="form-row">
                  <div className="form-group">
                    <label>Posición en Columna</label>
                    <select
                      value={currentField.layout?.column || 'full'}
                      onChange={(e) => setCurrentField({
                        ...currentField,
                        layout: {
                          ...currentField.layout,
                          column: e.target.value as 'left' | 'right' | 'full'
                        }
                      })}
                    >
                      <option value="full">Ancho Completo</option>
                      <option value="left">Columna Izquierda</option>
                      <option value="right">Columna Derecha</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Ancho del Campo</label>
                    <select
                      value={currentField.layout?.width || 'full'}
                      onChange={(e) => setCurrentField({
                        ...currentField,
                        layout: {
                          ...currentField.layout,
                          width: e.target.value as 'half' | 'full'
                        }
                      })}
                    >
                      <option value="full">Ancho Completo</option>
                      <option value="half">Medio Ancho</option>
                    </select>
                  </div>
                </div>

                <div className="form-group-checkbox">
                  <input
                    type="checkbox"
                    id="required"
                    checked={currentField.required}
                    onChange={(e) => setCurrentField({ ...currentField, required: e.target.checked })}
                  />
                  <label htmlFor="required">Campo requerido</label>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={(e) => {
                  e.stopPropagation();
                  setShowFieldModal(false);
                }}>
                  Cancelar
                </button>
                <button type="button" className="btn-primary" onClick={(e) => {
                  e.stopPropagation();
                  handleSaveField();
                }}>
                  {editingIndex !== null ? 'Actualizar' : 'Agregar'}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default SchemaBuilder;
