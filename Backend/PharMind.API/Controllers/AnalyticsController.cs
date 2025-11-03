using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PharMind.API.Data;
using PharMind.API.Models.Analytics;

namespace PharMind.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AnalyticsController : ControllerBase
{
    private readonly PharMindDbContext _context;
    private readonly ILogger<AnalyticsController> _logger;

    public AnalyticsController(
        PharMindDbContext context,
        ILogger<AnalyticsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Obtiene los KPIs principales del dashboard de actividad de visitas
    /// </summary>
    [HttpGet("visitas/kpis")]
    public async Task<ActionResult<object>> GetVisitasKPIs(
        [FromQuery] DateTime? fechaInicio = null,
        [FromQuery] DateTime? fechaFin = null,
        [FromQuery] int? representanteId = null)
    {
        try
        {
            // Establecer rango de fechas por defecto (últimos 6 meses)
            var inicio = fechaInicio ?? DateTime.Now.AddMonths(-6);
            var fin = fechaFin ?? DateTime.Now;

            var query = _context.AnalyticsVisitas
                .Where(v => v.FechaVisita >= inicio && v.FechaVisita <= fin);

            if (representanteId.HasValue)
            {
                query = query.Where(v => v.RepresentanteId == representanteId.Value);
            }

            // Total de visitas
            var totalVisitas = await query.CountAsync();

            // Médicos únicos visitados
            var medicosVisitados = await query
                .Select(v => v.MedicoId)
                .Distinct()
                .CountAsync();

            // Total de médicos activos
            var totalMedicos = await _context.AnalyticsMedicos
                .Where(m => m.Activo)
                .CountAsync();

            // Cobertura (porcentaje de médicos visitados)
            var cobertura = totalMedicos > 0 ? (decimal)medicosVisitados / totalMedicos * 100 : 0;

            // Nuevos médicos incorporados (médicos con primera visita en el período)
            var nuevosMedicos = await _context.AnalyticsVisitas
                .Where(v => v.FechaVisita >= inicio && v.FechaVisita <= fin)
                .GroupBy(v => v.MedicoId)
                .Select(g => new { MedicoId = g.Key, PrimeraVisita = g.Min(v => v.FechaVisita) })
                .Where(x => x.PrimeraVisita >= inicio)
                .CountAsync();

            // Duración promedio de visitas
            var duracionPromedio = await query
                .Where(v => v.DuracionMinutos > 0)
                .AverageAsync(v => (double?)v.DuracionMinutos) ?? 0;

            // Tasa de éxito
            var visitasExitosas = await query.CountAsync(v => v.Exitosa);
            var tasaExito = totalVisitas > 0 ? (decimal)visitasExitosas / totalVisitas * 100 : 0;

            return Ok(new
            {
                totalVisitas,
                medicosVisitados,
                totalMedicos,
                cobertura = Math.Round(cobertura, 2),
                nuevosMedicos,
                duracionPromedio = Math.Round(duracionPromedio, 0),
                tasaExito = Math.Round(tasaExito, 2)
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener KPIs de visitas");
            return StatusCode(500, "Error interno del servidor");
        }
    }

    /// <summary>
    /// Obtiene la tendencia de visitas por período (diario, semanal, mensual)
    /// </summary>
    [HttpGet("visitas/tendencia")]
    public async Task<ActionResult<object>> GetVisitasTendencia(
        [FromQuery] DateTime? fechaInicio = null,
        [FromQuery] DateTime? fechaFin = null,
        [FromQuery] string periodo = "mensual", // diario, semanal, mensual
        [FromQuery] int? representanteId = null)
    {
        try
        {
            var inicio = fechaInicio ?? DateTime.Now.AddMonths(-6);
            var fin = fechaFin ?? DateTime.Now;

            var query = _context.AnalyticsVisitas
                .Where(v => v.FechaVisita >= inicio && v.FechaVisita <= fin);

            if (representanteId.HasValue)
            {
                query = query.Where(v => v.RepresentanteId == representanteId.Value);
            }

            var visitas = await query.ToListAsync();

            var tendencia = periodo.ToLower() switch
            {
                "diario" => visitas.GroupBy(v => v.FechaVisita.Date)
                    .Select(g => new { fecha = g.Key.ToString("yyyy-MM-dd"), cantidad = g.Count() })
                    .OrderBy(x => x.fecha)
                    .ToList(),
                "semanal" => visitas.GroupBy(v => new
                {
                    Año = v.FechaVisita.Year,
                    Semana = System.Globalization.CultureInfo.CurrentCulture.Calendar.GetWeekOfYear(
                        v.FechaVisita,
                        System.Globalization.CalendarWeekRule.FirstFourDayWeek,
                        DayOfWeek.Monday)
                })
                .Select(g => new { fecha = $"{g.Key.Año}-W{g.Key.Semana:D2}", cantidad = g.Count() })
                .OrderBy(x => x.fecha)
                .ToList(),
                _ => visitas.GroupBy(v => new { v.FechaVisita.Year, v.FechaVisita.Month })
                    .Select(g => new { fecha = $"{g.Key.Year}-{g.Key.Month:D2}", cantidad = g.Count() })
                    .OrderBy(x => x.fecha)
                    .ToList()
            };

            return Ok(tendencia);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener tendencia de visitas");
            return StatusCode(500, "Error interno del servidor");
        }
    }

    /// <summary>
    /// Obtiene la distribución de visitas por tipo
    /// </summary>
    [HttpGet("visitas/por-tipo")]
    public async Task<ActionResult<object>> GetVisitasPorTipo(
        [FromQuery] DateTime? fechaInicio = null,
        [FromQuery] DateTime? fechaFin = null,
        [FromQuery] int? representanteId = null)
    {
        try
        {
            var inicio = fechaInicio ?? DateTime.Now.AddMonths(-6);
            var fin = fechaFin ?? DateTime.Now;

            var query = _context.AnalyticsVisitas
                .Where(v => v.FechaVisita >= inicio && v.FechaVisita <= fin);

            if (representanteId.HasValue)
            {
                query = query.Where(v => v.RepresentanteId == representanteId.Value);
            }

            var distribucion = await query
                .GroupBy(v => v.TipoVisita)
                .Select(g => new
                {
                    tipo = g.Key,
                    cantidad = g.Count(),
                    porcentaje = 0m
                })
                .ToListAsync();

            var total = distribucion.Sum(d => d.cantidad);
            if (total > 0)
            {
                distribucion = distribucion.Select(d => new
                {
                    d.tipo,
                    d.cantidad,
                    porcentaje = Math.Round((decimal)d.cantidad / total * 100, 2)
                }).ToList();
            }

            return Ok(distribucion);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener visitas por tipo");
            return StatusCode(500, "Error interno del servidor");
        }
    }

    /// <summary>
    /// Obtiene la distribución de visitas por segmento de médico
    /// </summary>
    [HttpGet("visitas/por-segmento")]
    public async Task<ActionResult<object>> GetVisitasPorSegmento(
        [FromQuery] DateTime? fechaInicio = null,
        [FromQuery] DateTime? fechaFin = null,
        [FromQuery] int? representanteId = null)
    {
        try
        {
            var inicio = fechaInicio ?? DateTime.Now.AddMonths(-6);
            var fin = fechaFin ?? DateTime.Now;

            var query = _context.AnalyticsVisitas
                .Include(v => v.Medico)
                .Where(v => v.FechaVisita >= inicio && v.FechaVisita <= fin);

            if (representanteId.HasValue)
            {
                query = query.Where(v => v.RepresentanteId == representanteId.Value);
            }

            var distribucion = await query
                .GroupBy(v => v.Medico.Segmento)
                .Select(g => new
                {
                    segmento = g.Key,
                    cantidad = g.Count(),
                    porcentaje = 0m
                })
                .ToListAsync();

            var total = distribucion.Sum(d => d.cantidad);
            if (total > 0)
            {
                distribucion = distribucion.Select(d => new
                {
                    d.segmento,
                    d.cantidad,
                    porcentaje = Math.Round((decimal)d.cantidad / total * 100, 2)
                }).ToList();
            }

            return Ok(distribucion);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener visitas por segmento");
            return StatusCode(500, "Error interno del servidor");
        }
    }

    /// <summary>
    /// Obtiene el desempeño de los representantes
    /// </summary>
    [HttpGet("representantes/desempeno")]
    public async Task<ActionResult<object>> GetRepresentantesDesempeno(
        [FromQuery] DateTime? fechaInicio = null,
        [FromQuery] DateTime? fechaFin = null,
        [FromQuery] string? region = null)
    {
        try
        {
            var inicio = fechaInicio ?? DateTime.Now.AddMonths(-6);
            var fin = fechaFin ?? DateTime.Now;

            var query = _context.AnalyticsRepresentantes
                .Include(r => r.Visitas)
                .Include(r => r.Objetivos)
                .Where(r => r.Activo);

            if (!string.IsNullOrWhiteSpace(region))
            {
                query = query.Where(r => r.Region == region);
            }

            var representantes = await query.ToListAsync();

            var desempeno = representantes.Select(r =>
            {
                var visitasRep = r.Visitas.Where(v => v.FechaVisita >= inicio && v.FechaVisita <= fin).ToList();
                var objetivosRep = r.Objetivos.ToList();

                var totalVisitas = visitasRep.Count;
                var medicosUnicos = visitasRep.Select(v => v.MedicoId).Distinct().Count();
                var visitasExitosas = visitasRep.Count(v => v.Exitosa);
                var tasaExito = totalVisitas > 0 ? (decimal)visitasExitosas / totalVisitas * 100 : 0;

                // Cumplimiento de objetivos
                var cumplimientoObjetivos = objetivosRep.Any()
                    ? objetivosRep.Average(o => o.Porcentaje)
                    : 0;

                return new
                {
                    representanteId = r.Id,
                    nombre = r.Nombre,
                    distrito = r.Distrito,
                    region = r.Region,
                    totalVisitas,
                    medicosUnicos,
                    tasaExito = Math.Round(tasaExito, 2),
                    cumplimientoObjetivos = Math.Round(cumplimientoObjetivos, 2)
                };
            }).ToList();

            return Ok(desempeno);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener desempeño de representantes");
            return StatusCode(500, "Error interno del servidor");
        }
    }

    /// <summary>
    /// Obtiene los objetivos y su progreso
    /// </summary>
    [HttpGet("objetivos")]
    public async Task<ActionResult<object>> GetObjetivos(
        [FromQuery] int? representanteId = null,
        [FromQuery] string? periodo = null)
    {
        try
        {
            var query = _context.AnalyticsObjetivos
                .Include(o => o.Representante)
                .AsQueryable();

            if (representanteId.HasValue)
            {
                query = query.Where(o => o.RepresentanteId == representanteId.Value);
            }

            if (!string.IsNullOrWhiteSpace(periodo))
            {
                query = query.Where(o => o.Periodo == periodo);
            }

            var objetivos = await query
                .Select(o => new
                {
                    o.Id,
                    representanteId = o.RepresentanteId,
                    representanteNombre = o.Representante.Nombre,
                    o.Periodo,
                    tipo = o.TipoObjetivo,
                    meta = o.Meta,
                    alcanzado = o.Alcanzado,
                    porcentaje = o.Porcentaje
                })
                .ToListAsync();

            return Ok(objetivos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener objetivos");
            return StatusCode(500, "Error interno del servidor");
        }
    }

    /// <summary>
    /// Obtiene lista de regiones disponibles
    /// </summary>
    [HttpGet("regiones")]
    public async Task<ActionResult<object>> GetRegiones()
    {
        try
        {
            var regiones = await _context.AnalyticsRepresentantes
                .Where(r => r.Activo)
                .Select(r => r.Region)
                .Distinct()
                .OrderBy(r => r)
                .ToListAsync();

            return Ok(regiones);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener regiones");
            return StatusCode(500, "Error interno del servidor");
        }
    }

    /// <summary>
    /// Obtiene lista de representantes
    /// </summary>
    [HttpGet("representantes")]
    public async Task<ActionResult<object>> GetRepresentantes([FromQuery] string? region = null)
    {
        try
        {
            var query = _context.AnalyticsRepresentantes
                .Where(r => r.Activo);

            if (!string.IsNullOrWhiteSpace(region))
            {
                query = query.Where(r => r.Region == region);
            }

            var representantes = await query
                .Select(r => new
                {
                    r.Id,
                    r.Nombre,
                    r.Email,
                    r.Distrito,
                    r.Region
                })
                .OrderBy(r => r.Nombre)
                .ToListAsync();

            return Ok(representantes);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener representantes");
            return StatusCode(500, "Error interno del servidor");
        }
    }

    /// <summary>
    /// Obtiene distribución de médicos por especialidad
    /// </summary>
    [HttpGet("medicos/por-especialidad")]
    public async Task<ActionResult<object>> GetMedicosPorEspecialidad()
    {
        try
        {
            var distribucion = await _context.AnalyticsMedicos
                .Where(m => m.Activo)
                .GroupBy(m => m.Especialidad)
                .Select(g => new
                {
                    especialidad = g.Key,
                    cantidad = g.Count()
                })
                .OrderByDescending(x => x.cantidad)
                .ToListAsync();

            return Ok(distribucion);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener médicos por especialidad");
            return StatusCode(500, "Error interno del servidor");
        }
    }

    /// <summary>
    /// Obtiene frecuencia de visitas (visitas por médico)
    /// </summary>
    [HttpGet("visitas/frecuencia")]
    public async Task<ActionResult<object>> GetFrecuenciaVisitas(
        [FromQuery] DateTime? fechaInicio = null,
        [FromQuery] DateTime? fechaFin = null)
    {
        try
        {
            var inicio = fechaInicio ?? DateTime.Now.AddMonths(-6);
            var fin = fechaFin ?? DateTime.Now;

            var frecuencia = await _context.AnalyticsVisitas
                .Where(v => v.FechaVisita >= inicio && v.FechaVisita <= fin)
                .GroupBy(v => v.MedicoId)
                .Select(g => new
                {
                    medicoId = g.Key,
                    cantidadVisitas = g.Count()
                })
                .ToListAsync();

            // Agrupar por rangos de frecuencia
            var rangos = new[]
            {
                new { rango = "1 visita", min = 1, max = 1 },
                new { rango = "2-3 visitas", min = 2, max = 3 },
                new { rango = "4-6 visitas", min = 4, max = 6 },
                new { rango = "7+ visitas", min = 7, max = int.MaxValue }
            };

            var distribucionFrecuencia = rangos.Select(r => new
            {
                rango = r.rango,
                cantidad = frecuencia.Count(f => f.cantidadVisitas >= r.min && f.cantidadVisitas <= r.max)
            }).ToList();

            return Ok(distribucionFrecuencia);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener frecuencia de visitas");
            return StatusCode(500, "Error interno del servidor");
        }
    }

    /// <summary>
    /// Obtiene la distribución de visitas por categoría de médico
    /// </summary>
    [HttpGet("visitas/por-categoria")]
    public async Task<ActionResult<object>> GetVisitasPorCategoria(
        [FromQuery] DateTime? fechaInicio = null,
        [FromQuery] DateTime? fechaFin = null,
        [FromQuery] int? representanteId = null)
    {
        try
        {
            var inicio = fechaInicio ?? DateTime.Now.AddMonths(-6);
            var fin = fechaFin ?? DateTime.Now;

            var query = _context.AnalyticsVisitas
                .Include(v => v.Medico)
                .Where(v => v.FechaVisita >= inicio && v.FechaVisita <= fin);

            if (representanteId.HasValue)
            {
                query = query.Where(v => v.RepresentanteId == representanteId.Value);
            }

            var distribucion = await query
                .GroupBy(v => v.Medico.Categoria)
                .Select(g => new
                {
                    categoria = g.Key ?? "Sin categoría",
                    cantidad = g.Count()
                })
                .ToListAsync();

            return Ok(distribucion);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener visitas por categoría");
            return StatusCode(500, "Error interno del servidor");
        }
    }

    /// <summary>
    /// Obtiene la distribución de visitas por turno (Mañana/Tarde)
    /// </summary>
    [HttpGet("visitas/por-turno")]
    public async Task<ActionResult<object>> GetVisitasPorTurno(
        [FromQuery] DateTime? fechaInicio = null,
        [FromQuery] DateTime? fechaFin = null,
        [FromQuery] int? representanteId = null)
    {
        try
        {
            var inicio = fechaInicio ?? DateTime.Now.AddMonths(-6);
            var fin = fechaFin ?? DateTime.Now;

            var query = _context.AnalyticsVisitas
                .Where(v => v.FechaVisita >= inicio && v.FechaVisita <= fin);

            if (representanteId.HasValue)
            {
                query = query.Where(v => v.RepresentanteId == representanteId.Value);
            }

            var distribucion = await query
                .GroupBy(v => v.Turno)
                .Select(g => new
                {
                    turno = g.Key ?? "Sin especificar",
                    cantidad = g.Count()
                })
                .ToListAsync();

            return Ok(distribucion);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener visitas por turno");
            return StatusCode(500, "Error interno del servidor");
        }
    }

    /// <summary>
    /// Obtiene la distribución de visitas por tipo de institución
    /// </summary>
    [HttpGet("visitas/por-tipo-institucion")]
    public async Task<ActionResult<object>> GetVisitasPorTipoInstitucion(
        [FromQuery] DateTime? fechaInicio = null,
        [FromQuery] DateTime? fechaFin = null,
        [FromQuery] int? representanteId = null)
    {
        try
        {
            var inicio = fechaInicio ?? DateTime.Now.AddMonths(-6);
            var fin = fechaFin ?? DateTime.Now;

            var query = _context.AnalyticsVisitas
                .Include(v => v.Medico)
                .Where(v => v.FechaVisita >= inicio && v.FechaVisita <= fin);

            if (representanteId.HasValue)
            {
                query = query.Where(v => v.RepresentanteId == representanteId.Value);
            }

            var distribucion = await query
                .GroupBy(v => v.Medico.TipoInstitucion)
                .Select(g => new
                {
                    tipoInstitucion = g.Key ?? "Sin especificar",
                    cantidad = g.Count()
                })
                .ToListAsync();

            return Ok(distribucion);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener visitas por tipo de institución");
            return StatusCode(500, "Error interno del servidor");
        }
    }

    /// <summary>
    /// Obtiene la distribución de visitas por sector (Público/Privado)
    /// </summary>
    [HttpGet("visitas/por-sector")]
    public async Task<ActionResult<object>> GetVisitasPorSector(
        [FromQuery] DateTime? fechaInicio = null,
        [FromQuery] DateTime? fechaFin = null,
        [FromQuery] int? representanteId = null)
    {
        try
        {
            var inicio = fechaInicio ?? DateTime.Now.AddMonths(-6);
            var fin = fechaFin ?? DateTime.Now;

            var query = _context.AnalyticsVisitas
                .Include(v => v.Medico)
                .Where(v => v.FechaVisita >= inicio && v.FechaVisita <= fin);

            if (representanteId.HasValue)
            {
                query = query.Where(v => v.RepresentanteId == representanteId.Value);
            }

            var distribucion = await query
                .GroupBy(v => v.Medico.Sector)
                .Select(g => new
                {
                    sector = g.Key ?? "Sin especificar",
                    cantidad = g.Count()
                })
                .ToListAsync();

            return Ok(distribucion);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener visitas por sector");
            return StatusCode(500, "Error interno del servidor");
        }
    }

    /// <summary>
    /// Obtiene la distribución de visitas por zona
    /// </summary>
    [HttpGet("visitas/por-zona")]
    public async Task<ActionResult<object>> GetVisitasPorZona(
        [FromQuery] DateTime? fechaInicio = null,
        [FromQuery] DateTime? fechaFin = null,
        [FromQuery] int? representanteId = null)
    {
        try
        {
            var inicio = fechaInicio ?? DateTime.Now.AddMonths(-6);
            var fin = fechaFin ?? DateTime.Now;

            var query = _context.AnalyticsVisitas
                .Include(v => v.Representante)
                .Where(v => v.FechaVisita >= inicio && v.FechaVisita <= fin);

            if (representanteId.HasValue)
            {
                query = query.Where(v => v.RepresentanteId == representanteId.Value);
            }

            var distribucion = await query
                .GroupBy(v => v.Representante.Zona)
                .Select(g => new
                {
                    zona = g.Key ?? "Sin especificar",
                    cantidad = g.Count()
                })
                .ToListAsync();

            return Ok(distribucion);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener visitas por zona");
            return StatusCode(500, "Error interno del servidor");
        }
    }

    // ============================================================================
    // ENDPOINTS PARA DASHBOARD DE DESEMPEÑO DE REPRESENTANTES
    // ============================================================================

    /// <summary>
    /// Obtiene KPIs principales de un representante específico
    /// </summary>
    [HttpGet("representantes/{id}/kpis")]
    public async Task<ActionResult<object>> GetRepresentanteKPIs(
        int id,
        [FromQuery] DateTime? fechaInicio = null,
        [FromQuery] DateTime? fechaFin = null)
    {
        try
        {
            var inicio = fechaInicio ?? DateTime.Now.AddMonths(-6);
            var fin = fechaFin ?? DateTime.Now;

            // Verificar que el representante existe
            var representante = await _context.AnalyticsRepresentantes
                .FirstOrDefaultAsync(r => r.Id == id);

            if (representante == null)
            {
                return NotFound($"Representante con ID {id} no encontrado");
            }

            var visitas = await _context.AnalyticsVisitas
                .Where(v => v.RepresentanteId == id && v.FechaVisita >= inicio && v.FechaVisita <= fin)
                .ToListAsync();

            var totalVisitas = visitas.Count;
            var medicosUnicos = visitas.Select(v => v.MedicoId).Distinct().Count();
            var visitasExitosas = visitas.Count(v => v.Exitosa);
            var tasaExito = totalVisitas > 0 ? (decimal)visitasExitosas / totalVisitas * 100 : 0;
            var duracionPromedio = visitas.Any() ? visitas.Average(v => v.DuracionMinutos) : 0;

            // Cumplimiento de objetivos
            var objetivos = await _context.AnalyticsObjetivos
                .Where(o => o.RepresentanteId == id)
                .ToListAsync();

            var cumplimientoPromedio = objetivos.Any() ? objetivos.Average(o => o.Porcentaje) : 0;

            // Calcular promedio diario de visitas
            var diasEnPeriodo = (fin - inicio).Days + 1;
            var promedioDiarioVisitas = diasEnPeriodo > 0 ? (decimal)totalVisitas / diasEnPeriodo : 0;

            return Ok(new
            {
                representanteId = id,
                representanteNombre = representante.Nombre,
                totalVisitas,
                medicosUnicos,
                tasaExito = Math.Round(tasaExito, 2),
                duracionPromedio = Math.Round(duracionPromedio, 0),
                cumplimientoObjetivos = Math.Round(cumplimientoPromedio, 2),
                promedioDiarioVisitas = Math.Round(promedioDiarioVisitas, 2),
                diasEnPeriodo
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error al obtener KPIs del representante {id}");
            return StatusCode(500, "Error interno del servidor");
        }
    }

    /// <summary>
    /// Obtiene ranking de representantes por métrica
    /// </summary>
    [HttpGet("representantes/ranking")]
    public async Task<ActionResult<object>> GetRepresentantesRanking(
        [FromQuery] DateTime? fechaInicio = null,
        [FromQuery] DateTime? fechaFin = null,
        [FromQuery] string metrica = "visitas", // visitas, cobertura, tasaExito, cumplimiento
        [FromQuery] int top = 10)
    {
        try
        {
            var inicio = fechaInicio ?? DateTime.Now.AddMonths(-6);
            var fin = fechaFin ?? DateTime.Now;

            var representantes = await _context.AnalyticsRepresentantes
                .Include(r => r.Visitas)
                .Include(r => r.Objetivos)
                .Where(r => r.Activo)
                .ToListAsync();

            var diasEnPeriodo = (fin - inicio).Days + 1;

            var ranking = representantes.Select(r =>
            {
                var visitasRep = r.Visitas.Where(v => v.FechaVisita >= inicio && v.FechaVisita <= fin).ToList();
                var totalVisitas = visitasRep.Count;
                var medicosUnicos = visitasRep.Select(v => v.MedicoId).Distinct().Count();
                var visitasExitosas = visitasRep.Count(v => v.Exitosa);
                var tasaExito = totalVisitas > 0 ? (decimal)visitasExitosas / totalVisitas * 100 : 0;
                var cumplimiento = r.Objetivos.Any() ? r.Objetivos.Average(o => o.Porcentaje) : 0;
                var promedioDiario = diasEnPeriodo > 0 ? (decimal)totalVisitas / diasEnPeriodo : 0;

                return new
                {
                    representanteId = r.Id,
                    nombre = r.Nombre,
                    distrito = r.Distrito,
                    region = r.Region,
                    totalVisitas,
                    medicosUnicos,
                    tasaExito = Math.Round(tasaExito, 2),
                    cumplimiento = Math.Round(cumplimiento, 2),
                    promedioDiarioVisitas = Math.Round(promedioDiario, 2),
                    valorMetrica = metrica.ToLower() switch
                    {
                        "cobertura" => (decimal)medicosUnicos,
                        "tasaexito" => tasaExito,
                        "cumplimiento" => cumplimiento,
                        "promediodiario" => promedioDiario,
                        _ => (decimal)totalVisitas
                    }
                };
            })
            .OrderByDescending(x => x.valorMetrica)
            .Take(top)
            .ToList();

            return Ok(ranking);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener ranking de representantes");
            return StatusCode(500, "Error interno del servidor");
        }
    }

    /// <summary>
    /// Obtiene evolución temporal de métricas de un representante
    /// </summary>
    [HttpGet("representantes/{id}/evolucion")]
    public async Task<ActionResult<object>> GetRepresentanteEvolucion(
        int id,
        [FromQuery] DateTime? fechaInicio = null,
        [FromQuery] DateTime? fechaFin = null,
        [FromQuery] string periodo = "mensual") // diario, semanal, mensual
    {
        try
        {
            var inicio = fechaInicio ?? DateTime.Now.AddMonths(-6);
            var fin = fechaFin ?? DateTime.Now;

            var visitas = await _context.AnalyticsVisitas
                .Where(v => v.RepresentanteId == id && v.FechaVisita >= inicio && v.FechaVisita <= fin)
                .ToListAsync();

            var evolucion = periodo.ToLower() switch
            {
                "diario" => visitas.GroupBy(v => v.FechaVisita.Date)
                    .Select(g => new
                    {
                        fecha = g.Key.ToString("yyyy-MM-dd"),
                        totalVisitas = g.Count(),
                        visitasExitosas = g.Count(v => v.Exitosa),
                        medicosUnicos = g.Select(v => v.MedicoId).Distinct().Count(),
                        duracionPromedio = g.Average(v => v.DuracionMinutos)
                    })
                    .OrderBy(x => x.fecha)
                    .ToList(),
                "semanal" => visitas.GroupBy(v => new
                {
                    Año = v.FechaVisita.Year,
                    Semana = System.Globalization.CultureInfo.CurrentCulture.Calendar.GetWeekOfYear(
                        v.FechaVisita,
                        System.Globalization.CalendarWeekRule.FirstFourDayWeek,
                        DayOfWeek.Monday)
                })
                .Select(g => new
                {
                    fecha = $"{g.Key.Año}-W{g.Key.Semana:D2}",
                    totalVisitas = g.Count(),
                    visitasExitosas = g.Count(v => v.Exitosa),
                    medicosUnicos = g.Select(v => v.MedicoId).Distinct().Count(),
                    duracionPromedio = g.Average(v => v.DuracionMinutos)
                })
                .OrderBy(x => x.fecha)
                .ToList(),
                _ => visitas.GroupBy(v => new { v.FechaVisita.Year, v.FechaVisita.Month })
                    .Select(g => new
                    {
                        fecha = $"{g.Key.Year}-{g.Key.Month:D2}",
                        totalVisitas = g.Count(),
                        visitasExitosas = g.Count(v => v.Exitosa),
                        medicosUnicos = g.Select(v => v.MedicoId).Distinct().Count(),
                        duracionPromedio = g.Average(v => v.DuracionMinutos)
                    })
                    .OrderBy(x => x.fecha)
                    .ToList()
            };

            return Ok(evolucion);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error al obtener evolución del representante {id}");
            return StatusCode(500, "Error interno del servidor");
        }
    }

    /// <summary>
    /// Obtiene comparativa de un representante vs promedio del equipo
    /// </summary>
    [HttpGet("representantes/{id}/comparativa")]
    public async Task<ActionResult<object>> GetRepresentanteComparativa(
        int id,
        [FromQuery] DateTime? fechaInicio = null,
        [FromQuery] DateTime? fechaFin = null)
    {
        try
        {
            var inicio = fechaInicio ?? DateTime.Now.AddMonths(-6);
            var fin = fechaFin ?? DateTime.Now;

            // Obtener datos del representante
            var representante = await _context.AnalyticsRepresentantes
                .Include(r => r.Visitas)
                .Include(r => r.Objetivos)
                .FirstOrDefaultAsync(r => r.Id == id && r.Activo);

            if (representante == null)
            {
                return NotFound($"Representante con ID {id} no encontrado");
            }

            var visitasRep = representante.Visitas
                .Where(v => v.FechaVisita >= inicio && v.FechaVisita <= fin)
                .ToList();

            var repVisitas = visitasRep.Count;
            var repMedicos = visitasRep.Select(v => v.MedicoId).Distinct().Count();
            var repExitosas = visitasRep.Count(v => v.Exitosa);
            var repTasaExito = repVisitas > 0 ? (decimal)repExitosas / repVisitas * 100 : 0;
            var repDuracion = visitasRep.Any() ? visitasRep.Average(v => v.DuracionMinutos) : 0;
            var repCumplimiento = representante.Objetivos.Any() ? representante.Objetivos.Average(o => o.Porcentaje) : 0;
            var diasEnPeriodo = (fin - inicio).Days + 1;
            var repPromedioDiario = diasEnPeriodo > 0 ? (decimal)repVisitas / diasEnPeriodo : 0;

            // Calcular promedios del equipo (mismo región)
            var equipoRep = await _context.AnalyticsRepresentantes
                .Include(r => r.Visitas)
                .Include(r => r.Objetivos)
                .Where(r => r.Activo && r.Region == representante.Region)
                .ToListAsync();

            var equipoStats = equipoRep.Select(r =>
            {
                var visitasE = r.Visitas.Where(v => v.FechaVisita >= inicio && v.FechaVisita <= fin).ToList();
                var visitasCount = visitasE.Count;
                var promDiario = diasEnPeriodo > 0 ? (decimal)visitasCount / diasEnPeriodo : 0;
                return new
                {
                    visitas = visitasCount,
                    medicos = visitasE.Select(v => v.MedicoId).Distinct().Count(),
                    tasaExito = visitasE.Count > 0 ? (decimal)visitasE.Count(v => v.Exitosa) / visitasE.Count * 100 : 0,
                    duracion = visitasE.Any() ? visitasE.Average(v => v.DuracionMinutos) : 0,
                    cumplimiento = r.Objetivos.Any() ? r.Objetivos.Average(o => o.Porcentaje) : 0,
                    promedioDiario = promDiario
                };
            }).ToList();

            var promedioVisitas = equipoStats.Any() ? equipoStats.Average(e => e.visitas) : 0;
            var promedioMedicos = equipoStats.Any() ? equipoStats.Average(e => e.medicos) : 0;
            var promedioTasaExito = equipoStats.Any() ? equipoStats.Average(e => e.tasaExito) : 0;
            var promedioDuracion = equipoStats.Any() ? equipoStats.Average(e => e.duracion) : 0;
            var promedioCumplimiento = equipoStats.Any() ? equipoStats.Average(e => e.cumplimiento) : 0;
            var promedioPromedioDiario = equipoStats.Any() ? equipoStats.Average(e => e.promedioDiario) : 0;

            return Ok(new
            {
                representante = new
                {
                    id = representante.Id,
                    nombre = representante.Nombre,
                    region = representante.Region,
                    distrito = representante.Distrito,
                    visitas = repVisitas,
                    medicosUnicos = repMedicos,
                    tasaExito = Math.Round(repTasaExito, 2),
                    duracionPromedio = Math.Round(repDuracion, 0),
                    cumplimientoObjetivos = Math.Round(repCumplimiento, 2),
                    promedioDiarioVisitas = Math.Round(repPromedioDiario, 2)
                },
                promedioEquipo = new
                {
                    visitas = Math.Round(promedioVisitas, 0),
                    medicosUnicos = Math.Round(promedioMedicos, 0),
                    tasaExito = Math.Round(promedioTasaExito, 2),
                    duracionPromedio = Math.Round(promedioDuracion, 0),
                    cumplimientoObjetivos = Math.Round(promedioCumplimiento, 2),
                    promedioDiarioVisitas = Math.Round(promedioPromedioDiario, 2)
                },
                diferencia = new
                {
                    visitas = Math.Round(repVisitas - promedioVisitas, 0),
                    medicosUnicos = Math.Round(repMedicos - promedioMedicos, 0),
                    tasaExito = Math.Round(repTasaExito - promedioTasaExito, 2),
                    duracionPromedio = Math.Round(repDuracion - promedioDuracion, 0),
                    cumplimientoObjetivos = Math.Round(repCumplimiento - promedioCumplimiento, 2),
                    promedioDiarioVisitas = Math.Round(repPromedioDiario - promedioPromedioDiario, 2)
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error al obtener comparativa del representante {id}");
            return StatusCode(500, "Error interno del servidor");
        }
    }

    /// <summary>
    /// Obtiene estadísticas agregadas de todos los representantes
    /// </summary>
    [HttpGet("representantes/estadisticas-globales")]
    public async Task<ActionResult<object>> GetEstadisticasGlobalesRepresentantes(
        [FromQuery] DateTime? fechaInicio = null,
        [FromQuery] DateTime? fechaFin = null,
        [FromQuery] string? region = null)
    {
        try
        {
            var inicio = fechaInicio ?? DateTime.Now.AddMonths(-6);
            var fin = fechaFin ?? DateTime.Now;

            var query = _context.AnalyticsRepresentantes
                .Include(r => r.Visitas)
                .Include(r => r.Objetivos)
                .Where(r => r.Activo);

            if (!string.IsNullOrWhiteSpace(region))
            {
                query = query.Where(r => r.Region == region);
            }

            var representantes = await query.ToListAsync();

            var totalRepresentantes = representantes.Count;
            var totalVisitas = representantes.Sum(r => r.Visitas.Count(v => v.FechaVisita >= inicio && v.FechaVisita <= fin));
            var promedioVisitasPorRep = totalRepresentantes > 0 ? (decimal)totalVisitas / totalRepresentantes : 0;

            var todosLosMedicos = representantes
                .SelectMany(r => r.Visitas.Where(v => v.FechaVisita >= inicio && v.FechaVisita <= fin))
                .Select(v => v.MedicoId)
                .Distinct()
                .Count();

            var tasasExito = representantes.Select(r =>
            {
                var visitas = r.Visitas.Where(v => v.FechaVisita >= inicio && v.FechaVisita <= fin).ToList();
                return visitas.Count > 0 ? (decimal)visitas.Count(v => v.Exitosa) / visitas.Count * 100 : 0;
            }).ToList();

            var tasaExitoPromedio = tasasExito.Any() ? tasasExito.Average() : 0;

            var cumplimientos = representantes
                .Where(r => r.Objetivos.Any())
                .Select(r => r.Objetivos.Average(o => o.Porcentaje))
                .ToList();

            var cumplimientoPromedio = cumplimientos.Any() ? cumplimientos.Average() : 0;

            // Promedio diario de visitas general
            var diasEnPeriodo = (fin - inicio).Days + 1;
            var promedioDiarioGeneral = diasEnPeriodo > 0 ? (decimal)totalVisitas / diasEnPeriodo : 0;
            var promedioDiarioPorRep = totalRepresentantes > 0 && diasEnPeriodo > 0
                ? (decimal)totalVisitas / totalRepresentantes / diasEnPeriodo
                : 0;

            return Ok(new
            {
                totalRepresentantes,
                totalVisitas,
                promedioVisitasPorRepresentante = Math.Round(promedioVisitasPorRep, 2),
                promedioDiarioGeneralVisitas = Math.Round(promedioDiarioGeneral, 2),
                promedioDiarioPorRepresentante = Math.Round(promedioDiarioPorRep, 2),
                medicosUnicosVisitados = todosLosMedicos,
                tasaExitoPromedio = Math.Round(tasaExitoPromedio, 2),
                cumplimientoObjetivosPromedio = Math.Round(cumplimientoPromedio, 2),
                diasEnPeriodo
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener estadísticas globales de representantes");
            return StatusCode(500, "Error interno del servidor");
        }
    }
}
