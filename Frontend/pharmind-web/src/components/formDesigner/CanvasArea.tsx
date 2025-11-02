import { useDroppable, useDraggable } from '@dnd-kit/core';
import type { FieldSchema } from '../../types/formDesigner';

interface CanvasAreaProps {
  fields: FieldSchema[];
  onFieldSelect?: (field: FieldSchema) => void;
  selectedFieldId?: string;
  onFieldDelete?: (fieldId: string) => void;
  onFieldMove?: (fieldId: string, direction: 'left' | 'right' | 'up' | 'down') => void;
  onAddEmptyRow?: () => void;
}

// Component for drop zone between rows
const BetweenRowDropZone = ({ rowNum }: { rowNum: number }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `between-row-${rowNum}`,
    data: { type: 'between-row', rowNum }
  });

  return (
    <div
      ref={setNodeRef}
      className={`canvas-between-row-drop ${isOver ? 'canvas-between-row-drop--over' : ''}`}
    >
      {isOver && (
        <div className="canvas-between-row-indicator">
          <span className="material-icons">add</span>
          <span>Insertar nueva fila aquí</span>
        </div>
      )}
    </div>
  );
};

// Component for individual row droppable area
const DroppableRow = ({
  rowNum,
  rowFields,
  selectedFieldId,
  onFieldSelect,
  onFieldDelete,
  onFieldMove
}: {
  rowNum: number;
  rowFields: FieldSchema[];
  selectedFieldId?: string;
  onFieldSelect?: (field: FieldSchema) => void;
  onFieldDelete?: (fieldId: string) => void;
  onFieldMove?: (fieldId: string, direction: 'left' | 'right' | 'up' | 'down') => void;
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `row-${rowNum}`,
    data: { type: 'row', rowNum }
  });

  return (
    <div
      ref={setNodeRef}
      key={rowNum}
      className={`canvas-grid-row ${isOver ? 'canvas-grid-row--over' : ''}`}
    >
      {rowFields.map((field) => (
        <DraggableField
          key={field.id}
          field={field}
          selectedFieldId={selectedFieldId}
          onFieldSelect={onFieldSelect}
          onFieldDelete={onFieldDelete}
          onFieldMove={onFieldMove}
        />
      ))}
    </div>
  );
};

// Component for individual draggable field
const DraggableField = ({
  field,
  selectedFieldId,
  onFieldSelect,
  onFieldDelete,
  onFieldMove
}: {
  field: FieldSchema;
  selectedFieldId?: string;
  onFieldSelect?: (field: FieldSchema) => void;
  onFieldDelete?: (fieldId: string) => void;
  onFieldMove?: (fieldId: string, direction: 'left' | 'right' | 'up' | 'down') => void;
}) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: field.id,
    data: {
      source: 'canvas',
      field: field
    }
  });

  const handleFieldClick = (e: React.MouseEvent) => {
    // Only select if clicking on the field itself, not on buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    onFieldSelect?.(field);
  };

  return (
    <div
      ref={setNodeRef}
      className={`canvas-field ${selectedFieldId === field.id ? 'canvas-field--selected' : ''} ${isDragging ? 'canvas-field--dragging' : ''}`}
      onClick={handleFieldClick}
      style={{
        gridColumnStart: field.position.col + 1, // CSS Grid columns are 1-indexed
        gridColumnEnd: `span ${field.span.cols}`,
      }}
    >
      {/* Field header */}
      <div className="canvas-field-header">
        <div
          className="canvas-field-info"
          {...attributes}
          {...listeners}
          style={{ cursor: 'grab', flex: 1 }}
        >
          <span className="material-icons canvas-field-icon">
            {field.icon || 'article'}
          </span>
          <div className="canvas-field-meta">
            <span className="canvas-field-label">{field.label}</span>
            <span className="canvas-field-type">{field.type}</span>
          </div>
        </div>
        <div className="canvas-field-actions">
          {field.required && (
            <span className="canvas-field-badge" title="Campo requerido">
              *
            </span>
          )}
          <div className="canvas-field-move-controls">
            <button
              className="btn-icon btn-icon-sm"
              onClick={(e) => {
                e.stopPropagation();
                onFieldMove?.(field.id, 'left');
              }}
              title="Mover a la izquierda"
              disabled={field.position.col === 0}
            >
              <span className="material-icons">chevron_left</span>
            </button>
            <button
              className="btn-icon btn-icon-sm"
              onClick={(e) => {
                e.stopPropagation();
                onFieldMove?.(field.id, 'right');
              }}
              title="Mover a la derecha"
              disabled={field.position.col + field.span.cols >= 4}
            >
              <span className="material-icons">chevron_right</span>
            </button>
          </div>
          <button
            className="canvas-field-delete"
            onClick={(e) => {
              e.stopPropagation();
              onFieldDelete?.(field.id);
            }}
            title="Eliminar campo"
          >
            <span className="material-icons">delete</span>
          </button>
        </div>
      </div>

      {/* Field preview */}
      <div className="canvas-field-preview">
        {field.type === 'repeater' ? (
          <div className="canvas-repeater-preview">
            <div className={`canvas-repeater-item ${field.repeaterConfig?.layout?.displayMode === 'card' ? 'canvas-repeater-item--card' : ''}`}>
              <div className="canvas-repeater-item-header">
                <span className="canvas-repeater-item-label">
                  {field.repeaterConfig?.itemLabelTemplate?.replace('{index}', '1') || 'Elemento 1'}
                </span>
                <button className="canvas-repeater-remove-btn" disabled>
                  <span className="material-icons">close</span>
                </button>
              </div>
              <div
                className="canvas-repeater-fields"
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${field.repeaterConfig?.layout?.columns || 2}, 1fr)`,
                  gap: field.repeaterConfig?.layout?.spacing === 'compact' ? '8px' : field.repeaterConfig?.layout?.spacing === 'spacious' ? '20px' : '12px'
                }}
              >
                {field.repeaterConfig?.fields.map((subField, idx) => (
                  <div
                    key={idx}
                    className="canvas-repeater-field"
                    style={{
                      gridColumnStart: (subField.position?.col ?? 0) + 1,
                      gridColumnEnd: `span ${subField.span?.cols ?? 1}`,
                    }}
                  >
                    <label className="canvas-repeater-field-label">
                      {subField.label}
                      {subField.required && <span className="canvas-required-asterisk">*</span>}
                    </label>
                    {subField.type === 'text' || subField.type === 'email' ||
                     subField.type === 'phone' || subField.type === 'url' ||
                     subField.type === 'number' ? (
                      <input
                        type={subField.type}
                        placeholder={subField.placeholder}
                        disabled
                        className="canvas-preview-input canvas-preview-input--small"
                      />
                    ) : subField.type === 'textarea' ? (
                      <textarea
                        placeholder={subField.placeholder}
                        disabled
                        className="canvas-preview-textarea canvas-preview-textarea--small"
                      />
                    ) : subField.type === 'select' ? (
                      <select disabled className="canvas-preview-select canvas-preview-select--small">
                        <option>{subField.placeholder || 'Seleccionar...'}</option>
                      </select>
                    ) : subField.type === 'checkbox' ? (
                      <label className="canvas-preview-checkbox canvas-preview-checkbox--small">
                        <input type="checkbox" disabled />
                        <span>{subField.label}</span>
                      </label>
                    ) : subField.type === 'radio' && subField.options ? (
                      <div className="canvas-preview-radio-group canvas-preview-radio-group--small">
                        {subField.options.slice(0, 2).map((opt, optIdx) => (
                          <label key={optIdx} className="canvas-preview-radio">
                            <input type="radio" name={subField.name} disabled />
                            <span>{typeof opt === 'string' ? opt : opt.label}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <input
                        type="text"
                        placeholder={subField.placeholder}
                        disabled
                        className="canvas-preview-input canvas-preview-input--small"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
            <button className="canvas-repeater-add-btn" disabled>
              <span className="material-icons">add</span>
              {field.repeaterConfig?.addButtonText || 'Agregar'}
            </button>
          </div>
        ) : field.type === 'section' ? (
          <div className="canvas-section-preview">
            <div className="canvas-section-line"></div>
            <span className="canvas-section-text">{field.label}</span>
            <div className="canvas-section-line"></div>
          </div>
        ) : field.type === 'text' || field.type === 'email' ||
         field.type === 'phone' || field.type === 'url' ||
         field.type === 'number' ? (
          <input
            type={field.type}
            placeholder={field.placeholder}
            disabled
            className="canvas-preview-input"
          />
        ) : field.type === 'textarea' ? (
          <textarea
            placeholder={field.placeholder}
            disabled
            className="canvas-preview-textarea"
          />
        ) : field.type === 'select' ? (
          <select disabled className="canvas-preview-select">
            <option>{field.placeholder || 'Seleccionar...'}</option>
            {field.options?.map((opt, idx) => (
              <option key={idx}>
                {typeof opt === 'string' ? opt : opt.label}
              </option>
            ))}
          </select>
        ) : field.type === 'checkbox' ? (
          <label className="canvas-preview-checkbox">
            <input type="checkbox" disabled />
            <span>{field.label}</span>
          </label>
        ) : field.type === 'radio' ? (
          <div className="canvas-preview-radio-group">
            {field.options?.map((opt, idx) => (
              <label key={idx} className="canvas-preview-radio">
                <input type="radio" name={field.id} disabled />
                <span>{typeof opt === 'string' ? opt : opt.label}</span>
              </label>
            ))}
          </div>
        ) : field.type === 'date' || field.type === 'datetime' || field.type === 'time' ? (
          <input
            type={field.type === 'datetime' ? 'datetime-local' : field.type}
            disabled
            className="canvas-preview-input"
          />
        ) : (
          <div className="canvas-preview-placeholder">
            <span className="material-icons">preview</span>
            <span>Vista previa no disponible</span>
          </div>
        )}
      </div>

      {/* Field details */}
      <div className="canvas-field-details">
        <span className="canvas-field-detail">
          <span className="material-icons">grid_on</span>
          Col: {field.position.col}, Span: {field.span.cols}
        </span>
        {field.validation && (
          <span className="canvas-field-detail">
            <span className="material-icons">verified</span>
            Validación
          </span>
        )}
      </div>
    </div>
  );
};

const CanvasArea = ({
  fields,
  onFieldSelect,
  selectedFieldId,
  onFieldDelete,
  onFieldMove,
  onAddEmptyRow
}: CanvasAreaProps) => {
  // Organize fields by row
  const organizeFieldsByRow = () => {
    const rowMap = new Map<number, FieldSchema[]>();

    fields.forEach((field) => {
      const row = field.position.row;
      if (!rowMap.has(row)) {
        rowMap.set(row, []);
      }
      rowMap.get(row)!.push(field);
    });

    // Sort fields within each row by column
    rowMap.forEach((rowFields) => {
      rowFields.sort((a, b) => a.position.col - b.position.col);
    });

    // Convert to sorted array of rows
    return Array.from(rowMap.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([rowNum, rowFields]) => ({ rowNum, fields: rowFields }));
  };

  const rows = organizeFieldsByRow();

  // Create droppable area for empty canvas
  const { setNodeRef: setEmptyCanvasRef, isOver: isOverEmptyCanvas } = useDroppable({
    id: 'empty-canvas',
    data: { type: 'empty-canvas' }
  });

  return (
    <div className="canvas-area">
      <div className="canvas-header">
        <h3>Área de Diseño</h3>
        <div className="canvas-header-actions">
          <span className="canvas-field-count">{fields.length} campos</span>
          {onAddEmptyRow && (
            <button
              className="btn-add-row"
              onClick={onAddEmptyRow}
              title="Agregar fila vacía"
            >
              <span className="material-icons">add</span>
              Nueva Fila
            </button>
          )}
        </div>
      </div>

      <div className="canvas-content">
        {fields.length === 0 ? (
          <div
            ref={setEmptyCanvasRef}
            className={`canvas-empty-state ${isOverEmptyCanvas ? 'canvas-empty-state--over' : ''}`}
          >
            <span className="material-icons canvas-empty-icon">dashboard_customize</span>
            <p className="canvas-empty-text">
              Arrastra campos desde el panel izquierdo para comenzar
            </p>
            <p className="canvas-empty-hint">
              Los campos aparecerán en una cuadrícula de 4 columnas
            </p>
          </div>
        ) : (
          <div className="canvas-grid">
            {/* Drop zone before first row */}
            <BetweenRowDropZone rowNum={0} />

            {rows.map(({ rowNum, fields: rowFields }) => (
              <>
                <DroppableRow
                  key={rowNum}
                  rowNum={rowNum}
                  rowFields={rowFields}
                  selectedFieldId={selectedFieldId}
                  onFieldSelect={onFieldSelect}
                  onFieldDelete={onFieldDelete}
                  onFieldMove={onFieldMove}
                />

                {/* Droppable zone after each row */}
                <BetweenRowDropZone rowNum={rowNum + 1} />
              </>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CanvasArea;
