import React, { useState, useEffect } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { usePage } from '../../contexts/PageContext';
import auditoriaService from '../../services/auditoria.service';
import type { PrescripcionPorCEP } from '../../services/auditoria.service';
import type { Ciudad } from '../../services/auditoria.service';
import type { Periodo } from '../../services/auditoria.service';
import type { Mercado } from '../../services/auditoria.service';
import { ResponsiveBar } from '@nivo/bar';
import './AuditoriaPages.css';

type ViewMode = 'top-ciudades' | 'heatmap-cep';

const MapaGeograficoPage: React.FC = () => {
  const { addNotification } = useNotifications();
  const { setPageInfo, setToolbarContent, clearToolbarContent } = usePage();

  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('top-ciudades');
  const [periodos, setPeriodos] = useState<Periodo[]>([]);
  const [mercados, setMercados] = useState<Mercado[]>([]);
  const [selectedPeriodo, setSelectedPeriodo] = useState<string>('');
  const [selectedMercado, setSelectedMercado] = useState<string>('');

  // Datos
  const [datosCEP, setDatosCEP] = useState<PrescripcionPorCEP[]>([]);
  const [datosCiudades, setDatosCiudades] = useState<Ciudad[]>([]);

  useEffect(() => {
    setPageInfo('Mapa Geográfico', 'map', '#ff9800');

    const toolbarContent = (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{
          backgroundColor: '#ff9800',
          padding: '0.5rem',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <span className="material-icons" style={{ color: 'white', fontSize: '1.5rem' }}>map</span>
        </div>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
            Mapa Geográfico de Prescripciones
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
            Distribución geográfica por código postal y ciudad
          </p>
        </div>
      </div>
    );

    setToolbarContent(toolbarContent);
    return () => clearToolbarContent();
  }, [setPageInfo, setToolbarContent, clearToolbarContent]);

  useEffect(() => {
    fetchInicialData();
  }, []);

  useEffect(() => {
    if (selectedPeriodo) {
      fetchGeographicData();
    }
  }, [selectedPeriodo, selectedMercado, viewMode]);

  const fetchInicialData = async () => {
    try {
      const [periodosData, mercadosData] = await Promise.all([
        auditoriaService.getListaPeriodos(),
        auditoriaService.getListaMercados()
      ]);

      setPeriodos(periodosData);
      setMercados(mercadosData);

      if (periodosData.length > 0) {
        setSelectedPeriodo(periodosData[0].codigo);
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
      addNotification({
        title: 'Error',
        message: 'No se pudieron cargar los datos iniciales',
        type: 'error',
        category: 'auditoria'
      });
    }
  };

  const fetchGeographicData = async () => {
    setLoading(true);
    try {
      if (viewMode === 'top-ciudades') {
        const ciudades = await auditoriaService.getTopCiudades(
          selectedPeriodo,
          selectedMercado || undefined,
          50
        );
        setDatosCiudades(ciudades);
      } else {
        const cepData = await auditoriaService.getPrescripcionesPorCEP(
          selectedPeriodo,
          selectedMercado || undefined,
          500
        );
        setDatosCEP(cepData);
      }
    } catch (error) {
      console.error('Error fetching geographic data:', error);
      addNotification({
        title: 'Error',
        message: 'No se pudieron cargar los datos geográficos',
        type: 'error',
        category: 'auditoria'
      });
    } finally {
      setLoading(false);
    }
  };

  const renderTopCiudades = () => {
    const barData = datosCiudades.slice(0, 20).map((ciudad) => ({
      ciudad: ciudad.ciudad.substring(0, 40),
      'Prescripciones': ciudad.totalPrescripciones,
      'Médicos': ciudad.totalMedicos,
    }));

    const totalPrescripciones = datosCiudades.reduce((sum, c) => sum + c.totalPrescripciones, 0);
    const totalMedicos = datosCiudades.reduce((sum, c) => sum + c.totalMedicos, 0);
    const totalCEPs = datosCiudades.reduce((sum, c) => sum + c.codigosPostales, 0);
    const totalBarrios = datosCiudades.reduce((sum, c) => sum + c.barrios, 0);
    const totalProductos = datosCiudades.reduce((sum, c) => sum + c.productosDistintos, 0);

    // Análisis de concentración
    const top5Prescripciones = datosCiudades.slice(0, 5).reduce((sum, c) => sum + c.totalPrescripciones, 0);
    const top10Prescripciones = datosCiudades.slice(0, 10).reduce((sum, c) => sum + c.totalPrescripciones, 0);
    const concentracionTop5 = totalPrescripciones > 0 ? (top5Prescripciones / totalPrescripciones) * 100 : 0;
    const concentracionTop10 = totalPrescripciones > 0 ? (top10Prescripciones / totalPrescripciones) * 100 : 0;

    // Métricas de eficiencia
    const promedioPrescripcionesPorMedico = totalMedicos > 0 ? totalPrescripciones / totalMedicos : 0;
    const promedioProductosPorMedico = totalMedicos > 0 ? totalProductos / totalMedicos : 0;
    const promedioPrescripcionesPorCiudad = datosCiudades.length > 0 ? totalPrescripciones / datosCiudades.length : 0;

    return (
      <div>
        {/* KPIs Principales */}
        <div className="kpis-grid" style={{ marginBottom: '24px' }}>
          <div className="kpi-card">
            <div className="kpi-icon" style={{ backgroundColor: '#ff9800' }}>
              <span className="material-icons">receipt_long</span>
            </div>
            <div className="kpi-value">{totalPrescripciones.toLocaleString()}</div>
            <div className="kpi-label">Total Prescripciones</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon" style={{ backgroundColor: '#2196f3' }}>
              <span className="material-icons">medical_services</span>
            </div>
            <div className="kpi-value">{totalMedicos.toLocaleString()}</div>
            <div className="kpi-label">Total Médicos</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon" style={{ backgroundColor: '#9c27b0' }}>
              <span className="material-icons">location_city</span>
            </div>
            <div className="kpi-value">{datosCiudades.length}</div>
            <div className="kpi-label">Ciudades/Ubicaciones</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon" style={{ backgroundColor: '#4caf50' }}>
              <span className="material-icons">pin_drop</span>
            </div>
            <div className="kpi-value">{totalCEPs.toLocaleString()}</div>
            <div className="kpi-label">Códigos Postales</div>
          </div>
        </div>

        {/* Insights de Análisis */}
        <div className="kpis-grid" style={{ marginBottom: '24px' }}>
          <div className="kpi-card insight-card">
            <div className="kpi-icon" style={{ backgroundColor: '#ff5722' }}>
              <span className="material-icons">trending_up</span>
            </div>
            <div className="kpi-value">{concentracionTop5.toFixed(1)}%</div>
            <div className="kpi-label">Concentración Top 5 Ciudades</div>
            <div className="kpi-subtitle">{concentracionTop10.toFixed(1)}% en Top 10</div>
          </div>
          <div className="kpi-card insight-card">
            <div className="kpi-icon" style={{ backgroundColor: '#00bcd4' }}>
              <span className="material-icons">analytics</span>
            </div>
            <div className="kpi-value">{promedioPrescripcionesPorMedico.toFixed(1)}</div>
            <div className="kpi-label">Prescripciones por Médico</div>
            <div className="kpi-subtitle">Promedio general</div>
          </div>
          <div className="kpi-card insight-card">
            <div className="kpi-icon" style={{ backgroundColor: '#673ab7' }}>
              <span className="material-icons">inventory_2</span>
            </div>
            <div className="kpi-value">{promedioProductosPorMedico.toFixed(1)}</div>
            <div className="kpi-label">Productos por Médico</div>
            <div className="kpi-subtitle">Diversidad de portfolio</div>
          </div>
          <div className="kpi-card insight-card">
            <div className="kpi-icon" style={{ backgroundColor: '#3f51b5' }}>
              <span className="material-icons">apartment</span>
            </div>
            <div className="kpi-value">{totalBarrios.toLocaleString()}</div>
            <div className="kpi-label">Total Barrios</div>
            <div className="kpi-subtitle">{promedioPrescripcionesPorCiudad.toFixed(0)} Rx/ciudad</div>
          </div>
        </div>

        {/* Gráfico de barras */}
        <div className="chart-card" style={{ marginBottom: '24px' }}>
          <h3>Top 20 Ubicaciones por Prescripciones</h3>
          <div style={{ height: '500px' }}>
            <ResponsiveBar
              data={barData}
              keys={['Prescripciones']}
              indexBy="ciudad"
              margin={{ top: 20, right: 30, bottom: 180, left: 80 }}
              padding={0.3}
              valueScale={{ type: 'linear' }}
              colors={['#ff9800']}
              axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: -45,
                legend: 'Ciudad / Ubicación',
                legendPosition: 'middle',
                legendOffset: 160,
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'Prescripciones',
                legendPosition: 'middle',
                legendOffset: -70,
                format: (value) => value.toLocaleString(),
              }}
              labelSkipWidth={12}
              labelSkipHeight={12}
              labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
              enableGridY={true}
              tooltip={({ indexValue, value }) => (
                <div
                  style={{
                    padding: '8px 12px',
                    background: 'white',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  }}
                >
                  <strong>{indexValue}</strong>
                  <div>Prescripciones: {Number(value).toLocaleString()}</div>
                </div>
              )}
            />
          </div>
        </div>

        {/* Tabla detallada */}
        <div className="tabla-container">
          <table className="auditoria-table">
            <thead>
              <tr>
                <th>Ranking</th>
                <th>Ciudad / Ubicación</th>
                <th className="text-right">Códigos Postales</th>
                <th className="text-right">Barrios</th>
                <th className="text-right">Médicos</th>
                <th className="text-right">Prescripciones</th>
                <th className="text-right">Rx/Médico</th>
                <th className="text-right">Productos</th>
                <th className="text-right">% del Total</th>
              </tr>
            </thead>
            <tbody>
              {datosCiudades.map((ciudad) => {
                const rxPorMedico = ciudad.totalMedicos > 0 ? ciudad.totalPrescripciones / ciudad.totalMedicos : 0;
                const porcentajeTotal = totalPrescripciones > 0 ? (ciudad.totalPrescripciones / totalPrescripciones) * 100 : 0;
                return (
                  <tr key={ciudad.ciudad}>
                    <td className="text-center">
                      <span className={`badge-ranking ranking-${ciudad.ranking}`}>
                        #{ciudad.ranking}
                      </span>
                    </td>
                    <td>
                      <strong>{ciudad.ciudad}</strong>
                    </td>
                    <td className="text-right">{ciudad.codigosPostales.toLocaleString()}</td>
                    <td className="text-right">{ciudad.barrios.toLocaleString()}</td>
                    <td className="text-right">{ciudad.totalMedicos.toLocaleString()}</td>
                    <td className="text-right">
                      <strong style={{ color: '#ff9800' }}>
                        {ciudad.totalPrescripciones.toLocaleString()}
                      </strong>
                    </td>
                    <td className="text-right">
                      <span style={{
                        color: rxPorMedico > promedioPrescripcionesPorMedico ? '#4caf50' : '#757575',
                        fontWeight: rxPorMedico > promedioPrescripcionesPorMedico ? 600 : 400
                      }}>
                        {rxPorMedico.toFixed(1)}
                      </span>
                    </td>
                    <td className="text-right">{ciudad.productosDistintos.toLocaleString()}</td>
                    <td className="text-right">
                      <span style={{ fontSize: '12px', color: '#757575' }}>
                        {porcentajeTotal.toFixed(2)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderHeatmapCEP = () => {
    const barData = datosCEP.slice(0, 30).map((cep) => ({
      cep: cep.cep,
      'Prescripciones': cep.totalPrescripciones,
      'Médicos': cep.totalMedicos,
    }));

    const totalPrescripciones = datosCEP.reduce((sum, c) => sum + c.totalPrescripciones, 0);
    const totalMedicos = datosCEP.reduce((sum, c) => sum + c.totalMedicos, 0);
    const totalProductos = datosCEP.reduce((sum, c) => sum + c.productosDistintos, 0);

    // Análisis de concentración por CEP
    const top10CEPPrescripciones = datosCEP.slice(0, 10).reduce((sum, c) => sum + c.totalPrescripciones, 0);
    const top20CEPPrescripciones = datosCEP.slice(0, 20).reduce((sum, c) => sum + c.totalPrescripciones, 0);
    const concentracionTop10CEP = totalPrescripciones > 0 ? (top10CEPPrescripciones / totalPrescripciones) * 100 : 0;
    const concentracionTop20CEP = totalPrescripciones > 0 ? (top20CEPPrescripciones / totalPrescripciones) * 100 : 0;

    // Métricas de densidad
    const promedioPrescripcionesPorCEP = datosCEP.length > 0 ? totalPrescripciones / datosCEP.length : 0;
    const promedioMedicosPorCEP = datosCEP.length > 0 ? totalMedicos / datosCEP.length : 0;
    const promedioPrescripcionesPorMedico = totalMedicos > 0 ? totalPrescripciones / totalMedicos : 0;
    const promedioProductosPorMedico = totalMedicos > 0 ? totalProductos / totalMedicos : 0;

    return (
      <div>
        {/* KPIs Principales */}
        <div className="kpis-grid" style={{ marginBottom: '24px' }}>
          <div className="kpi-card">
            <div className="kpi-icon" style={{ backgroundColor: '#4caf50' }}>
              <span className="material-icons">receipt_long</span>
            </div>
            <div className="kpi-value">{totalPrescripciones.toLocaleString()}</div>
            <div className="kpi-label">Total Prescripciones</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon" style={{ backgroundColor: '#2196f3' }}>
              <span className="material-icons">medical_services</span>
            </div>
            <div className="kpi-value">{totalMedicos.toLocaleString()}</div>
            <div className="kpi-label">Total Médicos</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon" style={{ backgroundColor: '#ff9800' }}>
              <span className="material-icons">pin_drop</span>
            </div>
            <div className="kpi-value">{datosCEP.length}</div>
            <div className="kpi-label">Códigos Postales</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon" style={{ backgroundColor: '#9c27b0' }}>
              <span className="material-icons">trending_up</span>
            </div>
            <div className="kpi-value">{promedioPrescripcionesPorCEP.toFixed(0)}</div>
            <div className="kpi-label">Promedio Rx por CEP</div>
          </div>
        </div>

        {/* Insights de Análisis por CEP */}
        <div className="kpis-grid" style={{ marginBottom: '24px' }}>
          <div className="kpi-card insight-card">
            <div className="kpi-icon" style={{ backgroundColor: '#ff5722' }}>
              <span className="material-icons">insights</span>
            </div>
            <div className="kpi-value">{concentracionTop10CEP.toFixed(1)}%</div>
            <div className="kpi-label">Concentración Top 10 CEPs</div>
            <div className="kpi-subtitle">{concentracionTop20CEP.toFixed(1)}% en Top 20</div>
          </div>
          <div className="kpi-card insight-card">
            <div className="kpi-icon" style={{ backgroundColor: '#00bcd4' }}>
              <span className="material-icons">groups</span>
            </div>
            <div className="kpi-value">{promedioMedicosPorCEP.toFixed(1)}</div>
            <div className="kpi-label">Médicos por CEP</div>
            <div className="kpi-subtitle">Densidad promedio</div>
          </div>
          <div className="kpi-card insight-card">
            <div className="kpi-icon" style={{ backgroundColor: '#673ab7' }}>
              <span className="material-icons">analytics</span>
            </div>
            <div className="kpi-value">{promedioPrescripcionesPorMedico.toFixed(1)}</div>
            <div className="kpi-label">Prescripciones por Médico</div>
            <div className="kpi-subtitle">Actividad promedio</div>
          </div>
          <div className="kpi-card insight-card">
            <div className="kpi-icon" style={{ backgroundColor: '#3f51b5' }}>
              <span className="material-icons">inventory_2</span>
            </div>
            <div className="kpi-value">{promedioProductosPorMedico.toFixed(1)}</div>
            <div className="kpi-label">Productos por Médico</div>
            <div className="kpi-subtitle">Diversidad de portfolio</div>
          </div>
        </div>

        {/* Gráfico de barras */}
        <div className="chart-card" style={{ marginBottom: '24px' }}>
          <h3>Top 30 Códigos Postales por Prescripciones</h3>
          <div style={{ height: '500px' }}>
            <ResponsiveBar
              data={barData}
              keys={['Prescripciones']}
              indexBy="cep"
              margin={{ top: 20, right: 30, bottom: 100, left: 80 }}
              padding={0.3}
              valueScale={{ type: 'linear' }}
              colors={['#4caf50']}
              axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: -45,
                legend: 'Código Postal',
                legendPosition: 'middle',
                legendOffset: 80,
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'Prescripciones',
                legendPosition: 'middle',
                legendOffset: -70,
                format: (value) => value.toLocaleString(),
              }}
              labelSkipWidth={12}
              labelSkipHeight={12}
              labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
              enableGridY={true}
            />
          </div>
        </div>

        {/* Tabla detallada */}
        <div className="tabla-container">
          <table className="auditoria-table">
            <thead>
              <tr>
                <th>Ranking</th>
                <th>CEP</th>
                <th>Ciudad</th>
                <th>Barrio</th>
                <th className="text-right">Médicos</th>
                <th className="text-right">Prescripciones</th>
                <th className="text-right">Rx/Médico</th>
                <th className="text-right">Productos</th>
                <th className="text-right">% del Total</th>
              </tr>
            </thead>
            <tbody>
              {datosCEP.map((cep) => {
                const rxPorMedico = cep.totalMedicos > 0 ? cep.totalPrescripciones / cep.totalMedicos : 0;
                const porcentajeTotal = totalPrescripciones > 0 ? (cep.totalPrescripciones / totalPrescripciones) * 100 : 0;
                return (
                  <tr key={cep.cep}>
                    <td className="text-center">
                      <span className={`badge-ranking ranking-${cep.ranking}`}>
                        #{cep.ranking}
                      </span>
                    </td>
                    <td>
                      <strong>{cep.cep}</strong>
                    </td>
                    <td>{cep.ciudad || '-'}</td>
                    <td>{cep.barrio || '-'}</td>
                    <td className="text-right">{cep.totalMedicos.toLocaleString()}</td>
                    <td className="text-right">
                      <strong style={{ color: '#4caf50' }}>
                        {cep.totalPrescripciones.toLocaleString()}
                      </strong>
                    </td>
                    <td className="text-right">
                      <span style={{
                        color: rxPorMedico > promedioPrescripcionesPorMedico ? '#ff9800' : '#757575',
                        fontWeight: rxPorMedico > promedioPrescripcionesPorMedico ? 600 : 400
                      }}>
                        {rxPorMedico.toFixed(1)}
                      </span>
                    </td>
                    <td className="text-right">{cep.productosDistintos.toLocaleString()}</td>
                    <td className="text-right">
                      <span style={{ fontSize: '12px', color: '#757575' }}>
                        {porcentajeTotal.toFixed(2)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="auditoria-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Cargando datos geográficos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auditoria-container">
      {/* Header con filtros */}
      <div className="auditoria-header">
        <div className="auditoria-filters">
          <div className="filter-group">
            <label>Período</label>
            <select
              className="filter-select"
              value={selectedPeriodo}
              onChange={(e) => setSelectedPeriodo(e.target.value)}
            >
              {periodos.map((periodo) => (
                <option key={periodo.codigo} value={periodo.codigo}>
                  {periodo.descripcion || periodo.codigo}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Mercado</label>
            <select
              className="filter-select"
              value={selectedMercado}
              onChange={(e) => setSelectedMercado(e.target.value)}
            >
              <option value="">Todos los mercados</option>
              {mercados.map((mercado) => (
                <option key={mercado.cdgMercado} value={mercado.cdgMercado}>
                  {mercado.nombre} {mercado.abreviatura && `(${mercado.abreviatura})`}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Vista</label>
            <div className="toggle-buttons">
              <button
                className={viewMode === 'top-ciudades' ? 'active' : ''}
                onClick={() => setViewMode('top-ciudades')}
              >
                <span className="material-icons" style={{ fontSize: '1rem', marginRight: '4px' }}>location_city</span>
                Ciudades
              </button>
              <button
                className={viewMode === 'heatmap-cep' ? 'active' : ''}
                onClick={() => setViewMode('heatmap-cep')}
              >
                <span className="material-icons" style={{ fontSize: '1rem', marginRight: '4px' }}>grid_on</span>
                Por CEP
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido */}
      {viewMode === 'top-ciudades' ? renderTopCiudades() : renderHeatmapCEP()}
    </div>
  );
};

export default MapaGeograficoPage;
