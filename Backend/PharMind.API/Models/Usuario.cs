using System;
using System.Collections.Generic;

namespace PharMind.API.Models;

public partial class Usuario
{
    public string Id { get; set; } = null!;

    public string EmpresaId { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string? PasswordHash { get; set; }

    public string NombreCompleto { get; set; } = null!;

    public string? Telefono { get; set; }

    public string? Avatar { get; set; }

    public string? Cargo { get; set; }

    public string? Departamento { get; set; }

    public bool EmailVerificado { get; set; }

    public string? TokenVerificacion { get; set; }

    public string? TokenRecuperacion { get; set; }

    public DateTime? TokenRecuperacionExpira { get; set; }

    public string? ProveedorSso { get; set; }

    public string? Ssoid { get; set; }

    public bool Activo { get; set; }

    public DateTime? UltimoAcceso { get; set; }

    public DateTime FechaCreacion { get; set; }

    public bool? Status { get; set; }

    public string? RolId { get; set; }

    public string? AgenteId { get; set; }

    public bool EsAdministrador { get; set; }

    public string? ManagerId { get; set; }

    public virtual Agente? Agente { get; set; }

    public virtual ICollection<Agente> Agentes { get; set; } = new List<Agente>();

    public virtual Empresa Empresa { get; set; } = null!;

    public virtual ICollection<EntidadesDinamica> EntidadesDinamicas { get; set; } = new List<EntidadesDinamica>();

    public virtual Manager? Manager { get; set; }

    public virtual ICollection<Manager> Managers { get; set; } = new List<Manager>();

    public virtual Rol? Rol { get; set; }

    public virtual ICollection<TiempoUtilizado> TiempoUtilizados { get; set; } = new List<TiempoUtilizado>();

    public virtual ICollection<UsuarioRol> UsuarioRoles { get; set; } = new List<UsuarioRol>();
}
