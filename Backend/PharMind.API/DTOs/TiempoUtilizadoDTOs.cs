namespace PharMind.API.DTOs;

public class TiempoUtilizadoDto
{
    public string Id { get; set; } = string.Empty;
    public string RepresentanteId { get; set; } = string.Empty;
    public string RepresentanteNombre { get; set; } = string.Empty;
    public DateTime Fecha { get; set; }
    public string TipoActividadId { get; set; } = string.Empty;
    public string TipoActividadNombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public decimal HorasUtilizadas { get; set; }
    public int MinutosUtilizados { get; set; }
    public string Turno { get; set; } = "TodoElDia";
    public decimal TiempoTotalHoras { get; set; }
    public bool EsRecurrente { get; set; }
    public string? Observaciones { get; set; }
    public DateTime FechaCreacion { get; set; }
    public string? CreadoPor { get; set; }
    public DateTime? FechaModificacion { get; set; }
    public string? ModificadoPor { get; set; }
}

public class CreateTiempoUtilizadoDto
{
    public string RepresentanteId { get; set; } = string.Empty;
    public DateTime Fecha { get; set; } = DateTime.Today;
    public string TipoActividadId { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public decimal HorasUtilizadas { get; set; }
    public int MinutosUtilizados { get; set; }
    public string Turno { get; set; } = "TodoElDia";
    public bool EsRecurrente { get; set; }
    public string? Observaciones { get; set; }
}

public class UpdateTiempoUtilizadoDto
{
    public DateTime Fecha { get; set; }
    public string TipoActividadId { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public decimal HorasUtilizadas { get; set; }
    public int MinutosUtilizados { get; set; }
    public string Turno { get; set; } = "TodoElDia";
    public bool EsRecurrente { get; set; }
    public string? Observaciones { get; set; }
}

public class TiempoUtilizadoListResponse
{
    public List<TiempoUtilizadoDto> Items { get; set; } = new();
    public int TotalItems { get; set; }
    public int TotalPages { get; set; }
    public int CurrentPage { get; set; }
}

public class TiempoUtilizadoEstadisticasDto
{
    public decimal TotalHorasNoPromocion { get; set; }
    public decimal PromedioHorasDiarias { get; set; }
    public int TotalRegistros { get; set; }
    public Dictionary<string, decimal> HorasPorTipoActividad { get; set; } = new();
    public Dictionary<string, int> RegistrosPorRepresentante { get; set; } = new();
}
