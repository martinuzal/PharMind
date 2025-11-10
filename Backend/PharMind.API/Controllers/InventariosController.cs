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

    public InventariosController(PharMindDbContext context, ILogger<InventariosController> logger)
    {
        _context = context;
        _logger = logger;
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

            var inventariosDto = inventarios.Select(i => MapToDto(i)).ToList();

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

            return Ok(MapToDto(inventario));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error al obtener inventario {id}");
            return StatusCode(500, new { error = "Error al obtener inventario", details = ex.Message });
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

            return Ok(MapToDto(inventarioActualizado));
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

            return Ok(MapToDto(inventarioActualizado));
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

            var inventariosDto = inventarios.Select(i => MapToDto(i)).ToList();

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

            var inventariosDto = inventarios.Select(i => MapToDto(i)).ToList();

            return Ok(inventariosDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error al obtener inventarios por vencer del agente {agenteId}");
            return StatusCode(500, new { error = "Error al obtener inventarios", details = ex.Message });
        }
    }

    // ==================== MÉTODOS PRIVADOS ====================

    private InventarioAgenteDto MapToDto(InventarioAgente i)
    {
        var diasParaVencer = i.FechaVencimiento.HasValue
            ? (int?)(i.FechaVencimiento.Value - DateTime.Now).TotalDays
            : null;

        var estaPorVencer = i.FechaVencimiento.HasValue &&
                           diasParaVencer <= 30 &&
                           diasParaVencer >= 0;

        var estaVencido = i.FechaVencimiento.HasValue &&
                         i.FechaVencimiento.Value < DateTime.Now;

        var stockBajo = i.CantidadInicial.HasValue &&
                       i.CantidadInicial.Value > 0 &&
                       i.CantidadDisponible < (i.CantidadInicial.Value * 0.2);

        return new InventarioAgenteDto
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
                Descripcion = i.Producto.Descripcion,
                Presentacion = i.Producto.Presentacion,
                Categoria = i.Producto.Categoria,
                Laboratorio = i.Producto.Laboratorio,
                EsMuestra = i.Producto.EsMuestra,
                LineaNegocioNombre = i.Producto.LineaNegocio?.Nombre
            } : null,
            CantidadDisponible = i.CantidadDisponible,
            CantidadInicial = i.CantidadInicial,
            CantidadEntregada = i.CantidadEntregada,
            FechaUltimaRecarga = i.FechaUltimaRecarga,
            LoteActual = i.LoteActual,
            FechaVencimiento = i.FechaVencimiento,
            Observaciones = i.Observaciones,
            EstaPorVencer = estaPorVencer,
            EstaVencido = estaVencido,
            StockBajo = stockBajo,
            DiasParaVencer = diasParaVencer
        };
    }
}
