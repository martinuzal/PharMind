using System;
using System.Collections.Generic;

namespace PharMind.API.Models;

public partial class AuditCategory
{
    public int Id { get; set; }

    public string? CdgPeruser { get; set; }

    public string? CdgmedReg { get; set; }

    public string? CdgMercado { get; set; }

    public string? CdgregPmix { get; set; }

    public string? Cat { get; set; }

    public string? PxMer { get; set; }

    public string? PxLab { get; set; }

    public string? MerMs { get; set; }

    public string? CdgRaiz { get; set; }

    public string? Px { get; set; }

    public string? PxMs { get; set; }

    public string? RawData { get; set; }
}
