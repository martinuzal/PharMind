using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PharMind.API.Data;
using PharMind.API.DTOs;
using PharMind.API.Models;
using System.Text.Json;

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
                .AsNoTracking()
                .Include(i => i.TipoInteraccionEsquema)
                .Include(i => i.DatosExtendidos)
                .Include(i => i.Relacion)
                .Include(i => i.Agente)
                .Include(i => i.Cliente)
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

            // Mapear a DTOs usando MapToDto
            var itemDtos = items.Select(i => MapToDto(i)).ToList();

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
                .AsNoTracking()
                .Include(i => i.TipoInteraccionEsquema)
                .Include(i => i.DatosExtendidos)
                .Include(i => i.Relacion)
                .Include(i => i.Agente)
                .Include(i => i.Cliente)
                .FirstOrDefaultAsync(i => i.Id == id && i.Status == false);

            if (interaccion == null)
            {
                return NotFound(new { message = "Interacción no encontrada" });
            }

            var dto = MapToDto(interaccion);

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
            // Validar que el TipoInteraccionId existe
            var tipoInteraccion = await _context.EsquemasPersonalizados
                .FirstOrDefaultAsync(e => e.Id == dto.TipoInteraccionId && e.EntidadTipo == "Interaccion" && e.Status == false);

            if (tipoInteraccion == null)
            {
                return BadRequest(new { message = "Tipo de interacción no encontrado" });
            }

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

            // Crear EntidadDinamica si hay datos dinámicos
            string? entidadDinamicaId = null;
            if (dto.DatosDinamicos != null && dto.DatosDinamicos.Count > 0)
            {
                var entidadDinamica = new EntidadDinamica
                {
                    Id = Guid.NewGuid().ToString(),
                    EsquemaId = dto.TipoInteraccionId,
                    Datos = JsonSerializer.Serialize(dto.DatosDinamicos),
                    Status = false,
                    FechaCreacion = DateTime.Now,
                    CreadoPor = "System"
                };

                _context.EntidadesDinamicas.Add(entidadDinamica);
                entidadDinamicaId = entidadDinamica.Id;
            }

            var interaccion = new Interaccion
            {
                Id = Guid.NewGuid().ToString(),
                TipoInteraccionId = dto.TipoInteraccionId,
                EntidadDinamicaId = entidadDinamicaId,
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
                Status = false,
                FechaCreacion = DateTime.Now,
                CreadoPor = "System"
            };

            _context.Interacciones.Add(interaccion);
            await _context.SaveChangesAsync();

            // Recargar con datos relacionados
            await _context.Entry(interaccion).Reference(i => i.TipoInteraccionEsquema).LoadAsync();
            await _context.Entry(interaccion).Reference(i => i.DatosExtendidos).LoadAsync();
            await _context.Entry(interaccion).Reference(i => i.Relacion).LoadAsync();
            await _context.Entry(interaccion).Reference(i => i.Agente).LoadAsync();
            await _context.Entry(interaccion).Reference(i => i.Cliente).LoadAsync();

            var result = MapToDto(interaccion);

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
                .AsNoTracking()
                .Include(i => i.TipoInteraccionEsquema)
                .Include(i => i.DatosExtendidos)
                .Include(i => i.Relacion)
                .Include(i => i.Agente)
                .Include(i => i.Cliente)
                .FirstOrDefaultAsync(i => i.Id == id && i.Status == false);

            if (interaccion == null)
            {
                return NotFound(new { message = "Interacción no encontrada" });
            }

            // Actualizar o crear EntidadDinamica con los datos dinámicos
            if (dto.DatosDinamicos != null && dto.DatosDinamicos.Count > 0)
            {
                if (!string.IsNullOrWhiteSpace(interaccion.EntidadDinamicaId))
                {
                    // Actualizar entidad dinámica existente
                    var entidadDinamica = await _context.EntidadesDinamicas.FindAsync(interaccion.EntidadDinamicaId);
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
                        EsquemaId = interaccion.TipoInteraccionId,
                        Datos = JsonSerializer.Serialize(dto.DatosDinamicos),
                        Status = false,
                        FechaCreacion = DateTime.Now,
                        CreadoPor = "System"
                    };

                    _context.EntidadesDinamicas.Add(nuevaEntidadDinamica);
                    interaccion.EntidadDinamicaId = nuevaEntidadDinamica.Id;
                }
            }

            // Actualizar campos estáticos
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
            interaccion.FechaModificacion = DateTime.Now;
            interaccion.ModificadoPor = "System";

            await _context.SaveChangesAsync();

            // Recargar con datos relacionados
            await _context.Entry(interaccion).Reference(i => i.TipoInteraccionEsquema).LoadAsync();
            await _context.Entry(interaccion).Reference(i => i.DatosExtendidos).LoadAsync();
            await _context.Entry(interaccion).Reference(i => i.Relacion).LoadAsync();
            await _context.Entry(interaccion).Reference(i => i.Agente).LoadAsync();
            await _context.Entry(interaccion).Reference(i => i.Cliente).LoadAsync();

            var result = MapToDto(interaccion);

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

    /// <summary>
    /// Mapea una entidad Interaccion a InteraccionDto incluyendo datos dinámicos
    /// </summary>
    private InteraccionDto MapToDto(Interaccion interaccion)
    {
        var dto = new InteraccionDto
        {
            Id = interaccion.Id,
            TipoInteraccionId = interaccion.TipoInteraccionId,
            TipoInteraccionNombre = interaccion.TipoInteraccionEsquema?.Nombre,
            EntidadDinamicaId = interaccion.EntidadDinamicaId,
            CodigoInteraccion = interaccion.CodigoInteraccion,
            RelacionId = interaccion.RelacionId,
            RelacionCodigo = interaccion.Relacion?.CodigoRelacion,
            AgenteId = interaccion.AgenteId,
            AgenteNombre = interaccion.Agente?.Nombre,
            ClienteId = interaccion.ClienteId,
            ClienteNombre = interaccion.Cliente?.Nombre ?? interaccion.Cliente?.RazonSocial,
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
            FechaCreacion = interaccion.FechaCreacion,
            CreadoPor = interaccion.CreadoPor,
            FechaModificacion = interaccion.FechaModificacion,
            ModificadoPor = interaccion.ModificadoPor
        };

        // Mapear datos dinámicos si existen
        if (interaccion.DatosExtendidos?.Datos != null)
        {
            try
            {
                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };
                dto.DatosDinamicos = JsonSerializer.Deserialize<Dictionary<string, object?>>(interaccion.DatosExtendidos.Datos, options);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error al deserializar datos dinámicos para interacción {Id}", interaccion.Id);
            }
        }

        return dto;
    }
}
