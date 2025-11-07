using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PharMind.API.Models
{
    [Table("auditCategory")]
    public class AuditCategory
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(100)]
        [Column("CDG_PERUSER")]
        public string? CDG_PERUSER { get; set; }

        [StringLength(100)]
        [Column("CDGMED_REG")]
        public string? CDGMED_REG { get; set; }

        [StringLength(100)]
        [Column("CDG_MERCADO")]
        public string? CDG_MERCADO { get; set; }

        [StringLength(100)]
        [Column("CDGREG_PMIX")]
        public string? CDGREG_PMIX { get; set; }

        [StringLength(500)]
        [Column("CAT")]
        public string? CAT { get; set; }

        [StringLength(100)]
        [Column("PX_MER")]
        public string? PX_MER { get; set; }

        [StringLength(100)]
        [Column("PX_LAB")]
        public string? PX_LAB { get; set; }

        [StringLength(100)]
        [Column("MER_MS")]
        public string? MER_MS { get; set; }

        [StringLength(100)]
        [Column("CDG_RAIZ")]
        public string? CDG_RAIZ { get; set; }

        [StringLength(100)]
        [Column("PX")]
        public string? PX { get; set; }

        [StringLength(100)]
        [Column("PX_MS")]
        public string? PX_MS { get; set; }

        [StringLength(1000)]
        public string? RawData { get; set; }
    }
}
