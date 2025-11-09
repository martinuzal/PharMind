using System;
using System.Collections.Generic;

namespace PharMind.API.Models;

public partial class AnalyticsMedico
{
    public int Id { get; set; }

    public string Nombre { get; set; } = null!;

    public string Apellido { get; set; } = null!;

    public string Especialidad { get; set; } = null!;

    public string Matricula { get; set; } = null!;

    public string Segmento { get; set; } = null!;

    public string TipoAtencion { get; set; } = null!;

    public string? Direccion { get; set; }

    public string Ciudad { get; set; } = null!;

    public string Provincia { get; set; } = null!;

    public string? Telefono { get; set; }

    public string? Email { get; set; }

    public DateTime FechaAlta { get; set; }

    public bool Activo { get; set; }

    public string? Categoria { get; set; }

    public string? TipoInstitucion { get; set; }

    public string? Sector { get; set; }

    public virtual ICollection<AnalyticsVisita> AnalyticsVisita { get; set; } = new List<AnalyticsVisita>();
}
