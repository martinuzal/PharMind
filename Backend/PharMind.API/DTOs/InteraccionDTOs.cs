namespace PharMind.API.DTOs;

public class InteraccionDto
{
    public string Id { get; set; } = string.Empty;
    public string TipoInteraccionId { get; set; } = string.Empty;
    public string? TipoInteraccionNombre { get; set; }
    public string? EntidadDinamicaId { get; set; }
    public Dictionary<string, object?>? DatosDinamicos { get; set; }
    public string CodigoInteraccion { get; set; } = string.Empty;
    public string RelacionId { get; set; } = string.Empty;
    public string? RelacionCodigo { get; set; }
    public string AgenteId { get; set; } = string.Empty;
    public string? AgenteNombre { get; set; }
    public string ClienteId { get; set; } = string.Empty;
    public string? ClienteNombre { get; set; }
    public string TipoInteraccion { get; set; } = string.Empty;
    public DateTime Fecha { get; set; }
    public string? Turno { get; set; }
    public int? DuracionMinutos { get; set; }
    public string? Resultado { get; set; }
    public string? ObjetivoVisita { get; set; }
    public string? ResumenVisita { get; set; }
    public string? ProximaAccion { get; set; }
    public DateTime? FechaProximaAccion { get; set; }
    public decimal? Latitud { get; set; }
    public decimal? Longitud { get; set; }
    public string? Observaciones { get; set; }
    public DateTime FechaCreacion { get; set; }
    public string? CreadoPor { get; set; }
    public DateTime? FechaModificacion { get; set; }
    public string? ModificadoPor { get; set; }
}

public class CreateInteraccionDto
{
    public string TipoInteraccionId { get; set; } = string.Empty;
    public Dictionary<string, object?>? DatosDinamicos { get; set; }
    public string CodigoInteraccion { get; set; } = string.Empty;
    public string RelacionId { get; set; } = string.Empty;
    public string AgenteId { get; set; } = string.Empty;
    public string ClienteId { get; set; } = string.Empty;
    public string TipoInteraccion { get; set; } = string.Empty;
    public DateTime Fecha { get; set; } = DateTime.Now;
    public string? Turno { get; set; }
    public int? DuracionMinutos { get; set; }
    public string? Resultado { get; set; }
    public string? ObjetivoVisita { get; set; }
    public string? ResumenVisita { get; set; }
    public string? ProximaAccion { get; set; }
    public DateTime? FechaProximaAccion { get; set; }
    public decimal? Latitud { get; set; }
    public decimal? Longitud { get; set; }
    public string? Observaciones { get; set; }
}

public class UpdateInteraccionDto
{
    public Dictionary<string, object?>? DatosDinamicos { get; set; }
    public string TipoInteraccion { get; set; } = string.Empty;
    public DateTime Fecha { get; set; }
    public string? Turno { get; set; }
    public int? DuracionMinutos { get; set; }
    public string? Resultado { get; set; }
    public string? ObjetivoVisita { get; set; }
    public string? ResumenVisita { get; set; }
    public string? ProximaAccion { get; set; }
    public DateTime? FechaProximaAccion { get; set; }
    public decimal? Latitud { get; set; }
    public decimal? Longitud { get; set; }
    public string? Observaciones { get; set; }
}

public class InteraccionListResponse
{
    public List<InteraccionDto> Items { get; set; } = new();
    public int TotalItems { get; set; }
    public int TotalPages { get; set; }
    public int CurrentPage { get; set; }
}
