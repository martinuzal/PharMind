using System;
using System.Collections.Generic;

namespace PharMind.API.Models;

public partial class Empresa
{
    public string Id { get; set; } = null!;

    public string Nombre { get; set; } = null!;

    public string? RazonSocial { get; set; }

    public string? Cuit { get; set; }

    public string? Telefono { get; set; }

    public string? Email { get; set; }

    public string? Direccion { get; set; }

    public string? Logo { get; set; }

    public bool Activo { get; set; }

    public DateTime FechaCreacion { get; set; }

    public string? CreadoPor { get; set; }

    public DateTime? FechaModificacion { get; set; }

    public string? ModificadoPor { get; set; }

    public bool? Status { get; set; }

    public virtual ICollection<EntidadesDinamica> EntidadesDinamicas { get; set; } = new List<EntidadesDinamica>();

    public virtual ICollection<EsquemasPersonalizado> EsquemasPersonalizados { get; set; } = new List<EsquemasPersonalizado>();

    public virtual ICollection<Role> Roles { get; set; } = new List<Role>();

    public virtual ICollection<Usuario> Usuarios { get; set; } = new List<Usuario>();
}
