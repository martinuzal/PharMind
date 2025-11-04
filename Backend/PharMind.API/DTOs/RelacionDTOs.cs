namespace PharMind.API.DTOs;

public class RelacionDto
{
    public string Id { get; set; } = string.Empty;
    public string TipoRelacionId { get; set; } = string.Empty;
    public string? TipoRelacionNombre { get; set; }
    public string? EntidadDinamicaId { get; set; }
    public Dictionary<string, object?>? DatosDinamicos { get; set; }

    public string CodigoRelacion { get; set; } = string.Empty;
    public string AgenteId { get; set; } = string.Empty;
    public string AgenteNombre { get; set; } = string.Empty;
    public string ClientePrincipalId { get; set; } = string.Empty;
    public string ClientePrincipalNombre { get; set; } = string.Empty;
    public string? ClienteSecundario1Id { get; set; }
    public string? ClienteSecundario1Nombre { get; set; }
    public string? ClienteSecundario2Id { get; set; }
    public string? ClienteSecundario2Nombre { get; set; }
    public string? TipoRelacion { get; set; }
    public DateTime FechaInicio { get; set; }
    public DateTime? FechaFin { get; set; }
    public string Estado { get; set; } = "Activa";
    public string? FrecuenciaVisitas { get; set; }
    public string? Prioridad { get; set; }
    public string? Observaciones { get; set; }
    public DateTime FechaCreacion { get; set; }
    public string? CreadoPor { get; set; }
    public DateTime? FechaModificacion { get; set; }
    public string? ModificadoPor { get; set; }
}

public class CreateRelacionDto
{
    public string TipoRelacionId { get; set; } = string.Empty;
    public Dictionary<string, object?>? DatosDinamicos { get; set; }

    public string CodigoRelacion { get; set; } = string.Empty;
    public string AgenteId { get; set; } = string.Empty;
    public string ClientePrincipalId { get; set; } = string.Empty;
    public string? ClienteSecundario1Id { get; set; }
    public string? ClienteSecundario2Id { get; set; }
    public string? TipoRelacion { get; set; }
    public DateTime FechaInicio { get; set; } = DateTime.Today;
    public DateTime? FechaFin { get; set; }
    public string Estado { get; set; } = "Activa";
    public string? FrecuenciaVisitas { get; set; }
    public string? Prioridad { get; set; }
    public string? Observaciones { get; set; }
}

public class UpdateRelacionDto
{
    public Dictionary<string, object?>? DatosDinamicos { get; set; }

    public string? ClienteSecundario1Id { get; set; }
    public string? ClienteSecundario2Id { get; set; }
    public string? TipoRelacion { get; set; }
    public DateTime FechaInicio { get; set; }
    public DateTime? FechaFin { get; set; }
    public string Estado { get; set; } = "Activa";
    public string? FrecuenciaVisitas { get; set; }
    public string? Prioridad { get; set; }
    public string? Observaciones { get; set; }
}

public class RelacionListResponse
{
    public List<RelacionDto> Items { get; set; } = new();
    public int TotalItems { get; set; }
    public int TotalPages { get; set; }
    public int CurrentPage { get; set; }
}
