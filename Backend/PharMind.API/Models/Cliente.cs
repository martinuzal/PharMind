using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PharMind.API.Models;

[Table("Clientes")]
public class Cliente : AuditableEntity
{
    // Relación con esquema personalizado (define el tipo de cliente)
    [Required]
    [Column("TipoClienteId")]
    public string TipoClienteId { get; set; } = string.Empty;

    // Relación con entidad dinámica (datos extendidos)
    [Column("EntidadDinamicaId")]
    public string? EntidadDinamicaId { get; set; }

    // Datos base del cliente
    [Required]
    [Column("CodigoCliente")]
    [MaxLength(50)]
    public string CodigoCliente { get; set; } = string.Empty;

    [Required]
    [Column("Nombre")]
    [MaxLength(200)]
    public string Nombre { get; set; } = string.Empty;

    [Column("Apellido")]
    [MaxLength(200)]
    public string? Apellido { get; set; }

    [Required]
    [Column("RazonSocial")]
    [MaxLength(300)]
    public string RazonSocial { get; set; } = string.Empty;

    [Column("Especialidad")]
    [MaxLength(200)]
    public string? Especialidad { get; set; }

    [Column("Categoria")]
    [MaxLength(100)]
    public string? Categoria { get; set; }

    [Column("Segmento")]
    [MaxLength(100)]
    public string? Segmento { get; set; }

    [Column("InstitucionId")]
    public string? InstitucionId { get; set; } // FK a Clientes (si es médico)

    [Column("Email")]
    [MaxLength(200)]
    public string? Email { get; set; }

    [Column("Telefono")]
    [MaxLength(50)]
    public string? Telefono { get; set; }

    [Column("DireccionId")]
    public string? DireccionId { get; set; }

    [Required]
    [Column("Estado")]
    [MaxLength(50)]
    public string Estado { get; set; } = "Activo";

    // Navigation properties
    [ForeignKey("TipoClienteId")]
    public virtual EsquemaPersonalizado? TipoCliente { get; set; }

    [ForeignKey("EntidadDinamicaId")]
    public virtual EntidadDinamica? DatosExtendidos { get; set; }

    [ForeignKey("InstitucionId")]
    public virtual Cliente? Institucion { get; set; }

    [ForeignKey("DireccionId")]
    public virtual Direccion? Direccion { get; set; }

    public virtual ICollection<Cliente> MedicosAsociados { get; set; } = new List<Cliente>();
    public virtual ICollection<Relacion> RelacionesPrincipales { get; set; } = new List<Relacion>();
    public virtual ICollection<Relacion> RelacionesSecundarias1 { get; set; } = new List<Relacion>();
    public virtual ICollection<Relacion> RelacionesSecundarias2 { get; set; } = new List<Relacion>();
    public virtual ICollection<Interaccion> Interacciones { get; set; } = new List<Interaccion>();
}
