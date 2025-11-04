namespace PharMind.API.DTOs;

public class RegionDto
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
    public int CantidadDistritos { get; set; }
    public int CantidadAgentes { get; set; }
    public DateTime FechaCreacion { get; set; }
    public DateTime? FechaModificacion { get; set; }
}

public class CreateRegionDto
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

public class UpdateRegionDto
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

public class RegionListResponse
{
    public List<RegionDto> Items { get; set; } = new();
    public int TotalItems { get; set; }
    public int TotalPages { get; set; }
    public int CurrentPage { get; set; }
}
