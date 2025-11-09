using System;
using System.Collections.Generic;

namespace PharMind.API.Models;

public partial class AnalyticsProducto
{
    public int Id { get; set; }

    public string Nombre { get; set; } = null!;

    public string LineaProducto { get; set; } = null!;

    public string? Principio { get; set; }

    public string? Presentacion { get; set; }

    public bool Activo { get; set; }
}
