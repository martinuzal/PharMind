using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using PharMind.API.Data;
using PharMind.API.DTOs;
using PharMind.API.Models;

namespace PharMind.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly PharMindDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        PharMindDbContext context,
        IConfiguration configuration,
        ILogger<AuthController> logger)
    {
        _context = context;
        _configuration = configuration;
        _logger = logger;
    }

    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest("Email y contraseña son requeridos");
            }

            // Buscar usuario por email
            var usuario = await _context.Usuarios
                .Include(u => u.Empresa)
                .Include(u => u.UsuarioRoles)
                    .ThenInclude(ur => ur.Rol)
                .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower());

            if (usuario == null)
            {
                return Unauthorized("Credenciales inválidas");
            }

            // Verificar si el usuario está activo
            if (!usuario.Activo || usuario.Status == true)
            {
                return Unauthorized("Usuario inactivo o eliminado");
            }

            // Verificar contraseña
            if (string.IsNullOrEmpty(usuario.PasswordHash) ||
                !BCrypt.Net.BCrypt.Verify(request.Password, usuario.PasswordHash))
            {
                return Unauthorized("Credenciales inválidas");
            }

            // Actualizar último acceso
            usuario.UltimoAcceso = DateTime.Now;
            await _context.SaveChangesAsync();

            // Generar token JWT
            var token = GenerateJwtToken(usuario);

            // Preparar respuesta
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
                ProveedorSso = usuario.ProveedorSso,
                FechaCreacion = usuario.FechaCreacion,
                Roles = usuario.UsuarioRoles.Select(ur => ur.Rol?.Nombre ?? "").ToList(),
                AgenteId = usuario.AgenteId
            };

            return Ok(new LoginResponse
            {
                Token = token,
                Usuario = usuarioDto
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error en login");
            return StatusCode(500, "Error interno del servidor");
        }
    }

    [HttpPost("register")]
    public async Task<ActionResult<LoginResponse>> Register([FromBody] RegisterRequest request)
    {
        try
        {
            // Validar que el email no exista
            var existingUser = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower());

            if (existingUser != null)
            {
                return BadRequest("El email ya está registrado");
            }

            // Validar que la empresa exista
            var empresa = await _context.Empresas.FindAsync(request.EmpresaId);
            if (empresa == null)
            {
                return BadRequest("Empresa no encontrada");
            }

            // Crear usuario
            var usuario = new Usuario
            {
                Id = Guid.NewGuid().ToString(),
                Email = request.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                NombreCompleto = request.NombreCompleto,
                EmpresaId = request.EmpresaId,
                Activo = true,
                EmailVerificado = false,
                FechaCreacion = DateTime.Now,
                Status = false
            };

            _context.Usuarios.Add(usuario);

            // Asignar roles
            if (request.RoleIds != null && request.RoleIds.Any())
            {
                foreach (var rolId in request.RoleIds)
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

            // Generar token
            var token = GenerateJwtToken(usuarioCompleto);

            // Preparar respuesta
            var usuarioDto = new UsuarioDto
            {
                Id = usuarioCompleto.Id,
                Email = usuarioCompleto.Email,
                NombreCompleto = usuarioCompleto.NombreCompleto,
                EmpresaId = usuarioCompleto.EmpresaId,
                EmpresaNombre = usuarioCompleto.Empresa?.Nombre ?? "",
                Activo = usuarioCompleto.Activo,
                EmailVerificado = usuarioCompleto.EmailVerificado,
                FechaCreacion = usuarioCompleto.FechaCreacion,
                Roles = usuarioCompleto.UsuarioRoles.Select(ur => ur.Rol?.Nombre ?? "").ToList()
            };

            return Ok(new LoginResponse
            {
                Token = token,
                Usuario = usuarioDto
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error en registro");
            return StatusCode(500, "Error interno del servidor");
        }
    }

    [HttpPost("fix-admin-password")]
    public async Task<ActionResult> FixAdminPassword()
    {
        try
        {
            var admin = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.Email == "admin@pharmind.com");

            if (admin == null)
            {
                return NotFound("Usuario admin no encontrado");
            }

            // Generar nuevo hash para Admin123!
            admin.PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!");
            await _context.SaveChangesAsync();

            return Ok(new { message = "Password actualizado correctamente", hash = admin.PasswordHash });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al actualizar password");
            return StatusCode(500, "Error interno del servidor");
        }
    }

    private string GenerateJwtToken(Usuario usuario)
    {
        var jwtKey = _configuration["Jwt:Key"];
        var jwtIssuer = _configuration["Jwt:Issuer"];
        var jwtAudience = _configuration["Jwt:Audience"];
        var jwtExpiryMinutes = int.Parse(_configuration["Jwt:ExpiryInMinutes"] ?? "1440");

        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey ?? ""));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, usuario.Id),
            new Claim(ClaimTypes.Email, usuario.Email),
            new Claim(ClaimTypes.Name, usuario.NombreCompleto),
            new Claim("EmpresaId", usuario.EmpresaId)
        };

        // Agregar roles como claims
        if (usuario.UsuarioRoles != null)
        {
            foreach (var usuarioRol in usuario.UsuarioRoles)
            {
                if (usuarioRol.Rol != null)
                {
                    claims.Add(new Claim(ClaimTypes.Role, usuarioRol.Rol.Nombre));
                }
            }
        }

        var token = new JwtSecurityToken(
            issuer: jwtIssuer,
            audience: jwtAudience,
            claims: claims,
            expires: DateTime.Now.AddMinutes(jwtExpiryMinutes),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
