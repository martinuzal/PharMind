using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PharMind.API.Models;

[Table("AuditoriaAgentes")]
public class AuditoriaAgente
{
    [Key]
    [Column("Id")]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Required]
    [Column("AgenteId")]
    public string AgenteId { get; set; } = string.Empty;

    [Required]
    [Column("TipoOperacion")]
    [MaxLength(50)]
    public string TipoOperacion { get; set; } = string.Empty; // 'CREATE', 'UPDATE', 'DELETE', 'ACTIVATE', 'DEACTIVATE'

    [Column("CampoModificado")]
    [MaxLength(200)]
    public string? CampoModificado { get; set; }

    [Column("ValorAnterior")]
    public string? ValorAnterior { get; set; }

    [Column("ValorNuevo")]
    public string? ValorNuevo { get; set; }

    [Column("Descripcion")]
    [MaxLength(1000)]
    public string? Descripcion { get; set; }

    [Required]
    [Column("FechaOperacion")]
    public DateTime FechaOperacion { get; set; } = DateTime.Now;

    [Required]
    [Column("UsuarioOperacion")]
    [MaxLength(255)]
    public string UsuarioOperacion { get; set; } = string.Empty;

    [Column("DireccionIP")]
    [MaxLength(50)]
    public string? DireccionIP { get; set; }

    // Navigation property
    [ForeignKey("AgenteId")]
    public virtual Agente? Agente { get; set; }
}
