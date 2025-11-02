using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PharMind.API.Models;

[Table("RolModulos")]
public class RolModulo : AuditableEntity
{
    [Required]
    [Column("RolId")]
    public string RolId { get; set; } = string.Empty;

    [Required]
    [Column("ModuloId")]
    public string ModuloId { get; set; } = string.Empty;

    [Required]
    [Column("NivelAcceso")]
    [MaxLength(50)]
    public string NivelAcceso { get; set; } = "Lectura";

    [Column("PuedeVer")]
    public bool PuedeVer { get; set; } = false;

    [Column("PuedeCrear")]
    public bool PuedeCrear { get; set; } = false;

    [Column("PuedeEditar")]
    public bool PuedeEditar { get; set; } = false;

    [Column("PuedeEliminar")]
    public bool PuedeEliminar { get; set; } = false;

    [Column("PuedeExportar")]
    public bool PuedeExportar { get; set; } = false;

    [Column("PuedeImportar")]
    public bool PuedeImportar { get; set; } = false;

    [Column("PuedeAprobar")]
    public bool PuedeAprobar { get; set; } = false;

    // Navigation properties
    [ForeignKey("RolId")]
    public virtual Rol? Rol { get; set; }

    [ForeignKey("ModuloId")]
    public virtual Modulo? Modulo { get; set; }
}
