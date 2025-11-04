using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PharMind.API.Data;
using PharMind.API.Models;

namespace PharMind.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EsquemasPersonalizadosController : ControllerBase
{
    private readonly PharMindDbContext _context;
    private readonly ILogger<EsquemasPersonalizadosController> _logger;

    public EsquemasPersonalizadosController(
        PharMindDbContext context,
        ILogger<EsquemasPersonalizadosController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Obtiene todos los esquemas personalizados
    /// </summary>
    /// <param name="entidadTipo">Filtro opcional por tipo de entidad (Cliente, Agente, Relacion, Interaccion)</param>
    /// <param name="activo">Filtro opcional por estado activo</param>
    /// <returns>Lista de esquemas</returns>
    [HttpGet]
    public async Task<ActionResult<List<EsquemaPersonalizado>>> GetEsquemas(
        [FromQuery] string? entidadTipo = null,
        [FromQuery] bool? activo = null)
    {
        try
        {
            var query = _context.EsquemasPersonalizados
                .Include(e => e.Empresa)
                .Where(e => e.Status == false); // Excluir eliminadas

            // Aplicar filtros
            if (!string.IsNullOrEmpty(entidadTipo))
            {
                query = query.Where(e => e.EntidadTipo == entidadTipo);
            }

            if (activo.HasValue)
            {
                query = query.Where(e => e.Activo == activo.Value);
            }

            var esquemas = await query
                .OrderBy(e => e.EntidadTipo)
                .ThenBy(e => e.Orden)
                .ThenBy(e => e.Nombre)
                .ToListAsync();

            return Ok(esquemas);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener esquemas personalizados");
            return StatusCode(500, "Error interno del servidor");
        }
    }

    /// <summary>
    /// Obtiene un esquema personalizado por ID
    /// </summary>
    /// <param name="id">ID del esquema</param>
    /// <returns>Esquema encontrado</returns>
    [HttpGet("{id}")]
    public async Task<ActionResult<EsquemaPersonalizado>> GetEsquema(string id)
    {
        try
        {
            var esquema = await _context.EsquemasPersonalizados
                .Include(e => e.Empresa)
                .FirstOrDefaultAsync(e => e.Id == id && e.Status == false);

            if (esquema == null)
            {
                return NotFound($"Esquema con ID {id} no encontrado");
            }

            return Ok(esquema);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener esquema personalizado con ID: {Id}", id);
            return StatusCode(500, "Error interno del servidor");
        }
    }

    /// <summary>
    /// Obtiene los esquemas por tipo de entidad (para el sidebar dinámico)
    /// </summary>
    /// <param name="entidadTipo">Tipo de entidad (Cliente o Interaccion)</param>
    /// <returns>Lista de esquemas del tipo especificado</returns>
    [HttpGet("tipo/{entidadTipo}")]
    public async Task<ActionResult<List<EsquemaPersonalizado>>> GetEsquemasPorTipo(string entidadTipo)
    {
        try
        {
            var esquemas = await _context.EsquemasPersonalizados
                .Where(e => e.EntidadTipo == entidadTipo && e.Activo && e.Status == false)
                .OrderBy(e => e.Orden)
                .ThenBy(e => e.Nombre)
                .ToListAsync();

            return Ok(esquemas);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener esquemas por tipo: {EntidadTipo}", entidadTipo);
            return StatusCode(500, "Error interno del servidor");
        }
    }

    /// <summary>
    /// Obtiene un esquema específico por tipo de entidad y subtipo
    /// </summary>
    /// <param name="tipo">Tipo de entidad (Cliente, Agente, Relacion, Interaccion)</param>
    /// <param name="subtipo">Subtipo del esquema</param>
    /// <returns>Esquema encontrado</returns>
    [HttpGet("tipo/{tipo}/subtipo/{subtipo}")]
    public async Task<ActionResult<EsquemaPersonalizado>> GetEsquemaPorTipoSubTipo(string tipo, string subtipo)
    {
        try
        {
            var esquema = await _context.EsquemasPersonalizados
                .FirstOrDefaultAsync(e =>
                    e.EntidadTipo == tipo &&
                    e.SubTipo == subtipo &&
                    e.Status == false);

            if (esquema == null)
            {
                return NotFound($"Esquema con tipo '{tipo}' y subtipo '{subtipo}' no encontrado");
            }

            return Ok(esquema);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener esquema por tipo: {Tipo} y subtipo: {SubTipo}", tipo, subtipo);
            return StatusCode(500, "Error interno del servidor");
        }
    }

    /// <summary>
    /// Crea un nuevo esquema personalizado
    /// </summary>
    /// <param name="esquema">Datos del esquema a crear</param>
    /// <returns>Esquema creado</returns>
    [HttpPost]
    public async Task<ActionResult<EsquemaPersonalizado>> CreateEsquema([FromBody] EsquemaPersonalizado esquema)
    {
        try
        {
            // Validaciones
            if (string.IsNullOrWhiteSpace(esquema.Nombre))
            {
                return BadRequest("El nombre es requerido");
            }

            if (string.IsNullOrWhiteSpace(esquema.EntidadTipo))
            {
                return BadRequest("El tipo de entidad es requerido");
            }

            // Verificar que no exista un esquema con el mismo tipo y subtipo
            var existe = await _context.EsquemasPersonalizados
                .AnyAsync(e =>
                    e.EmpresaId == esquema.EmpresaId &&
                    e.EntidadTipo == esquema.EntidadTipo &&
                    e.SubTipo == esquema.SubTipo &&
                    e.Status == false);

            if (existe)
            {
                return Conflict("Ya existe un esquema con el mismo tipo y subtipo");
            }

            // Generar ID si no viene
            if (string.IsNullOrEmpty(esquema.Id))
            {
                esquema.Id = Guid.NewGuid().ToString();
            }

            esquema.FechaCreacion = DateTime.Now;
            esquema.Status = false;

            _context.EsquemasPersonalizados.Add(esquema);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetEsquema), new { id = esquema.Id }, esquema);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al crear esquema personalizado");
            return StatusCode(500, "Error interno del servidor");
        }
    }

    /// <summary>
    /// Actualiza un esquema personalizado existente
    /// </summary>
    /// <param name="id">ID del esquema</param>
    /// <param name="esquema">Datos actualizados del esquema</param>
    /// <returns>Esquema actualizado</returns>
    [HttpPut("{id}")]
    public async Task<ActionResult<EsquemaPersonalizado>> UpdateEsquema(string id, [FromBody] EsquemaPersonalizado esquema)
    {
        try
        {
            var esquemaExistente = await _context.EsquemasPersonalizados
                .FirstOrDefaultAsync(e => e.Id == id && e.Status == false);

            if (esquemaExistente == null)
            {
                return NotFound($"Esquema con ID {id} no encontrado");
            }

            // Actualizar campos
            esquemaExistente.Nombre = esquema.Nombre;
            esquemaExistente.Descripcion = esquema.Descripcion;
            esquemaExistente.Icono = esquema.Icono;
            esquemaExistente.Color = esquema.Color;
            esquemaExistente.Schema = esquema.Schema;
            esquemaExistente.ReglasValidacion = esquema.ReglasValidacion;
            esquemaExistente.ReglasCorrelacion = esquema.ReglasCorrelacion;
            esquemaExistente.ConfiguracionUI = esquema.ConfiguracionUI;
            esquemaExistente.Activo = esquema.Activo;
            esquemaExistente.Orden = esquema.Orden;
            esquemaExistente.FechaModificacion = DateTime.Now;
            esquemaExistente.Version += 1;

            await _context.SaveChangesAsync();

            return Ok(esquemaExistente);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al actualizar esquema personalizado con ID: {Id}", id);
            return StatusCode(500, "Error interno del servidor");
        }
    }

    /// <summary>
    /// Elimina un esquema personalizado (soft delete)
    /// </summary>
    /// <param name="id">ID del esquema</param>
    /// <returns>Resultado de la operación</returns>
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteEsquema(string id)
    {
        try
        {
            var esquema = await _context.EsquemasPersonalizados
                .FirstOrDefaultAsync(e => e.Id == id && e.Status == false);

            if (esquema == null)
            {
                return NotFound($"Esquema con ID {id} no encontrado");
            }

            // Soft delete
            esquema.Status = true;
            esquema.FechaModificacion = DateTime.Now;

            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al eliminar esquema personalizado con ID: {Id}", id);
            return StatusCode(500, "Error interno del servidor");
        }
    }

    /// <summary>
    /// Activa o desactiva un esquema personalizado
    /// </summary>
    /// <param name="id">ID del esquema</param>
    /// <param name="activo">Estado activo</param>
    /// <returns>Esquema actualizado</returns>
    [HttpPatch("{id}/toggle-activo")]
    public async Task<ActionResult<EsquemaPersonalizado>> ToggleActivo(string id, [FromQuery] bool activo)
    {
        try
        {
            var esquema = await _context.EsquemasPersonalizados
                .FirstOrDefaultAsync(e => e.Id == id && e.Status == false);

            if (esquema == null)
            {
                return NotFound($"Esquema con ID {id} no encontrado");
            }

            esquema.Activo = activo;
            esquema.FechaModificacion = DateTime.Now;

            await _context.SaveChangesAsync();

            return Ok(esquema);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al cambiar estado de esquema personalizado con ID: {Id}", id);
            return StatusCode(500, "Error interno del servidor");
        }
    }
}
