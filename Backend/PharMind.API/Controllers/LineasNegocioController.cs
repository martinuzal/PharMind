using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PharMind.API.Data;
using PharMind.API.DTOs;
using PharMind.API.Models;

namespace PharMind.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LineasNegocioController : ControllerBase
{
    private readonly PharMindDbContext _context;
    private readonly ILogger<LineasNegocioController> _logger;

    public LineasNegocioController(
        PharMindDbContext context,
        ILogger<LineasNegocioController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Obtiene todas las líneas de negocio
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<LineaNegocioListResponse>> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null,
        [FromQuery] bool? activo = null)
    {
        try
        {
            var query = _context.LineasNegocio
                .Include(ln => ln.Agentes)
                .Where(ln => ln.Status == false);

            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(ln =>
                    ln.Nombre.Contains(search) ||
                    ln.Codigo.Contains(search));
            }

            if (activo.HasValue)
            {
                query = query.Where(ln => ln.Activo == activo.Value);
            }

            var totalItems = await query.CountAsync();
            var totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);

            var items = await query
                .OrderBy(ln => ln.Orden)
                .ThenBy(ln => ln.Nombre)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var itemDtos = items.Select(ln => new LineaNegocioDto
            {
                Id = ln.Id,
                Codigo = ln.Codigo,
                Nombre = ln.Nombre,
                Descripcion = ln.Descripcion,
                LegacyCode = ln.LegacyCode,
                Legajo = ln.Legajo,
                Color = ln.Color,
                Icono = ln.Icono,
                Activo = ln.Activo,
                Orden = ln.Orden,
                CantidadAgentes = ln.Agentes.Count(a => a.Status == false),
                FechaCreacion = ln.FechaCreacion
            }).ToList();

            var response = new LineaNegocioListResponse
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
            _logger.LogError(ex, "Error al obtener líneas de negocio");
            return StatusCode(500, new { message = "Error al obtener líneas de negocio" });
        }
    }

    /// <summary>
    /// Obtiene una línea de negocio por ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<LineaNegocioDto>> GetById(string id)
    {
        try
        {
            var lineaNegocio = await _context.LineasNegocio
                .Include(ln => ln.Agentes)
                .FirstOrDefaultAsync(ln => ln.Id == id && ln.Status == false);

            if (lineaNegocio == null)
            {
                return NotFound(new { message = "Línea de negocio no encontrada" });
            }

            var dto = new LineaNegocioDto
            {
                Id = lineaNegocio.Id,
                Codigo = lineaNegocio.Codigo,
                Nombre = lineaNegocio.Nombre,
                Descripcion = lineaNegocio.Descripcion,
                LegacyCode = lineaNegocio.LegacyCode,
                Legajo = lineaNegocio.Legajo,
                Color = lineaNegocio.Color,
                Icono = lineaNegocio.Icono,
                Activo = lineaNegocio.Activo,
                Orden = lineaNegocio.Orden,
                CantidadAgentes = lineaNegocio.Agentes.Count(a => a.Status == false),
                FechaCreacion = lineaNegocio.FechaCreacion
            };

            return Ok(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener línea de negocio con ID: {Id}", id);
            return StatusCode(500, new { message = "Error al obtener línea de negocio" });
        }
    }

    /// <summary>
    /// Crea una nueva línea de negocio
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<LineaNegocioDto>> Create(CreateLineaNegocioDto dto)
    {
        try
        {
            var lineaNegocio = new LineasNegocio
            {
                Codigo = dto.Codigo,
                Nombre = dto.Nombre,
                Descripcion = dto.Descripcion,
                LegacyCode = dto.LegacyCode,
                Legajo = dto.Legajo,
                Color = dto.Color,
                Icono = dto.Icono,
                Orden = dto.Orden,
                Activo = true,
                Status = false,
                FechaCreacion = DateTime.Now,
                CreadoPor = "Sistema"
            };

            _context.LineasNegocio.Add(lineaNegocio);
            await _context.SaveChangesAsync();

            var result = new LineaNegocioDto
            {
                Id = lineaNegocio.Id,
                Codigo = lineaNegocio.Codigo,
                Nombre = lineaNegocio.Nombre,
                Descripcion = lineaNegocio.Descripcion,
                LegacyCode = lineaNegocio.LegacyCode,
                Legajo = lineaNegocio.Legajo,
                Color = lineaNegocio.Color,
                Icono = lineaNegocio.Icono,
                Activo = lineaNegocio.Activo,
                Orden = lineaNegocio.Orden,
                CantidadAgentes = 0,
                FechaCreacion = lineaNegocio.FechaCreacion
            };

            return CreatedAtAction(nameof(GetById), new { id = lineaNegocio.Id }, result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al crear línea de negocio");
            return StatusCode(500, new { message = "Error al crear línea de negocio" });
        }
    }

    /// <summary>
    /// Actualiza una línea de negocio
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<LineaNegocioDto>> Update(string id, UpdateLineaNegocioDto dto)
    {
        try
        {
            var lineaNegocio = await _context.LineasNegocio
                .Include(ln => ln.Agentes)
                .FirstOrDefaultAsync(ln => ln.Id == id && ln.Status == false);

            if (lineaNegocio == null)
            {
                return NotFound(new { message = "Línea de negocio no encontrada" });
            }

            lineaNegocio.Codigo = dto.Codigo;
            lineaNegocio.Nombre = dto.Nombre;
            lineaNegocio.Descripcion = dto.Descripcion;
            lineaNegocio.LegacyCode = dto.LegacyCode;
            lineaNegocio.Legajo = dto.Legajo;
            lineaNegocio.Color = dto.Color;
            lineaNegocio.Icono = dto.Icono;
            lineaNegocio.Activo = dto.Activo;
            lineaNegocio.Orden = dto.Orden;
            lineaNegocio.FechaModificacion = DateTime.Now;
            lineaNegocio.ModificadoPor = "Sistema";

            await _context.SaveChangesAsync();

            var result = new LineaNegocioDto
            {
                Id = lineaNegocio.Id,
                Codigo = lineaNegocio.Codigo,
                Nombre = lineaNegocio.Nombre,
                Descripcion = lineaNegocio.Descripcion,
                LegacyCode = lineaNegocio.LegacyCode,
                Legajo = lineaNegocio.Legajo,
                Color = lineaNegocio.Color,
                Icono = lineaNegocio.Icono,
                Activo = lineaNegocio.Activo,
                Orden = lineaNegocio.Orden,
                CantidadAgentes = lineaNegocio.Agentes.Count(a => a.Status == false),
                FechaCreacion = lineaNegocio.FechaCreacion
            };

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al actualizar línea de negocio con ID: {Id}", id);
            return StatusCode(500, new { message = "Error al actualizar línea de negocio" });
        }
    }

    /// <summary>
    /// Elimina una línea de negocio (soft delete)
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(string id)
    {
        try
        {
            var lineaNegocio = await _context.LineasNegocio
                .Include(ln => ln.Agentes)
                .FirstOrDefaultAsync(ln => ln.Id == id && ln.Status == false);

            if (lineaNegocio == null)
            {
                return NotFound(new { message = "Línea de negocio no encontrada" });
            }

            // Verificar si tiene agentes asociados
            if (lineaNegocio.Agentes.Any(a => a.Status == false))
            {
                return BadRequest(new { message = "No se puede eliminar una línea de negocio con agentes asociados" });
            }

            lineaNegocio.Status = true;
            lineaNegocio.FechaModificacion = DateTime.Now;
            lineaNegocio.ModificadoPor = "Sistema";

            await _context.SaveChangesAsync();

            return Ok(new { message = "Línea de negocio eliminada exitosamente" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al eliminar línea de negocio con ID: {Id}", id);
            return StatusCode(500, new { message = "Error al eliminar línea de negocio" });
        }
    }
}
