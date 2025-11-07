import React, { useState, useEffect } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { usePage } from '../../contexts/PageContext';
import auditoriaService from '../../services/auditoria.service';
import type  PortfolioBEB from '../../services/auditoria.service';
import type Periodo  from '../../services/auditoria.service';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveRadar } from '@nivo/radar';
import { ResponsiveTreeMap } from '@nivo/treemap';
import './AuditoriaPages.css';

type ViewMode = 'table' | 'charts' | 'advanced';
type SortField = 'ranking' | 'marketShare' | 'prescripciones' | 'productos' | 'medicos';
type SortOrder = 'asc' | 'desc';

const PortfolioBEBPage: React.FC = () => {
  const { addNotification } = useNotifications();
  const { setPageInfo, setToolbarContent, clearToolbarContent } = usePage();

  const [loading, setLoading] = useState(true);
  const [portfolioData, setPortfolioData] = useState<PortfolioBEB[]>([]);
  const [periodos, setPeriodos] = useState<Periodo[]>([]);
  const [selectedPeriodo, setSelectedPeriodo] = useState<string>('');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [sortField, setSortField] = useState<SortField>('ranking');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    setPageInfo('Portfolio BEB', 'assessment', '#8b5cf6');

    const toolbarContent = (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{
          backgroundColor: '#8b5cf6',
          padding: '0.5rem',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <span className="material-icons" style={{ color: 'white', fontSize: '1.5rem' }}>assessment</span>
        </div>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>Portfolio BEB</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>Vista multi-mercado de productos BEB</p>
        </div>
      </div>
    );

    setToolbarContent(toolbarContent);
    return () => clearToolbarContent();
  }, [setPageInfo, setToolbarContent, clearToolbarContent]);

  useEffect(() => {
    fetchPeriodos();
  }, []);

  useEffect(() => {
    if (selectedPeriodo) {
      fetchPortfolioData();
    }
  }, [selectedPeriodo]);

  const fetchPeriodos = async () => {
    try {
      const data = await auditoriaService.getListaPeriodos();
      setPeriodos(data);
      if (data.length > 0) {
        setSelectedPeriodo(data[0].codigo);
      }
    } catch (error) {
      console.error('Error fetching periodos:', error);
      addNotification({
        title: 'Error',
        message: 'No se pudieron cargar los períodos',
        type: 'error',
        category: 'auditoria'
      });
    }
  };

  const fetchPortfolioData = async () => {
    setLoading(true);
    try {
      const data = await auditoriaService.getPortfolioBEB(selectedPeriodo);
      setPortfolioData(data);
    } catch (error) {
      console.error('Error fetching portfolio data:', error);
      addNotification({
        title: 'Error',
        message: 'No se pudieron cargar los datos del portfolio',
        type: 'error',
        category: 'auditoria'
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    return portfolioData.reduce(
      (acc, item) => ({
        productosBEB: acc.productosBEB + item.productosBEB,
        prescripcionesBEB: acc.prescripcionesBEB + item.prescripcionesBEB,
        medicosBEB: acc.medicosBEB + item.medicosBEB,
        productosTotal: acc.productosTotal + item.productosTotales,
        prescripcionesTotal: acc.prescripcionesTotal + item.prescripcionesTotales,
        medicosTotal: acc.medicosTotal + item.medicosTotales,
        laboratoriosTotal: acc.laboratoriosTotal + item.laboratoriosTotales,
      }),
      {
        productosBEB: 0,
        prescripcionesBEB: 0,
        medicosBEB: 0,
        productosTotal: 0,
        prescripcionesTotal: 0,
        medicosTotal: 0,
        laboratoriosTotal: 0,
      }
    );
  };

  const totals = calculateTotals();

  // Filtrar y ordenar datos
  const filteredAndSortedData = portfolioData
    .filter(item => {
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      return (
        item.mercadoNombre.toLowerCase().includes(search) ||
        item.mercadoAbrev?.toLowerCase().includes(search) ||
        item.cdgMercado.toLowerCase().includes(search)
      );
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'ranking':
          comparison = a.rankingBEB - b.rankingBEB;
          break;
        case 'marketShare':
          comparison = b.marketShareBEB - a.marketShareBEB;
          break;
        case 'prescripciones':
          comparison = b.prescripcionesBEB - a.prescripcionesBEB;
          break;
        case 'productos':
          comparison = b.productosBEB - a.productosBEB;
          break;
        case 'medicos':
          comparison = b.medicosBEB - a.medicosBEB;
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return 'unfold_more';
    return sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward';
  };

  // Preparar datos para gráfico de barras (Market Share por mercado)
  const barChartData = filteredAndSortedData
    .slice(0, 10)
    .map(item => ({
      mercado: item.mercadoAbrev || item.mercadoNombre.substring(0, 15),
      'Market Share BEB': item.marketShareBEB,
      'Prescripciones BEB': item.prescripcionesBEB,
    }));

  // Preparar datos para gráfico de pie (Distribución de prescripciones)
  const pieChartData = portfolioData
    .sort((a, b) => b.prescripcionesBEB - a.prescripcionesBEB)
    .slice(0, 8)
    .map(item => ({
      id: item.mercadoAbrev || item.mercadoNombre,
      label: item.mercadoAbrev || item.mercadoNombre,
      value: item.prescripcionesBEB,
    }));

  if (loading) {
    return (
      <div className="auditoria-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Cargando datos del portfolio...</p>
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
            <label>Buscar Mercado</label>
            <input
              type="text"
              className="filter-select"
              placeholder="Nombre, abreviatura o código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ minWidth: '300px' }}
            />
          </div>

          <div className="filter-group">
            <label>Vista</label>
            <div className="toggle-buttons">
              <button
                className={viewMode === 'table' ? 'active' : ''}
                onClick={() => setViewMode('table')}
              >
                <span className="material-icons" style={{ fontSize: '1rem', marginRight: '4px' }}>table_chart</span>
                Tabla
              </button>
              <button
                className={viewMode === 'charts' ? 'active' : ''}
                onClick={() => setViewMode('charts')}
              >
                <span className="material-icons" style={{ fontSize: '1rem', marginRight: '4px' }}>bar_chart</span>
                Gráficos
              </button>
              <button
                className={viewMode === 'advanced' ? 'active' : ''}
                onClick={() => setViewMode('advanced')}
              >
                <span className="material-icons" style={{ fontSize: '1rem', marginRight: '4px' }}>analytics</span>
                Avanzado
              </button>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="kpis-grid">
          <div className="kpi-card">
            <div className="kpi-value">{totals.productosBEB.toLocaleString()}</div>
            <div className="kpi-label">Productos BEB</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-value">{totals.prescripcionesBEB.toLocaleString()}</div>
            <div className="kpi-label">Prescripciones BEB</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-value">{totals.medicosBEB.toLocaleString()}</div>
            <div className="kpi-label">Médicos BEB</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-value">{portfolioData.length}</div>
            <div className="kpi-label">Mercados</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-value">
              {totals.prescripcionesTotal > 0
                ? ((totals.prescripcionesBEB / totals.prescripcionesTotal) * 100).toFixed(2)
                : 0}%
            </div>
            <div className="kpi-label">Market Share Promedio</div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      {viewMode === 'table' ? (
        <div className="tabla-container">
          {filteredAndSortedData.length === 0 ? (
            <div className="loading-state">
              <span className="material-icons" style={{ fontSize: '4rem', color: 'var(--text-secondary)' }}>
                {searchTerm ? 'search_off' : 'inbox'}
              </span>
              <p>{searchTerm ? 'No se encontraron mercados que coincidan con la búsqueda' : 'No hay datos disponibles para el período seleccionado'}</p>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: '12px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                Mostrando {filteredAndSortedData.length} de {portfolioData.length} mercados
              </div>
              <table className="auditoria-table">
                <thead>
                  <tr>
                    <th
                      onClick={() => handleSort('ranking')}
                      style={{ cursor: 'pointer', userSelect: 'none' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        Ranking
                        <span className="material-icons" style={{ fontSize: '16px' }}>
                          {getSortIcon('ranking')}
                        </span>
                      </div>
                    </th>
                    <th>Mercado</th>
                    <th
                      className="text-center"
                      onClick={() => handleSort('productos')}
                      style={{ cursor: 'pointer', userSelect: 'none' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                        Productos BEB
                        <span className="material-icons" style={{ fontSize: '16px' }}>
                          {getSortIcon('productos')}
                        </span>
                      </div>
                    </th>
                    <th
                      className="text-center"
                      onClick={() => handleSort('prescripciones')}
                      style={{ cursor: 'pointer', userSelect: 'none' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                        Prescripciones BEB
                        <span className="material-icons" style={{ fontSize: '16px' }}>
                          {getSortIcon('prescripciones')}
                        </span>
                      </div>
                    </th>
                    <th
                      className="text-center"
                      onClick={() => handleSort('medicos')}
                      style={{ cursor: 'pointer', userSelect: 'none' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                        Médicos BEB
                        <span className="material-icons" style={{ fontSize: '16px' }}>
                          {getSortIcon('medicos')}
                        </span>
                      </div>
                    </th>
                    <th className="text-center">PX/BEB</th>
                    <th className="text-right">Total Productos</th>
                    <th className="text-right">Total Prescripciones</th>
                    <th
                      className="text-right"
                      onClick={() => handleSort('marketShare')}
                      style={{ cursor: 'pointer', userSelect: 'none' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                        Market Share
                        <span className="material-icons" style={{ fontSize: '16px' }}>
                          {getSortIcon('marketShare')}
                        </span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedData.map((item) => (
                    <tr key={item.cdgMercado}>
                      <td className="text-center">
                        <span className={`badge-ranking ranking-${item.rankingBEB}`}>
                          #{item.rankingBEB}
                        </span>
                      </td>
                      <td>
                        <strong>{item.mercadoNombre}</strong>
                        {item.mercadoAbrev && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            {item.mercadoAbrev}
                          </div>
                        )}
                      </td>
                      <td className="text-center">
                        <strong style={{ color: '#4caf50' }}>{item.productosBEB.toLocaleString()}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          de {item.productosTotales.toLocaleString()}
                        </div>
                      </td>
                      <td className="text-center">
                        <strong style={{ color: '#4caf50' }}>{item.prescripcionesBEB.toLocaleString()}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          de {item.prescripcionesTotales.toLocaleString()}
                        </div>
                      </td>
                      <td className="text-center">
                        <strong style={{ color: '#4caf50' }}>{item.medicosBEB.toLocaleString()}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          de {item.medicosTotales.toLocaleString()}
                        </div>
                      </td>
                      <td className="text-center">
                        {item.pX_BEB.toLocaleString()}
                      </td>
                      <td className="text-right text-muted">
                        {item.productosTotales.toLocaleString()}
                      </td>
                      <td className="text-right text-muted">
                        {item.prescripcionesTotales.toLocaleString()}
                      </td>
                      <td className="text-right">
                        <strong style={{ color: '#1976d2' }}>{item.marketShareBEB.toFixed(2)}%</strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      ) : viewMode === 'charts' ? (
        <div className="graficos-grid">
          {/* Gráfico de barras - Market Share */}
          <div className="chart-card">
            <h3>Top 10 Mercados por Market Share BEB</h3>
            <div style={{ height: '400px' }}>
              <ResponsiveBar
                data={barChartData}
                keys={['Market Share BEB']}
                indexBy="mercado"
                margin={{ top: 20, right: 30, bottom: 80, left: 60 }}
                padding={0.3}
                valueScale={{ type: 'linear' }}
                colors={['#4caf50']}
                axisBottom={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: -45,
                  legend: 'Mercado',
                  legendPosition: 'middle',
                  legendOffset: 60,
                }}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: 'Market Share (%)',
                  legendPosition: 'middle',
                  legendOffset: -50,
                }}
                labelSkipWidth={12}
                labelSkipHeight={12}
                labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
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
                    <div>Market Share: {Number(value).toFixed(2)}%</div>
                  </div>
                )}
                enableGridY={true}
                theme={{
                  fontSize: 11,
                  textColor: '#333',
                }}
              />
            </div>
          </div>

          {/* Gráfico de pie - Distribución de prescripciones */}
          <div className="chart-card">
            <h3>Distribución de Prescripciones BEB por Mercado</h3>
            <div style={{ height: '400px' }}>
              <ResponsivePie
                data={pieChartData}
                margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
                innerRadius={0.5}
                padAngle={0.7}
                cornerRadius={3}
                activeOuterRadiusOffset={8}
                colors={{ scheme: 'set2' }}
                borderWidth={1}
                borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                arcLinkLabelsSkipAngle={10}
                arcLinkLabelsTextColor="#333333"
                arcLinkLabelsThickness={2}
                arcLinkLabelsColor={{ from: 'color' }}
                arcLabelsSkipAngle={10}
                arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
                tooltip={({ datum }) => (
                  <div
                    style={{
                      padding: '8px 12px',
                      background: 'white',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    }}
                  >
                    <strong>{datum.label}</strong>
                    <div>Prescripciones: {datum.value.toLocaleString()}</div>
                  </div>
                )}
              />
            </div>
          </div>

          {/* Gráfico de barras - Prescripciones */}
          <div className="chart-card" style={{ gridColumn: '1 / -1' }}>
            <h3>Top 10 Mercados por Prescripciones BEB</h3>
            <div style={{ height: '400px' }}>
              <ResponsiveBar
                data={barChartData}
                keys={['Prescripciones BEB']}
                indexBy="mercado"
                margin={{ top: 20, right: 30, bottom: 80, left: 80 }}
                padding={0.3}
                valueScale={{ type: 'linear' }}
                colors={['#1976d2']}
                axisBottom={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: -45,
                  legend: 'Mercado',
                  legendPosition: 'middle',
                  legendOffset: 60,
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
                enableGridY={true}
                theme={{
                  fontSize: 11,
                  textColor: '#333',
                }}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="graficos-grid">
          {/* TreeMap - Distribución de mercados */}
          <div className="chart-card" style={{ gridColumn: '1 / -1' }}>
            <h3>Distribución de Prescripciones BEB por Mercado (TreeMap)</h3>
            <div style={{ height: '500px' }}>
              <ResponsiveTreeMap
                data={{
                  name: 'BEB',
                  children: filteredAndSortedData.slice(0, 20).map(item => ({
                    name: item.mercadoAbrev || item.mercadoNombre.substring(0, 20),
                    value: item.prescripcionesBEB,
                    marketShare: item.marketShareBEB,
                  })),
                }}
                identity="name"
                value="value"
                margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
                labelSkipSize={12}
                labelTextColor={{ from: 'color', modifiers: [['darker', 1.2]] }}
                colors={{ scheme: 'spectral' }}
                borderColor={{ from: 'color', modifiers: [['darker', 0.3]] }}
                animate={true}
                motionConfig="gentle"
                tooltip={({ node }) => {
                  const data = node.data as any;
                  return (
                    <div
                      style={{
                        padding: '8px 12px',
                        background: 'white',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      }}
                    >
                      <strong>{data.name}</strong>
                      <div>Prescripciones: {node.value.toLocaleString()}</div>
                      <div>Market Share: {data.marketShare?.toFixed(2)}%</div>
                    </div>
                  );
                }}
              />
            </div>
          </div>

          {/* Radar Chart - Comparación de métricas */}
          <div className="chart-card" style={{ gridColumn: '1 / -1' }}>
            <h3>Comparación Multidimensional - Top 8 Mercados</h3>
            <div style={{ height: '500px' }}>
              <ResponsiveRadar
                data={filteredAndSortedData
                  .slice(0, 8)
                  .map(item => ({
                    mercado: item.mercadoAbrev || item.mercadoNombre.substring(0, 15),
                    'Market Share': item.marketShareBEB,
                    'Productos': (item.productosBEB / Math.max(...filteredAndSortedData.map(d => d.productosBEB))) * 100,
                    'Prescripciones': (item.prescripcionesBEB / Math.max(...filteredAndSortedData.map(d => d.prescripcionesBEB))) * 100,
                    'Médicos': (item.medicosBEB / Math.max(...filteredAndSortedData.map(d => d.medicosBEB))) * 100,
                  }))}
                keys={['Market Share', 'Productos', 'Prescripciones', 'Médicos']}
                indexBy="mercado"
                maxValue={100}
                margin={{ top: 70, right: 80, bottom: 40, left: 80 }}
                borderColor={{ from: 'color' }}
                gridLevels={5}
                gridShape="circular"
                gridLabelOffset={36}
                enableDots={true}
                dotSize={8}
                dotColor={{ theme: 'background' }}
                dotBorderWidth={2}
                colors={{ scheme: 'nivo' }}
                blendMode="multiply"
                motionConfig="gentle"
                legends={[
                  {
                    anchor: 'top-left',
                    direction: 'column',
                    translateX: -50,
                    translateY: -40,
                    itemWidth: 80,
                    itemHeight: 20,
                    itemTextColor: '#999',
                    symbolSize: 12,
                    symbolShape: 'circle',
                    effects: [
                      {
                        on: 'hover',
                        style: {
                          itemTextColor: '#000',
                        },
                      },
                    ],
                  },
                ]}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioBEBPage;
