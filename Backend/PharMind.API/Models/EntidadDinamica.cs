using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PharMind.API.Models;

public class EntidadDinamica : AuditableEntity
{
    [Column("EsquemaId")]
    [Required]
    public string EsquemaId { get; set; } = string.Empty;

    [Column("EmpresaId")]
    public string? EmpresaId { get; set; }

    [Column("UsuarioId")]
    public string? UsuarioId { get; set; } // Para entidades de tipo Agente - usuario de la app móvil

    [Column("Datos")]
    [Required]
    public string Datos { get; set; } = "{}"; // JSON con los datos dinámicos

    [Column("FullDescription")]
    [MaxLength(500)]
    public string? FullDescription { get; set; } // Descripción completa para mostrar en listados

    [Column("Estado")]
    [MaxLength(50)]
    public string? Estado { get; set; } // Activo, Inactivo, Pendiente, etc.

    [Column("Tags")]
    public string? Tags { get; set; } // JSON array de tags para búsqueda

    // Relaciones
    [ForeignKey("EsquemaId")]
    public EsquemaPersonalizado? Esquema { get; set; }

    [ForeignKey("EmpresaId")]
    public Empresa? Empresa { get; set; }

    [ForeignKey("UsuarioId")]
    public Usuario? Usuario { get; set; } // Usuario móvil asociado (solo para Agentes)
}
