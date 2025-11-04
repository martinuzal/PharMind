using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PharMind.API.Data;
using PharMind.API.DTOs;
using PharMind.API.Models;
using System.Text.Json;

namespace PharMind.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ClientesController : ControllerBase
{
    private readonly PharMindDbContext _context;
    private readonly ILogger<ClientesController> _logger;

    public ClientesController(
        PharMindDbContext context,
        ILogger<ClientesController> logger)
    {
        _context = context;
        _logger = logger;
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
                .Include(c => c.DatosExtendidos)
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
                .Include(c => c.DatosExtendidos)
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
            EntidadDinamica? entidadDinamica = null;
            if (dto.DatosDinamicos != null && dto.DatosDinamicos.Count > 0)
            {
                entidadDinamica = new EntidadDinamica
                {
                    Id = Guid.NewGuid().ToString(),
                    EsquemaId = dto.TipoClienteId,
                    Datos = JsonSerializer.Serialize(dto.DatosDinamicos),
                    FechaCreacion = DateTime.Now,
                    CreadoPor = "System",
                    Status = false
                };

                _context.EntidadesDinamicas.Add(entidadDinamica);
            }

            // Crear cliente
            var cliente = new Cliente
            {
                Id = Guid.NewGuid().ToString(),
                TipoClienteId = dto.TipoClienteId,
                EntidadDinamicaId = entidadDinamica?.Id,
                CodigoCliente = dto.CodigoCliente,
                Nombre = dto.Nombre,
                Apellido = dto.Apellido,
                RazonSocial = dto.RazonSocial,
                Especialidad = dto.Especialidad,
                Categoria = dto.Categoria,
                Segmento = dto.Segmento,
                InstitucionId = dto.InstitucionId,
                Email = dto.Email,
                Telefono = dto.Telefono,
                DireccionId = dto.DireccionId,
                Estado = dto.Estado,
                Status = false,
                FechaCreacion = DateTime.Now,
                CreadoPor = "System"
            };

            _context.Clientes.Add(cliente);
            await _context.SaveChangesAsync();

            // Recargar con datos relacionados
            await _context.Entry(cliente).Reference(c => c.TipoCliente).LoadAsync();
            await _context.Entry(cliente).Reference(c => c.DatosExtendidos).LoadAsync();
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
                .Include(c => c.DatosExtendidos)
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
                if (cliente.EntidadDinamicaId != null && cliente.DatosExtendidos != null)
                {
                    // Actualizar entidad existente
                    cliente.DatosExtendidos.Datos = JsonSerializer.Serialize(dto.DatosDinamicos);
                    cliente.DatosExtendidos.FechaModificacion = DateTime.Now;
                    cliente.DatosExtendidos.ModificadoPor = "System";
                }
                else
                {
                    // Crear nueva entidad dinámica
                    var entidadDinamica = new EntidadDinamica
                    {
                        Id = Guid.NewGuid().ToString(),
                        EsquemaId = cliente.TipoClienteId,
                        Datos = JsonSerializer.Serialize(dto.DatosDinamicos),
                        FechaCreacion = DateTime.Now,
                        CreadoPor = "System",
                        Status = false
                    };

                    _context.EntidadesDinamicas.Add(entidadDinamica);
                    cliente.EntidadDinamicaId = entidadDinamica.Id;
                }
            }

            // Actualizar campos base
            cliente.Nombre = dto.Nombre;
            cliente.Apellido = dto.Apellido;
            cliente.RazonSocial = dto.RazonSocial;
            cliente.Especialidad = dto.Especialidad;
            cliente.Categoria = dto.Categoria;
            cliente.Segmento = dto.Segmento;
            cliente.InstitucionId = dto.InstitucionId;
            cliente.Email = dto.Email;
            cliente.Telefono = dto.Telefono;
            cliente.DireccionId = dto.DireccionId;
            cliente.Estado = dto.Estado;
            cliente.FechaModificacion = DateTime.Now;
            cliente.ModificadoPor = "System";

            await _context.SaveChangesAsync();

            // Recargar con datos relacionados
            await _context.Entry(cliente).Reference(c => c.TipoCliente).LoadAsync();
            await _context.Entry(cliente).Reference(c => c.DatosExtendidos).LoadAsync();
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
        Dictionary<string, object?>? datosDinamicos = null;

        if (cliente.DatosExtendidos != null && !string.IsNullOrWhiteSpace(cliente.DatosExtendidos.Datos))
        {
            try
            {
                datosDinamicos = JsonSerializer.Deserialize<Dictionary<string, object?>>(cliente.DatosExtendidos.Datos);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error al deserializar datos dinámicos del cliente {Id}", cliente.Id);
            }
        }

        return new ClienteDto
        {
            Id = cliente.Id,
            TipoClienteId = cliente.TipoClienteId,
            TipoClienteNombre = cliente.TipoCliente?.Nombre,
            EntidadDinamicaId = cliente.EntidadDinamicaId,
            DatosDinamicos = datosDinamicos,
            CodigoCliente = cliente.CodigoCliente,
            Nombre = cliente.Nombre,
            Apellido = cliente.Apellido,
            RazonSocial = cliente.RazonSocial,
            Especialidad = cliente.Especialidad,
            Categoria = cliente.Categoria,
            Segmento = cliente.Segmento,
            InstitucionId = cliente.InstitucionId,
            InstitucionNombre = cliente.Institucion?.RazonSocial,
            Email = cliente.Email,
            Telefono = cliente.Telefono,
            DireccionId = cliente.DireccionId,
            Direccion = cliente.Direccion != null ? new DireccionDto
            {
                Id = cliente.Direccion.Id,
                Calle = cliente.Direccion.Calle,
                Numero = cliente.Direccion.Numero,
                Ciudad = cliente.Direccion.Ciudad,
                Provincia = cliente.Direccion.Estado,
                CodigoPostal = cliente.Direccion.CodigoPostal,
                Pais = cliente.Direccion.Pais
            } : null,
            Estado = cliente.Estado,
            FechaCreacion = cliente.FechaCreacion,
            CreadoPor = cliente.CreadoPor,
            FechaModificacion = cliente.FechaModificacion,
            ModificadoPor = cliente.ModificadoPor
        };
    }
}
