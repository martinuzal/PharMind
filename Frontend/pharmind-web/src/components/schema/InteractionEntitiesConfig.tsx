import { useState, useEffect } from 'react';
import './InteractionEntitiesConfig.css';

interface EntityFieldConfig {
  visible: boolean;
  requerido: boolean;
  tiposPermitidos: string[];
  etiqueta: string;
}

interface EntitiesConfig {
  relacion?: EntityFieldConfig;
  agente?: EntityFieldConfig;
  cliente?: EntityFieldConfig;
}

interface TipoEntidad {
  id: string;
  nombre: string;
  subTipo: string;
}

interface InteractionEntitiesConfigProps {
  value: EntitiesConfig;
  onChange: (config: EntitiesConfig) => void;
}

const InteractionEntitiesConfig = ({ value, onChange }: InteractionEntitiesConfigProps) => {
  const [tiposRelacion, setTiposRelacion] = useState<TipoEntidad[]>([]);
  const [tiposCliente, setTiposCliente] = useState<TipoEntidad[]>([]);
  const [tiposAgente, setTiposAgente] = useState<TipoEntidad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTiposEntidades();
  }, []);

  const loadTiposEntidades = async () => {
    try {
      const [relacionesRes, clientesRes, agentesRes] = await Promise.all([
        fetch('http://localhost:5209/api/EsquemasPersonalizados/tipo/Relacion'),
        fetch('http://localhost:5209/api/EsquemasPersonalizados/tipo/Cliente'),
        fetch('http://localhost:5209/api/EsquemasPersonalizados/tipo/Agente')
      ]);

      if (relacionesRes.ok) {
        const data = await relacionesRes.json();
        setTiposRelacion(data);
      }
      if (clientesRes.ok) {
        const data = await clientesRes.json();
        setTiposCliente(data);
      }
      if (agentesRes.ok) {
        const data = await agentesRes.json();
        setTiposAgente(data);
      }
    } catch (error) {
      console.error('Error loading tipos de entidades:', error);
    } finally {
      setLoading(false);
    }
  };

  const defaultConfig: EntitiesConfig = {
    relacion: {
      visible: true,
      requerido: true,
      tiposPermitidos: [],
      etiqueta: 'Relación'
    },
    agente: {
      visible: true,
      requerido: true,
      tiposPermitidos: [],
      etiqueta: 'Agente'
    },
    cliente: {
      visible: true,
      requerido: true,
      tiposPermitidos: [],
      etiqueta: 'Cliente'
    }
  };

  const config = { ...defaultConfig, ...value };

  const handleFieldChange = (
    field: 'relacion' | 'agente' | 'cliente',
    property: keyof EntityFieldConfig,
    newValue: any
  ) => {
    const updatedConfig = {
      ...config,
      [field]: {
        ...config[field],
        [property]: newValue
      }
    };
    onChange(updatedConfig);
  };

  const handleTipoToggle = (
    field: 'relacion' | 'agente' | 'cliente',
    tipoId: string
  ) => {
    const currentTipos = config[field]?.tiposPermitidos || [];
    const newTipos = currentTipos.includes(tipoId)
      ? currentTipos.filter(id => id !== tipoId)
      : [...currentTipos, tipoId];

    handleFieldChange(field, 'tiposPermitidos', newTipos);
  };

  const renderFieldConfig = (
    field: 'relacion' | 'agente' | 'cliente',
    defaultLabel: string,
    icon: string,
    tipos: TipoEntidad[]
  ) => {
    const fieldConfig = config[field];
    if (!fieldConfig) return null;

    return (
      <div className="entity-field-config">
        <div className="config-header">
          <div className="header-title">
            <span className="material-icons">{icon}</span>
            <h4>{defaultLabel}</h4>
          </div>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={fieldConfig.visible}
              onChange={(e) => handleFieldChange(field, 'visible', e.target.checked)}
            />
            <span>Visible</span>
          </label>
        </div>

        {fieldConfig.visible && (
          <>
            <div className="config-row">
              <label className="form-label">
                Etiqueta:
                <input
                  type="text"
                  value={fieldConfig.etiqueta}
                  onChange={(e) => handleFieldChange(field, 'etiqueta', e.target.value)}
                  className="form-input"
                  placeholder={defaultLabel}
                />
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={fieldConfig.requerido}
                  onChange={(e) => handleFieldChange(field, 'requerido', e.target.checked)}
                />
                <span>Requerido</span>
              </label>
            </div>

            <div className="config-row">
              <label className="form-label">
                Tipos Permitidos:
              </label>
              {loading ? (
                <div className="loading-text">Cargando tipos...</div>
              ) : (
                <div className="tipos-grid">
                  {tipos.map((tipo) => (
                    <label key={tipo.id} className="tipo-checkbox">
                      <input
                        type="checkbox"
                        checked={fieldConfig.tiposPermitidos.includes(tipo.id)}
                        onChange={() => handleTipoToggle(field, tipo.id)}
                      />
                      <span>{tipo.nombre}</span>
                    </label>
                  ))}
                  {tipos.length === 0 && (
                    <div className="empty-text">No hay tipos configurados</div>
                  )}
                </div>
              )}
              <small className="help-text">
                Si no se selecciona ninguno, se mostrarán todos los tipos
              </small>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="interaction-entities-config">
      <div className="config-section-header">
        <span className="material-icons">link</span>
        <h3>Configuración de Entidades</h3>
      </div>
      <p className="config-description">
        Define qué tipos de relaciones, clientes y agentes pueden ser seleccionados para crear interacciones
      </p>

      <div className="fields-container">
        {renderFieldConfig('relacion', 'Relación', 'sync_alt', tiposRelacion)}
        {renderFieldConfig('agente', 'Agente', 'badge', tiposAgente)}
        {renderFieldConfig('cliente', 'Cliente', 'person', tiposCliente)}
      </div>
    </div>
  );
};

export default InteractionEntitiesConfig;
