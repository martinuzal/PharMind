import { useState, useCallback } from 'react';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import ToolboxSidebar from './ToolboxSidebar';
import CanvasArea from './CanvasArea';
import PropertiesPanel from './PropertiesPanel';
import type { FieldSchema, FormSchema, ToolboxItem, RepeaterField } from '../../types/formDesigner';
import { getToolboxItem } from '../../config/toolboxItems';

interface FormDesignerProps {
  initialSchema?: FormSchema;
  onChange?: (schema: FormSchema) => void;
}

const FormDesigner = ({ initialSchema, onChange }: FormDesignerProps) => {
  // State management
  const [fields, setFields] = useState<FieldSchema[]>(initialSchema?.fields || []);
  const [selectedFieldId, setSelectedFieldId] = useState<string | undefined>();
  const [draggedItem, setDraggedItem] = useState<ToolboxItem | null>(null);
  const [draggedField, setDraggedField] = useState<FieldSchema | null>(null);

  // Generate unique field ID
  const generateFieldId = useCallback((type: string): string => {
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
    const rowMap = new Map<number, FieldSchema[]>();
    fields.forEach(field => {
      if (!rowMap.has(field.position.row)) {
        rowMap.set(field.position.row, []);
      }
      rowMap.get(field.position.row)!.push(field);
    });

    // Find the last row
    const lastRowNum = Math.max(...Array.from(rowMap.keys()));
    const lastRow = rowMap.get(lastRowNum) || [];

    // Calculate used columns in last row
    let usedCols = 0;
    lastRow.forEach(field => {
      const endCol = field.position.col + field.span.cols;
      if (endCol > usedCols) {
        usedCols = endCol;
      }
    });

    // Check if new field fits in the current row
    if (usedCols + span <= 4) {
      return { row: lastRowNum, col: usedCols };
    }

    // Otherwise, start a new row
    return {
      row: lastRowNum + 1,
      col: 0,
    };
  }, [fields]);

  // Calculate next position for a specific row, excluding a specific field ID if provided
  const getPositionInRow = useCallback((targetRow: number, span: number, excludeFieldId?: string) => {
    // Find all fields in target row, excluding the field being moved
    const rowFields = fields.filter(f =>
      f.position.row === targetRow && f.id !== excludeFieldId
    );

    if (rowFields.length === 0) {
      return { row: targetRow, col: 0 };
    }

    // Calculate used columns in row
    let usedCols = 0;
    rowFields.forEach(field => {
      const endCol = field.position.col + field.span.cols;
      if (endCol > usedCols) {
        usedCols = endCol;
      }
    });

    // Check if field fits in the row
    if (usedCols + span <= 4) {
      return { row: targetRow, col: usedCols };
    }

    // If doesn't fit, create new row after this one
    return { row: targetRow + 1, col: 0 };
  }, [fields]);

  // Handle drag end event
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    // Reset dragged items
    setDraggedItem(null);
    setDraggedField(null);

    if (!over) return;

    const dragData = active.data.current;
    const overData = over.data.current;

    // Handle dropping from toolbox
    if (dragData?.source === 'toolbox') {
      const toolboxItem = dragData.item as ToolboxItem;

      // Check if dropped on repeater fields drop zone
      if (overData?.type === 'repeater-fields') {
        const targetFieldId = overData.fieldId;
        const targetField = fields.find(f => f.id === targetFieldId);

        if (targetField && targetField.repeaterConfig) {
          // Create new repeater field from toolbox item
          const newRepeaterField: RepeaterField = {
            type: toolboxItem.type,
            label: toolboxItem.label,
            name: toolboxItem.label.toLowerCase().replace(/\s+/g, '_'),
            placeholder: toolboxItem.defaultConfig.placeholder,
            required: toolboxItem.defaultConfig.required,
            options: toolboxItem.defaultConfig.options,
            validation: toolboxItem.defaultConfig.validation,
          };

          // Add the new field to the repeater config
          const updatedFields = fields.map(f => {
            if (f.id === targetFieldId) {
              return {
                ...f,
                repeaterConfig: {
                  ...f.repeaterConfig!,
                  fields: [...f.repeaterConfig!.fields, newRepeaterField]
                }
              };
            }
            return f;
          });

          setFields(updatedFields);

          // Notify parent of change
          if (onChange) {
            onChange({
              fields: updatedFields,
              layout: initialSchema?.layout || {
                columns: 4,
                spacing: 'normal',
                style: 'modern',
              },
              version: 1,
            });
          }
        }

        return; // Exit early after handling repeater field drop
      }

      const span = toolboxItem.defaultConfig.span?.cols || 2;

      let position;
      let fieldsToUpdate = fields;

      // Determine position based on drop target
      if (overData?.type === 'between-row') {
        // Dropped between rows - insert new row and shift subsequent rows
        const targetRow = overData.rowNum;
        position = { row: targetRow, col: 0 };

        // Shift all rows >= targetRow down by 1
        fieldsToUpdate = fields.map(field => {
          if (field.position.row >= targetRow) {
            return {
              ...field,
              position: { ...field.position, row: field.position.row + 1 }
            };
          }
          return field;
        });
      } else if (overData?.type === 'row') {
        // Dropped on specific row
        position = getPositionInRow(overData.rowNum, span);
      } else if (over.id === 'empty-canvas') {
        // Dropped on empty canvas
        position = { row: 0, col: 0 };
      } else {
        // Default behavior - add to last row
        position = getNextPosition(span);
      }

      // Create new field from toolbox item
      const newField: FieldSchema = {
        id: generateFieldId(toolboxItem.type),
        name: `field_${fieldsToUpdate.length + 1}`,
        type: toolboxItem.type,
        label: toolboxItem.label,
        placeholder: toolboxItem.defaultConfig.placeholder,
        required: toolboxItem.defaultConfig.required || false,
        defaultValue: toolboxItem.defaultConfig.defaultValue,
        options: toolboxItem.defaultConfig.options,
        validation: toolboxItem.defaultConfig.validation,
        helpText: toolboxItem.defaultConfig.helpText,
        position: position,
        span: { cols: span as 1 | 2 | 3 | 4 },
        order: fieldsToUpdate.length,
        icon: toolboxItem.icon,
        repeaterConfig: toolboxItem.defaultConfig.repeaterConfig,
      };

      const updatedFields = [...fieldsToUpdate, newField];
      setFields(updatedFields);

      // Notify parent of change
      if (onChange) {
        onChange({
          fields: updatedFields,
          layout: initialSchema?.layout || {
            columns: 4,
            spacing: 'normal',
            style: 'modern',
          },
          version: 1,
        });
      }
    }
    // Handle moving existing field between rows or within same row
    else if (dragData?.source === 'canvas') {
      const draggedField = dragData.field as FieldSchema;

      if (overData?.type === 'between-row') {
        // Dropped between rows - insert field in new row and shift subsequent rows
        const targetRow = overData.rowNum;

        // Remove the dragged field from its current position
        const fieldsWithoutDragged = fields.filter(f => f.id !== draggedField.id);

        // Shift all rows >= targetRow down by 1
        const fieldsToUpdate = fieldsWithoutDragged.map(field => {
          if (field.position.row >= targetRow) {
            return {
              ...field,
              position: { ...field.position, row: field.position.row + 1 }
            };
          }
          return field;
        });

        // Place the dragged field at the target row
        const updatedDraggedField: FieldSchema = {
          ...draggedField,
          position: { row: targetRow, col: 0 }
        };

        const updatedFields = [...fieldsToUpdate, updatedDraggedField];
        setFields(updatedFields);

        // Notify parent of change
        if (onChange) {
          onChange({
            fields: updatedFields,
            layout: initialSchema?.layout || {
              columns: 4,
              spacing: 'normal',
              style: 'modern',
            },
            version: 1,
          });
        }
      } else if (overData?.type === 'row') {
        // Dropped on an existing row - add to that specific row
        const targetRow = overData.rowNum;

        // Find all fields in target row, excluding the dragged field
        const rowFields = fields.filter(f =>
          f.position.row === targetRow && f.id !== draggedField.id
        );

        // Calculate used columns in target row
        let usedCols = 0;
        rowFields.forEach(field => {
          const endCol = field.position.col + field.span.cols;
          if (endCol > usedCols) {
            usedCols = endCol;
          }
        });

        // Calculate new column position for the dragged field
        let newCol = usedCols;

        // If field doesn't fit in target row, place it at column 0
        if (usedCols + draggedField.span.cols > 4) {
          newCol = 0;
        }

        const newPosition = { row: targetRow, col: newCol };

        // Only update if position actually changed
        if (newPosition.row !== draggedField.position.row || newPosition.col !== draggedField.position.col) {
          const updatedField: FieldSchema = {
            ...draggedField,
            position: newPosition
          };

          const updatedFields = fields.map(f =>
            f.id === draggedField.id ? updatedField : f
          );

          setFields(updatedFields);

          // Notify parent of change
          if (onChange) {
            onChange({
              fields: updatedFields,
              layout: initialSchema?.layout || {
                columns: 4,
                spacing: 'normal',
                style: 'modern',
              },
              version: 1,
            });
          }
        }
      }
    }
  }, [fields, generateFieldId, getNextPosition, getPositionInRow, initialSchema?.layout, onChange]);

  // Handle field selection
  const handleFieldSelect = useCallback((field: FieldSchema) => {
    setSelectedFieldId(field.id);
  }, []);

  // Handle field deletion
  const handleFieldDelete = useCallback((fieldId: string) => {
    const updatedFields = fields.filter(f => f.id !== fieldId);

    // Reorder remaining fields
    const reorderedFields = updatedFields.map((field, index) => ({
      ...field,
      order: index,
      position: {
        ...field.position,
        row: index,
      },
    }));

    setFields(reorderedFields);

    if (selectedFieldId === fieldId) {
      setSelectedFieldId(undefined);
    }

    // Notify parent of change
    if (onChange) {
      onChange({
        fields: reorderedFields,
        layout: initialSchema?.layout || {
          columns: 4,
          spacing: 'normal',
          style: 'modern',
        },
        version: 1,
      });
    }
  }, [fields, selectedFieldId, initialSchema?.layout, onChange]);

  // Handle field update
  const handleFieldUpdate = useCallback((updatedField: FieldSchema) => {
    const updatedFields = fields.map(f =>
      f.id === updatedField.id ? updatedField : f
    );
    setFields(updatedFields);

    // Notify parent of change
    if (onChange) {
      onChange({
        fields: updatedFields,
        layout: initialSchema?.layout || {
          columns: 4,
          spacing: 'normal',
          style: 'modern',
        },
        version: 1,
      });
    }
  }, [fields, initialSchema?.layout, onChange]);

  // Handle field move
  const handleFieldMove = useCallback((fieldId: string, direction: 'left' | 'right' | 'up' | 'down') => {
    const field = fields.find(f => f.id === fieldId);
    if (!field) return;

    let newCol = field.position.col;
    let newRow = field.position.row;

    if (direction === 'left') {
      newCol = Math.max(0, field.position.col - 1);
    } else if (direction === 'right') {
      newCol = Math.min(4 - field.span.cols, field.position.col + 1);
    }

    // Update field position
    const updatedField: FieldSchema = {
      ...field,
      position: { row: newRow, col: newCol }
    };

    handleFieldUpdate(updatedField);
  }, [fields, handleFieldUpdate]);

  // Handle drag start (for drag overlay)
  const handleDragStart = (event: any) => {
    const dragData = event.active.data.current;
    if (dragData?.source === 'toolbox') {
      setDraggedItem(dragData.item);
      setDraggedField(null);
    } else if (dragData?.source === 'canvas') {
      setDraggedField(dragData.field);
      setDraggedItem(null);
    }
  };

  // Get selected field
  const selectedField = selectedFieldId
    ? fields.find(f => f.id === selectedFieldId) || null
    : null;

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="form-designer">
        <ToolboxSidebar />

        <CanvasArea
          fields={fields}
          onFieldSelect={handleFieldSelect}
          selectedFieldId={selectedFieldId}
          onFieldDelete={handleFieldDelete}
          onFieldMove={handleFieldMove}
          onAddEmptyRow={undefined}
        />

        <PropertiesPanel
          field={selectedField}
          onUpdate={handleFieldUpdate}
          onClose={() => setSelectedFieldId(undefined)}
        />

        {/* Drag overlay for visual feedback */}
        <DragOverlay>
          {draggedItem ? (
            <div className="toolbox-item toolbox-item--dragging">
              <span className="material-icons toolbox-item-icon">
                {draggedItem.icon}
              </span>
              <span className="toolbox-item-label">{draggedItem.label}</span>
            </div>
          ) : draggedField ? (
            <div className="canvas-field canvas-field--dragging" style={{ width: '300px' }}>
              <div className="canvas-field-header">
                <div className="canvas-field-info">
                  <span className="material-icons canvas-field-icon">
                    {draggedField.icon || 'article'}
                  </span>
                  <div className="canvas-field-meta">
                    <span className="canvas-field-label">{draggedField.label}</span>
                    <span className="canvas-field-type">{draggedField.type}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
};

export default FormDesigner;
