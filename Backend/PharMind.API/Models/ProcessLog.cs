using System;
using System.Collections.Generic;

namespace PharMind.API.Models;

public partial class ProcessLog
{
    public int Id { get; set; }

    public string UploadId { get; set; } = null!;

    public DateTime Timestamp { get; set; }

    public string Level { get; set; } = null!;

    public string Message { get; set; } = null!;

    public string? Details { get; set; }
}
