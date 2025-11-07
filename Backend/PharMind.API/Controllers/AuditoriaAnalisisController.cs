using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using PharMind.API.DTOs;
using System.Data;

namespace PharMind.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuditoriaAnalisisController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<AuditoriaAnalisisController> _logger;

        public AuditoriaAnalisisController(
            IConfiguration configuration,
            ILogger<AuditoriaAnalisisController> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        private string GetConnectionString()
        {
            return _configuration.GetConnectionString("DefaultConnection")
                ?? throw new InvalidOperationException("Connection string not found");
        }

        // GET: api/AuditoriaAnalisis/portfolio-beb?periodo=141REAL
        [HttpGet("portfolio-beb")]
        public async Task<ActionResult<IEnumerable<PortfolioBEBDTO>>> GetPortfolioBEB([FromQuery] string? periodo = null)
        {
            try
            {
                var portfolio = new List<PortfolioBEBDTO>();

                using (var connection = new SqlConnection(GetConnectionString()))
                {
                    await connection.OpenAsync();

                    using (var command = new SqlCommand("rpt_GetPortfolioBEB", connection))
                    {
                        command.CommandType = CommandType.StoredProcedure;
                        command.CommandTimeout = 180; // 3 minutos para queries pesadas
                        command.Parameters.AddWithValue("@Periodo", (object?)periodo ?? DBNull.Value);

                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            while (await reader.ReadAsync())
                            {
                                portfolio.Add(new PortfolioBEBDTO
                                {
                                    CdgMercado = reader.GetString(reader.GetOrdinal("CdgMercado")),
                                    MercadoNombre = reader.GetString(reader.GetOrdinal("MercadoNombre")),
                                    MercadoAbrev = reader.IsDBNull(reader.GetOrdinal("MercadoAbrev")) ? null : reader.GetString(reader.GetOrdinal("MercadoAbrev")),
                                    ProductosBEB = reader.GetInt32(reader.GetOrdinal("ProductosBEB")),
                                    PrescripcionesBEB = reader.GetInt32(reader.GetOrdinal("PrescripcionesBEB")),
                                    MedicosBEB = reader.GetInt32(reader.GetOrdinal("MedicosBEB")),
                                    PX_BEB = reader.GetInt32(reader.GetOrdinal("PX_BEB")),
                                    ProductosTotales = reader.GetInt32(reader.GetOrdinal("ProductosTotales")),
                                    PrescripcionesTotales = reader.GetInt32(reader.GetOrdinal("PrescripcionesTotales")),
                                    MedicosTotales = reader.GetInt32(reader.GetOrdinal("MedicosTotales")),
                                    LaboratoriosTotales = reader.GetInt32(reader.GetOrdinal("LaboratoriosTotales")),
                                    MarketShareBEB = reader.GetDecimal(reader.GetOrdinal("MarketShareBEB")),
                                    RankingBEB = reader.GetInt32(reader.GetOrdinal("RankingBEB"))
                                });
                            }
                        }
                    }
                }

                return Ok(portfolio);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener portfolio BEB");
                return StatusCode(500, "Error al procesar la solicitud");
            }
        }

        // GET: api/AuditoriaAnalisis/mercado-overview/498656?periodo=141REAL
        [HttpGet("mercado-overview/{cdgMercado}")]
        public async Task<ActionResult<MercadoOverviewDTO>> GetMercadoOverview(string cdgMercado, [FromQuery] string? periodo = null)
        {
            try
            {
                using (var connection = new SqlConnection(GetConnectionString()))
                {
                    await connection.OpenAsync();

                    using (var command = new SqlCommand("rpt_GetMercadoOverview", connection))
                    {
                        command.CommandType = CommandType.StoredProcedure;
                        command.CommandTimeout = 180; // 3 minutos para queries pesadas
                        command.Parameters.AddWithValue("@CdgMercado", cdgMercado);
                        command.Parameters.AddWithValue("@Periodo", (object?)periodo ?? DBNull.Value);

                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            if (await reader.ReadAsync())
                            {
                                var overview = new MercadoOverviewDTO
                                {
                                    CdgMercado = reader.GetString(reader.GetOrdinal("CdgMercado")),
                                    MercadoNombre = reader.GetString(reader.GetOrdinal("MercadoNombre")),
                                    Abreviatura = reader.IsDBNull(reader.GetOrdinal("Abreviatura")) ? null : reader.GetString(reader.GetOrdinal("Abreviatura")),
                                    TotalPrescripciones = reader.GetInt32(reader.GetOrdinal("TotalPrescripciones")),
                                    TotalMedicos = reader.GetInt32(reader.GetOrdinal("TotalMedicos")),
                                    TotalProductos = reader.GetInt32(reader.GetOrdinal("TotalProductos")),
                                    TotalLaboratorios = reader.GetInt32(reader.GetOrdinal("TotalLaboratorios")),
                                    PrescripcionesBEB = reader.GetInt32(reader.GetOrdinal("PrescripcionesBEB")),
                                    MedicosBEB = reader.GetInt32(reader.GetOrdinal("MedicosBEB")),
                                    ProductosBEB = reader.GetInt32(reader.GetOrdinal("ProductosBEB")),
                                    MarketShareBEB = reader.GetDecimal(reader.GetOrdinal("MarketShareBEB"))
                                };

                                return Ok(overview);
                            }

                            return NotFound($"Mercado {cdgMercado} no encontrado");
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener overview del mercado {CdgMercado}", cdgMercado);
                return StatusCode(500, "Error al procesar la solicitud");
            }
        }

        // GET: api/AuditoriaAnalisis/laboratorios/498656?periodo=141REAL&topN=10
        [HttpGet("laboratorios/{cdgMercado}")]
        public async Task<ActionResult<IEnumerable<LaboratorioPorMercadoDTO>>> GetLaboratoriosPorMercado(
            string cdgMercado,
            [FromQuery] string? periodo = null,
            [FromQuery] int? topN = null)
        {
            try
            {
                var laboratorios = new List<LaboratorioPorMercadoDTO>();

                using (var connection = new SqlConnection(GetConnectionString()))
                {
                    await connection.OpenAsync();

                    using (var command = new SqlCommand("rpt_GetLaboratoriosPorMercado", connection))
                    {
                        command.CommandType = CommandType.StoredProcedure;
                        command.CommandTimeout = 180; // 3 minutos para queries pesadas
                        command.Parameters.AddWithValue("@CdgMercado", cdgMercado);
                        command.Parameters.AddWithValue("@Periodo", (object?)periodo ?? DBNull.Value);
                        command.Parameters.AddWithValue("@TopN", (object?)topN ?? DBNull.Value);

                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            while (await reader.ReadAsync())
                            {
                                laboratorios.Add(new LaboratorioPorMercadoDTO
                                {
                                    Ranking = (int)reader.GetInt64(reader.GetOrdinal("Ranking")),
                                    Laboratorio = reader.GetString(reader.GetOrdinal("Laboratorio")),
                                    EsBEB = reader.GetInt32(reader.GetOrdinal("EsBEB")),
                                    Prescripciones = reader.GetInt32(reader.GetOrdinal("Prescripciones")),
                                    MedicosUnicos = reader.GetInt32(reader.GetOrdinal("MedicosUnicos")),
                                    ProductosDelLab = reader.GetInt32(reader.GetOrdinal("ProductosDelLab")),
                                    TotalPX = reader.GetInt32(reader.GetOrdinal("TotalPX")),
                                    MarketShare = reader.GetDecimal(reader.GetOrdinal("MarketShare"))
                                });
                            }
                        }
                    }
                }

                return Ok(laboratorios);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener laboratorios del mercado {CdgMercado}", cdgMercado);
                return StatusCode(500, "Error al procesar la solicitud");
            }
        }

        // GET: api/AuditoriaAnalisis/productos/498656?periodo=141REAL&laboratorio=BEB&topN=20
        [HttpGet("productos/{cdgMercado}")]
        public async Task<ActionResult<IEnumerable<ProductoPorMercadoDTO>>> GetProductosPorMercado(
            string cdgMercado,
            [FromQuery] string? periodo = null,
            [FromQuery] string? laboratorio = null,
            [FromQuery] int? topN = null)
        {
            try
            {
                var productos = new List<ProductoPorMercadoDTO>();

                using (var connection = new SqlConnection(GetConnectionString()))
                {
                    await connection.OpenAsync();

                    using (var command = new SqlCommand("rpt_GetProductosPorMercado", connection))
                    {
                        command.CommandType = CommandType.StoredProcedure;
                        command.CommandTimeout = 180; // 3 minutos para queries pesadas
                        command.Parameters.AddWithValue("@CdgMercado", cdgMercado);
                        command.Parameters.AddWithValue("@Periodo", (object?)periodo ?? DBNull.Value);
                        command.Parameters.AddWithValue("@Laboratorio", (object?)laboratorio ?? DBNull.Value);
                        command.Parameters.AddWithValue("@TopN", (object?)topN ?? DBNull.Value);

                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            while (await reader.ReadAsync())
                            {
                                productos.Add(new ProductoPorMercadoDTO
                                {
                                    Ranking = (int)reader.GetInt64(reader.GetOrdinal("Ranking")),
                                    CDG_RAIZ = reader.GetString(reader.GetOrdinal("CDG_RAIZ")),
                                    CODIGO_PMIX = reader.GetString(reader.GetOrdinal("CODIGO_PMIX")),
                                    ProductoNombre = reader.GetString(reader.GetOrdinal("ProductoNombre")),
                                    Laboratorio = reader.GetString(reader.GetOrdinal("Laboratorio")),
                                    EsBEB = reader.GetInt32(reader.GetOrdinal("EsBEB")),
                                    Prescripciones = reader.GetInt32(reader.GetOrdinal("Prescripciones")),
                                    MedicosUnicos = reader.GetInt32(reader.GetOrdinal("MedicosUnicos")),
                                    TotalPX = reader.GetInt32(reader.GetOrdinal("TotalPX")),
                                    PromedioPX_MER = reader.GetDecimal(reader.GetOrdinal("PromedioPX_MER")),
                                    MarketShare = reader.GetDecimal(reader.GetOrdinal("MarketShare"))
                                });
                            }
                        }
                    }
                }

                return Ok(productos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener productos del mercado {CdgMercado}", cdgMercado);
                return StatusCode(500, "Error al procesar la solicitud");
            }
        }

        // GET: api/AuditoriaAnalisis/medicos/498656?periodo=141REAL&filtroLealtad=CON_BEB&topN=50
        [HttpGet("medicos/{cdgMercado}")]
        public async Task<ActionResult<IEnumerable<MedicoPorMercadoDTO>>> GetMedicosPorMercado(
            string cdgMercado,
            [FromQuery] string? periodo = null,
            [FromQuery] string? filtroLealtad = null,
            [FromQuery] int topN = 100)
        {
            try
            {
                var medicos = new List<MedicoPorMercadoDTO>();

                using (var connection = new SqlConnection(GetConnectionString()))
                {
                    await connection.OpenAsync();

                    using (var command = new SqlCommand("rpt_GetMedicosPorMercado", connection))
                    {
                        command.CommandType = CommandType.StoredProcedure;
                        command.CommandTimeout = 180; // 3 minutos para queries pesadas
                        command.Parameters.AddWithValue("@CdgMercado", cdgMercado);
                        command.Parameters.AddWithValue("@Periodo", (object?)periodo ?? DBNull.Value);
                        command.Parameters.AddWithValue("@FiltroLealtad", (object?)filtroLealtad ?? DBNull.Value);
                        command.Parameters.AddWithValue("@TopN", topN);

                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            while (await reader.ReadAsync())
                            {
                                medicos.Add(new MedicoPorMercadoDTO
                                {
                                    Ranking = (int)reader.GetInt64(reader.GetOrdinal("Ranking")),
                                    CDGMED_REG = reader.GetString(reader.GetOrdinal("CDGMED_REG")),
                                    MedicoNombre = reader.IsDBNull(reader.GetOrdinal("MedicoNombre")) ? null : reader.GetString(reader.GetOrdinal("MedicoNombre")),
                                    Especialidad = reader.IsDBNull(reader.GetOrdinal("Especialidad")) ? null : reader.GetString(reader.GetOrdinal("Especialidad")),
                                    Ciudad = reader.IsDBNull(reader.GetOrdinal("Ciudad")) ? null : reader.GetString(reader.GetOrdinal("Ciudad")),
                                    Barrio = reader.IsDBNull(reader.GetOrdinal("Barrio")) ? null : reader.GetString(reader.GetOrdinal("Barrio")),
                                    TotalPrescripciones = reader.GetInt32(reader.GetOrdinal("TotalPrescripciones")),
                                    ProductosDistintos = reader.GetInt32(reader.GetOrdinal("ProductosDistintos")),
                                    LaboratoriosDistintos = reader.GetInt32(reader.GetOrdinal("LaboratoriosDistintos")),
                                    PrescripcionesBEB = reader.GetInt32(reader.GetOrdinal("PrescripcionesBEB")),
                                    ProductosBEB = reader.GetInt32(reader.GetOrdinal("ProductosBEB")),
                                    PorcentajeBEB = reader.GetDecimal(reader.GetOrdinal("PorcentajeBEB")),
                                    CategoriaMedico = reader.GetString(reader.GetOrdinal("CategoriaMedico"))
                                });
                            }
                        }
                    }
                }

                return Ok(medicos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener médicos del mercado {CdgMercado}", cdgMercado);
                return StatusCode(500, "Error al procesar la solicitud");
            }
        }

        // GET: api/AuditoriaAnalisis/mercados
        [HttpGet("mercados")]
        public async Task<ActionResult<IEnumerable<MercadoDTO>>> GetListaMercados()
        {
            try
            {
                var mercados = new List<MercadoDTO>();

                using (var connection = new SqlConnection(GetConnectionString()))
                {
                    await connection.OpenAsync();

                    using (var command = new SqlCommand("rpt_GetListaMercados", connection))
                    {
                        command.CommandType = CommandType.StoredProcedure;
                        command.CommandTimeout = 180; // 3 minutos para queries pesadas

                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            while (await reader.ReadAsync())
                            {
                                mercados.Add(new MercadoDTO
                                {
                                    CdgMercado = reader.GetString(reader.GetOrdinal("CdgMercado")),
                                    Nombre = reader.GetString(reader.GetOrdinal("Nombre")),
                                    Abreviatura = reader.IsDBNull(reader.GetOrdinal("Abreviatura")) ? null : reader.GetString(reader.GetOrdinal("Abreviatura")),
                                    CdgUsuario = reader.IsDBNull(reader.GetOrdinal("CdgUsuario")) ? null : reader.GetString(reader.GetOrdinal("CdgUsuario")),
                                    Edicion = reader.IsDBNull(reader.GetOrdinal("Edicion")) ? null : reader.GetString(reader.GetOrdinal("Edicion"))
                                });
                            }
                        }
                    }
                }

                return Ok(mercados);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener lista de mercados");
                return StatusCode(500, "Error al procesar la solicitud");
            }
        }

        // GET: api/AuditoriaAnalisis/periodos
        [HttpGet("periodos")]
        public async Task<ActionResult<IEnumerable<PeriodoDTO>>> GetListaPeriodos()
        {
            try
            {
                var periodos = new List<PeriodoDTO>();

                using (var connection = new SqlConnection(GetConnectionString()))
                {
                    await connection.OpenAsync();

                    using (var command = new SqlCommand("rpt_GetListaPeriodos", connection))
                    {
                        command.CommandType = CommandType.StoredProcedure;
                        command.CommandTimeout = 180; // 3 minutos para queries pesadas

                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            while (await reader.ReadAsync())
                            {
                                periodos.Add(new PeriodoDTO
                                {
                                    Codigo = reader.GetString(reader.GetOrdinal("Codigo")),
                                    Descripcion = reader.IsDBNull(reader.GetOrdinal("Descripcion")) ? null : reader.GetString(reader.GetOrdinal("Descripcion")),
                                    BLANK = reader.IsDBNull(reader.GetOrdinal("BLANK")) ? null : reader.GetString(reader.GetOrdinal("BLANK"))
                                });
                            }
                        }
                    }
                }

                return Ok(periodos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener lista de períodos");
                return StatusCode(500, "Error al procesar la solicitud");
            }
        }

        // GET: api/AuditoriaAnalisis/geografico/por-cep
        [HttpGet("geografico/por-cep")]
        public async Task<ActionResult<IEnumerable<PrescripcionPorCEPDTO>>> GetPrescripcionesPorCEP(
            [FromQuery] string? periodo = null,
            [FromQuery] string? cdgMercado = null,
            [FromQuery] int topN = 500)
        {
            try
            {
                var datos = new List<PrescripcionPorCEPDTO>();

                using (var connection = new SqlConnection(GetConnectionString()))
                {
                    await connection.OpenAsync();

                    using (var command = new SqlCommand("GetPrescripcionesPorCEP", connection))
                    {
                        command.CommandType = CommandType.StoredProcedure;
                        command.CommandTimeout = 180; // 3 minutos para queries pesadas

                        command.Parameters.AddWithValue("@Periodo", (object?)periodo ?? DBNull.Value);
                        command.Parameters.AddWithValue("@CdgMercado", (object?)cdgMercado ?? DBNull.Value);
                        command.Parameters.AddWithValue("@TopN", topN);

                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            while (await reader.ReadAsync())
                            {
                                datos.Add(new PrescripcionPorCEPDTO
                                {
                                    CEP = reader.GetString(reader.GetOrdinal("CEP")),
                                    Ciudad = reader.IsDBNull(reader.GetOrdinal("Ciudad")) ? null : reader.GetString(reader.GetOrdinal("Ciudad")),
                                    Barrio = reader.IsDBNull(reader.GetOrdinal("Barrio")) ? null : reader.GetString(reader.GetOrdinal("Barrio")),
                                    TotalMedicos = reader.GetInt32(reader.GetOrdinal("TotalMedicos")),
                                    TotalPrescripciones = reader.GetInt32(reader.GetOrdinal("TotalPrescripciones")),
                                    ProductosDistintos = reader.GetInt32(reader.GetOrdinal("ProductosDistintos")),
                                    Ranking = (int)reader.GetInt64(reader.GetOrdinal("Ranking"))
                                });
                            }
                        }
                    }
                }

                return Ok(datos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener prescripciones por CEP");
                return StatusCode(500, "Error al procesar la solicitud");
            }
        }

        // GET: api/AuditoriaAnalisis/geografico/top-ciudades
        [HttpGet("geografico/top-ciudades")]
        public async Task<ActionResult<IEnumerable<CiudadDTO>>> GetTopCiudades(
            [FromQuery] string? periodo = null,
            [FromQuery] string? cdgMercado = null,
            [FromQuery] int topN = 50)
        {
            try
            {
                var ciudades = new List<CiudadDTO>();

                using (var connection = new SqlConnection(GetConnectionString()))
                {
                    await connection.OpenAsync();

                    using (var command = new SqlCommand("GetTopCiudades", connection))
                    {
                        command.CommandType = CommandType.StoredProcedure;
                        command.CommandTimeout = 180; // 3 minutos para queries pesadas

                        command.Parameters.AddWithValue("@Periodo", (object?)periodo ?? DBNull.Value);
                        command.Parameters.AddWithValue("@CdgMercado", (object?)cdgMercado ?? DBNull.Value);
                        command.Parameters.AddWithValue("@TopN", topN);

                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            while (await reader.ReadAsync())
                            {
                                ciudades.Add(new CiudadDTO
                                {
                                    Ciudad = reader.GetString(reader.GetOrdinal("Ciudad")),
                                    CodigosPostales = reader.GetInt32(reader.GetOrdinal("CodigosPostales")),
                                    Barrios = reader.GetInt32(reader.GetOrdinal("Barrios")),
                                    TotalMedicos = reader.GetInt32(reader.GetOrdinal("TotalMedicos")),
                                    TotalPrescripciones = reader.GetInt32(reader.GetOrdinal("TotalPrescripciones")),
                                    ProductosDistintos = reader.GetInt32(reader.GetOrdinal("ProductosDistintos")),
                                    Ranking = (int)reader.GetInt64(reader.GetOrdinal("Ranking"))
                                });
                            }
                        }
                    }
                }

                return Ok(ciudades);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener top ciudades");
                return StatusCode(500, "Error al procesar la solicitud");
            }
        }
    }
}
