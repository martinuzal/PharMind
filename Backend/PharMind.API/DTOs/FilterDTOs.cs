namespace PharMind.API.DTOs;

/// <summary>
/// Tipos de filtros disponibles
/// </summary>
public enum FilterType
{
    Text,
    Number,
    Date,
    Select,
    Multiselect,
    DateRange,
    Boolean
}

/// <summary>
/// Operadores de filtros
/// </summary>
public enum FilterOperator
{
    Eq,          // Igual
    Neq,         // No igual
    Contains,    // Contiene
    StartsWith,  // Empieza con
    EndsWith,    // Termina con
    Gt,          // Mayor que
    Gte,         // Mayor o igual
    Lt,          // Menor que
    Lte,         // Menor o igual
    In,          // En lista
    NotIn,       // No en lista
    Between,     // Entre (rangos)
    IsNull,      // Es nulo
    IsNotNull    // No es nulo
}

/// <summary>
/// Filtro activo enviado desde el frontend
/// </summary>
public class ActiveFilterDto
{
    public string Id { get; set; } = string.Empty;
    public string Field { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public FilterOperator Operator { get; set; }
    public object? Value { get; set; }
    public object? Value2 { get; set; }
    public string? LogicalOperator { get; set; } = "AND";
}

/// <summary>
/// Request de filtrado con paginación
/// </summary>
public class FilterRequestDto
{
    public string EntityType { get; set; } = string.Empty;
    public List<ActiveFilterDto> Filters { get; set; } = new();
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string? SortBy { get; set; }
    public string? SortDirection { get; set; } = "asc";
}

/// <summary>
/// Respuesta paginada con filtros
/// </summary>
public class FilteredListResponse<T>
{
    public List<T> Items { get; set; } = new();
    public int TotalItems { get; set; }
    public int TotalPages { get; set; }
    public int CurrentPage { get; set; }
    public int PageSize { get; set; }
    public List<ActiveFilterDto> AppliedFilters { get; set; } = new();
}
