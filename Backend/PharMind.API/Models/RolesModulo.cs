using System;
using System.Collections.Generic;

namespace PharMind.API.Models;

public partial class RolesModulo
{
    public string Id { get; set; } = null!;

    public string RolId { get; set; } = null!;

    public string ModuloId { get; set; } = null!;

    public bool PuedeVer { get; set; }

    public bool PuedeCrear { get; set; }

    public bool PuedeEditar { get; set; }

    public bool PuedeEliminar { get; set; }

    public DateTime FechaCreacion { get; set; }

    public string? CreadoPor { get; set; }

    public DateTime? FechaModificacion { get; set; }

    public string? ModificadoPor { get; set; }

    public bool? Status { get; set; }

    public bool PuedeExportar { get; set; }

    public bool PuedeImportar { get; set; }

    public bool PuedeAprobar { get; set; }

    public virtual Modulo Modulo { get; set; } = null!;

    public virtual Role Rol { get; set; } = null!;
}
