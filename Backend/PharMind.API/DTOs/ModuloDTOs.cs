namespace PharMind.API.DTOs;

public class ModuloDto
{
    public string Id { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public string? Icono { get; set; }
    public string? Ruta { get; set; }
    public int Orden { get; set; }
    public bool Activo { get; set; }
    public string? ModuloPadreId { get; set; }
    public List<ModuloDto> SubModulos { get; set; } = new();
}

public class CreateModuloDto
{
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public string? Icono { get; set; }
    public string? Ruta { get; set; }
    public int Orden { get; set; }
    public string? ModuloPadreId { get; set; }
}

public class UpdateModuloDto
{
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public string? Icono { get; set; }
    public string? Ruta { get; set; }
    public int Orden { get; set; }
    public bool Activo { get; set; }
    public string? ModuloPadreId { get; set; }
}
