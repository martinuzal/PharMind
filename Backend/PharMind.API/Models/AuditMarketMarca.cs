using System;
using System.Collections.Generic;

namespace PharMind.API.Models;

public partial class AuditMarketMarca
{
    public int Id { get; set; }

    public string? Codigo { get; set; }

    public string? CodigoPmix { get; set; }

    public string? Nome { get; set; }

    public string? Siglalab { get; set; }

    public string? RawData { get; set; }
}
