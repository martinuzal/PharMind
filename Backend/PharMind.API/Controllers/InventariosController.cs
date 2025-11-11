using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PharMind.API.Data;
using PharMind.API.DTOs;
using PharMind.API.Models;

namespace PharMind.API.Controllers;

/// <summary>
/// Controlador para gestión de inventarios de agentes
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class InventariosController : ControllerBase
{
    private readonly PharMindDbContext _context;
    private readonly ILogger<InventariosController> _logger;
    private readonly IMapper _mapper;

    public InventariosController(PharMindDbContext context, ILogger<InventariosController> logger, IMapper mapper)
    {
        _context = context;
        _logger = logger;
        _mapper = mapper;
    }

    /// <summary>
    /// Obtener inventario completo de un agente
    /// GET /api/inventarios/agente/{agenteId}
    /// </summary>
    [HttpGet("agente/{agenteId}")]
    public async Task<ActionResult<List<InventarioAgenteDto>>> GetInventarioAgente(string agenteId)
    {
        try
        {
            var inventarios = await _context.InventariosAgente
                .Include(i => i.Producto)
                    .ThenInclude(p => p!.LineaNegocio)
                .Where(i => i.AgenteId == agenteId && i.Status == false)
                .OrderBy(i => i.Producto!.Categoria)
                .ThenBy(i => i.Producto!.Nombre)
                .ToListAsync();

            var inventariosDto = _mapper.Map<List<InventarioAgenteDto>>(inventarios);

            // Calcular propiedades dinámicas
            foreach (var dto in inventariosDto)
            {
                CalcularPropiedadesDinamicas(dto);
            }

            return Ok(inventariosDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error al obtener inventario del agente {agenteId}");
            return StatusCode(500, new { error = "Error al obtener inventario", details = ex.Message });
        }
    }

    /// <summary>
    /// Obtener un inventario específico
    /// GET /api/inventarios/{id}
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<InventarioAgenteDto>> GetInventario(string id)
    {
        try
        {
            var inventario = await _context.InventariosAgente
                .Include(i => i.Producto)
                    .ThenInclude(p => p!.LineaNegocio)
                .FirstOrDefaultAsync(i => i.Id == id && i.Status == false);

            if (inventario == null)
            {
                return NotFound(new { error = "Inventario no encontrado" });
            }

            var dto = _mapper.Map<InventarioAgenteDto>(inventario);
            CalcularPropiedadesDinamicas(dto);

            return Ok(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error al obtener inventario {id}");
            return StatusCode(500, new { error = "Error al obtener inventario", details = ex.Message });
        }
    }

    /// <summary>
    /// Crear inventario inicial para un agente
    /// POST /api/inventarios
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<InventarioAgenteDto>> CrearInventario([FromBody] CreateInventarioDto dto)
    {
        try
        {
            // Verificar si ya existe inventario para este agente y producto
            var inventarioExistente = await _context.InventariosAgente
                .FirstOrDefaultAsync(i => i.AgenteId == dto.AgenteId &&
                                         i.ProductoId == dto.ProductoId &&
                                         i.Status == false);

            if (inventarioExistente != null)
            {
                return BadRequest(new { error = "Ya existe un inventario para este producto" });
            }

            // Verificar que el producto existe
            var producto = await _context.Productos.FindAsync(dto.ProductoId);
            if (producto == null)
            {
                return NotFound(new { error = "Producto no encontrado" });
            }

            // Verificar que el agente existe
            var agente = await _context.Agentes.FindAsync(dto.AgenteId);
            if (agente == null)
            {
                return NotFound(new { error = "Agente no encontrado" });
            }

            // Crear nuevo inventario
            var nuevoInventario = new InventarioAgente
            {
                AgenteId = dto.AgenteId,
                ProductoId = dto.ProductoId,
                CantidadInicial = dto.CantidadInicial,
                CantidadDisponible = dto.CantidadInicial,
                CantidadEntregada = 0,
                LoteActual = dto.Lote,
                FechaVencimiento = dto.FechaVencimiento,
                FechaUltimaRecarga = DateTime.Now,
                Observaciones = dto.Observaciones,
                FechaCreacion = DateTime.Now
            };

            _context.InventariosAgente.Add(nuevoInventario);

            // Registrar movimiento inicial
            var movimiento = new MovimientoInventario
            {
                InventarioAgenteId = nuevoInventario.Id,
                TipoMovimiento = "Entrada",
                Cantidad = dto.CantidadInicial,
                CantidadAnterior = 0,
                CantidadNueva = dto.CantidadInicial,
                Motivo = "Asignación inicial de inventario",
                Observaciones = dto.Observaciones,
                FechaMovimiento = DateTime.Now
            };

            _context.MovimientosInventario.Add(movimiento);
            await _context.SaveChangesAsync();

            // Recargar con includes para devolver DTO completo
            var inventarioCreado = await _context.InventariosAgente
                .Include(i => i.Producto)
                    .ThenInclude(p => p!.LineaNegocio)
                .FirstOrDefaultAsync(i => i.Id == nuevoInventario.Id);

            _logger.LogInformation($"Inventario creado: {inventarioCreado!.Id} para agente {dto.AgenteId}");

            var dtoCreado = _mapper.Map<InventarioAgenteDto>(inventarioCreado);
            CalcularPropiedadesDinamicas(dtoCreado);

            return CreatedAtAction(nameof(GetInventario), new { id = inventarioCreado.Id }, dtoCreado);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al crear inventario");
            return StatusCode(500, new { error = "Error al crear inventario", details = ex.Message });
        }
    }

    /// <summary>
    /// Registrar recarga de inventario
    /// POST /api/inventarios/{id}/recarga
    /// </summary>
    [HttpPost("{id}/recarga")]
    public async Task<ActionResult<InventarioAgenteDto>> RegistrarRecarga(string id, [FromBody] RecargaInventarioDto dto)
    {
        try
        {
            var inventario = await _context.InventariosAgente
                .Include(i => i.Producto)
                .FirstOrDefaultAsync(i => i.Id == id && i.Status == false);

            if (inventario == null)
            {
                return NotFound(new { error = "Inventario no encontrado" });
            }

            var cantidadAnterior = inventario.CantidadDisponible;

            // Actualizar inventario
            inventario.CantidadDisponible += dto.Cantidad;
            inventario.LoteActual = dto.Lote;
            inventario.FechaVencimiento = dto.FechaVencimiento;
            inventario.FechaUltimaRecarga = DateTime.Now;
            inventario.Observaciones = dto.Observaciones;
            inventario.FechaModificacion = DateTime.Now;

            // Registrar movimiento
            var movimiento = new MovimientoInventario
            {
                InventarioAgenteId = inventario.Id,
                TipoMovimiento = "Entrada",
                Cantidad = dto.Cantidad,
                CantidadAnterior = cantidadAnterior,
                CantidadNueva = inventario.CantidadDisponible,
                Motivo = "Recarga de inventario",
                Observaciones = dto.Observaciones,
                FechaMovimiento = DateTime.Now
            };

            _context.MovimientosInventario.Add(movimiento);
            await _context.SaveChangesAsync();

            // Recargar con includes
            var inventarioActualizado = await _context.InventariosAgente
                .Include(i => i.Producto)
                    .ThenInclude(p => p!.LineaNegocio)
                .FirstAsync(i => i.Id == id);

            var dtoActualizado = _mapper.Map<InventarioAgenteDto>(inventarioActualizado);
            CalcularPropiedadesDinamicas(dtoActualizado);

            return Ok(dtoActualizado);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error al registrar recarga en inventario {id}");
            return StatusCode(500, new { error = "Error al registrar recarga", details = ex.Message });
        }
    }

    /// <summary>
    /// Actualizar cantidad de inventario (después de entregar muestras)
    /// PUT /api/inventarios/{id}
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<InventarioAgenteDto>> ActualizarInventario(
        string id,
        [FromBody] ActualizarInventarioDto dto)
    {
        try
        {
            var inventario = await _context.InventariosAgente
                .Include(i => i.Producto)
                .FirstOrDefaultAsync(i => i.Id == id && i.Status == false);

            if (inventario == null)
            {
                return NotFound(new { error = "Inventario no encontrado" });
            }

            var cantidadAnterior = inventario.CantidadDisponible;

            if (dto.CantidadEntregada.HasValue)
            {
                inventario.CantidadEntregada += dto.CantidadEntregada.Value;
                inventario.CantidadDisponible -= dto.CantidadEntregada.Value;

                // Registrar movimiento de salida
                var movimiento = new MovimientoInventario
                {
                    InventarioAgenteId = inventario.Id,
                    TipoMovimiento = "Salida",
                    Cantidad = dto.CantidadEntregada.Value,
                    CantidadAnterior = cantidadAnterior,
                    CantidadNueva = inventario.CantidadDisponible,
                    Motivo = "Entrega de muestra médica",
                    Observaciones = dto.Observaciones,
                    FechaMovimiento = DateTime.Now
                };

                _context.MovimientosInventario.Add(movimiento);
            }

            if (dto.Observaciones != null)
            {
                inventario.Observaciones = dto.Observaciones;
            }

            inventario.FechaModificacion = DateTime.Now;
            await _context.SaveChangesAsync();

            // Recargar con includes
            var inventarioActualizado = await _context.InventariosAgente
                .Include(i => i.Producto)
                    .ThenInclude(p => p!.LineaNegocio)
                .FirstAsync(i => i.Id == id);

            var dtoActualizado = _mapper.Map<InventarioAgenteDto>(inventarioActualizado);
            CalcularPropiedadesDinamicas(dtoActualizado);

            return Ok(dtoActualizado);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error al actualizar inventario {id}");
            return StatusCode(500, new { error = "Error al actualizar inventario", details = ex.Message });
        }
    }

    /// <summary>
    /// Obtener inventarios con stock bajo
    /// GET /api/inventarios/agente/{agenteId}/stock-bajo
    /// </summary>
    [HttpGet("agente/{agenteId}/stock-bajo")]
    public async Task<ActionResult<List<InventarioAgenteDto>>> GetInventariosStockBajo(string agenteId)
    {
        try
        {
            var inventarios = await _context.InventariosAgente
                .Include(i => i.Producto)
                    .ThenInclude(p => p!.LineaNegocio)
                .Where(i => i.AgenteId == agenteId &&
                           i.CantidadInicial.HasValue &&
                           i.CantidadDisponible < (i.CantidadInicial.Value * 0.2) &&
                           i.Status == false)
                .ToListAsync();

            var inventariosDto = _mapper.Map<List<InventarioAgenteDto>>(inventarios);

            // Calcular propiedades dinámicas
            foreach (var dto in inventariosDto)
            {
                CalcularPropiedadesDinamicas(dto);
            }

            return Ok(inventariosDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error al obtener inventarios con stock bajo del agente {agenteId}");
            return StatusCode(500, new { error = "Error al obtener inventarios", details = ex.Message });
        }
    }

    /// <summary>
    /// Obtener inventarios por vencer (próximos 30 días)
    /// GET /api/inventarios/agente/{agenteId}/por-vencer
    /// </summary>
    [HttpGet("agente/{agenteId}/por-vencer")]
    public async Task<ActionResult<List<InventarioAgenteDto>>> GetInventariosPorVencer(string agenteId)
    {
        try
        {
            var fechaLimite = DateTime.Now.AddDays(30);

            var inventarios = await _context.InventariosAgente
                .Include(i => i.Producto)
                    .ThenInclude(p => p!.LineaNegocio)
                .Where(i => i.AgenteId == agenteId &&
                           i.FechaVencimiento.HasValue &&
                           i.FechaVencimiento <= fechaLimite &&
                           i.FechaVencimiento >= DateTime.Now &&
                           i.Status == false)
                .OrderBy(i => i.FechaVencimiento)
                .ToListAsync();

            var inventariosDto = _mapper.Map<List<InventarioAgenteDto>>(inventarios);

            // Calcular propiedades dinámicas
            foreach (var dto in inventariosDto)
            {
                CalcularPropiedadesDinamicas(dto);
            }

            return Ok(inventariosDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error al obtener inventarios por vencer del agente {agenteId}");
            return StatusCode(500, new { error = "Error al obtener inventarios", details = ex.Message });
        }
    }

    // ==================== MÉTODOS PRIVADOS ====================

    private void CalcularPropiedadesDinamicas(InventarioAgenteDto dto)
    {
        var diasParaVencer = dto.FechaVencimiento.HasValue
            ? (int?)(dto.FechaVencimiento.Value - DateTime.Now).TotalDays
            : null;

        dto.DiasParaVencer = diasParaVencer;
        dto.EstaPorVencer = dto.FechaVencimiento.HasValue &&
                           diasParaVencer <= 30 &&
                           diasParaVencer >= 0;
        dto.EstaVencido = dto.FechaVencimiento.HasValue &&
                         dto.FechaVencimiento.Value < DateTime.Now;
        dto.StockBajo = dto.CantidadInicial.HasValue &&
                       dto.CantidadInicial.Value > 0 &&
                       dto.CantidadDisponible < (dto.CantidadInicial.Value * 0.2);
    }
}
