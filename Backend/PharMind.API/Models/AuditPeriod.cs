using System;
using System.Collections.Generic;

namespace PharMind.API.Models;

public partial class AuditPeriod
{
    public int Id { get; set; }

    public string? CdgPeruser { get; set; }

    public string? Desc { get; set; }

    public string? Blank { get; set; }

    public string? RawData { get; set; }
}
