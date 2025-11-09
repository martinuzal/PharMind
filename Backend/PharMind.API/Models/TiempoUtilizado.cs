using System;
using System.Collections.Generic;

namespace PharMind.API.Models;

public partial class TiempoUtilizado
{
    public string Id { get; set; } = null!;

    public string RepresentanteId { get; set; } = null!;

    public DateTime Fecha { get; set; }

    public string TipoActividadId { get; set; } = null!;

    public string? Descripcion { get; set; }

    public decimal HorasUtilizadas { get; set; }

    public int MinutosUtilizados { get; set; }

    public bool EsRecurrente { get; set; }

    public string? Observaciones { get; set; }

    public DateTime FechaCreacion { get; set; }

    public string? CreadoPor { get; set; }

    public DateTime? FechaModificacion { get; set; }

    public string? ModificadoPor { get; set; }

    public bool? Status { get; set; }

    public string Turno { get; set; } = null!;

    public virtual Usuario Representante { get; set; } = null!;

    public virtual TipoActividad TipoActividad { get; set; } = null!;
}
