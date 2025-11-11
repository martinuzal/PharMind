using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PharMind.API.Models;

[Table("Interacciones")]
public class Interaccion : AuditableEntity
{
    // Relación con esquema personalizado (define el tipo de interacción)
    [Required]
    [Column("TipoInteraccionId")]
    public string TipoInteraccionId { get; set; } = string.Empty;

    [Required]
    [Column("CodigoInteraccion")]
    [MaxLength(50)]
    public string CodigoInteraccion { get; set; } = string.Empty;

    [Required]
    [Column("RelacionId")]
    public string RelacionId { get; set; } = string.Empty;

    [Required]
    [Column("AgenteId")]
    public string AgenteId { get; set; } = string.Empty; // Desnormalizado para queries

    [Required]
    [Column("ClienteId")]
    public string ClienteId { get; set; } = string.Empty; // Desnormalizado para queries

    [Required]
    [Column("TipoInteraccion")]
    [MaxLength(100)]
    public string TipoInteraccion { get; set; } = string.Empty; // 'Visita', 'Llamada', 'Email', 'Evento'

    [Required]
    [Column("Fecha")]
    public DateTime Fecha { get; set; }

    [Column("Turno")]
    [MaxLength(20)]
    public string? Turno { get; set; } // 'Mañana', 'Tarde', 'TodoElDia'

    [Column("DuracionMinutos")]
    public int? DuracionMinutos { get; set; }

    [Column("Resultado")]
    [MaxLength(100)]
    public string? Resultado { get; set; } // 'Exitosa', 'NoContacto', 'Rechazada'

    [Column("ObjetivoVisita")]
    [MaxLength(500)]
    public string? ObjetivoVisita { get; set; }

    [Column("ResumenVisita")]
    [MaxLength(2000)]
    public string? ResumenVisita { get; set; }

    [Column("ProximaAccion")]
    [MaxLength(500)]
    public string? ProximaAccion { get; set; }

    [Column("FechaProximaAccion")]
    public DateTime? FechaProximaAccion { get; set; }

    [Column("Latitud", TypeName = "decimal(10, 7)")]
    public decimal? Latitud { get; set; }

    [Column("Longitud", TypeName = "decimal(10, 7)")]
    public decimal? Longitud { get; set; }

    [Column("Observaciones")]
    [MaxLength(2000)]
    public string? Observaciones { get; set; }

    [Column("EntidadDinamicaId")]
    public string? EntidadDinamicaId { get; set; }

    // Navigation properties
    [ForeignKey("TipoInteraccionId")]
    public virtual EsquemasPersonalizado? TipoInteraccionEsquema { get; set; }

    [ForeignKey("RelacionId")]
    public virtual Relacion? Relacion { get; set; }

    [ForeignKey("AgenteId")]
    public virtual Agente? Agente { get; set; }

    [ForeignKey("ClienteId")]
    public virtual Cliente? Cliente { get; set; }

    [ForeignKey("EntidadDinamicaId")]
    public virtual EntidadesDinamica? DatosExtendidos { get; set; }

    // Relaciones con productos
    public virtual ICollection<InteraccionProductoPromocionado> ProductosPromocionados { get; set; } = new List<InteraccionProductoPromocionado>();
    public virtual ICollection<InteraccionMuestraEntregada> MuestrasEntregadas { get; set; } = new List<InteraccionMuestraEntregada>();
    public virtual ICollection<InteraccionProductoSolicitado> ProductosSolicitados { get; set; } = new List<InteraccionProductoSolicitado>();
}
