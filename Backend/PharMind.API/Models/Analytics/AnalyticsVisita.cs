using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PharMind.API.Models.Analytics
{
    [Table("analytics_visitas")]
    public class AnalyticsVisita
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int MedicoId { get; set; }

        [Required]
        public int RepresentanteId { get; set; }

        [Required]
        public DateTime FechaVisita { get; set; }

        [Required]
        public int DuracionMinutos { get; set; }

        [Required]
        [StringLength(50)]
        public string TipoVisita { get; set; } = string.Empty; // Presencial, Virtual, Grupal

        public string? ObjetivoVisita { get; set; }

        public string? ProductosPromovidos { get; set; } // JSON array

        public bool MuestrasMedicasEntregadas { get; set; } = false;

        public string? MaterialEntregado { get; set; } // JSON array

        public string? Notas { get; set; }

        [Required]
        public bool Exitosa { get; set; } = true;

        public DateTime? ProximaVisitaPlaneada { get; set; }

        [StringLength(20)]
        public string? Turno { get; set; } // Mañana, Tarde

        // Navigation properties
        [ForeignKey("MedicoId")]
        public AnalyticsMedico Medico { get; set; } = null!;

        [ForeignKey("RepresentanteId")]
        public AnalyticsRepresentante Representante { get; set; } = null!;
    }
}
