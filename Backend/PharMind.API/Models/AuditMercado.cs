using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PharMind.API.Models
{
    [Table("auditMercados")]
    public class AuditMercado
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(100)]
        public string? CdgUsuario { get; set; }

        [StringLength(100)]
        public string? CdgPais { get; set; }

        [StringLength(100)]
        public string? CdgMercado { get; set; }

        [StringLength(500)]
        public string? Descripcion { get; set; }

        [StringLength(1)]
        public string? Closeup { get; set; }

        [StringLength(1)]
        public string? Audit { get; set; }

        [StringLength(1)]
        public string? Feedback { get; set; }

        [StringLength(1)]
        public string? Recetario { get; set; }

        [StringLength(1)]
        public string? Generado { get; set; }

        [StringLength(1)]
        public string? Controlado { get; set; }

        [StringLength(50)]
        public string? Abreviatura { get; set; }

        [StringLength(100)]
        public string? CdgLabora { get; set; }

        [StringLength(20)]
        public string? Edicion { get; set; }

        [StringLength(50)]
        public string? FechaHoraProc { get; set; }

        [StringLength(500)]
        public string? Path { get; set; }
    }
}
