using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PharMind.API.Data;
using PharMind.API.DTOs;
using PharMind.API.Models;
using PharMind.API.Services;
using System.Text.Json;
using AutoMapper;

namespace PharMind.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RelacionesController : ControllerBase
{
    private readonly PharMindDbContext _context;
    private readonly ILogger<RelacionesController> _logger;
    private readonly IFrecuenciaVisitasService _frecuenciaService;
    private readonly IMapper _mapper;

    public RelacionesController(
        PharMindDbContext context,
        ILogger<RelacionesController> logger,
        IFrecuenciaVisitasService frecuenciaService,
        IMapper mapper)
    {
        _context = context;
        _logger = logger;
        _frecuenciaService = frecuenciaService;
        _mapper = mapper;
    }

    /// <summary>
    /// Obtiene una lista paginada de relaciones
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<RelacionListResponse>> GetRelaciones(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] bool? soloConPendientes = null,
        [FromQuery] bool incluirFrecuencia = true)
    {
        try
        {
            var query = _context.Relaciones
                .AsNoTracking()
                .Include(r => r.TipoRelacionEsquema)
                .Include(r => r.DatosExtendidos)
                .Include(r => r.Agente)
                .Include(r => r.ClientePrincipal)
                .Include(r => r.ClienteSecundario1)
                .Include(r => r.ClienteSecundario2)
                .Where(r => r.Status == false); // Excluir eliminados

            // Contar total de items
            var totalItems = await query.CountAsync();

            // Aplicar paginación
            var items = await query
                .OrderByDescending(r => r.FechaInicio)
                .Skip((page - 1) * pageSize)
                .Take(pageSize * 2) // Cargar más para filtrar después
                .ToListAsync();

            // Mapear a DTOs y calcular frecuencia
            var itemDtos = new List<RelacionDto>();

            foreach (var relacion in items)
            {
                var dto = await MapToDtoAsync(relacion, incluirFrecuencia);

                // Aplicar filtro de pendientes si se especificó
                if (soloConPendientes.HasValue && soloConPendientes.Value)
                {
                    if (dto.Frecuencia != null && dto.Frecuencia.VisitasPendientes > 0)
                    {
                        itemDtos.Add(dto);
                    }
                }
                else
                {
                    itemDtos.Add(dto);
                }

                // Respetar el tamaño de página solicitado
                if (itemDtos.Count >= pageSize)
                    break;
            }

            var totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);

            var response = new RelacionListResponse
            {
                Items = itemDtos,
                TotalItems = totalItems,
                TotalPages = totalPages,
                CurrentPage = page
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener lista de relaciones");
            return StatusCode(500, new { message = "Error al obtener la lista de relaciones" });
        }
    }

    /// <summary>
    /// Obtiene una relación por ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<RelacionDto>> GetRelacionById(string id)
    {
        try
        {
            var relacion = await _context.Relaciones
                .AsNoTracking()
                .Include(r => r.TipoRelacionEsquema)
                .Include(r => r.DatosExtendidos)
                .Include(r => r.Agente)
                .Include(r => r.ClientePrincipal)
                .Include(r => r.ClienteSecundario1)
                .Include(r => r.ClienteSecundario2)
                .FirstOrDefaultAsync(r => r.Id == id && r.Status == false);

            if (relacion == null)
            {
                return NotFound(new { message = "Relación no encontrada" });
            }

            var dto = MapToDto(relacion);

            return Ok(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener relación con ID: {Id}", id);
            return StatusCode(500, new { message = "Error al obtener la relación" });
        }
    }

    /// <summary>
    /// Crea una nueva relación
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<RelacionDto>> CreateRelacion(CreateRelacionDto dto)
    {
        try
        {
            // Validar que el TipoRelacionId existe
            var tipoRelacion = await _context.EsquemasPersonalizados
                .FirstOrDefaultAsync(e => e.Id == dto.TipoRelacionId && e.EntidadTipo == "Relacion" && e.Status == false);

            if (tipoRelacion == null)
            {
                return BadRequest(new { message = "Tipo de relación no encontrado" });
            }

            // Verificar que el agente existe
            var agente = await _context.Agentes.FindAsync(dto.AgenteId);
            if (agente == null)
            {
                return BadRequest(new { message = "Agente no encontrado" });
            }

            // Verificar que el cliente principal existe
            var clientePrincipal = await _context.Clientes.FindAsync(dto.ClientePrincipalId);
            if (clientePrincipal == null)
            {
                return BadRequest(new { message = "Cliente principal no encontrado" });
            }

            // Verificar que el cliente secundario 1 existe si se proporciona
            if (!string.IsNullOrWhiteSpace(dto.ClienteSecundario1Id))
            {
                var clienteSecundario1 = await _context.Clientes.FindAsync(dto.ClienteSecundario1Id);
                if (clienteSecundario1 == null)
                {
                    return BadRequest(new { message = "Cliente secundario 1 no encontrado" });
                }
            }

            // Verificar que el cliente secundario 2 existe si se proporciona
            if (!string.IsNullOrWhiteSpace(dto.ClienteSecundario2Id))
            {
                var clienteSecundario2 = await _context.Clientes.FindAsync(dto.ClienteSecundario2Id);
                if (clienteSecundario2 == null)
                {
                    return BadRequest(new { message = "Cliente secundario 2 no encontrado" });
                }
            }

            // Crear EntidadesDinamica si hay datos dinámicos
            EntidadesDinamica? EntidadesDinamica = null;
            if (dto.DatosDinamicos != null && dto.DatosDinamicos.Count > 0)
            {
                EntidadesDinamica = new EntidadesDinamica
                {
                    Id = Guid.NewGuid().ToString(),
                    EsquemaId = dto.TipoRelacionId,
                    Datos = JsonSerializer.Serialize(dto.DatosDinamicos),
                    Status = false,
                    FechaCreacion = DateTime.Now,
                    CreadoPor = "System"
                };

                _context.EntidadesDinamicas.Add(EntidadesDinamica);
            }

            // Crear relación usando AutoMapper
            var relacion = _mapper.Map<Relacion>(dto);
            relacion.Id = Guid.NewGuid().ToString();
            relacion.EntidadDinamicaId = EntidadesDinamica?.Id;
            relacion.FechaCreacion = DateTime.Now;
            relacion.CreadoPor = "System";

            _context.Relaciones.Add(relacion);
            await _context.SaveChangesAsync();

            // Recargar con datos relacionados
            await _context.Entry(relacion).Reference(r => r.TipoRelacionEsquema).LoadAsync();
            await _context.Entry(relacion).Reference(r => r.DatosExtendidos).LoadAsync();
            await _context.Entry(relacion).Reference(r => r.Agente).LoadAsync();
            await _context.Entry(relacion).Reference(r => r.ClientePrincipal).LoadAsync();
            await _context.Entry(relacion).Reference(r => r.ClienteSecundario1).LoadAsync();
            await _context.Entry(relacion).Reference(r => r.ClienteSecundario2).LoadAsync();

            var result = MapToDto(relacion);

            return CreatedAtAction(nameof(GetRelacionById), new { id = relacion.Id }, result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al crear relación");
            return StatusCode(500, new { message = "Error al crear la relación" });
        }
    }

    /// <summary>
    /// Actualiza una relación existente
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<RelacionDto>> UpdateRelacion(string id, UpdateRelacionDto dto)
    {
        try
        {
            var relacion = await _context.Relaciones
                .AsNoTracking()
                .Include(r => r.TipoRelacionEsquema)
                .Include(r => r.DatosExtendidos)
                .Include(r => r.Agente)
                .Include(r => r.ClientePrincipal)
                .Include(r => r.ClienteSecundario1)
                .Include(r => r.ClienteSecundario2)
                .FirstOrDefaultAsync(r => r.Id == id && r.Status == false);

            if (relacion == null)
            {
                return NotFound(new { message = "Relación no encontrada" });
            }

            // Verificar que el cliente secundario 1 existe si se proporciona
            if (!string.IsNullOrWhiteSpace(dto.ClienteSecundario1Id))
            {
                var clienteSecundario1 = await _context.Clientes.FindAsync(dto.ClienteSecundario1Id);
                if (clienteSecundario1 == null)
                {
                    return BadRequest(new { message = "Cliente secundario 1 no encontrado" });
                }
            }

            // Verificar que el cliente secundario 2 existe si se proporciona
            if (!string.IsNullOrWhiteSpace(dto.ClienteSecundario2Id))
            {
                var clienteSecundario2 = await _context.Clientes.FindAsync(dto.ClienteSecundario2Id);
                if (clienteSecundario2 == null)
                {
                    return BadRequest(new { message = "Cliente secundario 2 no encontrado" });
                }
            }

            // Actualizar o crear EntidadesDinamica con los datos dinámicos
            if (dto.DatosDinamicos != null && dto.DatosDinamicos.Count > 0)
            {
                if (!string.IsNullOrWhiteSpace(relacion.EntidadDinamicaId))
                {
                    // Actualizar entidad dinámica existente
                    var EntidadesDinamica = await _context.EntidadesDinamicas.FindAsync(relacion.EntidadDinamicaId);
                    if (EntidadesDinamica != null)
                    {
                        EntidadesDinamica.Datos = JsonSerializer.Serialize(dto.DatosDinamicos);
                        EntidadesDinamica.FechaModificacion = DateTime.Now;
                        EntidadesDinamica.ModificadoPor = "System";
                    }
                }
                else
                {
                    // Crear nueva entidad dinámica
                    var nuevaEntidadDinamica = new EntidadesDinamica
                    {
                        Id = Guid.NewGuid().ToString(),
                        EsquemaId = relacion.TipoRelacionId,
                        Datos = JsonSerializer.Serialize(dto.DatosDinamicos),
                        Status = false,
                        FechaCreacion = DateTime.Now,
                        CreadoPor = "System"
                    };

                    _context.EntidadesDinamicas.Add(nuevaEntidadDinamica);
                    relacion.EntidadDinamicaId = nuevaEntidadDinamica.Id;
                }
            }

            // Actualizar campos usando AutoMapper
            _mapper.Map(dto, relacion);
            relacion.FechaModificacion = DateTime.Now;
            relacion.ModificadoPor = "System";

            await _context.SaveChangesAsync();

            // Recargar con datos relacionados
            await _context.Entry(relacion).Reference(r => r.TipoRelacionEsquema).LoadAsync();
            await _context.Entry(relacion).Reference(r => r.DatosExtendidos).LoadAsync();
            await _context.Entry(relacion).Reference(r => r.Agente).LoadAsync();
            await _context.Entry(relacion).Reference(r => r.ClientePrincipal).LoadAsync();
            await _context.Entry(relacion).Reference(r => r.ClienteSecundario1).LoadAsync();
            await _context.Entry(relacion).Reference(r => r.ClienteSecundario2).LoadAsync();

            var result = MapToDto(relacion);

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al actualizar relación con ID: {Id}", id);
            return StatusCode(500, new { message = "Error al actualizar la relación" });
        }
    }

    /// <summary>
    /// Elimina (soft delete) una relación
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteRelacion(string id)
    {
        try
        {
            var relacion = await _context.Relaciones.FindAsync(id);

            if (relacion == null || relacion.Status == true)
            {
                return NotFound(new { message = "Relación no encontrada" });
            }

            // Soft delete
            relacion.Status = true;
            relacion.FechaModificacion = DateTime.Now;
            relacion.ModificadoPor = "System";

            await _context.SaveChangesAsync();

            return Ok(new { message = "Relación eliminada exitosamente" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al eliminar relación con ID: {Id}", id);
            return StatusCode(500, new { message = "Error al eliminar la relación" });
        }
    }

    /// <summary>
    /// Mapea una entidad Relacion a RelacionDto incluyendo datos dinámicos y frecuencia
    /// </summary>
    private async Task<RelacionDto> MapToDtoAsync(Relacion relacion, bool incluirFrecuencia = true)
    {
        // Usar AutoMapper para el mapeo base
        var dto = _mapper.Map<RelacionDto>(relacion);

        // Mapear datos dinámicos manualmente
        if (relacion.DatosExtendidos?.Datos != null)
        {
            try
            {
                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };
                dto.DatosDinamicos = JsonSerializer.Deserialize<Dictionary<string, object?>>(relacion.DatosExtendidos.Datos, options);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error al deserializar datos dinámicos para relación {Id}", relacion.Id);
            }
        }

        // Calcular frecuencia si se solicita
        if (incluirFrecuencia)
        {
            _logger.LogInformation("Calculando frecuencia para relación {RelacionId} (FrecuenciaVisitas: {FrecuenciaVisitas})",
                relacion.Id, relacion.FrecuenciaVisitas);

            var frecuencia = await _frecuenciaService.CalcularFrecuenciaAsync(relacion.Id);

            if (frecuencia != null)
            {
                _logger.LogInformation("Frecuencia calculada para {RelacionId}: {Realizadas}/{Objetivo} - Estado: {Estado}",
                    relacion.Id, frecuencia.InteraccionesRealizadas, frecuencia.FrecuenciaObjetivo, frecuencia.Estado);

                dto.Frecuencia = new FrecuenciaIndicadorDto
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
            else
            {
                _logger.LogWarning("Frecuencia retornó null para relación {RelacionId}", relacion.Id);
            }
        }

        return dto;
    }

    /// <summary>
    /// Mapea una entidad Relacion a RelacionDto incluyendo datos dinámicos (versión síncrona)
    /// </summary>
    private RelacionDto MapToDto(Relacion relacion)
    {
        // Usar AutoMapper para el mapeo base
        var dto = _mapper.Map<RelacionDto>(relacion);

        // Mapear datos dinámicos manualmente
        if (relacion.DatosExtendidos?.Datos != null)
        {
            try
            {
                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };
                dto.DatosDinamicos = JsonSerializer.Deserialize<Dictionary<string, object?>>(relacion.DatosExtendidos.Datos, options);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error al deserializar datos dinámicos para relación {Id}", relacion.Id);
            }
        }

        return dto;
    }
}
