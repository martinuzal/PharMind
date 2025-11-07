using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PharMind.API.Models
{
    [Table("ProvinciasEstados")]
    public class ProvinciaEstado
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int PaisId { get; set; }

        [Required]
        [MaxLength(10)]
        public string Codigo { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Nombre { get; set; } = string.Empty;

        [MaxLength(200)]
        public string? NombreCompleto { get; set; }

        public bool Activo { get; set; } = true;

        [ForeignKey("PaisId")]
        public virtual Pais? Pais { get; set; }
    }

    [Table("Departamentos")]
    public class Departamento
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int ProvinciaEstadoId { get; set; }

        [MaxLength(20)]
        public string? Codigo { get; set; }

        [Required]
        [MaxLength(100)]
        public string Nombre { get; set; } = string.Empty;

        public bool Activo { get; set; } = true;

        [ForeignKey("ProvinciaEstadoId")]
        public virtual ProvinciaEstado? ProvinciaEstado { get; set; }
    }

    [Table("Localidades")]
    public class Localidad
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int DepartamentoId { get; set; }

        [Required]
        [MaxLength(100)]
        public string Nombre { get; set; } = string.Empty;

        [MaxLength(20)]
        public string? CodigoPostal { get; set; }

        [Column(TypeName = "decimal(10,8)")]
        public decimal? Latitud { get; set; }

        [Column(TypeName = "decimal(11,8)")]
        public decimal? Longitud { get; set; }

        public bool Activo { get; set; } = true;

        [ForeignKey("DepartamentoId")]
        public virtual Departamento? Departamento { get; set; }
    }

    [Table("CodigosPostales")]
    public class CodigoPostal
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int LocalidadId { get; set; }

        [Required]
        [MaxLength(20)]
        [Column("CodigoPostal")]
        public string CodigoPostalValue { get; set; } = string.Empty;

        [MaxLength(50)]
        public string? TipoCP { get; set; }

        [MaxLength(100)]
        public string? Barrio { get; set; }

        [Column(TypeName = "decimal(10,8)")]
        public decimal? Latitud { get; set; }

        [Column(TypeName = "decimal(11,8)")]
        public decimal? Longitud { get; set; }

        public bool Activo { get; set; } = true;

        [ForeignKey("LocalidadId")]
        public virtual Localidad? Localidad { get; set; }
    }

    [Table("CalleCodigoPostal")]
    public class CalleCodigoPostal
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int CalleId { get; set; }

        [Required]
        public int CodigoPostalId { get; set; }

        public int? AlturaDesde { get; set; }

        public int? AlturaHasta { get; set; }

        [MaxLength(10)]
        public string? Lado { get; set; }

        [ForeignKey("CalleId")]
        public virtual Calle? Calle { get; set; }

        [ForeignKey("CodigoPostalId")]
        public virtual CodigoPostal? CodigoPostal { get; set; }
    }

    [Table("DireccionesNormalizadas")]
    public class DireccionNormalizada
    {
        [Key]
        [MaxLength(450)]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        // Referencias a datos normalizados
        [Required]
        public int PaisId { get; set; }

        [Required]
        public int ProvinciaEstadoId { get; set; }

        public int? DepartamentoId { get; set; }

        [Required]
        public int LocalidadId { get; set; }

        [Required]
        public int CodigoPostalId { get; set; }

        public int? CalleId { get; set; }

        // Datos de la dirección
        [MaxLength(200)]
        public string? CalleNombre { get; set; }

        public int? Altura { get; set; }

        [MaxLength(20)]
        public string? Piso { get; set; }

        [MaxLength(20)]
        public string? Departamento { get; set; }

        [MaxLength(20)]
        public string? Torre { get; set; }

        [MaxLength(50)]
        public string? Manzana { get; set; }

        [MaxLength(50)]
        public string? Lote { get; set; }

        // Datos adicionales (JSON)
        [Column(TypeName = "nvarchar(max)")]
        public string? DatosAdicionales { get; set; }

        // Dirección formateada
        [MaxLength(500)]
        public string? DireccionCompleta { get; set; }

        // Coordenadas
        [Column(TypeName = "decimal(10,8)")]
        public decimal? Latitud { get; set; }

        [Column(TypeName = "decimal(11,8)")]
        public decimal? Longitud { get; set; }

        [MaxLength(50)]
        public string? PrecisionGeografica { get; set; }

        // Validación
        public bool Validada { get; set; } = false;

        public DateTime? FechaValidacion { get; set; }

        [MaxLength(100)]
        public string? FuenteValidacion { get; set; }

        // Metadatos
        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

        public DateTime? FechaModificacion { get; set; }

        public bool Activa { get; set; } = true;

        // Navigation properties
        [ForeignKey("PaisId")]
        public virtual Pais? Pais { get; set; }

        [ForeignKey("ProvinciaEstadoId")]
        public virtual ProvinciaEstado? ProvinciaEstado { get; set; }

        [ForeignKey("DepartamentoId")]
        public virtual Departamento? DepartamentoEntity { get; set; }

        [ForeignKey("LocalidadId")]
        public virtual Localidad? Localidad { get; set; }

        [ForeignKey("CodigoPostalId")]
        public virtual CodigoPostal? CodigoPostal { get; set; }

        [ForeignKey("CalleId")]
        public virtual Calle? Calle { get; set; }
    }

    [Table("EntidadDireccion")]
    public class EntidadDireccion
    {
        [Key]
        [MaxLength(450)]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        [MaxLength(450)]
        public string DireccionId { get; set; } = string.Empty;

        // Entidad relacionada (polimórfica)
        [Required]
        [MaxLength(50)]
        public string EntidadTipo { get; set; } = string.Empty;

        [Required]
        [MaxLength(450)]
        public string EntidadId { get; set; } = string.Empty;

        // Tipo de dirección
        [MaxLength(50)]
        public string? TipoDireccion { get; set; }

        public bool EsPrincipal { get; set; } = false;

        // Metadatos
        public DateTime FechaAsignacion { get; set; } = DateTime.UtcNow;

        public bool Activa { get; set; } = true;

        [ForeignKey("DireccionId")]
        public virtual DireccionNormalizada? Direccion { get; set; }
    }
}
