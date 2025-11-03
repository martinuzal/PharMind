import { useState, useEffect } from 'react';
import { ResponsiveLine } from '@nivo/line';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveHeatMap } from '@nivo/heatmap';
import './ActividadVisitasPage.css';

interface KPIs {
  totalVisitas: number;
  medicosVisitados: number;
  totalMedicos: number;
  cobertura: number;
  nuevosMedicos: number;
  duracionPromedio: number;
  tasaExito: number;
}

interface TendenciaData {
  fecha: string;
  cantidad: number;
}

interface DistribucionData {
  tipo?: string;
  cantidad: number;
  porcentaje: number;
  especialidad?: string;
  categoria?: string;
  segmento?: string;
  region?: string;
  distrito?: string;
  zona?: string;
  turno?: string;
  tipoInstitucion?: string;
  sector?: string;
}

interface EspecialidadData {
  especialidad: string;
  cantidad: number;
}

const ActividadVisitasPage = () => {
  const [kpis, setKpis] = useState<KPIs | null>(null);
  const [tendencia, setTendencia] = useState<TendenciaData[]>([]);
  const [distribucionTipo, setDistribucionTipo] = useState<DistribucionData[]>([]);
  const [distribucionSegmento, setDistribucionSegmento] = useState<DistribucionData[]>([]);
  const [distribucionEspecialidad, setDistribucionEspecialidad] = useState<EspecialidadData[]>([]);
  const [distribucionCategoria, setDistribucionCategoria] = useState<DistribucionData[]>([]);
  const [distribucionTurno, setDistribucionTurno] = useState<DistribucionData[]>([]);
  const [distribucionTipoInstitucion, setDistribucionTipoInstitucion] = useState<DistribucionData[]>([]);
  const [distribucionSector, setDistribucionSector] = useState<DistribucionData[]>([]);
  const [distribucionZona, setDistribucionZona] = useState<DistribucionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState('mensual');

  useEffect(() => {
    fetchDashboardData();
  }, [periodo]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch KPIs
      const kpisResponse = await fetch('http://localhost:5209/api/analytics/visitas/kpis');
      const kpisData = await kpisResponse.json();
      setKpis(kpisData);

      // Fetch Tendencia
      const tendenciaResponse = await fetch(`http://localhost:5209/api/analytics/visitas/tendencia?periodo=${periodo}`);
      const tendenciaData = await tendenciaResponse.json();
      setTendencia(tendenciaData);

      // Fetch Distribución por Tipo
      const tipoResponse = await fetch('http://localhost:5209/api/analytics/visitas/por-tipo');
      const tipoData = await tipoResponse.json();
      setDistribucionTipo(tipoData);

      // Fetch Distribución por Segmento
      const segmentoResponse = await fetch('http://localhost:5209/api/analytics/visitas/por-segmento');
      const segmentoData = await segmentoResponse.json();
      setDistribucionSegmento(segmentoData);

      // Fetch Distribución por Categoría
      const categoriaResponse = await fetch('http://localhost:5209/api/analytics/visitas/por-categoria');
      const categoriaData = await categoriaResponse.json();
      setDistribucionCategoria(categoriaData);

      // Fetch Distribución por Turno
      const turnoResponse = await fetch('http://localhost:5209/api/analytics/visitas/por-turno');
      const turnoData = await turnoResponse.json();
      setDistribucionTurno(turnoData);

      // Fetch Distribución por Tipo de Institución
      const tipoInstitucionResponse = await fetch('http://localhost:5209/api/analytics/visitas/por-tipo-institucion');
      const tipoInstitucionData = await tipoInstitucionResponse.json();
      setDistribucionTipoInstitucion(tipoInstitucionData);

      // Fetch Distribución por Sector
      const sectorResponse = await fetch('http://localhost:5209/api/analytics/visitas/por-sector');
      const sectorData = await sectorResponse.json();
      setDistribucionSector(sectorData);

      // Fetch Distribución por Zona
      const zonaResponse = await fetch('http://localhost:5209/api/analytics/visitas/por-zona');
      const zonaData = await zonaResponse.json();
      setDistribucionZona(zonaData);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  // Transform data for NIVO Line chart
  const lineChartData = [
    {
      id: 'Visitas',
      data: tendencia.map(item => ({
        x: item.fecha,
        y: item.cantidad
      }))
    }
  ];

  // Transform data for NIVO Pie charts
  const pieChartDataTipo = distribucionTipo.map(item => ({
    id: item.tipo,
    label: item.tipo,
    value: item.cantidad
  }));

  const pieChartDataSegmento = distribucionSegmento.map(item => ({
    id: item.segmento,
    label: `Segmento ${item.segmento}`,
    value: item.cantidad
  }));

  // Transform data for NIVO Bar charts (new dimensions)
  const barChartDataCategoria = distribucionCategoria.map(item => ({
    categoria: item.categoria || 'Sin categoría',
    cantidad: item.cantidad
  }));

  const barChartDataTurno = distribucionTurno.map(item => ({
    turno: item.turno || 'Sin turno',
    cantidad: item.cantidad
  }));

  const barChartDataTipoInstitucion = distribucionTipoInstitucion.map(item => ({
    tipo: item.tipoInstitucion || 'Sin tipo',
    cantidad: item.cantidad
  }));

  const barChartDataSector = distribucionSector.map(item => ({
    sector: item.sector || 'Sin sector',
    cantidad: item.cantidad
  }));

  const barChartDataZona = distribucionZona.map(item => ({
    zona: item.zona || 'Sin zona',
    cantidad: item.cantidad
  }));

  // Transform data for HeatMap - Intensidad de visitas por zona
  const heatmapData = distribucionZona.map(item => ({
    id: item.zona || 'Sin zona',
    data: [
      { x: 'Intensidad', y: item.cantidad }
    ]
  }));

  if (loading) {
    return (
      <div className="analytics-page">
        <div className="loading-spinner">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      <div className="page-header">
        <h1>Actividad de Visitas Médicas</h1>
        <div className="page-filters">
          <select value={periodo} onChange={(e) => setPeriodo(e.target.value)}>
            <option value="diario">Diario</option>
            <option value="semanal">Semanal</option>
            <option value="mensual">Mensual</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon">
            <span className="material-icons">event</span>
          </div>
          <div className="kpi-content">
            <div className="kpi-label">Total Visitas</div>
            <div className="kpi-value">{kpis?.totalVisitas || 0}</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">
            <span className="material-icons">people</span>
          </div>
          <div className="kpi-content">
            <div className="kpi-label">Médicos Visitados</div>
            <div className="kpi-value">{kpis?.medicosVisitados || 0}</div>
            <div className="kpi-subtitle">de {kpis?.totalMedicos || 0} médicos</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">
            <span className="material-icons">pie_chart</span>
          </div>
          <div className="kpi-content">
            <div className="kpi-label">Cobertura</div>
            <div className="kpi-value">{kpis?.cobertura || 0}%</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">
            <span className="material-icons">person_add</span>
          </div>
          <div className="kpi-content">
            <div className="kpi-label">Nuevos Médicos</div>
            <div className="kpi-value">{kpis?.nuevosMedicos || 0}</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">
            <span className="material-icons">schedule</span>
          </div>
          <div className="kpi-content">
            <div className="kpi-label">Duración Promedio</div>
            <div className="kpi-value">{kpis?.duracionPromedio || 0} min</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">
            <span className="material-icons">check_circle</span>
          </div>
          <div className="kpi-content">
            <div className="kpi-label">Tasa de Éxito</div>
            <div className="kpi-value">{kpis?.tasaExito || 0}%</div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Line Chart - Tendencia de Visitas */}
        <div className="chart-card chart-card-large">
          <div className="chart-header">
            <h3>Tendencia de Visitas</h3>
          </div>
          <div className="chart-container">
            <ResponsiveLine
              data={lineChartData}
              margin={{ top: 20, right: 30, bottom: 60, left: 60 }}
              xScale={{ type: 'point' }}
              yScale={{
                type: 'linear',
                min: 'auto',
                max: 'auto',
                stacked: false,
                reverse: false
              }}
              axisTop={null}
              axisRight={null}
              axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: -45,
                legend: 'Período',
                legendOffset: 50,
                legendPosition: 'middle'
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'Cantidad de Visitas',
                legendOffset: -50,
                legendPosition: 'middle'
              }}
              colors={{ scheme: 'category10' }}
              pointSize={8}
              pointColor={{ theme: 'background' }}
              pointBorderWidth={2}
              pointBorderColor={{ from: 'serieColor' }}
              pointLabelYOffset={-12}
              useMesh={true}
              enableArea={true}
              areaOpacity={0.1}
              legends={[
                {
                  anchor: 'top-right',
                  direction: 'column',
                  justify: false,
                  translateX: 0,
                  translateY: 0,
                  itemsSpacing: 0,
                  itemDirection: 'left-to-right',
                  itemWidth: 80,
                  itemHeight: 20,
                  itemOpacity: 0.75,
                  symbolSize: 12,
                  symbolShape: 'circle',
                  symbolBorderColor: 'rgba(0, 0, 0, .5)',
                }
              ]}
            />
          </div>
        </div>

        {/* Pie Chart - Distribución por Tipo de Visita */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Visitas por Tipo</h3>
          </div>
          <div className="chart-container">
            <ResponsivePie
              data={pieChartDataTipo}
              margin={{ top: 20, right: 80, bottom: 80, left: 80 }}
              innerRadius={0.5}
              padAngle={0.7}
              cornerRadius={3}
              activeOuterRadiusOffset={8}
              colors={{ scheme: 'nivo' }}
              borderWidth={1}
              borderColor={{
                from: 'color',
                modifiers: [['darker', 0.2]]
              }}
              arcLinkLabelsSkipAngle={10}
              arcLinkLabelsTextColor="#333333"
              arcLinkLabelsThickness={2}
              arcLinkLabelsColor={{ from: 'color' }}
              arcLabelsSkipAngle={10}
              arcLabelsTextColor={{
                from: 'color',
                modifiers: [['darker', 2]]
              }}
              legends={[
                {
                  anchor: 'bottom',
                  direction: 'row',
                  justify: false,
                  translateX: 0,
                  translateY: 56,
                  itemsSpacing: 0,
                  itemWidth: 100,
                  itemHeight: 18,
                  itemTextColor: '#999',
                  itemDirection: 'left-to-right',
                  itemOpacity: 1,
                  symbolSize: 18,
                  symbolShape: 'circle',
                }
              ]}
            />
          </div>
        </div>

        {/* Pie Chart - Distribución por Segmento de Médico */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Visitas por Segmento de Médico</h3>
          </div>
          <div className="chart-container">
            <ResponsivePie
              data={pieChartDataSegmento}
              margin={{ top: 20, right: 80, bottom: 80, left: 80 }}
              innerRadius={0.5}
              padAngle={0.7}
              cornerRadius={3}
              activeOuterRadiusOffset={8}
              colors={{ scheme: 'set2' }}
              borderWidth={1}
              borderColor={{
                from: 'color',
                modifiers: [['darker', 0.2]]
              }}
              arcLinkLabelsSkipAngle={10}
              arcLinkLabelsTextColor="#333333"
              arcLinkLabelsThickness={2}
              arcLinkLabelsColor={{ from: 'color' }}
              arcLabelsSkipAngle={10}
              arcLabelsTextColor={{
                from: 'color',
                modifiers: [['darker', 2]]
              }}
              legends={[
                {
                  anchor: 'bottom',
                  direction: 'row',
                  justify: false,
                  translateX: 0,
                  translateY: 56,
                  itemsSpacing: 0,
                  itemWidth: 100,
                  itemHeight: 18,
                  itemTextColor: '#999',
                  itemDirection: 'left-to-right',
                  itemOpacity: 1,
                  symbolSize: 18,
                  symbolShape: 'circle',
                }
              ]}
            />
          </div>
        </div>

        {/* Bar Chart - Distribución por Categoría */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Visitas por Categoría de Médico</h3>
          </div>
          <div className="chart-container">
            <ResponsiveBar
              data={barChartDataCategoria}
              keys={['cantidad']}
              indexBy="categoria"
              margin={{ top: 20, right: 30, bottom: 60, left: 60 }}
              padding={0.3}
              valueScale={{ type: 'linear' }}
              indexScale={{ type: 'band', round: true }}
              colors={{ scheme: 'nivo' }}
              borderColor={{
                from: 'color',
                modifiers: [['darker', 1.6]]
              }}
              axisTop={null}
              axisRight={null}
              axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'Categoría',
                legendPosition: 'middle',
                legendOffset: 40
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'Cantidad de Visitas',
                legendPosition: 'middle',
                legendOffset: -50
              }}
              labelSkipWidth={12}
              labelSkipHeight={12}
              labelTextColor={{
                from: 'color',
                modifiers: [['darker', 1.6]]
              }}
            />
          </div>
        </div>

        {/* Bar Chart - Distribución por Turno */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Visitas por Turno</h3>
          </div>
          <div className="chart-container">
            <ResponsiveBar
              data={barChartDataTurno}
              keys={['cantidad']}
              indexBy="turno"
              margin={{ top: 20, right: 30, bottom: 60, left: 60 }}
              padding={0.3}
              valueScale={{ type: 'linear' }}
              indexScale={{ type: 'band', round: true }}
              colors={{ scheme: 'paired' }}
              borderColor={{
                from: 'color',
                modifiers: [['darker', 1.6]]
              }}
              axisTop={null}
              axisRight={null}
              axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'Turno',
                legendPosition: 'middle',
                legendOffset: 40
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'Cantidad de Visitas',
                legendPosition: 'middle',
                legendOffset: -50
              }}
              labelSkipWidth={12}
              labelSkipHeight={12}
              labelTextColor={{
                from: 'color',
                modifiers: [['darker', 1.6]]
              }}
            />
          </div>
        </div>

        {/* Bar Chart - Distribución por Tipo de Institución */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Visitas por Tipo de Institución</h3>
          </div>
          <div className="chart-container">
            <ResponsiveBar
              data={barChartDataTipoInstitucion}
              keys={['cantidad']}
              indexBy="tipo"
              margin={{ top: 20, right: 30, bottom: 60, left: 60 }}
              padding={0.3}
              valueScale={{ type: 'linear' }}
              indexScale={{ type: 'band', round: true }}
              colors={{ scheme: 'category10' }}
              borderColor={{
                from: 'color',
                modifiers: [['darker', 1.6]]
              }}
              axisTop={null}
              axisRight={null}
              axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: -15,
                legend: 'Tipo de Institución',
                legendPosition: 'middle',
                legendOffset: 50
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'Cantidad de Visitas',
                legendPosition: 'middle',
                legendOffset: -50
              }}
              labelSkipWidth={12}
              labelSkipHeight={12}
              labelTextColor={{
                from: 'color',
                modifiers: [['darker', 1.6]]
              }}
            />
          </div>
        </div>

        {/* Bar Chart - Distribución por Sector */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Visitas por Sector</h3>
          </div>
          <div className="chart-container">
            <ResponsiveBar
              data={barChartDataSector}
              keys={['cantidad']}
              indexBy="sector"
              margin={{ top: 20, right: 30, bottom: 60, left: 60 }}
              padding={0.3}
              valueScale={{ type: 'linear' }}
              indexScale={{ type: 'band', round: true }}
              colors={{ scheme: 'set1' }}
              borderColor={{
                from: 'color',
                modifiers: [['darker', 1.6]]
              }}
              axisTop={null}
              axisRight={null}
              axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'Sector',
                legendPosition: 'middle',
                legendOffset: 40
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'Cantidad de Visitas',
                legendPosition: 'middle',
                legendOffset: -50
              }}
              labelSkipWidth={12}
              labelSkipHeight={12}
              labelTextColor={{
                from: 'color',
                modifiers: [['darker', 1.6]]
              }}
            />
          </div>
        </div>

        {/* Bar Chart - Distribución por Zona */}
        <div className="chart-card chart-card-large">
          <div className="chart-header">
            <h3>Visitas por Zona</h3>
          </div>
          <div className="chart-container">
            <ResponsiveBar
              data={barChartDataZona}
              keys={['cantidad']}
              indexBy="zona"
              margin={{ top: 20, right: 30, bottom: 80, left: 60 }}
              padding={0.3}
              valueScale={{ type: 'linear' }}
              indexScale={{ type: 'band', round: true }}
              colors={{ scheme: 'accent' }}
              borderColor={{
                from: 'color',
                modifiers: [['darker', 1.6]]
              }}
              axisTop={null}
              axisRight={null}
              axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: -45,
                legend: 'Zona',
                legendPosition: 'middle',
                legendOffset: 70
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'Cantidad de Visitas',
                legendPosition: 'middle',
                legendOffset: -50
              }}
              labelSkipWidth={12}
              labelSkipHeight={12}
              labelTextColor={{
                from: 'color',
                modifiers: [['darker', 1.6]]
              }}
            />
          </div>
        </div>

        {/* HeatMap - Mapa de Calor por Zona */}
        <div className="chart-card chart-card-large">
          <div className="chart-header">
            <h3>Mapa de Calor: Intensidad de Visitas por Zona</h3>
          </div>
          <div className="chart-container">
            <ResponsiveHeatMap
              data={heatmapData}
              margin={{ top: 60, right: 90, bottom: 60, left: 120 }}
              valueFormat=">-.0f"
              axisTop={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: '',
                legendOffset: 46
              }}
              axisRight={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'Cantidad de Visitas',
                legendPosition: 'middle',
                legendOffset: 70
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'Zona Geográfica',
                legendPosition: 'middle',
                legendOffset: -100
              }}
              colors={{
                type: 'sequential',
                scheme: 'oranges'
              }}
              emptyColor="#555555"
              borderColor={{
                from: 'color',
                modifiers: [['darker', 0.6]]
              }}
              labelTextColor={{
                from: 'color',
                modifiers: [['darker', 3]]
              }}
              legends={[
                {
                  anchor: 'bottom',
                  translateX: 0,
                  translateY: 30,
                  length: 400,
                  thickness: 8,
                  direction: 'row',
                  tickPosition: 'after',
                  tickSize: 3,
                  tickSpacing: 4,
                  tickOverlap: false,
                  title: 'Intensidad de Visitas →',
                  titleAlign: 'start',
                  titleOffset: 4
                }
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActividadVisitasPage;
