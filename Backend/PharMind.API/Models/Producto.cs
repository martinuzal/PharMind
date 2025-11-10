using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PharMind.API.Models;

/// <summary>
/// Representa un producto farmacéutico del catálogo
/// </summary>
[Table("Productos")]
public class Producto : AuditableEntity
{
    [Required]
    [Column("CodigoProducto")]
    [MaxLength(50)]
    public string CodigoProducto { get; set; } = string.Empty;

    [Required]
    [Column("Nombre")]
    [MaxLength(200)]
    public string Nombre { get; set; } = string.Empty;

    [Column("NombreComercial")]
    [MaxLength(200)]
    public string? NombreComercial { get; set; }

    [Column("Descripcion")]
    [MaxLength(1000)]
    public string? Descripcion { get; set; }

    [Column("Presentacion")]
    [MaxLength(100)]
    public string? Presentacion { get; set; } // "Caja x 30 tabletas", "Frasco 100ml"

    [Column("Categoria")]
    [MaxLength(100)]
    public string? Categoria { get; set; } // "Antibiótico", "Analgésico", etc.

    [Column("Laboratorio")]
    [MaxLength(200)]
    public string? Laboratorio { get; set; }

    [Column("PrincipioActivo")]
    [MaxLength(500)]
    public string? PrincipioActivo { get; set; }

    [Column("Concentracion")]
    [MaxLength(100)]
    public string? Concentracion { get; set; } // "500mg", "10mg/ml"

    [Column("ViaAdministracion")]
    [MaxLength(50)]
    public string? ViaAdministracion { get; set; } // "Oral", "Intravenosa", "Tópica"

    [Column("Indicaciones")]
    [MaxLength(2000)]
    public string? Indicaciones { get; set; }

    [Column("Contraindicaciones")]
    [MaxLength(2000)]
    public string? Contraindicaciones { get; set; }

    [Column("PrecioReferencia", TypeName = "decimal(18, 2)")]
    public decimal? PrecioReferencia { get; set; }

    [Column("ImagenUrl")]
    [MaxLength(500)]
    public string? ImagenUrl { get; set; }

    [Column("Activo")]
    public bool Activo { get; set; } = true;

    [Column("EsMuestra")]
    public bool EsMuestra { get; set; } = false; // Si es producto de muestra médica

    [Column("RequiereReceta")]
    public bool RequiereReceta { get; set; } = false;

    [Column("LineaNegocioId")]
    public string? LineaNegocioId { get; set; }

    // Navigation properties
    [ForeignKey("LineaNegocioId")]
    public virtual LineasNegocio? LineaNegocio { get; set; }

    public virtual ICollection<InventarioAgente> Inventarios { get; set; } = new List<InventarioAgente>();
    public virtual ICollection<MuestraMedica> MuestrasEntregadas { get; set; } = new List<MuestraMedica>();
}
