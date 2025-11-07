using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PharMind.API.Data;
using PharMind.API.DTOs;
using PharMind.API.Models;

namespace PharMind.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ModulosController : ControllerBase
{
    private readonly PharMindDbContext _context;
    private readonly ILogger<ModulosController> _logger;

    public ModulosController(
        PharMindDbContext context,
        ILogger<ModulosController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Obtiene todos los módulos (incluye submódulos)
    /// </summary>
    /// <param name="includeInactive">Incluir módulos inactivos</param>
    /// <returns>Lista de módulos con sus submódulos</returns>
    [HttpGet]
    public async Task<ActionResult<List<ModuloDto>>> GetModulos([FromQuery] bool includeInactive = false)
    {
        try
        {
            var query = _context.Modulos
                .Include(m => m.SubModulos.Where(sm => sm.Status == false))
                .Where(m => m.Status == false && m.ModuloPadreId == null); // Solo módulos principales

            if (!includeInactive)
            {
                query = query.Where(m => m.Activo);
            }

            var modulos = await query
                .OrderBy(m => m.OrdenMenu)
                .ToListAsync();

            // Mapear a DTOs recursivamente
            var moduloDtos = modulos.Select(m => MapToDto(m, includeInactive)).ToList();

            return Ok(moduloDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener módulos");
            return StatusCode(500, "Error interno del servidor");
        }
    }

    /// <summary>
    /// Obtiene un módulo por ID
    /// </summary>
    /// <param name="id">ID del módulo</param>
    /// <returns>Módulo encontrado con sus submódulos</returns>
    [HttpGet("{id}")]
    public async Task<ActionResult<ModuloDto>> GetModulo(string id)
    {
        try
        {
            var modulo = await _context.Modulos
                .Include(m => m.SubModulos.Where(sm => sm.Status == false))
                .Include(m => m.ModuloPadre)
                .Where(m => m.Status == false)
                .FirstOrDefaultAsync(m => m.Id == id);

            if (modulo == null)
            {
                return NotFound("Módulo no encontrado");
            }

            var moduloDto = MapToDto(modulo, true);

            return Ok(moduloDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener módulo {ModuloId}", id);
            return StatusCode(500, "Error interno del servidor");
        }
    }

    /// <summary>
    /// Crea un nuevo módulo
    /// </summary>
    /// <param name="createDto">Datos del nuevo módulo</param>
    /// <returns>Módulo creado</returns>
    [HttpPost]
    public async Task<ActionResult<ModuloDto>> CreateModulo([FromBody] CreateModuloDto createDto)
    {
        try
        {
            // Validar que el nombre no esté duplicado
            var moduloExistente = await _context.Modulos
                .FirstOrDefaultAsync(m =>
                    m.Nombre.ToLower() == createDto.Nombre.ToLower() &&
                    m.Status == false);

            if (moduloExistente != null)
            {
                return BadRequest("Ya existe un módulo con ese nombre");
            }

            // Si tiene módulo padre, validar que exista
            if (!string.IsNullOrWhiteSpace(createDto.ModuloPadreId))
            {
                var moduloPadre = await _context.Modulos
                    .FirstOrDefaultAsync(m => m.Id == createDto.ModuloPadreId && m.Status == false);

                if (moduloPadre == null)
                {
                    return BadRequest("El módulo padre no existe");
                }

                // Validar que el módulo padre no tenga a su vez un padre (máximo 2 niveles)
                if (moduloPadre.ModuloPadreId != null)
                {
                    return BadRequest("No se permiten más de 2 niveles de módulos");
                }
            }

            // Crear módulo
            var modulo = new Modulo
            {
                Id = Guid.NewGuid().ToString(),
                Nombre = createDto.Nombre,
                Descripcion = createDto.Descripcion,
                Icono = createDto.Icono,
                Ruta = createDto.Ruta,
                OrdenMenu = createDto.Orden,
                ModuloPadreId = createDto.ModuloPadreId,
                Activo = true,
                FechaCreacion = DateTime.Now,
                Status = false
            };

            _context.Modulos.Add(modulo);
            await _context.SaveChangesAsync();

            // Cargar el módulo completo con relaciones
            var moduloCompleto = await _context.Modulos
                .Include(m => m.SubModulos.Where(sm => sm.Status == false))
                .Include(m => m.ModuloPadre)
                .FirstOrDefaultAsync(m => m.Id == modulo.Id);

            if (moduloCompleto == null)
            {
                return StatusCode(500, "Error al crear módulo");
            }

            var moduloDto = MapToDto(moduloCompleto, true);

            return CreatedAtAction(nameof(GetModulo), new { id = modulo.Id }, moduloDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al crear módulo");
            return StatusCode(500, "Error interno del servidor");
        }
    }

    /// <summary>
    /// Actualiza un módulo existente
    /// </summary>
    /// <param name="id">ID del módulo</param>
    /// <param name="updateDto">Datos actualizados del módulo</param>
    /// <returns>Módulo actualizado</returns>
    [HttpPut("{id}")]
    public async Task<ActionResult<ModuloDto>> UpdateModulo(string id, [FromBody] UpdateModuloDto updateDto)
    {
        try
        {
            var modulo = await _context.Modulos
                .Include(m => m.SubModulos)
                .FirstOrDefaultAsync(m => m.Id == id && m.Status == false);

            if (modulo == null)
            {
                return NotFound("Módulo no encontrado");
            }

            // Validar que el nombre no esté duplicado (excepto el mismo módulo)
            var moduloDuplicado = await _context.Modulos
                .FirstOrDefaultAsync(m =>
                    m.Id != id &&
                    m.Nombre.ToLower() == updateDto.Nombre.ToLower() &&
                    m.Status == false);

            if (moduloDuplicado != null)
            {
                return BadRequest("Ya existe otro módulo con ese nombre");
            }

            // Si cambia el módulo padre, validar
            if (!string.IsNullOrWhiteSpace(updateDto.ModuloPadreId) &&
                updateDto.ModuloPadreId != modulo.ModuloPadreId)
            {
                // No permitir cambiar padre a sí mismo
                if (updateDto.ModuloPadreId == id)
                {
                    return BadRequest("Un módulo no puede ser padre de sí mismo");
                }

                // Validar que el nuevo padre exista
                var moduloPadre = await _context.Modulos
                    .FirstOrDefaultAsync(m => m.Id == updateDto.ModuloPadreId && m.Status == false);

                if (moduloPadre == null)
                {
                    return BadRequest("El módulo padre no existe");
                }

                // Validar que el módulo padre no tenga a su vez un padre (máximo 2 niveles)
                if (moduloPadre.ModuloPadreId != null)
                {
                    return BadRequest("No se permiten más de 2 niveles de módulos");
                }

                // Si el módulo actual tiene hijos, no permitir asignarlo como hijo
                if (modulo.SubModulos.Any(sm => sm.Status == false))
                {
                    return BadRequest("No se puede convertir en submódulo un módulo que tiene submódulos");
                }
            }

            // Actualizar datos del módulo
            modulo.Nombre = updateDto.Nombre;
            modulo.Descripcion = updateDto.Descripcion;
            modulo.Icono = updateDto.Icono;
            modulo.Ruta = updateDto.Ruta;
            modulo.OrdenMenu = updateDto.Orden;
            modulo.ModuloPadreId = updateDto.ModuloPadreId;
            modulo.Activo = updateDto.Activo;
            modulo.FechaModificacion = DateTime.Now;

            await _context.SaveChangesAsync();

            // Recargar con todas las relaciones
            var moduloActualizado = await _context.Modulos
                .Include(m => m.SubModulos.Where(sm => sm.Status == false))
                .Include(m => m.ModuloPadre)
                .FirstOrDefaultAsync(m => m.Id == id);

            if (moduloActualizado == null)
            {
                return StatusCode(500, "Error al actualizar módulo");
            }

            var moduloDto = MapToDto(moduloActualizado, true);

            return Ok(moduloDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al actualizar módulo {ModuloId}", id);
            return StatusCode(500, "Error interno del servidor");
        }
    }

    /// <summary>
    /// Elimina un módulo (soft delete)
    /// </summary>
    /// <param name="id">ID del módulo</param>
    /// <returns>Resultado de la operación</returns>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteModulo(string id)
    {
        try
        {
            var modulo = await _context.Modulos
                .Include(m => m.SubModulos)
                .Include(m => m.RolModulos)
                .FirstOrDefaultAsync(m => m.Id == id && m.Status == false);

            if (modulo == null)
            {
                return NotFound("Módulo no encontrado");
            }

            // Validar que no tenga submódulos activos
            var subModulosActivos = modulo.SubModulos.Where(sm => sm.Status == false).ToList();
            if (subModulosActivos.Any())
            {
                return BadRequest($"No se puede eliminar el módulo porque tiene {subModulosActivos.Count} submódulo(s) activo(s)");
            }

            // Validar que no esté asignado a roles
            if (modulo.RolModulos.Any(rm => rm.Status == false))
            {
                return BadRequest("No se puede eliminar el módulo porque está asignado a uno o más roles");
            }

            // Soft delete
            modulo.Status = true;
            modulo.Activo = false;
            modulo.FechaModificacion = DateTime.Now;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Módulo eliminado correctamente" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al eliminar módulo {ModuloId}", id);
            return StatusCode(500, "Error interno del servidor");
        }
    }

    /// <summary>
    /// Obtiene los módulos disponibles para un usuario específico con sus permisos
    /// </summary>
    /// <param name="usuarioId">ID del usuario</param>
    /// <returns>Lista de módulos con permisos del usuario</returns>
    [HttpGet("usuario/{usuarioId}")]
    public async Task<ActionResult<List<ModuloConPermisosDto>>> GetModulosUsuario(string usuarioId)
    {
        try
        {
            // Obtener el usuario con su rol
            var usuario = await _context.Usuarios
                .Include(u => u.Rol)
                    .ThenInclude(r => r!.RolModulos)
                        .ThenInclude(rm => rm.Modulo)
                .FirstOrDefaultAsync(u => u.Id == usuarioId && u.Status == false);

            if (usuario == null)
            {
                return NotFound("Usuario no encontrado");
            }

            List<ModuloConPermisosDto> modulosConPermisos;

            // Si es administrador, devolver todos los módulos con permisos completos
            if (usuario.EsAdministrador)
            {
                var todosModulos = await _context.Modulos
                    .Include(m => m.SubModulos.Where(sm => sm.Status == false && sm.Activo))
                    .Where(m => m.Status == false && m.Activo && m.ModuloPadreId == null)
                    .OrderBy(m => m.OrdenMenu)
                    .ToListAsync();

                modulosConPermisos = todosModulos
                    .Select(m => MapToPermisosDto(m, null, true))
                    .ToList();
            }
            else
            {
                // Si no tiene rol asignado, devolver lista vacía
                if (usuario.Rol == null)
                {
                    return Ok(new List<ModuloConPermisosDto>());
                }

                // Obtener módulos del rol con permisos
                var modulosRol = usuario.Rol.RolModulos
                    .Where(rm => rm.Status == false && rm.Modulo.Status == false && rm.Modulo.Activo)
                    .ToList();

                // Crear diccionario de permisos por módulo
                var permisosDict = modulosRol
                    .ToDictionary(rm => rm.ModuloId, rm => rm);

                // Obtener solo los módulos principales permitidos
                var modulosPrincipales = await _context.Modulos
                    .Include(m => m.SubModulos.Where(sm => sm.Status == false && sm.Activo))
                    .Where(m => m.Status == false && m.Activo && m.ModuloPadreId == null)
                    .OrderBy(m => m.OrdenMenu)
                    .ToListAsync();

                // Filtrar solo los módulos que el usuario tiene permiso para ver
                modulosConPermisos = modulosPrincipales
                    .Where(m => permisosDict.ContainsKey(m.Id) && permisosDict[m.Id].PuedeVer)
                    .Select(m => MapToPermisosDto(m, permisosDict, false))
                    .ToList();
            }

            return Ok(modulosConPermisos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener módulos del usuario {UsuarioId}", usuarioId);
            return StatusCode(500, "Error interno del servidor");
        }
    }

    /// <summary>
    /// Mapea un módulo a DTO recursivamente (incluye submódulos)
    /// </summary>
    private ModuloDto MapToDto(Modulo modulo, bool includeInactive)
    {
        var subModulos = modulo.SubModulos
            .Where(sm => includeInactive || sm.Activo)
            .OrderBy(sm => sm.OrdenMenu)
            .Select(sm => MapToDto(sm, includeInactive))
            .ToList();

        return new ModuloDto
        {
            Id = modulo.Id,
            Nombre = modulo.Nombre,
            Descripcion = modulo.Descripcion,
            Icono = modulo.Icono,
            Ruta = modulo.Ruta,
            Orden = modulo.OrdenMenu,
            Activo = modulo.Activo,
            ModuloPadreId = modulo.ModuloPadreId,
            SubModulos = subModulos
        };
    }

    /// <summary>
    /// Mapea un módulo a DTO con permisos recursivamente
    /// </summary>
    private ModuloConPermisosDto MapToPermisosDto(
        Modulo modulo,
        Dictionary<string, RolModulo>? permisosDict,
        bool esAdmin)
    {
        // Mapear submódulos con permisos
        var subModulos = modulo.SubModulos
            .Where(sm => sm.Activo && (esAdmin || (permisosDict != null && permisosDict.ContainsKey(sm.Id) && permisosDict[sm.Id].PuedeVer)))
            .OrderBy(sm => sm.OrdenMenu)
            .Select(sm => MapToPermisosDto(sm, permisosDict, esAdmin))
            .ToList();

        // Obtener permisos del módulo
        var permisos = esAdmin
            ? new { PuedeVer = true, PuedeCrear = true, PuedeEditar = true, PuedeEliminar = true }
            : permisosDict != null && permisosDict.TryGetValue(modulo.Id, out var rolModulo)
                ? new { rolModulo.PuedeVer, rolModulo.PuedeCrear, rolModulo.PuedeEditar, rolModulo.PuedeEliminar }
                : new { PuedeVer = false, PuedeCrear = false, PuedeEditar = false, PuedeEliminar = false };

        return new ModuloConPermisosDto
        {
            Id = modulo.Id,
            Codigo = modulo.Codigo,
            Nombre = modulo.Nombre,
            Descripcion = modulo.Descripcion,
            Icono = modulo.Icono,
            Ruta = modulo.Ruta,
            OrdenMenu = modulo.OrdenMenu,
            Activo = modulo.Activo,
            ModuloPadreId = modulo.ModuloPadreId,
            PuedeVer = permisos.PuedeVer,
            PuedeCrear = permisos.PuedeCrear,
            PuedeEditar = permisos.PuedeEditar,
            PuedeEliminar = permisos.PuedeEliminar,
            SubModulos = subModulos
        };
    }
}
