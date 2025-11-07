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
                    query = query.Where(c => c.NOME != null && c.NOME.Contains(searchName));
                }

                // Filtro de búsqueda por otros campos
                if (!string.IsNullOrWhiteSpace(searchOther))
                {
                    query = query.Where(c =>
                        (c.CRM != null && c.CRM.Contains(searchOther)) ||
                        (c.CDGMED_REG != null && c.CDGMED_REG.Contains(searchOther)) ||
                        (c.CDGESP1 != null && c.CDGESP1.Contains(searchOther)) ||
                        (c.CDGESP2 != null && c.CDGESP2.Contains(searchOther)) ||
                        (c.CDGREG_PMIX != null && c.CDGREG_PMIX.Contains(searchOther)) ||
                        (c.LOCAL != null && c.LOCAL.Contains(searchOther)) ||
                        (c.BAIRRO != null && c.BAIRRO.Contains(searchOther)) ||
                        (c.CEP != null && c.CEP.Contains(searchOther)) ||
                        (c.CDGMED_VIS != null && c.CDGMED_VIS.Contains(searchOther))
                    );
                }

                var totalItems = await query.CountAsync();
                var totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);

                var items = await query
                    .OrderBy(c => c.NOME)
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
        [HttpGet("{id}")]
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
                    .Where(c => !string.IsNullOrEmpty(c.CRM))
                    .CountAsync();
                var conEspecialidad1 = await _context.Set<AuditCustomer>()
                    .Where(c => !string.IsNullOrEmpty(c.CDGESP1))
                    .CountAsync();
                var conEspecialidad2 = await _context.Set<AuditCustomer>()
                    .Where(c => !string.IsNullOrEmpty(c.CDGESP2))
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
    }
}
