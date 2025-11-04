namespace PharMind.API.DTOs;

public class ClienteDto
{
    public string Id { get; set; } = string.Empty;
    public string TipoClienteId { get; set; } = string.Empty;
    public string? TipoClienteNombre { get; set; }
    public string? EntidadDinamicaId { get; set; }
    public Dictionary<string, object?>? DatosDinamicos { get; set; }

    public string CodigoCliente { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string? Apellido { get; set; }
    public string RazonSocial { get; set; } = string.Empty;
    public string? Especialidad { get; set; }
    public string? Categoria { get; set; }
    public string? Segmento { get; set; }
    public string? InstitucionId { get; set; }
    public string? InstitucionNombre { get; set; }
    public string? Email { get; set; }
    public string? Telefono { get; set; }
    public string? DireccionId { get; set; }
    public DireccionDto? Direccion { get; set; }
    public string Estado { get; set; } = "Activo";
    public DateTime FechaCreacion { get; set; }
    public string? CreadoPor { get; set; }
    public DateTime? FechaModificacion { get; set; }
    public string? ModificadoPor { get; set; }
}

public class CreateClienteDto
{
    public string TipoClienteId { get; set; } = string.Empty;
    public Dictionary<string, object?>? DatosDinamicos { get; set; }

    public string CodigoCliente { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string? Apellido { get; set; }
    public string RazonSocial { get; set; } = string.Empty;
    public string? Especialidad { get; set; }
    public string? Categoria { get; set; }
    public string? Segmento { get; set; }
    public string? InstitucionId { get; set; }
    public string? Email { get; set; }
    public string? Telefono { get; set; }
    public string? DireccionId { get; set; }
    public string Estado { get; set; } = "Activo";
}

public class UpdateClienteDto
{
    public Dictionary<string, object?>? DatosDinamicos { get; set; }

    public string Nombre { get; set; } = string.Empty;
    public string? Apellido { get; set; }
    public string RazonSocial { get; set; } = string.Empty;
    public string? Especialidad { get; set; }
    public string? Categoria { get; set; }
    public string? Segmento { get; set; }
    public string? InstitucionId { get; set; }
    public string? Email { get; set; }
    public string? Telefono { get; set; }
    public string? DireccionId { get; set; }
    public string Estado { get; set; } = "Activo";
}

public class ClienteListResponse
{
    public List<ClienteDto> Items { get; set; } = new();
    public int TotalItems { get; set; }
    public int TotalPages { get; set; }
    public int CurrentPage { get; set; }
}

public class DireccionDto
{
    public string Id { get; set; } = string.Empty;
    public string? Calle { get; set; }
    public string? Numero { get; set; }
    public string? Ciudad { get; set; }
    public string? Provincia { get; set; }
    public string? CodigoPostal { get; set; }
    public string? Pais { get; set; }
}
