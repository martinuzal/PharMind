using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PharMind.API.Models
{
    [Table("auditCustomer")]
    public class AuditCustomer
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(100)]
        [Column("CDGMED_REG")]
        public string? CDGMED_REG { get; set; }

        [StringLength(100)]
        [Column("CRM")]
        public string? CRM { get; set; }

        [StringLength(500)]
        [Column("NOME")]
        public string? NOME { get; set; }

        [StringLength(100)]
        [Column("BLANK")]
        public string? BLANK { get; set; }

        [StringLength(100)]
        [Column("CDGESP1")]
        public string? CDGESP1 { get; set; }

        [StringLength(100)]
        [Column("CDGESP2")]
        public string? CDGESP2 { get; set; }

        [StringLength(100)]
        [Column("CDGREG_PMIX")]
        public string? CDGREG_PMIX { get; set; }

        [StringLength(500)]
        [Column("LOCAL")]
        public string? LOCAL { get; set; }

        [StringLength(200)]
        [Column("BAIRRO")]
        public string? BAIRRO { get; set; }

        [StringLength(50)]
        [Column("CEP")]
        public string? CEP { get; set; }

        [StringLength(100)]
        [Column("CDGMED_VIS")]
        public string? CDGMED_VIS { get; set; }

        [StringLength(1000)]
        public string? RawData { get; set; }
    }
}
