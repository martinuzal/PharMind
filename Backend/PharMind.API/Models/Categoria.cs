using System;
using System.Collections.Generic;

namespace PharMind.API.Models;

public partial class Categoria
{
    public int Codigo { get; set; }

    public string Descripcion { get; set; } = null!;
}
