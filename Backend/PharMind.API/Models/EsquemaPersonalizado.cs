using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PharMind.API.Models;

public class EsquemaPersonalizado : AuditableEntity
{
    [Column("EmpresaId")]
    public string? EmpresaId { get; set; }

    [Column("EntidadTipo")]
    [Required]
    [MaxLength(50)]
    public string EntidadTipo { get; set; } = string.Empty; // Cliente, Agente, Relacion, Interaccion

    [Column("SubTipo")]
    [MaxLength(50)]
    public string? SubTipo { get; set; } // e.g., "Medico", "Institucion", "Farmacia", etc.

    [Column("Nombre")]
    [Required]
    [MaxLength(100)]
    public string Nombre { get; set; } = string.Empty;

    [Column("Descripcion")]
    [MaxLength(500)]
    public string? Descripcion { get; set; }

    [Column("Icono")]
    [MaxLength(50)]
    public string? Icono { get; set; } // Material icon name

    [Column("Color")]
    [MaxLength(20)]
    public string? Color { get; set; } // Hex color for UI

    [Column("Schema")]
    [Required]
    public string Schema { get; set; } = "{}"; // JSON schema definition

    [Column("ReglasValidacion")]
    public string? ReglasValidacion { get; set; } // JSON validation rules

    [Column("ReglasCorrelacion")]
    public string? ReglasCorrelacion { get; set; } // JSON field correlation rules

    [Column("ConfiguracionUI")]
    public string? ConfiguracionUI { get; set; } // JSON UI configuration

    [Column("Version")]
    public int Version { get; set; } = 1;

    [Column("Activo")]
    public bool Activo { get; set; } = true;

    [Column("Orden")]
    public int? Orden { get; set; } // Display order in sidebar

    // Navigation properties
    [ForeignKey("EmpresaId")]
    public virtual Empresa? Empresa { get; set; }
}
