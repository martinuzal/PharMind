using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PharMind.API.Models;

[Table("Agentes")]
public class Agente : AuditableEntity
{
    // Relación con esquema personalizado (define el tipo de agente)
    [Required]
    [Column("TipoAgenteId")]
    public string TipoAgenteId { get; set; } = string.Empty;

    // Relación con entidad dinámica (datos extendidos)
    [Column("EntidadDinamicaId")]
    public string? EntidadDinamicaId { get; set; }

    // Datos base del agente
    [Required]
    [Column("CodigoAgente")]
    [MaxLength(50)]
    public string CodigoAgente { get; set; } = string.Empty;

    [Required]
    [Column("Nombre")]
    [MaxLength(200)]
    public string Nombre { get; set; } = string.Empty;

    [Column("Apellido")]
    [MaxLength(200)]
    public string? Apellido { get; set; }

    [Column("Email")]
    [MaxLength(255)]
    public string? Email { get; set; }

    [Column("Telefono")]
    [MaxLength(50)]
    public string? Telefono { get; set; }

    // Relaciones con tablas fijas
    [Column("RegionId")]
    public string? RegionId { get; set; }

    [Column("DistritoId")]
    public string? DistritoId { get; set; }

    [Column("LineaNegocioId")]
    public string? LineaNegocioId { get; set; }

    [Column("ManagerId")]
    public string? ManagerId { get; set; }

    [Column("FechaIngreso")]
    public DateTime? FechaIngreso { get; set; }

    [Required]
    [Column("Activo")]
    public bool Activo { get; set; } = true;

    [Column("Observaciones")]
    [MaxLength(1000)]
    public string? Observaciones { get; set; }

    // Navigation properties
    [ForeignKey("TipoAgenteId")]
    public virtual EsquemaPersonalizado? TipoAgente { get; set; }

    [ForeignKey("EntidadDinamicaId")]
    public virtual EntidadDinamica? DatosExtendidos { get; set; }

    [ForeignKey("RegionId")]
    public virtual Region? Region { get; set; }

    [ForeignKey("DistritoId")]
    public virtual Distrito? Distrito { get; set; }

    [ForeignKey("LineaNegocioId")]
    public virtual LineaNegocio? LineaNegocio { get; set; }

    [ForeignKey("ManagerId")]
    public virtual Manager? Manager { get; set; }

    public virtual ICollection<Relacion> Relaciones { get; set; } = new List<Relacion>();
    public virtual ICollection<Interaccion> Interacciones { get; set; } = new List<Interaccion>();
}
