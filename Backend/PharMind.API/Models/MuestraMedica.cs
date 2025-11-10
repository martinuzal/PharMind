using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PharMind.API.Models;

/// <summary>
/// Representa una muestra médica entregada durante una interacción
/// </summary>
[Table("MuestrasMedicas")]
public class MuestraMedica : AuditableEntity
{
    [Required]
    [Column("InteraccionId")]
    public string InteraccionId { get; set; } = string.Empty;

    [Required]
    [Column("ProductoId")]
    public string ProductoId { get; set; } = string.Empty;

    [Required]
    [Column("AgenteId")]
    public string AgenteId { get; set; } = string.Empty;

    [Required]
    [Column("ClienteId")]
    public string ClienteId { get; set; } = string.Empty;

    [Required]
    [Column("Cantidad")]
    public int Cantidad { get; set; }

    [Column("Lote")]
    [MaxLength(50)]
    public string? Lote { get; set; }

    [Column("FechaVencimiento")]
    public DateTime? FechaVencimiento { get; set; }

    [Column("FechaEntrega")]
    public DateTime FechaEntrega { get; set; } = DateTime.Now;

    [Column("Observaciones")]
    [MaxLength(500)]
    public string? Observaciones { get; set; }

    [Column("FirmaDigital")]
    [MaxLength(1000)]
    public string? FirmaDigital { get; set; } // Base64 de imagen de firma

    [Column("FotoComprobante")]
    [MaxLength(1000)]
    public string? FotoComprobante { get; set; } // URL o base64 de foto

    // Navigation properties
    [ForeignKey("InteraccionId")]
    public virtual Interaccion? Interaccion { get; set; }

    [ForeignKey("ProductoId")]
    public virtual Producto? Producto { get; set; }

    [ForeignKey("AgenteId")]
    public virtual Agente? Agente { get; set; }

    [ForeignKey("ClienteId")]
    public virtual Cliente? Cliente { get; set; }
}
