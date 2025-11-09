using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PharMind.API.Data;
using PharMind.API.DTOs;
using PharMind.API.Models;
using System.Security.Claims;

namespace PharMind.API.Controllers;

/// <summary>
/// Controlador centralizado para endpoints de la aplicación móvil
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MobileController : ControllerBase
{
    private readonly PharMindDbContext _context;
    private readonly ILogger<MobileController> _logger;

    public MobileController(PharMindDbContext context, ILogger<MobileController> logger)
    {
        _context = context;
        _logger = logger;
    }

    // ==================== SINCRONIZACIÓN COMPLETA ====================

    /// <summary>
    /// Sincronización completa para la app móvil
    /// GET /api/mobile/sync?agenteId={id}&ultimaSincronizacion={fecha}
    /// </summary>
    [HttpGet("sync")]
    public async Task<ActionResult<MobileSyncResponse>> SyncData(
        [FromQuery] string agenteId,
        [FromQuery] DateTime? ultimaSincronizacion = null)
    {
        try
        {
            _logger.LogInformation($"Iniciando sincronización para agente: {agenteId}");

            var response = new MobileSyncResponse
            {
                FechaSincronizacion = DateTime.UtcNow
            };

            // 1. Obtener relaciones del agente
            var relaciones = await GetRelacionesAgente(agenteId, ultimaSincronizacion);
            response.Relaciones = relaciones;
            response.TotalRelaciones = relaciones.Count;

            // 2. Obtener interacciones del agente
            var interacciones = await GetInteraccionesAgente(agenteId, ultimaSincronizacion);
            response.Interacciones = interacciones;
            response.TotalInteracciones = interacciones.Count;

            // 3. Obtener clientes relacionados
            var clienteIds = relaciones
                .SelectMany(r => new[] { r.ClientePrincipalId, r.ClienteSecundario1Id, r.ClienteSecundario2Id })
                .Where(id => !string.IsNullOrEmpty(id))
                .Distinct()
                .ToList();

            var clientes = await GetClientesPorIds(clienteIds!);
            response.Clientes = clientes;
            response.TotalClientes = clientes.Count;

            // 4. Obtener tipos de relación e interacción
            response.TiposRelacion = await GetTiposRelacion();
            response.TiposInteraccion = await GetTiposInteraccion();

            _logger.LogInformation($"Sincronización completada. Relaciones: {response.TotalRelaciones}, " +
                                 $"Interacciones: {response.TotalInteracciones}, Clientes: {response.TotalClientes}");

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error en sincronización para agente {agenteId}");
            return StatusCode(500, new { error = "Error al sincronizar datos", details = ex.Message });
        }
    }

    // ==================== RELACIONES ====================

    /// <summary>
    /// Obtiene todas las relaciones de un agente
    /// GET /api/mobile/relaciones?agenteId={id}
    /// </summary>
    [HttpGet("relaciones")]
    public async Task<ActionResult<List<RelacionMobileDto>>> GetRelaciones([FromQuery] string agenteId)
    {
        try
        {
            var relaciones = await GetRelacionesAgente(agenteId, null);
            return Ok(relaciones);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error al obtener relaciones del agente {agenteId}");
            return StatusCode(500, new { error = "Error al obtener relaciones", details = ex.Message });
        }
    }

    /// <summary>
    /// Obtiene una relación específica por ID
    /// GET /api/mobile/relaciones/{id}
    /// </summary>
    [HttpGet("relaciones/{id}")]
    public async Task<ActionResult<RelacionMobileDto>> GetRelacion(string id)
    {
        try
        {
            var relacion = await _context.Relaciones
                .Include(r => r.TipoRelacionEsquema)
                .Include(r => r.ClientePrincipal)
                .Include(r => r.ClienteSecundario1)
                .Include(r => r.ClienteSecundario2)
                .Include(r => r.Agente)
                .Include(r => r.DatosExtendidos)
                .Where(r => r.Id == id && r.Status == false)
                .FirstOrDefaultAsync();

            if (relacion == null)
            {
                return NotFound(new { error = "Relación no encontrada" });
            }

            var dto = MapRelacionToMobileDto(relacion);
            return Ok(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error al obtener relación {id}");
            return StatusCode(500, new { error = "Error al obtener relación", details = ex.Message });
        }
    }

    /// <summary>
    /// Actualiza una relación existente desde móvil
    /// PUT /api/mobile/relaciones/{id}
    /// </summary>
    [HttpPut("relaciones/{id}")]
    public async Task<ActionResult<RelacionMobileDto>> UpdateRelacion(string id, [FromBody] UpdateRelacionMobileDto dto)
    {
        try
        {
            var relacion = await _context.Relaciones
                .Include(r => r.DatosExtendidos)
                .FirstOrDefaultAsync(r => r.Id == id && r.Status == false);

            if (relacion == null)
            {
                return NotFound(new { error = "Relación no encontrada" });
            }

            // Actualizar campos básicos
            if (dto.ClientePrincipalId != null) relacion.ClientePrincipalId = dto.ClientePrincipalId;
            if (dto.ClienteSecundario1Id != null) relacion.ClienteSecundario1Id = dto.ClienteSecundario1Id;
            if (dto.ClienteSecundario2Id != null) relacion.ClienteSecundario2Id = dto.ClienteSecundario2Id;
            if (dto.Prioridad != null) relacion.Prioridad = dto.Prioridad;
            if (dto.FrecuenciaVisitas != null) relacion.FrecuenciaVisitas = dto.FrecuenciaVisitas;
            if (dto.Observaciones != null) relacion.Observaciones = dto.Observaciones;
            if (dto.Estado != null) relacion.Estado = dto.Estado;
            if (dto.FechaFin != null) relacion.FechaFin = dto.FechaFin;

            relacion.FechaModificacion = DateTime.UtcNow;

            // Actualizar datos dinámicos si existen
            if (dto.DatosDinamicos != null && dto.DatosDinamicos.Count > 0)
            {
                if (relacion.EntidadDinamicaId != null && relacion.DatosExtendidos != null)
                {
                    // Actualizar entidad existente
                    relacion.DatosExtendidos.Datos = System.Text.Json.JsonSerializer.Serialize(dto.DatosDinamicos);
                    relacion.DatosExtendidos.FechaModificacion = DateTime.UtcNow;
                }
                else
                {
                    // Crear nueva entidad dinámica
                    var EntidadesDinamica = new EntidadesDinamica
                    {
                        EsquemaId = relacion.TipoRelacionId,
                        Datos = System.Text.Json.JsonSerializer.Serialize(dto.DatosDinamicos)
                    };
                    _context.EntidadesDinamicas.Add(EntidadesDinamica);
                    await _context.SaveChangesAsync();
                    relacion.EntidadDinamicaId = EntidadesDinamica.Id;
                }
            }

            await _context.SaveChangesAsync();

            // Recargar con includes
            var relacionActualizada = await _context.Relaciones
                .Include(r => r.TipoRelacionEsquema)
                .Include(r => r.ClientePrincipal)
                .Include(r => r.ClienteSecundario1)
                .Include(r => r.ClienteSecundario2)
                .Include(r => r.Agente)
                .Include(r => r.DatosExtendidos)
                .FirstAsync(r => r.Id == id);

            var result = MapRelacionToMobileDto(relacionActualizada);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error al actualizar relación {id} desde móvil");
            return StatusCode(500, new { error = "Error al actualizar relación", details = ex.Message });
        }
    }

    /// <summary>
    /// Crea una nueva relación desde móvil
    /// POST /api/mobile/relaciones
    /// </summary>
    [HttpPost("relaciones")]
    public async Task<ActionResult<RelacionMobileDto>> CreateRelacion([FromBody] CreateRelacionMobileDto dto)
    {
        try
        {
            // Generar código de relación único
            var codigo = await GenerarCodigoRelacion();

            var relacion = new Relacion
            {
                TipoRelacionId = dto.TipoRelacionId,
                CodigoRelacion = codigo,
                AgenteId = dto.AgenteId,
                ClientePrincipalId = dto.ClientePrincipalId,
                ClienteSecundario1Id = dto.ClienteSecundario1Id,
                ClienteSecundario2Id = dto.ClienteSecundario2Id,
                Prioridad = dto.Prioridad,
                FrecuenciaVisitas = dto.FrecuenciaVisitas,
                Observaciones = dto.Observaciones,
                FechaInicio = DateTime.UtcNow,
                Estado = "Activo"
            };

            // Guardar datos dinámicos si existen
            if (dto.DatosDinamicos != null && dto.DatosDinamicos.Count > 0)
            {
                var EntidadesDinamica = new EntidadesDinamica
                {
                    EsquemaId = dto.TipoRelacionId,
                    Datos = System.Text.Json.JsonSerializer.Serialize(dto.DatosDinamicos)
                };
                _context.EntidadesDinamicas.Add(EntidadesDinamica);
                await _context.SaveChangesAsync();

                relacion.EntidadDinamicaId = EntidadesDinamica.Id;
            }

            _context.Relaciones.Add(relacion);
            await _context.SaveChangesAsync();

            // Recargar con includes
            var relacionCreada = await _context.Relaciones
                .Include(r => r.TipoRelacionEsquema)
                .Include(r => r.ClientePrincipal)
                .Include(r => r.ClienteSecundario1)
                .Include(r => r.ClienteSecundario2)
                .Include(r => r.Agente)
                .Include(r => r.DatosExtendidos)
                .FirstAsync(r => r.Id == relacion.Id);

            var result = MapRelacionToMobileDto(relacionCreada);
            return CreatedAtAction(nameof(GetRelacion), new { id = result.Id }, result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al crear relación desde móvil");
            return StatusCode(500, new { error = "Error al crear relación", details = ex.Message });
        }
    }

    // ==================== INTERACCIONES ====================

    /// <summary>
    /// Obtiene todas las interacciones de un agente
    /// GET /api/mobile/interacciones?agenteId={id}&desde={fecha}&hasta={fecha}
    /// </summary>
    [HttpGet("interacciones")]
    public async Task<ActionResult<List<InteraccionMobileDto>>> GetInteracciones(
        [FromQuery] string agenteId,
        [FromQuery] DateTime? desde = null,
        [FromQuery] DateTime? hasta = null)
    {
        try
        {
            var interacciones = await GetInteraccionesAgente(agenteId, desde, hasta);
            return Ok(interacciones);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error al obtener interacciones del agente {agenteId}");
            return StatusCode(500, new { error = "Error al obtener interacciones", details = ex.Message });
        }
    }

    /// <summary>
    /// Actualiza una interacción existente desde móvil
    /// PUT /api/mobile/interacciones/{id}
    /// </summary>
    [HttpPut("interacciones/{id}")]
    public async Task<ActionResult<InteraccionMobileDto>> UpdateInteraccion(string id, [FromBody] UpdateInteraccionMobileDto dto)
    {
        try
        {
            var interaccion = await _context.Interacciones
                .Include(i => i.DatosExtendidos)
                .FirstOrDefaultAsync(i => i.Id == id && i.Status == false);

            if (interaccion == null)
            {
                return NotFound(new { error = "Interacción no encontrada" });
            }

            // Actualizar campos básicos
            if (dto.Fecha != null) interaccion.Fecha = dto.Fecha.Value;
            if (dto.Turno != null) interaccion.Turno = dto.Turno;
            if (dto.DuracionMinutos != null) interaccion.DuracionMinutos = dto.DuracionMinutos;
            if (dto.ObjetivoVisita != null) interaccion.ObjetivoVisita = dto.ObjetivoVisita;
            if (dto.ResumenVisita != null) interaccion.ResumenVisita = dto.ResumenVisita;
            if (dto.ProximaAccion != null) interaccion.ProximaAccion = dto.ProximaAccion;
            if (dto.FechaProximaAccion != null) interaccion.FechaProximaAccion = dto.FechaProximaAccion;
            if (dto.ResultadoVisita != null) interaccion.Resultado = dto.ResultadoVisita;
            if (dto.Latitud != null) interaccion.Latitud = (decimal?)dto.Latitud;
            if (dto.Longitud != null) interaccion.Longitud = (decimal?)dto.Longitud;
            if (dto.DireccionCapturada != null) interaccion.Observaciones = dto.DireccionCapturada;

            interaccion.FechaModificacion = DateTime.UtcNow;

            // Actualizar datos dinámicos si existen
            if (dto.DatosDinamicos != null && dto.DatosDinamicos.Count > 0)
            {
                if (interaccion.EntidadDinamicaId != null && interaccion.DatosExtendidos != null)
                {
                    // Actualizar entidad existente
                    interaccion.DatosExtendidos.Datos = System.Text.Json.JsonSerializer.Serialize(dto.DatosDinamicos);
                    interaccion.DatosExtendidos.FechaModificacion = DateTime.UtcNow;
                }
                else
                {
                    // Crear nueva entidad dinámica
                    var EntidadesDinamica = new EntidadesDinamica
                    {
                        EsquemaId = interaccion.TipoInteraccionId,
                        Datos = System.Text.Json.JsonSerializer.Serialize(dto.DatosDinamicos)
                    };
                    _context.EntidadesDinamicas.Add(EntidadesDinamica);
                    await _context.SaveChangesAsync();
                    interaccion.EntidadDinamicaId = EntidadesDinamica.Id;
                }
            }

            await _context.SaveChangesAsync();

            // Recargar con includes
            var interaccionActualizada = await _context.Interacciones
                .Include(i => i.TipoInteraccionEsquema)
                .Include(i => i.Cliente)
                .Include(i => i.Agente)
                .Include(i => i.DatosExtendidos)
                .FirstAsync(i => i.Id == id);

            var result = MapInteraccionToMobileDto(interaccionActualizada);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error al actualizar interacción {id} desde móvil");
            return StatusCode(500, new { error = "Error al actualizar interacción", details = ex.Message });
        }
    }

    /// <summary>
    /// Crea una nueva interacción desde móvil
    /// POST /api/mobile/interacciones
    /// </summary>
    [HttpPost("interacciones")]
    public async Task<ActionResult<InteraccionMobileDto>> CreateInteraccion([FromBody] CreateInteraccionMobileDto dto)
    {
        try
        {
            var interaccion = new Interaccion
            {
                TipoInteraccionId = dto.TipoInteraccionId,
                RelacionId = dto.RelacionId,
                AgenteId = dto.AgenteId,
                ClienteId = dto.ClientePrincipalId,
                CodigoInteraccion = $"INT-{DateTime.Now:yyyyMMddHHmmss}",
                TipoInteraccion = "Visita",
                Fecha = dto.Fecha,
                Turno = dto.Turno,
                DuracionMinutos = dto.DuracionMinutos,
                ObjetivoVisita = dto.ObjetivoVisita,
                ResumenVisita = dto.ResumenVisita,
                ProximaAccion = dto.ProximaAccion,
                FechaProximaAccion = dto.FechaProximaAccion,
                Resultado = dto.ResultadoVisita,
                Latitud = (decimal?)dto.Latitud,
                Longitud = (decimal?)dto.Longitud,
                Observaciones = dto.DireccionCapturada
            };

            // Guardar datos dinámicos si existen
            if (dto.DatosDinamicos != null && dto.DatosDinamicos.Count > 0)
            {
                var EntidadesDinamica = new EntidadesDinamica
                {
                    EsquemaId = dto.TipoInteraccionId,
                    Datos = System.Text.Json.JsonSerializer.Serialize(dto.DatosDinamicos)
                };
                _context.EntidadesDinamicas.Add(EntidadesDinamica);
                await _context.SaveChangesAsync();

                interaccion.EntidadDinamicaId = EntidadesDinamica.Id;
            }

            _context.Interacciones.Add(interaccion);
            await _context.SaveChangesAsync();

            // Recargar con includes
            var interaccionCreada = await _context.Interacciones
                .Include(i => i.TipoInteraccionEsquema)
                .Include(i => i.Cliente)
                .Include(i => i.Agente)
                .Include(i => i.DatosExtendidos)
                .FirstAsync(i => i.Id == interaccion.Id);

            var result = MapInteraccionToMobileDto(interaccionCreada);
            return CreatedAtAction(nameof(GetInteracciones), new { agenteId = dto.AgenteId }, result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al crear interacción desde móvil");
            return StatusCode(500, new { error = "Error al crear interacción", details = ex.Message });
        }
    }

    /// <summary>
    /// Crea múltiples interacciones en batch (sincronización offline)
    /// POST /api/mobile/interacciones/batch
    /// </summary>
    [HttpPost("interacciones/batch")]
    public async Task<ActionResult<List<InteraccionMobileDto>>> CreateInteraccionesBatch(
        [FromBody] BatchCreateInteraccionMobileDto dto)
    {
        try
        {
            var resultados = new List<InteraccionMobileDto>();

            foreach (var interaccionDto in dto.Interacciones)
            {
                var interaccion = new Interaccion
                {
                    TipoInteraccionId = interaccionDto.TipoInteraccionId,
                    RelacionId = interaccionDto.RelacionId,
                    AgenteId = interaccionDto.AgenteId,
                    ClienteId = interaccionDto.ClientePrincipalId,
                    CodigoInteraccion = $"INT-{DateTime.Now:yyyyMMddHHmmss}-{Guid.NewGuid().ToString().Substring(0, 4)}",
                    TipoInteraccion = "Visita",
                    Fecha = interaccionDto.Fecha,
                    Turno = interaccionDto.Turno,
                    DuracionMinutos = interaccionDto.DuracionMinutos,
                    ObjetivoVisita = interaccionDto.ObjetivoVisita,
                    ResumenVisita = interaccionDto.ResumenVisita,
                    ProximaAccion = interaccionDto.ProximaAccion,
                    FechaProximaAccion = interaccionDto.FechaProximaAccion,
                    Resultado = interaccionDto.ResultadoVisita,
                    Latitud = (decimal?)interaccionDto.Latitud,
                    Longitud = (decimal?)interaccionDto.Longitud,
                    Observaciones = interaccionDto.DireccionCapturada
                };

                // Guardar datos dinámicos si existen
                if (interaccionDto.DatosDinamicos != null && interaccionDto.DatosDinamicos.Count > 0)
                {
                    var EntidadesDinamica = new EntidadesDinamica
                    {
                        EsquemaId = interaccionDto.TipoInteraccionId,
                        Datos = System.Text.Json.JsonSerializer.Serialize(interaccionDto.DatosDinamicos)
                    };
                    _context.EntidadesDinamicas.Add(EntidadesDinamica);
                    await _context.SaveChangesAsync();

                    interaccion.EntidadDinamicaId = EntidadesDinamica.Id;
                }

                _context.Interacciones.Add(interaccion);
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation($"Batch de interacciones creado: {dto.Interacciones.Count} registros");

            return Ok(new { mensaje = $"{dto.Interacciones.Count} interacciones creadas exitosamente" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al crear batch de interacciones");
            return StatusCode(500, new { error = "Error al crear interacciones", details = ex.Message });
        }
    }

    // ==================== DASHBOARD ====================

    /// <summary>
    /// Obtiene estadísticas del dashboard para un agente
    /// GET /api/mobile/dashboard?agenteId={id}
    /// </summary>
    [HttpGet("dashboard")]
    public async Task<ActionResult<MobileDashboardDto>> GetDashboard([FromQuery] string agenteId)
    {
        try
        {
            var agente = await _context.Agentes
                .Where(a => a.Id == agenteId)
                .FirstOrDefaultAsync();

            if (agente == null)
            {
                return NotFound(new { error = "Agente no encontrado" });
            }

            var hoy = DateTime.Today;
            var inicioSemana = hoy.AddDays(-(int)hoy.DayOfWeek);
            var inicioMes = new DateTime(hoy.Year, hoy.Month, 1);

            var dashboard = new MobileDashboardDto
            {
                AgenteId = agenteId,
                AgenteNombre = $"{agente.Nombre} {agente.Apellido}",

                // Relaciones
                TotalRelaciones = await _context.Relaciones
                    .Where(r => r.AgenteId == agenteId && r.Status == false)
                    .CountAsync(),

                RelacionesActivas = await _context.Relaciones
                    .Where(r => r.AgenteId == agenteId && r.Estado == "Activo" && r.Status == false)
                    .CountAsync(),

                RelacionesPrioridadA = await _context.Relaciones
                    .Where(r => r.AgenteId == agenteId && r.Prioridad == "A" && r.Status == false)
                    .CountAsync(),

                RelacionesPrioridadB = await _context.Relaciones
                    .Where(r => r.AgenteId == agenteId && r.Prioridad == "B" && r.Status == false)
                    .CountAsync(),

                RelacionesPrioridadC = await _context.Relaciones
                    .Where(r => r.AgenteId == agenteId && r.Prioridad == "C" && r.Status == false)
                    .CountAsync(),

                // Interacciones
                InteraccionesHoy = await _context.Interacciones
                    .Where(i => i.AgenteId == agenteId && i.Fecha.Date == hoy && i.Status == false)
                    .CountAsync(),

                InteraccionesSemana = await _context.Interacciones
                    .Where(i => i.AgenteId == agenteId && i.Fecha >= inicioSemana && i.Status == false)
                    .CountAsync(),

                InteraccionesMes = await _context.Interacciones
                    .Where(i => i.AgenteId == agenteId && i.Fecha >= inicioMes && i.Status == false)
                    .CountAsync(),

                // Interacciones por tipo
                InteraccionesPorTipo = await _context.Interacciones
                    .Where(i => i.AgenteId == agenteId && i.Fecha >= inicioMes && i.Status == false)
                    .Include(i => i.TipoInteraccionEsquema)
                    .GroupBy(i => i.TipoInteraccionEsquema!.Nombre)
                    .Select(g => new { Tipo = g.Key, Cantidad = g.Count() })
                    .ToDictionaryAsync(x => x.Tipo, x => x.Cantidad)
            };

            return Ok(dashboard);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error al obtener dashboard del agente {agenteId}");
            return StatusCode(500, new { error = "Error al obtener dashboard", details = ex.Message });
        }
    }

    // ==================== MÉTODOS PRIVADOS ====================

    private async Task<List<RelacionMobileDto>> GetRelacionesAgente(string agenteId, DateTime? desde)
    {
        var query = _context.Relaciones
            .Include(r => r.TipoRelacionEsquema)
            .Include(r => r.ClientePrincipal)
            .Include(r => r.ClienteSecundario1)
            .Include(r => r.ClienteSecundario2)
            .Include(r => r.Agente)
            .Include(r => r.DatosExtendidos)
            .Where(r => r.AgenteId == agenteId && r.Status == false);

        if (desde.HasValue)
        {
            query = query.Where(r => r.FechaModificacion >= desde || r.FechaCreacion >= desde);
        }

        var relaciones = await query.ToListAsync();

        return relaciones.Select(r => MapRelacionToMobileDto(r)).ToList();
    }

    private async Task<List<InteraccionMobileDto>> GetInteraccionesAgente(
        string agenteId,
        DateTime? desde,
        DateTime? hasta = null)
    {
        var query = _context.Interacciones
            .Include(i => i.TipoInteraccionEsquema)
            .Include(i => i.Cliente)
            .Include(i => i.Agente)
            .Include(i => i.DatosExtendidos)
            .Where(i => i.AgenteId == agenteId && i.Status == false);

        if (desde.HasValue)
        {
            query = query.Where(i => i.Fecha >= desde);
        }

        if (hasta.HasValue)
        {
            query = query.Where(i => i.Fecha <= hasta);
        }

        var interacciones = await query
            .OrderByDescending(i => i.Fecha)
            .ToListAsync();

        return interacciones.Select(i => MapInteraccionToMobileDto(i)).ToList();
    }

    private async Task<List<ClienteMobileDto>> GetClientesPorIds(List<string> ids)
    {
        var clientes = await _context.Clientes
            .Include(c => c.TipoCliente)
            .Include(c => c.Direccion)
            .Include(c => c.Institucion)
            .Where(c => ids.Contains(c.Id) && c.Status == false)
            .ToListAsync();

        return clientes.Select(c => new ClienteMobileDto
        {
            Id = c.Id,
            TipoClienteId = c.TipoClienteId,
            TipoClienteNombre = c.TipoCliente?.Nombre,
            CodigoCliente = c.CodigoCliente,
            Nombre = c.Nombre,
            Apellido = c.Apellido,
            RazonSocial = c.RazonSocial,
            Especialidad = c.Especialidad,
            Categoria = c.Categoria,
            Segmento = c.Segmento,
            Email = c.Email,
            Telefono = c.Telefono,
            DireccionCompleta = c.Direccion != null
                ? $"{c.Direccion.Calle} {c.Direccion.Numero}, {c.Direccion.Ciudad}"
                : null,
            Ciudad = c.Direccion?.Ciudad,
            Provincia = c.Direccion?.Estado,
            InstitucionId = c.InstitucionId,
            InstitucionNombre = c.Institucion?.RazonSocial,
            Estado = c.Estado,

        }).ToList();
    }

    private async Task<List<TipoRelacionMobileDto>> GetTiposRelacion()
    {
        var tipos = await _context.EsquemasPersonalizados
            .Where(e => e.EntidadTipo == "Relacion" && e.Activo && e.Status == false)
            .OrderBy(e => e.Orden)
            .ToListAsync();

        return tipos.Select(t => new TipoRelacionMobileDto
        {
            Id = t.Id,
            Nombre = t.Nombre,
            SubTipo = t.SubTipo ?? "",
            Descripcion = t.Descripcion,
            Icono = t.Icono,
            Color = t.Color,
            Schema = t.Schema,
            Activo = t.Activo,
            Orden = t.Orden
        }).ToList();
    }

    private async Task<List<TipoInteraccionMobileDto>> GetTiposInteraccion()
    {
        var tipos = await _context.EsquemasPersonalizados
            .Where(e => e.EntidadTipo == "Interaccion" && e.Activo && e.Status == false)
            .OrderBy(e => e.Orden)
            .ToListAsync();

        return tipos.Select(t => new TipoInteraccionMobileDto
        {
            Id = t.Id,
            Nombre = t.Nombre,
            SubTipo = t.SubTipo ?? "",
            Descripcion = t.Descripcion,
            Icono = t.Icono,
            Color = t.Color,
            Schema = t.Schema,
            Activo = t.Activo,
            Orden = t.Orden
        }).ToList();
    }

    private RelacionMobileDto MapRelacionToMobileDto(Relacion r)
    {
        // Buscar última interacción
        var ultimaInteraccion = _context.Interacciones
            .Where(i => i.RelacionId == r.Id && i.Status == false)
            .Include(i => i.TipoInteraccionEsquema)
            .OrderByDescending(i => i.Fecha)
            .Select(i => new { i.Fecha, TipoNombre = i.TipoInteraccionEsquema!.Nombre })
            .FirstOrDefault();

        return new RelacionMobileDto
        {
            Id = r.Id,
            TipoRelacionId = r.TipoRelacionId,
            TipoRelacionNombre = r.TipoRelacionEsquema?.Nombre ?? "",
            TipoRelacionSubTipo = r.TipoRelacionEsquema?.SubTipo ?? "",
            TipoRelacionIcono = r.TipoRelacionEsquema?.Icono,
            TipoRelacionColor = r.TipoRelacionEsquema?.Color,
            TipoRelacionSchema = r.TipoRelacionEsquema?.Schema,
            CodigoRelacion = r.CodigoRelacion,
            AgenteId = r.AgenteId,
            AgenteNombre = r.Agente != null ? $"{r.Agente.Nombre} {r.Agente.Apellido}" : null,
            ClientePrincipalId = r.ClientePrincipalId,
            ClientePrincipalNombre = r.ClientePrincipal?.RazonSocial,
            ClientePrincipalTelefono = r.ClientePrincipal?.Telefono,
            ClientePrincipalEmail = r.ClientePrincipal?.Email,
            ClientePrincipalEspecialidad = r.ClientePrincipal?.Especialidad,
            ClienteSecundario1Id = r.ClienteSecundario1Id,
            ClienteSecundario1Nombre = r.ClienteSecundario1?.RazonSocial,
            ClienteSecundario2Id = r.ClienteSecundario2Id,
            ClienteSecundario2Nombre = r.ClienteSecundario2?.RazonSocial,
            TipoRelacion = r.TipoRelacionEsquema?.SubTipo,
            FechaInicio = r.FechaInicio,
            FechaFin = r.FechaFin,
            Estado = r.Estado,
            FrecuenciaVisitas = r.FrecuenciaVisitas,
            Prioridad = r.Prioridad,
            PrioridadVisita = null, // Campo no existe en modelo actual
            Observaciones = r.Observaciones,
            DatosDinamicos = r.DatosExtendidos != null
                ? System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object?>>(r.DatosExtendidos.Datos)
                : null,
            UltimaInteraccionFecha = ultimaInteraccion?.Fecha,
            UltimaInteraccionTipo = ultimaInteraccion?.TipoNombre,
            FechaCreacion = r.FechaCreacion,
            FechaModificacion = r.FechaModificacion
        };
    }

    private InteraccionMobileDto MapInteraccionToMobileDto(Interaccion i)
    {
        return new InteraccionMobileDto
        {
            Id = i.Id,
            TipoInteraccionId = i.TipoInteraccionId,
            TipoInteraccionNombre = i.TipoInteraccionEsquema?.Nombre ?? "",
            TipoInteraccionSubTipo = i.TipoInteraccionEsquema?.SubTipo ?? "",
            TipoInteraccionIcono = i.TipoInteraccionEsquema?.Icono,
            TipoInteraccionColor = i.TipoInteraccionEsquema?.Color,
            RelacionId = i.RelacionId,
            AgenteId = i.AgenteId,
            AgenteNombre = i.Agente != null ? $"{i.Agente.Nombre} {i.Agente.Apellido}" : null,
            ClientePrincipalId = i.ClienteId,
            ClientePrincipalNombre = i.Cliente?.RazonSocial,
            ClienteSecundario1Id = null,
            ClienteSecundario1Nombre = null,
            Fecha = i.Fecha,
            Turno = i.Turno,
            DuracionMinutos = i.DuracionMinutos,
            ObjetivoVisita = i.ObjetivoVisita,
            ResumenVisita = i.ResumenVisita,
            ProximaAccion = i.ProximaAccion,
            FechaProximaAccion = i.FechaProximaAccion,
            ResultadoVisita = i.Resultado,
            Latitud = (double?)i.Latitud,
            Longitud = (double?)i.Longitud,
            DireccionCapturada = i.Observaciones,
            DatosDinamicos = i.DatosExtendidos != null
                ? System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object?>>(i.DatosExtendidos.Datos)
                : null,
            Estado = "Completada",
            Sincronizada = true,
            FechaCreacion = i.FechaCreacion,
            FechaModificacion = i.FechaModificacion,
            CreadoPor = i.CreadoPor
        };
    }

    private async Task<string> GenerarCodigoRelacion()
    {
        var ultimoCodigo = await _context.Relaciones
            .Where(r => r.CodigoRelacion.StartsWith("REL-"))
            .OrderByDescending(r => r.CodigoRelacion)
            .Select(r => r.CodigoRelacion)
            .FirstOrDefaultAsync();

        if (ultimoCodigo == null)
        {
            return "REL-00001";
        }

        var numero = int.Parse(ultimoCodigo.Split('-')[1]);
        return $"REL-{(numero + 1):D5}";
    }
}
