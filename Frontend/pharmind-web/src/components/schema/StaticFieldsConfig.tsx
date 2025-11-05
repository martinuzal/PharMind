import { useState, useEffect } from 'react';
import './StaticFieldsConfig.css';

interface FieldConfig {
  visible: boolean;
  requerido: boolean;
  autoload: boolean;
  label: string;
}

interface StaticFieldsConfigData {
  tipoEntidad?: 'Persona' | 'Entidad'; // Solo para clientes
  campos: { [key: string]: FieldConfig };
}

interface StaticFieldsConfigProps {
  entidadTipo: string;
  value: StaticFieldsConfigData;
  onChange: (config: StaticFieldsConfigData) => void;
}

// Definición de campos estáticos por tipo de entidad
const CAMPOS_ESTATICOS = {
  Cliente: [
    { name: 'CodigoCliente', label: 'Código Cliente', defaultRequired: true },
    { name: 'Nombre', label: 'Nombre', defaultRequired: true },
    { name: 'Apellido', label: 'Apellido', defaultRequired: false },
    { name: 'RazonSocial', label: 'Razón Social', defaultRequired: true },
    { name: 'Especialidad', label: 'Especialidad', defaultRequired: false },
    { name: 'Categoria', label: 'Categoría', defaultRequired: false },
    { name: 'Segmento', label: 'Segmento', defaultRequired: false },
    { name: 'InstitucionId', label: 'Institución', defaultRequired: false },
    { name: 'Email', label: 'Email', defaultRequired: false },
    { name: 'Telefono', label: 'Teléfono', defaultRequired: false },
    { name: 'DireccionId', label: 'Dirección', defaultRequired: false },
    { name: 'Estado', label: 'Estado', defaultRequired: true }
  ],
  Agente: [
    { name: 'CodigoAgente', label: 'Código Agente', defaultRequired: true },
    { name: 'Nombre', label: 'Nombre', defaultRequired: true },
    { name: 'Apellido', label: 'Apellido', defaultRequired: false },
    { name: 'Email', label: 'Email', defaultRequired: false },
    { name: 'Telefono', label: 'Teléfono', defaultRequired: false },
    { name: 'RegionId', label: 'Región', defaultRequired: false },
    { name: 'DistritoId', label: 'Distrito', defaultRequired: false },
    { name: 'LineaNegocioId', label: 'Línea de Negocio', defaultRequired: false },
    { name: 'ManagerId', label: 'Manager', defaultRequired: false },
    { name: 'FechaIngreso', label: 'Fecha de Ingreso', defaultRequired: false },
    { name: 'Activo', label: 'Activo', defaultRequired: true },
    { name: 'Observaciones', label: 'Observaciones', defaultRequired: false }
  ],
  Relacion: [
    { name: 'CodigoRelacion', label: 'Código Relación', defaultRequired: true },
    { name: 'AgenteId', label: 'Agente', defaultRequired: true },
    { name: 'ClientePrincipalId', label: 'Cliente Principal', defaultRequired: true },
    { name: 'ClienteSecundario1Id', label: 'Cliente Secundario 1', defaultRequired: false },
    { name: 'ClienteSecundario2Id', label: 'Cliente Secundario 2', defaultRequired: false },
    { name: 'TipoRelacion', label: 'Tipo de Relación', defaultRequired: false },
    { name: 'FechaInicio', label: 'Fecha Inicio', defaultRequired: true },
    { name: 'FechaFin', label: 'Fecha Fin', defaultRequired: false },
    { name: 'Estado', label: 'Estado', defaultRequired: true },
    { name: 'FrecuenciaVisitas', label: 'Frecuencia de Visitas', defaultRequired: false },
    { name: 'Prioridad', label: 'Prioridad', defaultRequired: true },
    { name: 'Observaciones', label: 'Observaciones', defaultRequired: false }
  ],
  Interaccion: [
    { name: 'CodigoInteraccion', label: 'Código Interacción', defaultRequired: true },
    { name: 'RelacionId', label: 'Relación', defaultRequired: true },
    { name: 'AgenteId', label: 'Agente', defaultRequired: true },
    { name: 'ClienteId', label: 'Cliente', defaultRequired: true },
    { name: 'TipoInteraccion', label: 'Tipo de Interacción', defaultRequired: true },
    { name: 'Fecha', label: 'Fecha', defaultRequired: true },
    { name: 'Turno', label: 'Turno', defaultRequired: false },
    { name: 'DuracionMinutos', label: 'Duración (minutos)', defaultRequired: false },
    { name: 'Resultado', label: 'Resultado', defaultRequired: false },
    { name: 'ObjetivoVisita', label: 'Objetivo de Visita', defaultRequired: false },
    { name: 'ResumenVisita', label: 'Resumen de Visita', defaultRequired: false },
    { name: 'ProximaAccion', label: 'Próxima Acción', defaultRequired: false },
    { name: 'FechaProximaAccion', label: 'Fecha Próxima Acción', defaultRequired: false },
    { name: 'Latitud', label: 'Latitud', defaultRequired: false },
    { name: 'Longitud', label: 'Longitud', defaultRequired: false },
    { name: 'Observaciones', label: 'Observaciones', defaultRequired: false }
  ]
};

const StaticFieldsConfig = ({ entidadTipo, value, onChange }: StaticFieldsConfigProps) => {
  const campos = CAMPOS_ESTATICOS[entidadTipo as keyof typeof CAMPOS_ESTATICOS] || [];

  // Inicializar configuración por defecto
  const defaultConfig: StaticFieldsConfigData = {
    ...(entidadTipo === 'Cliente' && { tipoEntidad: 'Persona' }),
    campos: campos.reduce((acc, campo) => {
      acc[campo.name] = {
        visible: true,
        requerido: campo.defaultRequired,
        autoload: false,
        label: campo.label
      };
      return acc;
    }, {} as { [key: string]: FieldConfig })
  };

  const config = {
    ...defaultConfig,
    ...value,
    campos: { ...defaultConfig.campos, ...value.campos }
  };

  const handleTipoEntidadChange = (tipo: 'Persona' | 'Entidad') => {
    onChange({
      ...config,
      tipoEntidad: tipo
    });
  };

  const handleFieldChange = (fieldName: string, property: keyof FieldConfig, newValue: any) => {
    onChange({
      ...config,
      campos: {
        ...config.campos,
        [fieldName]: {
          ...config.campos[fieldName],
          [property]: newValue
        }
      }
    });
  };

  const handleSelectAll = () => {
    const newCampos = { ...config.campos };
    Object.keys(newCampos).forEach(key => {
      newCampos[key] = { ...newCampos[key], visible: true };
    });
    onChange({ ...config, campos: newCampos });
  };

  const handleDeselectAll = () => {
    const newCampos = { ...config.campos };
    Object.keys(newCampos).forEach(key => {
      newCampos[key] = { ...newCampos[key], visible: false };
    });
    onChange({ ...config, campos: newCampos });
  };

  return (
    <div className="static-fields-config">
      <div className="config-section-header">
        <span className="material-icons">settings</span>
        <h3>Configuración de Campos Estáticos</h3>
      </div>
      <p className="config-description">
        Configure qué campos de la tabla estática serán visibles, obligatorios o de carga automática
      </p>

      {entidadTipo === 'Cliente' && (
        <div className="tipo-entidad-section">
          <h4>Tipo de Cliente</h4>
          <div className="tipo-entidad-toggle">
            <button
              type="button"
              className={`tipo-btn ${config.tipoEntidad === 'Persona' ? 'active' : ''}`}
              onClick={() => handleTipoEntidadChange('Persona')}
            >
              <span className="material-icons">person</span>
              Persona
            </button>
            <button
              type="button"
              className={`tipo-btn ${config.tipoEntidad === 'Entidad' ? 'active' : ''}`}
              onClick={() => handleTipoEntidadChange('Entidad')}
            >
              <span className="material-icons">business</span>
              Entidad
            </button>
          </div>
        </div>
      )}

      <div className="fields-actions">
        <button type="button" className="btn-secondary btn-sm" onClick={handleSelectAll}>
          <span className="material-icons">check_box</span>
          Seleccionar Todos
        </button>
        <button type="button" className="btn-secondary btn-sm" onClick={handleDeselectAll}>
          <span className="material-icons">check_box_outline_blank</span>
          Deseleccionar Todos
        </button>
      </div>

      <div className="fields-table-container">
        <table className="fields-table">
          <thead>
            <tr>
              <th>Campo</th>
              <th>Visible</th>
              <th>Requerido</th>
              <th>Autoload</th>
            </tr>
          </thead>
          <tbody>
            {campos.map((campo) => {
              const fieldConfig = config.campos[campo.name] || {
                visible: true,
                requerido: campo.defaultRequired,
                autoload: false,
                label: campo.label
              };

              return (
                <tr key={campo.name} className={!fieldConfig.visible ? 'field-hidden' : ''}>
                  <td className="field-name-cell">
                    <span className="field-name">{campo.label}</span>
                    <span className="field-code">{campo.name}</span>
                  </td>
                  <td>
                    <label className="checkbox-container">
                      <input
                        type="checkbox"
                        checked={fieldConfig.visible}
                        onChange={(e) => handleFieldChange(campo.name, 'visible', e.target.checked)}
                      />
                      <span className="checkmark"></span>
                    </label>
                  </td>
                  <td>
                    <label className="checkbox-container">
                      <input
                        type="checkbox"
                        checked={fieldConfig.requerido}
                        onChange={(e) => handleFieldChange(campo.name, 'requerido', e.target.checked)}
                        disabled={!fieldConfig.visible}
                      />
                      <span className="checkmark"></span>
                    </label>
                  </td>
                  <td>
                    <label className="checkbox-container">
                      <input
                        type="checkbox"
                        checked={fieldConfig.autoload}
                        onChange={(e) => handleFieldChange(campo.name, 'autoload', e.target.checked)}
                        disabled={!fieldConfig.visible}
                      />
                      <span className="checkmark"></span>
                    </label>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="help-section">
        <div className="help-item">
          <span className="material-icons">visibility</span>
          <div>
            <strong>Visible:</strong> El campo aparecerá en el formulario
          </div>
        </div>
        <div className="help-item">
          <span className="material-icons">error</span>
          <div>
            <strong>Requerido:</strong> El campo será obligatorio para guardar
          </div>
        </div>
        <div className="help-item">
          <span className="material-icons">auto_awesome</span>
          <div>
            <strong>Autoload:</strong> El campo se cargará automáticamente (ej: código, fecha actual)
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaticFieldsConfig;
