using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PharMind.API.Models
{
    [Table("auditPeriod")]
    public class AuditPeriod
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(100)]
        [Column("CDG_PERUSER")]
        public string? CDG_PERUSER { get; set; }

        [StringLength(500)]
        [Column("DESC")]
        public string? DESC { get; set; }

        [StringLength(100)]
        [Column("BLANK")]
        public string? BLANK { get; set; }

        [StringLength(1000)]
        public string? RawData { get; set; }
    }
}
