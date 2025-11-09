using System;
using System.Collections.Generic;

namespace PharMind.API.Models;

public partial class EntidadesDinamica
{
    public string Id { get; set; } = null!;

    public string EsquemaId { get; set; } = null!;

    public string? EmpresaId { get; set; }

    public string Datos { get; set; } = null!;

    public string? Estado { get; set; }

    public string? Tags { get; set; }

    public DateTime FechaCreacion { get; set; }

    public string? CreadoPor { get; set; }

    public DateTime? FechaModificacion { get; set; }

    public string? ModificadoPor { get; set; }

    public bool? Status { get; set; }

    public string? FullDescription { get; set; }

    public string? UsuarioId { get; set; }

    public virtual ICollection<Agente> Agentes { get; set; } = new List<Agente>();

    public virtual ICollection<Cliente> Clientes { get; set; } = new List<Cliente>();

    public virtual Empresa? Empresa { get; set; }

    public virtual EsquemasPersonalizado Esquema { get; set; } = null!;

    public virtual ICollection<Interaccione> Interacciones { get; set; } = new List<Interaccione>();

    public virtual ICollection<Relacione> Relaciones { get; set; } = new List<Relacione>();

    public virtual Usuario? Usuario { get; set; }
}
