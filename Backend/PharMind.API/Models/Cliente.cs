using System;
using System.Collections.Generic;

namespace PharMind.API.Models;

public partial class Cliente
{
    public string Id { get; set; } = null!;

    public string CodigoCliente { get; set; } = null!;

    public string RazonSocial { get; set; } = null!;

    public string? Especialidad { get; set; }

    public string? Categoria { get; set; }

    public string? Segmento { get; set; }

    public string? InstitucionId { get; set; }

    public string? Email { get; set; }

    public string? Telefono { get; set; }

    public string? DireccionId { get; set; }

    public string Estado { get; set; } = null!;

    public DateTime FechaCreacion { get; set; }

    public string? CreadoPor { get; set; }

    public DateTime? FechaModificacion { get; set; }

    public string? ModificadoPor { get; set; }

    public bool Status { get; set; }

    public string TipoClienteId { get; set; } = null!;

    public string? EntidadDinamicaId { get; set; }

    public string Nombre { get; set; } = null!;

    public string? Apellido { get; set; }

    public string? CodigoAudit { get; set; }

    public virtual Direccione? Direccion { get; set; }

    public virtual EntidadesDinamica? EntidadesDinamica { get; set; }

    public virtual Cliente? Institucion { get; set; }

    public virtual ICollection<Interaccione> Interacciones { get; set; } = new List<Interaccione>();

    public virtual ICollection<Cliente> InverseInstitucion { get; set; } = new List<Cliente>();

    public virtual ICollection<Relacione> RelacioneClientePrincipals { get; set; } = new List<Relacione>();

    public virtual ICollection<Relacione> RelacioneClienteSecundario1s { get; set; } = new List<Relacione>();

    public virtual ICollection<Relacione> RelacioneClienteSecundario2s { get; set; } = new List<Relacione>();

    public virtual EsquemasPersonalizado TipoCliente { get; set; } = null!;
}
