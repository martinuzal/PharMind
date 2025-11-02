using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PharMind.API.Data;
using PharMind.API.Models;
using PharMind.API.Services;

namespace PharMind.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TablasMaestrasController : ControllerBase
{
    private readonly PharMindDbContext _context;
    private readonly DynamicTableService _dynamicTableService;

    public TablasMaestrasController(PharMindDbContext context, DynamicTableService dynamicTableService)
    {
        _context = context;
        _dynamicTableService = dynamicTableService;
    }

    // GET: api/TablasMaestras
    [HttpGet]
    public async Task<ActionResult<IEnumerable<TablaMaestra>>> GetTablasMaestras()
    {
        return await _context.TablasMaestras
            .Where(t => t.Status == true)
            .OrderBy(t => t.NombreTabla)
            .ToListAsync();
    }

    // GET: api/TablasMaestras/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<TablaMaestra>> GetTablaMaestra(string id)
    {
        var tabla = await _context.TablasMaestras.FindAsync(id);

        if (tabla == null || tabla.Status != true)
        {
            return NotFound();
        }

        return tabla;
    }

    // POST: api/TablasMaestras
    [HttpPost]
    public async Task<ActionResult<TablaMaestra>> CreateTablaMaestra(TablaMaestra tabla)
    {
        Console.WriteLine($"===== CreateTablaMaestra called =====");
        Console.WriteLine($"NombreTabla: {tabla.NombreTabla}");
        Console.WriteLine($"Descripcion: {tabla.Descripcion}");
        Console.WriteLine($"EsquemaColumnas: {tabla.EsquemaColumnas}");
        Console.WriteLine($"Activo: {tabla.Activo}");

        tabla.Id = Guid.NewGuid().ToString();
        tabla.FechaCreacion = DateTime.UtcNow;
        tabla.Status = true;
        tabla.TablaCreada = false;

        _context.TablasMaestras.Add(tabla);
        await _context.SaveChangesAsync();

        // Crear la tabla SQL
        Console.WriteLine($"Calling CrearTablaSQL for table: {tabla.NombreTabla}");
        var (success, message) = await _dynamicTableService.CrearTablaSQL(tabla);
        Console.WriteLine($"CrearTablaSQL result - Success: {success}, Message: {message}");

        if (success)
        {
            await _context.SaveChangesAsync(); // Guardar el flag TablaCreada
            return CreatedAtAction(nameof(GetTablaMaestra), new { id = tabla.Id }, tabla);
        }
        else
        {
            // Si falla, eliminar el registro
            Console.WriteLine($"Table creation failed, rolling back: {message}");
            _context.TablasMaestras.Remove(tabla);
            await _context.SaveChangesAsync();
            return BadRequest(new { error = message });
        }
    }

    // PUT: api/TablasMaestras/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTablaMaestra(string id, TablaMaestra tabla)
    {
        if (id != tabla.Id)
        {
            return BadRequest();
        }

        var existingTabla = await _context.TablasMaestras.FindAsync(id);
        if (existingTabla == null || existingTabla.Status != true)
        {
            return NotFound();
        }

        // No permitir cambiar nombre de tabla si ya fue creada
        if (existingTabla.TablaCreada && existingTabla.NombreTabla != tabla.NombreTabla)
        {
            return BadRequest(new { error = "No se puede cambiar el nombre de una tabla ya creada" });
        }

        existingTabla.Descripcion = tabla.Descripcion;
        existingTabla.Activo = tabla.Activo;
        existingTabla.FechaModificacion = DateTime.UtcNow;

        // Solo permitir actualizar esquema de columnas si no ha sido creada
        if (!existingTabla.TablaCreada)
        {
            existingTabla.EsquemaColumnas = tabla.EsquemaColumnas;
            existingTabla.NombreTabla = tabla.NombreTabla;
        }

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!TablaMaestraExists(id))
            {
                return NotFound();
            }
            throw;
        }

        return NoContent();
    }

    // DELETE: api/TablasMaestras/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTablaMaestra(string id)
    {
        var tabla = await _context.TablasMaestras.FindAsync(id);
        if (tabla == null || tabla.Status != true)
        {
            return NotFound();
        }

        // Eliminar la tabla SQL si existe
        if (tabla.TablaCreada)
        {
            var (success, message) = await _dynamicTableService.EliminarTablaSQL(tabla.NombreTabla);
            if (!success)
            {
                return BadRequest(new { error = message });
            }
        }

        // Soft delete del registro
        tabla.Status = false;
        tabla.FechaModificacion = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // GET: api/TablasMaestras/{id}/datos
    [HttpGet("{id}/datos")]
    public async Task<ActionResult> GetDatosTablaMaestra(string id)
    {
        var tabla = await _context.TablasMaestras.FindAsync(id);
        if (tabla == null || tabla.Status != true)
        {
            return NotFound();
        }

        if (!tabla.TablaCreada)
        {
            return BadRequest(new { error = "La tabla no ha sido creada aún" });
        }

        var datos = await _dynamicTableService.ObtenerDatosTabla(tabla.NombreTabla);
        return Ok(datos);
    }

    // POST: api/TablasMaestras/{id}/datos
    [HttpPost("{id}/datos")]
    public async Task<ActionResult> InsertarDatoTablaMaestra(string id, [FromBody] Dictionary<string, object> datos)
    {
        Console.WriteLine($"===== InsertarDatoTablaMaestra called =====");
        Console.WriteLine($"ID Tabla: {id}");
        Console.WriteLine($"Datos recibidos: {System.Text.Json.JsonSerializer.Serialize(datos)}");

        var tabla = await _context.TablasMaestras.FindAsync(id);
        if (tabla == null || tabla.Status != true)
        {
            Console.WriteLine("Error: Tabla no encontrada o inactiva");
            return NotFound();
        }

        Console.WriteLine($"Tabla encontrada: {tabla.NombreTabla}, TablaCreada: {tabla.TablaCreada}");

        if (!tabla.TablaCreada)
        {
            Console.WriteLine("Error: Tabla no ha sido creada");
            return BadRequest(new { error = "La tabla no ha sido creada aún" });
        }

        // Convertir JsonElement a valores primitivos
        var datosConvertidos = new Dictionary<string, object>();
        foreach (var kvp in datos)
        {
            if (kvp.Value is System.Text.Json.JsonElement jsonElement)
            {
                datosConvertidos[kvp.Key] = ConvertJsonElement(jsonElement);
            }
            else
            {
                datosConvertidos[kvp.Key] = kvp.Value;
            }
        }

        // Parsear el esquema de columnas para encontrar la clave primaria
        var options = new System.Text.Json.JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };
        var columnas = System.Text.Json.JsonSerializer.Deserialize<List<ColumnaDef>>(tabla.EsquemaColumnas, options);
        var primaryKeyColumn = columnas?.FirstOrDefault(c => c.EsClavePrimaria);

        // Solo generar ID si la clave primaria es "Id" y no viene en los datos
        if (primaryKeyColumn != null && primaryKeyColumn.Nombre == "Id" && !datosConvertidos.ContainsKey("Id"))
        {
            datosConvertidos["Id"] = Guid.NewGuid().ToString();
            Console.WriteLine($"ID generado: {datosConvertidos["Id"]}");
        }

        Console.WriteLine($"Llamando InsertarDato para tabla: {tabla.NombreTabla}");
        var (success, message) = await _dynamicTableService.InsertarDato(tabla.NombreTabla, datosConvertidos);
        Console.WriteLine($"Resultado InsertarDato - Success: {success}, Message: {message}");

        if (success)
        {
            return Ok(new { message });
        }
        else
        {
            return BadRequest(new { error = message });
        }
    }

    // PUT: api/TablasMaestras/{id}/datos/{datoId}
    [HttpPut("{id}/datos/{datoId}")]
    public async Task<ActionResult> ActualizarDatoTablaMaestra(string id, string datoId, [FromBody] Dictionary<string, object> datos)
    {
        var tabla = await _context.TablasMaestras.FindAsync(id);
        if (tabla == null || tabla.Status != true)
        {
            return NotFound();
        }

        if (!tabla.TablaCreada)
        {
            return BadRequest(new { error = "La tabla no ha sido creada aún" });
        }

        // Convertir JsonElement a valores primitivos
        var datosConvertidos = new Dictionary<string, object>();
        foreach (var kvp in datos)
        {
            if (kvp.Value is System.Text.Json.JsonElement jsonElement)
            {
                datosConvertidos[kvp.Key] = ConvertJsonElement(jsonElement);
            }
            else
            {
                datosConvertidos[kvp.Key] = kvp.Value;
            }
        }

        // Parsear el esquema de columnas para encontrar la clave primaria
        var options = new System.Text.Json.JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };
        var columnas = System.Text.Json.JsonSerializer.Deserialize<List<ColumnaDef>>(tabla.EsquemaColumnas, options);
        var primaryKeyColumn = columnas?.FirstOrDefault(c => c.EsClavePrimaria);

        // Usar el nombre de la columna de clave primaria real
        string primaryKeyName = primaryKeyColumn?.Nombre ?? "Id";

        var (success, message) = await _dynamicTableService.ActualizarDato(tabla.NombreTabla, primaryKeyName, datoId, datosConvertidos);

        if (success)
        {
            return Ok(new { message });
        }
        else
        {
            return BadRequest(new { error = message });
        }
    }

    // DELETE: api/TablasMaestras/{id}/datos/{datoId}
    [HttpDelete("{id}/datos/{datoId}")]
    public async Task<ActionResult> EliminarDatoTablaMaestra(string id, string datoId)
    {
        var tabla = await _context.TablasMaestras.FindAsync(id);
        if (tabla == null || tabla.Status != true)
        {
            return NotFound();
        }

        if (!tabla.TablaCreada)
        {
            return BadRequest(new { error = "La tabla no ha sido creada aún" });
        }

        // Parsear el esquema de columnas para encontrar la clave primaria
        var options = new System.Text.Json.JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };
        var columnas = System.Text.Json.JsonSerializer.Deserialize<List<ColumnaDef>>(tabla.EsquemaColumnas, options);
        var primaryKeyColumn = columnas?.FirstOrDefault(c => c.EsClavePrimaria);

        // Usar el nombre de la columna de clave primaria real
        string primaryKeyName = primaryKeyColumn?.Nombre ?? "Id";

        var (success, message) = await _dynamicTableService.EliminarDato(tabla.NombreTabla, primaryKeyName, datoId);

        if (success)
        {
            return Ok(new { message });
        }
        else
        {
            return BadRequest(new { error = message });
        }
    }

    private bool TablaMaestraExists(string id)
    {
        return _context.TablasMaestras.Any(e => e.Id == id && e.Status == true);
    }

    private object ConvertJsonElement(System.Text.Json.JsonElement element)
    {
        switch (element.ValueKind)
        {
            case System.Text.Json.JsonValueKind.String:
                return element.GetString() ?? string.Empty;
            case System.Text.Json.JsonValueKind.Number:
                if (element.TryGetInt32(out int intValue))
                    return intValue;
                if (element.TryGetInt64(out long longValue))
                    return longValue;
                if (element.TryGetDecimal(out decimal decimalValue))
                    return decimalValue;
                return element.GetDouble();
            case System.Text.Json.JsonValueKind.True:
                return true;
            case System.Text.Json.JsonValueKind.False:
                return false;
            case System.Text.Json.JsonValueKind.Null:
                return DBNull.Value;
            default:
                return element.ToString();
        }
    }
}
