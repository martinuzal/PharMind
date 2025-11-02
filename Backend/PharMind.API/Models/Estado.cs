using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PharMind.API.Models;

[Table("Estados")]
public class Estado : AuditableEntity
{
    [Column("Nombre")]
    [Required]
    [MaxLength(100)]
    public string Nombre { get; set; } = string.Empty;

    [Column("PaisId")]
    public string? PaisId { get; set; }

    [Column("Codigo")]
    [MaxLength(10)]
    public string? Codigo { get; set; } // Código del estado (ej: JAL, CDMX)

    [Column("Activo")]
    public bool Activo { get; set; } = true;

    // Relaciones
    [ForeignKey("PaisId")]
    public Pais? Pais { get; set; }
}
