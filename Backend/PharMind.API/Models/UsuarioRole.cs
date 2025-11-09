using System;
using System.Collections.Generic;

namespace PharMind.API.Models;

public partial class UsuarioRole
{
    public string Id { get; set; } = null!;

    public string UsuarioId { get; set; } = null!;

    public string RolId { get; set; } = null!;

    public DateTime FechaAsignacion { get; set; }

    public string? AsignadoPor { get; set; }

    public DateTime FechaCreacion { get; set; }

    public string? CreadoPor { get; set; }

    public DateTime? FechaModificacion { get; set; }

    public string? ModificadoPor { get; set; }

    public bool? Status { get; set; }

    public virtual Role Rol { get; set; } = null!;

    public virtual Usuario Usuario { get; set; } = null!;
}
