using System;
using System.Collections.Generic;

namespace PharMind.API.Models;

public partial class Relacione
{
    public string Id { get; set; } = null!;

    public string CodigoRelacion { get; set; } = null!;

    public string AgenteId { get; set; } = null!;

    public string ClientePrincipalId { get; set; } = null!;

    public string? ClienteSecundario1Id { get; set; }

    public string? ClienteSecundario2Id { get; set; }

    public string? TipoRelacion { get; set; }

    public DateOnly FechaInicio { get; set; }

    public DateOnly? FechaFin { get; set; }

    public string Estado { get; set; } = null!;

    public string? FrecuenciaVisitas { get; set; }

    public string? Prioridad { get; set; }

    public string? Observaciones { get; set; }

    public DateTime FechaCreacion { get; set; }

    public string? CreadoPor { get; set; }

    public DateTime? FechaModificacion { get; set; }

    public string? ModificadoPor { get; set; }

    public bool Status { get; set; }

    public string TipoRelacionId { get; set; } = null!;

    public string? EntidadDinamicaId { get; set; }

    public Guid? EspecialidadId { get; set; }

    public Guid? CategoriaId { get; set; }

    public Guid? Segment1Id { get; set; }

    public Guid? Segment2Id { get; set; }

    public Guid? Segment3Id { get; set; }

    public Guid? Segment4Id { get; set; }

    public Guid? Segment5Id { get; set; }

    public virtual Agente Agente { get; set; } = null!;

    public virtual Cliente ClientePrincipal { get; set; } = null!;

    public virtual Cliente? ClienteSecundario1 { get; set; }

    public virtual Cliente? ClienteSecundario2 { get; set; }

    public virtual EntidadesDinamica? EntidadDinamica { get; set; }

    public virtual ICollection<Interaccione> Interacciones { get; set; } = new List<Interaccione>();

    public virtual EsquemasPersonalizado TipoRelacionNavigation { get; set; } = null!;
}
