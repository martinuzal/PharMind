using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PharMind.API.Data;
using PharMind.API.DTOs;
using PharMind.API.Models;

namespace PharMind.API.Controllers;

/// <summary>
/// Controlador para gestión de citas y calendario
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CitasController : ControllerBase
{
    private readonly PharMindDbContext _context;
    private readonly ILogger<CitasController> _logger;
    private readonly IMapper _mapper;

    public CitasController(PharMindDbContext context, ILogger<CitasController> logger, IMapper mapper)
    {
        _context = context;
        _logger = logger;
        _mapper = mapper;
    }

    /// <summary>
    /// Obtener citas de un agente con filtros opcionales
    /// GET /api/citas?agenteId={id}&desde={fecha}&hasta={fecha}&estado={estado}
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<List<CitaDto>>> GetCitas([FromQuery] CitaFiltrosDto filtros)
    {
        try
        {
            var query = _context.Citas
                .Include(c => c.Agente)
                .Include(c => c.Cliente)
                .Include(c => c.Relacion)
                .Where(c => c.Status == false);

            // Aplicar filtros
            if (!string.IsNullOrEmpty(filtros.AgenteId))
            {
                query = query.Where(c => c.AgenteId == filtros.AgenteId);
            }

            if (filtros.Desde.HasValue)
            {
                query = query.Where(c => c.FechaInicio >= filtros.Desde.Value);
            }

            if (filtros.Hasta.HasValue)
            {
                query = query.Where(c => c.FechaInicio <= filtros.Hasta.Value);
            }

            if (!string.IsNullOrEmpty(filtros.Estado))
            {
                query = query.Where(c => c.Estado == filtros.Estado);
            }

            if (!string.IsNullOrEmpty(filtros.TipoCita))
            {
                query = query.Where(c => c.TipoCita == filtros.TipoCita);
            }

            if (!string.IsNullOrEmpty(filtros.Prioridad))
            {
                query = query.Where(c => c.Prioridad == filtros.Prioridad);
            }

            var citas = await query
                .OrderBy(c => c.FechaInicio)
                .ToListAsync();

            var citasDto = citas.Select(c => MapToDtoWithCalculations(c)).ToList();

            return Ok(citasDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener citas");
            return StatusCode(500, new { error = "Error al obtener citas", details = ex.Message });
        }
    }

    /// <summary>
    /// Obtener una cita por ID
    /// GET /api/citas/{id}
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<CitaDto>> GetCita(string id)
    {
        try
        {
            var cita = await _context.Citas
                .Include(c => c.Agente)
                .Include(c => c.Cliente)
                .Include(c => c.Relacion)
                .Include(c => c.Interaccion)
                .FirstOrDefaultAsync(c => c.Id == id && c.Status == false);

            if (cita == null)
            {
                return NotFound(new { error = "Cita no encontrada" });
            }

            return Ok(MapToDtoWithCalculations(cita));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error al obtener cita {id}");
            return StatusCode(500, new { error = "Error al obtener cita", details = ex.Message });
        }
    }

    /// <summary>
    /// Crear una nueva cita
    /// POST /api/citas
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<CitaDto>> CrearCita([FromBody] CreateCitaDto dto)
    {
        try
        {
            // Generar código de cita único
            var codigoCita = await GenerarCodigoCita(dto.FechaInicio);

            var cita = new Cita
            {
                CodigoCita = codigoCita,
                AgenteId = dto.AgenteId,
                RelacionId = dto.RelacionId,
                ClienteId = dto.ClienteId,
                Titulo = dto.Titulo,
                Descripcion = dto.Descripcion,
                FechaInicio = dto.FechaInicio,
                FechaFin = dto.FechaFin,
                TodoElDia = dto.TodoElDia,
                TipoCita = dto.TipoCita,
                Estado = dto.Estado,
                Prioridad = dto.Prioridad,
                Ubicacion = dto.Ubicacion,
                Latitud = dto.Latitud,
                Longitud = dto.Longitud,
                Color = dto.Color,
                Recordatorio = dto.Recordatorio,
                MinutosAntes = dto.MinutosAntes,
                Notas = dto.Notas
            };

            _context.Citas.Add(cita);
            await _context.SaveChangesAsync();

            // Recargar con includes
            var citaCreada = await _context.Citas
                .Include(c => c.Agente)
                .Include(c => c.Cliente)
                .Include(c => c.Relacion)
                .FirstAsync(c => c.Id == cita.Id);

            return CreatedAtAction(nameof(GetCita), new { id = cita.Id }, MapToDtoWithCalculations(citaCreada));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al crear cita");
            return StatusCode(500, new { error = "Error al crear cita", details = ex.Message });
        }
    }

    /// <summary>
    /// Actualizar una cita existente
    /// PUT /api/citas/{id}
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<CitaDto>> ActualizarCita(string id, [FromBody] UpdateCitaDto dto)
    {
        try
        {
            var cita = await _context.Citas
                .FirstOrDefaultAsync(c => c.Id == id && c.Status == false);

            if (cita == null)
            {
                return NotFound(new { error = "Cita no encontrada" });
            }

            // Actualizar solo campos no nulos
            if (dto.Titulo != null) cita.Titulo = dto.Titulo;
            if (dto.Descripcion != null) cita.Descripcion = dto.Descripcion;
            if (dto.FechaInicio.HasValue) cita.FechaInicio = dto.FechaInicio.Value;
            if (dto.FechaFin.HasValue) cita.FechaFin = dto.FechaFin.Value;
            if (dto.TodoElDia.HasValue) cita.TodoElDia = dto.TodoElDia.Value;
            if (dto.TipoCita != null) cita.TipoCita = dto.TipoCita;
            if (dto.Estado != null) cita.Estado = dto.Estado;
            if (dto.Prioridad != null) cita.Prioridad = dto.Prioridad;
            if (dto.Ubicacion != null) cita.Ubicacion = dto.Ubicacion;
            if (dto.Latitud.HasValue) cita.Latitud = dto.Latitud;
            if (dto.Longitud.HasValue) cita.Longitud = dto.Longitud;
            if (dto.Color != null) cita.Color = dto.Color;
            if (dto.Recordatorio.HasValue) cita.Recordatorio = dto.Recordatorio.Value;
            if (dto.MinutosAntes.HasValue) cita.MinutosAntes = dto.MinutosAntes.Value;
            if (dto.Notas != null) cita.Notas = dto.Notas;
            if (dto.Orden.HasValue) cita.Orden = dto.Orden;
            if (dto.DistanciaKm.HasValue) cita.DistanciaKm = dto.DistanciaKm;
            if (dto.TiempoEstimadoMinutos.HasValue) cita.TiempoEstimadoMinutos = dto.TiempoEstimadoMinutos;

            cita.FechaModificacion = DateTime.Now;

            await _context.SaveChangesAsync();

            // Recargar con includes
            var citaActualizada = await _context.Citas
                .Include(c => c.Agente)
                .Include(c => c.Cliente)
                .Include(c => c.Relacion)
                .FirstAsync(c => c.Id == id);

            return Ok(MapToDtoWithCalculations(citaActualizada));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error al actualizar cita {id}");
            return StatusCode(500, new { error = "Error al actualizar cita", details = ex.Message });
        }
    }

    /// <summary>
    /// Cambiar estado de una cita
    /// PATCH /api/citas/{id}/estado
    /// </summary>
    [HttpPatch("{id}/estado")]
    public async Task<ActionResult<CitaDto>> CambiarEstado(string id, [FromBody] CambiarEstadoCitaDto dto)
    {
        try
        {
            var cita = await _context.Citas
                .FirstOrDefaultAsync(c => c.Id == id && c.Status == false);

            if (cita == null)
            {
                return NotFound(new { error = "Cita no encontrada" });
            }

            cita.Estado = dto.Estado;
            cita.FechaModificacion = DateTime.Now;

            await _context.SaveChangesAsync();

            // Recargar con includes
            var citaActualizada = await _context.Citas
                .Include(c => c.Agente)
                .Include(c => c.Cliente)
                .Include(c => c.Relacion)
                .FirstAsync(c => c.Id == id);

            return Ok(MapToDtoWithCalculations(citaActualizada));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error al cambiar estado de cita {id}");
            return StatusCode(500, new { error = "Error al cambiar estado", details = ex.Message });
        }
    }

    /// <summary>
    /// Completar cita y vincular con interacción
    /// PATCH /api/citas/{id}/completar
    /// </summary>
    [HttpPatch("{id}/completar")]
    public async Task<ActionResult<CitaDto>> CompletarCita(string id, [FromBody] CompletarCitaDto dto)
    {
        try
        {
            var cita = await _context.Citas
                .FirstOrDefaultAsync(c => c.Id == id && c.Status == false);

            if (cita == null)
            {
                return NotFound(new { error = "Cita no encontrada" });
            }

            // Verificar que la interacción existe
            var interaccionExiste = await _context.Interacciones
                .AnyAsync(i => i.Id == dto.InteraccionId && i.Status == false);

            if (!interaccionExiste)
            {
                return BadRequest(new { error = "Interacción no encontrada" });
            }

            cita.Estado = "Completada";
            cita.InteraccionId = dto.InteraccionId;
            cita.FechaModificacion = DateTime.Now;

            await _context.SaveChangesAsync();

            // Recargar con includes
            var citaActualizada = await _context.Citas
                .Include(c => c.Agente)
                .Include(c => c.Cliente)
                .Include(c => c.Relacion)
                .Include(c => c.Interaccion)
                .FirstAsync(c => c.Id == id);

            return Ok(MapToDtoWithCalculations(citaActualizada));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error al completar cita {id}");
            return StatusCode(500, new { error = "Error al completar cita", details = ex.Message });
        }
    }

    /// <summary>
    /// Eliminar una cita (soft delete)
    /// DELETE /api/citas/{id}
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult> EliminarCita(string id)
    {
        try
        {
            var cita = await _context.Citas
                .FirstOrDefaultAsync(c => c.Id == id && c.Status == false);

            if (cita == null)
            {
                return NotFound(new { error = "Cita no encontrada" });
            }

            cita.Status = true; // Soft delete
            cita.FechaModificacion = DateTime.Now;

            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error al eliminar cita {id}");
            return StatusCode(500, new { error = "Error al eliminar cita", details = ex.Message });
        }
    }

    // ==================== MÉTODOS PRIVADOS ====================

    private async Task<string> GenerarCodigoCita(DateTime fecha)
    {
        var fechaStr = fecha.ToString("yyyyMMdd");
        var ultimoCodigo = await _context.Citas
            .Where(c => c.CodigoCita.StartsWith($"CITA-{fechaStr}"))
            .OrderByDescending(c => c.CodigoCita)
            .Select(c => c.CodigoCita)
            .FirstOrDefaultAsync();

        if (ultimoCodigo == null)
        {
            return $"CITA-{fechaStr}-001";
        }

        var numero = int.Parse(ultimoCodigo.Split('-')[2]);
        return $"CITA-{fechaStr}-{(numero + 1):D3}";
    }

    private CitaDto MapToDtoWithCalculations(Cita c)
    {
        // Mapear usando AutoMapper
        var dto = _mapper.Map<CitaDto>(c);

        // Agregar cálculos adicionales que no pueden ser mapeados automáticamente
        var ahora = DateTime.Now;
        var hoy = ahora.Date;
        var fechaCitaDate = c.FechaInicio.Date;

        dto.EsHoy = fechaCitaDate == hoy;
        dto.YaPaso = c.FechaFin < ahora;
        dto.EnProgreso = c.FechaInicio <= ahora && c.FechaFin >= ahora;
        dto.DuracionMinutos = (int)(c.FechaFin - c.FechaInicio).TotalMinutes;

        return dto;
    }
}
