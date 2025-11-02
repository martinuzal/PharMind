using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PharMind.API.Models;

[Table("Empresas")]
public class Empresa : AuditableEntity
{
    [Required]
    [Column("Nombre")]
    [MaxLength(200)]
    public string Nombre { get; set; } = string.Empty;

    [Column("RazonSocial")]
    [MaxLength(200)]
    public string? RazonSocial { get; set; }

    [Column("CUIT")]
    [MaxLength(20)]
    public string? CUIT { get; set; }

    [Column("Telefono")]
    [MaxLength(50)]
    public string? Telefono { get; set; }

    [Column("Email")]
    [MaxLength(255)]
    public string? Email { get; set; }

    [Column("Direccion")]
    [MaxLength(500)]
    public string? Direccion { get; set; }

    [Column("Logo")]
    public string? Logo { get; set; }

    [Column("Activo")]
    public bool Activo { get; set; } = true;
}
