using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PharMind.API.Models;

[Table("Direcciones")]
public class Direccion : AuditableEntity
{
    [Column("Calle")]
    [MaxLength(200)]
    public string? Calle { get; set; }

    [Column("Numero")]
    [MaxLength(20)]
    public string? Numero { get; set; }

    [Column("Apartamento")]
    [MaxLength(50)]
    public string? Apartamento { get; set; }

    [Column("Colonia")]
    [MaxLength(100)]
    public string? Colonia { get; set; }

    [Column("Ciudad")]
    [MaxLength(100)]
    public string? Ciudad { get; set; }

    [Column("Estado")]
    [MaxLength(100)]
    public string? Estado { get; set; }

    [Column("CodigoPostal")]
    [MaxLength(20)]
    public string? CodigoPostal { get; set; }

    [Column("Pais")]
    [MaxLength(100)]
    public string? Pais { get; set; }

    [Column("Referencia")]
    [MaxLength(500)]
    public string? Referencia { get; set; }

    [Column("TipoDireccion")]
    [MaxLength(50)]
    public string? TipoDireccion { get; set; } // Casa, Trabajo, Consultorio, etc.

    [Column("EsPrincipal")]
    public bool EsPrincipal { get; set; } = false;

    [Column("Latitud")]
    public decimal? Latitud { get; set; }

    [Column("Longitud")]
    public decimal? Longitud { get; set; }
}
