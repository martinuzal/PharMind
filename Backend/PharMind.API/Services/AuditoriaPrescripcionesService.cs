using System.IO.Compression;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;
using PharMind.API.Data;
using PharMind.API.Models;
using PharMind.API.Hubs;

namespace PharMind.API.Services
{
    public class ProcessResult
    {
        public bool Success { get; set; }
        public int RegistrosProcesados { get; set; }
        public int RegistrosExitosos { get; set; }
        public int RegistrosError { get; set; }
        public List<string> Errores { get; set; } = new();
        public Dictionary<string, int> RegistrosPorArchivo { get; set; } = new();
    }

    public interface IAuditoriaPrescripcionesService
    {
        Task<ProcessResult> ProcessAuditoriaZipAsync(string zipFilePath, string uploadId);
    }

    public class AuditoriaPrescripcionesService : IAuditoriaPrescripcionesService
    {
        private readonly PharMindDbContext _context;
        private readonly ILogger<AuditoriaPrescripcionesService> _logger;
        private readonly IWebHostEnvironment _environment;
        private readonly IHubContext<ImportProgressHub> _hubContext;
        private readonly IProcessLogService _processLogService;

        // Mapeo de archivos TXT a tablas SQL
        private readonly Dictionary<string, string> FileTableMapping = new()
        {
            { "01_BEB_MERCADOS.TXT", "auditMercados" },
            { "AUDIT_CATEGORY.TXT", "auditCategory" },
            { "AUDIT_CUSTOMER.TXT", "auditCustomer" },
            { "AUDIT_PERIOD.TXT", "auditPeriod" },
            { "AUDIT_PRODUCT_CLASS.TXT", "audotProductClass" },
            { "MARKET_01_MARCAS.TXT", "auditMarketMarcas" }
        };

        public AuditoriaPrescripcionesService(
            PharMindDbContext context,
            ILogger<AuditoriaPrescripcionesService> logger,
            IWebHostEnvironment environment,
            IHubContext<ImportProgressHub> hubContext,
            IProcessLogService processLogService)
        {
            _context = context;
            _logger = logger;
            _environment = environment;
            _hubContext = hubContext;
            _processLogService = processLogService;
        }

        public async Task<ProcessResult> ProcessAuditoriaZipAsync(string zipFilePath, string uploadId)
        {
            var result = new ProcessResult { Success = true };
            string tempDirectory = Path.Combine(_environment.ContentRootPath, "Uploads", "Temp", uploadId);

            try
            {
                // 1. Crear directorio temporal
                await _processLogService.LogInfoAsync(uploadId, "Iniciando procesamiento de auditoría", $"Archivo: {Path.GetFileName(zipFilePath)}");

                Directory.CreateDirectory(tempDirectory);
                _logger.LogInformation("Created temp directory: {TempDir}", tempDirectory);
                await _processLogService.LogInfoAsync(uploadId, "Directorio temporal creado", tempDirectory);

                _logger.LogInformation("📡 Sending SignalR message: Creating temp directory for uploadId: {UploadId}", uploadId);
                await _hubContext.Clients.All.SendAsync("ImportProgress", new ImportProgressUpdate
                {
                    UploadId = uploadId,
                    Status = "processing",
                    Message = "Creando directorio temporal...",
                    Logs = new List<string> { $"✅ Directorio temporal creado" }
                });
                _logger.LogInformation("📡 SignalR message sent successfully");

                // 2. Descomprimir ZIP
                _logger.LogInformation("Extracting ZIP file: {ZipPath}", zipFilePath);
                await _processLogService.LogInfoAsync(uploadId, "Extrayendo archivo ZIP", Path.GetFileName(zipFilePath));

                await _hubContext.Clients.All.SendAsync("ImportProgress", new ImportProgressUpdate
                {
                    UploadId = uploadId,
                    Status = "processing",
                    Message = "Extrayendo archivo ZIP...",
                    Logs = new List<string> { $"📦 Extrayendo ZIP: {Path.GetFileName(zipFilePath)}" }
                });
                ZipFile.ExtractToDirectory(zipFilePath, tempDirectory, true);
                await _processLogService.LogInfoAsync(uploadId, "ZIP extraído exitosamente");

                // 3. Verificar que existan los archivos esperados
                var extractedFiles = Directory.GetFiles(tempDirectory, "*.txt", SearchOption.TopDirectoryOnly)
                    .Select(f => Path.GetFileName(f).ToUpper())
                    .ToList();

                _logger.LogInformation("Found {Count} TXT files in ZIP", extractedFiles.Count);
                await _processLogService.LogInfoAsync(uploadId, $"Encontrados {extractedFiles.Count} archivos TXT", string.Join(", ", extractedFiles));

                await _hubContext.Clients.All.SendAsync("ImportProgress", new ImportProgressUpdate
                {
                    UploadId = uploadId,
                    Status = "processing",
                    Message = $"Encontrados {extractedFiles.Count} archivos TXT",
                    Logs = new List<string> { $"📄 Archivos encontrados: {extractedFiles.Count}" }
                });

                // 4. Procesar cada archivo según el mapeo definido
                // AUDIT_CATEGORY.TXT es el más grande, se procesa al final para ver mejor el progreso
                var processOrder = new[]
                {
                    "01_BEB_MERCADOS.TXT",
                    "AUDIT_CUSTOMER.TXT",
                    "AUDIT_PERIOD.TXT",
                    "AUDIT_PRODUCT_CLASS.TXT",
                    "MARKET_01_MARCAS.TXT",
                    "AUDIT_CATEGORY.TXT"  // Procesado al final por ser el más grande
                };

                int fileIndex = 0;
                foreach (var fileName in processOrder)
                {
                    fileIndex++;
                    var filePath = Path.Combine(tempDirectory, fileName);

                    await _processLogService.LogInfoAsync(uploadId, $"Iniciando procesamiento de archivo {fileIndex}/{processOrder.Length}", fileName);

                    // Enviar progreso: iniciando archivo
                    await _hubContext.Clients.All.SendAsync("ImportProgress", new ImportProgressUpdate
                    {
                        UploadId = uploadId,
                        TotalFiles = processOrder.Length,
                        ProcessedFiles = fileIndex - 1,
                        CurrentFile = fileName,
                        CurrentFileProgress = 0,
                        Status = "processing",
                        Message = $"Procesando {fileName}...",
                        Logs = new List<string> { $"🔄 Iniciando procesamiento de {fileName}" }
                    });

                    if (!File.Exists(filePath))
                    {
                        _logger.LogWarning("Expected file not found: {FileName}", fileName);
                        await _processLogService.LogWarningAsync(uploadId, $"Archivo no encontrado: {fileName}");

                        result.Errores.Add($"Archivo esperado no encontrado: {fileName}");
                        await _hubContext.Clients.All.SendAsync("ImportProgress", new ImportProgressUpdate
                        {
                            UploadId = uploadId,
                            TotalFiles = processOrder.Length,
                            ProcessedFiles = fileIndex,
                            CurrentFile = fileName,
                            CurrentFileProgress = 100,
                            Status = "processing",
                            Message = $"Archivo {fileName} no encontrado",
                            Logs = new List<string> { $"⚠️ Archivo no encontrado: {fileName}" }
                        });
                        continue;
                    }

                    try
                    {
                        var fileResult = await ProcessFileAsync(filePath, fileName, uploadId);
                        result.RegistrosProcesados += fileResult.RegistrosProcesados;
                        result.RegistrosExitosos += fileResult.RegistrosExitosos;
                        result.RegistrosError += fileResult.RegistrosError;
                        result.RegistrosPorArchivo[fileName] = fileResult.RegistrosExitosos;
                        result.Errores.AddRange(fileResult.Errores);

                        _logger.LogInformation(
                            "Processed {FileName}: {Success}/{Total} records",
                            fileName, fileResult.RegistrosExitosos, fileResult.RegistrosProcesados
                        );

                        await _processLogService.LogInfoAsync(uploadId,
                            $"Archivo {fileName} procesado exitosamente",
                            $"Total: {fileResult.RegistrosProcesados}, Exitosos: {fileResult.RegistrosExitosos}, Errores: {fileResult.RegistrosError}");

                        // Después de procesar el archivo exitosamente
                        await _hubContext.Clients.All.SendAsync("ImportProgress", new ImportProgressUpdate
                        {
                            UploadId = uploadId,
                            TotalFiles = processOrder.Length,
                            ProcessedFiles = fileIndex,
                            CurrentFile = fileName,
                            CurrentFileProgress = 100,
                            Status = "processing",
                            Message = $"Completado {fileName}: {fileResult.RegistrosExitosos} registros",
                            Logs = new List<string>
                            {
                                $"✅ {fileName} completado",
                                $"   📊 Total líneas: {fileResult.RegistrosProcesados}",
                                $"   ✅ Exitosos: {fileResult.RegistrosExitosos}",
                                $"   ❌ Errores: {fileResult.RegistrosError}"
                            }
                        });
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error processing file: {FileName}", fileName);
                        await _processLogService.LogErrorAsync(uploadId, $"Error procesando {fileName}", ex.ToString());

                        result.Errores.Add($"Error procesando {fileName}: {ex.Message}");
                        result.Success = false;

                        // Enviar error en este archivo
                        await _hubContext.Clients.All.SendAsync("ImportProgress", new ImportProgressUpdate
                        {
                            UploadId = uploadId,
                            TotalFiles = processOrder.Length,
                            ProcessedFiles = fileIndex,
                            CurrentFile = fileName,
                            CurrentFileProgress = 100,
                            Status = "error",
                            Message = $"Error en {fileName}: {ex.Message}",
                            Logs = new List<string> { $"❌ Error en {fileName}: {ex.Message}" }
                        });
                    }
                }

                // Al final del try, enviar completado
                await _processLogService.LogInfoAsync(uploadId,
                    "Procesamiento completado",
                    $"Total: {result.RegistrosProcesados}, Exitosos: {result.RegistrosExitosos}, Errores: {result.RegistrosError}");

                var finalLogs = new List<string>
                {
                    "🎉 Procesamiento completado",
                    $"📊 Total registros procesados: {result.RegistrosProcesados}",
                    $"✅ Exitosos: {result.RegistrosExitosos}",
                    $"❌ Errores: {result.RegistrosError}"
                };

                if (result.Errores.Any())
                {
                    finalLogs.Add("⚠️ Errores encontrados:");
                    finalLogs.AddRange(result.Errores.Take(5).Select(e => $"   • {e}"));
                    if (result.Errores.Count > 5)
                    {
                        finalLogs.Add($"   ... y {result.Errores.Count - 5} errores más");
                    }
                }

                await _hubContext.Clients.All.SendAsync("ImportProgress", new ImportProgressUpdate
                {
                    UploadId = uploadId,
                    TotalFiles = processOrder.Length,
                    ProcessedFiles = processOrder.Length,
                    CurrentFile = "",
                    CurrentFileProgress = 100,
                    Status = result.Success ? "completed" : "completed_with_errors",
                    Message = result.Success ? "Importación completada exitosamente" : "Importación completada con errores",
                    FileResults = result.RegistrosPorArchivo,
                    Logs = finalLogs
                });

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing auditoria ZIP");
                await _processLogService.LogErrorAsync(uploadId, "Error crítico durante procesamiento", ex.ToString());

                result.Success = false;
                result.Errores.Add($"Error general: {ex.Message}");
                return result;
            }
            finally
            {
                // Limpiar archivos temporales
                try
                {
                    if (Directory.Exists(tempDirectory))
                    {
                        Directory.Delete(tempDirectory, true);
                        _logger.LogInformation("Cleaned up temp directory: {TempDir}", tempDirectory);
                        await _processLogService.LogInfoAsync(uploadId, "Directorio temporal limpiado");
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to clean up temp directory: {TempDir}", tempDirectory);
                    await _processLogService.LogWarningAsync(uploadId, "No se pudo limpiar directorio temporal", ex.Message);
                }
            }
        }

        private async Task<ProcessResult> ProcessFileAsync(string filePath, string fileName, string uploadId)
        {
            var result = new ProcessResult();

            // Detectar encoding (puede ser UTF-8, Latin1, etc.)
            var encoding = DetectEncoding(filePath);
            var lines = await File.ReadAllLinesAsync(filePath, encoding);

            result.RegistrosProcesados = lines.Length;

            switch (fileName.ToUpper())
            {
                case "01_BEB_MERCADOS.TXT":
                    result = await ProcessMercadosAsync(lines, uploadId, fileName);
                    break;
                case "AUDIT_CATEGORY.TXT":
                    result = await ProcessCategoriasAsync(lines, uploadId, fileName);
                    break;
                case "AUDIT_CUSTOMER.TXT":
                    result = await ProcessClientesAsync(lines, uploadId, fileName);
                    break;
                case "AUDIT_PERIOD.TXT":
                    result = await ProcessPeriodosAsync(lines, uploadId, fileName);
                    break;
                case "AUDIT_PRODUCT_CLASS.TXT":
                    result = await ProcessClasesProductoAsync(lines, uploadId, fileName);
                    break;
                case "MARKET_01_MARCAS.TXT":
                    result = await ProcessMarcasAsync(lines, uploadId, fileName);
                    break;
                default:
                    result.Errores.Add($"Archivo no reconocido: {fileName}");
                    break;
            }

            return result;
        }

        private Encoding DetectEncoding(string filePath)
        {
            // Leer los primeros bytes para detectar BOM
            using var reader = new StreamReader(filePath, true);
            reader.Peek(); // Detecta automáticamente encoding
            return reader.CurrentEncoding;
        }

        // ============================================
        // MÉTODOS DE PROCESAMIENTO POR TIPO DE ARCHIVO
        // ============================================

        private async Task<ProcessResult> ProcessMercadosAsync(string[] lines, string uploadId, string fileName)
        {
            var result = new ProcessResult();
            result.RegistrosProcesados = lines.Length;

            try
            {
                // 1. Truncar tabla anterior
                await _context.Database.ExecuteSqlRawAsync("DELETE FROM auditMercados");
                _logger.LogInformation("Cleared auditMercados table");

                // 2. Skip header row and parse data
                var mercados = new List<AuditMercado>();
                const int batchSize = 10000;
                int totalInserted = 0;
                int totalLines = lines.Length - 1;

                for (int i = 1; i < lines.Length; i++) // Skip header (line 0)
                {
                    try
                    {
                        var fields = lines[i].Split('|');
                        if (fields.Length < 15)
                        {
                            result.Errores.Add($"Línea {i + 1}: Formato inválido, esperados 15 campos, encontrados {fields.Length}");
                            result.RegistrosError++;
                            continue;
                        }

                        var mercado = new AuditMercado
                        {
                            CdgUsuario = fields[0],
                            CdgPais = fields[1],
                            CdgMercado = fields[2],
                            Descripcion = fields[3],
                            Closeup = fields[4],
                            Audit = fields[5],
                            Feedback = fields[6],
                            Recetario = fields[7],
                            Generado = fields[8],
                            Controlado = fields[9],
                            Abreviatura = fields[10],
                            CdgLabora = fields[11],
                            Edicion = fields[12],
                            FechaHoraProc = fields[13],
                            Path = fields[14]
                        };

                        mercados.Add(mercado);

                        // Guardar cada lote
                        if (mercados.Count >= batchSize)
                        {
                            await _context.AuditMercados.AddRangeAsync(mercados);
                            await _context.SaveChangesAsync();
                            totalInserted += mercados.Count;
                            _logger.LogInformation("Inserted batch of {Count} mercados. Total: {Total}", mercados.Count, totalInserted);

                            // Enviar progreso por SignalR
                            var progress = (int)((totalInserted * 100.0) / totalLines);
                            _logger.LogInformation("🔔 Enviando mensaje SignalR: UploadId={UploadId}, File={File}, Progress={Progress}%", uploadId, fileName, progress);
                            await _hubContext.Clients.All.SendAsync("ImportProgress", new ImportProgressUpdate
                            {
                                UploadId = uploadId,
                                CurrentFile = fileName,
                                CurrentFileProgress = progress,
                                Status = "processing",
                                Message = $"Procesando {fileName}: {totalInserted:N0}/{totalLines:N0} registros ({progress}%)",
                                Logs = new List<string> { $"📊 {fileName}: {totalInserted:N0} registros guardados" }
                            });
                            _logger.LogInformation("✅ Mensaje SignalR enviado exitosamente");

                            mercados.Clear();
                        }
                    }
                    catch (Exception ex)
                    {
                        result.Errores.Add($"Línea {i + 1}: Error parseando - {ex.Message}");
                        result.RegistrosError++;
                    }
                }

                // 3. Bulk insert final batch
                if (mercados.Any())
                {
                    await _context.AuditMercados.AddRangeAsync(mercados);
                    await _context.SaveChangesAsync();
                    totalInserted += mercados.Count;
                    _logger.LogInformation("Inserted final batch of {Count} mercados. Total: {Total}", mercados.Count, totalInserted);

                    // Enviar progreso final por SignalR
                    _logger.LogInformation("🔔 Enviando mensaje SignalR FINAL: UploadId={UploadId}, File={File}", uploadId, fileName);
                    await _hubContext.Clients.All.SendAsync("ImportProgress", new ImportProgressUpdate
                    {
                        UploadId = uploadId,
                        CurrentFile = fileName,
                        CurrentFileProgress = 100,
                        Status = "processing",
                        Message = $"{fileName} completado: {totalInserted:N0} registros",
                        Logs = new List<string> { $"✅ {fileName}: {totalInserted:N0} registros totales" }
                    });
                    _logger.LogInformation("✅ Mensaje SignalR FINAL enviado exitosamente");
                }

                result.RegistrosExitosos = totalInserted;

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing mercados");
                result.Errores.Add($"Error general: {ex.Message}");
                return result;
            }
        }

        private async Task<ProcessResult> ProcessCategoriasAsync(string[] lines, string uploadId, string fileName)
        {
            var result = new ProcessResult();
            result.RegistrosProcesados = lines.Length;

            try
            {
                await _context.Database.ExecuteSqlRawAsync("DELETE FROM auditCategory");
                _logger.LogInformation("Cleared auditCategory table");

                if (lines.Length < 2)
                {
                    result.Errores.Add("Archivo vacío o sin datos");
                    return result;
                }

                // Read headers from first line
                var headers = lines[0].Split('|').Select(h => h.Trim().ToUpper()).ToArray();

                var categorias = new List<AuditCategory>();
                const int batchSize = 10000; // Procesar en lotes de 10,000 registros
                int totalInserted = 0;
                int totalLines = lines.Length - 1; // Excluir header

                for (int i = 1; i < lines.Length; i++)
                {
                    try
                    {
                        var fields = lines[i].Split('|');
                        var categoria = new AuditCategory
                        {
                            RawData = lines[i]
                        };

                        // Dynamic mapping: header names match property names exactly
                        // Headers: CDG_PERUSER|CDGMED_REG|CDG_MERCADO|CDGREG_PMIX|CAT|PX_MER|PX_LAB|MER_MS|CDG_RAIZ|PX|PX_MS
                        var properties = typeof(AuditCategory).GetProperties();
                        for (int j = 0; j < Math.Min(headers.Length, fields.Length); j++)
                        {
                            var value = fields[j].Trim();
                            if (string.IsNullOrWhiteSpace(value)) continue;

                            var property = properties.FirstOrDefault(p => p.Name == headers[j]);
                            if (property != null && property.CanWrite)
                            {
                                property.SetValue(categoria, value);
                            }
                        }

                        categorias.Add(categoria);

                        // Guardar cada lote
                        if (categorias.Count >= batchSize)
                        {
                            await _context.AuditCategories.AddRangeAsync(categorias);
                            await _context.SaveChangesAsync();
                            totalInserted += categorias.Count;
                            _logger.LogInformation("Inserted batch of {Count} categorías. Total: {Total}", categorias.Count, totalInserted);

                            // Enviar progreso por SignalR
                            var progress = (int)((totalInserted * 100.0) / totalLines);
                            _logger.LogInformation("🔔 Enviando mensaje SignalR: UploadId={UploadId}, File={File}, Progress={Progress}%", uploadId, fileName, progress);
                            await _hubContext.Clients.All.SendAsync("ImportProgress", new ImportProgressUpdate
                            {
                                UploadId = uploadId,
                                CurrentFile = fileName,
                                CurrentFileProgress = progress,
                                Status = "processing",
                                Message = $"Procesando {fileName}: {totalInserted:N0}/{totalLines:N0} registros ({progress}%)",
                                Logs = new List<string> { $"📊 {fileName}: {totalInserted:N0} registros guardados" }
                            });
                            _logger.LogInformation("✅ Mensaje SignalR enviado exitosamente");

                            categorias.Clear();
                        }
                    }
                    catch (Exception ex)
                    {
                        result.Errores.Add($"Línea {i + 1}: {ex.Message}");
                        result.RegistrosError++;
                    }
                }

                // Guardar el último lote si quedaron registros
                if (categorias.Any())
                {
                    await _context.AuditCategories.AddRangeAsync(categorias);
                    await _context.SaveChangesAsync();
                    totalInserted += categorias.Count;
                    _logger.LogInformation("Inserted final batch of {Count} categorías. Total: {Total}", categorias.Count, totalInserted);

                    // Enviar progreso final
                    await _hubContext.Clients.All.SendAsync("ImportProgress", new ImportProgressUpdate
                    {
                        UploadId = uploadId,
                        CurrentFile = fileName,
                        CurrentFileProgress = 100,
                        Status = "processing",
                        Message = $"{fileName} completado: {totalInserted:N0} registros",
                        Logs = new List<string> { $"✅ {fileName}: {totalInserted:N0} registros totales" }
                    });
                }

                result.RegistrosExitosos = totalInserted;

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing categorías");
                result.Errores.Add($"Error general: {ex.Message}");
                return result;
            }
        }

        private async Task<ProcessResult> ProcessClientesAsync(string[] lines, string uploadId, string fileName)
        {
            var result = new ProcessResult();
            result.RegistrosProcesados = lines.Length;

            try
            {
                await _context.Database.ExecuteSqlRawAsync("DELETE FROM auditCustomer");
                _logger.LogInformation("Cleared auditCustomer table");

                if (lines.Length < 2)
                {
                    result.Errores.Add("Archivo vacío o sin datos");
                    return result;
                }

                // Read headers from first line
                var headers = lines[0].Split('|').Select(h => h.Trim().ToUpper()).ToArray();

                var clientes = new List<AuditCustomer>();
                const int batchSize = 10000; // Procesar en lotes de 10,000 registros
                int totalInserted = 0;
                int totalLines = lines.Length - 1;

                for (int i = 1; i < lines.Length; i++)
                {
                    try
                    {
                        var fields = lines[i].Split('|');
                        var cliente = new AuditCustomer
                        {
                            RawData = lines[i]
                        };

                        // Dynamic mapping: header names match property names exactly
                        // Headers: CDGMED_REG|CRM|NOME|BLANK|CDGESP1|CDGESP2|CDGREG_PMIX|LOCAL|BAIRRO|CEP|CDGMED_VIS
                        var properties = typeof(AuditCustomer).GetProperties();
                        for (int j = 0; j < Math.Min(headers.Length, fields.Length); j++)
                        {
                            var value = fields[j].Trim();
                            if (string.IsNullOrWhiteSpace(value)) continue;

                            var property = properties.FirstOrDefault(p => p.Name == headers[j]);
                            if (property != null && property.CanWrite)
                            {
                                property.SetValue(cliente, value);
                            }
                        }

                        clientes.Add(cliente);

                        // Guardar cada lote
                        if (clientes.Count >= batchSize)
                        {
                            await _context.AuditCustomers.AddRangeAsync(clientes);
                            await _context.SaveChangesAsync();
                            totalInserted += clientes.Count;
                            _logger.LogInformation("Inserted batch of {Count} clientes. Total: {Total}", clientes.Count, totalInserted);

                            // Enviar progreso por SignalR
                            var progress = (int)((totalInserted * 100.0) / totalLines);
                            _logger.LogInformation("🔔 Enviando mensaje SignalR: UploadId={UploadId}, File={File}, Progress={Progress}%", uploadId, fileName, progress);
                            await _hubContext.Clients.All.SendAsync("ImportProgress", new ImportProgressUpdate
                            {
                                UploadId = uploadId,
                                CurrentFile = fileName,
                                CurrentFileProgress = progress,
                                Status = "processing",
                                Message = $"Procesando {fileName}: {totalInserted:N0}/{totalLines:N0} registros ({progress}%)",
                                Logs = new List<string> { $"📊 {fileName}: {totalInserted:N0} registros guardados" }
                            });
                            _logger.LogInformation("✅ Mensaje SignalR enviado exitosamente");

                            clientes.Clear();
                        }
                    }
                    catch (Exception ex)
                    {
                        result.Errores.Add($"Línea {i + 1}: {ex.Message}");
                        result.RegistrosError++;
                    }
                }

                // Guardar el último lote si quedaron registros
                if (clientes.Any())
                {
                    await _context.AuditCustomers.AddRangeAsync(clientes);
                    await _context.SaveChangesAsync();
                    totalInserted += clientes.Count;
                    _logger.LogInformation("Inserted final batch of {Count} clientes. Total: {Total}", clientes.Count, totalInserted);

                    // Enviar progreso final por SignalR
                    _logger.LogInformation("🔔 Enviando mensaje SignalR FINAL: UploadId={UploadId}, File={File}", uploadId, fileName);
                    await _hubContext.Clients.All.SendAsync("ImportProgress", new ImportProgressUpdate
                    {
                        UploadId = uploadId,
                        CurrentFile = fileName,
                        CurrentFileProgress = 100,
                        Status = "processing",
                        Message = $"{fileName} completado: {totalInserted:N0} registros",
                        Logs = new List<string> { $"✅ {fileName}: {totalInserted:N0} registros totales" }
                    });
                    _logger.LogInformation("✅ Mensaje SignalR FINAL enviado exitosamente");
                }

                result.RegistrosExitosos = totalInserted;

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing clientes");
                result.Errores.Add($"Error general: {ex.Message}");
                return result;
            }
        }

        private async Task<ProcessResult> ProcessPeriodosAsync(string[] lines, string uploadId, string fileName)
        {
            var result = new ProcessResult();
            result.RegistrosProcesados = lines.Length;

            try
            {
                await _context.Database.ExecuteSqlRawAsync("DELETE FROM auditPeriod");
                _logger.LogInformation("Cleared auditPeriod table");

                if (lines.Length < 2)
                {
                    result.Errores.Add("Archivo vacío o sin datos");
                    return result;
                }

                // Read headers from first line
                var headers = lines[0].Split('|').Select(h => h.Trim().ToUpper()).ToArray();

                var periodos = new List<AuditPeriod>();
                const int batchSize = 10000;
                int totalInserted = 0;
                int totalLines = lines.Length - 1;

                for (int i = 1; i < lines.Length; i++)
                {
                    try
                    {
                        var fields = lines[i].Split('|');
                        var periodo = new AuditPeriod
                        {
                            RawData = lines[i]
                        };

                        // Dynamic mapping: header names match property names exactly
                        // Headers: CDG_PERUSER|DESC|BLANK
                        var properties = typeof(AuditPeriod).GetProperties();
                        for (int j = 0; j < Math.Min(headers.Length, fields.Length); j++)
                        {
                            var value = fields[j].Trim();
                            if (string.IsNullOrWhiteSpace(value)) continue;

                            var property = properties.FirstOrDefault(p => p.Name == headers[j]);
                            if (property != null && property.CanWrite)
                            {
                                property.SetValue(periodo, value);
                            }
                        }

                        periodos.Add(periodo);

                        // Guardar cada lote
                        if (periodos.Count >= batchSize)
                        {
                            await _context.AuditPeriods.AddRangeAsync(periodos);
                            await _context.SaveChangesAsync();
                            totalInserted += periodos.Count;
                            _logger.LogInformation("Inserted batch of {Count} períodos. Total: {Total}", periodos.Count, totalInserted);

                            // Enviar progreso por SignalR
                            var progress = (int)((totalInserted * 100.0) / totalLines);
                            _logger.LogInformation("🔔 Enviando mensaje SignalR: UploadId={UploadId}, File={File}, Progress={Progress}%", uploadId, fileName, progress);
                            await _hubContext.Clients.All.SendAsync("ImportProgress", new ImportProgressUpdate
                            {
                                UploadId = uploadId,
                                CurrentFile = fileName,
                                CurrentFileProgress = progress,
                                Status = "processing",
                                Message = $"Procesando {fileName}: {totalInserted:N0}/{totalLines:N0} registros ({progress}%)",
                                Logs = new List<string> { $"📊 {fileName}: {totalInserted:N0} registros guardados" }
                            });
                            _logger.LogInformation("✅ Mensaje SignalR enviado exitosamente");

                            periodos.Clear();
                        }
                    }
                    catch (Exception ex)
                    {
                        result.Errores.Add($"Línea {i + 1}: {ex.Message}");
                        result.RegistrosError++;
                    }
                }

                if (periodos.Any())
                {
                    await _context.AuditPeriods.AddRangeAsync(periodos);
                    await _context.SaveChangesAsync();
                    totalInserted += periodos.Count;
                    _logger.LogInformation("Inserted final batch of {Count} períodos. Total: {Total}", periodos.Count, totalInserted);

                    // Enviar progreso final por SignalR
                    _logger.LogInformation("🔔 Enviando mensaje SignalR FINAL: UploadId={UploadId}, File={File}", uploadId, fileName);
                    await _hubContext.Clients.All.SendAsync("ImportProgress", new ImportProgressUpdate
                    {
                        UploadId = uploadId,
                        CurrentFile = fileName,
                        CurrentFileProgress = 100,
                        Status = "processing",
                        Message = $"{fileName} completado: {totalInserted:N0} registros",
                        Logs = new List<string> { $"✅ {fileName}: {totalInserted:N0} registros totales" }
                    });
                    _logger.LogInformation("✅ Mensaje SignalR FINAL enviado exitosamente");
                }

                result.RegistrosExitosos = totalInserted;

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing períodos");
                result.Errores.Add($"Error general: {ex.Message}");
                return result;
            }
        }

        private async Task<ProcessResult> ProcessClasesProductoAsync(string[] lines, string uploadId, string fileName)
        {
            var result = new ProcessResult();
            result.RegistrosProcesados = lines.Length;

            try
            {
                await _context.Database.ExecuteSqlRawAsync("DELETE FROM audotProductClass");
                _logger.LogInformation("Cleared audotProductClass table");

                if (lines.Length < 2)
                {
                    result.Errores.Add("Archivo vacío o sin datos");
                    return result;
                }

                // Read headers from first line
                var headers = lines[0].Split('|').Select(h => h.Trim().ToUpper()).ToArray();

                var clases = new List<AuditProductClass>();
                const int batchSize = 10000;
                int totalInserted = 0;
                int totalLines = lines.Length - 1;

                for (int i = 1; i < lines.Length; i++)
                {
                    try
                    {
                        var fields = lines[i].Split('|');
                        var clase = new AuditProductClass
                        {
                            RawData = lines[i]
                        };

                        // Dynamic mapping: header names match property names exactly
                        // Headers: CODIGO_PMIX|CDG_MERCADO
                        var properties = typeof(AuditProductClass).GetProperties();
                        for (int j = 0; j < Math.Min(headers.Length, fields.Length); j++)
                        {
                            var value = fields[j].Trim();
                            if (string.IsNullOrWhiteSpace(value)) continue;

                            var property = properties.FirstOrDefault(p => p.Name == headers[j]);
                            if (property != null && property.CanWrite)
                            {
                                property.SetValue(clase, value);
                            }
                        }

                        clases.Add(clase);

                        // Guardar cada lote
                        if (clases.Count >= batchSize)
                        {
                            await _context.AuditProductClasses.AddRangeAsync(clases);
                            await _context.SaveChangesAsync();
                            totalInserted += clases.Count;
                            _logger.LogInformation("Inserted batch of {Count} clases. Total: {Total}", clases.Count, totalInserted);

                            // Enviar progreso por SignalR
                            var progress = (int)((totalInserted * 100.0) / totalLines);
                            _logger.LogInformation("🔔 Enviando mensaje SignalR: UploadId={UploadId}, File={File}, Progress={Progress}%", uploadId, fileName, progress);
                            await _hubContext.Clients.All.SendAsync("ImportProgress", new ImportProgressUpdate
                            {
                                UploadId = uploadId,
                                CurrentFile = fileName,
                                CurrentFileProgress = progress,
                                Status = "processing",
                                Message = $"Procesando {fileName}: {totalInserted:N0}/{totalLines:N0} registros ({progress}%)",
                                Logs = new List<string> { $"📊 {fileName}: {totalInserted:N0} registros guardados" }
                            });
                            _logger.LogInformation("✅ Mensaje SignalR enviado exitosamente");

                            clases.Clear();
                        }
                    }
                    catch (Exception ex)
                    {
                        result.Errores.Add($"Línea {i + 1}: {ex.Message}");
                        result.RegistrosError++;
                    }
                }

                if (clases.Any())
                {
                    await _context.AuditProductClasses.AddRangeAsync(clases);
                    await _context.SaveChangesAsync();
                    totalInserted += clases.Count;
                    _logger.LogInformation("Inserted final batch of {Count} clases. Total: {Total}", clases.Count, totalInserted);

                    // Enviar progreso final por SignalR
                    _logger.LogInformation("🔔 Enviando mensaje SignalR FINAL: UploadId={UploadId}, File={File}", uploadId, fileName);
                    await _hubContext.Clients.All.SendAsync("ImportProgress", new ImportProgressUpdate
                    {
                        UploadId = uploadId,
                        CurrentFile = fileName,
                        CurrentFileProgress = 100,
                        Status = "processing",
                        Message = $"{fileName} completado: {totalInserted:N0} registros",
                        Logs = new List<string> { $"✅ {fileName}: {totalInserted:N0} registros totales" }
                    });
                    _logger.LogInformation("✅ Mensaje SignalR FINAL enviado exitosamente");
                }

                result.RegistrosExitosos = totalInserted;

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing clases de producto");
                result.Errores.Add($"Error general: {ex.Message}");
                return result;
            }
        }

        private async Task<ProcessResult> ProcessMarcasAsync(string[] lines, string uploadId, string fileName)
        {
            var result = new ProcessResult();
            result.RegistrosProcesados = lines.Length;

            try
            {
                await _context.Database.ExecuteSqlRawAsync("DELETE FROM auditMarketMarcas");
                _logger.LogInformation("Cleared auditMarketMarcas table");

                if (lines.Length < 2)
                {
                    result.Errores.Add("Archivo vacío o sin datos");
                    return result;
                }

                // Read headers from first line
                var headers = lines[0].Split('|').Select(h => h.Trim().ToUpper()).ToArray();

                var marcas = new List<AuditMarketMarca>();
                const int batchSize = 10000;
                int totalInserted = 0;
                int totalLines = lines.Length - 1;

                for (int i = 1; i < lines.Length; i++)
                {
                    try
                    {
                        var fields = lines[i].Split('|');
                        var marca = new AuditMarketMarca
                        {
                            RawData = lines[i]
                        };

                        // Dynamic mapping: header names match property names exactly
                        // Headers: CODIGO|CODIGO_PMIX|NOME|SIGLALAB
                        var properties = typeof(AuditMarketMarca).GetProperties();
                        for (int j = 0; j < Math.Min(headers.Length, fields.Length); j++)
                        {
                            var value = fields[j].Trim();
                            if (string.IsNullOrWhiteSpace(value)) continue;

                            var property = properties.FirstOrDefault(p => p.Name == headers[j]);
                            if (property != null && property.CanWrite)
                            {
                                property.SetValue(marca, value);
                            }
                        }

                        marcas.Add(marca);

                        // Guardar cada lote
                        if (marcas.Count >= batchSize)
                        {
                            await _context.AuditMarketMarcas.AddRangeAsync(marcas);
                            await _context.SaveChangesAsync();
                            totalInserted += marcas.Count;
                            _logger.LogInformation("Inserted batch of {Count} marcas. Total: {Total}", marcas.Count, totalInserted);

                            // Enviar progreso por SignalR
                            var progress = (int)((totalInserted * 100.0) / totalLines);
                            _logger.LogInformation("🔔 Enviando mensaje SignalR: UploadId={UploadId}, File={File}, Progress={Progress}%", uploadId, fileName, progress);
                            await _hubContext.Clients.All.SendAsync("ImportProgress", new ImportProgressUpdate
                            {
                                UploadId = uploadId,
                                CurrentFile = fileName,
                                CurrentFileProgress = progress,
                                Status = "processing",
                                Message = $"Procesando {fileName}: {totalInserted:N0}/{totalLines:N0} registros ({progress}%)",
                                Logs = new List<string> { $"📊 {fileName}: {totalInserted:N0} registros guardados" }
                            });
                            _logger.LogInformation("✅ Mensaje SignalR enviado exitosamente");

                            marcas.Clear();
                        }
                    }
                    catch (Exception ex)
                    {
                        result.Errores.Add($"Línea {i + 1}: {ex.Message}");
                        result.RegistrosError++;
                    }
                }

                if (marcas.Any())
                {
                    await _context.AuditMarketMarcas.AddRangeAsync(marcas);
                    await _context.SaveChangesAsync();
                    totalInserted += marcas.Count;
                    _logger.LogInformation("Inserted final batch of {Count} marcas. Total: {Total}", marcas.Count, totalInserted);

                    // Enviar progreso final por SignalR
                    _logger.LogInformation("🔔 Enviando mensaje SignalR FINAL: UploadId={UploadId}, File={File}", uploadId, fileName);
                    await _hubContext.Clients.All.SendAsync("ImportProgress", new ImportProgressUpdate
                    {
                        UploadId = uploadId,
                        CurrentFile = fileName,
                        CurrentFileProgress = 100,
                        Status = "processing",
                        Message = $"{fileName} completado: {totalInserted:N0} registros",
                        Logs = new List<string> { $"✅ {fileName}: {totalInserted:N0} registros totales" }
                    });
                    _logger.LogInformation("✅ Mensaje SignalR FINAL enviado exitosamente");
                }

                result.RegistrosExitosos = totalInserted;

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing marcas");
                result.Errores.Add($"Error general: {ex.Message}");
                return result;
            }
        }
    }
}
