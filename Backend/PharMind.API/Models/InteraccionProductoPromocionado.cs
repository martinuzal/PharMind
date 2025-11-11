using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PharMind.API.Models;

/// <summary>
/// Representa un producto promocionado en una interacción
/// </summary>
[Table("InteraccionProductosPromocionados")]
public class InteraccionProductoPromocionado : AuditableEntity
{
    [Required]
    [Column("InteraccionId")]
    public string InteraccionId { get; set; } = string.Empty;

    [Required]
    [Column("ProductoId")]
    public string ProductoId { get; set; } = string.Empty;

    [Required]
    [Column("Cantidad")]
    public int Cantidad { get; set; }

    [Column("Observaciones")]
    [MaxLength(500)]
    public string? Observaciones { get; set; }

    // Navigation properties
    [ForeignKey("InteraccionId")]
    public virtual Interaccion? Interaccion { get; set; }

    [ForeignKey("ProductoId")]
    public virtual Producto? Producto { get; set; }
}
