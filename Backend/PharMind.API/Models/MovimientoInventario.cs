using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PharMind.API.Models;

/// <summary>
/// Representa un movimiento de inventario (entrada/salida)
/// </summary>
[Table("MovimientosInventario")]
public class MovimientoInventario : AuditableEntity
{
    [Required]
    [Column("InventarioAgenteId")]
    public string InventarioAgenteId { get; set; } = string.Empty;

    [Required]
    [Column("TipoMovimiento")]
    [MaxLength(20)]
    public string TipoMovimiento { get; set; } = string.Empty; // "Entrada", "Salida", "Ajuste"

    [Required]
    [Column("Cantidad")]
    public int Cantidad { get; set; }

    [Column("CantidadAnterior")]
    public int CantidadAnterior { get; set; }

    [Column("CantidadNueva")]
    public int CantidadNueva { get; set; }

    [Column("MuestraMedicaId")]
    public string? MuestraMedicaId { get; set; } // Si es por entrega de muestra

    [Column("Motivo")]
    [MaxLength(200)]
    public string? Motivo { get; set; }

    [Column("Observaciones")]
    [MaxLength(500)]
    public string? Observaciones { get; set; }

    [Column("FechaMovimiento")]
    public DateTime FechaMovimiento { get; set; } = DateTime.Now;

    // Navigation properties
    [ForeignKey("InventarioAgenteId")]
    public virtual InventarioAgente? InventarioAgente { get; set; }

    [ForeignKey("MuestraMedicaId")]
    public virtual MuestraMedica? MuestraMedica { get; set; }
}
