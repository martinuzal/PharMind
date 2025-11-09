using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace PharMind.API.Models;

[Table("EsquemasPersonalizados")]
public partial class EsquemasPersonalizado
{
    public string Id { get; set; } = null!;

    public string? EmpresaId { get; set; }

    public string EntidadTipo { get; set; } = null!;

    public string? SubTipo { get; set; }

    public string Nombre { get; set; } = null!;

    public string? Descripcion { get; set; }

    public string? Icono { get; set; }

    public string? Color { get; set; }

    public string Schema { get; set; } = null!;

    public string? ReglasValidacion { get; set; }

    public string? ReglasCorrelacion { get; set; }

    public string? ConfiguracionUi { get; set; }

    public int Version { get; set; }

    public bool Activo { get; set; }

    public int? Orden { get; set; }

    public DateTime FechaCreacion { get; set; }

    public string? CreadoPor { get; set; }

    public DateTime? FechaModificacion { get; set; }

    public string? ModificadoPor { get; set; }

    public bool? Status { get; set; }

    public bool CruceAudit { get; set; }

    public virtual ICollection<Agente> Agentes { get; set; } = new List<Agente>();

    public virtual ICollection<Cliente> Clientes { get; set; } = new List<Cliente>();

    public virtual Empresa? Empresa { get; set; }

    public virtual ICollection<EntidadesDinamica> EntidadesDinamicas { get; set; } = new List<EntidadesDinamica>();

    public virtual ICollection<Interaccione> Interacciones { get; set; } = new List<Interaccione>();

    public virtual ICollection<Relacione> Relaciones { get; set; } = new List<Relacione>();
}
