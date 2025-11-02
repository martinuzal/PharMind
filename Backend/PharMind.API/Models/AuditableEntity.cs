using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PharMind.API.Models;

public abstract class AuditableEntity
{
    [Key]
    [Column("Id")]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Column("FechaCreacion")]
    public DateTime FechaCreacion { get; set; } = DateTime.Now;

    [Column("CreadoPor")]
    [MaxLength(255)]
    public string? CreadoPor { get; set; }

    [Column("FechaModificacion")]
    public DateTime? FechaModificacion { get; set; }

    [Column("ModificadoPor")]
    [MaxLength(255)]
    public string? ModificadoPor { get; set; }

    [Column("Status")]
    public bool? Status { get; set; } = false;
}
