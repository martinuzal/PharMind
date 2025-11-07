namespace PharMind.API.DTOs;

public class TipoActividadDto
{
    public string Id { get; set; } = string.Empty;
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public string Clasificacion { get; set; } = "Laboral"; // Laboral / ExtraLaboral
    public string? Color { get; set; }
    public string? Icono { get; set; }
    public bool Activo { get; set; }
    public bool EsSistema { get; set; }
    public int? Orden { get; set; }
    public int CantidadUsos { get; set; }
    public DateTime FechaCreacion { get; set; }
}

public class CreateTipoActividadDto
{
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public string Clasificacion { get; set; } = "Laboral";
    public string? Color { get; set; }
    public string? Icono { get; set; }
    public int? Orden { get; set; }
}

public class UpdateTipoActividadDto
{
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public string Clasificacion { get; set; } = "Laboral";
    public string? Color { get; set; }
    public string? Icono { get; set; }
    public bool Activo { get; set; }
    public int? Orden { get; set; }
}

public class TipoActividadListResponse
{
    public List<TipoActividadDto> Items { get; set; } = new();
    public int TotalItems { get; set; }
    public int TotalPages { get; set; }
    public int CurrentPage { get; set; }
}
