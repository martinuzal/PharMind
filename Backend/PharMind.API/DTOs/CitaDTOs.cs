using System.ComponentModel.DataAnnotations;

namespace PharMind.API.DTOs;

// ==================== CITA ====================

public class CitaDto
{
    public string Id { get; set; } = string.Empty;
    public string CodigoCita { get; set; } = string.Empty;
    public string AgenteId { get; set; } = string.Empty;
    public string? AgenteNombre { get; set; }
    public string? RelacionId { get; set; }
    public string? ClienteId { get; set; }
    public string? ClienteNombre { get; set; }
    public string? InteraccionId { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public DateTime FechaInicio { get; set; }
    public DateTime FechaFin { get; set; }
    public bool TodoElDia { get; set; }
    public string? TipoCita { get; set; }
    public string Estado { get; set; } = "Programada";
    public string? Prioridad { get; set; }
    public string? Ubicacion { get; set; }
    public decimal? Latitud { get; set; }
    public decimal? Longitud { get; set; }
    public string? Color { get; set; }
    public bool Recordatorio { get; set; }
    public int MinutosAntes { get; set; }
    public string? Notas { get; set; }
    public int? Orden { get; set; }
    public decimal? DistanciaKm { get; set; }
    public int? TiempoEstimadoMinutos { get; set; }
    public DateTime FechaCreacion { get; set; }

    // Helpers calculados
    public bool EsHoy { get; set; }
    public bool YaPaso { get; set; }
    public bool EnProgreso { get; set; }
    public int DuracionMinutos { get; set; }
}

public class CreateCitaDto
{
    [Required]
    public string AgenteId { get; set; } = string.Empty;

    public string? RelacionId { get; set; }
    public string? ClienteId { get; set; }

    [Required]
    [MaxLength(200)]
    public string Titulo { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? Descripcion { get; set; }

    [Required]
    public DateTime FechaInicio { get; set; }

    [Required]
    public DateTime FechaFin { get; set; }

    public bool TodoElDia { get; set; } = false;

    [MaxLength(50)]
    public string? TipoCita { get; set; }

    [MaxLength(50)]
    public string Estado { get; set; } = "Programada";

    [MaxLength(20)]
    public string? Prioridad { get; set; }

    [MaxLength(500)]
    public string? Ubicacion { get; set; }

    public decimal? Latitud { get; set; }
    public decimal? Longitud { get; set; }

    [MaxLength(20)]
    public string? Color { get; set; }

    public bool Recordatorio { get; set; } = true;

    [Range(0, 1440)]
    public int MinutosAntes { get; set; } = 30;

    [MaxLength(2000)]
    public string? Notas { get; set; }
}

public class UpdateCitaDto
{
    [MaxLength(200)]
    public string? Titulo { get; set; }

    [MaxLength(1000)]
    public string? Descripcion { get; set; }

    public DateTime? FechaInicio { get; set; }
    public DateTime? FechaFin { get; set; }
    public bool? TodoElDia { get; set; }

    [MaxLength(50)]
    public string? TipoCita { get; set; }

    [MaxLength(50)]
    public string? Estado { get; set; }

    [MaxLength(20)]
    public string? Prioridad { get; set; }

    [MaxLength(500)]
    public string? Ubicacion { get; set; }

    public decimal? Latitud { get; set; }
    public decimal? Longitud { get; set; }

    [MaxLength(20)]
    public string? Color { get; set; }

    public bool? Recordatorio { get; set; }

    [Range(0, 1440)]
    public int? MinutosAntes { get; set; }

    [MaxLength(2000)]
    public string? Notas { get; set; }

    public int? Orden { get; set; }
    public decimal? DistanciaKm { get; set; }
    public int? TiempoEstimadoMinutos { get; set; }
}

public class CambiarEstadoCitaDto
{
    [Required]
    [MaxLength(50)]
    public string Estado { get; set; } = string.Empty; // Programada, Completada, Cancelada, Reprogramada
}

public class CompletarCitaDto
{
    [Required]
    public string InteraccionId { get; set; } = string.Empty;
}

public class CitaFiltrosDto
{
    public string? AgenteId { get; set; }
    public DateTime? Desde { get; set; }
    public DateTime? Hasta { get; set; }
    public string? Estado { get; set; }
    public string? TipoCita { get; set; }
    public string? Prioridad { get; set; }
}
