using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PharMind.API.Data;
using PharMind.API.DTOs;
using PharMind.API.Models;

namespace PharMind.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TiposActividadController : ControllerBase
{
    private readonly PharMindDbContext _context;
    private readonly ILogger<TiposActividadController> _logger;

    public TiposActividadController(
        PharMindDbContext context,
        ILogger<TiposActividadController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Obtiene todos los tipos de actividad
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<TipoActividadListResponse>> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 100,
        [FromQuery] string? search = null,
        [FromQuery] string? clasificacion = null,
        [FromQuery] bool? activo = null)
    {
        try
        {
            var query = _context.TiposActividad
                .Include(ta => ta.TiemposUtilizados)
                .Where(ta => ta.Status == false);

            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(ta =>
                    ta.Nombre.Contains(search) ||
                    ta.Codigo.Contains(search));
            }

            if (!string.IsNullOrWhiteSpace(clasificacion))
            {
                query = query.Where(ta => ta.Clasificacion == clasificacion);
            }

            if (activo.HasValue)
            {
                query = query.Where(ta => ta.Activo == activo.Value);
            }

            var totalItems = await query.CountAsync();
            var totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);

            var items = await query
                .OrderBy(ta => ta.Orden)
                .ThenBy(ta => ta.Nombre)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var itemDtos = items.Select(ta => new TipoActividadDto
            {
                Id = ta.Id,
                Codigo = ta.Codigo,
                Nombre = ta.Nombre,
                Descripcion = ta.Descripcion,
                Clasificacion = ta.Clasificacion,
                Color = ta.Color,
                Icono = ta.Icono,
                Activo = ta.Activo,
                EsSistema = ta.EsSistema,
                Orden = ta.Orden,
                CantidadUsos = ta.TiemposUtilizados.Count(tu => tu.Status == false),
                FechaCreacion = ta.FechaCreacion
            }).ToList();

            var response = new TipoActividadListResponse
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
            _logger.LogError(ex, "Error al obtener tipos de actividad");
            return StatusCode(500, new { message = "Error al obtener tipos de actividad" });
        }
    }

    /// <summary>
    /// Obtiene un tipo de actividad por ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<TipoActividadDto>> GetById(string id)
    {
        try
        {
            var tipoActividad = await _context.TiposActividad
                .Include(ta => ta.TiemposUtilizados)
                .FirstOrDefaultAsync(ta => ta.Id == id && ta.Status == false);

            if (tipoActividad == null)
            {
                return NotFound(new { message = "Tipo de actividad no encontrado" });
            }

            var dto = new TipoActividadDto
            {
                Id = tipoActividad.Id,
                Codigo = tipoActividad.Codigo,
                Nombre = tipoActividad.Nombre,
                Descripcion = tipoActividad.Descripcion,
                Clasificacion = tipoActividad.Clasificacion,
                Color = tipoActividad.Color,
                Icono = tipoActividad.Icono,
                Activo = tipoActividad.Activo,
                EsSistema = tipoActividad.EsSistema,
                Orden = tipoActividad.Orden,
                CantidadUsos = tipoActividad.TiemposUtilizados.Count(tu => tu.Status == false),
                FechaCreacion = tipoActividad.FechaCreacion
            };

            return Ok(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener tipo de actividad con ID: {Id}", id);
            return StatusCode(500, new { message = "Error al obtener tipo de actividad" });
        }
    }

    /// <summary>
    /// Crea un nuevo tipo de actividad
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<TipoActividadDto>> Create(CreateTipoActividadDto dto)
    {
        try
        {
            var tipoActividad = new TipoActividad
            {
                Codigo = dto.Codigo,
                Nombre = dto.Nombre,
                Descripcion = dto.Descripcion,
                Clasificacion = dto.Clasificacion,
                Color = dto.Color,
                Icono = dto.Icono,
                Orden = dto.Orden,
                Activo = true,
                EsSistema = false,
                Status = false,
                FechaCreacion = DateTime.Now,
                CreadoPor = "Sistema"
            };

            _context.TiposActividad.Add(tipoActividad);
            await _context.SaveChangesAsync();

            var result = new TipoActividadDto
            {
                Id = tipoActividad.Id,
                Codigo = tipoActividad.Codigo,
                Nombre = tipoActividad.Nombre,
                Descripcion = tipoActividad.Descripcion,
                Clasificacion = tipoActividad.Clasificacion,
                Color = tipoActividad.Color,
                Icono = tipoActividad.Icono,
                Activo = tipoActividad.Activo,
                EsSistema = tipoActividad.EsSistema,
                Orden = tipoActividad.Orden,
                CantidadUsos = 0,
                FechaCreacion = tipoActividad.FechaCreacion
            };

            return CreatedAtAction(nameof(GetById), new { id = tipoActividad.Id }, result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al crear tipo de actividad");
            return StatusCode(500, new { message = "Error al crear tipo de actividad" });
        }
    }

    /// <summary>
    /// Actualiza un tipo de actividad
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<TipoActividadDto>> Update(string id, UpdateTipoActividadDto dto)
    {
        try
        {
            var tipoActividad = await _context.TiposActividad
                .Include(ta => ta.TiemposUtilizados)
                .FirstOrDefaultAsync(ta => ta.Id == id && ta.Status == false);

            if (tipoActividad == null)
            {
                return NotFound(new { message = "Tipo de actividad no encontrado" });
            }

            // No permitir editar tipos de sistema
            if (tipoActividad.EsSistema)
            {
                return BadRequest(new { message = "No se pueden modificar tipos de actividad del sistema" });
            }

            tipoActividad.Codigo = dto.Codigo;
            tipoActividad.Nombre = dto.Nombre;
            tipoActividad.Descripcion = dto.Descripcion;
            tipoActividad.Clasificacion = dto.Clasificacion;
            tipoActividad.Color = dto.Color;
            tipoActividad.Icono = dto.Icono;
            tipoActividad.Activo = dto.Activo;
            tipoActividad.Orden = dto.Orden;
            tipoActividad.FechaModificacion = DateTime.Now;
            tipoActividad.ModificadoPor = "Sistema";

            await _context.SaveChangesAsync();

            var result = new TipoActividadDto
            {
                Id = tipoActividad.Id,
                Codigo = tipoActividad.Codigo,
                Nombre = tipoActividad.Nombre,
                Descripcion = tipoActividad.Descripcion,
                Clasificacion = tipoActividad.Clasificacion,
                Color = tipoActividad.Color,
                Icono = tipoActividad.Icono,
                Activo = tipoActividad.Activo,
                EsSistema = tipoActividad.EsSistema,
                Orden = tipoActividad.Orden,
                CantidadUsos = tipoActividad.TiemposUtilizados.Count(tu => tu.Status == false),
                FechaCreacion = tipoActividad.FechaCreacion
            };

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al actualizar tipo de actividad con ID: {Id}", id);
            return StatusCode(500, new { message = "Error al actualizar tipo de actividad" });
        }
    }

    /// <summary>
    /// Elimina un tipo de actividad (soft delete)
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(string id)
    {
        try
        {
            var tipoActividad = await _context.TiposActividad
                .Include(ta => ta.TiemposUtilizados)
                .FirstOrDefaultAsync(ta => ta.Id == id && ta.Status == false);

            if (tipoActividad == null)
            {
                return NotFound(new { message = "Tipo de actividad no encontrado" });
            }

            // No permitir eliminar tipos de sistema
            if (tipoActividad.EsSistema)
            {
                return BadRequest(new { message = "No se pueden eliminar tipos de actividad del sistema" });
            }

            // Verificar si tiene usos
            if (tipoActividad.TiemposUtilizados.Any(tu => tu.Status == false))
            {
                return BadRequest(new { message = "No se puede eliminar un tipo de actividad que está siendo utilizado" });
            }

            tipoActividad.Status = true;
            tipoActividad.FechaModificacion = DateTime.Now;
            tipoActividad.ModificadoPor = "Sistema";

            await _context.SaveChangesAsync();

            return Ok(new { message = "Tipo de actividad eliminado exitosamente" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al eliminar tipo de actividad con ID: {Id}", id);
            return StatusCode(500, new { message = "Error al eliminar tipo de actividad" });
        }
    }
}
