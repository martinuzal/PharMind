using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PharMind.API.Data;
using PharMind.API.DTOs;
using PharMind.API.Models;
using System.Text.Json;

namespace PharMind.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RelacionesController : ControllerBase
{
    private readonly PharMindDbContext _context;
    private readonly ILogger<RelacionesController> _logger;

    public RelacionesController(
        PharMindDbContext context,
        ILogger<RelacionesController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Obtiene una lista paginada de relaciones
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<RelacionListResponse>> GetRelaciones(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
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
            var totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);

            // Aplicar paginación
            var items = await query
                .OrderByDescending(r => r.FechaInicio)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            // Mapear a DTOs usando MapToDto
            var itemDtos = items.Select(r => MapToDto(r)).ToList();

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

            // Crear EntidadDinamica si hay datos dinámicos
            string? entidadDinamicaId = null;
            if (dto.DatosDinamicos != null && dto.DatosDinamicos.Count > 0)
            {
                var entidadDinamica = new EntidadDinamica
                {
                    Id = Guid.NewGuid().ToString(),
                    EsquemaId = dto.TipoRelacionId,
                    Datos = JsonSerializer.Serialize(dto.DatosDinamicos),
                    Status = false,
                    FechaCreacion = DateTime.Now,
                    CreadoPor = "System"
                };

                _context.EntidadesDinamicas.Add(entidadDinamica);
                entidadDinamicaId = entidadDinamica.Id;
            }

            var relacion = new Relacion
            {
                Id = Guid.NewGuid().ToString(),
                TipoRelacionId = dto.TipoRelacionId,
                EntidadDinamicaId = entidadDinamicaId,
                CodigoRelacion = dto.CodigoRelacion,
                AgenteId = dto.AgenteId,
                ClientePrincipalId = dto.ClientePrincipalId,
                ClienteSecundario1Id = dto.ClienteSecundario1Id,
                ClienteSecundario2Id = dto.ClienteSecundario2Id,
                TipoRelacion = dto.TipoRelacion,
                FechaInicio = dto.FechaInicio,
                FechaFin = dto.FechaFin,
                Estado = dto.Estado,
                FrecuenciaVisitas = dto.FrecuenciaVisitas,
                Prioridad = dto.Prioridad,
                Observaciones = dto.Observaciones,
                EspecialidadId = dto.EspecialidadId,
                CategoriaId = dto.CategoriaId,
                Segment1Id = dto.Segment1Id,
                Segment2Id = dto.Segment2Id,
                Segment3Id = dto.Segment3Id,
                Segment4Id = dto.Segment4Id,
                Segment5Id = dto.Segment5Id,
                Status = false,
                FechaCreacion = DateTime.Now,
                CreadoPor = "System"
            };

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

            // Actualizar o crear EntidadDinamica con los datos dinámicos
            if (dto.DatosDinamicos != null && dto.DatosDinamicos.Count > 0)
            {
                if (!string.IsNullOrWhiteSpace(relacion.EntidadDinamicaId))
                {
                    // Actualizar entidad dinámica existente
                    var entidadDinamica = await _context.EntidadesDinamicas.FindAsync(relacion.EntidadDinamicaId);
                    if (entidadDinamica != null)
                    {
                        entidadDinamica.Datos = JsonSerializer.Serialize(dto.DatosDinamicos);
                        entidadDinamica.FechaModificacion = DateTime.Now;
                        entidadDinamica.ModificadoPor = "System";
                    }
                }
                else
                {
                    // Crear nueva entidad dinámica
                    var nuevaEntidadDinamica = new EntidadDinamica
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

            // Actualizar campos
            relacion.ClienteSecundario1Id = dto.ClienteSecundario1Id;
            relacion.ClienteSecundario2Id = dto.ClienteSecundario2Id;
            relacion.TipoRelacion = dto.TipoRelacion;
            relacion.FechaInicio = dto.FechaInicio;
            relacion.FechaFin = dto.FechaFin;
            relacion.Estado = dto.Estado;
            relacion.FrecuenciaVisitas = dto.FrecuenciaVisitas;
            relacion.Prioridad = dto.Prioridad;
            relacion.Observaciones = dto.Observaciones;
            relacion.EspecialidadId = dto.EspecialidadId;
            relacion.CategoriaId = dto.CategoriaId;
            relacion.Segment1Id = dto.Segment1Id;
            relacion.Segment2Id = dto.Segment2Id;
            relacion.Segment3Id = dto.Segment3Id;
            relacion.Segment4Id = dto.Segment4Id;
            relacion.Segment5Id = dto.Segment5Id;
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
    /// Mapea una entidad Relacion a RelacionDto incluyendo datos dinámicos
    /// </summary>
    private RelacionDto MapToDto(Relacion relacion)
    {
        var dto = new RelacionDto
        {
            Id = relacion.Id,
            TipoRelacionId = relacion.TipoRelacionId,
            TipoRelacionNombre = relacion.TipoRelacionEsquema?.Nombre,
            EntidadDinamicaId = relacion.EntidadDinamicaId,
            CodigoRelacion = relacion.CodigoRelacion,
            AgenteId = relacion.AgenteId,
            AgenteNombre = relacion.Agente?.Nombre ?? "N/A",
            ClientePrincipalId = relacion.ClientePrincipalId,
            ClientePrincipalNombre = relacion.ClientePrincipal?.Nombre ?? relacion.ClientePrincipal?.RazonSocial ?? "N/A",
            ClienteSecundario1Id = relacion.ClienteSecundario1Id,
            ClienteSecundario1Nombre = relacion.ClienteSecundario1?.Nombre ?? relacion.ClienteSecundario1?.RazonSocial,
            ClienteSecundario2Id = relacion.ClienteSecundario2Id,
            ClienteSecundario2Nombre = relacion.ClienteSecundario2?.Nombre ?? relacion.ClienteSecundario2?.RazonSocial,
            TipoRelacion = relacion.TipoRelacion,
            FechaInicio = relacion.FechaInicio,
            FechaFin = relacion.FechaFin,
            Estado = relacion.Estado,
            FrecuenciaVisitas = relacion.FrecuenciaVisitas,
            Prioridad = relacion.Prioridad,
            Observaciones = relacion.Observaciones,
            EspecialidadId = relacion.EspecialidadId,
            CategoriaId = relacion.CategoriaId,
            Segment1Id = relacion.Segment1Id,
            Segment2Id = relacion.Segment2Id,
            Segment3Id = relacion.Segment3Id,
            Segment4Id = relacion.Segment4Id,
            Segment5Id = relacion.Segment5Id,
            FechaCreacion = relacion.FechaCreacion,
            CreadoPor = relacion.CreadoPor,
            FechaModificacion = relacion.FechaModificacion,
            ModificadoPor = relacion.ModificadoPor
        };

        // Mapear datos dinámicos si existen
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
