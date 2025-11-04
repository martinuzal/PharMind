namespace PharMind.API.DTOs;

public class AgenteDto
{
    public string Id { get; set; } = string.Empty;

    // Tipo de agente y datos dinámicos
    public string TipoAgenteId { get; set; } = string.Empty;
    public string? TipoAgenteNombre { get; set; }
    public string? EntidadDinamicaId { get; set; }
    public Dictionary<string, object?>? DatosDinamicos { get; set; }

    // Datos base
    public string CodigoAgente { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string? Apellido { get; set; }
    public string? Email { get; set; }
    public string? Telefono { get; set; }

    // Relaciones con tablas fijas
    public string? RegionId { get; set; }
    public string? RegionNombre { get; set; }
    public string? DistritoId { get; set; }
    public string? DistritoNombre { get; set; }
    public string? LineaNegocioId { get; set; }
    public string? LineaNegocioNombre { get; set; }
    public string? ManagerId { get; set; }
    public string? ManagerNombre { get; set; }

    public DateTime? FechaIngreso { get; set; }
    public bool Activo { get; set; }
    public string? Observaciones { get; set; }

    // Auditoría
    public DateTime FechaCreacion { get; set; }
    public string? CreadoPor { get; set; }
    public DateTime? FechaModificacion { get; set; }
    public string? ModificadoPor { get; set; }
}

public class CreateAgenteDto
{
    public string TipoAgenteId { get; set; } = string.Empty;
    public Dictionary<string, object?>? DatosDinamicos { get; set; }

    public string CodigoAgente { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string? Apellido { get; set; }
    public string? Email { get; set; }
    public string? Telefono { get; set; }

    public string? RegionId { get; set; }
    public string? DistritoId { get; set; }
    public string? LineaNegocioId { get; set; }
    public string? ManagerId { get; set; }

    public DateTime? FechaIngreso { get; set; }
    public bool Activo { get; set; } = true;
    public string? Observaciones { get; set; }
}

public class UpdateAgenteDto
{
    public Dictionary<string, object?>? DatosDinamicos { get; set; }

    public string Nombre { get; set; } = string.Empty;
    public string? Apellido { get; set; }
    public string? Email { get; set; }
    public string? Telefono { get; set; }

    public string? RegionId { get; set; }
    public string? DistritoId { get; set; }
    public string? LineaNegocioId { get; set; }
    public string? ManagerId { get; set; }

    public DateTime? FechaIngreso { get; set; }
    public bool Activo { get; set; } = true;
    public string? Observaciones { get; set; }
}

public class AgenteListResponse
{
    public List<AgenteDto> Items { get; set; } = new();
    public int TotalItems { get; set; }
    public int TotalPages { get; set; }
    public int CurrentPage { get; set; }
}
