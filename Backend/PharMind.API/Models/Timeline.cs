using System;
using System.Collections.Generic;

namespace PharMind.API.Models;

public partial class Timeline
{
    public Guid Id { get; set; }

    public string Nombre { get; set; } = null!;

    public string? Descripcion { get; set; }

    public string? Color { get; set; }

    public int Anio { get; set; }

    public bool Activo { get; set; }

    public bool EsDefault { get; set; }

    public DateTime FechaCreacion { get; set; }

    public string? CreadoPor { get; set; }

    public DateTime? FechaModificacion { get; set; }

    public string? ModificadoPor { get; set; }

    public bool Status { get; set; }

    public virtual ICollection<Agente> Agentes { get; set; } = new List<Agente>();

    public virtual ICollection<Period> Periods { get; set; } = new List<Period>();
}
