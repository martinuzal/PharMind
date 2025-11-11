using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PharMind.API.Data;
using PharMind.API.DTOs;
using PharMind.API.Models;

namespace PharMind.API.Controllers;

/// <summary>
/// Controlador para gestión de productos farmacéuticos
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProductosController : ControllerBase
{
    private readonly PharMindDbContext _context;
    private readonly ILogger<ProductosController> _logger;

    public ProductosController(PharMindDbContext context, ILogger<ProductosController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Obtener todos los productos con filtros opcionales
    /// GET /api/productos?activo=true&esMuestra=false&lineaNegocioId=xxx
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<List<ProductoDto>>> GetProductos(
        [FromQuery] bool? activo = null,
        [FromQuery] bool? esMuestra = null,
        [FromQuery] string? lineaNegocioId = null)
    {
        try
        {
            var query = _context.Productos
                .Include(p => p.LineaNegocio)
                .Where(p => p.Status == false)
                .AsQueryable();

            // Filtrar por activo si se especifica
            if (activo.HasValue)
            {
                query = query.Where(p => p.Activo == activo.Value);
            }
            else
            {
                // Por defecto solo activos si no se especifica
                query = query.Where(p => p.Activo);
            }

            // Filtrar por esMuestra si se especifica
            if (esMuestra.HasValue)
            {
                query = query.Where(p => p.EsMuestra == esMuestra.Value);
            }

            // Filtrar por línea de negocio si se especifica
            if (!string.IsNullOrEmpty(lineaNegocioId))
            {
                query = query.Where(p => p.LineaNegocioId == lineaNegocioId);
            }

            var productos = await query
                .OrderBy(p => p.Categoria)
                .ThenBy(p => p.Nombre)
                .ToListAsync();

            var productosDto = productos.Select(p => MapToDto(p)).ToList();

            return Ok(productosDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener productos");
            return StatusCode(500, new { error = "Error al obtener productos", details = ex.Message });
        }
    }

    /// <summary>
    /// Obtener un producto por ID
    /// GET /api/productos/{id}
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<ProductoDto>> GetProducto(string id)
    {
        try
        {
            var producto = await _context.Productos
                .Include(p => p.LineaNegocio)
                .FirstOrDefaultAsync(p => p.Id == id && p.Status == false);

            if (producto == null)
            {
                return NotFound(new { error = "Producto no encontrado" });
            }

            return Ok(MapToDto(producto));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error al obtener producto {id}");
            return StatusCode(500, new { error = "Error al obtener producto", details = ex.Message });
        }
    }

    /// <summary>
    /// Obtener productos por categoría
    /// GET /api/productos/categoria/{categoria}
    /// </summary>
    [HttpGet("categoria/{categoria}")]
    public async Task<ActionResult<List<ProductoDto>>> GetProductosPorCategoria(string categoria)
    {
        try
        {
            var productos = await _context.Productos
                .Include(p => p.LineaNegocio)
                .Where(p => p.Categoria == categoria && p.Activo && p.Status == false)
                .OrderBy(p => p.Nombre)
                .ToListAsync();

            var productosDto = productos.Select(p => MapToDto(p)).ToList();

            return Ok(productosDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error al obtener productos de categoría {categoria}");
            return StatusCode(500, new { error = "Error al obtener productos", details = ex.Message });
        }
    }

    /// <summary>
    /// Buscar productos por nombre o código
    /// GET /api/productos/buscar?q=paracetamol
    /// </summary>
    [HttpGet("buscar")]
    public async Task<ActionResult<List<ProductoDto>>> BuscarProductos([FromQuery] string q)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(q))
            {
                return BadRequest(new { error = "Query de búsqueda requerido" });
            }

            var query = q.ToLower();

            var productos = await _context.Productos
                .Include(p => p.LineaNegocio)
                .Where(p => (p.Nombre.ToLower().Contains(query) ||
                            p.CodigoProducto.ToLower().Contains(query) ||
                            (p.NombreComercial != null && p.NombreComercial.ToLower().Contains(query)) ||
                            (p.PrincipioActivo != null && p.PrincipioActivo.ToLower().Contains(query))) &&
                            p.Activo && p.Status == false)
                .OrderBy(p => p.Nombre)
                .Take(50) // Limitar resultados
                .ToListAsync();

            var productosDto = productos.Select(p => MapToDto(p)).ToList();

            return Ok(productosDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error al buscar productos con query: {q}");
            return StatusCode(500, new { error = "Error al buscar productos", details = ex.Message });
        }
    }

    /// <summary>
    /// Obtener solo productos que son muestras médicas
    /// GET /api/productos/muestras
    /// </summary>
    [HttpGet("muestras")]
    public async Task<ActionResult<List<ProductoDto>>> GetProductosMuestras()
    {
        try
        {
            var productos = await _context.Productos
                .Include(p => p.LineaNegocio)
                .Where(p => p.EsMuestra && p.Activo && p.Status == false)
                .OrderBy(p => p.Categoria)
                .ThenBy(p => p.Nombre)
                .ToListAsync();

            var productosDto = productos.Select(p => MapToDto(p)).ToList();

            return Ok(productosDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener productos de muestras");
            return StatusCode(500, new { error = "Error al obtener productos", details = ex.Message });
        }
    }

    /// <summary>
    /// Obtener categorías de productos
    /// GET /api/productos/categorias
    /// </summary>
    [HttpGet("categorias")]
    public async Task<ActionResult<List<string>>> GetCategorias()
    {
        try
        {
            var categorias = await _context.Productos
                .Where(p => p.Categoria != null && p.Activo && p.Status == false)
                .Select(p => p.Categoria!)
                .Distinct()
                .OrderBy(c => c)
                .ToListAsync();

            return Ok(categorias);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener categorías");
            return StatusCode(500, new { error = "Error al obtener categorías", details = ex.Message });
        }
    }

    /// <summary>
    /// Crear un nuevo producto (solo admin)
    /// POST /api/productos
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ProductoDto>> CrearProducto([FromBody] CreateProductoDto dto)
    {
        try
        {
            // Verificar si el código ya existe
            var existeCodigo = await _context.Productos
                .AnyAsync(p => p.CodigoProducto == dto.CodigoProducto);

            if (existeCodigo)
            {
                return BadRequest(new { error = "Ya existe un producto con ese código" });
            }

            var producto = new Producto
            {
                CodigoProducto = dto.CodigoProducto,
                Nombre = dto.Nombre,
                NombreComercial = dto.NombreComercial,
                Descripcion = dto.Descripcion,
                Presentacion = dto.Presentacion,
                Categoria = dto.Categoria,
                Laboratorio = dto.Laboratorio,
                PrincipioActivo = dto.PrincipioActivo,
                Concentracion = dto.Concentracion,
                ViaAdministracion = dto.ViaAdministracion,
                Indicaciones = dto.Indicaciones,
                Contraindicaciones = dto.Contraindicaciones,
                PrecioReferencia = dto.PrecioReferencia,
                ImagenUrl = dto.ImagenUrl,
                Activo = dto.Activo,
                EsMuestra = dto.EsMuestra,
                RequiereReceta = dto.RequiereReceta,
                LineaNegocioId = dto.LineaNegocioId
            };

            _context.Productos.Add(producto);
            await _context.SaveChangesAsync();

            // Recargar con includes
            var productoCreado = await _context.Productos
                .Include(p => p.LineaNegocio)
                .FirstAsync(p => p.Id == producto.Id);

            return CreatedAtAction(nameof(GetProducto), new { id = producto.Id }, MapToDto(productoCreado));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al crear producto");
            return StatusCode(500, new { error = "Error al crear producto", details = ex.Message });
        }
    }

    /// <summary>
    /// Actualizar un producto existente (solo admin)
    /// PUT /api/productos/{id}
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<ProductoDto>> ActualizarProducto(string id, [FromBody] UpdateProductoDto dto)
    {
        try
        {
            var producto = await _context.Productos
                .FirstOrDefaultAsync(p => p.Id == id && p.Status == false);

            if (producto == null)
            {
                return NotFound(new { error = "Producto no encontrado" });
            }

            // Actualizar solo campos no nulos
            if (dto.Nombre != null) producto.Nombre = dto.Nombre;
            if (dto.NombreComercial != null) producto.NombreComercial = dto.NombreComercial;
            if (dto.Descripcion != null) producto.Descripcion = dto.Descripcion;
            if (dto.Presentacion != null) producto.Presentacion = dto.Presentacion;
            if (dto.Categoria != null) producto.Categoria = dto.Categoria;
            if (dto.PrecioReferencia.HasValue) producto.PrecioReferencia = dto.PrecioReferencia;
            if (dto.ImagenUrl != null) producto.ImagenUrl = dto.ImagenUrl;
            if (dto.Activo.HasValue) producto.Activo = dto.Activo.Value;

            producto.FechaModificacion = DateTime.Now;

            await _context.SaveChangesAsync();

            // Recargar con includes
            var productoActualizado = await _context.Productos
                .Include(p => p.LineaNegocio)
                .FirstAsync(p => p.Id == id);

            return Ok(MapToDto(productoActualizado));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error al actualizar producto {id}");
            return StatusCode(500, new { error = "Error al actualizar producto", details = ex.Message });
        }
    }

    // ==================== MÉTODOS PRIVADOS ====================

    private ProductoDto MapToDto(Producto p)
    {
        return new ProductoDto
        {
            Id = p.Id,
            CodigoProducto = p.CodigoProducto,
            Nombre = p.Nombre,
            NombreComercial = p.NombreComercial,
            Descripcion = p.Descripcion,
            Presentacion = p.Presentacion,
            Categoria = p.Categoria,
            Laboratorio = p.Laboratorio,
            PrincipioActivo = p.PrincipioActivo,
            Concentracion = p.Concentracion,
            ViaAdministracion = p.ViaAdministracion,
            Indicaciones = p.Indicaciones,
            Contraindicaciones = p.Contraindicaciones,
            PrecioReferencia = p.PrecioReferencia,
            ImagenUrl = p.ImagenUrl,
            Activo = p.Activo,
            EsMuestra = p.EsMuestra,
            RequiereReceta = p.RequiereReceta,
            LineaNegocioId = p.LineaNegocioId,
            LineaNegocioNombre = p.LineaNegocio?.Nombre,
            FechaCreacion = p.FechaCreacion
        };
    }
}
