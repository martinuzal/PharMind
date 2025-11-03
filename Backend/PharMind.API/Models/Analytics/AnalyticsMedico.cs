using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PharMind.API.Models.Analytics
{
    [Table("analytics_medicos")]
    public class AnalyticsMedico
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(200)]
        public string Nombre { get; set; } = string.Empty;

        [Required]
        [StringLength(200)]
        public string Apellido { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string Especialidad { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string Matricula { get; set; } = string.Empty;

        [Required]
        [StringLength(1)]
        public string Segmento { get; set; } = string.Empty; // A, B, C

        [Required]
        [StringLength(50)]
        public string TipoAtencion { get; set; } = string.Empty; // Consultorio Privado, Institución, Ambos

        [StringLength(300)]
        public string? Direccion { get; set; }

        [Required]
        [StringLength(100)]
        public string Ciudad { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string Provincia { get; set; } = string.Empty;

        [StringLength(50)]
        public string? Telefono { get; set; }

        [StringLength(200)]
        public string? Email { get; set; }

        [Required]
        public DateTime FechaAlta { get; set; } = DateTime.Now;

        [Required]
        public bool Activo { get; set; } = true;

        [StringLength(50)]
        public string? Categoria { get; set; } // Premium, Estándar, Básico

        [StringLength(100)]
        public string? TipoInstitucion { get; set; } // Hospital, Consultorio, Mixto

        [StringLength(50)]
        public string? Sector { get; set; } // Público, Privado

        // Navigation property
        public ICollection<AnalyticsVisita> Visitas { get; set; } = new List<AnalyticsVisita>();
    }
}
