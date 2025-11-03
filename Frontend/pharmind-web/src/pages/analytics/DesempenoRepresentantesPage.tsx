import React, { useState, useEffect } from 'react';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsiveLine } from '@nivo/line';
import { ResponsiveRadar } from '@nivo/radar';
import './ActividadVisitasPage.css';

interface RepresentanteKPI {
  representanteId: number;
  representanteNombre: string;
  totalVisitas: number;
  medicosUnicos: number;
  tasaExito: number;
  duracionPromedio: number;
  cumplimientoObjetivos: number;
  promedioDiarioVisitas: number;
  diasEnPeriodo: number;
}

interface RankingItem {
  representanteId: number;
  nombre: string;
  distrito: string;
  region: string;
  totalVisitas: number;
  medicosUnicos: number;
  tasaExito: number;
  cumplimiento: number;
  promedioDiarioVisitas: number;
  valorMetrica: number;
}

interface EvolucionItem {
  fecha: string;
  totalVisitas: number;
  visitasExitosas: number;
  medicosUnicos: number;
  duracionPromedio: number;
}

interface ComparativaData {
  representante: {
    id: number;
    nombre: string;
    region: string;
    distrito: string;
    visitas: number;
    medicosUnicos: number;
    tasaExito: number;
    duracionPromedio: number;
    cumplimientoObjetivos: number;
    promedioDiarioVisitas: number;
  };
  promedioEquipo: {
    visitas: number;
    medicosUnicos: number;
    tasaExito: number;
    duracionPromedio: number;
    cumplimientoObjetivos: number;
    promedioDiarioVisitas: number;
  };
  diferencia: {
    visitas: number;
    medicosUnicos: number;
    tasaExito: number;
    duracionPromedio: number;
    cumplimientoObjetivos: number;
    promedioDiarioVisitas: number;
  };
}

interface EstadisticasGlobales {
  totalRepresentantes: number;
  totalVisitas: number;
  promedioVisitasPorRepresentante: number;
  promedioDiarioGeneralVisitas: number;
  promedioDiarioPorRepresentante: number;
  medicosUnicosVisitados: number;
  tasaExitoPromedio: number;
  cumplimientoObjetivosPromedio: number;
  diasEnPeriodo: number;
}

interface Representante {
  id: number;
  nombre: string;
  email: string;
  distrito: string;
  region: string;
}

const DesempenoRepresentantesPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [selectedRepresentante, setSelectedRepresentante] = useState<number | null>(null);
  const [periodo, setPeriodo] = useState('mensual');
  const [metricaRanking, setMetricaRanking] = useState('visitas');

  const [representantes, setRepresentantes] = useState<Representante[]>([]);
  const [kpis, setKpis] = useState<RepresentanteKPI | null>(null);
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [evolucion, setEvolucion] = useState<EvolucionItem[]>([]);
  const [comparativa, setComparativa] = useState<ComparativaData | null>(null);
  const [estadisticasGlobales, setEstadisticasGlobales] = useState<EstadisticasGlobales | null>(null);

  const API_BASE_URL = 'http://localhost:5209/api';

  // Cargar lista de representantes
  useEffect(() => {
    const fetchRepresentantes = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/analytics/representantes`);
        const data = await response.json();
        setRepresentantes(data);

        // Seleccionar el primer representante por defecto
        if (data.length > 0 && !selectedRepresentante) {
          setSelectedRepresentante(data[0].id);
        }
      } catch (error) {
        console.error('Error fetching representantes:', error);
      }
    };

    fetchRepresentantes();
  }, []);

  // Cargar datos cuando cambia el representante o periodo
  useEffect(() => {
    if (!selectedRepresentante) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        // Calcular fechas (últimos 6 meses)
        const fechaFin = new Date();
        const fechaInicio = new Date();
        fechaInicio.setMonth(fechaInicio.getMonth() - 6);

        const params = new URLSearchParams({
          fechaInicio: fechaInicio.toISOString().split('T')[0],
          fechaFin: fechaFin.toISOString().split('T')[0]
        });

        // Fetch KPIs del representante
        const kpisResponse = await fetch(
          `${API_BASE_URL}/analytics/representantes/${selectedRepresentante}/kpis?${params}`
        );
        const kpisData = await kpisResponse.json();
        setKpis(kpisData);

        // Fetch evolución
        const evolucionResponse = await fetch(
          `${API_BASE_URL}/analytics/representantes/${selectedRepresentante}/evolucion?${params}&periodo=${periodo}`
        );
        const evolucionData = await evolucionResponse.json();
        setEvolucion(evolucionData);

        // Fetch comparativa
        const comparativaResponse = await fetch(
          `${API_BASE_URL}/analytics/representantes/${selectedRepresentante}/comparativa?${params}`
        );
        const comparativaData = await comparativaResponse.json();
        setComparativa(comparativaData);

        // Fetch ranking
        const rankingParams = new URLSearchParams({
          ...Object.fromEntries(params),
          metrica: metricaRanking,
          top: '10'
        });
        const rankingResponse = await fetch(
          `${API_BASE_URL}/analytics/representantes/ranking?${rankingParams}`
        );
        const rankingData = await rankingResponse.json();
        setRanking(rankingData);

        // Fetch estadísticas globales
        const statsResponse = await fetch(
          `${API_BASE_URL}/analytics/representantes/estadisticas-globales?${params}`
        );
        const statsData = await statsResponse.json();
        setEstadisticasGlobales(statsData);

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedRepresentante, periodo, metricaRanking]);

  if (loading) {
    return (
      <div className="analytics-page">
        <div className="loading-spinner">Cargando datos...</div>
      </div>
    );
  }

  if (!selectedRepresentante && representantes.length === 0) {
    return (
      <div className="analytics-page">
        <div className="page-header">
          <h1>Desempeño de Representantes</h1>
        </div>
        <div className="loading-spinner">
          No hay representantes disponibles. Por favor, asegúrate de que existan representantes en la base de datos.
        </div>
      </div>
    );
  }

  if (!selectedRepresentante) {
    return (
      <div className="analytics-page">
        <div className="page-header">
          <h1>Desempeño de Representantes</h1>
          <div className="page-filters">
            <select
              value={selectedRepresentante || ''}
              onChange={(e) => setSelectedRepresentante(Number(e.target.value))}
            >
              <option value="">Seleccionar Representante</option>
              {representantes.map(rep => (
                <option key={rep.id} value={rep.id}>
                  {rep.nombre} - {rep.distrito}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="loading-spinner">
          Por favor, selecciona un representante para ver su desempeño.
        </div>
      </div>
    );
  }

  // Preparar datos para gráfico de evolución (línea múltiple)
  const evolucionChartData = [
    {
      id: 'Visitas Totales',
      data: evolucion.map(e => ({
        x: e.fecha,
        y: e.totalVisitas
      }))
    },
    {
      id: 'Visitas Exitosas',
      data: evolucion.map(e => ({
        x: e.fecha,
        y: e.visitasExitosas
      }))
    },
    {
      id: 'Médicos Únicos',
      data: evolucion.map(e => ({
        x: e.fecha,
        y: e.medicosUnicos
      }))
    }
  ];

  // Preparar datos para gráfico de ranking
  const rankingChartData = ranking.map(r => ({
    representante: r.nombre.split(' ')[0], // Solo primer nombre
    valor: r.valorMetrica,
    promedioDiario: r.promedioDiarioVisitas
  }));

  // Preparar datos para radar comparativo
  const radarData = comparativa ? [
    {
      metrica: 'Visitas',
      Representante: (comparativa.representante.visitas / comparativa.promedioEquipo.visitas * 100) || 0,
      'Promedio Equipo': 100
    },
    {
      metrica: 'Cobertura',
      Representante: (comparativa.representante.medicosUnicos / comparativa.promedioEquipo.medicosUnicos * 100) || 0,
      'Promedio Equipo': 100
    },
    {
      metrica: 'Tasa Éxito',
      Representante: (comparativa.representante.tasaExito / comparativa.promedioEquipo.tasaExito * 100) || 0,
      'Promedio Equipo': 100
    },
    {
      metrica: 'Cumplimiento',
      Representante: (comparativa.representante.cumplimientoObjetivos / comparativa.promedioEquipo.cumplimientoObjetivos * 100) || 0,
      'Promedio Equipo': 100
    },
    {
      metrica: 'Prom. Diario',
      Representante: (comparativa.representante.promedioDiarioVisitas / comparativa.promedioEquipo.promedioDiarioVisitas * 100) || 0,
      'Promedio Equipo': 100
    }
  ] : [];

  return (
    <div className="analytics-page">
      <div className="page-header">
        <h1>Desempeño de Representantes</h1>
        <div className="page-filters">
          <select
            value={selectedRepresentante || ''}
            onChange={(e) => setSelectedRepresentante(Number(e.target.value))}
          >
            <option value="">Seleccionar Representante</option>
            {representantes.map(rep => (
              <option key={rep.id} value={rep.id}>
                {rep.nombre} - {rep.distrito}
              </option>
            ))}
          </select>
          <select value={periodo} onChange={(e) => setPeriodo(e.target.value)}>
            <option value="diario">Diario</option>
            <option value="semanal">Semanal</option>
            <option value="mensual">Mensual</option>
          </select>
        </div>
      </div>

      {/* KPIs Globales */}
      {estadisticasGlobales && (
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-icon">
              <span className="material-icons">groups</span>
            </div>
            <div className="kpi-content">
              <div className="kpi-label">Total Representantes</div>
              <div className="kpi-value">{estadisticasGlobales.totalRepresentantes}</div>
              <div className="kpi-subtitle">Activos en el sistema</div>
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon">
              <span className="material-icons">trending_up</span>
            </div>
            <div className="kpi-content">
              <div className="kpi-label">Prom. Visitas/Rep</div>
              <div className="kpi-value">{estadisticasGlobales.promedioVisitasPorRepresentante}</div>
              <div className="kpi-subtitle">En {estadisticasGlobales.diasEnPeriodo} días</div>
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon">
              <span className="material-icons">calendar_today</span>
            </div>
            <div className="kpi-content">
              <div className="kpi-label">Prom. Diario/Rep</div>
              <div className="kpi-value">{estadisticasGlobales.promedioDiarioPorRepresentante}</div>
              <div className="kpi-subtitle">Visitas por día</div>
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon">
              <span className="material-icons">check_circle</span>
            </div>
            <div className="kpi-content">
              <div className="kpi-label">Tasa Éxito Promedio</div>
              <div className="kpi-value">{estadisticasGlobales.tasaExitoPromedio}%</div>
              <div className="kpi-subtitle">General del equipo</div>
            </div>
          </div>
        </div>
      )}

      {/* KPIs del Representante Seleccionado */}
      {kpis && (
        <>
          <h2 style={{ marginTop: '32px', marginBottom: '16px', color: 'var(--text-primary)' }}>
            {kpis.representanteNombre}
          </h2>
          <div className="kpi-grid">
            <div className="kpi-card">
              <div className="kpi-icon">
                <span className="material-icons">assignment</span>
              </div>
              <div className="kpi-content">
                <div className="kpi-label">Total Visitas</div>
                <div className="kpi-value">{kpis.totalVisitas}</div>
                <div className="kpi-subtitle">{kpis.promedioDiarioVisitas} visitas/día</div>
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-icon">
                <span className="material-icons">local_hospital</span>
              </div>
              <div className="kpi-content">
                <div className="kpi-label">Médicos Visitados</div>
                <div className="kpi-value">{kpis.medicosUnicos}</div>
                <div className="kpi-subtitle">Únicos</div>
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-icon">
                <span className="material-icons">check_circle</span>
              </div>
              <div className="kpi-content">
                <div className="kpi-label">Tasa de Éxito</div>
                <div className="kpi-value">{kpis.tasaExito}%</div>
                <div className="kpi-subtitle">Visitas exitosas</div>
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-icon">
                <span className="material-icons">flag</span>
              </div>
              <div className="kpi-content">
                <div className="kpi-label">Cumplimiento</div>
                <div className="kpi-value">{kpis.cumplimientoObjetivos}%</div>
                <div className="kpi-subtitle">De objetivos</div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Gráficos */}
      <div className="charts-grid" style={{ marginTop: '32px' }}>
        {/* Evolución Temporal */}
        <div className="chart-card chart-card-large">
          <div className="chart-header">
            <h3>Evolución de Métricas ({periodo})</h3>
          </div>
          <div className="chart-container">
            <ResponsiveLine
              data={evolucionChartData}
              margin={{ top: 20, right: 120, bottom: 60, left: 60 }}
              xScale={{ type: 'point' }}
              yScale={{ type: 'linear', min: 'auto', max: 'auto', stacked: false }}
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
                legend: 'Cantidad',
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
              legends={[
                {
                  anchor: 'bottom-right',
                  direction: 'column',
                  justify: false,
                  translateX: 100,
                  translateY: 0,
                  itemsSpacing: 0,
                  itemDirection: 'left-to-right',
                  itemWidth: 80,
                  itemHeight: 20,
                  itemOpacity: 0.75,
                  symbolSize: 12,
                  symbolShape: 'circle',
                  symbolBorderColor: 'rgba(0, 0, 0, .5)',
                  effects: [
                    {
                      on: 'hover',
                      style: {
                        itemBackground: 'rgba(0, 0, 0, .03)',
                        itemOpacity: 1
                      }
                    }
                  ]
                }
              ]}
            />
          </div>
        </div>

        {/* Comparativa vs Equipo (Radar) */}
        {comparativa && (
          <div className="chart-card">
            <div className="chart-header">
              <h3>Comparativa vs Promedio del Equipo</h3>
            </div>
            <div className="chart-container">
              <ResponsiveRadar
                data={radarData}
                keys={['Representante', 'Promedio Equipo']}
                indexBy="metrica"
                maxValue={150}
                margin={{ top: 70, right: 80, bottom: 40, left: 80 }}
                borderColor={{ from: 'color' }}
                gridLabelOffset={36}
                dotSize={8}
                dotColor={{ theme: 'background' }}
                dotBorderWidth={2}
                colors={{ scheme: 'set2' }}
                blendMode="multiply"
                motionConfig="wobbly"
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
                          itemTextColor: '#000'
                        }
                      }
                    ]
                  }
                ]}
              />
            </div>
          </div>
        )}

        {/* Ranking de Representantes */}
        <div className="chart-card chart-card-large">
          <div className="chart-header">
            <h3>
              Ranking de Representantes
              <select
                value={metricaRanking}
                onChange={(e) => setMetricaRanking(e.target.value)}
                style={{ marginLeft: '16px', padding: '4px 8px', fontSize: '14px' }}
              >
                <option value="visitas">Por Visitas</option>
                <option value="cobertura">Por Cobertura</option>
                <option value="tasaexito">Por Tasa de Éxito</option>
                <option value="cumplimiento">Por Cumplimiento</option>
                <option value="promediodiario">Por Promedio Diario</option>
              </select>
            </h3>
          </div>
          <div className="chart-container">
            <ResponsiveBar
              data={rankingChartData}
              keys={['valor']}
              indexBy="representante"
              margin={{ top: 20, right: 130, bottom: 60, left: 80 }}
              padding={0.3}
              layout="horizontal"
              valueScale={{ type: 'linear' }}
              indexScale={{ type: 'band', round: true }}
              colors={{ scheme: 'blues' }}
              borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
              axisTop={null}
              axisRight={null}
              axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'Valor de la Métrica',
                legendPosition: 'middle',
                legendOffset: 40
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'Representante',
                legendPosition: 'middle',
                legendOffset: -70
              }}
              labelSkipWidth={12}
              labelSkipHeight={12}
              labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
              legends={[
                {
                  dataFrom: 'keys',
                  anchor: 'bottom-right',
                  direction: 'column',
                  justify: false,
                  translateX: 120,
                  translateY: 0,
                  itemsSpacing: 2,
                  itemWidth: 100,
                  itemHeight: 20,
                  itemDirection: 'left-to-right',
                  itemOpacity: 0.85,
                  symbolSize: 20,
                  effects: [
                    {
                      on: 'hover',
                      style: {
                        itemOpacity: 1
                      }
                    }
                  ]
                }
              ]}
              tooltip={({ indexValue, value, data }) => (
                <div
                  style={{
                    padding: 12,
                    background: 'white',
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                  }}
                >
                  <strong>{indexValue}</strong>
                  <br />
                  Valor: {value}
                  <br />
                  Prom. Diario: {data.promedioDiario}
                </div>
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesempenoRepresentantesPage;
