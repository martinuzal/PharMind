using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PharMind.API.Models;

[Table("Calles")]
public class Calle : AuditableEntity
{
    [Column("Nombre")]
    [Required]
    [MaxLength(200)]
    public string Nombre { get; set; } = string.Empty;

    [Column("CiudadId")]
    public string? CiudadId { get; set; }

    [Column("Colonia")]
    [MaxLength(100)]
    public string? Colonia { get; set; }

    [Column("CodigoPostal")]
    [MaxLength(20)]
    public string? CodigoPostal { get; set; }

    [Column("Activo")]
    public bool Activo { get; set; } = true;

    // Relaciones
    [ForeignKey("CiudadId")]
    public Ciudad? Ciudad { get; set; }
}
