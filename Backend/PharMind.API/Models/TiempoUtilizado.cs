using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PharMind.API.Models;

[Table("TiempoUtilizado")]
public class TiempoUtilizado : AuditableEntity
{
    [Required]
    [Column("RepresentanteId")]
    public string RepresentanteId { get; set; } = string.Empty;

    [Required]
    [Column("Fecha")]
    public DateTime Fecha { get; set; } = DateTime.Today;

    [Required]
    [Column("TipoActividadId")]
    public string TipoActividadId { get; set; } = string.Empty;

    [Column("Descripcion")]
    [MaxLength(500)]
    public string? Descripcion { get; set; }

    [Required]
    [Column("HorasUtilizadas")]
    public decimal HorasUtilizadas { get; set; }

    [Column("MinutosUtilizados")]
    public int MinutosUtilizados { get; set; }

    [Column("Turno")]
    [MaxLength(20)]
    public string Turno { get; set; } = "TodoElDia"; // Mañana, Tarde, TodoElDia

    [Column("EsRecurrente")]
    public bool EsRecurrente { get; set; } = false;

    [Column("Observaciones")]
    [MaxLength(1000)]
    public string? Observaciones { get; set; }

    // Navigation properties
    [ForeignKey("RepresentanteId")]
    public virtual Usuario? Representante { get; set; }

    [ForeignKey("TipoActividadId")]
    public virtual TipoActividad? TipoActividad { get; set; }
}
