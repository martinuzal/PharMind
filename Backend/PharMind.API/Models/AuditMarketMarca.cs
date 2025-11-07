using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PharMind.API.Models
{
    [Table("auditMarketMarcas")]
    public class AuditMarketMarca
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(100)]
        [Column("CODIGO")]
        public string? CODIGO { get; set; }

        [StringLength(100)]
        [Column("CODIGO_PMIX")]
        public string? CODIGO_PMIX { get; set; }

        [StringLength(500)]
        [Column("NOME")]
        public string? NOME { get; set; }

        [StringLength(100)]
        [Column("SIGLALAB")]
        public string? SIGLALAB { get; set; }

        [StringLength(1000)]
        public string? RawData { get; set; }
    }
}
