using System;
using System.Collections.Generic;

namespace PharMind.API.Models;

public partial class Interaccione
{
    public string Id { get; set; } = null!;

    public string CodigoInteraccion { get; set; } = null!;

    public string RelacionId { get; set; } = null!;

    public string AgenteId { get; set; } = null!;

    public string ClienteId { get; set; } = null!;

    public string TipoInteraccion { get; set; } = null!;

    public DateTime Fecha { get; set; }

    public string? Turno { get; set; }

    public int? DuracionMinutos { get; set; }

    public string? Resultado { get; set; }

    public string? ObjetivoVisita { get; set; }

    public string? ResumenVisita { get; set; }

    public string? ProximaAccion { get; set; }

    public DateOnly? FechaProximaAccion { get; set; }

    public decimal? Latitud { get; set; }

    public decimal? Longitud { get; set; }

    public string? Observaciones { get; set; }

    public DateTime FechaCreacion { get; set; }

    public string? CreadoPor { get; set; }

    public DateTime? FechaModificacion { get; set; }

    public string? ModificadoPor { get; set; }

    public bool Status { get; set; }

    public string? EntidadDinamicaId { get; set; }

    public string TipoInteraccionId { get; set; } = null!;

    public virtual Agente Agente { get; set; } = null!;

    public virtual Cliente Cliente { get; set; } = null!;

    public virtual EntidadesDinamica? EntidadDinamica { get; set; }

    public virtual Relacione Relacion { get; set; } = null!;

    public virtual EsquemasPersonalizado TipoInteraccionNavigation { get; set; } = null!;
}
