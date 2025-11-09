using System;
using System.Collections.Generic;

namespace PharMind.API.Models;

public partial class Ciudade
{
    public string Id { get; set; } = null!;

    public string Nombre { get; set; } = null!;

    public string? EstadoId { get; set; }

    public string? CodigoPostal { get; set; }

    public bool Activo { get; set; }

    public DateTime FechaCreacion { get; set; }

    public string? CreadoPor { get; set; }

    public DateTime? FechaModificacion { get; set; }

    public string? ModificadoPor { get; set; }

    public bool? Status { get; set; }

    public virtual ICollection<Calle> Calles { get; set; } = new List<Calle>();

    public virtual Estado? Estado { get; set; }
}
