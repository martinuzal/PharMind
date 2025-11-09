using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace PharMind.API.Models;

[Table("Direcciones")]
public partial class Direccione
{
    public string Id { get; set; } = null!;

    public string? Calle { get; set; }

    public string? Numero { get; set; }

    public string? Apartamento { get; set; }

    public string? Colonia { get; set; }

    public string? Ciudad { get; set; }

    public string? Estado { get; set; }

    public string? CodigoPostal { get; set; }

    public string? Pais { get; set; }

    public string? Referencia { get; set; }

    public string? TipoDireccion { get; set; }

    public bool EsPrincipal { get; set; }

    public decimal? Latitud { get; set; }

    public decimal? Longitud { get; set; }

    public DateTime FechaCreacion { get; set; }

    public string? CreadoPor { get; set; }

    public DateTime? FechaModificacion { get; set; }

    public string? ModificadoPor { get; set; }

    public bool? Status { get; set; }

    public virtual ICollection<Cliente> Clientes { get; set; } = new List<Cliente>();
}
