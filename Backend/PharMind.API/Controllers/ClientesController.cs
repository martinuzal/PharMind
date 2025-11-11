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
public class ClientesController : ControllerBase
{
    private readonly PharMindDbContext _context;
    private readonly ILogger<ClientesController> _logger;
    private readonly IMapper _mapper;

    public ClientesController(
        PharMindDbContext context,
        ILogger<ClientesController> logger,
        IMapper mapper)
    {
        _context = context;
        _logger = logger;
        _mapper = mapper;
    }

    /// <summary>
    /// Obtiene una lista paginada de clientes con datos dinámicos
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<ClienteListResponse>> GetClientes(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? tipoClienteId = null)
    {
        try
        {
            var query = _context.Clientes
                .Include(c => c.TipoCliente)
                .Include(c => c.EntidadesDinamica)
                .Include(c => c.Institucion)
                .Include(c => c.Direccion)
                .Where(c => c.Status == false); // Excluir eliminados

            // Filtrar por tipo de cliente si se especifica
            if (!string.IsNullOrWhiteSpace(tipoClienteId))
            {
                query = query.Where(c => c.TipoClienteId == tipoClienteId);
            }

            // Contar total de items
            var totalItems = await query.CountAsync();
            var totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);

            // Aplicar paginación
            var items = await query
                .OrderBy(c => c.RazonSocial)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            // Mapear a DTOs
            var itemDtos = items.Select(c => MapToDto(c)).ToList();

            var response = new ClienteListResponse
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
            _logger.LogError(ex, "Error al obtener lista de clientes");
            return StatusCode(500, new { message = "Error al obtener la lista de clientes" });
        }
    }

    /// <summary>
    /// Obtiene un cliente por ID con sus datos dinámicos
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<ClienteDto>> GetClienteById(string id)
    {
        try
        {
            var cliente = await _context.Clientes
                .Include(c => c.TipoCliente)
                .Include(c => c.EntidadesDinamica)
                .Include(c => c.Institucion)
                .Include(c => c.Direccion)
                .FirstOrDefaultAsync(c => c.Id == id && c.Status == false);

            if (cliente == null)
            {
                return NotFound(new { message = "Cliente no encontrado" });
            }

            var dto = MapToDto(cliente);
            return Ok(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener cliente con ID: {Id}", id);
            return StatusCode(500, new { message = "Error al obtener el cliente" });
        }
    }

    /// <summary>
    /// Crea un nuevo cliente con datos dinámicos
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ClienteDto>> CreateCliente(CreateClienteDto dto)
    {
        try
        {
            // Validar que el tipo de cliente existe
            var tipoCliente = await _context.EsquemasPersonalizados
                .FirstOrDefaultAsync(e => e.Id == dto.TipoClienteId && e.EntidadTipo == "Cliente");

            if (tipoCliente == null)
            {
                return BadRequest(new { message = "Tipo de cliente no encontrado" });
            }

            // Validar relaciones si se proporcionan
            if (!string.IsNullOrWhiteSpace(dto.InstitucionId))
            {
                var institucion = await _context.Clientes.FindAsync(dto.InstitucionId);
                if (institucion == null)
                {
                    return BadRequest(new { message = "Institución no encontrada" });
                }
            }

            if (!string.IsNullOrWhiteSpace(dto.DireccionId))
            {
                var direccion = await _context.Direcciones.FindAsync(dto.DireccionId);
                if (direccion == null)
                {
                    return BadRequest(new { message = "Dirección no encontrada" });
                }
            }

            // Crear entidad dinámica si hay datos dinámicos
            EntidadesDinamica? EntidadesDinamica = null;
            if (dto.DatosDinamicos != null && dto.DatosDinamicos.Count > 0)
            {
                EntidadesDinamica = new EntidadesDinamica
                {
                    Id = Guid.NewGuid().ToString(),
                    EsquemaId = dto.TipoClienteId,
                    Datos = JsonSerializer.Serialize(dto.DatosDinamicos),
                    FechaCreacion = DateTime.Now,
                    CreadoPor = "System",
                    Status = false
                };

                _context.EntidadesDinamicas.Add(EntidadesDinamica);
            }

            // Crear cliente usando AutoMapper
            var cliente = _mapper.Map<Cliente>(dto);
            cliente.Id = Guid.NewGuid().ToString();
            cliente.EntidadDinamicaId = EntidadesDinamica?.Id;
            cliente.FechaCreacion = DateTime.Now;
            cliente.CreadoPor = "System";

            _context.Clientes.Add(cliente);
            await _context.SaveChangesAsync();

            // Recargar con datos relacionados
            await _context.Entry(cliente).Reference(c => c.TipoCliente).LoadAsync();
            await _context.Entry(cliente).Reference(c => c.EntidadesDinamica).LoadAsync();
            await _context.Entry(cliente).Reference(c => c.Institucion).LoadAsync();
            await _context.Entry(cliente).Reference(c => c.Direccion).LoadAsync();

            var result = MapToDto(cliente);

            return CreatedAtAction(nameof(GetClienteById), new { id = cliente.Id }, result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al crear cliente");
            return StatusCode(500, new { message = "Error al crear el cliente" });
        }
    }

    /// <summary>
    /// Actualiza un cliente existente con datos dinámicos
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<ClienteDto>> UpdateCliente(string id, UpdateClienteDto dto)
    {
        try
        {
            var cliente = await _context.Clientes
                .Include(c => c.TipoCliente)
                .Include(c => c.EntidadesDinamica)
                .Include(c => c.Institucion)
                .Include(c => c.Direccion)
                .FirstOrDefaultAsync(c => c.Id == id && c.Status == false);

            if (cliente == null)
            {
                return NotFound(new { message = "Cliente no encontrado" });
            }

            // Validar relaciones si se proporcionan
            if (!string.IsNullOrWhiteSpace(dto.InstitucionId))
            {
                var institucion = await _context.Clientes.FindAsync(dto.InstitucionId);
                if (institucion == null)
                {
                    return BadRequest(new { message = "Institución no encontrada" });
                }
            }

            if (!string.IsNullOrWhiteSpace(dto.DireccionId))
            {
                var direccion = await _context.Direcciones.FindAsync(dto.DireccionId);
                if (direccion == null)
                {
                    return BadRequest(new { message = "Dirección no encontrada" });
                }
            }

            // Actualizar o crear entidad dinámica si hay datos dinámicos
            if (dto.DatosDinamicos != null && dto.DatosDinamicos.Count > 0)
            {
                if (cliente.EntidadDinamicaId != null && cliente.EntidadesDinamica != null)
                {
                    // Actualizar entidad existente
                    cliente.EntidadesDinamica.Datos = JsonSerializer.Serialize(dto.DatosDinamicos);
                    cliente.EntidadesDinamica.FechaModificacion = DateTime.Now;
                    cliente.EntidadesDinamica.ModificadoPor = "System";
                }
                else
                {
                    // Crear nueva entidad dinámica
                    var EntidadesDinamica = new EntidadesDinamica
                    {
                        Id = Guid.NewGuid().ToString(),
                        EsquemaId = cliente.TipoClienteId,
                        Datos = JsonSerializer.Serialize(dto.DatosDinamicos),
                        FechaCreacion = DateTime.Now,
                        CreadoPor = "System",
                        Status = false
                    };

                    _context.EntidadesDinamicas.Add(EntidadesDinamica);
                    cliente.EntidadDinamicaId = EntidadesDinamica.Id;
                }
            }

            // Actualizar campos base usando AutoMapper
            _mapper.Map(dto, cliente);
            cliente.FechaModificacion = DateTime.Now;
            cliente.ModificadoPor = "System";

            await _context.SaveChangesAsync();

            // Recargar con datos relacionados
            await _context.Entry(cliente).Reference(c => c.TipoCliente).LoadAsync();
            await _context.Entry(cliente).Reference(c => c.EntidadesDinamica).LoadAsync();
            await _context.Entry(cliente).Reference(c => c.Institucion).LoadAsync();
            await _context.Entry(cliente).Reference(c => c.Direccion).LoadAsync();

            var result = MapToDto(cliente);

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al actualizar cliente con ID: {Id}", id);
            return StatusCode(500, new { message = "Error al actualizar el cliente" });
        }
    }

    /// <summary>
    /// Elimina (soft delete) un cliente
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteCliente(string id)
    {
        try
        {
            var cliente = await _context.Clientes.FindAsync(id);

            if (cliente == null || cliente.Status == true)
            {
                return NotFound(new { message = "Cliente no encontrado" });
            }

            // Soft delete
            cliente.Status = true;
            cliente.FechaModificacion = DateTime.Now;
            cliente.ModificadoPor = "System";

            await _context.SaveChangesAsync();

            return Ok(new { message = "Cliente eliminado exitosamente" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al eliminar cliente con ID: {Id}", id);
            return StatusCode(500, new { message = "Error al eliminar el cliente" });
        }
    }

    /// <summary>
    /// Obtiene los tipos de cliente disponibles
    /// </summary>
    [HttpGet("tipos")]
    public async Task<ActionResult> GetTiposCliente()
    {
        try
        {
            var tipos = await _context.EsquemasPersonalizados
                .Where(e => e.EntidadTipo == "Cliente" && e.Activo && e.Status == false)
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
            _logger.LogError(ex, "Error al obtener tipos de cliente");
            return StatusCode(500, new { message = "Error al obtener tipos de cliente" });
        }
    }

    // Métodos privados de mapeo

    private ClienteDto MapToDto(Cliente cliente)
    {
        // Usar AutoMapper para el mapeo base
        var dto = _mapper.Map<ClienteDto>(cliente);

        // Mapear datos dinámicos manualmente
        if (cliente.EntidadesDinamica != null && !string.IsNullOrWhiteSpace(cliente.EntidadesDinamica.Datos))
        {
            try
            {
                dto.DatosDinamicos = JsonSerializer.Deserialize<Dictionary<string, object?>>(cliente.EntidadesDinamica.Datos);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error al deserializar datos dinámicos del cliente {Id}", cliente.Id);
            }
        }

        return dto;
    }
}
