using System;
using System.Collections.Generic;

namespace PharMind.API.Models;

public partial class AnalyticsObjetivo
{
    public int Id { get; set; }

    public int RepresentanteId { get; set; }

    public string Periodo { get; set; } = null!;

    public string TipoObjetivo { get; set; } = null!;

    public int Meta { get; set; }

    public int Alcanzado { get; set; }

    public decimal? Porcentaje { get; set; }

    public virtual AnalyticsRepresentante Representante { get; set; } = null!;
}
