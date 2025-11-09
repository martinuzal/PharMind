using System;
using System.Collections.Generic;

namespace PharMind.API.Models;

public partial class LineasNegocio
{
    public string Id { get; set; } = null!;

    public string Codigo { get; set; } = null!;

    public string Nombre { get; set; } = null!;

    public string? Descripcion { get; set; }

    public string? LegacyCode { get; set; }

    public string? Legajo { get; set; }

    public string? Color { get; set; }

    public string? Icono { get; set; }

    public bool Activo { get; set; }

    public int? Orden { get; set; }

    public DateTime FechaCreacion { get; set; }

    public string? CreadoPor { get; set; }

    public DateTime? FechaModificacion { get; set; }

    public string? ModificadoPor { get; set; }

    public bool Status { get; set; }

    public virtual ICollection<Agente> Agentes { get; set; } = new List<Agente>();

    public virtual ICollection<ManagerLineasNegocio> ManagerLineasNegocios { get; set; } = new List<ManagerLineasNegocio>();
}
