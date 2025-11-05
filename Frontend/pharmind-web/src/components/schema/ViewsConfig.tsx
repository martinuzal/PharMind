import { useState, useEffect } from 'react';
import './ViewsConfig.css';

interface FieldOption {
  name: string;
  label: string;
  type: string;
}

interface ViewConfig {
  camposVisibles: string[];
  ordenCampos: string[];
}

interface ViewsConfigData {
  mosaico?: ViewConfig;
  lista?: ViewConfig;
  card?: ViewConfig;
}

interface ViewsConfigProps {
  entidadTipo: string;
  value: ViewsConfigData;
  onChange: (config: ViewsConfigData) => void;
  availableFields: FieldOption[];
  staticFields: FieldOption[];
}

const ViewsConfig = ({ entidadTipo, value, onChange, availableFields, staticFields }: ViewsConfigProps) => {
  // Combinar campos estáticos y dinámicos
  const allFields = [...staticFields, ...availableFields];

  const defaultConfig: ViewsConfigData = {
    mosaico: {
      camposVisibles: [],
      ordenCampos: []
    },
    lista: {
      camposVisibles: [],
      ordenCampos: []
    },
    card: {
      camposVisibles: [],
      ordenCampos: []
    }
  };

  const config = {
    mosaico: { ...defaultConfig.mosaico, ...value.mosaico },
    lista: { ...defaultConfig.lista, ...value.lista },
    card: { ...defaultConfig.card, ...value.card }
  };

  const handleFieldToggle = (viewType: 'mosaico' | 'lista' | 'card', fieldName: string) => {
    const currentView = config[viewType];
    const isSelected = currentView.camposVisibles.includes(fieldName);

    let newCamposVisibles: string[];
    let newOrdenCampos: string[];

    if (isSelected) {
      newCamposVisibles = currentView.camposVisibles.filter(f => f !== fieldName);
      newOrdenCampos = currentView.ordenCampos.filter(f => f !== fieldName);
    } else {
      newCamposVisibles = [...currentView.camposVisibles, fieldName];
      newOrdenCampos = [...currentView.ordenCampos, fieldName];
    }

    onChange({
      ...config,
      [viewType]: {
        camposVisibles: newCamposVisibles,
        ordenCampos: newOrdenCampos
      }
    });
  };

  const handleSelectAll = (viewType: 'mosaico' | 'lista' | 'card') => {
    const allFieldNames = allFields.map(f => f.name);
    onChange({
      ...config,
      [viewType]: {
        camposVisibles: allFieldNames,
        ordenCampos: allFieldNames
      }
    });
  };

  const handleDeselectAll = (viewType: 'mosaico' | 'lista' | 'card') => {
    onChange({
      ...config,
      [viewType]: {
        camposVisibles: [],
        ordenCampos: []
      }
    });
  };

  const moveFieldUp = (viewType: 'mosaico' | 'lista' | 'card', fieldName: string) => {
    const currentView = config[viewType];
    const currentIndex = currentView.ordenCampos.indexOf(fieldName);

    if (currentIndex > 0) {
      const newOrden = [...currentView.ordenCampos];
      [newOrden[currentIndex - 1], newOrden[currentIndex]] = [newOrden[currentIndex], newOrden[currentIndex - 1]];

      onChange({
        ...config,
        [viewType]: {
          ...currentView,
          ordenCampos: newOrden
        }
      });
    }
  };

  const moveFieldDown = (viewType: 'mosaico' | 'lista' | 'card', fieldName: string) => {
    const currentView = config[viewType];
    const currentIndex = currentView.ordenCampos.indexOf(fieldName);

    if (currentIndex < currentView.ordenCampos.length - 1) {
      const newOrden = [...currentView.ordenCampos];
      [newOrden[currentIndex], newOrden[currentIndex + 1]] = [newOrden[currentIndex + 1], newOrden[currentIndex]];

      onChange({
        ...config,
        [viewType]: {
          ...currentView,
          ordenCampos: newOrden
        }
      });
    }
  };

  const renderViewConfig = (
    viewType: 'mosaico' | 'lista' | 'card',
    title: string,
    icon: string,
    description: string
  ) => {
    const viewConfig = config[viewType];
    const selectedFields = viewConfig.ordenCampos
      .map(fieldName => allFields.find(f => f.name === fieldName))
      .filter(f => f !== undefined) as FieldOption[];

    const unselectedFields = allFields.filter(
      f => !viewConfig.camposVisibles.includes(f.name)
    );

    return (
      <div className="view-config-section">
        <div className="view-header">
          <div className="view-title">
            <span className="material-icons">{icon}</span>
            <h4>{title}</h4>
          </div>
          <p className="view-description">{description}</p>
        </div>

        <div className="view-actions">
          <button
            type="button"
            className="btn-secondary btn-sm"
            onClick={() => handleSelectAll(viewType)}
          >
            <span className="material-icons">check_box</span>
            Seleccionar Todos
          </button>
          <button
            type="button"
            className="btn-secondary btn-sm"
            onClick={() => handleDeselectAll(viewType)}
          >
            <span className="material-icons">check_box_outline_blank</span>
            Deseleccionar Todos
          </button>
        </div>

        <div className="view-fields-container">
          <div className="fields-column">
            <h5>Campos Seleccionados ({selectedFields.length})</h5>
            <div className="fields-list selected-fields">
              {selectedFields.length === 0 ? (
                <div className="empty-state">
                  <span className="material-icons">info</span>
                  <p>No hay campos seleccionados</p>
                </div>
              ) : (
                selectedFields.map((field, index) => (
                  <div key={field.name} className="field-item selected">
                    <div className="field-info">
                      <span className="field-label">{field.label}</span>
                      <span className="field-type">{field.type}</span>
                    </div>
                    <div className="field-actions">
                      <button
                        type="button"
                        className="btn-icon-sm"
                        onClick={() => moveFieldUp(viewType, field.name)}
                        disabled={index === 0}
                        title="Mover arriba"
                      >
                        <span className="material-icons">arrow_upward</span>
                      </button>
                      <button
                        type="button"
                        className="btn-icon-sm"
                        onClick={() => moveFieldDown(viewType, field.name)}
                        disabled={index === selectedFields.length - 1}
                        title="Mover abajo"
                      >
                        <span className="material-icons">arrow_downward</span>
                      </button>
                      <button
                        type="button"
                        className="btn-icon-sm btn-remove"
                        onClick={() => handleFieldToggle(viewType, field.name)}
                        title="Quitar"
                      >
                        <span className="material-icons">remove</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="fields-column">
            <h5>Campos Disponibles ({unselectedFields.length})</h5>
            <div className="fields-list available-fields">
              {unselectedFields.length === 0 ? (
                <div className="empty-state">
                  <span className="material-icons">check_circle</span>
                  <p>Todos los campos están seleccionados</p>
                </div>
              ) : (
                unselectedFields.map(field => (
                  <div key={field.name} className="field-item available">
                    <div className="field-info">
                      <span className="field-label">{field.label}</span>
                      <span className="field-type">{field.type}</span>
                    </div>
                    <button
                      type="button"
                      className="btn-icon-sm btn-add"
                      onClick={() => handleFieldToggle(viewType, field.name)}
                      title="Agregar"
                    >
                      <span className="material-icons">add</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="views-config">
      <div className="config-section-header">
        <span className="material-icons">visibility</span>
        <h3>Configuración de Vistas</h3>
      </div>
      <p className="config-description">
        Define qué campos se mostrarán en cada tipo de visualización y en qué orden aparecerán
      </p>

      <div className="views-container">
        {renderViewConfig(
          'mosaico',
          'Vista Mosaico',
          'grid_view',
          'Vista de tarjetas en cuadrícula'
        )}
        {renderViewConfig(
          'lista',
          'Vista Lista',
          'view_list',
          'Vista de tabla con filas y columnas'
        )}
        {renderViewConfig(
          'card',
          'Vista Card',
          'view_agenda',
          'Vista de tarjetas detalladas'
        )}
      </div>
    </div>
  );
};

export default ViewsConfig;
