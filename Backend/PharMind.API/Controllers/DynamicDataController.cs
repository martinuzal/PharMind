using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PharMind.API.Data;

namespace PharMind.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DynamicDataController : ControllerBase
{
    private readonly PharMindDbContext _context;

    public DynamicDataController(PharMindDbContext context)
    {
        _context = context;
    }

    [HttpGet("{tableName}")]
    public async Task<ActionResult<IEnumerable<object>>> GetTableData(
        string tableName,
        [FromQuery] string valueField,
        [FromQuery] string labelField)
    {
        try
        {
            Console.WriteLine($"===== GetTableData called =====");
            Console.WriteLine($"TableName: {tableName}");
            Console.WriteLine($"ValueField: {valueField}");
            Console.WriteLine($"LabelField: {labelField}");

            // Validar nombre de tabla para prevenir SQL Injection
            var staticTables = new[] { "Usuarios", "Empresas", "Roles", "Modulos" };

            // Verificar si es una tabla estática permitida
            bool isStaticTable = staticTables.Contains(tableName, StringComparer.OrdinalIgnoreCase);
            Console.WriteLine($"Is static table: {isStaticTable}");

            // Verificar si es una tabla maestra creada
            bool isMasterTable = await _context.TablasMaestras
                .AnyAsync(t => t.NombreTabla == tableName && t.TablaCreada && t.Status == true);
            Console.WriteLine($"Is master table: {isMasterTable}");

            if (!isStaticTable && !isMasterTable)
            {
                Console.WriteLine($"Error: Tabla '{tableName}' no permitida o no existe");
                return BadRequest($"Tabla '{tableName}' no permitida o no existe");
            }

            // Para tablas maestras, no tienen columna Status
            string whereClause = isStaticTable ? "WHERE Status = 1" : "";

            // Consultar la tabla usando SQL raw con CAST para convertir a string
            var query = $@"
                SELECT CAST([{valueField}] AS NVARCHAR(MAX)) as [Value], CAST([{labelField}] AS NVARCHAR(MAX)) as [Label]
                FROM [{tableName}]
                {whereClause}
                ORDER BY [{labelField}]";

            var result = await _context.Database
                .SqlQueryRaw<DynamicDataResult>(query)
                .ToListAsync();

            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error al obtener datos: {ex.Message}");
        }
    }
}

public class DynamicDataResult
{
    public string Value { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
}
