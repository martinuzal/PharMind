using System;
using System.Collections.Generic;

namespace PharMind.API.Models;

public partial class Period
{
    public Guid Id { get; set; }

    public Guid TimelineId { get; set; }

    public string Nombre { get; set; } = null!;

    public string? Codigo { get; set; }

    public int Orden { get; set; }

    public DateTime FechaInicio { get; set; }

    public DateTime FechaFin { get; set; }

    public string? Color { get; set; }

    public string? Descripcion { get; set; }

    public bool Activo { get; set; }

    public DateTime FechaCreacion { get; set; }

    public string? CreadoPor { get; set; }

    public DateTime? FechaModificacion { get; set; }

    public string? ModificadoPor { get; set; }

    public bool Status { get; set; }

    public virtual Timeline Timeline { get; set; } = null!;
}
