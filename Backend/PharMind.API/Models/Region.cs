using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PharMind.API.Models;

[Table("Regiones")]
public class Region : AuditableEntity
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

    [Column("LegacyCode")]
    [MaxLength(100)]
    public string? LegacyCode { get; set; }

    [Column("Legajo")]
    [MaxLength(100)]
    public string? Legajo { get; set; }

    [Column("Color")]
    [MaxLength(20)]
    public string? Color { get; set; }

    [Column("Icono")]
    [MaxLength(50)]
    public string? Icono { get; set; }

    [Column("Activo")]
    public bool Activo { get; set; } = true;

    [Column("Orden")]
    public int? Orden { get; set; }

    // Navigation properties
    public virtual ICollection<Distrito> Distritos { get; set; } = new List<Distrito>();
    public virtual ICollection<ManagerRegion> ManagerRegiones { get; set; } = new List<ManagerRegion>();
}
