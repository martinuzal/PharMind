using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PharMind.API.Models;

[Table("TiposActividad")]
public class TipoActividad : AuditableEntity
{
    [Required]
    [Column("Codigo")]
    [MaxLength(50)]
    public string Codigo { get; set; } = string.Empty;

    [Required]
    [Column("Nombre")]
    [MaxLength(200)]
    public string Nombre { get; set; } = string.Empty;

    [Column("Descripcion")]
    [MaxLength(500)]
    public string? Descripcion { get; set; }

    [Required]
    [Column("Clasificacion")]
    [MaxLength(50)]
    public string Clasificacion { get; set; } = "Laboral"; // Laboral / ExtraLaboral

    [Column("Color")]
    [MaxLength(20)]
    public string? Color { get; set; }

    [Column("Icono")]
    [MaxLength(50)]
    public string? Icono { get; set; }

    [Column("Activo")]
    public bool Activo { get; set; } = true;

    [Column("EsSistema")]
    public bool EsSistema { get; set; } = false;

    [Column("Orden")]
    public int? Orden { get; set; }

    // Navigation properties
    public virtual ICollection<TiempoUtilizado> TiemposUtilizados { get; set; } = new List<TiempoUtilizado>();
}
