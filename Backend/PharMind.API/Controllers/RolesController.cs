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
                .Include(r => r.Usuarios)
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
                UsuariosCount = r.Usuarios.Count,
                Permisos = r.RolModulos.Select(rm => new PermisoModuloDto
                {
                    ModuloId = rm.ModuloId,
                    ModuloNombre = rm.Modulo?.Nombre ?? "",
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
                .Include(r => r.Usuarios)
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
                UsuariosCount = rol.Usuarios.Count,
                Permisos = rol.RolModulos.Select(rm => new PermisoModuloDto
                {
                    ModuloId = rm.ModuloId,
                    ModuloNombre = rm.Modulo?.Nombre ?? "",
                    PuedeVer = rm.PuedeVer,
                    PuedeCrear = rm.PuedeCrear,
                    PuedeEditar = rm.PuedeEditar,
                    PuedeEliminar = rm.PuedeEliminar
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
            _logger.LogInformation("=== INICIO CreateRol ===");
            _logger.LogInformation("Datos recibidos: Nombre={Nombre}, EmpresaId={EmpresaId}, Permisos={PermisosCount}",
                createDto.Nombre, createDto.EmpresaId, createDto.Permisos?.Count ?? 0);

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

            // Generar código único basado en el nombre
            var codigo = GenerarCodigoRol(createDto.Nombre);
            _logger.LogInformation("Código generado: {Codigo}", codigo);

            // Validar que el código no esté duplicado
            var codigoExistente = await _context.Roles
                .FirstOrDefaultAsync(r => r.Codigo == codigo && r.Status == false);

            if (codigoExistente != null)
            {
                _logger.LogInformation("Código duplicado encontrado, generando sufijo numérico...");
                // Si existe, agregar un sufijo numérico
                var contador = 1;
                var codigoBase = codigo;
                while (codigoExistente != null)
                {
                    codigo = $"{codigoBase}_{contador}";
                    codigoExistente = await _context.Roles
                        .FirstOrDefaultAsync(r => r.Codigo == codigo && r.Status == false);
                    contador++;
                }
                _logger.LogInformation("Código único final: {Codigo}", codigo);
            }

            // Crear rol
            _logger.LogInformation("Creando rol con Codigo={Codigo}, Nombre={Nombre}", codigo, createDto.Nombre);
            var rol = new Rol
            {
                Id = Guid.NewGuid().ToString(),
                Codigo = codigo,
                Nombre = createDto.Nombre,
                Descripcion = createDto.Descripcion,
                EmpresaId = createDto.EmpresaId,
                EsSistema = false, // Los roles creados por usuarios no son de sistema
                Activo = true,
                FechaCreacion = DateTime.Now,
                Status = false
            };

            _context.Roles.Add(rol);
            _logger.LogInformation("Rol agregado al contexto con Id={RolId}", rol.Id);

            // Asignar permisos
            if (createDto.Permisos != null && createDto.Permisos.Any())
            {
                _logger.LogInformation("Asignando {PermisosCount} permisos al rol", createDto.Permisos.Count);
                foreach (var permiso in createDto.Permisos)
                {
                    var rolModulo = new RolModulo
                    {
                        Id = Guid.NewGuid().ToString(),
                        RolId = rol.Id,
                        ModuloId = permiso.ModuloId,
                        PuedeVer = permiso.PuedeVer,
                        PuedeCrear = permiso.PuedeCrear,
                        PuedeEditar = permiso.PuedeEditar,
                        PuedeEliminar = permiso.PuedeEliminar,
                        PuedeExportar = permiso.PuedeExportar ?? false,
                        PuedeImportar = permiso.PuedeImportar ?? false,
                        PuedeAprobar = permiso.PuedeAprobar ?? false,
                        FechaCreacion = DateTime.Now,
                        Status = false
                    };
                    _context.RolModulos.Add(rolModulo);
                }
            }

            _logger.LogInformation("Guardando cambios en la base de datos...");
            await _context.SaveChangesAsync();
            _logger.LogInformation("Cambios guardados exitosamente");

            // Cargar el rol completo con relaciones
            _logger.LogInformation("Cargando rol completo con relaciones...");
            var rolCompleto = await _context.Roles
                .Include(r => r.Empresa)
                .Include(r => r.Usuarios)
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
                UsuariosCount = rolCompleto.Usuarios.Count,
                Permisos = rolCompleto.RolModulos.Select(rm => new PermisoModuloDto
                {
                    ModuloId = rm.ModuloId,
                    ModuloNombre = rm.Modulo?.Nombre ?? "",
                    PuedeVer = rm.PuedeVer,
                    PuedeCrear = rm.PuedeCrear,
                    PuedeEditar = rm.PuedeEditar,
                    PuedeEliminar = rm.PuedeEliminar
                }).ToList()
            };

            _logger.LogInformation("=== FIN CreateRol EXITOSO === RolId={RolId}, Nombre={Nombre}", rolDto.Id, rolDto.Nombre);
            return CreatedAtAction(nameof(GetRol), new { id = rol.Id }, rolDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "=== ERROR en CreateRol === Mensaje: {Message}", ex.Message);
            var errorMessage = GetFullErrorMessage(ex);
            return StatusCode(500, new { error = "Error al crear rol", details = errorMessage });
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
                        PuedeVer = permiso.PuedeVer,
                        PuedeCrear = permiso.PuedeCrear,
                        PuedeEditar = permiso.PuedeEditar,
                        PuedeEliminar = permiso.PuedeEliminar,
                        PuedeExportar = permiso.PuedeExportar ?? false,
                        PuedeImportar = permiso.PuedeImportar ?? false,
                        PuedeAprobar = permiso.PuedeAprobar ?? false,
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
                .Include(r => r.Usuarios)
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
                UsuariosCount = rolActualizado.Usuarios.Count,
                Permisos = rolActualizado.RolModulos.Select(rm => new PermisoModuloDto
                {
                    ModuloId = rm.ModuloId,
                    ModuloNombre = rm.Modulo?.Nombre ?? "",
                    PuedeVer = rm.PuedeVer,
                    PuedeCrear = rm.PuedeCrear,
                    PuedeEditar = rm.PuedeEditar,
                    PuedeEliminar = rm.PuedeEliminar
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
                .Include(r => r.Usuarios)
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
            if (rol.Usuarios.Any())
            {
                return BadRequest($"No se puede eliminar el rol porque tiene {rol.Usuarios.Count} usuario(s) asignado(s)");
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

    /// <summary>
    /// Genera un código único para el rol basado en su nombre
    /// </summary>
    /// <param name="nombre">Nombre del rol</param>
    /// <returns>Código generado en formato UPPER_SNAKE_CASE</returns>
    private string GenerarCodigoRol(string nombre)
    {
        // Remover acentos y caracteres especiales
        var nombreNormalizado = nombre
            .Normalize(System.Text.NormalizationForm.FormD)
            .Where(c => char.GetUnicodeCategory(c) != System.Globalization.UnicodeCategory.NonSpacingMark)
            .ToArray();

        var nombreSinAcentos = new string(nombreNormalizado);

        // Convertir a mayúsculas y reemplazar espacios por guiones bajos
        var codigo = nombreSinAcentos
            .ToUpper()
            .Replace(" ", "_")
            .Replace("-", "_");

        // Remover caracteres no alfanuméricos excepto guiones bajos
        codigo = new string(codigo.Where(c => char.IsLetterOrDigit(c) || c == '_').ToArray());

        // Limitar a 50 caracteres (tamaño máximo del campo)
        if (codigo.Length > 50)
        {
            codigo = codigo.Substring(0, 50);
        }

        return codigo;
    }

    /// <summary>
    /// Obtiene el mensaje completo de error incluyendo inner exceptions
    /// </summary>
    /// <param name="ex">Excepción a formatear</param>
    /// <returns>Mensaje completo del error</returns>
    private string GetFullErrorMessage(Exception ex)
    {
        var messages = new System.Text.StringBuilder();
        messages.AppendLine($"Error: {ex.Message}");

        if (ex.InnerException != null)
        {
            messages.AppendLine($"Inner Exception: {ex.InnerException.Message}");

            // Si hay más niveles de inner exceptions
            var innerEx = ex.InnerException.InnerException;
            var level = 2;
            while (innerEx != null && level <= 5) // Limitar a 5 niveles
            {
                messages.AppendLine($"Inner Exception (Level {level}): {innerEx.Message}");
                innerEx = innerEx.InnerException;
                level++;
            }
        }

        return messages.ToString();
    }
}
