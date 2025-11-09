using System;
using System.Collections.Generic;

namespace PharMind.API.Models;

public partial class Role
{
    public string Id { get; set; } = null!;

    public string EmpresaId { get; set; } = null!;

    public string Nombre { get; set; } = null!;

    public string? Descripcion { get; set; }

    public bool EsSistema { get; set; }

    public bool Activo { get; set; }

    public DateTime FechaCreacion { get; set; }

    public string? CreadoPor { get; set; }

    public DateTime? FechaModificacion { get; set; }

    public string? ModificadoPor { get; set; }

    public bool? Status { get; set; }

    public string Codigo { get; set; } = null!;

    public virtual Empresa Empresa { get; set; } = null!;

    public virtual ICollection<RolModulo> RolModulos { get; set; } = new List<RolModulo>();

    public virtual ICollection<RolesModulo> RolesModulos { get; set; } = new List<RolesModulo>();

    public virtual ICollection<UsuarioRole> UsuarioRoles { get; set; } = new List<UsuarioRole>();

    public virtual ICollection<Usuario> Usuarios { get; set; } = new List<Usuario>();
}
