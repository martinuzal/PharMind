using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PharMind.API.Data;
using PharMind.API.DTOs;
using PharMind.API.Models;

namespace PharMind.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TiempoUtilizadoController : ControllerBase
{
    private readonly PharMindDbContext _context;
    private readonly ILogger<TiempoUtilizadoController> _logger;

    public TiempoUtilizadoController(
        PharMindDbContext context,
        ILogger<TiempoUtilizadoController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Obtiene una lista paginada de tiempo utilizado con filtros opcionales
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<TiempoUtilizadoListResponse>> GetTiempoUtilizado(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? representanteId = null,
        [FromQuery] string? tipoActividad = null,
        [FromQuery] DateTime? fechaInicio = null,
        [FromQuery] DateTime? fechaFin = null)
    {
        try
        {
            var query = _context.TiempoUtilizado
                .Include(t => t.Representante)
                .Include(t => t.TipoActividad)
                .Where(t => t.Status == false); // Excluir eliminados

            // Aplicar filtros
            if (!string.IsNullOrWhiteSpace(representanteId))
            {
                query = query.Where(t => t.RepresentanteId == representanteId);
            }

            if (!string.IsNullOrWhiteSpace(tipoActividad))
            {
                query = query.Where(t => t.TipoActividadId == tipoActividad);
            }

            if (fechaInicio.HasValue)
            {
                query = query.Where(t => t.Fecha >= fechaInicio.Value);
            }

            if (fechaFin.HasValue)
            {
                query = query.Where(t => t.Fecha <= fechaFin.Value);
            }

            // Contar total de items
            var totalItems = await query.CountAsync();
            var totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);

            // Aplicar paginación
            var items = await query
                .OrderByDescending(t => t.Fecha)
                .ThenByDescending(t => t.FechaCreacion)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            // Mapear a DTOs
            var itemDtos = items.Select(t => new TiempoUtilizadoDto
            {
                Id = t.Id,
                RepresentanteId = t.RepresentanteId,
                RepresentanteNombre = t.Representante?.NombreCompleto ?? "N/A",
                Fecha = t.Fecha,
                TipoActividadId = t.TipoActividadId,
                TipoActividadNombre = t.TipoActividad?.Nombre ?? "N/A",
                Descripcion = t.Descripcion,
                HorasUtilizadas = t.HorasUtilizadas,
                MinutosUtilizados = t.MinutosUtilizados,
                Turno = t.Turno,
                TiempoTotalHoras = t.HorasUtilizadas + (t.MinutosUtilizados / 60m),
                EsRecurrente = t.EsRecurrente,
                Observaciones = t.Observaciones,
                FechaCreacion = t.FechaCreacion,
                CreadoPor = t.CreadoPor,
                FechaModificacion = t.FechaModificacion,
                ModificadoPor = t.ModificadoPor
            }).ToList();

            var response = new TiempoUtilizadoListResponse
            {
                Items = itemDtos,
                TotalItems = totalItems,
                TotalPages = totalPages,
                CurrentPage = page
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener lista de tiempo utilizado");
            return StatusCode(500, new { message = "Error al obtener la lista de tiempo utilizado" });
        }
    }

    /// <summary>
    /// Obtiene un registro de tiempo utilizado por ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<TiempoUtilizadoDto>> GetTiempoUtilizadoById(string id)
    {
        try
        {
            var tiempo = await _context.TiempoUtilizado
                .Include(t => t.Representante)
                .Include(t => t.TipoActividad)
                .FirstOrDefaultAsync(t => t.Id == id && t.Status == false);

            if (tiempo == null)
            {
                return NotFound(new { message = "Registro de tiempo no encontrado" });
            }

            var dto = new TiempoUtilizadoDto
            {
                Id = tiempo.Id,
                RepresentanteId = tiempo.RepresentanteId,
                RepresentanteNombre = tiempo.Representante?.NombreCompleto ?? "N/A",
                Fecha = tiempo.Fecha,
                TipoActividadId = tiempo.TipoActividadId,
                TipoActividadNombre = tiempo.TipoActividad?.Nombre ?? "N/A",
                Descripcion = tiempo.Descripcion,
                HorasUtilizadas = tiempo.HorasUtilizadas,
                MinutosUtilizados = tiempo.MinutosUtilizados,
                Turno = tiempo.Turno,
                TiempoTotalHoras = tiempo.HorasUtilizadas + (tiempo.MinutosUtilizados / 60m),
                EsRecurrente = tiempo.EsRecurrente,
                Observaciones = tiempo.Observaciones,
                FechaCreacion = tiempo.FechaCreacion,
                CreadoPor = tiempo.CreadoPor,
                FechaModificacion = tiempo.FechaModificacion,
                ModificadoPor = tiempo.ModificadoPor
            };

            return Ok(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener registro de tiempo con ID: {Id}", id);
            return StatusCode(500, new { message = "Error al obtener el registro de tiempo" });
        }
    }

    /// <summary>
    /// Crea un nuevo registro de tiempo utilizado
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<TiempoUtilizadoDto>> CreateTiempoUtilizado(CreateTiempoUtilizadoDto dto)
    {
        try
        {
            // Verificar que el representante existe
            var representante = await _context.Usuarios.FindAsync(dto.RepresentanteId);
            if (representante == null)
            {
                return BadRequest(new { message = "Representante no encontrado" });
            }

            var tiempo = new TiempoUtilizado
            {
                RepresentanteId = dto.RepresentanteId,
                Fecha = dto.Fecha,
                TipoActividadId = dto.TipoActividadId,
                Descripcion = dto.Descripcion,
                HorasUtilizadas = dto.HorasUtilizadas,
                MinutosUtilizados = dto.MinutosUtilizados,
                Turno = dto.Turno,
                EsRecurrente = dto.EsRecurrente,
                Observaciones = dto.Observaciones,
                Status = false,
                FechaCreacion = DateTime.Now,
                CreadoPor = "Sistema" // TODO: Obtener de claims del usuario autenticado
            };

            _context.TiempoUtilizado.Add(tiempo);
            await _context.SaveChangesAsync();

            // Recargar con datos relacionados
            await _context.Entry(tiempo).Reference(t => t.Representante).LoadAsync();
            await _context.Entry(tiempo).Reference(t => t.TipoActividad).LoadAsync();

            var result = new TiempoUtilizadoDto
            {
                Id = tiempo.Id,
                RepresentanteId = tiempo.RepresentanteId,
                RepresentanteNombre = tiempo.Representante?.NombreCompleto ?? "N/A",
                Fecha = tiempo.Fecha,
                TipoActividadId = tiempo.TipoActividadId,
                TipoActividadNombre = tiempo.TipoActividad?.Nombre ?? "N/A",
                Descripcion = tiempo.Descripcion,
                HorasUtilizadas = tiempo.HorasUtilizadas,
                MinutosUtilizados = tiempo.MinutosUtilizados,
                Turno = tiempo.Turno,
                TiempoTotalHoras = tiempo.HorasUtilizadas + (tiempo.MinutosUtilizados / 60m),
                EsRecurrente = tiempo.EsRecurrente,
                Observaciones = tiempo.Observaciones,
                FechaCreacion = tiempo.FechaCreacion,
                CreadoPor = tiempo.CreadoPor
            };

            return CreatedAtAction(nameof(GetTiempoUtilizadoById), new { id = tiempo.Id }, result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al crear registro de tiempo utilizado");
            return StatusCode(500, new { message = "Error al crear el registro de tiempo" });
        }
    }

    /// <summary>
    /// Actualiza un registro de tiempo utilizado existente
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<TiempoUtilizadoDto>> UpdateTiempoUtilizado(string id, UpdateTiempoUtilizadoDto dto)
    {
        try
        {
            var tiempo = await _context.TiempoUtilizado
                .Include(t => t.Representante)
                .Include(t => t.TipoActividad)
                .FirstOrDefaultAsync(t => t.Id == id && t.Status == false);

            if (tiempo == null)
            {
                return NotFound(new { message = "Registro de tiempo no encontrado" });
            }

            // Actualizar campos
            tiempo.Fecha = dto.Fecha;
            tiempo.TipoActividadId = dto.TipoActividadId;
            tiempo.Descripcion = dto.Descripcion;
            tiempo.HorasUtilizadas = dto.HorasUtilizadas;
            tiempo.MinutosUtilizados = dto.MinutosUtilizados;
            tiempo.Turno = dto.Turno;
            tiempo.EsRecurrente = dto.EsRecurrente;
            tiempo.Observaciones = dto.Observaciones;
            tiempo.FechaModificacion = DateTime.Now;
            tiempo.ModificadoPor = "Sistema"; // TODO: Obtener de claims del usuario autenticado

            await _context.SaveChangesAsync();

            var result = new TiempoUtilizadoDto
            {
                Id = tiempo.Id,
                RepresentanteId = tiempo.RepresentanteId,
                RepresentanteNombre = tiempo.Representante?.NombreCompleto ?? "N/A",
                Fecha = tiempo.Fecha,
                TipoActividadId = tiempo.TipoActividadId,
                TipoActividadNombre = tiempo.TipoActividad?.Nombre ?? "N/A",
                Descripcion = tiempo.Descripcion,
                HorasUtilizadas = tiempo.HorasUtilizadas,
                MinutosUtilizados = tiempo.MinutosUtilizados,
                Turno = tiempo.Turno,
                TiempoTotalHoras = tiempo.HorasUtilizadas + (tiempo.MinutosUtilizados / 60m),
                EsRecurrente = tiempo.EsRecurrente,
                Observaciones = tiempo.Observaciones,
                FechaCreacion = tiempo.FechaCreacion,
                CreadoPor = tiempo.CreadoPor,
                FechaModificacion = tiempo.FechaModificacion,
                ModificadoPor = tiempo.ModificadoPor
            };

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al actualizar registro de tiempo con ID: {Id}", id);
            return StatusCode(500, new { message = "Error al actualizar el registro de tiempo" });
        }
    }

    /// <summary>
    /// Elimina (soft delete) un registro de tiempo utilizado
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteTiempoUtilizado(string id)
    {
        try
        {
            var tiempo = await _context.TiempoUtilizado.FindAsync(id);

            if (tiempo == null || tiempo.Status == true)
            {
                return NotFound(new { message = "Registro de tiempo no encontrado" });
            }

            // Soft delete
            tiempo.Status = true;
            tiempo.FechaModificacion = DateTime.Now;
            tiempo.ModificadoPor = "Sistema"; // TODO: Obtener de claims del usuario autenticado

            await _context.SaveChangesAsync();

            return Ok(new { message = "Registro de tiempo eliminado exitosamente" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al eliminar registro de tiempo con ID: {Id}", id);
            return StatusCode(500, new { message = "Error al eliminar el registro de tiempo" });
        }
    }

    /// <summary>
    /// Obtiene estadísticas de tiempo utilizado
    /// </summary>
    [HttpGet("estadisticas")]
    public async Task<ActionResult<TiempoUtilizadoEstadisticasDto>> GetEstadisticas(
        [FromQuery] string? representanteId = null,
        [FromQuery] DateTime? fechaInicio = null,
        [FromQuery] DateTime? fechaFin = null)
    {
        try
        {
            var query = _context.TiempoUtilizado
                .Include(t => t.Representante)
                .Include(t => t.TipoActividad)
                .Where(t => t.Status == false);

            // Aplicar filtros
            if (!string.IsNullOrWhiteSpace(representanteId))
            {
                query = query.Where(t => t.RepresentanteId == representanteId);
            }

            if (fechaInicio.HasValue)
            {
                query = query.Where(t => t.Fecha >= fechaInicio.Value);
            }

            if (fechaFin.HasValue)
            {
                query = query.Where(t => t.Fecha <= fechaFin.Value);
            }

            var items = await query.ToListAsync();

            var totalHoras = items.Sum(t => t.HorasUtilizadas + (t.MinutosUtilizados / 60m));
            var totalRegistros = items.Count;

            // Calcular promedio diario
            var fechas = items.Select(t => t.Fecha.Date).Distinct().Count();
            var promedioDiario = fechas > 0 ? totalHoras / fechas : 0;

            // Horas por tipo de actividad
            var horasPorTipo = items
                .GroupBy(t => t.TipoActividad?.Nombre ?? "N/A")
                .ToDictionary(
                    g => g.Key,
                    g => g.Sum(t => t.HorasUtilizadas + (t.MinutosUtilizados / 60m))
                );

            // Registros por representante
            var registrosPorRepresentante = items
                .GroupBy(t => t.Representante?.NombreCompleto ?? "N/A")
                .ToDictionary(
                    g => g.Key,
                    g => g.Count()
                );

            var estadisticas = new TiempoUtilizadoEstadisticasDto
            {
                TotalHorasNoPromocion = totalHoras,
                PromedioHorasDiarias = promedioDiario,
                TotalRegistros = totalRegistros,
                HorasPorTipoActividad = horasPorTipo,
                RegistrosPorRepresentante = registrosPorRepresentante
            };

            return Ok(estadisticas);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener estadísticas de tiempo utilizado");
            return StatusCode(500, new { message = "Error al obtener las estadísticas" });
        }
    }

    /// <summary>
    /// Obtiene los tipos de actividad disponibles
    /// </summary>
    [HttpGet("tipos-actividad")]
    public ActionResult<List<string>> GetTiposActividad()
    {
        var tipos = new List<string>
        {
            "Capacitación",
            "Reuniones Internas",
            "Tareas Administrativas",
            "Desplazamiento",
            "Almuerzo/Refrigerio",
            "Permisos Personales",
            "Enfermedad",
            "Vacaciones",
            "Otros"
        };

        return Ok(tipos);
    }
}
