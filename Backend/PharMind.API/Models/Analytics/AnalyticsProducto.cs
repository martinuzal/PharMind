using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PharMind.API.Models.Analytics
{
    [Table("analytics_productos")]
    public class AnalyticsProducto
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(200)]
        public string Nombre { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string LineaProducto { get; set; } = string.Empty;

        [StringLength(200)]
        public string? Principio { get; set; }

        [StringLength(200)]
        public string? Presentacion { get; set; }

        [Required]
        public bool Activo { get; set; } = true;
    }
}
