using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PharMind.API.Models;

/// <summary>
/// Período dentro de un Timeline
/// Define un rango de fechas para corte de información
/// </summary>
[Table("Periods")]
public class Period
{
    [Key]
    public Guid Id { get; set; }

    [Required]
    public Guid TimelineId { get; set; }

    [Required]
    [MaxLength(100)]
    public string Nombre { get; set; } = string.Empty;

    /// <summary>
    /// Código corto del período (ej: "P1", "P2", "Q1", "ENE")
    /// </summary>
    [MaxLength(20)]
    public string? Codigo { get; set; }

    /// <summary>
    /// Número de orden del período dentro del timeline
    /// </summary>
    public int Orden { get; set; }

    /// <summary>
    /// Fecha de inicio del período (mes y día)
    /// </summary>
    [Required]
    public DateTime FechaInicio { get; set; }

    /// <summary>
    /// Fecha de fin del período (mes y día)
    /// </summary>
    [Required]
    public DateTime FechaFin { get; set; }

    /// <summary>
    /// Color para visualización en UI
    /// </summary>
    [MaxLength(20)]
    public string? Color { get; set; }

    /// <summary>
    /// Descripción adicional del período
    /// </summary>
    [MaxLength(500)]
    public string? Descripcion { get; set; }

    /// <summary>
    /// Indica si este período está activo
    /// </summary>
    public bool Activo { get; set; } = true;

    // Auditoría
    public DateTime FechaCreacion { get; set; } = DateTime.Now;
    public string? CreadoPor { get; set; }
    public DateTime? FechaModificacion { get; set; }
    public string? ModificadoPor { get; set; }
    public bool Status { get; set; } = true;

    // Relaciones
    [ForeignKey(nameof(TimelineId))]
    public virtual Timeline Timeline { get; set; } = null!;
}
