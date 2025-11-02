using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PharMind.API.Models;

[Table("Modulos")]
public class Modulo : AuditableEntity
{
    [Required]
    [Column("Nombre")]
    [MaxLength(100)]
    public string Nombre { get; set; } = string.Empty;

    [Column("Descripcion")]
    [MaxLength(500)]
    public string? Descripcion { get; set; }

    [Column("Icono")]
    [MaxLength(50)]
    public string? Icono { get; set; }

    [Column("Ruta")]
    [MaxLength(200)]
    public string? Ruta { get; set; }

    [Column("Orden")]
    public int Orden { get; set; } = 0;

    [Column("Activo")]
    public bool Activo { get; set; } = true;

    [Column("ModuloPadreId")]
    public string? ModuloPadreId { get; set; }

    // Navigation properties
    [ForeignKey("ModuloPadreId")]
    public virtual Modulo? ModuloPadre { get; set; }

    public virtual ICollection<Modulo> SubModulos { get; set; } = new List<Modulo>();
    public virtual ICollection<RolModulo> RolModulos { get; set; } = new List<RolModulo>();
}
