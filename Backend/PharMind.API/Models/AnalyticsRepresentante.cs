using System;
using System.Collections.Generic;

namespace PharMind.API.Models;

public partial class AnalyticsRepresentante
{
    public int Id { get; set; }

    public string Nombre { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string Distrito { get; set; } = null!;

    public string Region { get; set; } = null!;

    public DateTime FechaIngreso { get; set; }

    public bool Activo { get; set; }

    public string? Zona { get; set; }

    public virtual ICollection<AnalyticsObjetivo> AnalyticsObjetivos { get; set; } = new List<AnalyticsObjetivo>();

    public virtual ICollection<AnalyticsVisita> AnalyticsVisita { get; set; } = new List<AnalyticsVisita>();
}
