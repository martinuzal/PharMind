using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PharMind.API.Data;
using PharMind.API.DTOs;
using PharMind.API.Models;
using System.Text.Json;
using AutoMapper;

namespace PharMind.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AgentesController : ControllerBase
{
    private readonly PharMindDbContext _context;
    private readonly ILogger<AgentesController> _logger;
    private readonly IMapper _mapper;

    public AgentesController(
        PharMindDbContext context,
        ILogger<AgentesController> logger,
        IMapper mapper)
    {
        _context = context;
        _logger = logger;
        _mapper = mapper;
    }

    /// <summary>
    /// Obtiene una lista paginada de agentes con datos dinámicos
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<AgenteListResponse>> GetAgentes(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? tipoAgenteId = null)
    {
        try
        {
            var query = _context.Agentes
                .Include(a => a.TipoAgente)
                .Include(a => a.EntidadesDinamica)
                .Include(a => a.Region)
                .Include(a => a.Distrito)
                .Include(a => a.LineaNegocio)
                .Include(a => a.Manager)
                .Include(a => a.Timeline)
                .Where(a => a.Status == false); // Excluir eliminados

            // Filtrar por tipo de agente si se especifica
            if (!string.IsNullOrWhiteSpace(tipoAgenteId))
            {
                query = query.Where(a => a.TipoAgenteId == tipoAgenteId);
            }

            // Contar total de items
            var totalItems = await query.CountAsync();
            var totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);

            // Aplicar paginación
            var items = await query
                .OrderBy(a => a.Nombre)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            // Mapear a DTOs
            var itemDtos = items.Select(a => MapToDto(a)).ToList();

            var response = new AgenteListResponse
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
            _logger.LogError(ex, "Error al obtener lista de agentes");
            return StatusCode(500, new { message = "Error al obtener la lista de agentes" });
        }
    }

    /// <summary>
    /// Obtiene un agente por ID con sus datos dinámicos
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<AgenteDto>> GetAgenteById(string id)
    {
        try
        {
            var agente = await _context.Agentes
                .Include(a => a.TipoAgente)
                .Include(a => a.EntidadesDinamica)
                .Include(a => a.Region)
                .Include(a => a.Distrito)
                .Include(a => a.LineaNegocio)
                .Include(a => a.Manager)
                .FirstOrDefaultAsync(a => a.Id == id && a.Status == false);

            if (agente == null)
            {
                return NotFound(new { message = "Agente no encontrado" });
            }

            var dto = MapToDto(agente);
            return Ok(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener agente con ID: {Id}", id);
            return StatusCode(500, new { message = "Error al obtener el agente" });
        }
    }

    /// <summary>
    /// Crea un nuevo agente con datos dinámicos
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<AgenteDto>> CreateAgente(CreateAgenteDto dto)
    {
        try
        {
            // Validar que el tipo de agente existe
            var tipoAgente = await _context.EsquemasPersonalizados
                .FirstOrDefaultAsync(e => e.Id == dto.TipoAgenteId && e.EntidadTipo == "Agente");

            if (tipoAgente == null)
            {
                return BadRequest(new { message = "Tipo de agente no encontrado" });
            }

            // Validar relaciones si se proporcionan
            if (!string.IsNullOrWhiteSpace(dto.RegionId))
            {
                var region = await _context.Regiones.FindAsync(dto.RegionId);
                if (region == null)
                {
                    return BadRequest(new { message = "Región no encontrada" });
                }
            }

            if (!string.IsNullOrWhiteSpace(dto.DistritoId))
            {
                var distrito = await _context.Distritos.FindAsync(dto.DistritoId);
                if (distrito == null)
                {
                    return BadRequest(new { message = "Distrito no encontrado" });
                }
            }

            if (!string.IsNullOrWhiteSpace(dto.LineaNegocioId))
            {
                var lineaNegocio = await _context.LineasNegocio.FindAsync(dto.LineaNegocioId);
                if (lineaNegocio == null)
                {
                    return BadRequest(new { message = "Línea de negocio no encontrada" });
                }
            }

            if (!string.IsNullOrWhiteSpace(dto.ManagerId))
            {
                var manager = await _context.Managers.FindAsync(dto.ManagerId);
                if (manager == null)
                {
                    return BadRequest(new { message = "Manager no encontrado" });
                }
            }

            // Crear entidad dinámica si hay datos dinámicos
            EntidadesDinamica? EntidadesDinamica = null;
            if (dto.DatosDinamicos != null && dto.DatosDinamicos.Count > 0)
            {
                EntidadesDinamica = new EntidadesDinamica
                {
                    Id = Guid.NewGuid().ToString(),
                    EsquemaId = dto.TipoAgenteId,
                    Datos = JsonSerializer.Serialize(dto.DatosDinamicos),
                    FechaCreacion = DateTime.Now,
                    CreadoPor = "System",
                    Status = false
                };

                _context.EntidadesDinamicas.Add(EntidadesDinamica);
            }

            // Crear agente usando AutoMapper
            var agente = _mapper.Map<Agente>(dto);
            agente.Id = Guid.NewGuid().ToString();
            agente.EntidadDinamicaId = EntidadesDinamica?.Id;
            agente.FechaCreacion = DateTime.Now;
            agente.CreadoPor = "System";
            agente.Estado = dto.Activo ? "Activo" : "Inactivo";

            _context.Agentes.Add(agente);
            await _context.SaveChangesAsync();

            // Recargar con datos relacionados
            await _context.Entry(agente).Reference(a => a.TipoAgente).LoadAsync();
            await _context.Entry(agente).Reference(a => a.EntidadesDinamica).LoadAsync();
            await _context.Entry(agente).Reference(a => a.Region).LoadAsync();
            await _context.Entry(agente).Reference(a => a.Distrito).LoadAsync();
            await _context.Entry(agente).Reference(a => a.LineaNegocio).LoadAsync();
            await _context.Entry(agente).Reference(a => a.Manager).LoadAsync();

            var result = MapToDto(agente);

            return CreatedAtAction(nameof(GetAgenteById), new { id = agente.Id }, result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al crear agente");
            return StatusCode(500, new { message = "Error al crear el agente" });
        }
    }

    /// <summary>
    /// Actualiza un agente existente con datos dinámicos
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<AgenteDto>> UpdateAgente(string id, UpdateAgenteDto dto)
    {
        try
        {
            var agente = await _context.Agentes
                .Include(a => a.TipoAgente)
                .Include(a => a.EntidadesDinamica)
                .Include(a => a.Region)
                .Include(a => a.Distrito)
                .Include(a => a.LineaNegocio)
                .Include(a => a.Manager)
                .FirstOrDefaultAsync(a => a.Id == id && a.Status == false);

            if (agente == null)
            {
                return NotFound(new { message = "Agente no encontrado" });
            }

            // Validar relaciones si se proporcionan
            if (!string.IsNullOrWhiteSpace(dto.RegionId))
            {
                var region = await _context.Regiones.FindAsync(dto.RegionId);
                if (region == null)
                {
                    return BadRequest(new { message = "Región no encontrada" });
                }
            }

            if (!string.IsNullOrWhiteSpace(dto.DistritoId))
            {
                var distrito = await _context.Distritos.FindAsync(dto.DistritoId);
                if (distrito == null)
                {
                    return BadRequest(new { message = "Distrito no encontrado" });
                }
            }

            if (!string.IsNullOrWhiteSpace(dto.LineaNegocioId))
            {
                var lineaNegocio = await _context.LineasNegocio.FindAsync(dto.LineaNegocioId);
                if (lineaNegocio == null)
                {
                    return BadRequest(new { message = "Línea de negocio no encontrada" });
                }
            }

            if (!string.IsNullOrWhiteSpace(dto.ManagerId))
            {
                var manager = await _context.Managers.FindAsync(dto.ManagerId);
                if (manager == null)
                {
                    return BadRequest(new { message = "Manager no encontrado" });
                }
            }

            // Actualizar o crear entidad dinámica si hay datos dinámicos
            if (dto.DatosDinamicos != null && dto.DatosDinamicos.Count > 0)
            {
                if (agente.EntidadDinamicaId != null && agente.EntidadesDinamica != null)
                {
                    // Actualizar entidad existente
                    agente.EntidadesDinamica.Datos = JsonSerializer.Serialize(dto.DatosDinamicos);
                    agente.EntidadesDinamica.FechaModificacion = DateTime.Now;
                    agente.EntidadesDinamica.ModificadoPor = "System";
                }
                else
                {
                    // Crear nueva entidad dinámica
                    var EntidadesDinamica = new EntidadesDinamica
                    {
                        Id = Guid.NewGuid().ToString(),
                        EsquemaId = agente.TipoAgenteId,
                        Datos = JsonSerializer.Serialize(dto.DatosDinamicos),
                        FechaCreacion = DateTime.Now,
                        CreadoPor = "System",
                        Status = false
                    };

                    _context.EntidadesDinamicas.Add(EntidadesDinamica);
                    agente.EntidadDinamicaId = EntidadesDinamica.Id;
                }
            }

            // Actualizar campos base usando AutoMapper
            _mapper.Map(dto, agente);
            agente.FechaModificacion = DateTime.Now;
            agente.ModificadoPor = "System";

            await _context.SaveChangesAsync();

            // Recargar con datos relacionados
            await _context.Entry(agente).Reference(a => a.TipoAgente).LoadAsync();
            await _context.Entry(agente).Reference(a => a.EntidadesDinamica).LoadAsync();
            await _context.Entry(agente).Reference(a => a.Region).LoadAsync();
            await _context.Entry(agente).Reference(a => a.Distrito).LoadAsync();
            await _context.Entry(agente).Reference(a => a.LineaNegocio).LoadAsync();
            await _context.Entry(agente).Reference(a => a.Manager).LoadAsync();

            var result = MapToDto(agente);

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al actualizar agente con ID: {Id}", id);
            return StatusCode(500, new { message = "Error al actualizar el agente" });
        }
    }

    /// <summary>
    /// Elimina (soft delete) un agente
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteAgente(string id)
    {
        try
        {
            var agente = await _context.Agentes.FindAsync(id);

            if (agente == null || agente.Status == true)
            {
                return NotFound(new { message = "Agente no encontrado" });
            }

            // Soft delete
            agente.Status = true;
            agente.FechaModificacion = DateTime.Now;
            agente.ModificadoPor = "System";

            await _context.SaveChangesAsync();

            return Ok(new { message = "Agente eliminado exitosamente" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al eliminar agente con ID: {Id}", id);
            return StatusCode(500, new { message = "Error al eliminar el agente" });
        }
    }

    /// <summary>
    /// Obtiene los tipos de agente disponibles
    /// </summary>
    [HttpGet("tipos")]
    public async Task<ActionResult> GetTiposAgente()
    {
        try
        {
            var tipos = await _context.EsquemasPersonalizados
                .Where(e => e.EntidadTipo == "Agente" && e.Activo && e.Status == false)
                .OrderBy(e => e.Orden)
                .ThenBy(e => e.Nombre)
                .Select(e => new
                {
                    e.Id,
                    e.Nombre,
                    e.Descripcion,
                    e.EntidadTipo,
                    e.SubTipo,
                    e.Icono,
                    e.Color,
                    e.Schema,
                    e.Version,
                    e.Activo,
                    e.Orden
                })
                .ToListAsync();

            return Ok(tipos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener tipos de agente");
            return StatusCode(500, new { message = "Error al obtener tipos de agente" });
        }
    }

    // Métodos privados de mapeo

    private AgenteDto MapToDto(Agente agente)
    {
        // Usar AutoMapper para el mapeo base
        var dto = _mapper.Map<AgenteDto>(agente);

        // Mapear datos dinámicos manualmente
        if (agente.EntidadesDinamica != null && !string.IsNullOrWhiteSpace(agente.EntidadesDinamica.Datos))
        {
            try
            {
                dto.DatosDinamicos = JsonSerializer.Deserialize<Dictionary<string, object?>>(agente.EntidadesDinamica.Datos);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error al deserializar datos dinámicos del agente {Id}", agente.Id);
            }
        }

        return dto;
    }
}
