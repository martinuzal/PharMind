using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PharMind.API.Data;
using PharMind.API.DTOs;
using PharMind.API.Models;

namespace PharMind.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DistritosController : ControllerBase
{
    private readonly PharMindDbContext _context;
    private readonly ILogger<DistritosController> _logger;

    public DistritosController(
        PharMindDbContext context,
        ILogger<DistritosController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Obtiene todos los distritos
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<DistritoListResponse>> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null,
        [FromQuery] string? regionId = null,
        [FromQuery] bool? activo = null)
    {
        try
        {
            var query = _context.Distritos
                .Include(d => d.Region)
                .Include(d => d.Agentes)
                .Where(d => d.Status == false);

            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(d =>
                    d.Nombre.Contains(search) ||
                    d.Codigo.Contains(search));
            }

            if (!string.IsNullOrWhiteSpace(regionId))
            {
                query = query.Where(d => d.RegionId == regionId);
            }

            if (activo.HasValue)
            {
                query = query.Where(d => d.Activo == activo.Value);
            }

            var totalItems = await query.CountAsync();
            var totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);

            var items = await query
                .OrderBy(d => d.Orden)
                .ThenBy(d => d.Nombre)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var itemDtos = items.Select(d => new DistritoDto
            {
                Id = d.Id,
                RegionId = d.RegionId,
                RegionNombre = d.Region?.Nombre ?? "N/A",
                Codigo = d.Codigo,
                Nombre = d.Nombre,
                Descripcion = d.Descripcion,
                LegacyCode = d.LegacyCode,
                Legajo = d.Legajo,
                Color = d.Color,
                Icono = d.Icono,
                Activo = d.Activo,
                Orden = d.Orden,
                CantidadAgentes = d.Agentes.Count(a => a.Status == false),
                FechaCreacion = d.FechaCreacion
            }).ToList();

            var response = new DistritoListResponse
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
            _logger.LogError(ex, "Error al obtener distritos");
            return StatusCode(500, new { message = "Error al obtener distritos" });
        }
    }

    /// <summary>
    /// Obtiene un distrito por ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<DistritoDto>> GetById(string id)
    {
        try
        {
            var distrito = await _context.Distritos
                .Include(d => d.Region)
                .Include(d => d.Agentes)
                .FirstOrDefaultAsync(d => d.Id == id && d.Status == false);

            if (distrito == null)
            {
                return NotFound(new { message = "Distrito no encontrado" });
            }

            var dto = new DistritoDto
            {
                Id = distrito.Id,
                RegionId = distrito.RegionId,
                RegionNombre = distrito.Region?.Nombre ?? "N/A",
                Codigo = distrito.Codigo,
                Nombre = distrito.Nombre,
                Descripcion = distrito.Descripcion,
                LegacyCode = distrito.LegacyCode,
                Legajo = distrito.Legajo,
                Color = distrito.Color,
                Icono = distrito.Icono,
                Activo = distrito.Activo,
                Orden = distrito.Orden,
                CantidadAgentes = distrito.Agentes.Count(a => a.Status == false),
                FechaCreacion = distrito.FechaCreacion
            };

            return Ok(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener distrito con ID: {Id}", id);
            return StatusCode(500, new { message = "Error al obtener distrito" });
        }
    }

    /// <summary>
    /// Crea un nuevo distrito
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<DistritoDto>> Create(CreateDistritoDto dto)
    {
        try
        {
            // Verificar que la región existe
            var region = await _context.Regiones.FindAsync(dto.RegionId);
            if (region == null)
            {
                return BadRequest(new { message = "Región no encontrada" });
            }

            var distrito = new Distrito
            {
                RegionId = dto.RegionId,
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

            _context.Distritos.Add(distrito);
            await _context.SaveChangesAsync();

            // Recargar con datos relacionados
            await _context.Entry(distrito).Reference(d => d.Region).LoadAsync();

            var result = new DistritoDto
            {
                Id = distrito.Id,
                RegionId = distrito.RegionId,
                RegionNombre = distrito.Region?.Nombre ?? "N/A",
                Codigo = distrito.Codigo,
                Nombre = distrito.Nombre,
                Descripcion = distrito.Descripcion,
                LegacyCode = distrito.LegacyCode,
                Legajo = distrito.Legajo,
                Color = distrito.Color,
                Icono = distrito.Icono,
                Activo = distrito.Activo,
                Orden = distrito.Orden,
                CantidadAgentes = 0,
                FechaCreacion = distrito.FechaCreacion
            };

            return CreatedAtAction(nameof(GetById), new { id = distrito.Id }, result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al crear distrito");
            return StatusCode(500, new { message = "Error al crear distrito" });
        }
    }

    /// <summary>
    /// Actualiza un distrito
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<DistritoDto>> Update(string id, UpdateDistritoDto dto)
    {
        try
        {
            var distrito = await _context.Distritos
                .Include(d => d.Region)
                .Include(d => d.Agentes)
                .FirstOrDefaultAsync(d => d.Id == id && d.Status == false);

            if (distrito == null)
            {
                return NotFound(new { message = "Distrito no encontrado" });
            }

            // Verificar que la región existe
            var region = await _context.Regiones.FindAsync(dto.RegionId);
            if (region == null)
            {
                return BadRequest(new { message = "Región no encontrada" });
            }

            distrito.RegionId = dto.RegionId;
            distrito.Codigo = dto.Codigo;
            distrito.Nombre = dto.Nombre;
            distrito.Descripcion = dto.Descripcion;
            distrito.LegacyCode = dto.LegacyCode;
            distrito.Legajo = dto.Legajo;
            distrito.Color = dto.Color;
            distrito.Icono = dto.Icono;
            distrito.Activo = dto.Activo;
            distrito.Orden = dto.Orden;
            distrito.FechaModificacion = DateTime.Now;
            distrito.ModificadoPor = "Sistema";

            await _context.SaveChangesAsync();

            // Recargar región si cambió
            await _context.Entry(distrito).Reference(d => d.Region).LoadAsync();

            var result = new DistritoDto
            {
                Id = distrito.Id,
                RegionId = distrito.RegionId,
                RegionNombre = distrito.Region?.Nombre ?? "N/A",
                Codigo = distrito.Codigo,
                Nombre = distrito.Nombre,
                Descripcion = distrito.Descripcion,
                LegacyCode = distrito.LegacyCode,
                Legajo = distrito.Legajo,
                Color = distrito.Color,
                Icono = distrito.Icono,
                Activo = distrito.Activo,
                Orden = distrito.Orden,
                CantidadAgentes = distrito.Agentes.Count(a => a.Status == false),
                FechaCreacion = distrito.FechaCreacion
            };

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al actualizar distrito con ID: {Id}", id);
            return StatusCode(500, new { message = "Error al actualizar distrito" });
        }
    }

    /// <summary>
    /// Elimina un distrito (soft delete)
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(string id)
    {
        try
        {
            var distrito = await _context.Distritos
                .Include(d => d.Agentes)
                .FirstOrDefaultAsync(d => d.Id == id && d.Status == false);

            if (distrito == null)
            {
                return NotFound(new { message = "Distrito no encontrado" });
            }

            // Verificar si tiene agentes asociados
            if (distrito.Agentes.Any(a => a.Status == false))
            {
                return BadRequest(new { message = "No se puede eliminar un distrito con agentes asociados" });
            }

            distrito.Status = true;
            distrito.FechaModificacion = DateTime.Now;
            distrito.ModificadoPor = "Sistema";

            await _context.SaveChangesAsync();

            return Ok(new { message = "Distrito eliminado exitosamente" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al eliminar distrito con ID: {Id}", id);
            return StatusCode(500, new { message = "Error al eliminar distrito" });
        }
    }
}
