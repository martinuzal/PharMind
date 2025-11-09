using System;
using System.Collections.Generic;

namespace PharMind.API.Models;

public partial class AuditProductClass
{
    public int Id { get; set; }

    public string? CodigoPmix { get; set; }

    public string? CdgMercado { get; set; }

    public string? RawData { get; set; }
}
