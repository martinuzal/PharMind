using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PharMind.API.Models;

/// <summary>
/// Representa una cita o visita programada en el calendario del agente
/// </summary>
[Table("Citas")]
public class Cita : AuditableEntity
{
    [Required]
    [Column("CodigoCita")]
    [MaxLength(50)]
    public string CodigoCita { get; set; } = string.Empty;

    [Required]
    [Column("AgenteId")]
    public string AgenteId { get; set; } = string.Empty;

    [Column("RelacionId")]
    public string? RelacionId { get; set; }

    [Column("ClienteId")]
    public string? ClienteId { get; set; }

    [Column("InteraccionId")]
    public string? InteraccionId { get; set; } // Si ya se completó la visita

    [Required]
    [Column("Titulo")]
    [MaxLength(200)]
    public string Titulo { get; set; } = string.Empty;

    [Column("Descripcion")]
    [MaxLength(1000)]
    public string? Descripcion { get; set; }

    [Required]
    [Column("FechaInicio")]
    public DateTime FechaInicio { get; set; }

    [Required]
    [Column("FechaFin")]
    public DateTime FechaFin { get; set; }

    [Column("TodoElDia")]
    public bool TodoElDia { get; set; } = false;

    [Column("TipoCita")]
    [MaxLength(50)]
    public string? TipoCita { get; set; } // "Visita", "Llamada", "Evento", "Reunión", "Otro"

    [Required]
    [Column("Estado")]
    [MaxLength(50)]
    public string Estado { get; set; } = "Programada"; // "Programada", "Completada", "Cancelada", "Reprogramada", "NoRealizada"

    [Column("Prioridad")]
    [MaxLength(20)]
    public string? Prioridad { get; set; } // "Alta", "Media", "Baja"

    [Column("Ubicacion")]
    [MaxLength(500)]
    public string? Ubicacion { get; set; }

    [Column("Latitud", TypeName = "decimal(10, 7)")]
    public decimal? Latitud { get; set; }

    [Column("Longitud", TypeName = "decimal(10, 7)")]
    public decimal? Longitud { get; set; }

    [Column("Color")]
    [MaxLength(20)]
    public string? Color { get; set; } // Hex color para el calendario

    [Column("Recordatorio")]
    public bool Recordatorio { get; set; } = true;

    [Column("MinutosAntes")]
    public int MinutosAntes { get; set; } = 30; // Minutos antes para recordatorio

    [Column("Notas")]
    [MaxLength(2000)]
    public string? Notas { get; set; }

    [Column("Orden")]
    public int? Orden { get; set; } // Orden en la ruta del día

    [Column("DistanciaKm", TypeName = "decimal(10, 2)")]
    public decimal? DistanciaKm { get; set; } // Distancia desde la ubicación anterior

    [Column("TiempoEstimadoMinutos")]
    public int? TiempoEstimadoMinutos { get; set; }

    // Navigation properties
    [ForeignKey("AgenteId")]
    public virtual Agente? Agente { get; set; }

    [ForeignKey("RelacionId")]
    public virtual Relacion? Relacion { get; set; }

    [ForeignKey("ClienteId")]
    public virtual Cliente? Cliente { get; set; }

    [ForeignKey("InteraccionId")]
    public virtual Interaccion? Interaccion { get; set; }
}
