using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PharMind.API.Data;
using PharMind.API.DTOs;
using PharMind.API.Models;

namespace PharMind.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EmpresasController : ControllerBase
{
    private readonly PharMindDbContext _context;
    private readonly ILogger<EmpresasController> _logger;

    public EmpresasController(
        PharMindDbContext context,
        ILogger<EmpresasController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Obtiene todas las empresas
    /// </summary>
    /// <param name="activo">Filtro opcional por estado activo</param>
    /// <returns>Lista de empresas</returns>
    [HttpGet]
    public async Task<ActionResult<List<EmpresaDto>>> GetEmpresas([FromQuery] bool? activo = null)
    {
        try
        {
            var query = _context.Empresas
                .Where(e => e.Status == false); // Excluir eliminadas

            // Aplicar filtros
            if (activo.HasValue)
            {
                query = query.Where(e => e.Activo == activo.Value);
            }

            var empresas = await query
                .OrderBy(e => e.Nombre)
                .ToListAsync();

            // Mapear a DTOs
            var empresaDtos = empresas.Select(e => new EmpresaDto
            {
                Id = e.Id,
                Nombre = e.Nombre,
                RazonSocial = e.RazonSocial,
                CUIT = e.CUIT,
                Telefono = e.Telefono,
                Email = e.Email,
                Direccion = e.Direccion,
                Logo = e.Logo,
                Activo = e.Activo
            }).ToList();

            return Ok(empresaDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener empresas");
            return StatusCode(500, "Error interno del servidor");
        }
    }

    /// <summary>
    /// Obtiene una empresa por ID
    /// </summary>
    /// <param name="id">ID de la empresa</param>
    /// <returns>Empresa encontrada</returns>
    [HttpGet("{id}")]
    public async Task<ActionResult<EmpresaDto>> GetEmpresa(string id)
    {
        try
        {
            var empresa = await _context.Empresas
                .Where(e => e.Status == false)
                .FirstOrDefaultAsync(e => e.Id == id);

            if (empresa == null)
            {
                return NotFound("Empresa no encontrada");
            }

            var empresaDto = new EmpresaDto
            {
                Id = empresa.Id,
                Nombre = empresa.Nombre,
                RazonSocial = empresa.RazonSocial,
                CUIT = empresa.CUIT,
                Telefono = empresa.Telefono,
                Email = empresa.Email,
                Direccion = empresa.Direccion,
                Logo = empresa.Logo,
                Activo = empresa.Activo
            };

            return Ok(empresaDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener empresa {EmpresaId}", id);
            return StatusCode(500, "Error interno del servidor");
        }
    }

    /// <summary>
    /// Crea una nueva empresa
    /// </summary>
    /// <param name="createDto">Datos de la nueva empresa</param>
    /// <returns>Empresa creada</returns>
    [HttpPost]
    public async Task<ActionResult<EmpresaDto>> CreateEmpresa([FromBody] CreateEmpresaDto createDto)
    {
        try
        {
            // Validar que el CUIT no esté duplicado si se proporciona
            if (!string.IsNullOrWhiteSpace(createDto.CUIT))
            {
                var empresaExistente = await _context.Empresas
                    .FirstOrDefaultAsync(e =>
                        e.CUIT == createDto.CUIT &&
                        e.Status == false);

                if (empresaExistente != null)
                {
                    return BadRequest("Ya existe una empresa con ese CUIT");
                }
            }

            // Validar que el nombre no esté duplicado
            var nombreDuplicado = await _context.Empresas
                .FirstOrDefaultAsync(e =>
                    e.Nombre.ToLower() == createDto.Nombre.ToLower() &&
                    e.Status == false);

            if (nombreDuplicado != null)
            {
                return BadRequest("Ya existe una empresa con ese nombre");
            }

            // Crear empresa
            var empresa = new Empresa
            {
                Id = Guid.NewGuid().ToString(),
                Nombre = createDto.Nombre,
                RazonSocial = createDto.RazonSocial,
                CUIT = createDto.CUIT,
                Telefono = createDto.Telefono,
                Email = createDto.Email,
                Direccion = createDto.Direccion,
                Logo = createDto.Logo,
                Activo = true,
                FechaCreacion = DateTime.Now,
                Status = false
            };

            _context.Empresas.Add(empresa);
            await _context.SaveChangesAsync();

            var empresaDto = new EmpresaDto
            {
                Id = empresa.Id,
                Nombre = empresa.Nombre,
                RazonSocial = empresa.RazonSocial,
                CUIT = empresa.CUIT,
                Telefono = empresa.Telefono,
                Email = empresa.Email,
                Direccion = empresa.Direccion,
                Logo = empresa.Logo,
                Activo = empresa.Activo
            };

            return CreatedAtAction(nameof(GetEmpresa), new { id = empresa.Id }, empresaDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al crear empresa");
            return StatusCode(500, "Error interno del servidor");
        }
    }

    /// <summary>
    /// Actualiza una empresa existente
    /// </summary>
    /// <param name="id">ID de la empresa</param>
    /// <param name="updateDto">Datos actualizados de la empresa</param>
    /// <returns>Empresa actualizada</returns>
    [HttpPut("{id}")]
    public async Task<ActionResult<EmpresaDto>> UpdateEmpresa(string id, [FromBody] UpdateEmpresaDto updateDto)
    {
        try
        {
            var empresa = await _context.Empresas
                .FirstOrDefaultAsync(e => e.Id == id && e.Status == false);

            if (empresa == null)
            {
                return NotFound("Empresa no encontrada");
            }

            // Validar que el CUIT no esté duplicado (excepto la misma empresa)
            if (!string.IsNullOrWhiteSpace(updateDto.CUIT))
            {
                var cuitDuplicado = await _context.Empresas
                    .FirstOrDefaultAsync(e =>
                        e.Id != id &&
                        e.CUIT == updateDto.CUIT &&
                        e.Status == false);

                if (cuitDuplicado != null)
                {
                    return BadRequest("Ya existe otra empresa con ese CUIT");
                }
            }

            // Validar que el nombre no esté duplicado (excepto la misma empresa)
            var nombreDuplicado = await _context.Empresas
                .FirstOrDefaultAsync(e =>
                    e.Id != id &&
                    e.Nombre.ToLower() == updateDto.Nombre.ToLower() &&
                    e.Status == false);

            if (nombreDuplicado != null)
            {
                return BadRequest("Ya existe otra empresa con ese nombre");
            }

            // Actualizar datos de la empresa
            empresa.Nombre = updateDto.Nombre;
            empresa.RazonSocial = updateDto.RazonSocial;
            empresa.CUIT = updateDto.CUIT;
            empresa.Telefono = updateDto.Telefono;
            empresa.Email = updateDto.Email;
            empresa.Direccion = updateDto.Direccion;
            empresa.Logo = updateDto.Logo;
            empresa.Activo = updateDto.Activo;
            empresa.FechaModificacion = DateTime.Now;

            await _context.SaveChangesAsync();

            var empresaDto = new EmpresaDto
            {
                Id = empresa.Id,
                Nombre = empresa.Nombre,
                RazonSocial = empresa.RazonSocial,
                CUIT = empresa.CUIT,
                Telefono = empresa.Telefono,
                Email = empresa.Email,
                Direccion = empresa.Direccion,
                Logo = empresa.Logo,
                Activo = empresa.Activo
            };

            return Ok(empresaDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al actualizar empresa {EmpresaId}", id);
            return StatusCode(500, "Error interno del servidor");
        }
    }

    /// <summary>
    /// Elimina una empresa (soft delete)
    /// </summary>
    /// <param name="id">ID de la empresa</param>
    /// <returns>Resultado de la operación</returns>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteEmpresa(string id)
    {
        try
        {
            var empresa = await _context.Empresas
                .FirstOrDefaultAsync(e => e.Id == id && e.Status == false);

            if (empresa == null)
            {
                return NotFound("Empresa no encontrada");
            }

            // Validar que no tenga usuarios asociados
            var tieneUsuarios = await _context.Usuarios
                .AnyAsync(u => u.EmpresaId == id && u.Status == false);

            if (tieneUsuarios)
            {
                return BadRequest("No se puede eliminar la empresa porque tiene usuarios asociados");
            }

            // Validar que no tenga roles asociados
            var tieneRoles = await _context.Roles
                .AnyAsync(r => r.EmpresaId == id && r.Status == false);

            if (tieneRoles)
            {
                return BadRequest("No se puede eliminar la empresa porque tiene roles asociados");
            }

            // Soft delete
            empresa.Status = true;
            empresa.Activo = false;
            empresa.FechaModificacion = DateTime.Now;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Empresa eliminada correctamente" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al eliminar empresa {EmpresaId}", id);
            return StatusCode(500, "Error interno del servidor");
        }
    }
}
