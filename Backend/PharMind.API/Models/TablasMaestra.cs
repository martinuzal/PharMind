using System;
using System.Collections.Generic;

namespace PharMind.API.Models;

public partial class TablasMaestra
{
    public string Id { get; set; } = null!;

    public string NombreTabla { get; set; } = null!;

    public string? Descripcion { get; set; }

    public string EsquemaColumnas { get; set; } = null!;

    public bool TablaCreada { get; set; }

    public bool Activo { get; set; }

    public DateTime FechaCreacion { get; set; }

    public string? CreadoPor { get; set; }

    public DateTime? FechaModificacion { get; set; }

    public string? ModificadoPor { get; set; }

    public bool? Status { get; set; }
}
