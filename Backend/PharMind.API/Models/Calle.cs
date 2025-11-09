using System;
using System.Collections.Generic;

namespace PharMind.API.Models;

public partial class Calle
{
    public string Id { get; set; } = null!;

    public string Nombre { get; set; } = null!;

    public string? CiudadId { get; set; }

    public string? Colonia { get; set; }

    public string? CodigoPostal { get; set; }

    public bool Activo { get; set; }

    public DateTime FechaCreacion { get; set; }

    public string? CreadoPor { get; set; }

    public DateTime? FechaModificacion { get; set; }

    public string? ModificadoPor { get; set; }

    public bool? Status { get; set; }

    public virtual Ciudade? Ciudad { get; set; }
}
