using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PharMind.API.Data;
using PharMind.API.DTOs;
using PharMind.API.Models;

namespace PharMind.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RolesController : ControllerBase
{
    private readonly PharMindDbContext _context;
    private readonly ILogger<RolesController> _logger;

    public RolesController(
        PharMindDbContext context,
        ILogger<RolesController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Obtiene todos los roles
    /// </summary>
    /// <param name="empresaId">Filtro opcional por empresa</param>
    /// <param name="activo">Filtro opcional por estado activo</param>
    /// <returns>Lista de roles</returns>
    [HttpGet]
    public async Task<ActionResult<List<RolDto>>> GetRoles(
        [FromQuery] string? empresaId = null,
        [FromQuery] bool? activo = null)
    {
        try
        {
            var query = _context.Roles
                .Include(r => r.Empresa)
                .Include(r => r.UsuarioRoles)
                .Include(r => r.RolModulos)
                    .ThenInclude(rm => rm.Modulo)
                .Where(r => r.Status == false); // Excluir eliminados

            // Aplicar filtros
            if (!string.IsNullOrWhiteSpace(empresaId))
            {
                query = query.Where(r => r.EmpresaId == empresaId);
            }

            if (activo.HasValue)
            {
                query = query.Where(r => r.Activo == activo.Value);
            }

            var roles = await query
                .OrderBy(r => r.Nombre)
                .ToListAsync();

            // Mapear a DTOs
            var rolDtos = roles.Select(r => new RolDto
            {
                Id = r.Id,
                Nombre = r.Nombre,
                Descripcion = r.Descripcion,
                EmpresaId = r.EmpresaId,
                EsSistema = r.EsSistema,
                Activo = r.Activo,
                UsuariosCount = r.UsuarioRoles.Count,
                Permisos = r.RolModulos.Select(rm => new PermisoModuloDto
                {
                    ModuloId = rm.ModuloId,
                    ModuloNombre = rm.Modulo?.Nombre ?? "",
                    NivelAcceso = rm.NivelAcceso,
                    PuedeVer = rm.PuedeVer,
                    PuedeCrear = rm.PuedeCrear,
                    PuedeEditar = rm.PuedeEditar,
                    PuedeEliminar = rm.PuedeEliminar,
                    PuedeExportar = rm.PuedeExportar,
                    PuedeImportar = rm.PuedeImportar,
                    PuedeAprobar = rm.PuedeAprobar
                }).ToList()
            }).ToList();

            return Ok(rolDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener roles");
            return StatusCode(500, "Error interno del servidor");
        }
    }

    /// <summary>
    /// Obtiene un rol por ID (incluye permisos)
    /// </summary>
    /// <param name="id">ID del rol</param>
    /// <returns>Rol encontrado con sus permisos</returns>
    [HttpGet("{id}")]
    public async Task<ActionResult<RolDto>> GetRol(string id)
    {
        try
        {
            var rol = await _context.Roles
                .Include(r => r.Empresa)
                .Include(r => r.UsuarioRoles)
                .Include(r => r.RolModulos)
                    .ThenInclude(rm => rm.Modulo)
                .Where(r => r.Status == false)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (rol == null)
            {
                return NotFound("Rol no encontrado");
            }

            var rolDto = new RolDto
            {
                Id = rol.Id,
                Nombre = rol.Nombre,
                Descripcion = rol.Descripcion,
                EmpresaId = rol.EmpresaId,
                EsSistema = rol.EsSistema,
                Activo = rol.Activo,
                UsuariosCount = rol.UsuarioRoles.Count,
                Permisos = rol.RolModulos.Select(rm => new PermisoModuloDto
                {
                    ModuloId = rm.ModuloId,
                    ModuloNombre = rm.Modulo?.Nombre ?? "",
                    NivelAcceso = rm.NivelAcceso,
                    PuedeVer = rm.PuedeVer,
                    PuedeCrear = rm.PuedeCrear,
                    PuedeEditar = rm.PuedeEditar,
                    PuedeEliminar = rm.PuedeEliminar,
                    PuedeExportar = rm.PuedeExportar,
                    PuedeImportar = rm.PuedeImportar,
                    PuedeAprobar = rm.PuedeAprobar
                }).ToList()
            };

            return Ok(rolDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener rol {RolId}", id);
            return StatusCode(500, "Error interno del servidor");
        }
    }

    /// <summary>
    /// Crea un nuevo rol
    /// </summary>
    /// <param name="createDto">Datos del nuevo rol</param>
    /// <returns>Rol creado</returns>
    [HttpPost]
    public async Task<ActionResult<RolDto>> CreateRol([FromBody] CreateRolDto createDto)
    {
        try
        {
            // Validar que la empresa exista
            var empresa = await _context.Empresas.FindAsync(createDto.EmpresaId);
            if (empresa == null || empresa.Status == true)
            {
                return BadRequest("Empresa no encontrada o inactiva");
            }

            // Validar que el nombre del rol no exista en la misma empresa
            var rolExistente = await _context.Roles
                .FirstOrDefaultAsync(r =>
                    r.EmpresaId == createDto.EmpresaId &&
                    r.Nombre.ToLower() == createDto.Nombre.ToLower() &&
                    r.Status == false);

            if (rolExistente != null)
            {
                return BadRequest("Ya existe un rol con ese nombre en la empresa");
            }

            // Validar módulos si se proporcionan permisos
            if (createDto.Permisos != null && createDto.Permisos.Any())
            {
                var moduloIds = createDto.Permisos.Select(p => p.ModuloId).ToList();
                var modulosExisten = await _context.Modulos
                    .Where(m => moduloIds.Contains(m.Id) && m.Status == false)
                    .CountAsync();

                if (modulosExisten != moduloIds.Count)
                {
                    return BadRequest("Uno o más módulos no son válidos");
                }
            }

            // Crear rol
            var rol = new Rol
            {
                Id = Guid.NewGuid().ToString(),
                Nombre = createDto.Nombre,
                Descripcion = createDto.Descripcion,
                EmpresaId = createDto.EmpresaId,
                EsSistema = false, // Los roles creados por usuarios no son de sistema
                Activo = true,
                FechaCreacion = DateTime.Now,
                Status = false
            };

            _context.Roles.Add(rol);

            // Asignar permisos
            if (createDto.Permisos != null && createDto.Permisos.Any())
            {
                foreach (var permiso in createDto.Permisos)
                {
                    var rolModulo = new RolModulo
                    {
                        Id = Guid.NewGuid().ToString(),
                        RolId = rol.Id,
                        ModuloId = permiso.ModuloId,
                        NivelAcceso = permiso.NivelAcceso,
                        PuedeVer = permiso.PuedeVer,
                        PuedeCrear = permiso.PuedeCrear,
                        PuedeEditar = permiso.PuedeEditar,
                        PuedeEliminar = permiso.PuedeEliminar,
                        PuedeExportar = permiso.PuedeExportar,
                        PuedeImportar = permiso.PuedeImportar,
                        PuedeAprobar = permiso.PuedeAprobar,
                        FechaCreacion = DateTime.Now,
                        Status = false
                    };
                    _context.RolModulos.Add(rolModulo);
                }
            }

            await _context.SaveChangesAsync();

            // Cargar el rol completo con relaciones
            var rolCompleto = await _context.Roles
                .Include(r => r.Empresa)
                .Include(r => r.UsuarioRoles)
                .Include(r => r.RolModulos)
                    .ThenInclude(rm => rm.Modulo)
                .FirstOrDefaultAsync(r => r.Id == rol.Id);

            if (rolCompleto == null)
            {
                return StatusCode(500, "Error al crear rol");
            }

            var rolDto = new RolDto
            {
                Id = rolCompleto.Id,
                Nombre = rolCompleto.Nombre,
                Descripcion = rolCompleto.Descripcion,
                EmpresaId = rolCompleto.EmpresaId,
                EsSistema = rolCompleto.EsSistema,
                Activo = rolCompleto.Activo,
                UsuariosCount = rolCompleto.UsuarioRoles.Count,
                Permisos = rolCompleto.RolModulos.Select(rm => new PermisoModuloDto
                {
                    ModuloId = rm.ModuloId,
                    ModuloNombre = rm.Modulo?.Nombre ?? "",
                    NivelAcceso = rm.NivelAcceso,
                    PuedeVer = rm.PuedeVer,
                    PuedeCrear = rm.PuedeCrear,
                    PuedeEditar = rm.PuedeEditar,
                    PuedeEliminar = rm.PuedeEliminar,
                    PuedeExportar = rm.PuedeExportar,
                    PuedeImportar = rm.PuedeImportar,
                    PuedeAprobar = rm.PuedeAprobar
                }).ToList()
            };

            return CreatedAtAction(nameof(GetRol), new { id = rol.Id }, rolDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al crear rol");
            return StatusCode(500, "Error interno del servidor");
        }
    }

    /// <summary>
    /// Actualiza un rol existente
    /// </summary>
    /// <param name="id">ID del rol</param>
    /// <param name="updateDto">Datos actualizados del rol</param>
    /// <returns>Rol actualizado</returns>
    [HttpPut("{id}")]
    public async Task<ActionResult<RolDto>> UpdateRol(string id, [FromBody] UpdateRolDto updateDto)
    {
        try
        {
            var rol = await _context.Roles
                .Include(r => r.RolModulos)
                .FirstOrDefaultAsync(r => r.Id == id && r.Status == false);

            if (rol == null)
            {
                return NotFound("Rol no encontrado");
            }

            // No permitir editar roles de sistema
            if (rol.EsSistema)
            {
                return BadRequest("No se pueden editar roles de sistema");
            }

            // Validar que el nombre no esté duplicado (excepto el mismo rol)
            var rolDuplicado = await _context.Roles
                .FirstOrDefaultAsync(r =>
                    r.Id != id &&
                    r.EmpresaId == rol.EmpresaId &&
                    r.Nombre.ToLower() == updateDto.Nombre.ToLower() &&
                    r.Status == false);

            if (rolDuplicado != null)
            {
                return BadRequest("Ya existe otro rol con ese nombre en la empresa");
            }

            // Validar módulos si se proporcionan permisos
            if (updateDto.Permisos != null && updateDto.Permisos.Any())
            {
                var moduloIds = updateDto.Permisos.Select(p => p.ModuloId).ToList();
                var modulosExisten = await _context.Modulos
                    .Where(m => moduloIds.Contains(m.Id) && m.Status == false)
                    .CountAsync();

                if (modulosExisten != moduloIds.Count)
                {
                    return BadRequest("Uno o más módulos no son válidos");
                }
            }

            // Actualizar datos del rol
            rol.Nombre = updateDto.Nombre;
            rol.Descripcion = updateDto.Descripcion;
            rol.Activo = updateDto.Activo;
            rol.FechaModificacion = DateTime.Now;

            // Actualizar permisos
            if (updateDto.Permisos != null)
            {
                // Eliminar permisos actuales
                var permisosActuales = rol.RolModulos.ToList();
                _context.RolModulos.RemoveRange(permisosActuales);

                // Agregar nuevos permisos
                foreach (var permiso in updateDto.Permisos)
                {
                    var rolModulo = new RolModulo
                    {
                        Id = Guid.NewGuid().ToString(),
                        RolId = rol.Id,
                        ModuloId = permiso.ModuloId,
                        NivelAcceso = permiso.NivelAcceso,
                        PuedeVer = permiso.PuedeVer,
                        PuedeCrear = permiso.PuedeCrear,
                        PuedeEditar = permiso.PuedeEditar,
                        PuedeEliminar = permiso.PuedeEliminar,
                        PuedeExportar = permiso.PuedeExportar,
                        PuedeImportar = permiso.PuedeImportar,
                        PuedeAprobar = permiso.PuedeAprobar,
                        FechaCreacion = DateTime.Now,
                        Status = false
                    };
                    _context.RolModulos.Add(rolModulo);
                }
            }

            await _context.SaveChangesAsync();

            // Recargar con todas las relaciones
            var rolActualizado = await _context.Roles
                .Include(r => r.Empresa)
                .Include(r => r.UsuarioRoles)
                .Include(r => r.RolModulos)
                    .ThenInclude(rm => rm.Modulo)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (rolActualizado == null)
            {
                return StatusCode(500, "Error al actualizar rol");
            }

            var rolDto = new RolDto
            {
                Id = rolActualizado.Id,
                Nombre = rolActualizado.Nombre,
                Descripcion = rolActualizado.Descripcion,
                EmpresaId = rolActualizado.EmpresaId,
                EsSistema = rolActualizado.EsSistema,
                Activo = rolActualizado.Activo,
                UsuariosCount = rolActualizado.UsuarioRoles.Count,
                Permisos = rolActualizado.RolModulos.Select(rm => new PermisoModuloDto
                {
                    ModuloId = rm.ModuloId,
                    ModuloNombre = rm.Modulo?.Nombre ?? "",
                    NivelAcceso = rm.NivelAcceso,
                    PuedeVer = rm.PuedeVer,
                    PuedeCrear = rm.PuedeCrear,
                    PuedeEditar = rm.PuedeEditar,
                    PuedeEliminar = rm.PuedeEliminar,
                    PuedeExportar = rm.PuedeExportar,
                    PuedeImportar = rm.PuedeImportar,
                    PuedeAprobar = rm.PuedeAprobar
                }).ToList()
            };

            return Ok(rolDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al actualizar rol {RolId}", id);
            return StatusCode(500, "Error interno del servidor");
        }
    }

    /// <summary>
    /// Elimina un rol (soft delete)
    /// </summary>
    /// <param name="id">ID del rol</param>
    /// <returns>Resultado de la operación</returns>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteRol(string id)
    {
        try
        {
            var rol = await _context.Roles
                .Include(r => r.UsuarioRoles)
                .FirstOrDefaultAsync(r => r.Id == id && r.Status == false);

            if (rol == null)
            {
                return NotFound("Rol no encontrado");
            }

            // Validar que no sea un rol de sistema
            if (rol.EsSistema)
            {
                return BadRequest("No se pueden eliminar roles de sistema");
            }

            // Validar que no tenga usuarios asignados
            if (rol.UsuarioRoles.Any())
            {
                return BadRequest($"No se puede eliminar el rol porque tiene {rol.UsuarioRoles.Count} usuario(s) asignado(s)");
            }

            // Soft delete
            rol.Status = true;
            rol.Activo = false;
            rol.FechaModificacion = DateTime.Now;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Rol eliminado correctamente" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al eliminar rol {RolId}", id);
            return StatusCode(500, "Error interno del servidor");
        }
    }
}
