using System;
using System.Collections.Generic;

namespace PharMind.API.Models;

public partial class ManagerRegione
{
    public string Id { get; set; } = null!;

    public string ManagerId { get; set; } = null!;

    public string RegionId { get; set; } = null!;

    public DateTime FechaCreacion { get; set; }

    public string? CreadoPor { get; set; }

    public DateTime? FechaModificacion { get; set; }

    public string? ModificadoPor { get; set; }

    public bool Status { get; set; }

    public virtual Manager Manager { get; set; } = null!;

    public virtual Regiones Region { get; set; } = null!;
}
