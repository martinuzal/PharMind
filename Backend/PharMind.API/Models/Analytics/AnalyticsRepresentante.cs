using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PharMind.API.Models.Analytics
{
    [Table("analytics_representantes")]
    public class AnalyticsRepresentante
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(200)]
        public string Nombre { get; set; } = string.Empty;

        [Required]
        [StringLength(200)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string Distrito { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string Region { get; set; } = string.Empty;

        [Required]
        public DateTime FechaIngreso { get; set; }

        [Required]
        public bool Activo { get; set; } = true;

        [StringLength(100)]
        public string? Zona { get; set; }

        // Navigation properties
        public ICollection<AnalyticsVisita> Visitas { get; set; } = new List<AnalyticsVisita>();
        public ICollection<AnalyticsObjetivo> Objetivos { get; set; } = new List<AnalyticsObjetivo>();
    }
}
