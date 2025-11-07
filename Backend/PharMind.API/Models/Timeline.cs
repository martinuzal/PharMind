using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PharMind.API.Models;

/// <summary>
/// Timeline de períodos para asignar a agentes
/// Define un conjunto de períodos de corte de información
/// </summary>
[Table("Timelines")]
public class Timeline
{
    [Key]
    public Guid Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Nombre { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Descripcion { get; set; }

    /// <summary>
    /// Color para visualización en UI
    /// </summary>
    [MaxLength(20)]
    public string? Color { get; set; }

    /// <summary>
    /// Año de referencia para los períodos
    /// </summary>
    public int Anio { get; set; }

    /// <summary>
    /// Indica si este timeline está activo
    /// </summary>
    public bool Activo { get; set; } = true;

    /// <summary>
    /// Indica si es el timeline por defecto
    /// </summary>
    public bool EsDefault { get; set; } = false;

    // Auditoría
    public DateTime FechaCreacion { get; set; } = DateTime.Now;
    public string? CreadoPor { get; set; }
    public DateTime? FechaModificacion { get; set; }
    public string? ModificadoPor { get; set; }
    public bool Status { get; set; } = true;

    // Relaciones
    public virtual ICollection<Period> Periods { get; set; } = new List<Period>();
    public virtual ICollection<Agente> Agentes { get; set; } = new List<Agente>();
}
