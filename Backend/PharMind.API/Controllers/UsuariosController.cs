using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PharMind.API.Data;
using PharMind.API.DTOs;
using PharMind.API.Models;

namespace PharMind.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsuariosController : ControllerBase
{
    private readonly PharMindDbContext _context;
    private readonly ILogger<UsuariosController> _logger;

    public UsuariosController(
        PharMindDbContext context,
        ILogger<UsuariosController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Obtiene una lista paginada de usuarios con filtros opcionales
    /// </summary>
    /// <param name="page">Número de página (default: 1)</param>
    /// <param name="pageSize">Tamaño de página (default: 10)</param>
    /// <param name="search">Búsqueda por nombre o email</param>
    /// <param name="empresaId">Filtro por empresa</param>
    /// <param name="activo">Filtro por estado activo</param>
    /// <returns>Lista paginada de usuarios</returns>
    [HttpGet]
    public async Task<ActionResult<UsuarioListResponse>> GetUsuarios(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null,
        [FromQuery] string? empresaId = null,
        [FromQuery] bool? activo = null)
    {
        try
        {
            var query = _context.Usuarios
                .Include(u => u.Empresa)
                .Include(u => u.UsuarioRoles)
                    .ThenInclude(ur => ur.Rol)
                .Where(u => u.Status == false); // Excluir eliminados

            // Aplicar filtros
            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(u =>
                    u.NombreCompleto.Contains(search) ||
                    u.Email.Contains(search));
            }

            if (!string.IsNullOrWhiteSpace(empresaId))
            {
                query = query.Where(u => u.EmpresaId == empresaId);
            }

            if (activo.HasValue)
            {
                query = query.Where(u => u.Activo == activo.Value);
            }

            // Contar total de items
            var totalItems = await query.CountAsync();
            var totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);

            // Aplicar paginación
            var usuarios = await query
                .OrderByDescending(u => u.FechaCreacion)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            // Mapear a DTOs
            var usuarioDtos = usuarios.Select(u => new UsuarioDto
            {
                Id = u.Id,
                Email = u.Email,
                NombreCompleto = u.NombreCompleto,
                EmpresaId = u.EmpresaId,
                EmpresaNombre = u.Empresa?.Nombre ?? "",
                Telefono = u.Telefono,
                Avatar = u.Avatar,
                Cargo = u.Cargo,
                Departamento = u.Departamento,
                Activo = u.Activo,
                EmailVerificado = u.EmailVerificado,
                ProveedorSSO = u.ProveedorSSO,
                FechaCreacion = u.FechaCreacion,
                Roles = u.UsuarioRoles.Select(ur => ur.Rol?.Nombre ?? "").ToList()
            }).ToList();

            return Ok(new UsuarioListResponse
            {
                Usuarios = usuarioDtos,
                TotalItems = totalItems,
                TotalPages = totalPages,
                CurrentPage = page
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener usuarios");
            return StatusCode(500, "Error interno del servidor");
        }
    }

    /// <summary>
    /// Obtiene un usuario por ID
    /// </summary>
    /// <param name="id">ID del usuario</param>
    /// <returns>Usuario encontrado</returns>
    [HttpGet("{id}")]
    public async Task<ActionResult<UsuarioDto>> GetUsuario(string id)
    {
        try
        {
            var usuario = await _context.Usuarios
                .Include(u => u.Empresa)
                .Include(u => u.UsuarioRoles)
                    .ThenInclude(ur => ur.Rol)
                .Where(u => u.Status == false)
                .FirstOrDefaultAsync(u => u.Id == id);

            if (usuario == null)
            {
                return NotFound("Usuario no encontrado");
            }

            var usuarioDto = new UsuarioDto
            {
                Id = usuario.Id,
                Email = usuario.Email,
                NombreCompleto = usuario.NombreCompleto,
                EmpresaId = usuario.EmpresaId,
                EmpresaNombre = usuario.Empresa?.Nombre ?? "",
                Telefono = usuario.Telefono,
                Avatar = usuario.Avatar,
                Cargo = usuario.Cargo,
                Departamento = usuario.Departamento,
                Activo = usuario.Activo,
                EmailVerificado = usuario.EmailVerificado,
                ProveedorSSO = usuario.ProveedorSSO,
                FechaCreacion = usuario.FechaCreacion,
                Roles = usuario.UsuarioRoles.Select(ur => ur.Rol?.Nombre ?? "").ToList()
            };

            return Ok(usuarioDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener usuario {UsuarioId}", id);
            return StatusCode(500, "Error interno del servidor");
        }
    }

    /// <summary>
    /// Crea un nuevo usuario
    /// </summary>
    /// <param name="createDto">Datos del nuevo usuario</param>
    /// <returns>Usuario creado</returns>
    [HttpPost]
    public async Task<ActionResult<UsuarioDto>> CreateUsuario([FromBody] CreateUsuarioDto createDto)
    {
        try
        {
            // Validar que el email no exista
            var existingUser = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.Email.ToLower() == createDto.Email.ToLower());

            if (existingUser != null)
            {
                return BadRequest("El email ya está registrado");
            }

            // Validar que la empresa exista
            var empresa = await _context.Empresas.FindAsync(createDto.EmpresaId);
            if (empresa == null || empresa.Status == true)
            {
                return BadRequest("Empresa no encontrada o inactiva");
            }

            // Validar roles
            if (createDto.RoleIds != null && createDto.RoleIds.Any())
            {
                var rolesExisten = await _context.Roles
                    .Where(r => createDto.RoleIds.Contains(r.Id) && r.Status == false)
                    .CountAsync();

                if (rolesExisten != createDto.RoleIds.Count)
                {
                    return BadRequest("Uno o más roles no son válidos");
                }
            }

            // Crear usuario
            var usuario = new Usuario
            {
                Id = Guid.NewGuid().ToString(),
                Email = createDto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(createDto.Password),
                NombreCompleto = createDto.NombreCompleto,
                EmpresaId = createDto.EmpresaId,
                Telefono = createDto.Telefono,
                Cargo = createDto.Cargo,
                Departamento = createDto.Departamento,
                Activo = true,
                EmailVerificado = false,
                FechaCreacion = DateTime.Now,
                Status = false
            };

            _context.Usuarios.Add(usuario);

            // Asignar roles
            if (createDto.RoleIds != null && createDto.RoleIds.Any())
            {
                foreach (var rolId in createDto.RoleIds)
                {
                    var usuarioRol = new UsuarioRol
                    {
                        Id = Guid.NewGuid().ToString(),
                        UsuarioId = usuario.Id,
                        RolId = rolId,
                        FechaAsignacion = DateTime.Now,
                        FechaCreacion = DateTime.Now,
                        Status = false
                    };
                    _context.UsuarioRoles.Add(usuarioRol);
                }
            }

            await _context.SaveChangesAsync();

            // Cargar el usuario completo con relaciones
            var usuarioCompleto = await _context.Usuarios
                .Include(u => u.Empresa)
                .Include(u => u.UsuarioRoles)
                    .ThenInclude(ur => ur.Rol)
                .FirstOrDefaultAsync(u => u.Id == usuario.Id);

            if (usuarioCompleto == null)
            {
                return StatusCode(500, "Error al crear usuario");
            }

            var usuarioDto = new UsuarioDto
            {
                Id = usuarioCompleto.Id,
                Email = usuarioCompleto.Email,
                NombreCompleto = usuarioCompleto.NombreCompleto,
                EmpresaId = usuarioCompleto.EmpresaId,
                EmpresaNombre = usuarioCompleto.Empresa?.Nombre ?? "",
                Telefono = usuarioCompleto.Telefono,
                Avatar = usuarioCompleto.Avatar,
                Cargo = usuarioCompleto.Cargo,
                Departamento = usuarioCompleto.Departamento,
                Activo = usuarioCompleto.Activo,
                EmailVerificado = usuarioCompleto.EmailVerificado,
                ProveedorSSO = usuarioCompleto.ProveedorSSO,
                FechaCreacion = usuarioCompleto.FechaCreacion,
                Roles = usuarioCompleto.UsuarioRoles.Select(ur => ur.Rol?.Nombre ?? "").ToList()
            };

            return CreatedAtAction(nameof(GetUsuario), new { id = usuario.Id }, usuarioDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al crear usuario");
            return StatusCode(500, "Error interno del servidor");
        }
    }

    /// <summary>
    /// Actualiza un usuario existente
    /// </summary>
    /// <param name="id">ID del usuario</param>
    /// <param name="updateDto">Datos actualizados del usuario</param>
    /// <returns>Usuario actualizado</returns>
    [HttpPut("{id}")]
    public async Task<ActionResult<UsuarioDto>> UpdateUsuario(string id, [FromBody] UpdateUsuarioDto updateDto)
    {
        try
        {
            var usuario = await _context.Usuarios
                .Include(u => u.UsuarioRoles)
                .FirstOrDefaultAsync(u => u.Id == id && u.Status == false);

            if (usuario == null)
            {
                return NotFound("Usuario no encontrado");
            }

            // Validar roles si se proporcionan
            if (updateDto.RoleIds != null && updateDto.RoleIds.Any())
            {
                var rolesExisten = await _context.Roles
                    .Where(r => updateDto.RoleIds.Contains(r.Id) && r.Status == false)
                    .CountAsync();

                if (rolesExisten != updateDto.RoleIds.Count)
                {
                    return BadRequest("Uno o más roles no son válidos");
                }
            }

            // Actualizar datos del usuario
            usuario.NombreCompleto = updateDto.NombreCompleto;
            usuario.Telefono = updateDto.Telefono;
            usuario.Cargo = updateDto.Cargo;
            usuario.Departamento = updateDto.Departamento;
            usuario.Activo = updateDto.Activo;

            // Actualizar roles
            if (updateDto.RoleIds != null)
            {
                // Eliminar roles actuales
                var rolesActuales = usuario.UsuarioRoles.ToList();
                _context.UsuarioRoles.RemoveRange(rolesActuales);

                // Agregar nuevos roles
                foreach (var rolId in updateDto.RoleIds)
                {
                    var usuarioRol = new UsuarioRol
                    {
                        Id = Guid.NewGuid().ToString(),
                        UsuarioId = usuario.Id,
                        RolId = rolId,
                        FechaAsignacion = DateTime.Now,
                        FechaCreacion = DateTime.Now,
                        Status = false
                    };
                    _context.UsuarioRoles.Add(usuarioRol);
                }
            }

            await _context.SaveChangesAsync();

            // Recargar con todas las relaciones
            var usuarioActualizado = await _context.Usuarios
                .Include(u => u.Empresa)
                .Include(u => u.UsuarioRoles)
                    .ThenInclude(ur => ur.Rol)
                .FirstOrDefaultAsync(u => u.Id == id);

            if (usuarioActualizado == null)
            {
                return StatusCode(500, "Error al actualizar usuario");
            }

            var usuarioDto = new UsuarioDto
            {
                Id = usuarioActualizado.Id,
                Email = usuarioActualizado.Email,
                NombreCompleto = usuarioActualizado.NombreCompleto,
                EmpresaId = usuarioActualizado.EmpresaId,
                EmpresaNombre = usuarioActualizado.Empresa?.Nombre ?? "",
                Telefono = usuarioActualizado.Telefono,
                Avatar = usuarioActualizado.Avatar,
                Cargo = usuarioActualizado.Cargo,
                Departamento = usuarioActualizado.Departamento,
                Activo = usuarioActualizado.Activo,
                EmailVerificado = usuarioActualizado.EmailVerificado,
                ProveedorSSO = usuarioActualizado.ProveedorSSO,
                FechaCreacion = usuarioActualizado.FechaCreacion,
                Roles = usuarioActualizado.UsuarioRoles.Select(ur => ur.Rol?.Nombre ?? "").ToList()
            };

            return Ok(usuarioDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al actualizar usuario {UsuarioId}", id);
            return StatusCode(500, "Error interno del servidor");
        }
    }

    /// <summary>
    /// Elimina un usuario (soft delete)
    /// </summary>
    /// <param name="id">ID del usuario</param>
    /// <returns>Resultado de la operación</returns>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUsuario(string id)
    {
        try
        {
            var usuario = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.Id == id && u.Status == false);

            if (usuario == null)
            {
                return NotFound("Usuario no encontrado");
            }

            // Soft delete
            usuario.Status = true;
            usuario.Activo = false;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Usuario eliminado correctamente" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al eliminar usuario {UsuarioId}", id);
            return StatusCode(500, "Error interno del servidor");
        }
    }

    /// <summary>
    /// Cambia la contraseña de un usuario
    /// </summary>
    /// <param name="id">ID del usuario</param>
    /// <param name="changePasswordDto">Nueva contraseña</param>
    /// <returns>Resultado de la operación</returns>
    [HttpPost("{id}/change-password")]
    public async Task<IActionResult> ChangePassword(string id, [FromBody] ChangePasswordDto changePasswordDto)
    {
        try
        {
            var usuario = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.Id == id && u.Status == false);

            if (usuario == null)
            {
                return NotFound("Usuario no encontrado");
            }

            if (string.IsNullOrWhiteSpace(changePasswordDto.NewPassword))
            {
                return BadRequest("La nueva contraseña es requerida");
            }

            // Actualizar contraseña
            usuario.PasswordHash = BCrypt.Net.BCrypt.HashPassword(changePasswordDto.NewPassword);

            await _context.SaveChangesAsync();

            return Ok(new { message = "Contraseña actualizada correctamente" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al cambiar contraseña del usuario {UsuarioId}", id);
            return StatusCode(500, "Error interno del servidor");
        }
    }
}
