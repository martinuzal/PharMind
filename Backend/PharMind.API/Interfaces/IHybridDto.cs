namespace PharMind.API.Interfaces;

/// <summary>
/// Interfaz para DTOs de entidades híbridas
/// </summary>
public interface IHybridDto
{
    string Id { get; set; }
    string TipoEntidadId { get; set; }
    string? TipoEntidadNombre { get; set; }
    string? EntidadDinamicaId { get; set; }
    Dictionary<string, object?>? DatosDinamicos { get; set; }
    DateTime FechaCreacion { get; set; }
    string? CreadoPor { get; set; }
    DateTime? FechaModificacion { get; set; }
    string? ModificadoPor { get; set; }
}

/// <summary>
/// Interfaz para DTOs de creación de entidades híbridas
/// </summary>
public interface ICreateHybridDto
{
    string TipoEntidadId { get; set; }
    Dictionary<string, object?>? DatosDinamicos { get; set; }
}

/// <summary>
/// Interfaz para DTOs de actualización de entidades híbridas
/// </summary>
public interface IUpdateHybridDto
{
    Dictionary<string, object?>? DatosDinamicos { get; set; }
}
