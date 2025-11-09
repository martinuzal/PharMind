namespace PharMind.API.DTOs;

public class EmpresaDto
{
    public string Id { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string? RazonSocial { get; set; }
    public string? Cuit { get; set; }
    public string? Telefono { get; set; }
    public string? Email { get; set; }
    public string? Direccion { get; set; }
    public string? Logo { get; set; }
    public bool Activo { get; set; }
}

public class CreateEmpresaDto
{
    public string Nombre { get; set; } = string.Empty;
    public string? RazonSocial { get; set; }
    public string? Cuit { get; set; }
    public string? Telefono { get; set; }
    public string? Email { get; set; }
    public string? Direccion { get; set; }
    public string? Logo { get; set; }
}

public class UpdateEmpresaDto
{
    public string Nombre { get; set; } = string.Empty;
    public string? RazonSocial { get; set; }
    public string? Cuit { get; set; }
    public string? Telefono { get; set; }
    public string? Email { get; set; }
    public string? Direccion { get; set; }
    public string? Logo { get; set; }
    public bool Activo { get; set; }
}
