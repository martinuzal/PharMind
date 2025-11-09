using System;
using System.Collections.Generic;

namespace PharMind.API.Models;

public partial class AuditoriaAgente
{
    public string Id { get; set; } = null!;

    public string AgenteId { get; set; } = null!;

    public string TipoOperacion { get; set; } = null!;

    public string? CampoModificado { get; set; }

    public string? ValorAnterior { get; set; }

    public string? ValorNuevo { get; set; }

    public string? Descripcion { get; set; }

    public DateTime FechaOperacion { get; set; }

    public string UsuarioOperacion { get; set; } = null!;

    public string? DireccionIp { get; set; }

    public virtual Agente Agente { get; set; } = null!;
}
