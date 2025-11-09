using System;
using System.Collections.Generic;

namespace PharMind.API.Models;

public partial class Agente
{
    public string Id { get; set; } = null!;

    public string CodigoAgente { get; set; } = null!;

    public string Nombre { get; set; } = null!;

    public string? CodigoDistrito { get; set; }

    public string? DistritoNombre { get; set; }

    public string? CodigoLineaNegocio { get; set; }

    public string? LineaNegocioNombre { get; set; }

    public string? Email { get; set; }

    public string? Telefono { get; set; }

    public string? ZonaGeografica { get; set; }

    public string? SupervisorId { get; set; }

    public DateOnly? FechaIngreso { get; set; }

    public string Estado { get; set; } = null!;

    public DateTime FechaCreacion { get; set; }

    public string? CreadoPor { get; set; }

    public DateTime? FechaModificacion { get; set; }

    public string? ModificadoPor { get; set; }

    public bool Status { get; set; }

    public string? DistritoId { get; set; }

    public string? LineaNegocioId { get; set; }

    public string TipoAgenteId { get; set; } = null!;

    public string? EntidadDinamicaId { get; set; }

    public string? Apellido { get; set; }

    public string? RegionId { get; set; }

    public string? ManagerId { get; set; }

    public bool Activo { get; set; }

    public string? Observaciones { get; set; }

    public Guid? TimelineId { get; set; }

    public virtual ICollection<AuditoriaAgente> AuditoriaAgentes { get; set; } = new List<AuditoriaAgente>();

    public virtual Distrito? Distrito { get; set; }

    public virtual EntidadesDinamica? EntidadesDinamica { get; set; }

    public virtual ICollection<Interaccione> Interacciones { get; set; } = new List<Interaccione>();

    public virtual LineasNegocio? LineaNegocio { get; set; }

    public virtual Manager? Manager { get; set; }

    public virtual Regiones? Region { get; set; }

    public virtual ICollection<Relacione> Relaciones { get; set; } = new List<Relacione>();

    public virtual Usuario? Supervisor { get; set; }

    public virtual Timeline? Timeline { get; set; }

    public virtual EsquemasPersonalizado TipoAgente { get; set; } = null!;

    public virtual ICollection<Usuario> Usuarios { get; set; } = new List<Usuario>();
}
