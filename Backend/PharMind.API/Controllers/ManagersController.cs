using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PharMind.API.Data;
using PharMind.API.DTOs;
using PharMind.API.Models;

namespace PharMind.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ManagersController : ControllerBase
{
    private readonly PharMindDbContext _context;
    private readonly ILogger<ManagersController> _logger;

    public ManagersController(
        PharMindDbContext context,
        ILogger<ManagersController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Obtiene todos los managers
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<ManagerListResponse>> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null,
        [FromQuery] bool? activo = null)
    {
        try
        {
            var query = _context.Managers
                .Include(m => m.ManagerRegiones)
                .Include(m => m.ManagerDistritos)
                .Include(m => m.ManagerLineasNegocio)
                .Where(m => m.Status == false);

            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(m =>
                    m.Nombre.Contains(search) ||
                    m.Codigo.Contains(search) ||
                    (m.Apellido != null && m.Apellido.Contains(search)) ||
                    (m.Email != null && m.Email.Contains(search)));
            }

            if (activo.HasValue)
            {
                query = query.Where(m => m.Activo == activo.Value);
            }

            var totalItems = await query.CountAsync();
            var totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);

            var items = await query
                .OrderBy(m => m.Nombre)
                .ThenBy(m => m.Apellido)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var itemDtos = items.Select(m => new ManagerDto
            {
                Id = m.Id,
                Codigo = m.Codigo,
                Nombre = m.Nombre,
                Apellido = m.Apellido,
                Email = m.Email,
                Telefono = m.Telefono,
                Cargo = m.Cargo,
                FechaIngreso = m.FechaIngreso,
                LegacyCode = m.LegacyCode,
                Legajo = m.Legajo,
                Activo = m.Activo,
                Observaciones = m.Observaciones,
                RegionIds = m.ManagerRegiones
                    .Where(mr => mr.Status == false)
                    .Select(mr => mr.RegionId)
                    .ToList(),
                DistritoIds = m.ManagerDistritos
                    .Where(md => md.Status == false)
                    .Select(md => md.DistritoId)
                    .ToList(),
                LineaNegocioIds = m.ManagerLineasNegocio
                    .Where(mln => mln.Status == false)
                    .Select(mln => mln.LineaNegocioId)
                    .ToList(),
                CantidadRegiones = m.ManagerRegiones.Count(mr => mr.Status == false),
                CantidadDistritos = m.ManagerDistritos.Count(md => md.Status == false),
                CantidadLineasNegocio = m.ManagerLineasNegocio.Count(mln => mln.Status == false),
                FechaCreacion = m.FechaCreacion
            }).ToList();

            var response = new ManagerListResponse
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
            _logger.LogError(ex, "Error al obtener managers");
            return StatusCode(500, new { message = "Error al obtener managers" });
        }
    }

    /// <summary>
    /// Obtiene un manager por ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<ManagerDto>> GetById(string id)
    {
        try
        {
            var manager = await _context.Managers
                .Include(m => m.ManagerRegiones)
                .Include(m => m.ManagerDistritos)
                .Include(m => m.ManagerLineasNegocio)
                .FirstOrDefaultAsync(m => m.Id == id && m.Status == false);

            if (manager == null)
            {
                return NotFound(new { message = "Manager no encontrado" });
            }

            var dto = new ManagerDto
            {
                Id = manager.Id,
                Codigo = manager.Codigo,
                Nombre = manager.Nombre,
                Apellido = manager.Apellido,
                Email = manager.Email,
                Telefono = manager.Telefono,
                Cargo = manager.Cargo,
                FechaIngreso = manager.FechaIngreso,
                LegacyCode = manager.LegacyCode,
                Legajo = manager.Legajo,
                Activo = manager.Activo,
                Observaciones = manager.Observaciones,
                RegionIds = manager.ManagerRegiones
                    .Where(mr => mr.Status == false)
                    .Select(mr => mr.RegionId)
                    .ToList(),
                DistritoIds = manager.ManagerDistritos
                    .Where(md => md.Status == false)
                    .Select(md => md.DistritoId)
                    .ToList(),
                LineaNegocioIds = manager.ManagerLineasNegocio
                    .Where(mln => mln.Status == false)
                    .Select(mln => mln.LineaNegocioId)
                    .ToList(),
                CantidadRegiones = manager.ManagerRegiones.Count(mr => mr.Status == false),
                CantidadDistritos = manager.ManagerDistritos.Count(md => md.Status == false),
                CantidadLineasNegocio = manager.ManagerLineasNegocio.Count(mln => mln.Status == false),
                FechaCreacion = manager.FechaCreacion
            };

            return Ok(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener manager con ID: {Id}", id);
            return StatusCode(500, new { message = "Error al obtener manager" });
        }
    }

    /// <summary>
    /// Crea un nuevo manager
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ManagerDto>> Create(CreateManagerDto dto)
    {
        try
        {
            var manager = new Manager
            {
                Codigo = dto.Codigo,
                Nombre = dto.Nombre,
                Apellido = dto.Apellido,
                Email = dto.Email,
                Telefono = dto.Telefono,
                Cargo = dto.Cargo,
                FechaIngreso = dto.FechaIngreso,
                LegacyCode = dto.LegacyCode,
                Legajo = dto.Legajo,
                Observaciones = dto.Observaciones,
                Activo = true,
                Status = false,
                FechaCreacion = DateTime.Now,
                CreadoPor = "Sistema"
            };

            _context.Managers.Add(manager);
            await _context.SaveChangesAsync();

            // Agregar relaciones con regiones
            foreach (var regionId in dto.RegionIds)
            {
                var managerRegion = new ManagerRegione
                {
                    ManagerId = manager.Id,
                    RegionId = regionId,
                    Status = false,
                    FechaCreacion = DateTime.Now,
                    CreadoPor = "Sistema"
                };
                _context.ManagerRegiones.Add(managerRegion);
            }

            // Agregar relaciones con distritos
            foreach (var distritoId in dto.DistritoIds)
            {
                var managerDistrito = new ManagerDistrito
                {
                    ManagerId = manager.Id,
                    DistritoId = distritoId,
                    Status = false,
                    FechaCreacion = DateTime.Now,
                    CreadoPor = "Sistema"
                };
                _context.ManagerDistritos.Add(managerDistrito);
            }

            // Agregar relaciones con líneas de negocio
            foreach (var lineaNegocioId in dto.LineaNegocioIds)
            {
                var managerLineaNegocio = new ManagerLineasNegocio
                {
                    ManagerId = manager.Id,
                    LineaNegocioId = lineaNegocioId,
                    Status = false,
                    FechaCreacion = DateTime.Now,
                    CreadoPor = "Sistema"
                };
                _context.ManagerLineasNegocio.Add(managerLineaNegocio);
            }

            await _context.SaveChangesAsync();

            // Recargar con datos relacionados
            await _context.Entry(manager).Collection(m => m.ManagerRegiones).LoadAsync();
            await _context.Entry(manager).Collection(m => m.ManagerDistritos).LoadAsync();
            await _context.Entry(manager).Collection(m => m.ManagerLineasNegocio).LoadAsync();

            var result = new ManagerDto
            {
                Id = manager.Id,
                Codigo = manager.Codigo,
                Nombre = manager.Nombre,
                Apellido = manager.Apellido,
                Email = manager.Email,
                Telefono = manager.Telefono,
                Cargo = manager.Cargo,
                FechaIngreso = manager.FechaIngreso,
                LegacyCode = manager.LegacyCode,
                Legajo = manager.Legajo,
                Activo = manager.Activo,
                Observaciones = manager.Observaciones,
                RegionIds = dto.RegionIds,
                DistritoIds = dto.DistritoIds,
                LineaNegocioIds = dto.LineaNegocioIds,
                CantidadRegiones = dto.RegionIds.Count,
                CantidadDistritos = dto.DistritoIds.Count,
                CantidadLineasNegocio = dto.LineaNegocioIds.Count,
                FechaCreacion = manager.FechaCreacion
            };

            return CreatedAtAction(nameof(GetById), new { id = manager.Id }, result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al crear manager");
            return StatusCode(500, new { message = "Error al crear manager" });
        }
    }

    /// <summary>
    /// Actualiza un manager
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<ManagerDto>> Update(string id, UpdateManagerDto dto)
    {
        try
        {
            var manager = await _context.Managers
                .Include(m => m.ManagerRegiones)
                .Include(m => m.ManagerDistritos)
                .Include(m => m.ManagerLineasNegocio)
                .FirstOrDefaultAsync(m => m.Id == id && m.Status == false);

            if (manager == null)
            {
                return NotFound(new { message = "Manager no encontrado" });
            }

            manager.Codigo = dto.Codigo;
            manager.Nombre = dto.Nombre;
            manager.Apellido = dto.Apellido;
            manager.Email = dto.Email;
            manager.Telefono = dto.Telefono;
            manager.Cargo = dto.Cargo;
            manager.FechaIngreso = dto.FechaIngreso;
            manager.LegacyCode = dto.LegacyCode;
            manager.Legajo = dto.Legajo;
            manager.Activo = dto.Activo;
            manager.Observaciones = dto.Observaciones;
            manager.FechaModificacion = DateTime.Now;
            manager.ModificadoPor = "Sistema";

            // Actualizar relaciones con regiones
            // Eliminar las relaciones que ya no están
            var regionesActuales = manager.ManagerRegiones.Where(mr => mr.Status == false).ToList();
            foreach (var mr in regionesActuales)
            {
                if (!dto.RegionIds.Contains(mr.RegionId))
                {
                    mr.Status = true;
                }
            }

            // Agregar nuevas relaciones
            var regionIdsActuales = regionesActuales.Select(mr => mr.RegionId).ToList();
            foreach (var regionId in dto.RegionIds)
            {
                if (!regionIdsActuales.Contains(regionId))
                {
                    var managerRegion = new ManagerRegione
                    {
                        ManagerId = manager.Id,
                        RegionId = regionId,
                        Status = false,
                        FechaCreacion = DateTime.Now,
                        CreadoPor = "Sistema"
                    };
                    _context.ManagerRegiones.Add(managerRegion);
                }
            }

            // Actualizar relaciones con distritos
            var distritosActuales = manager.ManagerDistritos.Where(md => md.Status == false).ToList();
            foreach (var md in distritosActuales)
            {
                if (!dto.DistritoIds.Contains(md.DistritoId))
                {
                    md.Status = true;
                }
            }

            var distritoIdsActuales = distritosActuales.Select(md => md.DistritoId).ToList();
            foreach (var distritoId in dto.DistritoIds)
            {
                if (!distritoIdsActuales.Contains(distritoId))
                {
                    var managerDistrito = new ManagerDistrito
                    {
                        ManagerId = manager.Id,
                        DistritoId = distritoId,
                        Status = false,
                        FechaCreacion = DateTime.Now,
                        CreadoPor = "Sistema"
                    };
                    _context.ManagerDistritos.Add(managerDistrito);
                }
            }

            // Actualizar relaciones con líneas de negocio
            var lineasActuales = manager.ManagerLineasNegocio.Where(mln => mln.Status == false).ToList();
            foreach (var mln in lineasActuales)
            {
                if (!dto.LineaNegocioIds.Contains(mln.LineaNegocioId))
                {
                    mln.Status = true;
                }
            }

            var lineaIdsActuales = lineasActuales.Select(mln => mln.LineaNegocioId).ToList();
            foreach (var lineaNegocioId in dto.LineaNegocioIds)
            {
                if (!lineaIdsActuales.Contains(lineaNegocioId))
                {
                    var managerLineaNegocio = new ManagerLineasNegocio
                    {
                        ManagerId = manager.Id,
                        LineaNegocioId = lineaNegocioId,
                        Status = false,
                        FechaCreacion = DateTime.Now,
                        CreadoPor = "Sistema"
                    };
                    _context.ManagerLineasNegocio.Add(managerLineaNegocio);
                }
            }

            await _context.SaveChangesAsync();

            // Recargar relaciones
            await _context.Entry(manager).Collection(m => m.ManagerRegiones).LoadAsync();
            await _context.Entry(manager).Collection(m => m.ManagerDistritos).LoadAsync();
            await _context.Entry(manager).Collection(m => m.ManagerLineasNegocio).LoadAsync();

            var result = new ManagerDto
            {
                Id = manager.Id,
                Codigo = manager.Codigo,
                Nombre = manager.Nombre,
                Apellido = manager.Apellido,
                Email = manager.Email,
                Telefono = manager.Telefono,
                Cargo = manager.Cargo,
                FechaIngreso = manager.FechaIngreso,
                LegacyCode = manager.LegacyCode,
                Legajo = manager.Legajo,
                Activo = manager.Activo,
                Observaciones = manager.Observaciones,
                RegionIds = manager.ManagerRegiones
                    .Where(mr => mr.Status == false)
                    .Select(mr => mr.RegionId)
                    .ToList(),
                DistritoIds = manager.ManagerDistritos
                    .Where(md => md.Status == false)
                    .Select(md => md.DistritoId)
                    .ToList(),
                LineaNegocioIds = manager.ManagerLineasNegocio
                    .Where(mln => mln.Status == false)
                    .Select(mln => mln.LineaNegocioId)
                    .ToList(),
                CantidadRegiones = manager.ManagerRegiones.Count(mr => mr.Status == false),
                CantidadDistritos = manager.ManagerDistritos.Count(md => md.Status == false),
                CantidadLineasNegocio = manager.ManagerLineasNegocio.Count(mln => mln.Status == false),
                FechaCreacion = manager.FechaCreacion
            };

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al actualizar manager con ID: {Id}", id);
            return StatusCode(500, new { message = "Error al actualizar manager" });
        }
    }

    /// <summary>
    /// Elimina un manager (soft delete)
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(string id)
    {
        try
        {
            var manager = await _context.Managers
                .Include(m => m.ManagerRegiones)
                .Include(m => m.ManagerDistritos)
                .Include(m => m.ManagerLineasNegocio)
                .FirstOrDefaultAsync(m => m.Id == id && m.Status == false);

            if (manager == null)
            {
                return NotFound(new { message = "Manager no encontrado" });
            }

            // Soft delete del manager y todas sus relaciones
            manager.Status = true;
            manager.FechaModificacion = DateTime.Now;
            manager.ModificadoPor = "Sistema";

            foreach (var mr in manager.ManagerRegiones.Where(mr => mr.Status == false))
            {
                mr.Status = true;
            }

            foreach (var md in manager.ManagerDistritos.Where(md => md.Status == false))
            {
                md.Status = true;
            }

            foreach (var mln in manager.ManagerLineasNegocio.Where(mln => mln.Status == false))
            {
                mln.Status = true;
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Manager eliminado exitosamente" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al eliminar manager con ID: {Id}", id);
            return StatusCode(500, new { message = "Error al eliminar manager" });
        }
    }
}
