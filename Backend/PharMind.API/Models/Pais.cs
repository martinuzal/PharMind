using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PharMind.API.Models;

[Table("Paises")]
public class Pais : AuditableEntity
{
    [Column("Nombre")]
    [Required]
    [MaxLength(100)]
    public string Nombre { get; set; } = string.Empty;

    [Column("Codigo")]
    [MaxLength(10)]
    public string? Codigo { get; set; } // Código ISO del país (ej: MX, US)

    [Column("Activo")]
    public bool Activo { get; set; } = true;
}
