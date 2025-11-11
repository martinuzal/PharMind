using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PharMind.API.Data;
using PharMind.API.DTOs;
using PharMind.API.Models;
using PharMind.API.Services;
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
    private readonly IFrecuenciaVisitasService _frecuenciaService;

    public MobileController(PharMindDbContext context, ILogger<MobileController> logger, IFrecuenciaVisitasService frecuenciaService)
    {
        _context = context;
        _logger = logger;
        _frecuenciaService = frecuenciaService;
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

            // Calcular frecuencia de visitas para cada relación
            foreach (var relacion in relaciones)
            {
                try
                {
                    var frecuencia = await _frecuenciaService.CalcularFrecuenciaAsync(relacion.Id);
                    if (frecuencia != null)
                    {
                        relacion.Frecuencia = new FrecuenciaIndicadorDto
                        {
                            InteraccionesRealizadas = frecuencia.InteraccionesRealizadas,
                            FrecuenciaObjetivo = frecuencia.FrecuenciaObjetivo,
                            PeriodoMedicion = frecuencia.PeriodoMedicion,
                            FechaInicioPeriodo = frecuencia.FechaInicioPeriodo,
                            FechaFinPeriodo = frecuencia.FechaFinPeriodo,
                            Estado = frecuencia.Estado,
                            VisitasPendientes = frecuencia.VisitasPendientes
                        };
                    }
                }
                catch (Exception exFrecuencia)
                {
                    _logger.LogWarning(exFrecuencia, $"No se pudo calcular frecuencia para relación {relacion.Id} durante sincronización");
                }
            }

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

            // 5. Obtener productos activos
            var productos = await GetProductosActivos();
            response.Productos = productos;
            response.TotalProductos = productos.Count;

            // 6. Obtener inventario del agente
            var inventarios = await GetInventariosAgente(agenteId);
            response.Inventarios = inventarios;
            response.TotalInventarios = inventarios.Count;

            // 7. Obtener citas del mes actual
            var citas = await GetCitasMesActual(agenteId);
            response.Citas = citas;
            response.TotalCitas = citas.Count;

            _logger.LogInformation($"Sincronización completada. Relaciones: {response.TotalRelaciones}, " +
                                 $"Interacciones: {response.TotalInteracciones}, Clientes: {response.TotalClientes}, " +
                                 $"Productos: {response.TotalProductos}, Inventarios: {response.TotalInventarios}, Citas: {response.TotalCitas}");

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error en sincronización para agente {agenteId}");
            return StatusCode(500, new { error = "Error al sincronizar datos", details = ex.Message });
        }
    }

    // ==================== CLIENTES ====================

    /// <summary>
    /// Obtiene todos los clientes que tienen al menos una relación con el agente
    /// GET /api/mobile/clientes?agenteId={id}
    /// </summary>
    [HttpGet("clientes")]
    public async Task<ActionResult<List<ClienteMobileDto>>> GetClientesPorAgente([FromQuery] string agenteId)
    {
        try
        {
            _logger.LogInformation($"🔵 GET /api/mobile/clientes - AgenteId: {agenteId}");

            // Obtener IDs de clientes que tienen relaciones con el agente
            var relaciones = await _context.Relaciones
                .Where(r => r.AgenteId == agenteId && r.Status == false)
                .Select(r => new { r.ClientePrincipalId, r.ClienteSecundario1Id, r.ClienteSecundario2Id })
                .ToListAsync();

            var clienteIds = new HashSet<string>();
            foreach (var rel in relaciones)
            {
                if (!string.IsNullOrEmpty(rel.ClientePrincipalId))
                    clienteIds.Add(rel.ClientePrincipalId);
                if (!string.IsNullOrEmpty(rel.ClienteSecundario1Id))
                    clienteIds.Add(rel.ClienteSecundario1Id);
                if (!string.IsNullOrEmpty(rel.ClienteSecundario2Id))
                    clienteIds.Add(rel.ClienteSecundario2Id);
            }

            _logger.LogInformation($"📊 Total clientes con relaciones: {clienteIds.Count}");

            // Obtener datos completos de los clientes usando el método existente
            var clientes = await GetClientesPorIds(clienteIds.ToList());

            _logger.LogInformation($"Retornando {clientes.Count} clientes para agente {agenteId}");
            return Ok(clientes);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error al obtener clientes del agente {agenteId}");
            return StatusCode(500, new { error = "Error al obtener clientes", details = ex.Message });
        }
    }

    // ==================== RELACIONES ====================

    /// <summary>
    /// Obtiene todas las relaciones de un agente
    /// GET /api/mobile/relaciones?agenteId={id}&incluirFrecuencia={bool}&soloConPendientes={bool}
    /// </summary>
    [HttpGet("relaciones")]
    public async Task<ActionResult<List<RelacionMobileDto>>> GetRelaciones(
        [FromQuery] string agenteId,
        [FromQuery] bool incluirFrecuencia = true,
        [FromQuery] bool soloConPendientes = false)
    {
        try
        {
            _logger.LogInformation($"🔵 GET /api/mobile/relaciones - AgenteId: {agenteId}, incluirFrecuencia: {incluirFrecuencia}, soloConPendientes: {soloConPendientes}");

            var relaciones = await GetRelacionesAgente(agenteId, null);
            _logger.LogInformation($"📊 Total relaciones encontradas: {relaciones.Count}");

            // Calcular frecuencia de visitas si se solicita
            if (incluirFrecuencia)
            {
                int conFrecuencia = 0;
                int sinFrecuencia = 0;

                foreach (var relacion in relaciones)
                {
                    try
                    {
                        var frecuencia = await _frecuenciaService.CalcularFrecuenciaAsync(relacion.Id);
                        if (frecuencia != null)
                        {
                            relacion.Frecuencia = new FrecuenciaIndicadorDto
                            {
                                InteraccionesRealizadas = frecuencia.InteraccionesRealizadas,
                                FrecuenciaObjetivo = frecuencia.FrecuenciaObjetivo,
                                PeriodoMedicion = frecuencia.PeriodoMedicion,
                                FechaInicioPeriodo = frecuencia.FechaInicioPeriodo,
                                FechaFinPeriodo = frecuencia.FechaFinPeriodo,
                                Estado = frecuencia.Estado,
                                VisitasPendientes = frecuencia.VisitasPendientes
                            };
                            conFrecuencia++;
                            _logger.LogInformation($"✅ Frecuencia calculada para {relacion.CodigoRelacion}: Estado={frecuencia.Estado}, {frecuencia.InteraccionesRealizadas}/{frecuencia.FrecuenciaObjetivo}");
                        }
                        else
                        {
                            sinFrecuencia++;
                            _logger.LogInformation($"⚠️ Frecuencia NULL para {relacion.CodigoRelacion} (FrecuenciaVisitas={relacion.FrecuenciaVisitas})");
                        }
                    }
                    catch (Exception exFrecuencia)
                    {
                        sinFrecuencia++;
                        _logger.LogWarning(exFrecuencia, $"❌ Error calculando frecuencia para relación {relacion.Id}");
                    }
                }

                _logger.LogInformation($"📈 Resultado: {conFrecuencia} con frecuencia, {sinFrecuencia} sin frecuencia");
            }

            // Filtrar solo las que tienen visitas pendientes
            if (soloConPendientes)
            {
                relaciones = relaciones
                    .Where(r => r.Frecuencia != null && r.Frecuencia.VisitasPendientes > 0)
                    .ToList();
            }

            _logger.LogInformation($"Retornando {relaciones.Count} relaciones para agente {agenteId}");
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
                    Id = Guid.NewGuid().ToString(),
                    EsquemaId = dto.TipoInteraccionId,
                    Datos = System.Text.Json.JsonSerializer.Serialize(dto.DatosDinamicos),
                    FechaCreacion = DateTime.Now
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
                        Id = Guid.NewGuid().ToString(),
                        EsquemaId = interaccionDto.TipoInteraccionId,
                        Datos = System.Text.Json.JsonSerializer.Serialize(interaccionDto.DatosDinamicos),
                        FechaCreacion = DateTime.Now
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
            .Include(c => c.EntidadesDinamica)
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
            DatosDinamicos = c.EntidadesDinamica != null
                ? System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object?>>(c.EntidadesDinamica.Datos)
                : null

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
        // Buscar última interacción (sin Include porque usamos Select)
        var ultimaInteraccion = _context.Interacciones
            .Where(i => i.RelacionId == r.Id && i.Status == false)
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

    private async Task<List<ProductoDto>> GetProductosActivos()
    {
        var productos = await _context.Productos
            .Where(p => p.Activo && p.Status == false)
            .OrderBy(p => p.Categoria)
            .ThenBy(p => p.Nombre)
            .ToListAsync();

        return productos.Select(p => new ProductoDto
        {
            Id = p.Id,
            CodigoProducto = p.CodigoProducto,
            Nombre = p.Nombre,
            NombreComercial = p.NombreComercial,
            PrincipioActivo = p.PrincipioActivo,
            Categoria = p.Categoria,
            Concentracion = p.Concentracion,
            Presentacion = p.Presentacion,
            Laboratorio = p.Laboratorio,
            EsMuestra = p.EsMuestra,
            RequiereReceta = p.RequiereReceta,
            PrecioReferencia = p.PrecioReferencia,
            Indicaciones = p.Indicaciones,
            Contraindicaciones = p.Contraindicaciones,
            ViaAdministracion = p.ViaAdministracion,
            Descripcion = p.Descripcion,
            Activo = p.Activo,
            FechaCreacion = p.FechaCreacion
        }).ToList();
    }

    private async Task<List<InventarioAgenteDto>> GetInventariosAgente(string agenteId)
    {
        var inventarios = await _context.InventariosAgente
            .Include(i => i.Producto)
            .Include(i => i.Agente)
            .Where(i => i.AgenteId == agenteId && i.Status == false)
            .OrderBy(i => i.Producto!.Nombre)
            .ToListAsync();

        var ahora = DateTime.Now;

        return inventarios.Select(i => new InventarioAgenteDto
        {
            Id = i.Id,
            AgenteId = i.AgenteId,
            ProductoId = i.ProductoId,
            Producto = i.Producto != null ? new ProductoDto
            {
                Id = i.Producto.Id,
                CodigoProducto = i.Producto.CodigoProducto,
                Nombre = i.Producto.Nombre,
                NombreComercial = i.Producto.NombreComercial,
                Categoria = i.Producto.Categoria,
                Presentacion = i.Producto.Presentacion,
                Laboratorio = i.Producto.Laboratorio,
                EsMuestra = i.Producto.EsMuestra,
                RequiereReceta = i.Producto.RequiereReceta,
                PrecioReferencia = i.Producto.PrecioReferencia,
                Activo = i.Producto.Activo
            } : null,
            CantidadInicial = i.CantidadInicial,
            CantidadDisponible = i.CantidadDisponible,
            CantidadEntregada = i.CantidadEntregada,
            LoteActual = i.LoteActual,
            FechaVencimiento = i.FechaVencimiento,
            FechaUltimaRecarga = i.FechaUltimaRecarga,
            Observaciones = i.Observaciones,
            // Calcular helpers
            EstaPorVencer = i.FechaVencimiento.HasValue && (i.FechaVencimiento.Value - ahora).TotalDays <= 30,
            EstaVencido = i.FechaVencimiento.HasValue && i.FechaVencimiento.Value < ahora,
            StockBajo = i.CantidadInicial.HasValue && i.CantidadDisponible < (i.CantidadInicial.Value * 0.2m),
            DiasParaVencer = i.FechaVencimiento.HasValue ? (int)(i.FechaVencimiento.Value - ahora).TotalDays : null
        }).ToList();
    }

    private async Task<List<CitaDto>> GetCitasMesActual(string agenteId)
    {
        var hoy = DateTime.Now.Date;
        var inicioMes = new DateTime(hoy.Year, hoy.Month, 1);
        var finMes = inicioMes.AddMonths(1).AddDays(-1);

        var citas = await _context.Citas
            .Include(c => c.Agente)
            .Include(c => c.Cliente)
            .Include(c => c.Relacion)
            .Where(c => c.AgenteId == agenteId &&
                       c.FechaInicio >= inicioMes &&
                       c.FechaInicio <= finMes &&
                       c.Status == false)
            .OrderBy(c => c.FechaInicio)
            .ToListAsync();

        return citas.Select(c => MapCitaToDto(c)).ToList();
    }

    private CitaDto MapCitaToDto(Models.Cita c)
    {
        var ahora = DateTime.Now;
        var hoy = ahora.Date;
        var fechaCitaDate = c.FechaInicio.Date;

        return new CitaDto
        {
            Id = c.Id,
            CodigoCita = c.CodigoCita,
            AgenteId = c.AgenteId,
            AgenteNombre = c.Agente != null ? $"{c.Agente.Nombre} {c.Agente.Apellido}" : null,
            RelacionId = c.RelacionId,
            ClienteId = c.ClienteId,
            ClienteNombre = c.Cliente?.RazonSocial,
            InteraccionId = c.InteraccionId,
            Titulo = c.Titulo,
            Descripcion = c.Descripcion,
            FechaInicio = c.FechaInicio,
            FechaFin = c.FechaFin,
            TodoElDia = c.TodoElDia,
            TipoCita = c.TipoCita,
            Estado = c.Estado,
            Prioridad = c.Prioridad,
            Ubicacion = c.Ubicacion,
            Latitud = c.Latitud,
            Longitud = c.Longitud,
            Color = c.Color,
            Recordatorio = c.Recordatorio,
            MinutosAntes = c.MinutosAntes,
            Notas = c.Notas,
            Orden = c.Orden,
            DistanciaKm = c.DistanciaKm,
            TiempoEstimadoMinutos = c.TiempoEstimadoMinutos,
            FechaCreacion = c.FechaCreacion,
            EsHoy = fechaCitaDate == hoy,
            YaPaso = c.FechaFin < ahora,
            EnProgreso = c.FechaInicio <= ahora && c.FechaFin >= ahora,
            DuracionMinutos = (int)(c.FechaFin - c.FechaInicio).TotalMinutes
        };
    }

    // ==================== MUESTRAS Y PRODUCTOS DE INTERACCIONES ====================

    /// <summary>
    /// Obtiene las muestras entregadas en las interacciones de un agente
    /// GET /api/mobile/muestras-entregadas?agenteId={id}
    /// </summary>
    [HttpGet("muestras-entregadas")]
    public async Task<ActionResult<List<InteraccionMuestraEntregadaDto>>> GetMuestrasEntregadas([FromQuery] string agenteId)
    {
        try
        {
            var muestras = await _context.InteraccionMuestrasEntregadas
                .Include(m => m.Producto)
                .Include(m => m.Interaccion)
                .Where(m => m.Interaccion!.AgenteId == agenteId && m.Status == false)
                .OrderByDescending(m => m.FechaCreacion)
                .Select(m => new InteraccionMuestraEntregadaDto
                {
                    Id = m.Id,
                    InteraccionId = m.InteraccionId,
                    ProductoId = m.ProductoId,
                    ProductoNombre = m.Producto!.Nombre,
                    Cantidad = m.Cantidad,
                    Observaciones = m.Observaciones,
                    FechaCreacion = m.FechaCreacion
                })
                .ToListAsync();

            _logger.LogInformation($"✅ {muestras.Count} muestras entregadas para agente {agenteId}");
            return Ok(muestras);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener muestras entregadas");
            return StatusCode(500, new { error = "Error al obtener muestras entregadas", details = ex.Message });
        }
    }

    /// <summary>
    /// Obtiene los productos promocionados en las interacciones de un agente
    /// GET /api/mobile/productos-promocionados?agenteId={id}
    /// </summary>
    [HttpGet("productos-promocionados")]
    public async Task<ActionResult<List<InteraccionProductoPromocionadoDto>>> GetProductosPromocionados([FromQuery] string agenteId)
    {
        try
        {
            var productos = await _context.InteraccionProductosPromocionados
                .Include(p => p.Producto)
                .Include(p => p.Interaccion)
                .Where(p => p.Interaccion!.AgenteId == agenteId && p.Status == false)
                .OrderByDescending(p => p.FechaCreacion)
                .Select(p => new InteraccionProductoPromocionadoDto
                {
                    Id = p.Id,
                    InteraccionId = p.InteraccionId,
                    ProductoId = p.ProductoId,
                    ProductoNombre = p.Producto!.Nombre,
                    Cantidad = p.Cantidad,
                    Observaciones = p.Observaciones,
                    FechaCreacion = p.FechaCreacion
                })
                .ToListAsync();

            _logger.LogInformation($"✅ {productos.Count} productos promocionados para agente {agenteId}");
            return Ok(productos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener productos promocionados");
            return StatusCode(500, new { error = "Error al obtener productos promocionados", details = ex.Message });
        }
    }

    /// <summary>
    /// Obtiene los productos solicitados en las interacciones de un agente
    /// GET /api/mobile/productos-solicitados?agenteId={id}
    /// </summary>
    [HttpGet("productos-solicitados")]
    public async Task<ActionResult<List<InteraccionProductoSolicitadoMobileDto>>> GetProductosSolicitados([FromQuery] string agenteId)
    {
        try
        {
            var productos = await _context.InteraccionProductosSolicitados
                .Include(p => p.Producto)
                .Include(p => p.Interaccion)
                .Where(p => p.Interaccion!.AgenteId == agenteId && p.Status == false)
                .OrderByDescending(p => p.FechaCreacion)
                .Select(p => new InteraccionProductoSolicitadoMobileDto
                {
                    Id = p.Id,
                    InteraccionId = p.InteraccionId,
                    ProductoId = p.ProductoId,
                    ProductoNombre = p.Producto!.Nombre,
                    Cantidad = p.Cantidad,
                    Estado = p.Estado,
                    Observaciones = p.Observaciones,
                    FechaCreacion = p.FechaCreacion
                })
                .ToListAsync();

            _logger.LogInformation($"✅ {productos.Count} productos solicitados para agente {agenteId}");
            return Ok(productos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener productos solicitados");
            return StatusCode(500, new { error = "Error al obtener productos solicitados", details = ex.Message });
        }
    }

    // ==================== MOVIMIENTOS DE INVENTARIO ====================

    /// <summary>
    /// Obtiene los movimientos de inventario de un agente
    /// GET /api/mobile/movimientos-inventario?agenteId={id}
    /// </summary>
    [HttpGet("movimientos-inventario")]
    public async Task<ActionResult<List<MovimientoInventarioDto>>> GetMovimientosInventario([FromQuery] string agenteId)
    {
        try
        {
            var movimientos = await _context.MovimientosInventario
                .Include(m => m.InventarioAgente)
                .Where(m => m.InventarioAgente!.AgenteId == agenteId && m.Status == false)
                .OrderByDescending(m => m.FechaMovimiento)
                .Select(m => new MovimientoInventarioDto
                {
                    Id = m.Id,
                    InventarioAgenteId = m.InventarioAgenteId,
                    TipoMovimiento = m.TipoMovimiento,
                    Cantidad = m.Cantidad,
                    CantidadAnterior = m.CantidadAnterior,
                    CantidadNueva = m.CantidadNueva,
                    MuestraMedicaId = m.MuestraMedicaId,
                    Motivo = m.Motivo,
                    Observaciones = m.Observaciones,
                    FechaMovimiento = m.FechaMovimiento,
                    FechaCreacion = m.FechaCreacion
                })
                .ToListAsync();

            _logger.LogInformation($"✅ {movimientos.Count} movimientos de inventario para agente {agenteId}");
            return Ok(movimientos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener movimientos de inventario");
            return StatusCode(500, new { error = "Error al obtener movimientos de inventario", details = ex.Message });
        }
    }

    // ==================== TIEMPO UTILIZADO ====================

    /// <summary>
    /// Obtiene los registros de tiempo utilizado de un agente
    /// GET /api/mobile/tiempo-utilizado?agenteId={id}
    /// </summary>
    [HttpGet("tiempo-utilizado")]
    public async Task<ActionResult<List<TiempoUtilizadoDto>>> GetTiempoUtilizado([FromQuery] string agenteId)
    {
        try
        {
            var tiempos = await _context.TiempoUtilizado
                .Include(t => t.TipoActividad)
                .Where(t => t.RepresentanteId == agenteId && t.Status == false)
                .OrderByDescending(t => t.Fecha)
                .Select(t => new TiempoUtilizadoDto
                {
                    Id = t.Id,
                    RepresentanteId = t.RepresentanteId,
                    Fecha = t.Fecha,
                    TipoActividadId = t.TipoActividadId,
                    TipoActividadNombre = t.TipoActividad!.Nombre,
                    Descripcion = t.Descripcion,
                    HorasUtilizadas = t.HorasUtilizadas,
                    MinutosUtilizados = t.MinutosUtilizados,
                    Turno = t.Turno,
                    EsRecurrente = t.EsRecurrente,
                    Observaciones = t.Observaciones,
                    FechaCreacion = t.FechaCreacion
                })
                .ToListAsync();

            _logger.LogInformation($"✅ {tiempos.Count} registros de tiempo utilizado para agente {agenteId}");
            return Ok(tiempos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener tiempo utilizado");
            return StatusCode(500, new { error = "Error al obtener tiempo utilizado", details = ex.Message });
        }
    }

    /// <summary>
    /// Obtiene los tipos de actividad
    /// GET /api/mobile/tipos-actividad
    /// </summary>
    [HttpGet("tipos-actividad")]
    public async Task<ActionResult<List<TipoActividadDto>>> GetTiposActividad()
    {
        try
        {
            var tipos = await _context.TiposActividad
                .Where(t => t.Activo && t.Status == false)
                .OrderBy(t => t.Orden)
                .Select(t => new TipoActividadDto
                {
                    Id = t.Id,
                    Codigo = t.Codigo,
                    Nombre = t.Nombre,
                    Descripcion = t.Descripcion,
                    Clasificacion = t.Clasificacion,
                    Color = t.Color,
                    Icono = t.Icono,
                    Activo = t.Activo,
                    EsSistema = t.EsSistema,
                    Orden = t.Orden
                })
                .ToListAsync();

            _logger.LogInformation($"✅ {tipos.Count} tipos de actividad");
            return Ok(tipos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener tipos de actividad");
            return StatusCode(500, new { error = "Error al obtener tipos de actividad", details = ex.Message });
        }
    }
}
