using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PharMind.API.Models;

[Table("Ciudades")]
public class Ciudad : AuditableEntity
{
    [Column("Nombre")]
    [Required]
    [MaxLength(100)]
    public string Nombre { get; set; } = string.Empty;

    [Column("EstadoId")]
    public string? EstadoId { get; set; }

    [Column("CodigoPostal")]
    [MaxLength(20)]
    public string? CodigoPostal { get; set; }

    [Column("Activo")]
    public bool Activo { get; set; } = true;

    // Relaciones
    [ForeignKey("EstadoId")]
    public Estado? Estado { get; set; }
}
