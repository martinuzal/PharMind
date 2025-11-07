using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PharMind.API.Data;
using PharMind.API.DTOs;
using PharMind.API.Models;

namespace PharMind.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TimelinesController : ControllerBase
{
    private readonly PharMindDbContext _context;
    private readonly ILogger<TimelinesController> _logger;

    public TimelinesController(PharMindDbContext context, ILogger<TimelinesController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Obtener todos los timelines con sus períodos
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<List<TimelineDto>>> GetAll()
    {
        try
        {
            var timelines = await _context.Timelines
                .Include(t => t.Periods.OrderBy(p => p.Orden))
                .Where(t => t.Status)
                .OrderByDescending(t => t.EsDefault)
                .ThenByDescending(t => t.Anio)
                .ThenBy(t => t.Nombre)
                .Select(t => new TimelineDto
                {
                    Id = t.Id,
                    Nombre = t.Nombre,
                    Descripcion = t.Descripcion,
                    Color = t.Color,
                    Anio = t.Anio,
                    Activo = t.Activo,
                    EsDefault = t.EsDefault,
                    FechaCreacion = t.FechaCreacion,
                    CreadoPor = t.CreadoPor,
                    FechaModificacion = t.FechaModificacion,
                    ModificadoPor = t.ModificadoPor,
                    Periods = t.Periods.Select(p => new PeriodDto
                    {
                        Id = p.Id,
                        TimelineId = p.TimelineId,
                        Nombre = p.Nombre,
                        Codigo = p.Codigo,
                        Orden = p.Orden,
                        FechaInicio = p.FechaInicio,
                        FechaFin = p.FechaFin,
                        Color = p.Color,
                        Descripcion = p.Descripcion,
                        Activo = p.Activo
                    }).ToList()
                })
                .ToListAsync();

            return Ok(timelines);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener timelines");
            return StatusCode(500, "Error al obtener timelines");
        }
    }

    /// <summary>
    /// Obtener timeline por ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<TimelineDto>> GetById(Guid id)
    {
        try
        {
            var timeline = await _context.Timelines
                .Include(t => t.Periods.OrderBy(p => p.Orden))
                .FirstOrDefaultAsync(t => t.Id == id && t.Status);

            if (timeline == null)
                return NotFound($"Timeline con ID {id} no encontrado");

            var dto = new TimelineDto
            {
                Id = timeline.Id,
                Nombre = timeline.Nombre,
                Descripcion = timeline.Descripcion,
                Color = timeline.Color,
                Anio = timeline.Anio,
                Activo = timeline.Activo,
                EsDefault = timeline.EsDefault,
                FechaCreacion = timeline.FechaCreacion,
                CreadoPor = timeline.CreadoPor,
                FechaModificacion = timeline.FechaModificacion,
                ModificadoPor = timeline.ModificadoPor,
                Periods = timeline.Periods.Select(p => new PeriodDto
                {
                    Id = p.Id,
                    TimelineId = p.TimelineId,
                    Nombre = p.Nombre,
                    Codigo = p.Codigo,
                    Orden = p.Orden,
                    FechaInicio = p.FechaInicio,
                    FechaFin = p.FechaFin,
                    Color = p.Color,
                    Descripcion = p.Descripcion,
                    Activo = p.Activo
                }).ToList()
            };

            return Ok(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener timeline {Id}", id);
            return StatusCode(500, "Error al obtener timeline");
        }
    }

    /// <summary>
    /// Crear nuevo timeline con períodos
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<TimelineDto>> Create([FromBody] CreateTimelineDto dto)
    {
        try
        {
            // Si es default, desmarcar otros
            if (dto.EsDefault)
            {
                var defaultTimelines = await _context.Timelines
                    .Where(t => t.EsDefault && t.Status)
                    .ToListAsync();

                foreach (var t in defaultTimelines)
                {
                    t.EsDefault = false;
                    t.FechaModificacion = DateTime.Now;
                    t.ModificadoPor = "System";
                }
            }

            var timeline = new Timeline
            {
                Id = Guid.NewGuid(),
                Nombre = dto.Nombre,
                Descripcion = dto.Descripcion,
                Color = dto.Color,
                Anio = dto.Anio,
                Activo = dto.Activo,
                EsDefault = dto.EsDefault,
                FechaCreacion = DateTime.Now,
                CreadoPor = "System",
                Status = true
            };

            // Agregar períodos
            foreach (var periodDto in dto.Periods)
            {
                var period = new Period
                {
                    Id = Guid.NewGuid(),
                    TimelineId = timeline.Id,
                    Nombre = periodDto.Nombre,
                    Codigo = periodDto.Codigo,
                    Orden = periodDto.Orden,
                    FechaInicio = periodDto.FechaInicio,
                    FechaFin = periodDto.FechaFin,
                    Color = periodDto.Color,
                    Descripcion = periodDto.Descripcion,
                    Activo = periodDto.Activo,
                    FechaCreacion = DateTime.Now,
                    CreadoPor = "System",
                    Status = true
                };
                timeline.Periods.Add(period);
            }

            _context.Timelines.Add(timeline);
            await _context.SaveChangesAsync();

            // Recargar con períodos
            await _context.Entry(timeline)
                .Collection(t => t.Periods)
                .LoadAsync();

            var result = new TimelineDto
            {
                Id = timeline.Id,
                Nombre = timeline.Nombre,
                Descripcion = timeline.Descripcion,
                Color = timeline.Color,
                Anio = timeline.Anio,
                Activo = timeline.Activo,
                EsDefault = timeline.EsDefault,
                FechaCreacion = timeline.FechaCreacion,
                CreadoPor = timeline.CreadoPor,
                Periods = timeline.Periods.Select(p => new PeriodDto
                {
                    Id = p.Id,
                    TimelineId = p.TimelineId,
                    Nombre = p.Nombre,
                    Codigo = p.Codigo,
                    Orden = p.Orden,
                    FechaInicio = p.FechaInicio,
                    FechaFin = p.FechaFin,
                    Color = p.Color,
                    Descripcion = p.Descripcion,
                    Activo = p.Activo
                }).ToList()
            };

            return CreatedAtAction(nameof(GetById), new { id = timeline.Id }, result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al crear timeline");
            return StatusCode(500, "Error al crear timeline");
        }
    }

    /// <summary>
    /// Actualizar timeline existente
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<TimelineDto>> Update(Guid id, [FromBody] UpdateTimelineDto dto)
    {
        try
        {
            var timeline = await _context.Timelines
                .Include(t => t.Periods)
                .FirstOrDefaultAsync(t => t.Id == id && t.Status);

            if (timeline == null)
                return NotFound($"Timeline con ID {id} no encontrado");

            // Si es default, desmarcar otros
            if (dto.EsDefault && !timeline.EsDefault)
            {
                var defaultTimelines = await _context.Timelines
                    .Where(t => t.EsDefault && t.Id != id && t.Status)
                    .ToListAsync();

                foreach (var t in defaultTimelines)
                {
                    t.EsDefault = false;
                    t.FechaModificacion = DateTime.Now;
                    t.ModificadoPor = "System";
                }
            }

            // Actualizar timeline
            timeline.Nombre = dto.Nombre;
            timeline.Descripcion = dto.Descripcion;
            timeline.Color = dto.Color;
            timeline.Anio = dto.Anio;
            timeline.Activo = dto.Activo;
            timeline.EsDefault = dto.EsDefault;
            timeline.FechaModificacion = DateTime.Now;
            timeline.ModificadoPor = "System";

            // Obtener IDs de períodos existentes en el DTO
            var periodIdsInDto = dto.Periods
                .Where(p => p.Id.HasValue)
                .Select(p => p.Id!.Value)
                .ToHashSet();

            // Eliminar períodos que no están en el DTO
            var periodsToRemove = timeline.Periods
                .Where(p => !periodIdsInDto.Contains(p.Id))
                .ToList();

            foreach (var period in periodsToRemove)
            {
                _context.Periods.Remove(period);
            }

            // Actualizar o crear períodos
            foreach (var periodDto in dto.Periods)
            {
                if (periodDto.Id.HasValue)
                {
                    // Actualizar período existente
                    var existingPeriod = timeline.Periods.FirstOrDefault(p => p.Id == periodDto.Id.Value);
                    if (existingPeriod != null)
                    {
                        existingPeriod.Nombre = periodDto.Nombre;
                        existingPeriod.Codigo = periodDto.Codigo;
                        existingPeriod.Orden = periodDto.Orden;
                        existingPeriod.FechaInicio = periodDto.FechaInicio;
                        existingPeriod.FechaFin = periodDto.FechaFin;
                        existingPeriod.Color = periodDto.Color;
                        existingPeriod.Descripcion = periodDto.Descripcion;
                        existingPeriod.Activo = periodDto.Activo;
                        existingPeriod.FechaModificacion = DateTime.Now;
                        existingPeriod.ModificadoPor = "System";
                    }
                }
                else
                {
                    // Crear nuevo período
                    var newPeriod = new Period
                    {
                        Id = Guid.NewGuid(),
                        TimelineId = timeline.Id,
                        Nombre = periodDto.Nombre,
                        Codigo = periodDto.Codigo,
                        Orden = periodDto.Orden,
                        FechaInicio = periodDto.FechaInicio,
                        FechaFin = periodDto.FechaFin,
                        Color = periodDto.Color,
                        Descripcion = periodDto.Descripcion,
                        Activo = periodDto.Activo,
                        FechaCreacion = DateTime.Now,
                        CreadoPor = "System",
                        Status = true
                    };
                    timeline.Periods.Add(newPeriod);
                }
            }

            await _context.SaveChangesAsync();

            // Recargar períodos ordenados
            await _context.Entry(timeline)
                .Collection(t => t.Periods)
                .Query()
                .OrderBy(p => p.Orden)
                .LoadAsync();

            var result = new TimelineDto
            {
                Id = timeline.Id,
                Nombre = timeline.Nombre,
                Descripcion = timeline.Descripcion,
                Color = timeline.Color,
                Anio = timeline.Anio,
                Activo = timeline.Activo,
                EsDefault = timeline.EsDefault,
                FechaCreacion = timeline.FechaCreacion,
                CreadoPor = timeline.CreadoPor,
                FechaModificacion = timeline.FechaModificacion,
                ModificadoPor = timeline.ModificadoPor,
                Periods = timeline.Periods.Select(p => new PeriodDto
                {
                    Id = p.Id,
                    TimelineId = p.TimelineId,
                    Nombre = p.Nombre,
                    Codigo = p.Codigo,
                    Orden = p.Orden,
                    FechaInicio = p.FechaInicio,
                    FechaFin = p.FechaFin,
                    Color = p.Color,
                    Descripcion = p.Descripcion,
                    Activo = p.Activo
                }).ToList()
            };

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al actualizar timeline {Id}", id);
            return StatusCode(500, "Error al actualizar timeline");
        }
    }

    /// <summary>
    /// Eliminar timeline (soft delete)
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            var timeline = await _context.Timelines.FindAsync(id);

            if (timeline == null || !timeline.Status)
                return NotFound($"Timeline con ID {id} no encontrado");

            // No permitir eliminar si es default
            if (timeline.EsDefault)
                return BadRequest("No se puede eliminar el timeline por defecto");

            // Verificar si hay agentes asignados
            var agentesCount = await _context.Agentes
                .CountAsync(a => a.TimelineId == id && a.Activo == true);

            if (agentesCount > 0)
                return BadRequest($"No se puede eliminar el timeline porque tiene {agentesCount} agente(s) asignado(s)");

            // Soft delete
            timeline.Status = false;
            timeline.FechaModificacion = DateTime.Now;
            timeline.ModificadoPor = "System";

            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al eliminar timeline {Id}", id);
            return StatusCode(500, "Error al eliminar timeline");
        }
    }

    /// <summary>
    /// Establecer timeline como default
    /// </summary>
    [HttpPost("{id}/set-default")]
    public async Task<IActionResult> SetDefault(Guid id)
    {
        try
        {
            var timeline = await _context.Timelines.FindAsync(id);

            if (timeline == null || !timeline.Status)
                return NotFound($"Timeline con ID {id} no encontrado");

            // Desmarcar todos los otros como default
            var defaultTimelines = await _context.Timelines
                .Where(t => t.EsDefault && t.Id != id && t.Status)
                .ToListAsync();

            foreach (var t in defaultTimelines)
            {
                t.EsDefault = false;
                t.FechaModificacion = DateTime.Now;
                t.ModificadoPor = "System";
            }

            // Marcar este como default
            timeline.EsDefault = true;
            timeline.FechaModificacion = DateTime.Now;
            timeline.ModificadoPor = "System";

            await _context.SaveChangesAsync();

            return Ok();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al establecer timeline default {Id}", id);
            return StatusCode(500, "Error al establecer timeline default");
        }
    }

    /// <summary>
    /// Obtener agentes asignados a un timeline
    /// </summary>
    [HttpGet("{id}/agentes")]
    public async Task<ActionResult<List<object>>> GetAgentes(Guid id)
    {
        try
        {
            var agentes = await _context.Agentes
                .Where(a => a.TimelineId == id && a.Activo == true)
                .Select(a => new
                {
                    a.Id,
                    a.CodigoAgente,
                    a.Nombre,
                    a.Apellido,
                    NombreCompleto = a.Nombre + " " + (a.Apellido ?? "")
                })
                .ToListAsync();

            return Ok(agentes);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener agentes del timeline {Id}", id);
            return StatusCode(500, "Error al obtener agentes");
        }
    }
}
