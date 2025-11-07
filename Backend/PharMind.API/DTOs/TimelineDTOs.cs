namespace PharMind.API.DTOs;

/// <summary>
/// DTO para Timeline con sus períodos
/// </summary>
public class TimelineDto
{
    public Guid Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public string? Color { get; set; }
    public int Anio { get; set; }
    public bool Activo { get; set; }
    public bool EsDefault { get; set; }
    public DateTime FechaCreacion { get; set; }
    public string? CreadoPor { get; set; }
    public DateTime? FechaModificacion { get; set; }
    public string? ModificadoPor { get; set; }
    public List<PeriodDto> Periods { get; set; } = new();
}

/// <summary>
/// DTO para Period
/// </summary>
public class PeriodDto
{
    public Guid Id { get; set; }
    public Guid TimelineId { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string? Codigo { get; set; }
    public int Orden { get; set; }
    public DateTime FechaInicio { get; set; }
    public DateTime FechaFin { get; set; }
    public string? Color { get; set; }
    public string? Descripcion { get; set; }
    public bool Activo { get; set; }
}

/// <summary>
/// DTO para crear Timeline
/// </summary>
public class CreateTimelineDto
{
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public string? Color { get; set; }
    public int Anio { get; set; }
    public bool Activo { get; set; } = true;
    public bool EsDefault { get; set; } = false;
    public List<CreatePeriodDto> Periods { get; set; } = new();
}

/// <summary>
/// DTO para crear Period
/// </summary>
public class CreatePeriodDto
{
    public string Nombre { get; set; } = string.Empty;
    public string? Codigo { get; set; }
    public int Orden { get; set; }
    public DateTime FechaInicio { get; set; }
    public DateTime FechaFin { get; set; }
    public string? Color { get; set; }
    public string? Descripcion { get; set; }
    public bool Activo { get; set; } = true;
}

/// <summary>
/// DTO para actualizar Timeline
/// </summary>
public class UpdateTimelineDto
{
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public string? Color { get; set; }
    public int Anio { get; set; }
    public bool Activo { get; set; }
    public bool EsDefault { get; set; }
    public List<UpdatePeriodDto> Periods { get; set; } = new();
}

/// <summary>
/// DTO para actualizar Period
/// </summary>
public class UpdatePeriodDto
{
    public Guid? Id { get; set; } // Null si es nuevo
    public string Nombre { get; set; } = string.Empty;
    public string? Codigo { get; set; }
    public int Orden { get; set; }
    public DateTime FechaInicio { get; set; }
    public DateTime FechaFin { get; set; }
    public string? Color { get; set; }
    public string? Descripcion { get; set; }
    public bool Activo { get; set; }
}

/// <summary>
/// DTO para asignar Timeline a Agente
/// </summary>
public class AssignTimelineDto
{
    public Guid? TimelineId { get; set; }
}
