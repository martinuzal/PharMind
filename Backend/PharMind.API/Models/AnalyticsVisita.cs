using System;
using System.Collections.Generic;

namespace PharMind.API.Models;

public partial class AnalyticsVisita
{
    public int Id { get; set; }

    public int MedicoId { get; set; }

    public int RepresentanteId { get; set; }

    public DateTime FechaVisita { get; set; }

    public int DuracionMinutos { get; set; }

    public string TipoVisita { get; set; } = null!;

    public string? ObjetivoVisita { get; set; }

    public string? ProductosPromovidos { get; set; }

    public bool? MuestrasMedicasEntregadas { get; set; }

    public string? MaterialEntregado { get; set; }

    public string? Notas { get; set; }

    public bool Exitosa { get; set; }

    public DateTime? ProximaVisitaPlaneada { get; set; }

    public string? Turno { get; set; }

    public virtual AnalyticsMedico Medico { get; set; } = null!;

    public virtual AnalyticsRepresentante Representante { get; set; } = null!;
}
