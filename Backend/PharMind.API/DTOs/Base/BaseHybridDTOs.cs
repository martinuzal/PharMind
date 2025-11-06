using PharMind.API.Interfaces;

namespace PharMind.API.DTOs.Base;

/// <summary>
/// DTO base para entidades híbridas (GET responses)
/// </summary>
public abstract class BaseHybridEntityDto : IHybridDto
{
    public string Id { get; set; } = string.Empty;
    public abstract string TipoEntidadId { get; set; }
    public string? TipoEntidadNombre { get; set; }
    public string? EntidadDinamicaId { get; set; }
    public Dictionary<string, object?>? DatosDinamicos { get; set; }
    public DateTime FechaCreacion { get; set; }
    public string? CreadoPor { get; set; }
    public DateTime? FechaModificacion { get; set; }
    public string? ModificadoPor { get; set; }
}

/// <summary>
/// DTO base para creación de entidades híbridas (POST requests)
/// </summary>
public abstract class BaseCreateHybridDto : ICreateHybridDto
{
    public abstract string TipoEntidadId { get; set; }
    public Dictionary<string, object?>? DatosDinamicos { get; set; }
}

/// <summary>
/// DTO base para actualización de entidades híbridas (PUT requests)
/// </summary>
public abstract class BaseUpdateHybridDto : IUpdateHybridDto
{
    public Dictionary<string, object?>? DatosDinamicos { get; set; }
}

/// <summary>
/// Respuesta de lista paginada genérica
/// </summary>
public class ListResponse<T> : IListResponse<T>
{
    public List<T> Items { get; set; } = new();
    public int TotalItems { get; set; }
    public int TotalPages { get; set; }
    public int CurrentPage { get; set; }
}
