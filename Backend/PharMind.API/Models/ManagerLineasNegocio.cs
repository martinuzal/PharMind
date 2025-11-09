using System;
using System.Collections.Generic;

namespace PharMind.API.Models;

public partial class ManagerLineasNegocio
{
    public string Id { get; set; } = null!;

    public string ManagerId { get; set; } = null!;

    public string LineaNegocioId { get; set; } = null!;

    public DateTime FechaCreacion { get; set; }

    public string? CreadoPor { get; set; }

    public DateTime? FechaModificacion { get; set; }

    public string? ModificadoPor { get; set; }

    public bool Status { get; set; }

    public virtual LineasNegocio LineaNegocio { get; set; } = null!;

    public virtual Manager Manager { get; set; } = null!;
}
