using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PharMind.API.Models.Analytics
{
    [Table("analytics_objetivos")]
    public class AnalyticsObjetivo
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int RepresentanteId { get; set; }

        [Required]
        [StringLength(20)]
        public string Periodo { get; set; } = string.Empty; // Ejemplo: '2025-01', '2025-Q1'

        [Required]
        [StringLength(50)]
        public string TipoObjetivo { get; set; } = string.Empty; // Visitas, Cobertura, Frecuencia

        [Required]
        public int Meta { get; set; }

        [Required]
        public int Alcanzado { get; set; } = 0;

        // Computed property (calculated in SQL as computed column)
        [NotMapped]
        public decimal Porcentaje => Meta > 0 ? (decimal)Alcanzado / Meta * 100 : 0;

        // Navigation property
        [ForeignKey("RepresentanteId")]
        public AnalyticsRepresentante Representante { get; set; } = null!;
    }
}
