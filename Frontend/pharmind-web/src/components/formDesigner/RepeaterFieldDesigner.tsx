import { useState, useCallback, Fragment } from 'react';
import { DndContext, DragOverlay, useDroppable, useDraggable } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import type { RepeaterField, RepeaterLayout, ToolboxItem } from '../../types/formDesigner';
import { getToolboxItem } from '../../config/toolboxItems';

interface RepeaterFieldDesignerProps {
  fields: RepeaterField[];
  layout: RepeaterLayout;
  onSave: (fields: RepeaterField[], layout: RepeaterLayout) => void;
  onCancel: () => void;
}

// Simplified toolbox for repeater fields (no nested repeaters or sections)
const REPEATER_TOOLBOX_ITEMS = [
  'text', 'number', 'email', 'phone', 'textarea', 'select',
  'checkbox', 'radio', 'date', 'datetime', 'time', 'file',
  'image', 'color', 'url', 'slider', 'rating', 'tags'
];

// Mini Toolbox Sidebar Component
const MiniToolboxSidebar = () => {
  const toolboxItems = REPEATER_TOOLBOX_ITEMS
    .map(type => getToolboxItem(type))
    .filter(item => item !== undefined) as ToolboxItem[];

  return (
    <div className="repeater-designer-toolbox">
      <div className="repeater-designer-toolbox-header">
        <span className="material-icons">widgets</span>
        <h4>Campos</h4>
      </div>
      <div className="repeater-designer-toolbox-items">
        {toolboxItems.map(item => (
          <DraggableToolboxItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
};

// Draggable Toolbox Item
const DraggableToolboxItem = ({ item }: { item: ToolboxItem }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `repeater-toolbox-${item.id}`,
    data: {
      source: 'repeater-toolbox',
      item: item
    }
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`repeater-toolbox-item ${isDragging ? 'repeater-toolbox-item--dragging' : ''}`}
    >
      <span className="material-icons repeater-toolbox-item-icon">{item.icon}</span>
      <span className="repeater-toolbox-item-label">{item.label}</span>
    </div>
  );
};

// Mini Properties Panel Component
const MiniPropertiesPanel = ({
  field,
  onUpdate,
  onClose
}: {
  field: RepeaterField | null;
  onUpdate: (field: RepeaterField) => void;
  onClose: () => void;
}) => {
  if (!field) {
    return (
      <div className="repeater-properties-panel repeater-properties-panel--empty">
        <div className="repeater-properties-empty">
          <span className="material-icons">settings</span>
          <p>Selecciona un campo para editar</p>
        </div>
      </div>
    );
  }

  const handleChange = (updates: Partial<RepeaterField>) => {
    onUpdate({ ...field, ...updates });
  };

  return (
    <div className="repeater-properties-panel">
      <div className="repeater-properties-header">
        <h4>Propiedades</h4>
        <button className="btn-icon-mini" onClick={onClose} title="Cerrar">
          <span className="material-icons">close</span>
        </button>
      </div>

      <div className="repeater-properties-content">
        {/* Basic Properties */}
        <div className="repeater-property-section">
          <h5>Básico</h5>

          <div className="repeater-property-group">
            <label>Etiqueta</label>
            <input
              type="text"
              value={field.label}
              onChange={(e) => handleChange({ label: e.target.value })}
              placeholder="Etiqueta del campo"
            />
          </div>

          <div className="repeater-property-group">
            <label>Nombre</label>
            <input
              type="text"
              value={field.name}
              onChange={(e) => handleChange({ name: e.target.value })}
              placeholder="nombre_campo"
            />
          </div>

          <div className="repeater-property-group">
            <label>Placeholder</label>
            <input
              type="text"
              value={field.placeholder || ''}
              onChange={(e) => handleChange({ placeholder: e.target.value })}
              placeholder="Texto de ayuda..."
            />
          </div>

          <div className="repeater-property-checkbox">
            <input
              type="checkbox"
              id="repeater-field-required"
              checked={field.required || false}
              onChange={(e) => handleChange({ required: e.target.checked })}
            />
            <label htmlFor="repeater-field-required">Campo requerido</label>
          </div>
        </div>

        {/* Options for select/radio */}
        {(field.type === 'select' || field.type === 'radio') && (
          <div className="repeater-property-section">
            <h5>Opciones</h5>
            <div className="repeater-property-group">
              <label>Opciones (una por línea)</label>
              <textarea
                rows={4}
                value={
                  Array.isArray(field.options)
                    ? field.options
                        .map((opt) => (typeof opt === 'string' ? opt : opt.label))
                        .join('\n')
                    : ''
                }
                onChange={(e) => {
                  const options = e.target.value.split('\n').filter((o) => o.trim());
                  handleChange({ options });
                }}
                placeholder="Opción 1&#10;Opción 2&#10;Opción 3"
              />
            </div>
          </div>
        )}

        {/* Layout */}
        <div className="repeater-property-section">
          <h5>Diseño</h5>

          <div className="repeater-property-group">
            <label>Ancho (columnas)</label>
            <select
              value={field.span?.cols || 1}
              onChange={(e) =>
                handleChange({ span: { cols: parseInt(e.target.value) as 1 | 2 | 3 | 4 } })
              }
            >
              <option value="1">1 columna</option>
              <option value="2">2 columnas</option>
              <option value="3">3 columnas</option>
              <option value="4">4 columnas</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

// Mini Canvas Component
const MiniCanvasArea = ({
  fields,
  columns,
  onFieldSelect,
  selectedFieldId,
  onFieldDelete
}: {
  fields: RepeaterField[];
  columns: number;
  onFieldSelect: (field: RepeaterField) => void;
  selectedFieldId?: string;
  onFieldDelete: (fieldId: string) => void;
}) => {
  // Organize fields by row
  const organizeFieldsByRow = () => {
    const rowMap = new Map<number, RepeaterField[]>();

    fields.forEach((field) => {
      const row = field.position?.row ?? 0;
      if (!rowMap.has(row)) {
        rowMap.set(row, []);
      }
      rowMap.get(row)!.push(field);
    });

    // Sort fields within each row by column
    rowMap.forEach((rowFields) => {
      rowFields.sort((a, b) => (a.position?.col ?? 0) - (b.position?.col ?? 0));
    });

    // Convert to sorted array of rows
    return Array.from(rowMap.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([rowNum, rowFields]) => ({ rowNum, fields: rowFields }));
  };

  const rows = organizeFieldsByRow();

  // Create droppable area for empty canvas
  const { setNodeRef: setEmptyCanvasRef, isOver: isOverEmptyCanvas } = useDroppable({
    id: 'repeater-empty-canvas',
    data: { type: 'repeater-empty-canvas' }
  });

  return (
    <div className="repeater-designer-canvas">
      <div className="repeater-designer-canvas-header">
        <h4>Vista Previa</h4>
        <span className="repeater-field-count">{fields.length} campos</span>
      </div>

      <div className="repeater-designer-canvas-content">
        {fields.length === 0 ? (
          <div
            ref={setEmptyCanvasRef}
            className={`repeater-canvas-empty ${isOverEmptyCanvas ? 'repeater-canvas-empty--over' : ''}`}
          >
            <span className="material-icons">dashboard_customize</span>
            <p>Arrastra campos aquí para comenzar</p>
          </div>
        ) : (
          <div className="repeater-canvas-grid" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {/* Drop zone before first row */}
            <BetweenRowDropZone rowNum={0} columns={columns} />

            {rows.map(({ rowNum, fields: rowFields }) => (
              <Fragment key={rowNum}>
                <DroppableRow
                  rowNum={rowNum}
                  rowFields={rowFields}
                  columns={columns}
                  selectedFieldId={selectedFieldId}
                  onFieldSelect={onFieldSelect}
                  onFieldDelete={onFieldDelete}
                />

                {/* Drop zone after each row */}
                <BetweenRowDropZone rowNum={rowNum + 1} columns={columns} />
              </Fragment>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Between Row Drop Zone
const BetweenRowDropZone = ({ rowNum, columns }: { rowNum: number; columns: number }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `repeater-between-row-${rowNum}`,
    data: { type: 'repeater-between-row', rowNum }
  });

  return (
    <div
      ref={setNodeRef}
      className={`repeater-between-row-drop ${isOver ? 'repeater-between-row-drop--over' : ''}`}
      style={{ gridColumn: `1 / span ${columns}` }}
    >
      {isOver && (
        <div className="repeater-between-row-indicator">
          <span className="material-icons">add</span>
          <span>Insertar nueva fila aquí</span>
        </div>
      )}
    </div>
  );
};

// Droppable Row
const DroppableRow = ({
  rowNum,
  rowFields,
  columns,
  selectedFieldId,
  onFieldSelect,
  onFieldDelete
}: {
  rowNum: number;
  rowFields: RepeaterField[];
  columns: number;
  selectedFieldId?: string;
  onFieldSelect: (field: RepeaterField) => void;
  onFieldDelete: (fieldId: string) => void;
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `repeater-row-${rowNum}`,
    data: { type: 'repeater-row', rowNum }
  });

  return (
    <>
      {rowFields.map((field) => (
        <DraggableField
          key={field.name}
          field={field}
          selectedFieldId={selectedFieldId}
          onFieldSelect={onFieldSelect}
          onFieldDelete={onFieldDelete}
        />
      ))}
    </>
  );
};

// Draggable Field
const DraggableField = ({
  field,
  selectedFieldId,
  onFieldSelect,
  onFieldDelete
}: {
  field: RepeaterField;
  selectedFieldId?: string;
  onFieldSelect: (field: RepeaterField) => void;
  onFieldDelete: (fieldId: string) => void;
}) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `repeater-field-${field.name}`,
    data: {
      source: 'repeater-canvas',
      field: field
    }
  });

  const handleFieldClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    onFieldSelect(field);
  };

  return (
    <div
      ref={setNodeRef}
      className={`repeater-canvas-field ${selectedFieldId === field.name ? 'repeater-canvas-field--selected' : ''} ${isDragging ? 'repeater-canvas-field--dragging' : ''}`}
      onClick={handleFieldClick}
      style={{
        gridColumnStart: (field.position?.col ?? 0) + 1,
        gridColumnEnd: `span ${field.span?.cols ?? 2}`,
      }}
    >
      {/* Drag handle area */}
      <div className="repeater-canvas-field-header">
        <div
          className="repeater-canvas-field-info"
          {...attributes}
          {...listeners}
          style={{ cursor: 'grab', flex: 1 }}
        >
          <span className="material-icons repeater-canvas-field-icon">
            {field.icon || 'article'}
          </span>
          <div className="repeater-canvas-field-meta">
            <span className="repeater-canvas-field-label">{field.label}</span>
            <span className="repeater-canvas-field-type">{field.type}</span>
          </div>
        </div>
        <div className="repeater-canvas-field-actions">
          {field.required && (
            <span className="repeater-canvas-field-badge" title="Campo requerido">*</span>
          )}
          <button
            className="repeater-canvas-field-delete"
            onClick={(e) => {
              e.stopPropagation();
              onFieldDelete(field.name);
            }}
            title="Eliminar campo"
          >
            <span className="material-icons">delete</span>
          </button>
        </div>
      </div>

      {/* Field preview */}
      <div className="repeater-canvas-field-preview">
        <input
          type="text"
          placeholder={field.placeholder}
          disabled
          className="repeater-preview-input"
        />
      </div>
    </div>
  );
};

// Main RepeaterFieldDesigner Component
const RepeaterFieldDesigner = ({
  fields: initialFields,
  layout: initialLayout,
  onSave,
  onCancel
}: RepeaterFieldDesignerProps) => {
  const [fields, setFields] = useState<RepeaterField[]>(initialFields);
  const [layout, setLayout] = useState<RepeaterLayout>(initialLayout);
  const [selectedFieldId, setSelectedFieldId] = useState<string | undefined>();
  const [draggedItem, setDraggedItem] = useState<ToolboxItem | null>(null);
  const [draggedField, setDraggedField] = useState<RepeaterField | null>(null);

  // Generate unique field ID for repeater fields
  const generateFieldName = useCallback((type: string): string => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    return `${type}_${timestamp}_${random}`;
  }, []);

  // Calculate next position for new field
  const getNextPosition = useCallback((span: number) => {
    if (fields.length === 0) {
      return { row: 0, col: 0 };
    }

    // Group fields by row
    const rowMap = new Map<number, RepeaterField[]>();
    fields.forEach(field => {
      const row = field.position?.row ?? 0;
      if (!rowMap.has(row)) {
        rowMap.set(row, []);
      }
      rowMap.get(row)!.push(field);
    });

    // Find the last row
    const lastRowNum = Math.max(...Array.from(rowMap.keys()));
    const lastRow = rowMap.get(lastRowNum) || [];

    // Calculate used columns in last row
    let usedCols = 0;
    lastRow.forEach(field => {
      const endCol = (field.position?.col ?? 0) + (field.span?.cols ?? 2);
      if (endCol > usedCols) {
        usedCols = endCol;
      }
    });

    // Check if new field fits in the current row
    if (usedCols + span <= layout.columns) {
      return { row: lastRowNum, col: usedCols };
    }

    // Otherwise, start a new row
    return {
      row: lastRowNum + 1,
      col: 0,
    };
  }, [fields, layout.columns]);

  // Handle drag end event
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    setDraggedItem(null);
    setDraggedField(null);

    if (!over) return;

    const dragData = active.data.current;
    const overData = over.data.current;

    // Handle dropping from toolbox
    if (dragData?.source === 'repeater-toolbox') {
      const toolboxItem = dragData.item as ToolboxItem;
      const span = Math.min(toolboxItem.defaultConfig.span?.cols || 2, layout.columns) as 1 | 2 | 3 | 4;

      let position;
      let fieldsToUpdate = fields;

      // Determine position based on drop target
      if (overData?.type === 'repeater-between-row') {
        const targetRow = overData.rowNum;
        position = { row: targetRow, col: 0 };

        // Shift all rows >= targetRow down by 1
        fieldsToUpdate = fields.map(field => {
          if ((field.position?.row ?? 0) >= targetRow) {
            return {
              ...field,
              position: { ...field.position!, row: (field.position?.row ?? 0) + 1 }
            };
          }
          return field;
        });
      } else if (overData?.type === 'repeater-row') {
        // Dropped on specific row - calculate position in that row
        const targetRow = overData.rowNum;
        const rowFields = fields.filter(f => (f.position?.row ?? 0) === targetRow);

        let usedCols = 0;
        rowFields.forEach(field => {
          const endCol = (field.position?.col ?? 0) + (field.span?.cols ?? 2);
          if (endCol > usedCols) {
            usedCols = endCol;
          }
        });

        position = usedCols + span <= layout.columns
          ? { row: targetRow, col: usedCols }
          : { row: targetRow + 1, col: 0 };
      } else if (over.id === 'repeater-empty-canvas') {
        position = { row: 0, col: 0 };
      } else {
        position = getNextPosition(span);
      }

      // Create new repeater field from toolbox item
      const newField: RepeaterField = {
        type: toolboxItem.type,
        label: toolboxItem.label,
        name: generateFieldName(toolboxItem.type),
        placeholder: toolboxItem.defaultConfig.placeholder,
        required: toolboxItem.defaultConfig.required || false,
        options: toolboxItem.defaultConfig.options,
        validation: toolboxItem.defaultConfig.validation,
        position: position,
        span: { cols: span },
        icon: toolboxItem.icon,
      };

      setFields([...fieldsToUpdate, newField]);
    }
    // Handle moving existing field between rows
    else if (dragData?.source === 'repeater-canvas') {
      const draggedField = dragData.field as RepeaterField;

      if (overData?.type === 'repeater-between-row') {
        const targetRow = overData.rowNum;

        // Remove the dragged field from its current position
        const fieldsWithoutDragged = fields.filter(f => f.name !== draggedField.name);

        // Shift all rows >= targetRow down by 1
        const fieldsToUpdate = fieldsWithoutDragged.map(field => {
          if ((field.position?.row ?? 0) >= targetRow) {
            return {
              ...field,
              position: { ...field.position!, row: (field.position?.row ?? 0) + 1 }
            };
          }
          return field;
        });

        // Place the dragged field at the target row
        const updatedDraggedField: RepeaterField = {
          ...draggedField,
          position: { row: targetRow, col: 0 }
        };

        setFields([...fieldsToUpdate, updatedDraggedField]);
      } else if (overData?.type === 'repeater-row') {
        const targetRow = overData.rowNum;

        // Find all fields in target row, excluding the dragged field
        const rowFields = fields.filter(f =>
          (f.position?.row ?? 0) === targetRow && f.name !== draggedField.name
        );

        // Calculate used columns in target row
        let usedCols = 0;
        rowFields.forEach(field => {
          const endCol = (field.position?.col ?? 0) + (field.span?.cols ?? 2);
          if (endCol > usedCols) {
            usedCols = endCol;
          }
        });

        // Calculate new column position for the dragged field
        let newCol = usedCols;

        // If field doesn't fit in target row, place it at column 0
        if (usedCols + (draggedField.span?.cols ?? 2) > layout.columns) {
          newCol = 0;
        }

        const newPosition = { row: targetRow, col: newCol };

        // Only update if position actually changed
        if (newPosition.row !== draggedField.position?.row || newPosition.col !== draggedField.position?.col) {
          const updatedField: RepeaterField = {
            ...draggedField,
            position: newPosition
          };

          setFields(fields.map(f =>
            f.name === draggedField.name ? updatedField : f
          ));
        }
      }
    }
  }, [fields, layout.columns, generateFieldName, getNextPosition]);

  // Handle drag start
  const handleDragStart = (event: any) => {
    const dragData = event.active.data.current;
    if (dragData?.source === 'repeater-toolbox') {
      setDraggedItem(dragData.item);
      setDraggedField(null);
    } else if (dragData?.source === 'repeater-canvas') {
      setDraggedField(dragData.field);
      setDraggedItem(null);
    }
  };

  // Handle field selection
  const handleFieldSelect = useCallback((field: RepeaterField) => {
    setSelectedFieldId(field.name);
  }, []);

  // Handle field deletion
  const handleFieldDelete = useCallback((fieldName: string) => {
    setFields(fields.filter(f => f.name !== fieldName));
    if (selectedFieldId === fieldName) {
      setSelectedFieldId(undefined);
    }
  }, [fields, selectedFieldId]);

  // Handle field update
  const handleFieldUpdate = useCallback((updatedField: RepeaterField) => {
    setFields(fields.map(f => f.name === updatedField.name ? updatedField : f));
  }, [fields]);

  // Get selected field
  const selectedField = selectedFieldId ? fields.find(f => f.name === selectedFieldId) || null : null;

  // Handle save
  const handleSave = () => {
    onSave(fields, layout);
  };

  return (
    <div className="repeater-field-designer-overlay">
      <div className="repeater-field-designer-modal">
        <div className="repeater-field-designer-header">
          <h3>Diseñador de Campos del Grupo</h3>
          <button className="btn-icon" onClick={onCancel} title="Cerrar">
            <span className="material-icons">close</span>
          </button>
        </div>

        <div className="repeater-field-designer-toolbar">
          <div className="repeater-designer-layout-controls">
            <label>
              Modo:
              <select
                value={layout.displayMode}
                onChange={(e) => setLayout({ ...layout, displayMode: e.target.value as 'card' | 'inline' | 'table' })}
              >
                <option value="card">Tarjetas</option>
                <option value="inline">En línea</option>
                <option value="table">Tabla</option>
              </select>
            </label>
            <label>
              Columnas:
              <select
                value={layout.columns}
                onChange={(e) => setLayout({ ...layout, columns: parseInt(e.target.value) as 1 | 2 | 3 | 4 })}
              >
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
              </select>
            </label>
          </div>
        </div>

        <DndContext
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="repeater-field-designer-content">
            <MiniToolboxSidebar />
            <MiniCanvasArea
              fields={fields}
              columns={layout.columns}
              onFieldSelect={handleFieldSelect}
              selectedFieldId={selectedFieldId}
              onFieldDelete={handleFieldDelete}
            />
            <MiniPropertiesPanel
              field={selectedField}
              onUpdate={handleFieldUpdate}
              onClose={() => setSelectedFieldId(undefined)}
            />
          </div>

          {/* Drag overlay for visual feedback */}
          <DragOverlay>
            {draggedItem ? (
              <div className="repeater-toolbox-item repeater-toolbox-item--dragging">
                <span className="material-icons repeater-toolbox-item-icon">
                  {draggedItem.icon}
                </span>
                <span className="repeater-toolbox-item-label">{draggedItem.label}</span>
              </div>
            ) : draggedField ? (
              <div className="repeater-canvas-field repeater-canvas-field--dragging" style={{ width: '200px' }}>
                <div className="repeater-canvas-field-header">
                  <div className="repeater-canvas-field-info">
                    <span className="material-icons repeater-canvas-field-icon">
                      {draggedField.icon || 'article'}
                    </span>
                    <div className="repeater-canvas-field-meta">
                      <span className="repeater-canvas-field-label">{draggedField.label}</span>
                      <span className="repeater-canvas-field-type">{draggedField.type}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        <div className="repeater-field-designer-footer">
          <button className="btn-secondary" onClick={onCancel}>
            Cancelar
          </button>
          <button className="btn-primary" onClick={handleSave}>
            <span className="material-icons">check</span>
            Guardar Diseño
          </button>
        </div>
      </div>
    </div>
  );
};

export default RepeaterFieldDesigner;
