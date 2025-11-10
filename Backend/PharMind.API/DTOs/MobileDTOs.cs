using System.ComponentModel.DataAnnotations;

namespace PharMind.API.DTOs;

// ==================== DTOs DE SINCRONIZACIÓN ====================

public class MobileSyncRequest
{
    public string AgenteId { get; set; } = string.Empty;
    public DateTime? UltimaSincronizacion { get; set; }
}

public class MobileSyncResponse
{
    public List<RelacionMobileDto> Relaciones { get; set; } = new();
    public List<InteraccionMobileDto> Interacciones { get; set; } = new();
    public List<ClienteMobileDto> Clientes { get; set; } = new();
    public List<TipoRelacionMobileDto> TiposRelacion { get; set; } = new();
    public List<TipoInteraccionMobileDto> TiposInteraccion { get; set; } = new();

    // Nuevos módulos agregados
    public List<ProductoDto> Productos { get; set; } = new();
    public List<InventarioAgenteDto> Inventarios { get; set; } = new();
    public List<CitaDto> Citas { get; set; } = new();

    public DateTime FechaSincronizacion { get; set; } = DateTime.UtcNow;
    public int TotalRelaciones { get; set; }
    public int TotalInteracciones { get; set; }
    public int TotalClientes { get; set; }
    public int TotalProductos { get; set; }
    public int TotalInventarios { get; set; }
    public int TotalCitas { get; set; }
}

// ==================== RELACIÓN MOBILE ====================

public class RelacionMobileDto
{
    public string Id { get; set; } = string.Empty;
    public string TipoRelacionId { get; set; } = string.Empty;
    public string TipoRelacionNombre { get; set; } = string.Empty;
    public string TipoRelacionSubTipo { get; set; } = string.Empty;
    public string? TipoRelacionIcono { get; set; }
    public string? TipoRelacionColor { get; set; }
    public string? TipoRelacionSchema { get; set; }

    public string CodigoRelacion { get; set; } = string.Empty;
    public string AgenteId { get; set; } = string.Empty;
    public string? AgenteNombre { get; set; }

    // Cliente Principal
    public string ClientePrincipalId { get; set; } = string.Empty;
    public string? ClientePrincipalNombre { get; set; }
    public string? ClientePrincipalTelefono { get; set; }
    public string? ClientePrincipalEmail { get; set; }
    public string? ClientePrincipalEspecialidad { get; set; }

    // Cliente Secundario 1 (ej: Institución)
    public string? ClienteSecundario1Id { get; set; }
    public string? ClienteSecundario1Nombre { get; set; }

    // Cliente Secundario 2
    public string? ClienteSecundario2Id { get; set; }
    public string? ClienteSecundario2Nombre { get; set; }

    public string? TipoRelacion { get; set; }
    public DateTime FechaInicio { get; set; }
    public DateTime? FechaFin { get; set; }
    public string Estado { get; set; } = "Activo";

    // Campos de planificación
    public string? FrecuenciaVisitas { get; set; }
    public string? Prioridad { get; set; } // A, B, C
    public string? PrioridadVisita { get; set; }
    public string? Observaciones { get; set; }

    // Datos dinámicos
    public Dictionary<string, object?>? DatosDinamicos { get; set; }

    // Última interacción
    public DateTime? UltimaInteraccionFecha { get; set; }
    public string? UltimaInteraccionTipo { get; set; }

    // Auditoría
    public DateTime FechaCreacion { get; set; }
    public DateTime? FechaModificacion { get; set; }
}

public class CreateRelacionMobileDto
{
    [Required]
    public string TipoRelacionId { get; set; } = string.Empty;

    [Required]
    public string AgenteId { get; set; } = string.Empty;

    [Required]
    public string ClientePrincipalId { get; set; } = string.Empty;

    public string? ClienteSecundario1Id { get; set; }
    public string? ClienteSecundario2Id { get; set; }
    public string? Prioridad { get; set; }
    public string? FrecuenciaVisitas { get; set; }
    public string? Observaciones { get; set; }
    public Dictionary<string, object?>? DatosDinamicos { get; set; }
}

public class UpdateRelacionMobileDto
{
    public string? ClientePrincipalId { get; set; }
    public string? ClienteSecundario1Id { get; set; }
    public string? ClienteSecundario2Id { get; set; }
    public string? Prioridad { get; set; }
    public string? FrecuenciaVisitas { get; set; }
    public string? Observaciones { get; set; }
    public string? Estado { get; set; }
    public DateTime? FechaFin { get; set; }
    public Dictionary<string, object?>? DatosDinamicos { get; set; }
}

// ==================== INTERACCIÓN MOBILE ====================

public class InteraccionMobileDto
{
    public string Id { get; set; } = string.Empty;
    public string TipoInteraccionId { get; set; } = string.Empty;
    public string TipoInteraccionNombre { get; set; } = string.Empty;
    public string TipoInteraccionSubTipo { get; set; } = string.Empty;
    public string? TipoInteraccionIcono { get; set; }
    public string? TipoInteraccionColor { get; set; }

    public string RelacionId { get; set; } = string.Empty;
    public string AgenteId { get; set; } = string.Empty;
    public string? AgenteNombre { get; set; }

    // Clientes (desnormalizado para rendimiento)
    public string ClientePrincipalId { get; set; } = string.Empty;
    public string? ClientePrincipalNombre { get; set; }
    public string? ClienteSecundario1Id { get; set; }
    public string? ClienteSecundario1Nombre { get; set; }

    public DateTime Fecha { get; set; }
    public string? Turno { get; set; } // Mañana, Tarde, Noche
    public int? DuracionMinutos { get; set; }

    // Contenido
    public string? ObjetivoVisita { get; set; }
    public string? ResumenVisita { get; set; }
    public string? ProximaAccion { get; set; }
    public DateTime? FechaProximaAccion { get; set; }
    public string? ResultadoVisita { get; set; }

    // Geolocalización
    public double? Latitud { get; set; }
    public double? Longitud { get; set; }
    public string? DireccionCapturada { get; set; }

    // Datos dinámicos
    public Dictionary<string, object?>? DatosDinamicos { get; set; }

    // Estado
    public string Estado { get; set; } = "Completada";
    public bool Sincronizada { get; set; } = false;

    // Auditoría
    public DateTime FechaCreacion { get; set; }
    public DateTime? FechaModificacion { get; set; }
    public string? CreadoPor { get; set; }
}

public class CreateInteraccionMobileDto
{
    [Required]
    public string TipoInteraccionId { get; set; } = string.Empty;

    [Required]
    public string RelacionId { get; set; } = string.Empty;

    [Required]
    public string AgenteId { get; set; } = string.Empty;

    [Required]
    public string ClientePrincipalId { get; set; } = string.Empty;

    public string? ClienteSecundario1Id { get; set; }

    [Required]
    public DateTime Fecha { get; set; }

    public string? Turno { get; set; }
    public int? DuracionMinutos { get; set; }
    public string? ObjetivoVisita { get; set; }
    public string? ResumenVisita { get; set; }
    public string? ProximaAccion { get; set; }
    public DateTime? FechaProximaAccion { get; set; }
    public string? ResultadoVisita { get; set; }
    public double? Latitud { get; set; }
    public double? Longitud { get; set; }
    public string? DireccionCapturada { get; set; }
    public Dictionary<string, object?>? DatosDinamicos { get; set; }
}

public class UpdateInteraccionMobileDto
{
    public DateTime? Fecha { get; set; }
    public string? Turno { get; set; }
    public int? DuracionMinutos { get; set; }
    public string? ObjetivoVisita { get; set; }
    public string? ResumenVisita { get; set; }
    public string? ProximaAccion { get; set; }
    public DateTime? FechaProximaAccion { get; set; }
    public string? ResultadoVisita { get; set; }
    public double? Latitud { get; set; }
    public double? Longitud { get; set; }
    public string? DireccionCapturada { get; set; }
    public Dictionary<string, object?>? DatosDinamicos { get; set; }
}

public class BatchCreateInteraccionMobileDto
{
    public List<CreateInteraccionMobileDto> Interacciones { get; set; } = new();
}

// ==================== CLIENTE MOBILE ====================

public class ClienteMobileDto
{
    public string Id { get; set; } = string.Empty;
    public string TipoClienteId { get; set; } = string.Empty;
    public string? TipoClienteNombre { get; set; }

    public string CodigoCliente { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string? Apellido { get; set; }
    public string RazonSocial { get; set; } = string.Empty;
    public string? Especialidad { get; set; }
    public string? Categoria { get; set; }
    public string? Segmento { get; set; }

    public string? Email { get; set; }
    public string? Telefono { get; set; }

    // Dirección simplificada
    public string? DireccionCompleta { get; set; }
    public string? Ciudad { get; set; }
    public string? Provincia { get; set; }

    // Institución (si aplica)
    public string? InstitucionId { get; set; }
    public string? InstitucionNombre { get; set; }

    public string Estado { get; set; } = "Activo";

    // Datos dinámicos
    public Dictionary<string, object?>? DatosDinamicos { get; set; }
}

// ==================== TIPOS (ESQUEMAS) MOBILE ====================

public class TipoRelacionMobileDto
{
    public string Id { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string SubTipo { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public string? Icono { get; set; }
    public string? Color { get; set; }
    public string Schema { get; set; } = "{}";
    public bool Activo { get; set; } = true;
    public int? Orden { get; set; }
}

public class TipoInteraccionMobileDto
{
    public string Id { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string SubTipo { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public string? Icono { get; set; }
    public string? Color { get; set; }
    public string Schema { get; set; } = "{}";
    public bool Activo { get; set; } = true;
    public int? Orden { get; set; }
}

// ==================== DASHBOARD / ESTADÍSTICAS ====================

public class MobileDashboardDto
{
    public string AgenteId { get; set; } = string.Empty;
    public string AgenteNombre { get; set; } = string.Empty;

    // Relaciones
    public int TotalRelaciones { get; set; }
    public int RelacionesActivas { get; set; }
    public int RelacionesPrioridadA { get; set; }
    public int RelacionesPrioridadB { get; set; }
    public int RelacionesPrioridadC { get; set; }

    // Interacciones
    public int InteraccionesHoy { get; set; }
    public int InteraccionesSemana { get; set; }
    public int InteraccionesMes { get; set; }
    public int InteraccionesPendientesSincronizar { get; set; }

    // Siguiente visita programada
    public DateTime? ProximaVisitaFecha { get; set; }
    public string? ProximaVisitaCliente { get; set; }

    // Última sincronización
    public DateTime? UltimaSincronizacion { get; set; }

    // Estadísticas por tipo de interacción
    public Dictionary<string, int> InteraccionesPorTipo { get; set; } = new();
}
