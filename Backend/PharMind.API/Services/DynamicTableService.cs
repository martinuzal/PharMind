using Microsoft.EntityFrameworkCore;
using PharMind.API.Data;
using PharMind.API.Models;
using System.Text;
using System.Text.Json;

namespace PharMind.API.Services;

public class DynamicTableService
{
    private readonly PharMindDbContext _context;

    public DynamicTableService(PharMindDbContext context)
    {
        _context = context;
    }

    public async Task<(bool success, string message)> CrearTablaSQL(TablaMaestra tablaMaestra)
    {
        try
        {
            Console.WriteLine($"===== CrearTablaSQL for {tablaMaestra.NombreTabla} =====");

            // Validar nombre de tabla
            if (string.IsNullOrWhiteSpace(tablaMaestra.NombreTabla))
            {
                Console.WriteLine("Error: Nombre de tabla vacío");
                return (false, "El nombre de la tabla es requerido");
            }

            // Validar que no exista la tabla
            if (await TablaExiste(tablaMaestra.NombreTabla))
            {
                Console.WriteLine($"Error: Tabla '{tablaMaestra.NombreTabla}' ya existe");
                return (false, $"La tabla '{tablaMaestra.NombreTabla}' ya existe");
            }

            // Parsear columnas
            Console.WriteLine($"EsquemaColumnas JSON: {tablaMaestra.EsquemaColumnas}");
            var options = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            };
            var columnas = JsonSerializer.Deserialize<List<ColumnaDef>>(tablaMaestra.EsquemaColumnas, options);
            if (columnas == null || columnas.Count == 0)
            {
                Console.WriteLine("Error: No hay columnas definidas");
                return (false, "Debe definir al menos una columna");
            }
            Console.WriteLine($"Parsed {columnas.Count} columnas");

            // Validar que exista una columna con clave primaria
            if (!columnas.Any(c => c.EsClavePrimaria))
            {
                Console.WriteLine("No primary key found, adding default Id column");
                // Si no hay clave primaria, agregar columna Id automática
                columnas.Insert(0, new ColumnaDef
                {
                    Nombre = "Id",
                    Tipo = "nvarchar",
                    Longitud = 50,
                    EsRequerido = true,
                    EsClavePrimaria = true
                });
            }

            // Generar SQL
            var sql = GenerarCreateTableSQL(tablaMaestra.NombreTabla, columnas);
            Console.WriteLine($"Generated SQL: {sql}");

            // Ejecutar SQL
            Console.WriteLine("Executing SQL...");
            await _context.Database.ExecuteSqlRawAsync(sql);
            Console.WriteLine("SQL executed successfully");

            // Marcar como creada
            tablaMaestra.TablaCreada = true;

            return (true, "Tabla creada exitosamente");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Exception in CrearTablaSQL: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            return (false, $"Error al crear tabla: {ex.Message}");
        }
    }

    public async Task<(bool success, string message)> EliminarTablaSQL(string nombreTabla)
    {
        try
        {
            if (!await TablaExiste(nombreTabla))
            {
                return (false, $"La tabla '{nombreTabla}' no existe");
            }

            var sql = $"DROP TABLE [{nombreTabla}]";
            await _context.Database.ExecuteSqlRawAsync(sql);

            return (true, "Tabla eliminada exitosamente");
        }
        catch (Exception ex)
        {
            return (false, $"Error al eliminar tabla: {ex.Message}");
        }
    }

    public async Task<bool> TablaExiste(string nombreTabla)
    {
        try
        {
            var count = await _context.Database
                .SqlQuery<int>($"SELECT COUNT(*) as Value FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = {nombreTabla}")
                .FirstOrDefaultAsync();

            return count > 0;
        }
        catch
        {
            return false;
        }
    }

    public async Task<List<Dictionary<string, object>>> ObtenerDatosTabla(string nombreTabla)
    {
        var sql = $"SELECT * FROM [{nombreTabla}]";
        var data = new List<Dictionary<string, object>>();

        var connection = _context.Database.GetDbConnection();
        var shouldClose = connection.State == System.Data.ConnectionState.Closed;

        try
        {
            if (shouldClose)
            {
                await _context.Database.OpenConnectionAsync();
            }

            using var command = connection.CreateCommand();
            command.CommandText = sql;

            using var result = await command.ExecuteReaderAsync();

            while (await result.ReadAsync())
            {
                var row = new Dictionary<string, object>();
                for (int i = 0; i < result.FieldCount; i++)
                {
                    row[result.GetName(i)] = result.GetValue(i) ?? DBNull.Value;
                }
                data.Add(row);
            }

            return data;
        }
        finally
        {
            if (shouldClose && connection.State == System.Data.ConnectionState.Open)
            {
                await _context.Database.CloseConnectionAsync();
            }
        }
    }

    public async Task<(bool success, string message)> InsertarDato(string nombreTabla, Dictionary<string, object> datos)
    {
        Console.WriteLine($"===== InsertarDato called =====");
        Console.WriteLine($"Tabla: {nombreTabla}");
        Console.WriteLine($"Datos count: {datos.Count}");

        var connection = _context.Database.GetDbConnection();
        var shouldClose = connection.State == System.Data.ConnectionState.Closed;

        try
        {
            if (datos.Count == 0)
            {
                Console.WriteLine("Error: No hay datos");
                return (false, "No se proporcionaron datos");
            }

            // Log cada dato con su tipo
            foreach (var kvp in datos)
            {
                Console.WriteLine($"  Key: {kvp.Key}, Value: {kvp.Value}, Type: {kvp.Value?.GetType().Name ?? "null"}");
            }

            var columnas = string.Join(", ", datos.Keys.Select(k => $"[{k}]"));
            var parametros = string.Join(", ", datos.Keys.Select((k, i) => $"@p{i}"));

            var sql = $"INSERT INTO [{nombreTabla}] ({columnas}) VALUES ({parametros})";
            Console.WriteLine($"SQL: {sql}");

            if (shouldClose)
            {
                Console.WriteLine("Abriendo conexión...");
                await _context.Database.OpenConnectionAsync();
            }
            else
            {
                Console.WriteLine("Conexión ya estaba abierta");
            }

            using var command = connection.CreateCommand();
            command.CommandText = sql;

            int paramIndex = 0;
            foreach (var kvp in datos)
            {
                var param = command.CreateParameter();
                param.ParameterName = $"@p{paramIndex}";
                param.Value = kvp.Value ?? DBNull.Value;
                Console.WriteLine($"Parámetro @p{paramIndex}: {kvp.Key} = {kvp.Value} (Type: {kvp.Value?.GetType().Name ?? "DBNull"})");
                command.Parameters.Add(param);
                paramIndex++;
            }

            Console.WriteLine("Ejecutando ExecuteNonQueryAsync...");
            await command.ExecuteNonQueryAsync();
            Console.WriteLine("ExecuteNonQueryAsync completado exitosamente");

            return (true, "Dato insertado exitosamente");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"EXCEPCIÓN en InsertarDato: {ex.Message}");
            Console.WriteLine($"StackTrace: {ex.StackTrace}");
            if (ex.InnerException != null)
            {
                Console.WriteLine($"InnerException: {ex.InnerException.Message}");
            }
            return (false, $"Error al insertar dato: {ex.Message}");
        }
        finally
        {
            if (shouldClose && connection.State == System.Data.ConnectionState.Open)
            {
                Console.WriteLine("Cerrando conexión...");
                await _context.Database.CloseConnectionAsync();
            }
        }
    }

    public async Task<(bool success, string message)> ActualizarDato(string nombreTabla, string primaryKeyColumnName, string id, Dictionary<string, object> datos)
    {
        var connection = _context.Database.GetDbConnection();
        var shouldClose = connection.State == System.Data.ConnectionState.Closed;

        try
        {
            if (datos.Count == 0)
            {
                return (false, "No se proporcionaron datos");
            }

            var sets = string.Join(", ", datos.Keys.Select((k, i) => $"[{k}] = @p{i}"));
            var sql = $"UPDATE [{nombreTabla}] SET {sets} WHERE [{primaryKeyColumnName}] = @pId";

            if (shouldClose)
            {
                await _context.Database.OpenConnectionAsync();
            }

            using var command = connection.CreateCommand();
            command.CommandText = sql;

            int paramIndex = 0;
            foreach (var kvp in datos)
            {
                var param = command.CreateParameter();
                param.ParameterName = $"@p{paramIndex}";
                param.Value = kvp.Value ?? DBNull.Value;
                command.Parameters.Add(param);
                paramIndex++;
            }

            var idParam = command.CreateParameter();
            idParam.ParameterName = "@pId";
            idParam.Value = id;
            command.Parameters.Add(idParam);

            await command.ExecuteNonQueryAsync();

            return (true, "Dato actualizado exitosamente");
        }
        catch (Exception ex)
        {
            return (false, $"Error al actualizar dato: {ex.Message}");
        }
        finally
        {
            if (shouldClose && connection.State == System.Data.ConnectionState.Open)
            {
                await _context.Database.CloseConnectionAsync();
            }
        }
    }

    public async Task<(bool success, string message)> EliminarDato(string nombreTabla, string primaryKeyColumnName, string id)
    {
        var connection = _context.Database.GetDbConnection();
        var shouldClose = connection.State == System.Data.ConnectionState.Closed;

        try
        {
            var sql = $"DELETE FROM [{nombreTabla}] WHERE [{primaryKeyColumnName}] = @pId";

            if (shouldClose)
            {
                await _context.Database.OpenConnectionAsync();
            }

            using var command = connection.CreateCommand();
            command.CommandText = sql;

            var idParam = command.CreateParameter();
            idParam.ParameterName = "@pId";
            idParam.Value = id;
            command.Parameters.Add(idParam);

            await command.ExecuteNonQueryAsync();

            return (true, "Dato eliminado exitosamente");
        }
        catch (Exception ex)
        {
            return (false, $"Error al eliminar dato: {ex.Message}");
        }
        finally
        {
            if (shouldClose && connection.State == System.Data.ConnectionState.Open)
            {
                await _context.Database.CloseConnectionAsync();
            }
        }
    }

    private string GenerarCreateTableSQL(string nombreTabla, List<ColumnaDef> columnas)
    {
        // Validar que todas las columnas tengan nombre
        var columnasInvalidas = columnas.Where(c => string.IsNullOrWhiteSpace(c.Nombre)).ToList();
        if (columnasInvalidas.Any())
        {
            throw new ArgumentException("Todas las columnas deben tener un nombre válido");
        }

        var sb = new StringBuilder();
        sb.Append($"CREATE TABLE [{nombreTabla}] (");

        var columnDefinitions = new List<string>();

        foreach (var col in columnas)
        {
            // Limpiar y validar el nombre de la columna
            var nombreColumna = col.Nombre.Trim();
            if (string.IsNullOrWhiteSpace(nombreColumna))
            {
                continue; // Saltar columnas sin nombre
            }

            var def = new StringBuilder($"[{nombreColumna}] ");

            // Tipo de dato
            switch (col.Tipo?.ToLower() ?? "nvarchar")
            {
                case "nvarchar":
                    def.Append($"NVARCHAR({col.Longitud ?? 255})");
                    break;
                case "int":
                    def.Append("INT");
                    break;
                case "bit":
                    def.Append("BIT");
                    break;
                case "datetime":
                    def.Append("DATETIME2");
                    break;
                case "decimal":
                    def.Append($"DECIMAL({col.Longitud ?? 18},2)");
                    break;
                default:
                    def.Append($"NVARCHAR({col.Longitud ?? 255})");
                    break;
            }

            // Requerido (las claves primarias siempre son NOT NULL)
            if (col.EsRequerido || col.EsClavePrimaria)
            {
                def.Append(" NOT NULL");
            }
            else
            {
                def.Append(" NULL");
            }

            // Valor por defecto
            if (!string.IsNullOrWhiteSpace(col.ValorPorDefecto))
            {
                def.Append($" DEFAULT {col.ValorPorDefecto}");
            }

            columnDefinitions.Add(def.ToString());
        }

        if (columnDefinitions.Count == 0)
        {
            throw new ArgumentException("Debe definir al menos una columna válida");
        }

        sb.Append(string.Join(", ", columnDefinitions));

        // Clave primaria
        var pkColumn = columnas.FirstOrDefault(c => c.EsClavePrimaria && !string.IsNullOrWhiteSpace(c.Nombre));
        if (pkColumn != null)
        {
            sb.Append($", CONSTRAINT [PK_{nombreTabla}] PRIMARY KEY ([{pkColumn.Nombre.Trim()}])");
        }

        // Índices únicos
        var uniqueColumns = columnas.Where(c => c.EsUnico && !c.EsClavePrimaria && !string.IsNullOrWhiteSpace(c.Nombre)).ToList();
        foreach (var col in uniqueColumns)
        {
            sb.Append($", CONSTRAINT [UQ_{nombreTabla}_{col.Nombre.Trim()}] UNIQUE ([{col.Nombre.Trim()}])");
        }

        sb.Append(")");

        return sb.ToString();
    }
}
