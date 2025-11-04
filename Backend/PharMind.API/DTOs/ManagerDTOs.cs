namespace PharMind.API.DTOs;

public class ManagerDto
{
    public string Id { get; set; } = string.Empty;
    public string UsuarioId { get; set; } = string.Empty;
    public string UsuarioNombre { get; set; } = string.Empty;
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string? Apellido { get; set; }
    public string? Email { get; set; }
    public string? Telefono { get; set; }
    public string? Cargo { get; set; }
    public DateTime? FechaIngreso { get; set; }
    public string? LegacyCode { get; set; }
    public string? Legajo { get; set; }
    public bool Activo { get; set; }
    public string? Observaciones { get; set; }
    public DateTime FechaCreacion { get; set; }
    public DateTime? FechaModificacion { get; set; }

    // Relaciones
    public List<string> RegionIds { get; set; } = new();
    public List<string> DistritoIds { get; set; } = new();
    public List<string> LineaNegocioIds { get; set; } = new();
    public int CantidadRegiones { get; set; }
    public int CantidadDistritos { get; set; }
    public int CantidadLineasNegocio { get; set; }
}

public class CreateManagerDto
{
    public string UsuarioId { get; set; } = string.Empty;
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string? Apellido { get; set; }
    public string? Email { get; set; }
    public string? Telefono { get; set; }
    public string? Cargo { get; set; }
    public DateTime? FechaIngreso { get; set; }
    public string? LegacyCode { get; set; }
    public string? Legajo { get; set; }
    public bool Activo { get; set; } = true;
    public string? Observaciones { get; set; }

    // Relaciones
    public List<string> RegionIds { get; set; } = new();
    public List<string> DistritoIds { get; set; } = new();
    public List<string> LineaNegocioIds { get; set; } = new();
}

public class UpdateManagerDto
{
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string? Apellido { get; set; }
    public string? Email { get; set; }
    public string? Telefono { get; set; }
    public string? Cargo { get; set; }
    public DateTime? FechaIngreso { get; set; }
    public string? LegacyCode { get; set; }
    public string? Legajo { get; set; }
    public bool Activo { get; set; } = true;
    public string? Observaciones { get; set; }

    // Relaciones
    public List<string> RegionIds { get; set; } = new();
    public List<string> DistritoIds { get; set; } = new();
    public List<string> LineaNegocioIds { get; set; } = new();
}

public class ManagerListResponse
{
    public List<ManagerDto> Items { get; set; } = new();
    public int TotalItems { get; set; }
    public int TotalPages { get; set; }
    public int CurrentPage { get; set; }
}
