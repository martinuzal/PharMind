using System.ComponentModel.DataAnnotations;

namespace PharMind.API.DTOs;

// ==================== PRODUCTO ====================

public class ProductoDto
{
    public string Id { get; set; } = string.Empty;
    public string CodigoProducto { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string? NombreComercial { get; set; }
    public string? Descripcion { get; set; }
    public string? Presentacion { get; set; }
    public string? Categoria { get; set; }
    public string? Laboratorio { get; set; }
    public string? PrincipioActivo { get; set; }
    public string? Concentracion { get; set; }
    public string? ViaAdministracion { get; set; }
    public string? Indicaciones { get; set; }
    public string? Contraindicaciones { get; set; }
    public decimal? PrecioReferencia { get; set; }
    public string? ImagenUrl { get; set; }
    public bool Activo { get; set; }
    public bool EsMuestra { get; set; }
    public bool RequiereReceta { get; set; }
    public string? LineaNegocioId { get; set; }
    public string? LineaNegocioNombre { get; set; }
    public DateTime FechaCreacion { get; set; }
}

public class CreateProductoDto
{
    [Required]
    [MaxLength(50)]
    public string CodigoProducto { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string Nombre { get; set; } = string.Empty;

    [MaxLength(200)]
    public string? NombreComercial { get; set; }

    [MaxLength(1000)]
    public string? Descripcion { get; set; }

    [MaxLength(100)]
    public string? Presentacion { get; set; }

    [MaxLength(100)]
    public string? Categoria { get; set; }

    [MaxLength(200)]
    public string? Laboratorio { get; set; }

    [MaxLength(500)]
    public string? PrincipioActivo { get; set; }

    [MaxLength(100)]
    public string? Concentracion { get; set; }

    [MaxLength(50)]
    public string? ViaAdministracion { get; set; }

    [MaxLength(2000)]
    public string? Indicaciones { get; set; }

    [MaxLength(2000)]
    public string? Contraindicaciones { get; set; }

    public decimal? PrecioReferencia { get; set; }

    [MaxLength(500)]
    public string? ImagenUrl { get; set; }

    public bool Activo { get; set; } = true;
    public bool EsMuestra { get; set; } = false;
    public bool RequiereReceta { get; set; } = false;
    public string? LineaNegocioId { get; set; }
}

public class UpdateProductoDto
{
    [MaxLength(200)]
    public string? Nombre { get; set; }

    [MaxLength(200)]
    public string? NombreComercial { get; set; }

    [MaxLength(1000)]
    public string? Descripcion { get; set; }

    [MaxLength(100)]
    public string? Presentacion { get; set; }

    [MaxLength(100)]
    public string? Categoria { get; set; }

    public decimal? PrecioReferencia { get; set; }

    [MaxLength(500)]
    public string? ImagenUrl { get; set; }

    public bool? Activo { get; set; }
}

// ==================== INVENTARIO AGENTE ====================

public class InventarioAgenteDto
{
    public string Id { get; set; } = string.Empty;
    public string AgenteId { get; set; } = string.Empty;
    public string ProductoId { get; set; } = string.Empty;
    public ProductoDto? Producto { get; set; }
    public int CantidadDisponible { get; set; }
    public int? CantidadInicial { get; set; }
    public int CantidadEntregada { get; set; }
    public DateTime? FechaUltimaRecarga { get; set; }
    public string? LoteActual { get; set; }
    public DateTime? FechaVencimiento { get; set; }
    public string? Observaciones { get; set; }

    // Helpers calculados
    public bool EstaPorVencer { get; set; }
    public bool EstaVencido { get; set; }
    public bool StockBajo { get; set; }
    public int? DiasParaVencer { get; set; }
}

public class RecargaInventarioDto
{
    [Required]
    [Range(1, int.MaxValue)]
    public int Cantidad { get; set; }

    [Required]
    [MaxLength(50)]
    public string Lote { get; set; } = string.Empty;

    [Required]
    public DateTime FechaVencimiento { get; set; }

    [MaxLength(500)]
    public string? Observaciones { get; set; }
}

public class ActualizarInventarioDto
{
    [Range(0, int.MaxValue)]
    public int? CantidadEntregada { get; set; }

    [MaxLength(500)]
    public string? Observaciones { get; set; }
}

// ==================== MUESTRA MÉDICA ====================

public class MuestraMedicaDto
{
    public string Id { get; set; } = string.Empty;
    public string InteraccionId { get; set; } = string.Empty;
    public string ProductoId { get; set; } = string.Empty;
    public ProductoDto? Producto { get; set; }
    public string AgenteId { get; set; } = string.Empty;
    public string ClienteId { get; set; } = string.Empty;
    public string? ClienteNombre { get; set; }
    public int Cantidad { get; set; }
    public string? Lote { get; set; }
    public DateTime? FechaVencimiento { get; set; }
    public DateTime FechaEntrega { get; set; }
    public string? Observaciones { get; set; }
    public string? FirmaDigital { get; set; }
    public string? FotoComprobante { get; set; }
}

public class CreateMuestraMedicaDto
{
    [Required]
    public string InteraccionId { get; set; } = string.Empty;

    [Required]
    public string ProductoId { get; set; } = string.Empty;

    [Required]
    public string AgenteId { get; set; } = string.Empty;

    [Required]
    public string ClienteId { get; set; } = string.Empty;

    [Required]
    [Range(1, int.MaxValue)]
    public int Cantidad { get; set; }

    [MaxLength(50)]
    public string? Lote { get; set; }

    public DateTime? FechaVencimiento { get; set; }

    public DateTime? FechaEntrega { get; set; }

    [MaxLength(500)]
    public string? Observaciones { get; set; }

    public string? FirmaDigital { get; set; }
    public string? FotoComprobante { get; set; }
}
