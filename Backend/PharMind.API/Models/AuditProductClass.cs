using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PharMind.API.Models
{
    [Table("auditProductClass")]
    public class AuditProductClass
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(100)]
        [Column("CODIGO_PMIX")]
        public string? CODIGO_PMIX { get; set; }

        [StringLength(100)]
        [Column("CDG_MERCADO")]
        public string? CDG_MERCADO { get; set; }

        [StringLength(1000)]
        public string? RawData { get; set; }
    }
}
