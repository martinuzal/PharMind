namespace PharMind.API.DTOs;

public class LineaNegocioDto
{
    public string Id { get; set; } = string.Empty;
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public string? LegacyCode { get; set; }
    public string? Legajo { get; set; }
    public string? Color { get; set; }
    public string? Icono { get; set; }
    public bool Activo { get; set; }
    public int? Orden { get; set; }
    public int CantidadAgentes { get; set; }
    public DateTime FechaCreacion { get; set; }
    public DateTime? FechaModificacion { get; set; }
}

public class CreateLineaNegocioDto
{
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public string? LegacyCode { get; set; }
    public string? Legajo { get; set; }
    public string? Color { get; set; }
    public string? Icono { get; set; }
    public bool Activo { get; set; } = true;
    public int? Orden { get; set; }
}

public class UpdateLineaNegocioDto
{
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public string? LegacyCode { get; set; }
    public string? Legajo { get; set; }
    public string? Color { get; set; }
    public string? Icono { get; set; }
    public bool Activo { get; set; } = true;
    public int? Orden { get; set; }
}

public class LineaNegocioListResponse
{
    public List<LineaNegocioDto> Items { get; set; } = new();
    public int TotalItems { get; set; }
    public int TotalPages { get; set; }
    public int CurrentPage { get; set; }
}
