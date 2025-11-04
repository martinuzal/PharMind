using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PharMind.API.Models;

[Table("Managers")]
public class Manager : AuditableEntity
{
    [Required]
    [Column("UsuarioId")]
    public string UsuarioId { get; set; } = string.Empty;

    [Required]
    [Column("Codigo")]
    [MaxLength(50)]
    public string Codigo { get; set; } = string.Empty;

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

    [Column("Cargo")]
    [MaxLength(100)]
    public string? Cargo { get; set; }

    [Column("FechaIngreso")]
    public DateTime? FechaIngreso { get; set; }

    [Column("LegacyCode")]
    [MaxLength(100)]
    public string? LegacyCode { get; set; }

    [Column("Legajo")]
    [MaxLength(100)]
    public string? Legajo { get; set; }

    [Column("Activo")]
    public bool Activo { get; set; } = true;

    [Column("Observaciones")]
    [MaxLength(1000)]
    public string? Observaciones { get; set; }

    // Navigation properties
    [ForeignKey("UsuarioId")]
    public virtual Usuario? Usuario { get; set; }

    // Relaciones muchos-a-muchos
    public virtual ICollection<ManagerRegion> ManagerRegiones { get; set; } = new List<ManagerRegion>();
    public virtual ICollection<ManagerDistrito> ManagerDistritos { get; set; } = new List<ManagerDistrito>();
    public virtual ICollection<ManagerLineaNegocio> ManagerLineasNegocio { get; set; } = new List<ManagerLineaNegocio>();
}

// Tabla de relación: Manager - Region
[Table("ManagerRegiones")]
public class ManagerRegion : AuditableEntity
{
    [Required]
    [Column("ManagerId")]
    public string ManagerId { get; set; } = string.Empty;

    [Required]
    [Column("RegionId")]
    public string RegionId { get; set; } = string.Empty;

    // Navigation properties
    [ForeignKey("ManagerId")]
    public virtual Manager? Manager { get; set; }

    [ForeignKey("RegionId")]
    public virtual Region? Region { get; set; }
}

// Tabla de relación: Manager - Distrito
[Table("ManagerDistritos")]
public class ManagerDistrito : AuditableEntity
{
    [Required]
    [Column("ManagerId")]
    public string ManagerId { get; set; } = string.Empty;

    [Required]
    [Column("DistritoId")]
    public string DistritoId { get; set; } = string.Empty;

    // Navigation properties
    [ForeignKey("ManagerId")]
    public virtual Manager? Manager { get; set; }

    [ForeignKey("DistritoId")]
    public virtual Distrito? Distrito { get; set; }
}

// Tabla de relación: Manager - LineaNegocio
[Table("ManagerLineasNegocio")]
public class ManagerLineaNegocio : AuditableEntity
{
    [Required]
    [Column("ManagerId")]
    public string ManagerId { get; set; } = string.Empty;

    [Required]
    [Column("LineaNegocioId")]
    public string LineaNegocioId { get; set; } = string.Empty;

    // Navigation properties
    [ForeignKey("ManagerId")]
    public virtual Manager? Manager { get; set; }

    [ForeignKey("LineaNegocioId")]
    public virtual LineaNegocio? LineaNegocio { get; set; }
}
