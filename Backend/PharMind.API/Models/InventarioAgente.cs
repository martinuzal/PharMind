using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PharMind.API.Models;

/// <summary>
/// Representa el inventario de productos/muestras de un agente
/// </summary>
[Table("InventariosAgente")]
public class InventarioAgente : AuditableEntity
{
    [Required]
    [Column("AgenteId")]
    public string AgenteId { get; set; } = string.Empty;

    [Required]
    [Column("ProductoId")]
    public string ProductoId { get; set; } = string.Empty;

    [Required]
    [Column("CantidadDisponible")]
    public int CantidadDisponible { get; set; } = 0;

    [Column("CantidadInicial")]
    public int? CantidadInicial { get; set; }

    [Column("CantidadEntregada")]
    public int CantidadEntregada { get; set; } = 0;

    [Column("FechaUltimaRecarga")]
    public DateTime? FechaUltimaRecarga { get; set; }

    [Column("LoteActual")]
    [MaxLength(50)]
    public string? LoteActual { get; set; }

    [Column("FechaVencimiento")]
    public DateTime? FechaVencimiento { get; set; }

    [Column("Observaciones")]
    [MaxLength(500)]
    public string? Observaciones { get; set; }

    // Navigation properties
    [ForeignKey("AgenteId")]
    public virtual Agente? Agente { get; set; }

    [ForeignKey("ProductoId")]
    public virtual Producto? Producto { get; set; }

    public virtual ICollection<MovimientoInventario> Movimientos { get; set; } = new List<MovimientoInventario>();
}
