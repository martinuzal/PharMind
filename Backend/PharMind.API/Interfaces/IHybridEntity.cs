namespace PharMind.API.Interfaces;

/// <summary>
/// Interfaz para entidades híbridas (estáticas + dinámicas)
/// </summary>
public interface IHybridEntity
{
    string Id { get; set; }
    string? EntidadDinamicaId { get; set; }
    bool Status { get; set; }
    DateTime FechaCreacion { get; set; }
    string? CreadoPor { get; set; }
    DateTime? FechaModificacion { get; set; }
    string? ModificadoPor { get; set; }
}
