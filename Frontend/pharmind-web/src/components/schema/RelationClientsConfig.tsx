import { useState, useEffect } from 'react';
import './RelationClientsConfig.css';

interface ClientFieldConfig {
  visible: boolean;
  requerido: boolean;
  tiposPermitidos: string[];
  etiqueta: string;
}

interface ClientesConfig {
  clientePrincipal?: ClientFieldConfig;
  clienteSecundario1?: ClientFieldConfig;
  clienteSecundario2?: ClientFieldConfig;
}

interface TipoCliente {
  id: string;
  nombre: string;
  subTipo: string;
}

interface RelationClientsConfigProps {
  value: ClientesConfig;
  onChange: (config: ClientesConfig) => void;
}

const RelationClientsConfig = ({ value, onChange }: RelationClientsConfigProps) => {
  const [tiposCliente, setTiposCliente] = useState<TipoCliente[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTiposCliente();
  }, []);

  const loadTiposCliente = async () => {
    try {
      const response = await fetch('http://localhost:5209/api/EsquemasPersonalizados/tipo/Cliente');
      if (response.ok) {
        const data = await response.json();
        setTiposCliente(data);
      }
    } catch (error) {
      console.error('Error loading tipos cliente:', error);
    } finally {
      setLoading(false);
    }
  };

  const defaultConfig: ClientesConfig = {
    clientePrincipal: {
      visible: true,
      requerido: true,
      tiposPermitidos: [],
      etiqueta: 'Cliente Principal'
    },
    clienteSecundario1: {
      visible: false,
      requerido: false,
      tiposPermitidos: [],
      etiqueta: 'Cliente Secundario 1'
    },
    clienteSecundario2: {
      visible: false,
      requerido: false,
      tiposPermitidos: [],
      etiqueta: 'Cliente Secundario 2'
    }
  };

  const config = { ...defaultConfig, ...value };

  const handleFieldChange = (
    field: 'clientePrincipal' | 'clienteSecundario1' | 'clienteSecundario2',
    property: keyof ClientFieldConfig,
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
    field: 'clientePrincipal' | 'clienteSecundario1' | 'clienteSecundario2',
    tipoId: string
  ) => {
    const currentTipos = config[field]?.tiposPermitidos || [];
    const newTipos = currentTipos.includes(tipoId)
      ? currentTipos.filter(id => id !== tipoId)
      : [...currentTipos, tipoId];

    handleFieldChange(field, 'tiposPermitidos', newTipos);
  };

  const renderFieldConfig = (
    field: 'clientePrincipal' | 'clienteSecundario1' | 'clienteSecundario2',
    defaultLabel: string
  ) => {
    const fieldConfig = config[field];
    if (!fieldConfig) return null;

    return (
      <div className="client-field-config">
        <div className="config-header">
          <h4>{defaultLabel}</h4>
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
                Tipos de Cliente Permitidos:
              </label>
              {loading ? (
                <div className="loading-text">Cargando tipos de cliente...</div>
              ) : (
                <div className="tipos-grid">
                  {tiposCliente.map((tipo) => (
                    <label key={tipo.id} className="tipo-checkbox">
                      <input
                        type="checkbox"
                        checked={fieldConfig.tiposPermitidos.includes(tipo.id)}
                        onChange={() => handleTipoToggle(field, tipo.id)}
                      />
                      <span>{tipo.nombre}</span>
                    </label>
                  ))}
                  {tiposCliente.length === 0 && (
                    <div className="empty-text">No hay tipos de cliente configurados</div>
                  )}
                </div>
              )}
              <small className="help-text">
                Si no se selecciona ninguno, se mostrarán todos los tipos de clientes
              </small>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="relation-clients-config">
      <div className="config-section-header">
        <span className="material-icons">groups</span>
        <h3>Configuración de Clientes</h3>
      </div>
      <p className="config-description">
        Define qué tipos de clientes pueden ser seleccionados en cada campo de la relación
      </p>

      <div className="fields-container">
        {renderFieldConfig('clientePrincipal', 'Cliente Principal')}
        {renderFieldConfig('clienteSecundario1', 'Cliente Secundario 1')}
        {renderFieldConfig('clienteSecundario2', 'Cliente Secundario 2')}
      </div>
    </div>
  );
};

export default RelationClientsConfig;
