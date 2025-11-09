using System;
using System.Collections.Generic;

namespace PharMind.API.Models;

public partial class AuditMercado
{
    public int Id { get; set; }

    public string? CdgUsuario { get; set; }

    public string? CdgPais { get; set; }

    public string? CdgMercado { get; set; }

    public string? Descripcion { get; set; }

    public string? Closeup { get; set; }

    public string? Audit { get; set; }

    public string? Feedback { get; set; }

    public string? Recetario { get; set; }

    public string? Generado { get; set; }

    public string? Controlado { get; set; }

    public string? Abreviatura { get; set; }

    public string? CdgLabora { get; set; }

    public string? Edicion { get; set; }

    public string? FechaHoraProc { get; set; }

    public string? Path { get; set; }
}
