using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PharMind.API.Models;

[Table("TablasMaestras")]
public class TablaMaestra : AuditableEntity
{
    [Column("NombreTabla")]
    [Required]
    [MaxLength(100)]
    public string NombreTabla { get; set; } = string.Empty;

    [Column("Descripcion")]
    [MaxLength(500)]
    public string? Descripcion { get; set; }

    [Column("EsquemaColumnas")]
    [Required]
    public string EsquemaColumnas { get; set; } = "[]"; // JSON con definición de columnas

    [Column("TablaCreada")]
    public bool TablaCreada { get; set; } = false; // Indica si la tabla SQL ya fue creada

    [Column("Activo")]
    public bool Activo { get; set; } = true;
}

// Clase para definir columnas de la tabla maestra
public class ColumnaDef
{
    public string Nombre { get; set; } = string.Empty;
    public string Tipo { get; set; } = "nvarchar"; // nvarchar, int, bit, datetime, decimal
    public int? Longitud { get; set; } // Para nvarchar
    public bool EsRequerido { get; set; } = false;
    public bool EsClavePrimaria { get; set; } = false;
    public bool EsUnico { get; set; } = false;
    public string? ValorPorDefecto { get; set; }
}
