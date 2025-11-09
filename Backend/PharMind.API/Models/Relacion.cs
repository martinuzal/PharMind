using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PharMind.API.Models;

[Table("Relaciones")]
public class Relacion : AuditableEntity
{
    // Relación con esquema personalizado (define el tipo de relación)
    [Required]
    [Column("TipoRelacionId")]
    public string TipoRelacionId { get; set; } = string.Empty;

    // Relación con entidad dinámica (datos extendidos)
    [Column("EntidadDinamicaId")]
    public string? EntidadDinamicaId { get; set; }

    [Required]
    [Column("CodigoRelacion")]
    [MaxLength(50)]
    public string CodigoRelacion { get; set; } = string.Empty;

    [Required]
    [Column("AgenteId")]
    public string AgenteId { get; set; } = string.Empty;

    [Required]
    [Column("ClientePrincipalId")]
    public string ClientePrincipalId { get; set; } = string.Empty;

    [Column("ClienteSecundario1Id")]
    public string? ClienteSecundario1Id { get; set; }

    [Column("ClienteSecundario2Id")]
    public string? ClienteSecundario2Id { get; set; }

    [Column("TipoRelacion")]
    [MaxLength(100)]
    public string? TipoRelacion { get; set; }

    [Required]
    [Column("FechaInicio")]
    public DateTime FechaInicio { get; set; }

    [Column("FechaFin")]
    public DateTime? FechaFin { get; set; }

    [Required]
    [Column("Estado")]
    [MaxLength(50)]
    public string Estado { get; set; } = "Activa"; // 'Activa', 'Suspendida', 'Finalizada'

    [Column("FrecuenciaVisitas")]
    [MaxLength(50)]
    public string? FrecuenciaVisitas { get; set; } // Frecuencia: 'Semanal', 'Quincenal', 'Mensual', 'Bimensual', 'Trimestral'

    [Column("Prioridad")]
    [MaxLength(50)]
    public string Prioridad { get; set; } = "Media"; // 'Alta', 'Media', 'Baja'

    [Column("Observaciones")]
    [MaxLength(2000)]
    public string? Observaciones { get; set; }

    // Campos de segmentación
    [Column("EspecialidadId")]
    public Guid? EspecialidadId { get; set; }

    [Column("CategoriaId")]
    public Guid? CategoriaId { get; set; }

    [Column("Segment1Id")]
    public Guid? Segment1Id { get; set; }

    [Column("Segment2Id")]
    public Guid? Segment2Id { get; set; }

    [Column("Segment3Id")]
    public Guid? Segment3Id { get; set; }

    [Column("Segment4Id")]
    public Guid? Segment4Id { get; set; }

    [Column("Segment5Id")]
    public Guid? Segment5Id { get; set; }

    // Navigation properties
    [ForeignKey("TipoRelacionId")]
    public virtual EsquemasPersonalizado? TipoRelacionEsquema { get; set; }

    [ForeignKey("EntidadDinamicaId")]
    public virtual EntidadesDinamica? DatosExtendidos { get; set; }

    [ForeignKey("AgenteId")]
    public virtual Agente? Agente { get; set; }

    [ForeignKey("ClientePrincipalId")]
    public virtual Cliente? ClientePrincipal { get; set; }

    [ForeignKey("ClienteSecundario1Id")]
    public virtual Cliente? ClienteSecundario1 { get; set; }

    [ForeignKey("ClienteSecundario2Id")]
    public virtual Cliente? ClienteSecundario2 { get; set; }

    public virtual ICollection<Interaccion> Interacciones { get; set; } = new List<Interaccion>();
}
