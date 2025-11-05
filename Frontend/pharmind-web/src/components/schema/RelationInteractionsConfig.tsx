import { useState, useEffect } from 'react';
import './RelationInteractionsConfig.css';

interface TipoInteraccion {
  id: string;
  nombre: string;
  subTipo: string;
  icono?: string;
  color?: string;
}

interface RelationInteractionsConfigProps {
  value: string[]; // Array de IDs de tipos de interacción permitidos
  onChange: (tiposPermitidos: string[]) => void;
}

const RelationInteractionsConfig = ({ value, onChange }: RelationInteractionsConfigProps) => {
  const [tiposInteraccion, setTiposInteraccion] = useState<TipoInteraccion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTiposInteraccion();
  }, []);

  const loadTiposInteraccion = async () => {
    try {
      const response = await fetch('http://localhost:5209/api/EsquemasPersonalizados/tipo/Interaccion');
      if (response.ok) {
        const data = await response.json();
        setTiposInteraccion(data);
      }
    } catch (error) {
      console.error('Error loading tipos de interacción:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (tipoId: string) => {
    const currentTipos = value || [];
    const newTipos = currentTipos.includes(tipoId)
      ? currentTipos.filter(id => id !== tipoId)
      : [...currentTipos, tipoId];
    onChange(newTipos);
  };

  const handleSelectAll = () => {
    if (value?.length === tiposInteraccion.length) {
      // Si todos están seleccionados, deseleccionar todos
      onChange([]);
    } else {
      // Seleccionar todos
      onChange(tiposInteraccion.map(t => t.id));
    }
  };

  const selectedCount = value?.length || 0;
  const allSelected = selectedCount === tiposInteraccion.length && tiposInteraccion.length > 0;

  return (
    <div className="relation-interactions-config">
      <div className="config-section-header">
        <span className="material-icons">assignment</span>
        <h3>Interacciones Permitidas</h3>
      </div>
      <p className="config-description">
        Selecciona los tipos de interacciones que se pueden ejecutar desde este tipo de relación.
        Si no seleccionas ninguna, se permitirán todas las interacciones.
      </p>

      <div className="actions-bar">
        <button
          className="btn-select-all"
          onClick={handleSelectAll}
          type="button"
        >
          <span className="material-icons">
            {allSelected ? 'deselect' : 'select_all'}
          </span>
          <span>{allSelected ? 'Deseleccionar Todas' : 'Seleccionar Todas'}</span>
        </button>
        <span className="selection-count">
          {selectedCount} de {tiposInteraccion.length} seleccionadas
        </span>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Cargando tipos de interacción...</p>
        </div>
      ) : tiposInteraccion.length === 0 ? (
        <div className="empty-state">
          <span className="material-icons">assignment</span>
          <p>No hay tipos de interacción configurados</p>
          <small>Crea tipos de interacción primero en Administrar Entidades</small>
        </div>
      ) : (
        <div className="interactions-grid">
          {tiposInteraccion.map((tipo) => {
            const isSelected = value?.includes(tipo.id) || false;
            return (
              <label
                key={tipo.id}
                className={`interaction-card ${isSelected ? 'selected' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleToggle(tipo.id)}
                  className="checkbox-hidden"
                />
                <div className="card-check">
                  <span className="material-icons">
                    {isSelected ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                </div>
                <div
                  className="card-icon"
                  style={{
                    background: tipo.color ? `${tipo.color}20` : 'rgba(77, 184, 184, 0.1)',
                    color: tipo.color || 'var(--accent-color)'
                  }}
                >
                  <span className="material-icons">
                    {tipo.icono || 'assignment'}
                  </span>
                </div>
                <div className="card-info">
                  <h4>{tipo.nombre}</h4>
                  <span className="card-subtitle">{tipo.subTipo}</span>
                </div>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RelationInteractionsConfig;
