using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace PharMind.API.Models;

[Table("Regiones")]
public partial class Regiones
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

    public virtual ICollection<Distrito> Distritos { get; set; } = new List<Distrito>();

    public virtual ICollection<ManagerRegione> ManagerRegiones { get; set; } = new List<ManagerRegione>();
}
