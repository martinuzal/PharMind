using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PharMind.API.Data;
using PharMind.API.DTOs;
using PharMind.API.Models;

namespace PharMind.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InteraccionesController : ControllerBase
{
    private readonly PharMindDbContext _context;
    private readonly ILogger<InteraccionesController> _logger;

    public InteraccionesController(
        PharMindDbContext context,
        ILogger<InteraccionesController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Obtiene una lista paginada de interacciones
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<InteraccionListResponse>> GetInteracciones(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        try
        {
            var query = _context.Interacciones
                .Include(i => i.Relacion)
                .Include(i => i.Agente)
                .Include(i => i.Cliente)
                .Include(i => i.EntidadDinamica)
                .Where(i => i.Status == false); // Excluir eliminados

            // Contar total de items
            var totalItems = await query.CountAsync();
            var totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);

            // Aplicar paginación
            var items = await query
                .OrderByDescending(i => i.Fecha)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            // Mapear a DTOs
            var itemDtos = items.Select(i => new InteraccionDto
            {
                Id = i.Id,
                CodigoInteraccion = i.CodigoInteraccion,
                RelacionId = i.RelacionId,
                RelacionCodigo = i.Relacion?.CodigoRelacion ?? "N/A",
                AgenteId = i.AgenteId,
                AgenteNombre = i.Agente?.Nombre ?? "N/A",
                ClienteId = i.ClienteId,
                ClienteNombre = i.Cliente?.RazonSocial ?? "N/A",
                TipoInteraccion = i.TipoInteraccion,
                Fecha = i.Fecha,
                Turno = i.Turno,
                DuracionMinutos = i.DuracionMinutos,
                Resultado = i.Resultado,
                ObjetivoVisita = i.ObjetivoVisita,
                ResumenVisita = i.ResumenVisita,
                ProximaAccion = i.ProximaAccion,
                FechaProximaAccion = i.FechaProximaAccion,
                Latitud = i.Latitud,
                Longitud = i.Longitud,
                Observaciones = i.Observaciones,
                EntidadDinamicaId = i.EntidadDinamicaId,
                FechaCreacion = i.FechaCreacion,
                CreadoPor = i.CreadoPor,
                FechaModificacion = i.FechaModificacion,
                ModificadoPor = i.ModificadoPor
            }).ToList();

            var response = new InteraccionListResponse
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
            _logger.LogError(ex, "Error al obtener lista de interacciones");
            return StatusCode(500, new { message = "Error al obtener la lista de interacciones" });
        }
    }

    /// <summary>
    /// Obtiene una interacción por ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<InteraccionDto>> GetInteraccionById(string id)
    {
        try
        {
            var interaccion = await _context.Interacciones
                .Include(i => i.Relacion)
                .Include(i => i.Agente)
                .Include(i => i.Cliente)
                .Include(i => i.EntidadDinamica)
                .FirstOrDefaultAsync(i => i.Id == id && i.Status == false);

            if (interaccion == null)
            {
                return NotFound(new { message = "Interacción no encontrada" });
            }

            var dto = new InteraccionDto
            {
                Id = interaccion.Id,
                CodigoInteraccion = interaccion.CodigoInteraccion,
                RelacionId = interaccion.RelacionId,
                RelacionCodigo = interaccion.Relacion?.CodigoRelacion ?? "N/A",
                AgenteId = interaccion.AgenteId,
                AgenteNombre = interaccion.Agente?.Nombre ?? "N/A",
                ClienteId = interaccion.ClienteId,
                ClienteNombre = interaccion.Cliente?.RazonSocial ?? "N/A",
                TipoInteraccion = interaccion.TipoInteraccion,
                Fecha = interaccion.Fecha,
                Turno = interaccion.Turno,
                DuracionMinutos = interaccion.DuracionMinutos,
                Resultado = interaccion.Resultado,
                ObjetivoVisita = interaccion.ObjetivoVisita,
                ResumenVisita = interaccion.ResumenVisita,
                ProximaAccion = interaccion.ProximaAccion,
                FechaProximaAccion = interaccion.FechaProximaAccion,
                Latitud = interaccion.Latitud,
                Longitud = interaccion.Longitud,
                Observaciones = interaccion.Observaciones,
                EntidadDinamicaId = interaccion.EntidadDinamicaId,
                FechaCreacion = interaccion.FechaCreacion,
                CreadoPor = interaccion.CreadoPor,
                FechaModificacion = interaccion.FechaModificacion,
                ModificadoPor = interaccion.ModificadoPor
            };

            return Ok(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener interacción con ID: {Id}", id);
            return StatusCode(500, new { message = "Error al obtener la interacción" });
        }
    }

    /// <summary>
    /// Crea una nueva interacción
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<InteraccionDto>> CreateInteraccion(CreateInteraccionDto dto)
    {
        try
        {
            // Verificar que la relación existe
            var relacion = await _context.Relaciones.FindAsync(dto.RelacionId);
            if (relacion == null)
            {
                return BadRequest(new { message = "Relación no encontrada" });
            }

            // Verificar que el agente existe
            var agente = await _context.Agentes.FindAsync(dto.AgenteId);
            if (agente == null)
            {
                return BadRequest(new { message = "Agente no encontrado" });
            }

            // Verificar que el cliente existe
            var cliente = await _context.Clientes.FindAsync(dto.ClienteId);
            if (cliente == null)
            {
                return BadRequest(new { message = "Cliente no encontrado" });
            }

            // Verificar que la entidad dinámica existe si se proporciona
            if (!string.IsNullOrWhiteSpace(dto.EntidadDinamicaId))
            {
                var entidadDinamica = await _context.EsquemasPersonalizados.FindAsync(dto.EntidadDinamicaId);
                if (entidadDinamica == null)
                {
                    return BadRequest(new { message = "Entidad dinámica no encontrada" });
                }
            }

            var interaccion = new Interaccion
            {
                Id = Guid.NewGuid().ToString(),
                CodigoInteraccion = dto.CodigoInteraccion,
                RelacionId = dto.RelacionId,
                AgenteId = dto.AgenteId,
                ClienteId = dto.ClienteId,
                TipoInteraccion = dto.TipoInteraccion,
                Fecha = dto.Fecha,
                Turno = dto.Turno,
                DuracionMinutos = dto.DuracionMinutos,
                Resultado = dto.Resultado,
                ObjetivoVisita = dto.ObjetivoVisita,
                ResumenVisita = dto.ResumenVisita,
                ProximaAccion = dto.ProximaAccion,
                FechaProximaAccion = dto.FechaProximaAccion,
                Latitud = dto.Latitud,
                Longitud = dto.Longitud,
                Observaciones = dto.Observaciones,
                EntidadDinamicaId = dto.EntidadDinamicaId,
                Status = false,
                FechaCreacion = DateTime.Now,
                CreadoPor = "System"
            };

            _context.Interacciones.Add(interaccion);
            await _context.SaveChangesAsync();

            // Recargar con datos relacionados
            await _context.Entry(interaccion).Reference(i => i.Relacion).LoadAsync();
            await _context.Entry(interaccion).Reference(i => i.Agente).LoadAsync();
            await _context.Entry(interaccion).Reference(i => i.Cliente).LoadAsync();
            await _context.Entry(interaccion).Reference(i => i.EntidadDinamica).LoadAsync();

            var result = new InteraccionDto
            {
                Id = interaccion.Id,
                CodigoInteraccion = interaccion.CodigoInteraccion,
                RelacionId = interaccion.RelacionId,
                RelacionCodigo = interaccion.Relacion?.CodigoRelacion ?? "N/A",
                AgenteId = interaccion.AgenteId,
                AgenteNombre = interaccion.Agente?.Nombre ?? "N/A",
                ClienteId = interaccion.ClienteId,
                ClienteNombre = interaccion.Cliente?.RazonSocial ?? "N/A",
                TipoInteraccion = interaccion.TipoInteraccion,
                Fecha = interaccion.Fecha,
                Turno = interaccion.Turno,
                DuracionMinutos = interaccion.DuracionMinutos,
                Resultado = interaccion.Resultado,
                ObjetivoVisita = interaccion.ObjetivoVisita,
                ResumenVisita = interaccion.ResumenVisita,
                ProximaAccion = interaccion.ProximaAccion,
                FechaProximaAccion = interaccion.FechaProximaAccion,
                Latitud = interaccion.Latitud,
                Longitud = interaccion.Longitud,
                Observaciones = interaccion.Observaciones,
                EntidadDinamicaId = interaccion.EntidadDinamicaId,
                FechaCreacion = interaccion.FechaCreacion,
                CreadoPor = interaccion.CreadoPor
            };

            return CreatedAtAction(nameof(GetInteraccionById), new { id = interaccion.Id }, result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al crear interacción");
            return StatusCode(500, new { message = "Error al crear la interacción" });
        }
    }

    /// <summary>
    /// Actualiza una interacción existente
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<InteraccionDto>> UpdateInteraccion(string id, UpdateInteraccionDto dto)
    {
        try
        {
            var interaccion = await _context.Interacciones
                .Include(i => i.Relacion)
                .Include(i => i.Agente)
                .Include(i => i.Cliente)
                .Include(i => i.EntidadDinamica)
                .FirstOrDefaultAsync(i => i.Id == id && i.Status == false);

            if (interaccion == null)
            {
                return NotFound(new { message = "Interacción no encontrada" });
            }

            // Verificar que la entidad dinámica existe si se proporciona
            if (!string.IsNullOrWhiteSpace(dto.EntidadDinamicaId))
            {
                var entidadDinamica = await _context.EsquemasPersonalizados.FindAsync(dto.EntidadDinamicaId);
                if (entidadDinamica == null)
                {
                    return BadRequest(new { message = "Entidad dinámica no encontrada" });
                }
            }

            // Actualizar campos
            interaccion.TipoInteraccion = dto.TipoInteraccion;
            interaccion.Fecha = dto.Fecha;
            interaccion.Turno = dto.Turno;
            interaccion.DuracionMinutos = dto.DuracionMinutos;
            interaccion.Resultado = dto.Resultado;
            interaccion.ObjetivoVisita = dto.ObjetivoVisita;
            interaccion.ResumenVisita = dto.ResumenVisita;
            interaccion.ProximaAccion = dto.ProximaAccion;
            interaccion.FechaProximaAccion = dto.FechaProximaAccion;
            interaccion.Latitud = dto.Latitud;
            interaccion.Longitud = dto.Longitud;
            interaccion.Observaciones = dto.Observaciones;
            interaccion.EntidadDinamicaId = dto.EntidadDinamicaId;
            interaccion.FechaModificacion = DateTime.Now;
            interaccion.ModificadoPor = "System";

            await _context.SaveChangesAsync();

            // Recargar con datos relacionados
            await _context.Entry(interaccion).Reference(i => i.Relacion).LoadAsync();
            await _context.Entry(interaccion).Reference(i => i.Agente).LoadAsync();
            await _context.Entry(interaccion).Reference(i => i.Cliente).LoadAsync();
            await _context.Entry(interaccion).Reference(i => i.EntidadDinamica).LoadAsync();

            var result = new InteraccionDto
            {
                Id = interaccion.Id,
                CodigoInteraccion = interaccion.CodigoInteraccion,
                RelacionId = interaccion.RelacionId,
                RelacionCodigo = interaccion.Relacion?.CodigoRelacion ?? "N/A",
                AgenteId = interaccion.AgenteId,
                AgenteNombre = interaccion.Agente?.Nombre ?? "N/A",
                ClienteId = interaccion.ClienteId,
                ClienteNombre = interaccion.Cliente?.RazonSocial ?? "N/A",
                TipoInteraccion = interaccion.TipoInteraccion,
                Fecha = interaccion.Fecha,
                Turno = interaccion.Turno,
                DuracionMinutos = interaccion.DuracionMinutos,
                Resultado = interaccion.Resultado,
                ObjetivoVisita = interaccion.ObjetivoVisita,
                ResumenVisita = interaccion.ResumenVisita,
                ProximaAccion = interaccion.ProximaAccion,
                FechaProximaAccion = interaccion.FechaProximaAccion,
                Latitud = interaccion.Latitud,
                Longitud = interaccion.Longitud,
                Observaciones = interaccion.Observaciones,
                EntidadDinamicaId = interaccion.EntidadDinamicaId,
                FechaCreacion = interaccion.FechaCreacion,
                CreadoPor = interaccion.CreadoPor,
                FechaModificacion = interaccion.FechaModificacion,
                ModificadoPor = interaccion.ModificadoPor
            };

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al actualizar interacción con ID: {Id}", id);
            return StatusCode(500, new { message = "Error al actualizar la interacción" });
        }
    }

    /// <summary>
    /// Elimina (soft delete) una interacción
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteInteraccion(string id)
    {
        try
        {
            var interaccion = await _context.Interacciones.FindAsync(id);

            if (interaccion == null || interaccion.Status == true)
            {
                return NotFound(new { message = "Interacción no encontrada" });
            }

            // Soft delete
            interaccion.Status = true;
            interaccion.FechaModificacion = DateTime.Now;
            interaccion.ModificadoPor = "System";

            await _context.SaveChangesAsync();

            return Ok(new { message = "Interacción eliminada exitosamente" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al eliminar interacción con ID: {Id}", id);
            return StatusCode(500, new { message = "Error al eliminar la interacción" });
        }
    }
}
