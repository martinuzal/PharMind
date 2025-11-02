import { useDraggable } from '@dnd-kit/core';
import { TOOLBOX_CATEGORIES } from '../../config/toolboxItems';
import type { ToolboxItem } from '../../types/formDesigner';

interface ToolboxSidebarProps {
  onItemSelect?: (item: ToolboxItem) => void;
}

// Draggable toolbox item component
const DraggableToolboxItem = ({ item }: { item: ToolboxItem }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `toolbox-${item.id}`,
    data: { item, source: 'toolbox' },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="toolbox-item"
      title={item.description}
    >
      <span className="material-icons toolbox-item-icon">{item.icon}</span>
      <span className="toolbox-item-label">{item.label}</span>
    </div>
  );
};

const ToolboxSidebar = ({ onItemSelect }: ToolboxSidebarProps) => {
  return (
    <div className="toolbox-sidebar">
      <div className="toolbox-header">
        <h3>Controles</h3>
        <p className="toolbox-subtitle">Arrastra para agregar</p>
      </div>

      <div className="toolbox-content">
        {/* Basic Fields */}
        <div className="toolbox-category">
          <div className="toolbox-category-header">
            <span className="material-icons">widgets</span>
            <span>Básicos</span>
          </div>
          <div className="toolbox-items">
            {TOOLBOX_CATEGORIES.basic.map((item) => (
              <DraggableToolboxItem key={item.id} item={item} />
            ))}
          </div>
        </div>

        {/* Advanced Fields */}
        <div className="toolbox-category">
          <div className="toolbox-category-header">
            <span className="material-icons">tune</span>
            <span>Avanzados</span>
          </div>
          <div className="toolbox-items">
            {TOOLBOX_CATEGORIES.advanced.map((item) => (
              <DraggableToolboxItem key={item.id} item={item} />
            ))}
          </div>
        </div>

        {/* Specialized Fields */}
        <div className="toolbox-category">
          <div className="toolbox-category-header">
            <span className="material-icons">star</span>
            <span>Especializados</span>
          </div>
          <div className="toolbox-items">
            {TOOLBOX_CATEGORIES.specialized.map((item) => (
              <DraggableToolboxItem key={item.id} item={item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToolboxSidebar;
