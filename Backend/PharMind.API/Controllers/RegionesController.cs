using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PharMind.API.Data;
using PharMind.API.DTOs;
using PharMind.API.Models;

namespace PharMind.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RegionesController : ControllerBase
{
    private readonly PharMindDbContext _context;
    private readonly ILogger<RegionesController> _logger;

    public RegionesController(
        PharMindDbContext context,
        ILogger<RegionesController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Obtiene todas las regiones
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<RegionListResponse>> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null,
        [FromQuery] bool? activo = null)
    {
        try
        {
            var query = _context.Regiones
                .Include(r => r.Distritos)
                    .ThenInclude(d => d.Agentes)
                .Where(r => r.Status == false);

            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(r =>
                    r.Nombre.Contains(search) ||
                    r.Codigo.Contains(search));
            }

            if (activo.HasValue)
            {
                query = query.Where(r => r.Activo == activo.Value);
            }

            var totalItems = await query.CountAsync();
            var totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);

            var items = await query
                .OrderBy(r => r.Orden)
                .ThenBy(r => r.Nombre)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var itemDtos = items.Select(r => new RegionDto
            {
                Id = r.Id,
                Codigo = r.Codigo,
                Nombre = r.Nombre,
                Descripcion = r.Descripcion,
                LegacyCode = r.LegacyCode,
                Legajo = r.Legajo,
                Color = r.Color,
                Icono = r.Icono,
                Activo = r.Activo,
                Orden = r.Orden,
                CantidadDistritos = r.Distritos.Count(d => d.Status == false),
                CantidadAgentes = r.Distritos
                    .Where(d => d.Status == false)
                    .SelectMany(d => d.Agentes)
                    .Count(a => a.Status == false),
                FechaCreacion = r.FechaCreacion
            }).ToList();

            var response = new RegionListResponse
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
            _logger.LogError(ex, "Error al obtener regiones");
            return StatusCode(500, new { message = "Error al obtener regiones" });
        }
    }

    /// <summary>
    /// Obtiene una región por ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<RegionDto>> GetById(string id)
    {
        try
        {
            var region = await _context.Regiones
                .Include(r => r.Distritos)
                    .ThenInclude(d => d.Agentes)
                .FirstOrDefaultAsync(r => r.Id == id && r.Status == false);

            if (region == null)
            {
                return NotFound(new { message = "Región no encontrada" });
            }

            var dto = new RegionDto
            {
                Id = region.Id,
                Codigo = region.Codigo,
                Nombre = region.Nombre,
                Descripcion = region.Descripcion,
                LegacyCode = region.LegacyCode,
                Legajo = region.Legajo,
                Color = region.Color,
                Icono = region.Icono,
                Activo = region.Activo,
                Orden = region.Orden,
                CantidadDistritos = region.Distritos.Count(d => d.Status == false),
                CantidadAgentes = region.Distritos
                    .Where(d => d.Status == false)
                    .SelectMany(d => d.Agentes)
                    .Count(a => a.Status == false),
                FechaCreacion = region.FechaCreacion
            };

            return Ok(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener región con ID: {Id}", id);
            return StatusCode(500, new { message = "Error al obtener región" });
        }
    }

    /// <summary>
    /// Crea una nueva región
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<RegionDto>> Create(CreateRegionDto dto)
    {
        try
        {
            var region = new Regiones
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

            _context.Regiones.Add(region);
            await _context.SaveChangesAsync();

            var result = new RegionDto
            {
                Id = region.Id,
                Codigo = region.Codigo,
                Nombre = region.Nombre,
                Descripcion = region.Descripcion,
                LegacyCode = region.LegacyCode,
                Legajo = region.Legajo,
                Color = region.Color,
                Icono = region.Icono,
                Activo = region.Activo,
                Orden = region.Orden,
                CantidadDistritos = 0,
                CantidadAgentes = 0,
                FechaCreacion = region.FechaCreacion
            };

            return CreatedAtAction(nameof(GetById), new { id = region.Id }, result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al crear región");
            return StatusCode(500, new { message = "Error al crear región" });
        }
    }

    /// <summary>
    /// Actualiza una región
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<RegionDto>> Update(string id, UpdateRegionDto dto)
    {
        try
        {
            var region = await _context.Regiones
                .Include(r => r.Distritos)
                    .ThenInclude(d => d.Agentes)
                .FirstOrDefaultAsync(r => r.Id == id && r.Status == false);

            if (region == null)
            {
                return NotFound(new { message = "Región no encontrada" });
            }

            region.Codigo = dto.Codigo;
            region.Nombre = dto.Nombre;
            region.Descripcion = dto.Descripcion;
            region.LegacyCode = dto.LegacyCode;
            region.Legajo = dto.Legajo;
            region.Color = dto.Color;
            region.Icono = dto.Icono;
            region.Activo = dto.Activo;
            region.Orden = dto.Orden;
            region.FechaModificacion = DateTime.Now;
            region.ModificadoPor = "Sistema";

            await _context.SaveChangesAsync();

            var result = new RegionDto
            {
                Id = region.Id,
                Codigo = region.Codigo,
                Nombre = region.Nombre,
                Descripcion = region.Descripcion,
                LegacyCode = region.LegacyCode,
                Legajo = region.Legajo,
                Color = region.Color,
                Icono = region.Icono,
                Activo = region.Activo,
                Orden = region.Orden,
                CantidadDistritos = region.Distritos.Count(d => d.Status == false),
                CantidadAgentes = region.Distritos
                    .Where(d => d.Status == false)
                    .SelectMany(d => d.Agentes)
                    .Count(a => a.Status == false),
                FechaCreacion = region.FechaCreacion
            };

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al actualizar región con ID: {Id}", id);
            return StatusCode(500, new { message = "Error al actualizar región" });
        }
    }

    /// <summary>
    /// Elimina una región (soft delete)
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(string id)
    {
        try
        {
            var region = await _context.Regiones
                .Include(r => r.Distritos)
                .FirstOrDefaultAsync(r => r.Id == id && r.Status == false);

            if (region == null)
            {
                return NotFound(new { message = "Región no encontrada" });
            }

            // Verificar si tiene distritos asociados
            if (region.Distritos.Any(d => d.Status == false))
            {
                return BadRequest(new { message = "No se puede eliminar una región con distritos asociados" });
            }

            region.Status = true;
            region.FechaModificacion = DateTime.Now;
            region.ModificadoPor = "Sistema";

            await _context.SaveChangesAsync();

            return Ok(new { message = "Región eliminada exitosamente" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al eliminar región con ID: {Id}", id);
            return StatusCode(500, new { message = "Error al eliminar región" });
        }
    }
}
