import React, { useState, useEffect } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { usePage } from '../../contexts/PageContext';
import auditoriaService from '../../services/auditoria.service';
import type { Mercado } from '../../services/auditoria.service';
import type { Periodo } from '../../services/auditoria.service';
import type { MercadoOverview } from '../../services/auditoria.service';
import type { LaboratorioPorMercado } from '../../services/auditoria.service';
import type { ProductoPorMercado } from '../../services/auditoria.service';
import type { MedicoPorMercado } from '../../services/auditoria.service';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsivePie } from '@nivo/pie';
import './AuditoriaPages.css';

type TabType = 'overview' | 'laboratorios' | 'productos' | 'medicos';

const AnalisisMercadoPage: React.FC = () => {
  const { addNotification } = useNotifications();
  const { setPageInfo, setToolbarContent, clearToolbarContent } = usePage();

  const [loading, setLoading] = useState(false);
  const [mercados, setMercados] = useState<Mercado[]>([]);
  const [periodos, setPeriodos] = useState<Periodo[]>([]);
  const [selectedMercado, setSelectedMercado] = useState<string>('');
  const [selectedPeriodo, setSelectedPeriodo] = useState<string>('');
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Datos de tabs
  const [overview, setOverview] = useState<MercadoOverview | null>(null);
  const [laboratorios, setLaboratorios] = useState<LaboratorioPorMercado[]>([]);
  const [productos, setProductos] = useState<ProductoPorMercado[]>([]);
  const [medicos, setMedicos] = useState<MedicoPorMercado[]>([]);
  const [filtroLealtad, setFiltroLealtad] = useState<'SOLO_BEB' | 'CON_BEB' | 'SIN_BEB' | ''>('');
  const [topN, setTopN] = useState<number>(50);

  useEffect(() => {
    setPageInfo('Análisis de Mercado', 'analytics', '#1976d2');

    const toolbarContent = (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{
          backgroundColor: '#1976d2',
          padding: '0.5rem',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <span className="material-icons" style={{ color: 'white', fontSize: '1.5rem' }}>analytics</span>
        </div>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
            Análisis de Mercado
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
            Análisis detallado por mercado específico
          </p>
        </div>
      </div>
    );

    setToolbarContent(toolbarContent);
    return () => clearToolbarContent();
  }, [setPageInfo, setToolbarContent, clearToolbarContent]);

  useEffect(() => {
    fetchMercados();
    fetchPeriodos();
  }, []);

  useEffect(() => {
    if (selectedMercado && selectedPeriodo) {
      fetchDataForActiveTab();
    }
  }, [selectedMercado, selectedPeriodo, activeTab, filtroLealtad, topN]);

  const fetchMercados = async () => {
    try {
      const data = await auditoriaService.getListaMercados();
      setMercados(data);
    } catch (error) {
      console.error('Error fetching mercados:', error);
      addNotification({
        title: 'Error',
        message: 'No se pudieron cargar los mercados',
        type: 'error',
        category: 'auditoria'
      });
    }
  };

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

  const fetchDataForActiveTab = async () => {
    if (!selectedMercado || !selectedPeriodo) return;

    setLoading(true);
    try {
      switch (activeTab) {
        case 'overview':
          const overviewData = await auditoriaService.getMercadoOverview(
            selectedMercado,
            selectedPeriodo
          );
          setOverview(overviewData);
          break;

        case 'laboratorios':
          const labsData = await auditoriaService.getLaboratoriosPorMercado(
            selectedMercado,
            selectedPeriodo,
            topN
          );
          setLaboratorios(labsData);
          break;

        case 'productos':
          const prodsData = await auditoriaService.getProductosPorMercado(
            selectedMercado,
            selectedPeriodo,
            undefined,
            topN
          );
          setProductos(prodsData);
          break;

        case 'medicos':
          const medsData = await auditoriaService.getMedicosPorMercado(
            selectedMercado,
            selectedPeriodo,
            filtroLealtad || undefined,
            topN
          );
          setMedicos(medsData);
          break;
      }
    } catch (error) {
      console.error(`Error fetching ${activeTab} data:`, error);
      addNotification({
        title: 'Error',
        message: `No se pudieron cargar los datos de ${activeTab}`,
        type: 'error',
        category: 'auditoria'
      });
    } finally {
      setLoading(false);
    }
  };

  const renderOverviewTab = () => {
    if (!overview) return null;

    // Datos para gráfico de pie - BEB vs No BEB
    const pieData = [
      { id: 'BEB', label: 'BEB', value: overview.prescripcionesBEB },
      {
        id: 'No BEB',
        label: 'No BEB',
        value: overview.totalPrescripciones - overview.prescripcionesBEB,
      },
    ];

    return (
      <div>
        <div className="overview-grid">
          {/* Totales del mercado */}
          <div className="overview-card">
            <h3>Totales del Mercado</h3>
            <div className="overview-stats">
              <div className="overview-stat">
                <div className="overview-stat-value">
                  {overview.totalPrescripciones.toLocaleString()}
                </div>
                <div className="overview-stat-label">Total Prescripciones</div>
              </div>
              <div className="overview-stat">
                <div className="overview-stat-value">{overview.totalMedicos.toLocaleString()}</div>
                <div className="overview-stat-label">Total Médicos</div>
              </div>
              <div className="overview-stat">
                <div className="overview-stat-value">{overview.totalProductos.toLocaleString()}</div>
                <div className="overview-stat-label">Total Productos</div>
              </div>
              <div className="overview-stat">
                <div className="overview-stat-value">{overview.totalLaboratorios.toLocaleString()}</div>
                <div className="overview-stat-label">Total Laboratorios</div>
              </div>
            </div>
          </div>

          {/* Datos BEB */}
          <div className="overview-card">
            <h3>Datos BEB</h3>
            <div className="overview-stats">
              <div className="overview-stat">
                <div className="overview-stat-value beb">
                  {overview.prescripcionesBEB.toLocaleString()}
                </div>
                <div className="overview-stat-label">Prescripciones BEB</div>
              </div>
              <div className="overview-stat">
                <div className="overview-stat-value beb">{overview.medicosBEB.toLocaleString()}</div>
                <div className="overview-stat-label">Médicos BEB</div>
              </div>
              <div className="overview-stat">
                <div className="overview-stat-value beb">{overview.productosBEB.toLocaleString()}</div>
                <div className="overview-stat-label">Productos BEB</div>
              </div>
              <div className="overview-stat">
                <div className="overview-stat-value beb">{overview.marketShareBEB.toFixed(2)}%</div>
                <div className="overview-stat-label">Market Share BEB</div>
              </div>
            </div>
          </div>
        </div>

        {/* Gráfico de distribución */}
        <div className="chart-card">
          <h3>Distribución de Prescripciones - BEB vs No BEB</h3>
          <div style={{ height: '400px' }}>
            <ResponsivePie
              data={pieData}
              margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
              innerRadius={0.5}
              padAngle={0.7}
              cornerRadius={3}
              activeOuterRadiusOffset={8}
              colors={['#4caf50', '#9e9e9e']}
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
                  <div>
                    Porcentaje:{' '}
                    {(
                      (datum.value / overview.totalPrescripciones) *
                      100
                    ).toFixed(2)}
                    %
                  </div>
                </div>
              )}
            />
          </div>
        </div>
      </div>
    );
  };

  const renderLaboratoriosTab = () => {
    const barData = laboratorios.slice(0, 15).map((lab) => ({
      laboratorio: lab.laboratorio.substring(0, 20),
      'Prescripciones': lab.prescripciones,
      'Market Share': lab.marketShare,
    }));

    return (
      <div>
        <div className="auditoria-filters" style={{ marginBottom: '20px' }}>
          <div className="filter-group">
            <label>Top N</label>
            <select className="filter-select" value={topN} onChange={(e) => setTopN(Number(e.target.value))}>
              <option value={25}>Top 25</option>
              <option value={50}>Top 50</option>
              <option value={100}>Top 100</option>
            </select>
          </div>
        </div>

        {/* Gráfico */}
        <div className="chart-card" style={{ marginBottom: '24px' }}>
          <h3>Top Laboratorios por Prescripciones</h3>
          <div style={{ height: '400px' }}>
            <ResponsiveBar
              data={barData}
              keys={['Prescripciones']}
              indexBy="laboratorio"
              margin={{ top: 20, right: 30, bottom: 120, left: 80 }}
              padding={0.3}
              valueScale={{ type: 'linear' }}
              colors={['#1976d2']}
              axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: -45,
                legend: 'Laboratorio',
                legendPosition: 'middle',
                legendOffset: 100,
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

        {/* Tabla */}
        <div className="tabla-container">
          <table className="auditoria-table">
            <thead>
              <tr>
                <th>Ranking</th>
                <th>Laboratorio</th>
                <th className="text-center">BEB</th>
                <th className="text-right">Prescripciones</th>
                <th className="text-right">Médicos Únicos</th>
                <th className="text-right">Productos</th>
                <th className="text-right">Market Share</th>
              </tr>
            </thead>
            <tbody>
              {laboratorios.map((lab) => (
                <tr key={lab.ranking} className={lab.esBEB === 1 ? 'row-beb' : ''}>
                  <td className="text-center">
                    <span className={`badge-ranking ranking-${lab.ranking}`}>
                      #{lab.ranking}
                    </span>
                  </td>
                  <td>
                    <strong>{lab.laboratorio}</strong>
                  </td>
                  <td className="text-center">
                    {lab.esBEB === 1 ? (
                      <span style={{ color: '#4caf50', fontWeight: 600 }}>SÍ</span>
                    ) : (
                      <span style={{ color: '#9e9e9e' }}>NO</span>
                    )}
                  </td>
                  <td className="text-right">{lab.prescripciones.toLocaleString()}</td>
                  <td className="text-right">{lab.medicosUnicos.toLocaleString()}</td>
                  <td className="text-right">{lab.productosDelLab.toLocaleString()}</td>
                  <td className="text-right">
                    <strong style={{ color: '#1976d2' }}>{lab.marketShare.toFixed(2)}%</strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderProductosTab = () => {
    const barData = productos.slice(0, 15).map((prod) => ({
      producto: prod.productoNombre.substring(0, 20),
      'Prescripciones': prod.prescripciones,
      'Market Share': prod.marketShare,
    }));

    return (
      <div>
        <div className="auditoria-filters" style={{ marginBottom: '20px' }}>
          <div className="filter-group">
            <label>Top N</label>
            <select className="filter-select" value={topN} onChange={(e) => setTopN(Number(e.target.value))}>
              <option value={25}>Top 25</option>
              <option value={50}>Top 50</option>
              <option value={100}>Top 100</option>
            </select>
          </div>
        </div>

        {/* Gráfico */}
        <div className="chart-card" style={{ marginBottom: '24px' }}>
          <h3>Top Productos por Prescripciones</h3>
          <div style={{ height: '400px' }}>
            <ResponsiveBar
              data={barData}
              keys={['Prescripciones']}
              indexBy="producto"
              margin={{ top: 20, right: 30, bottom: 120, left: 80 }}
              padding={0.3}
              valueScale={{ type: 'linear' }}
              colors={['#9c27b0']}
              axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: -45,
                legend: 'Producto',
                legendPosition: 'middle',
                legendOffset: 100,
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

        {/* Tabla */}
        <div className="tabla-container">
          <table className="auditoria-table">
            <thead>
              <tr>
                <th>Ranking</th>
                <th>Producto</th>
                <th>Laboratorio</th>
                <th className="text-center">BEB</th>
                <th className="text-right">Prescripciones</th>
                <th className="text-right">Médicos</th>
                <th className="text-right">Promedio PX/MER</th>
                <th className="text-right">Market Share</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((prod) => (
                <tr key={prod.ranking} className={prod.esBEB === 1 ? 'row-beb' : ''}>
                  <td className="text-center">
                    <span className={`badge-ranking ranking-${prod.ranking}`}>
                      #{prod.ranking}
                    </span>
                  </td>
                  <td>
                    <strong>{prod.productoNombre}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {prod.codigO_PMIX}
                    </div>
                  </td>
                  <td>{prod.laboratorio}</td>
                  <td className="text-center">
                    {prod.esBEB === 1 ? (
                      <span style={{ color: '#4caf50', fontWeight: 600 }}>SÍ</span>
                    ) : (
                      <span style={{ color: '#9e9e9e' }}>NO</span>
                    )}
                  </td>
                  <td className="text-right">{prod.prescripciones.toLocaleString()}</td>
                  <td className="text-right">{prod.medicosUnicos.toLocaleString()}</td>
                  <td className="text-right">{prod.promedioPX_MER.toFixed(2)}</td>
                  <td className="text-right">
                    <strong style={{ color: '#9c27b0' }}>{prod.marketShare.toFixed(2)}%</strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderMedicosTab = () => {
    const categoriaDistribution = medicos.reduce(
      (acc, med) => {
        acc[med.categoriaMedico] = (acc[med.categoriaMedico] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const pieData = Object.entries(categoriaDistribution).map(([key, value]) => ({
      id: key,
      label: key.replace('_', ' '),
      value,
    }));

    return (
      <div>
        <div className="auditoria-filters" style={{ marginBottom: '20px' }}>
          <div className="filter-group">
            <label>Filtro de Lealtad</label>
            <select
              className="filter-select"
              value={filtroLealtad}
              onChange={(e) => setFiltroLealtad(e.target.value as any)}
            >
              <option value="">Todos</option>
              <option value="SOLO_BEB">Solo BEB</option>
              <option value="CON_BEB">Con BEB</option>
              <option value="SIN_BEB">Sin BEB</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Top N</label>
            <select className="filter-select" value={topN} onChange={(e) => setTopN(Number(e.target.value))}>
              <option value={50}>Top 50</option>
              <option value={100}>Top 100</option>
              <option value={200}>Top 200</option>
            </select>
          </div>
        </div>

        {/* Gráfico de distribución de categorías */}
        <div className="chart-card" style={{ marginBottom: '24px' }}>
          <h3>Distribución por Categoría de Médicos</h3>
          <div style={{ height: '300px' }}>
            <ResponsivePie
              data={pieData}
              margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
              innerRadius={0.5}
              padAngle={0.7}
              cornerRadius={3}
              activeOuterRadiusOffset={8}
              colors={['#1b5e20', '#4caf50', '#f44336']}
              borderWidth={1}
              borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
              arcLinkLabelsSkipAngle={10}
              arcLinkLabelsTextColor="#333333"
              arcLinkLabelsThickness={2}
              arcLinkLabelsColor={{ from: 'color' }}
              arcLabelsSkipAngle={10}
              arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
            />
          </div>
        </div>

        {/* Tabla */}
        <div className="tabla-container">
          <table className="auditoria-table">
            <thead>
              <tr>
                <th>Ranking</th>
                <th>Médico</th>
                <th>Especialidad</th>
                <th>Ubicación</th>
                <th className="text-right">Total PX</th>
                <th className="text-right">PX BEB</th>
                <th className="text-right">Productos</th>
                <th className="text-right">Labs</th>
                <th className="text-center">% BEB</th>
                <th className="text-center">Categoría</th>
              </tr>
            </thead>
            <tbody>
              {medicos.map((med) => (
                <tr key={med.ranking}>
                  <td className="text-center">
                    <span className={`badge-ranking ranking-${med.ranking}`}>
                      #{med.ranking}
                    </span>
                  </td>
                  <td>
                    <strong>{med.medicoNombre || 'Sin nombre'}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {med.cdgmeD_REG}
                    </div>
                  </td>
                  <td>{med.especialidad || '-'}</td>
                  <td>
                    {med.ciudad && (
                      <div>
                        {med.ciudad}
                        {med.barrio && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            {med.barrio}
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="text-right">{med.totalPrescripciones.toLocaleString()}</td>
                  <td className="text-right">
                    <strong style={{ color: '#4caf50' }}>
                      {med.prescripcionesBEB.toLocaleString()}
                    </strong>
                  </td>
                  <td className="text-right">{med.productosDistintos}</td>
                  <td className="text-right">{med.laboratoriosDistintos}</td>
                  <td className="text-center">
                    <strong style={{ color: '#1976d2' }}>{med.porcentajeBEB.toFixed(1)}%</strong>
                  </td>
                  <td className="text-center">
                    <span
                      className={`badge-categoria ${med.categoriaMedico.toLowerCase().replace('_', '-')}`}
                    >
                      {med.categoriaMedico.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="auditoria-container">
      {/* Selector de mercado */}
      {!selectedMercado ? (
        <div className="selector-mercado-grande">
          <h2>Seleccione un mercado para analizar</h2>
          <select
            value={selectedMercado}
            onChange={(e) => setSelectedMercado(e.target.value)}
          >
            <option value="">-- Seleccione un mercado --</option>
            {mercados.map((mercado) => (
              <option key={mercado.cdgMercado} value={mercado.cdgMercado.toString()}>
                {mercado.nombre} {mercado.abreviatura && `(${mercado.abreviatura})`}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <>
          {/* Header con filtros */}
          <div className="auditoria-header">
            <div className="auditoria-filters">
              <div className="filter-group">
                <label>Mercado</label>
                <select
                  className="filter-select"
                  value={selectedMercado}
                  onChange={(e) => setSelectedMercado(e.target.value)}
                >
                  {mercados.map((mercado) => (
                    <option key={mercado.cdgMercado} value={mercado.cdgMercado.toString()}>
                      {mercado.nombre} {mercado.abreviatura && `(${mercado.abreviatura})`}
                    </option>
                  ))}
                </select>
              </div>

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
            </div>
          </div>

          {/* Tabs */}
          <div className="auditoria-tabs">
            <button
              className={`auditoria-tab ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <span className="material-icons" style={{ fontSize: '1rem', marginRight: '4px' }}>
                dashboard
              </span>
              Overview
            </button>
            <button
              className={`auditoria-tab ${activeTab === 'laboratorios' ? 'active' : ''}`}
              onClick={() => setActiveTab('laboratorios')}
            >
              <span className="material-icons" style={{ fontSize: '1rem', marginRight: '4px' }}>
                science
              </span>
              Laboratorios
            </button>
            <button
              className={`auditoria-tab ${activeTab === 'productos' ? 'active' : ''}`}
              onClick={() => setActiveTab('productos')}
            >
              <span className="material-icons" style={{ fontSize: '1rem', marginRight: '4px' }}>
                medication
              </span>
              Productos
            </button>
            <button
              className={`auditoria-tab ${activeTab === 'medicos' ? 'active' : ''}`}
              onClick={() => setActiveTab('medicos')}
            >
              <span className="material-icons" style={{ fontSize: '1rem', marginRight: '4px' }}>
                local_hospital
              </span>
              Médicos
            </button>
          </div>

          {/* Contenido de tabs */}
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Cargando datos...</p>
            </div>
          ) : (
            <div style={{ marginTop: '20px' }}>
              {activeTab === 'overview' && renderOverviewTab()}
              {activeTab === 'laboratorios' && renderLaboratoriosTab()}
              {activeTab === 'productos' && renderProductosTab()}
              {activeTab === 'medicos' && renderMedicosTab()}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AnalisisMercadoPage;
