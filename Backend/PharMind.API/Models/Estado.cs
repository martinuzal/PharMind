using System;
using System.Collections.Generic;

namespace PharMind.API.Models;

public partial class Estado
{
    public string Id { get; set; } = null!;

    public string Nombre { get; set; } = null!;

    public string? PaisId { get; set; }

    public string? Codigo { get; set; }

    public bool Activo { get; set; }

    public DateTime FechaCreacion { get; set; }

    public string? CreadoPor { get; set; }

    public DateTime? FechaModificacion { get; set; }

    public string? ModificadoPor { get; set; }

    public bool? Status { get; set; }

    public virtual ICollection<Ciudade> Ciudades { get; set; } = new List<Ciudade>();

    public virtual Paise? Pais { get; set; }
}
