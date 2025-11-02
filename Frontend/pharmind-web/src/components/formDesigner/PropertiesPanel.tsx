import { useState, useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import type { FieldSchema, RepeaterField, RepeaterLayout, ToolboxItem } from '../../types/formDesigner';
import RepeaterFieldDesigner from './RepeaterFieldDesigner';

interface PropertiesPanelProps {
  field: FieldSchema | null;
  onUpdate: (field: FieldSchema) => void;
  onClose: () => void;
  onDropFieldToRepeater?: (fieldId: string, toolboxItem: ToolboxItem) => void;
}

// Component for repeater fields drop zone
const RepeaterFieldsDropZone = ({
  field,
  onUpdate,
  onAddField
}: {
  field: FieldSchema;
  onUpdate: (updates: Partial<FieldSchema>) => void;
  onAddField: () => void;
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `repeater-fields-${field.id}`,
    data: {
      type: 'repeater-fields',
      fieldId: field.id
    }
  });

  if (!field.repeaterConfig) return null;

  return (
    <div className="property-group">
      <label>Campos del Grupo</label>

      {/* Existing fields list */}
      <div className="repeater-fields-list">
        {field.repeaterConfig.fields.map((subField, idx) => (
          <div key={idx} className="repeater-field-item">
            <div className="repeater-field-header">
              <span className="repeater-field-title">{subField.label}</span>
              <span className="repeater-field-type">{subField.type}</span>
            </div>
            <button
              className="btn-remove-repeater-field"
              onClick={() => {
                const updatedFields = field.repeaterConfig!.fields.filter((_, i) => i !== idx);
                onUpdate({
                  repeaterConfig: {
                    ...field.repeaterConfig!,
                    fields: updatedFields
                  }
                });
              }}
              title="Eliminar campo"
            >
              <span className="material-icons">delete</span>
            </button>
          </div>
        ))}
      </div>

      {/* Drop zone for adding new fields */}
      <div
        ref={setNodeRef}
        className={`repeater-fields-drop-zone ${isOver ? 'repeater-fields-drop-zone--over' : ''}`}
      >
        <div className="repeater-drop-zone-content">
          <span className="material-icons">add_circle</span>
          <span>Arrastra campos desde el panel izquierdo para agregarlos</span>
        </div>
      </div>
    </div>
  );
};

const PropertiesPanel = ({ field, onUpdate, onClose }: PropertiesPanelProps) => {
  const [showAddFieldForm, setShowAddFieldForm] = useState(false);
  const [showDesignerModal, setShowDesignerModal] = useState(false);
  const [newFieldType, setNewFieldType] = useState<string>('text');
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldPlaceholder, setNewFieldPlaceholder] = useState('');
  const [prevFieldId, setPrevFieldId] = useState<string | undefined>(field?.id);

  // Reset form state only when switching to a DIFFERENT field
  useEffect(() => {
    if (field?.id !== prevFieldId) {
      setShowAddFieldForm(false);
      setShowDesignerModal(false);
      setNewFieldType('text');
      setNewFieldLabel('');
      setNewFieldName('');
      setNewFieldPlaceholder('');
      setPrevFieldId(field?.id);
    }
  }, [field?.id, prevFieldId]);

  if (!field) {
    return (
      <div className="properties-panel properties-panel--empty">
        <div className="properties-empty-state">
          <span className="material-icons">settings</span>
          <p>Selecciona un campo para editar sus propiedades</p>
        </div>
      </div>
    );
  }

  const handleChange = (updates: Partial<FieldSchema>) => {
    onUpdate({ ...field, ...updates });
  };

  const handleAddRepeaterField = () => {
    if (!field.repeaterConfig || !newFieldLabel.trim()) return;

    const newField: RepeaterField = {
      type: newFieldType as any,
      label: newFieldLabel,
      name: newFieldName || newFieldLabel.toLowerCase().replace(/\s+/g, '_'),
      placeholder: newFieldPlaceholder,
    };

    handleChange({
      repeaterConfig: {
        ...field.repeaterConfig,
        fields: [...field.repeaterConfig.fields, newField]
      }
    });

    // Reset form
    setNewFieldLabel('');
    setNewFieldName('');
    setNewFieldPlaceholder('');
    setNewFieldType('text');
    setShowAddFieldForm(false);
  };

  // Handler for saving designer changes
  const handleSaveDesigner = (fields: RepeaterField[], layout: RepeaterLayout) => {
    // Always save the repeaterConfig, even if it didn't exist before
    handleChange({
      repeaterConfig: {
        ...(field.repeaterConfig || {}),
        fields: fields,
        layout: layout,
        // Preserve other config properties if they exist
        minItems: field.repeaterConfig?.minItems ?? 0,
        maxItems: field.repeaterConfig?.maxItems ?? 10,
        addButtonText: field.repeaterConfig?.addButtonText ?? 'Agregar',
        removeButtonText: field.repeaterConfig?.removeButtonText ?? 'Eliminar',
        itemLabelTemplate: field.repeaterConfig?.itemLabelTemplate ?? 'Elemento {index}'
      }
    });

    setShowDesignerModal(false);
  };

  return (
    <div className="properties-panel">
      <div className="properties-header">
        <h3>Propiedades del Campo</h3>
        <button className="btn-icon" onClick={onClose} title="Cerrar">
          <span className="material-icons">close</span>
        </button>
      </div>

      <div className="properties-content">
        {/* Basic Properties */}
        <div className="property-section">
          <h4>Información Básica</h4>

          <div className="property-group">
            <label>Nombre del Campo</label>
            <input
              type="text"
              value={field.name}
              onChange={(e) => handleChange({ name: e.target.value.replace(/\s/g, '_') })}
              placeholder="nombre_campo"
            />
            <small>Identificador único sin espacios</small>
          </div>

          <div className="property-group">
            <label>Etiqueta</label>
            <input
              type="text"
              value={field.label}
              onChange={(e) => handleChange({ label: e.target.value })}
              placeholder="Etiqueta visible"
            />
          </div>

          <div className="property-group">
            <label>Tipo de Campo</label>
            <input
              type="text"
              value={field.type}
              disabled
              className="input-disabled"
            />
            <small>El tipo no puede ser modificado</small>
          </div>

          <div className="property-group">
            <label>Placeholder</label>
            <input
              type="text"
              value={field.placeholder || ''}
              onChange={(e) => handleChange({ placeholder: e.target.value })}
              placeholder="Texto de ayuda..."
            />
          </div>
        </div>

        {/* Display Options */}
        <div className="property-section">
          <h4>Opciones de Visualización</h4>

          <div className="property-group">
            <label className="property-checkbox">
              <input
                type="checkbox"
                checked={field.required}
                onChange={(e) => handleChange({ required: e.target.checked })}
              />
              <span>Campo requerido</span>
            </label>
          </div>
        </div>

        {/* Layout Options */}
        <div className="property-section">
          <h4>Posición y Tamaño</h4>

          <div className="property-group">
            <label>Columna Inicial (0-3)</label>
            <select
              value={field.position.col}
              onChange={(e) => handleChange({
                position: {
                  ...field.position,
                  col: parseInt(e.target.value) as 0 | 1 | 2 | 3
                }
              })}
            >
              <option value="0">Columna 1</option>
              <option value="1">Columna 2</option>
              <option value="2">Columna 3</option>
              <option value="3">Columna 4</option>
            </select>
            <small>Posición horizontal donde comienza el campo</small>
          </div>

          <div className="property-group">
            <label>Ancho (Span de Columnas)</label>
            <select
              value={field.span.cols}
              onChange={(e) => handleChange({
                span: { cols: parseInt(e.target.value) as 1 | 2 | 3 | 4 }
              })}
            >
              <option value="1">1 columna (25%)</option>
              <option value="2">2 columnas (50%)</option>
              <option value="3">3 columnas (75%)</option>
              <option value="4">4 columnas (100%)</option>
            </select>
            <small>Cantidad de columnas que ocupa el campo</small>
          </div>
        </div>

        {/* Help Text */}
        {field.helpText !== undefined && (
          <div className="property-section">
            <h4>Información Adicional</h4>
            <div className="property-group">
              <label>Texto de Ayuda</label>
              <textarea
                value={field.helpText || ''}
                onChange={(e) => handleChange({ helpText: e.target.value })}
                placeholder="Descripción adicional..."
                rows={2}
              />
            </div>
          </div>
        )}

        {/* Options for select/radio */}
        {(field.type === 'select' || field.type === 'radio') && (
          <div className="property-section">
            <h4>Opciones</h4>
            <div className="property-group">
              <label>Opciones (una por línea)</label>
              <textarea
                value={
                  Array.isArray(field.options)
                    ? field.options.map(opt =>
                        typeof opt === 'string' ? opt : opt.label
                      ).join('\n')
                    : ''
                }
                onChange={(e) => {
                  const options = e.target.value
                    .split('\n')
                    .map(line => line.trim())
                    .filter(line => line);
                  handleChange({ options });
                }}
                rows={5}
                placeholder="Opción 1&#10;Opción 2&#10;Opción 3"
              />
            </div>
          </div>
        )}

        {/* Validation */}
        {field.validation !== undefined && (
          <div className="property-section">
            <h4>Validación</h4>

            {(field.type === 'text' || field.type === 'textarea') && (
              <>
                <div className="property-group">
                  <label>Longitud Mínima</label>
                  <input
                    type="number"
                    value={field.validation?.minLength || ''}
                    onChange={(e) => handleChange({
                      validation: {
                        ...field.validation,
                        minLength: e.target.value ? parseInt(e.target.value) : undefined
                      }
                    })}
                    min="0"
                  />
                </div>
                <div className="property-group">
                  <label>Longitud Máxima</label>
                  <input
                    type="number"
                    value={field.validation?.maxLength || ''}
                    onChange={(e) => handleChange({
                      validation: {
                        ...field.validation,
                        maxLength: e.target.value ? parseInt(e.target.value) : undefined
                      }
                    })}
                    min="0"
                  />
                </div>
              </>
            )}

            {(field.type === 'number' || field.type === 'slider') && (
              <>
                <div className="property-group">
                  <label>Valor Mínimo</label>
                  <input
                    type="number"
                    value={field.validation?.min ?? ''}
                    onChange={(e) => handleChange({
                      validation: {
                        ...field.validation,
                        min: e.target.value ? parseFloat(e.target.value) : undefined
                      }
                    })}
                  />
                </div>
                <div className="property-group">
                  <label>Valor Máximo</label>
                  <input
                    type="number"
                    value={field.validation?.max ?? ''}
                    onChange={(e) => handleChange({
                      validation: {
                        ...field.validation,
                        max: e.target.value ? parseFloat(e.target.value) : undefined
                      }
                    })}
                  />
                </div>
              </>
            )}

            <div className="property-group">
              <label>Mensaje de Error</label>
              <input
                type="text"
                value={field.validation?.message || ''}
                onChange={(e) => handleChange({
                  validation: {
                    ...field.validation,
                    message: e.target.value
                  }
                })}
                placeholder="Este campo es inválido"
              />
            </div>
          </div>
        )}

        {/* Repeater Configuration */}
        {field.type === 'repeater' && field.repeaterConfig && (
          <div className="property-section">
            <h4>Configuración del Grupo Repetitivo</h4>

            <div className="property-group">
              <button
                type="button"
                className="btn-open-designer"
                onClick={() => setShowDesignerModal(true)}
              >
                <span className="material-icons">dashboard_customize</span>
                Abrir Diseñador Visual
              </button>
              <small>Usa el diseñador visual para organizar los campos en tarjetas</small>
            </div>

            <div className="property-group">
              <label>Plantilla de Etiqueta</label>
              <input
                type="text"
                value={field.repeaterConfig.itemLabelTemplate || ''}
                onChange={(e) => handleChange({
                  repeaterConfig: {
                    ...field.repeaterConfig!,
                    itemLabelTemplate: e.target.value
                  }
                })}
                placeholder="Elemento {index}"
              />
              <small>Use {'{index}'} para mostrar el número del elemento</small>
            </div>

            <div className="property-group">
              <label>Mínimo de Elementos</label>
              <input
                type="number"
                value={field.repeaterConfig.minItems ?? ''}
                onChange={(e) => handleChange({
                  repeaterConfig: {
                    ...field.repeaterConfig!,
                    minItems: e.target.value ? parseInt(e.target.value) : undefined
                  }
                })}
                min="0"
                placeholder="0"
              />
            </div>

            <div className="property-group">
              <label>Máximo de Elementos</label>
              <input
                type="number"
                value={field.repeaterConfig.maxItems ?? ''}
                onChange={(e) => handleChange({
                  repeaterConfig: {
                    ...field.repeaterConfig!,
                    maxItems: e.target.value ? parseInt(e.target.value) : undefined
                  }
                })}
                min="1"
                placeholder="10"
              />
            </div>

            <div className="property-group">
              <label>Texto del Botón Agregar</label>
              <input
                type="text"
                value={field.repeaterConfig.addButtonText || ''}
                onChange={(e) => handleChange({
                  repeaterConfig: {
                    ...field.repeaterConfig!,
                    addButtonText: e.target.value
                  }
                })}
                placeholder="Agregar"
              />
            </div>

            <div className="property-group">
              <label>Texto del Botón Eliminar</label>
              <input
                type="text"
                value={field.repeaterConfig.removeButtonText || ''}
                onChange={(e) => handleChange({
                  repeaterConfig: {
                    ...field.repeaterConfig!,
                    removeButtonText: e.target.value
                  }
                })}
                placeholder="Eliminar"
              />
            </div>

            <RepeaterFieldsDropZone
              field={field}
              onUpdate={handleChange}
              onAddField={handleAddRepeaterField}
            />

            <div className="property-group">
              {showAddFieldForm ? (
                <div className="add-repeater-field-form">
                  <div className="form-row">
                    <label>Tipo de Campo</label>
                    <select
                      value={newFieldType}
                      onChange={(e) => setNewFieldType(e.target.value)}
                    >
                      <option value="text">Texto</option>
                      <option value="number">Número</option>
                      <option value="email">Email</option>
                      <option value="phone">Teléfono</option>
                      <option value="textarea">Área de texto</option>
                      <option value="select">Selección</option>
                      <option value="date">Fecha</option>
                      <option value="checkbox">Casilla</option>
                    </select>
                  </div>

                  <div className="form-row">
                    <label>Etiqueta *</label>
                    <input
                      type="text"
                      value={newFieldLabel}
                      onChange={(e) => setNewFieldLabel(e.target.value)}
                      placeholder="Nombre del campo"
                    />
                  </div>

                  <div className="form-row">
                    <label>Nombre Técnico</label>
                    <input
                      type="text"
                      value={newFieldName}
                      onChange={(e) => setNewFieldName(e.target.value)}
                      placeholder="Se genera automáticamente"
                    />
                  </div>

                  <div className="form-row">
                    <label>Placeholder</label>
                    <input
                      type="text"
                      value={newFieldPlaceholder}
                      onChange={(e) => setNewFieldPlaceholder(e.target.value)}
                      placeholder="Texto de ayuda..."
                    />
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      className="btn-add-field"
                      onClick={handleAddRepeaterField}
                      disabled={!newFieldLabel.trim()}
                    >
                      <span className="material-icons">check</span>
                      Agregar Campo
                    </button>
                    <button
                      type="button"
                      className="btn-cancel"
                      onClick={() => {
                        setShowAddFieldForm(false);
                        setNewFieldLabel('');
                        setNewFieldName('');
                        setNewFieldPlaceholder('');
                        setNewFieldType('text');
                      }}
                    >
                      <span className="material-icons">close</span>
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  className="btn-add-repeater-field-trigger"
                  onClick={() => setShowAddFieldForm(true)}
                >
                  <span className="material-icons">add_circle</span>
                  Agregar Campo al Grupo
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Repeater Field Designer Modal */}
      {showDesignerModal && (
        <RepeaterFieldDesigner
          fields={field.repeaterConfig?.fields || []}
          layout={field.repeaterConfig?.layout || {
            displayMode: 'card',
            columns: 2,
            spacing: 'normal'
          }}
          onSave={handleSaveDesigner}
          onCancel={() => setShowDesignerModal(false)}
        />
      )}
    </div>
  );
};

export default PropertiesPanel;
