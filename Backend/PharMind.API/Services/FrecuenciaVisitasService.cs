using PharMind.API.Data;
using PharMind.API.Models;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace PharMind.API.Services;

public interface IFrecuenciaVisitasService
{
    Task<FrecuenciaIndicador?> CalcularFrecuenciaAsync(string relacionId);
}

public class FrecuenciaVisitasService : IFrecuenciaVisitasService
{
    private readonly PharMindDbContext _context;
    private readonly ILogger<FrecuenciaVisitasService> _logger;

    public FrecuenciaVisitasService(PharMindDbContext context, ILogger<FrecuenciaVisitasService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<FrecuenciaIndicador?> CalcularFrecuenciaAsync(string relacionId)
    {
        try
        {
            _logger.LogInformation("Iniciando cálculo de frecuencia para relación: {RelacionId}", relacionId);

            // 1. Cargar la relación con sus interacciones
            var relacion = await _context.Relaciones
                .Include(r => r.Interacciones)
                    .ThenInclude(i => i.TipoInteraccionEsquema)
                .FirstOrDefaultAsync(r => r.Id == relacionId && r.Status == false);

            if (relacion == null)
            {
                _logger.LogWarning("Relación no encontrada o inactiva: {RelacionId}", relacionId);
                return null;
            }

            _logger.LogInformation("Relación encontrada: {RelacionId}, FrecuenciaVisitas: '{FrecuenciaVisitas}', Interacciones: {Count}",
                relacionId, relacion.FrecuenciaVisitas, relacion.Interacciones?.Count ?? 0);

            // 2. Parsear FrecuenciaVisitas a int (objetivo)
            if (string.IsNullOrEmpty(relacion.FrecuenciaVisitas) ||
                !int.TryParse(relacion.FrecuenciaVisitas, out int frecuenciaObjetivo))
            {
                // Si no tiene frecuencia definida, no calculamos
                _logger.LogWarning("FrecuenciaVisitas vacío o no es número para relación: {RelacionId}, valor: '{FrecuenciaVisitas}'",
                    relacionId, relacion.FrecuenciaVisitas);
                return null;
            }

            _logger.LogInformation("Frecuencia objetivo parseada: {Objetivo}", frecuenciaObjetivo);

            // 3. Obtener todos los tipos de interacción que miden frecuencia
            var tiposConFrecuencia = await _context.EsquemasPersonalizados
                .Where(t => t.EntidadTipo == "Interaccion" && t.Activo && t.Status == false)
                .ToListAsync();

            // Filtrar los que tienen medirFrecuencia = true en ConfiguracionUi
            var tiposQueMidenFrecuencia = tiposConFrecuencia
                .Where(t => TieneMedicionFrecuencia(t))
                .ToList();

            _logger.LogInformation("Tipos de interacción que miden frecuencia: {Count} de {Total}",
                tiposQueMidenFrecuencia.Count, tiposConFrecuencia.Count);

            if (!tiposQueMidenFrecuencia.Any())
            {
                // No hay tipos que midan frecuencia
                _logger.LogWarning("No hay tipos de interacción con medirFrecuencia=true configurado");
                return null;
            }

            // 4. Agrupar por tipo de período
            var gruposPorPeriodo = tiposQueMidenFrecuencia
                .GroupBy(t => ObtenerPeriodoEvaluacion(t))
                .ToList();

            // Por ahora, tomamos el primer grupo (el período más común)
            // TODO: Si necesitas manejar múltiples períodos, ajusta esta lógica
            var grupoPrincipal = gruposPorPeriodo.FirstOrDefault();
            if (grupoPrincipal == null || string.IsNullOrEmpty(grupoPrincipal.Key))
            {
                return null;
            }

            string periodoMedicion = grupoPrincipal.Key;
            var tiposIds = grupoPrincipal.Select(t => t.Id).ToList();

            // 5. Determinar rango de fechas según período actual
            var (fechaInicio, fechaFin) = await ObtenerRangoPeriodoActualAsync(periodoMedicion);

            _logger.LogInformation(
                "Calculando frecuencia para relación {RelacionId}, período {Periodo}, rango {Inicio} - {Fin}",
                relacionId, periodoMedicion, fechaInicio, fechaFin);

            // 6. Contar interacciones en el período
            var interaccionesRealizadas = relacion.Interacciones
                .Count(i =>
                    tiposIds.Contains(i.TipoInteraccionId) &&
                    i.Fecha >= fechaInicio &&
                    i.Fecha <= fechaFin &&
                    i.Status == false
                );

            // 7. Determinar estado del semáforo
            string estado = DeterminarEstado(interaccionesRealizadas, frecuenciaObjetivo);

            return new FrecuenciaIndicador
            {
                InteraccionesRealizadas = interaccionesRealizadas,
                FrecuenciaObjetivo = frecuenciaObjetivo,
                PeriodoMedicion = periodoMedicion,
                FechaInicioPeriodo = fechaInicio,
                FechaFinPeriodo = fechaFin,
                Estado = estado,
                VisitasPendientes = Math.Max(0, frecuenciaObjetivo - interaccionesRealizadas)
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al calcular frecuencia para relación {RelacionId}", relacionId);
            return null;
        }
    }

    private bool TieneMedicionFrecuencia(EsquemasPersonalizado tipo)
    {
        if (string.IsNullOrEmpty(tipo.ConfiguracionUi))
            return false;

        try
        {
            var config = JsonDocument.Parse(tipo.ConfiguracionUi);

            if (config.RootElement.TryGetProperty("frecuencia", out var frecuencia))
            {
                if (frecuencia.TryGetProperty("medirFrecuencia", out var medirFrecuencia))
                {
                    return medirFrecuencia.GetBoolean();
                }
            }

            return false;
        }
        catch
        {
            return false;
        }
    }

    private string ObtenerPeriodoEvaluacion(EsquemasPersonalizado tipo)
    {
        if (string.IsNullOrEmpty(tipo.ConfiguracionUi))
            return "mensual"; // default

        try
        {
            var config = JsonDocument.Parse(tipo.ConfiguracionUi);

            if (config.RootElement.TryGetProperty("frecuencia", out var frecuencia))
            {
                if (frecuencia.TryGetProperty("periodoEvaluacion", out var periodo))
                {
                    return periodo.GetString() ?? "mensual";
                }
            }

            return "mensual";
        }
        catch
        {
            return "mensual";
        }
    }

    private async Task<(DateTime inicio, DateTime fin)> ObtenerRangoPeriodoActualAsync(string tipoPeriodo)
    {
        var hoy = DateTime.Now;

        // Intentar obtener el período actual desde la tabla Periods
        var periodoActual = await _context.Periods
            .Where(p => p.Activo &&
                       p.FechaInicio <= hoy &&
                       p.FechaFin >= hoy &&
                       (p.Status == null || p.Status == false || p.Status == true)) // Incluir todos los status
            .OrderBy(p => p.FechaInicio)
            .FirstOrDefaultAsync();

        if (periodoActual != null)
        {
            _logger.LogInformation("Usando período de tabla: {Nombre} ({Inicio} - {Fin})",
                periodoActual.Nombre, periodoActual.FechaInicio, periodoActual.FechaFin);
            return (periodoActual.FechaInicio, periodoActual.FechaFin);
        }

        // Si no hay período en la tabla, calcular por tipo
        _logger.LogWarning("No se encontró período activo en tabla Periods, calculando por tipo: {Tipo}", tipoPeriodo);

        return tipoPeriodo.ToLower() switch
        {
            "semanal" => (StartOfWeek(hoy), EndOfWeek(hoy)),
            "mensual" => (new DateTime(hoy.Year, hoy.Month, 1),
                         new DateTime(hoy.Year, hoy.Month, 1).AddMonths(1).AddDays(-1)),
            "trimestral" => (StartOfQuarter(hoy), EndOfQuarter(hoy)),
            "anual" => (new DateTime(hoy.Year, 1, 1), new DateTime(hoy.Year, 12, 31)),
            "ciclo" => (StartOfCycle(hoy), EndOfCycle(hoy)),
            _ => (new DateTime(hoy.Year, hoy.Month, 1),
                 new DateTime(hoy.Year, hoy.Month, 1).AddMonths(1).AddDays(-1))
        };
    }

    private string DeterminarEstado(int realizadas, int objetivo)
    {
        if (realizadas == 0)
            return "gris";

        if (realizadas < objetivo)
            return "amarillo";

        if (realizadas == objetivo)
            return "verde";

        return "azul"; // realizadas > objetivo
    }

    // Helpers para cálculo de fechas
    private DateTime StartOfWeek(DateTime dt)
    {
        int diff = (7 + (dt.DayOfWeek - DayOfWeek.Monday)) % 7;
        return dt.AddDays(-1 * diff).Date;
    }

    private DateTime EndOfWeek(DateTime dt)
    {
        return StartOfWeek(dt).AddDays(6);
    }

    private DateTime StartOfQuarter(DateTime dt)
    {
        int quarterStartMonth = ((dt.Month - 1) / 3) * 3 + 1;
        return new DateTime(dt.Year, quarterStartMonth, 1);
    }

    private DateTime EndOfQuarter(DateTime dt)
    {
        return StartOfQuarter(dt).AddMonths(3).AddDays(-1);
    }

    private DateTime StartOfCycle(DateTime dt)
    {
        // Para ciclos personalizados, usar tabla Periods
        // Por defecto, usamos bimestral (2 meses)
        int cycleStartMonth = ((dt.Month - 1) / 2) * 2 + 1;
        return new DateTime(dt.Year, cycleStartMonth, 1);
    }

    private DateTime EndOfCycle(DateTime dt)
    {
        return StartOfCycle(dt).AddMonths(2).AddDays(-1);
    }
}

public class FrecuenciaIndicador
{
    public int InteraccionesRealizadas { get; set; }
    public int FrecuenciaObjetivo { get; set; }
    public string PeriodoMedicion { get; set; } = string.Empty;
    public DateTime FechaInicioPeriodo { get; set; }
    public DateTime FechaFinPeriodo { get; set; }
    public string Estado { get; set; } = "gris"; // gris, amarillo, verde, azul
    public int VisitasPendientes { get; set; }
}
