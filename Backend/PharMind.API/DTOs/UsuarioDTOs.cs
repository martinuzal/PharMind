namespace PharMind.API.DTOs;

public class UsuarioDto
{
    public string Id { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string NombreCompleto { get; set; } = string.Empty;
    public string EmpresaId { get; set; } = string.Empty;
    public string EmpresaNombre { get; set; } = string.Empty;
    public string? Telefono { get; set; }
    public string? Avatar { get; set; }
    public string? Cargo { get; set; }
    public string? Departamento { get; set; }
    public bool Activo { get; set; }
    public bool EmailVerificado { get; set; }
    public string? ProveedorSSO { get; set; }
    public DateTime FechaCreacion { get; set; }
    public List<string> Roles { get; set; } = new();
}

public class CreateUsuarioDto
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string NombreCompleto { get; set; } = string.Empty;
    public string EmpresaId { get; set; } = string.Empty;
    public string? Telefono { get; set; }
    public string? Cargo { get; set; }
    public string? Departamento { get; set; }
    public List<string> RoleIds { get; set; } = new();
}

public class UpdateUsuarioDto
{
    public string NombreCompleto { get; set; } = string.Empty;
    public string? Telefono { get; set; }
    public string? Cargo { get; set; }
    public string? Departamento { get; set; }
    public bool Activo { get; set; }
    public List<string> RoleIds { get; set; } = new();
}

public class ChangePasswordDto
{
    public string NewPassword { get; set; } = string.Empty;
}

public class UsuarioListResponse
{
    public List<UsuarioDto> Usuarios { get; set; } = new();
    public int TotalItems { get; set; }
    public int TotalPages { get; set; }
    public int CurrentPage { get; set; }
}
