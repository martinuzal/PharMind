using System;
using System.Collections.Generic;

namespace PharMind.API.Models;

public partial class Modulo
{
    public string Id { get; set; } = null!;

    public string Nombre { get; set; } = null!;

    public string? Descripcion { get; set; }

    public string? Icono { get; set; }

    public string? Ruta { get; set; }

    public int OrdenMenu { get; set; }

    public bool Activo { get; set; }

    public string? ModuloPadreId { get; set; }

    public DateTime FechaCreacion { get; set; }

    public string? CreadoPor { get; set; }

    public DateTime? FechaModificacion { get; set; }

    public string? ModificadoPor { get; set; }

    public bool? Status { get; set; }

    public string Codigo { get; set; } = null!;

    public virtual ICollection<Modulo> InverseModuloPadre { get; set; } = new List<Modulo>();

    public virtual Modulo? ModuloPadre { get; set; }

    public virtual ICollection<RolModulo> RolModulos { get; set; } = new List<RolModulo>();

    public virtual ICollection<RolesModulo> RolesModulos { get; set; } = new List<RolesModulo>();
}
