using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PharMind.API.Data;
using PharMind.API.Models;

namespace PharMind.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuditCustomerController : ControllerBase
    {
        private readonly PharMindDbContext _context;
        private readonly ILogger<AuditCustomerController> _logger;

        public AuditCustomerController(
            PharMindDbContext context,
            ILogger<AuditCustomerController> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Obtiene todos los médicos de auditoría con paginación y filtros
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<object>> GetAuditCustomers(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 50,
            [FromQuery] string? searchName = null,
            [FromQuery] string? searchOther = null)
        {
            try
            {
                var query = _context.Set<AuditCustomer>().AsQueryable();

                // Filtro de búsqueda por nombre
                if (!string.IsNullOrWhiteSpace(searchName))
                {
                    query = query.Where(c => c.Nome != null && c.Nome.Contains(searchName));
                }

                // Filtro de búsqueda por otros campos
                if (!string.IsNullOrWhiteSpace(searchOther))
                {
                    query = query.Where(c =>
                        (c.Crm != null && c.Crm.Contains(searchOther)) ||
                        (c.CdgmedReg != null && c.CdgmedReg.Contains(searchOther)) ||
                        (c.Cdgesp1 != null && c.Cdgesp1.Contains(searchOther)) ||
                        (c.Cdgesp2 != null && c.Cdgesp2.Contains(searchOther)) ||
                        (c.CdgregPmix != null && c.CdgregPmix.Contains(searchOther)) ||
                        (c.Local != null && c.Local.Contains(searchOther)) ||
                        (c.Bairro != null && c.Bairro.Contains(searchOther)) ||
                        (c.Cep != null && c.Cep.Contains(searchOther)) ||
                        (c.CdgmedVis != null && c.CdgmedVis.Contains(searchOther))
                    );
                }

                var totalItems = await query.CountAsync();
                var totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);

                var items = await query
                    .OrderBy(c => c.Nome)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                return Ok(new
                {
                    items,
                    totalItems,
                    totalPages,
                    currentPage = page,
                    pageSize
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener médicos de auditoría");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>
        /// Obtiene un médico de auditoría por ID
        /// </summary>
        [HttpGet("{id:int}")]
        public async Task<ActionResult<AuditCustomer>> GetAuditCustomer(int id)
        {
            try
            {
                var customer = await _context.Set<AuditCustomer>()
                    .FirstOrDefaultAsync(c => c.Id == id);

                if (customer == null)
                {
                    return NotFound("Médico no encontrado");
                }

                return Ok(customer);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener médico {Id}", id);
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>
        /// Obtiene estadísticas de los médicos de auditoría
        /// </summary>
        [HttpGet("estadisticas")]
        public async Task<ActionResult<object>> GetEstadisticas()
        {
            try
            {
                var total = await _context.Set<AuditCustomer>().CountAsync();
                var conCRM = await _context.Set<AuditCustomer>()
                    .Where(c => !string.IsNullOrEmpty(c.Crm))
                    .CountAsync();
                var conEspecialidad1 = await _context.Set<AuditCustomer>()
                    .Where(c => !string.IsNullOrEmpty(c.Cdgesp1))
                    .CountAsync();
                var conEspecialidad2 = await _context.Set<AuditCustomer>()
                    .Where(c => !string.IsNullOrEmpty(c.Cdgesp2))
                    .CountAsync();

                return Ok(new
                {
                    totalMedicos = total,
                    medicosConCRM = conCRM,
                    medicosConEspecialidad1 = conEspecialidad1,
                    medicosConEspecialidad2 = conEspecialidad2
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener estadísticas");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>
        /// Obtiene el perfil prescriptivo de un médico agrupado por mercado
        /// </summary>
        [HttpGet("{cdgmedReg}/perfil-prescriptivo")]
        public async Task<ActionResult<object>> GetPerfilPrescriptivo(string cdgmedReg)
        {
            try
            {
                // Obtener datos raw de la base de datos
                var rawData = await _context.Set<AuditCategory>()
                    .Where(c => c.CdgmedReg == cdgmedReg)
                    .ToListAsync();

                // Agrupar por mercado en memoria
                var perfilPorMercado = rawData
                    .GroupBy(c => c.CdgMercado)
                    .Select(g => new
                    {
                        mercado = g.Key,
                        totalPrescripciones = g.Sum(x => int.TryParse(x.Px, out var val) ? val : 0),
                        prescripcionesLaboratorio = g.Sum(x => int.TryParse(x.PxLab, out var val) ? val : 0),
                        prescripcionesMercado = g.Sum(x => int.TryParse(x.PxMer, out var val) ? val : 0),
                        marketShare = g.Average(x => double.TryParse(x.PxMs, out var val) ? val : 0),
                        categorias = g.Select(x => x.Cat).Distinct().Count()
                    })
                    .OrderByDescending(x => x.totalPrescripciones)
                    .ToList();

                // Top categorías (agregando por categoría sumando todos los mercados)
                var topCategoriasAgrupadas = rawData
                    .GroupBy(c => c.Cat)
                    .Select(g => new
                    {
                        categoria = g.Key,
                        prescripciones = g.Sum(x => int.TryParse(x.Px, out var val) ? val : 0)
                    })
                    .OrderByDescending(x => x.prescripciones)
                    .Take(10)
                    .ToList();

                // Resumen general
                var totalPrescripciones = perfilPorMercado.Sum(x => x.totalPrescripciones);
                var totalMercados = perfilPorMercado.Count;

                return Ok(new
                {
                    resumen = new
                    {
                        totalPrescripciones,
                        totalMercados,
                        promedioMarketShare = perfilPorMercado.Any() ? perfilPorMercado.Average(x => x.marketShare) : 0
                    },
                    perfilPorMercado,
                    topCategorias = topCategoriasAgrupadas
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener perfil prescriptivo del médico {CdgmedReg}", cdgmedReg);
                return StatusCode(500, "Error interno del servidor");
            }
        }
    }
}
