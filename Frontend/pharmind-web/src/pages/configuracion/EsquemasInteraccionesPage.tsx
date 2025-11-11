import React, { useState, useEffect } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { usePage } from '../../contexts/PageContext';
import type { InteractionConfiguracionUi, ProductosPromocionadosConfig, MuestrasEntregadasConfig, PedidoProductosConfig, FrequencyConfig } from '../../types/interactionConfig';
import { parseInteractionConfig, defaultInteractionConfig } from '../../types/interactionConfig';
import api from '../../services/api';
import './ConfiguracionPages.css';

interface EsquemaInteraccion {
  id: string;
  nombre: string;
  descripcion?: string;
  subTipo?: string;
  entidadTipo: string;
  icono?: string;
  color?: string;
  schema: string;
  configuracionUi?: string;
  activo: boolean;
}

const EsquemasInteraccionesPage: React.FC = () => {
  const { addNotification } = useNotifications();
  const { setToolbarContent, setToolbarRightContent, clearToolbarContent } = usePage();

  const [esquemas, setEsquemas] = useState<EsquemaInteraccion[]>([]);
  const [selectedEsquema, setSelectedEsquema] = useState<EsquemaInteraccion | null>(null);
  const [config, setConfig] = useState<InteractionConfiguracionUi>(defaultInteractionConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadEsquemas();
  }, []);

  useEffect(() => {
    const toolbarLeft = (
      <>
        <span className="material-icons" style={{ marginRight: '0.75rem', color: 'var(--primary-color)' }}>
          settings
        </span>
        <div>
          <span style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Configuración de Interacciones
          </span>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.125rem' }}>
            Configure el comportamiento de cada tipo de interacción
          </div>
        </div>
      </>
    );

    setToolbarContent(toolbarLeft);

    return () => {
      clearToolbarContent();
    };
  }, []);

  const loadEsquemas = async () => {
    try {
      setLoading(true);
      const response = await api.get('/EsquemasPersonalizados?entidadTipo=Interaccion');
      setEsquemas(response.data);

      // Seleccionar el primer esquema por defecto
      if (response.data.length > 0) {
        handleSelectEsquema(response.data[0]);
      }
    } catch (error) {
      console.error('Error loading schemas:', error);
      addNotification('Error al cargar esquemas de interacciones', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEsquema = (esquema: EsquemaInteraccion) => {
    setSelectedEsquema(esquema);
    const parsedConfig = parseInteractionConfig(esquema.configuracionUi);
    setConfig(parsedConfig);
  };

  const handleUpdateConfig = (path: string, value: any) => {
    setConfig(prev => {
      const newConfig = { ...prev };
      const keys = path.split('.');
      let current: any = newConfig;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return newConfig;
    });
  };

  const handleSave = async () => {
    if (!selectedEsquema) return;

    try {
      setSaving(true);
      const configuracionUiJson = JSON.stringify(config, null, 2);

      await api.put(`/EsquemasPersonalizados/${selectedEsquema.id}`, {
        ...selectedEsquema,
        configuracionUi: configuracionUiJson
      });

      addNotification('Configuración guardada exitosamente', 'success');

      // Recargar esquemas
      await loadEsquemas();
    } catch (error) {
      console.error('Error saving configuration:', error);
      addNotification('Error al guardar configuración', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando esquemas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="configuracion-page">
      <div className="esquemas-layout">
        {/* Sidebar con lista de esquemas */}
        <div className="esquemas-sidebar">
          <h3>Tipos de Interacción</h3>
          <div className="esquemas-list">
            {esquemas.map(esquema => (
              <div
                key={esquema.id}
                className={`esquema-item ${selectedEsquema?.id === esquema.id ? 'selected' : ''}`}
                onClick={() => handleSelectEsquema(esquema)}
              >
                <div className="esquema-icon" style={{ backgroundColor: esquema.color || '#4db8b8' }}>
                  <span className="material-icons">{esquema.icono || 'event'}</span>
                </div>
                <div className="esquema-info">
                  <div className="esquema-nombre">{esquema.nombre}</div>
                  {esquema.descripcion && (
                    <div className="esquema-descripcion">{esquema.descripcion}</div>
                  )}
                </div>
                {esquema.activo && (
                  <span className="material-icons esquema-active">check_circle</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Panel de configuración */}
        <div className="config-panel">
          {selectedEsquema ? (
            <>
              <div className="config-header">
                <h2>{selectedEsquema.nombre}</h2>
                <p>{selectedEsquema.descripcion}</p>
              </div>

              <div className="config-sections">
                {/* Productos Promocionados */}
                <div className="config-section">
                  <div className="section-header">
                    <span className="material-icons">local_offer</span>
                    <h3>Productos Promocionados</h3>
                  </div>

                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={config.productosPromocionados?.habilitado || false}
                        onChange={(e) => handleUpdateConfig('productosPromocionados.habilitado', e.target.checked)}
                      />
                      <span>Informar productos promocionados</span>
                    </label>
                  </div>

                  {config.productosPromocionados?.habilitado && (
                    <>
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="minCantidad">Cantidad Mínima Requerida</label>
                          <input
                            type="number"
                            id="minCantidad"
                            min="0"
                            value={config.productosPromocionados?.minCantidad || 0}
                            onChange={(e) => handleUpdateConfig('productosPromocionados.minCantidad', parseInt(e.target.value))}
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="maxCantidad">Cantidad Máxima Aceptable</label>
                          <input
                            type="number"
                            id="maxCantidad"
                            min="0"
                            value={config.productosPromocionados?.maxCantidad || 10}
                            onChange={(e) => handleUpdateConfig('productosPromocionados.maxCantidad', parseInt(e.target.value))}
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={config.productosPromocionados?.requerido || false}
                            onChange={(e) => handleUpdateConfig('productosPromocionados.requerido', e.target.checked)}
                          />
                          <span>Obligatorio</span>
                        </label>
                      </div>

                      <div className="form-group">
                        <label htmlFor="productosLabel">Etiqueta</label>
                        <input
                          type="text"
                          id="productosLabel"
                          value={config.productosPromocionados?.label || ''}
                          onChange={(e) => handleUpdateConfig('productosPromocionados.label', e.target.value)}
                          placeholder="Productos Promocionados"
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="productosHelpText">Texto de Ayuda</label>
                        <textarea
                          id="productosHelpText"
                          rows={2}
                          value={config.productosPromocionados?.helpText || ''}
                          onChange={(e) => handleUpdateConfig('productosPromocionados.helpText', e.target.value)}
                          placeholder="Ingrese los productos que fueron promocionados durante la visita"
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* Muestras Entregadas */}
                <div className="config-section">
                  <div className="section-header">
                    <span className="material-icons">inventory_2</span>
                    <h3>Muestras / Materiales Entregados</h3>
                  </div>

                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={config.muestrasEntregadas?.habilitado || false}
                        onChange={(e) => handleUpdateConfig('muestrasEntregadas.habilitado', e.target.checked)}
                      />
                      <span>Informar muestras/materiales entregados</span>
                    </label>
                  </div>

                  {config.muestrasEntregadas?.habilitado && (
                    <>
                      <div className="form-group">
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={config.muestrasEntregadas?.requerido || false}
                            onChange={(e) => handleUpdateConfig('muestrasEntregadas.requerido', e.target.checked)}
                          />
                          <span>Obligatorio</span>
                        </label>
                      </div>

                      <div className="form-group">
                        <label htmlFor="muestrasLabel">Etiqueta</label>
                        <input
                          type="text"
                          id="muestrasLabel"
                          value={config.muestrasEntregadas?.label || ''}
                          onChange={(e) => handleUpdateConfig('muestrasEntregadas.label', e.target.value)}
                          placeholder="Muestras/Materiales Entregados"
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="muestrasHelpText">Texto de Ayuda</label>
                        <textarea
                          id="muestrasHelpText"
                          rows={2}
                          value={config.muestrasEntregadas?.helpText || ''}
                          onChange={(e) => handleUpdateConfig('muestrasEntregadas.helpText', e.target.value)}
                          placeholder="Registre las muestras médicas o materiales entregados"
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* Pedido de Productos */}
                <div className="config-section">
                  <div className="section-header">
                    <span className="material-icons">shopping_cart</span>
                    <h3>Pedido de Productos</h3>
                  </div>

                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={config.pedidoProductos?.habilitado || false}
                        onChange={(e) => handleUpdateConfig('pedidoProductos.habilitado', e.target.checked)}
                      />
                      <span>Admitir pedido de productos</span>
                    </label>
                  </div>

                  {config.pedidoProductos?.habilitado && (
                    <>
                      <div className="form-group">
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={config.pedidoProductos?.requerido || false}
                            onChange={(e) => handleUpdateConfig('pedidoProductos.requerido', e.target.checked)}
                          />
                          <span>Obligatorio</span>
                        </label>
                      </div>

                      <div className="form-group">
                        <label htmlFor="pedidoLabel">Etiqueta</label>
                        <input
                          type="text"
                          id="pedidoLabel"
                          value={config.pedidoProductos?.label || ''}
                          onChange={(e) => handleUpdateConfig('pedidoProductos.label', e.target.value)}
                          placeholder="Pedido de Productos"
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="pedidoHelpText">Texto de Ayuda</label>
                        <textarea
                          id="pedidoHelpText"
                          rows={2}
                          value={config.pedidoProductos?.helpText || ''}
                          onChange={(e) => handleUpdateConfig('pedidoProductos.helpText', e.target.value)}
                          placeholder="Permite registrar pedidos de productos durante la visita"
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* Medición de Frecuencia */}
                <div className="config-section">
                  <div className="section-header">
                    <span className="material-icons">event_repeat</span>
                    <h3>Medición de Frecuencia</h3>
                  </div>

                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={config.frecuencia?.medirFrecuencia || false}
                        onChange={(e) => handleUpdateConfig('frecuencia.medirFrecuencia', e.target.checked)}
                      />
                      <span>Medir frecuencia de este tipo de interacción</span>
                    </label>
                    <p className="help-text">
                      Permite evaluar si el agente cumple con la frecuencia objetivo de visitas para este tipo de interacción
                    </p>
                  </div>

                  {config.frecuencia?.medirFrecuencia && (
                    <>
                      <div className="form-group">
                        <label htmlFor="periodoEvaluacion">Período de Evaluación</label>
                        <select
                          id="periodoEvaluacion"
                          value={config.frecuencia?.periodoEvaluacion || 'mensual'}
                          onChange={(e) => handleUpdateConfig('frecuencia.periodoEvaluacion', e.target.value)}
                        >
                          <option value="ciclo">Ciclo</option>
                          <option value="semanal">Semanal</option>
                          <option value="mensual">Mensual</option>
                          <option value="trimestral">Trimestral</option>
                          <option value="anual">Anual</option>
                        </select>
                        <p className="help-text">
                          Define el período de tiempo en el que se evaluará la frecuencia
                        </p>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="frecuenciaMinima">Frecuencia Mínima</label>
                          <input
                            type="number"
                            id="frecuenciaMinima"
                            min="1"
                            value={config.frecuencia?.frecuenciaMinima || 1}
                            onChange={(e) => handleUpdateConfig('frecuencia.frecuenciaMinima', parseInt(e.target.value))}
                          />
                          <p className="help-text">
                            Cantidad mínima de visitas requeridas en el período
                          </p>
                        </div>

                        <div className="form-group">
                          <label htmlFor="frecuenciaObjetivo">Frecuencia Objetivo</label>
                          <input
                            type="number"
                            id="frecuenciaObjetivo"
                            min="1"
                            value={config.frecuencia?.frecuenciaObjetivo || 4}
                            onChange={(e) => handleUpdateConfig('frecuencia.frecuenciaObjetivo', parseInt(e.target.value))}
                          />
                          <p className="help-text">
                            Meta de visitas a alcanzar en el período
                          </p>
                        </div>
                      </div>

                      <div className="form-group">
                        <label htmlFor="frecuenciaLabel">Etiqueta</label>
                        <input
                          type="text"
                          id="frecuenciaLabel"
                          value={config.frecuencia?.label || ''}
                          onChange={(e) => handleUpdateConfig('frecuencia.label', e.target.value)}
                          placeholder="Medición de Frecuencia"
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="frecuenciaHelpText">Texto de Ayuda</label>
                        <textarea
                          id="frecuenciaHelpText"
                          rows={2}
                          value={config.frecuencia?.helpText || ''}
                          onChange={(e) => handleUpdateConfig('frecuencia.helpText', e.target.value)}
                          placeholder="Permite evaluar la frecuencia de visitas en un período determinado"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="config-actions">
                <button
                  className="btn btn-primary"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="spinner-small"></span>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <span className="material-icons">save</span>
                      Guardar Configuración
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <span className="material-icons">info</span>
              <p>Seleccione un tipo de interacción para configurar</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EsquemasInteraccionesPage;
