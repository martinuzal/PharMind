using System;
using System.Collections.Generic;

namespace PharMind.API.Models;

public partial class Manager
{
    public string Id { get; set; } = null!;

    public string Codigo { get; set; } = null!;

    public string Nombre { get; set; } = null!;

    public string? Apellido { get; set; }

    public string? Email { get; set; }

    public string? Telefono { get; set; }

    public string? Cargo { get; set; }

    public DateTime? FechaIngreso { get; set; }

    public string? LegacyCode { get; set; }

    public string? Legajo { get; set; }

    public bool Activo { get; set; }

    public string? Observaciones { get; set; }

    public DateTime FechaCreacion { get; set; }

    public string? CreadoPor { get; set; }

    public DateTime? FechaModificacion { get; set; }

    public string? ModificadoPor { get; set; }

    public bool Status { get; set; }

    public virtual ICollection<Agente> Agentes { get; set; } = new List<Agente>();

    public virtual ICollection<ManagerDistrito> ManagerDistritos { get; set; } = new List<ManagerDistrito>();

    public virtual ICollection<ManagerLineasNegocio> ManagerLineasNegocio { get; set; } = new List<ManagerLineasNegocio>();

    public virtual ICollection<ManagerRegione> ManagerRegiones { get; set; } = new List<ManagerRegione>();

    public virtual ICollection<Usuario> Usuarios { get; set; } = new List<Usuario>();
}
