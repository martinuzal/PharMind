using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PharMind.API.Models;

[Table("Distritos")]
public class Distrito : AuditableEntity
{
    [Required]
    [Column("RegionId")]
    public string RegionId { get; set; } = string.Empty;

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
    [ForeignKey("RegionId")]
    public virtual Region? Region { get; set; }

    public virtual ICollection<Agente> Agentes { get; set; } = new List<Agente>();
    public virtual ICollection<ManagerDistrito> ManagerDistritos { get; set; } = new List<ManagerDistrito>();
}
