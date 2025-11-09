using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PharMind.API.Models;

[Table("UsuarioRoles")]
public class UsuarioRol : AuditableEntity
{
    [Required]
    [Column("UsuarioId")]
    public string UsuarioId { get; set; } = string.Empty;

    [Required]
    [Column("RolId")]
    public string RolId { get; set; } = string.Empty;

    [Column("FechaAsignacion")]
    public DateTime FechaAsignacion { get; set; } = DateTime.Now;

    [Column("AsignadoPor")]
    [MaxLength(255)]
    public string? AsignadoPor { get; set; }

    // Navigation properties
    public virtual Usuario? Usuario { get; set; }

    public virtual Rol? Rol { get; set; }
}
