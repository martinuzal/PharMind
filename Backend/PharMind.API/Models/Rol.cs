using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PharMind.API.Models;

[Table("Roles")]
public class Rol : AuditableEntity
{
    [Required]
    [Column("EmpresaId")]
    public string EmpresaId { get; set; } = string.Empty;

    [Required]
    [Column("Nombre")]
    [MaxLength(100)]
    public string Nombre { get; set; } = string.Empty;

    [Column("Descripcion")]
    [MaxLength(500)]
    public string? Descripcion { get; set; }

    [Column("EsSistema")]
    public bool EsSistema { get; set; } = false;

    [Column("Activo")]
    public bool Activo { get; set; } = true;

    // Navigation properties
    [ForeignKey("EmpresaId")]
    public virtual Empresa? Empresa { get; set; }

    public virtual ICollection<UsuarioRol> UsuarioRoles { get; set; } = new List<UsuarioRol>();
    public virtual ICollection<RolModulo> RolModulos { get; set; } = new List<RolModulo>();
}
