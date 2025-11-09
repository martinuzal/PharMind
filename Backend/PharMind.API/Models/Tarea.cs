using System;
using System.Collections.Generic;

namespace PharMind.API.Models;

public partial class Tarea
{
    public int Codigo { get; set; }

    public string Abreviatura { get; set; } = null!;

    public string? Descripcion { get; set; }
}
