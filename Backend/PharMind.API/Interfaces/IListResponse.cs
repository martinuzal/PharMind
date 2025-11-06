namespace PharMind.API.Interfaces;

/// <summary>
/// Interfaz para respuestas de lista paginadas
/// </summary>
public interface IListResponse<T>
{
    List<T> Items { get; set; }
    int TotalItems { get; set; }
    int TotalPages { get; set; }
    int CurrentPage { get; set; }
}
