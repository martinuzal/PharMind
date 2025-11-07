using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using PharMind.API.DTOs;
using PharMind.API.Services;
using PharMind.API.Hubs;

namespace PharMind.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ImportacionesController : ControllerBase
    {
        private readonly IChunkedUploadService _uploadService;
        private readonly ILogger<ImportacionesController> _logger;
        private readonly IHubContext<ImportProgressHub> _hubContext;
        private readonly IServiceScopeFactory _serviceScopeFactory;
        private readonly IProcessLogService _processLogService;

        public ImportacionesController(
            IChunkedUploadService uploadService,
            ILogger<ImportacionesController> logger,
            IHubContext<ImportProgressHub> hubContext,
            IServiceScopeFactory serviceScopeFactory,
            IProcessLogService processLogService)
        {
            _uploadService = uploadService;
            _logger = logger;
            _hubContext = hubContext;
            _serviceScopeFactory = serviceScopeFactory;
            _processLogService = processLogService;
        }

        /// <summary>
        /// Inicializa una sesión de upload chunked
        /// </summary>
        [HttpPost("initialize-upload")]
        public IActionResult InitializeUpload([FromBody] InitializeUploadDto dto)
        {
            try
            {
                _logger.LogInformation(
                    "Initializing upload for file: {FileName}, Size: {FileSize} bytes",
                    dto.FileName, dto.FileSize
                );

                var session = _uploadService.InitializeUpload(
                    dto.FileName,
                    dto.FileSize,
                    dto.TipoImportacion,
                    dto.ChunkSize
                );

                return Ok(new InitializeUploadResponseDto
                {
                    UploadId = session.UploadId
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error initializing upload");
                return StatusCode(500, new { error = "Error al inicializar upload" });
            }
        }

        /// <summary>
        /// Sube un chunk individual
        /// </summary>
        [HttpPost("upload-chunk")]
        [RequestSizeLimit(5 * 1024 * 1024)] // 5MB por chunk
        [RequestFormLimits(MultipartBodyLengthLimit = 5 * 1024 * 1024)]
        public async Task<IActionResult> UploadChunk([FromForm] string uploadId, [FromForm] int chunkIndex, [FromForm] IFormFile chunk)
        {
            try
            {
                if (chunk == null || chunk.Length == 0)
                {
                    return BadRequest(new { error = "Chunk vacío" });
                }

                _logger.LogInformation(
                    "Receiving chunk {ChunkIndex} for upload {UploadId}, Size: {Size} bytes",
                    chunkIndex, uploadId, chunk.Length
                );

                using (var stream = chunk.OpenReadStream())
                {
                    await _uploadService.SaveChunkAsync(uploadId, chunkIndex, stream);
                }

                return Ok(new { success = true });
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Invalid upload session: {UploadId}", uploadId);
                return NotFound(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading chunk {ChunkIndex} for {UploadId}", chunkIndex, uploadId);
                return StatusCode(500, new { error = "Error al subir chunk" });
            }
        }

        /// <summary>
        /// Finaliza el upload y combina todos los chunks
        /// </summary>
        [HttpPost("finalize-upload")]
        public async Task<IActionResult> FinalizeUpload([FromBody] FinalizeUploadDto dto)
        {
            try
            {
                _logger.LogInformation("Finalizing upload {UploadId}", dto.UploadId);

                var filePath = await _uploadService.FinalizeUploadAsync(dto.UploadId);

                var fileName = Path.GetFileName(filePath);

                return Ok(new ChunkedUploadResultDto
                {
                    Success = true,
                    UploadId = dto.UploadId,
                    FileName = fileName,
                    FilePath = filePath
                });
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Error finalizing upload: {UploadId}", dto.UploadId);
                return BadRequest(new ChunkedUploadResultDto
                {
                    Success = false,
                    UploadId = dto.UploadId,
                    FileName = string.Empty,
                    Error = ex.Message
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error finalizing upload {UploadId}", dto.UploadId);
                return StatusCode(500, new ChunkedUploadResultDto
                {
                    Success = false,
                    UploadId = dto.UploadId,
                    FileName = string.Empty,
                    Error = "Error al finalizar upload"
                });
            }
        }

        /// <summary>
        /// Cancela un upload en progreso
        /// </summary>
        [HttpDelete("cancel-upload/{uploadId}")]
        public async Task<IActionResult> CancelUpload(string uploadId)
        {
            try
            {
                _logger.LogInformation("Cancelling upload {UploadId}", uploadId);
                await _uploadService.CancelUploadAsync(uploadId);
                return Ok(new { success = true });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cancelling upload {UploadId}", uploadId);
                return StatusCode(500, new { error = "Error al cancelar upload" });
            }
        }

        /// <summary>
        /// Limpia sesiones de upload antiguas (llamado por un job programado)
        /// </summary>
        [HttpPost("cleanup-old-sessions")]
        public IActionResult CleanupOldSessions()
        {
            try
            {
                _uploadService.CleanupOldSessions(TimeSpan.FromHours(24));
                return Ok(new { success = true });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cleaning up old sessions");
                return StatusCode(500, new { error = "Error al limpiar sesiones" });
            }
        }

        /// <summary>
        /// Lista todos los archivos importados
        /// </summary>
        [HttpGet("list")]
        public IActionResult ListImportaciones()
        {
            try
            {
                var uploadsPath = Path.Combine(_uploadService.GetUploadsDirectory(), "Importaciones");

                if (!Directory.Exists(uploadsPath))
                {
                    return Ok(new List<object>());
                }

                var files = Directory.GetFiles(uploadsPath)
                    .Select(filePath =>
                    {
                        var fileInfo = new FileInfo(filePath);
                        return new
                        {
                            id = Path.GetFileNameWithoutExtension(fileInfo.Name).GetHashCode(),
                            archivo = fileInfo.Name,
                            tipo = "Datos", // Determinar tipo según nombre o contenido
                            estado = "completado",
                            registrosProcesados = 0, // Por ahora 0, luego se puede procesar
                            registrosExitosos = 0,
                            registrosError = 0,
                            fechaImportacion = fileInfo.CreationTime.ToString("yyyy-MM-ddTHH:mm:ss"),
                            usuario = "Sistema",
                            tamano = fileInfo.Length,
                            filePath = filePath
                        };
                    })
                    .OrderByDescending(f => f.fechaImportacion)
                    .ToList();

                return Ok(files);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error listing importaciones");
                return StatusCode(500, new { error = "Error al listar importaciones" });
            }
        }

        /// <summary>
        /// Procesa un archivo importado en background con progreso en tiempo real
        /// </summary>
        [HttpPost("{id}/process")]
        public async Task<IActionResult> ProcessImportacion(string id)
        {
            try
            {
                _logger.LogInformation("🔵 ProcessImportacion called with ID: {Id}", id);

                var uploadsPath = Path.Combine(_uploadService.GetUploadsDirectory(), "Importaciones");
                _logger.LogInformation("🔵 Uploads path: {Path}", uploadsPath);

                var files = Directory.GetFiles(uploadsPath);
                _logger.LogInformation("🔵 Found {Count} files in directory", files.Length);

                foreach (var file in files)
                {
                    var fileName = Path.GetFileNameWithoutExtension(file);
                    var hashCode = fileName.GetHashCode();
                    _logger.LogInformation("🔵 File: {FileName}, HashCode: {HashCode}", fileName, hashCode);
                }

                var fileToProcess = files.FirstOrDefault(f =>
                    Path.GetFileNameWithoutExtension(f).GetHashCode().ToString() == id);

                if (fileToProcess == null)
                {
                    _logger.LogWarning("❌ File not found for ID: {Id}", id);
                    return NotFound(new { error = "Archivo no encontrado" });
                }

                _logger.LogInformation("✅ Processing file: {FilePath}", fileToProcess);

                // Verificar que sea un archivo ZIP
                if (!fileToProcess.EndsWith(".zip", StringComparison.OrdinalIgnoreCase))
                {
                    return BadRequest(new { error = "Solo se pueden procesar archivos ZIP con auditorías de prescripciones" });
                }

                // Generar uploadId único para este proceso
                var uploadId = Guid.NewGuid().ToString();
                _logger.LogInformation("🔵 Generated uploadId: {UploadId}", uploadId);

                // Ejecutar en background con un nuevo scope
                _ = Task.Run(async () =>
                {
                    _logger.LogInformation("🟢 Background task started for uploadId: {UploadId}", uploadId);
                    try
                    {
                        // Crear un nuevo scope para obtener servicios con DbContext fresco
                        using (var scope = _serviceScopeFactory.CreateScope())
                        {
                            var auditoriaService = scope.ServiceProvider.GetRequiredService<IAuditoriaPrescripcionesService>();

                            _logger.LogInformation("🟢 Calling ProcessAuditoriaZipAsync for file: {File}", fileToProcess);
                            await auditoriaService.ProcessAuditoriaZipAsync(fileToProcess, uploadId);
                            _logger.LogInformation("✅ ProcessAuditoriaZipAsync completed for uploadId: {UploadId}", uploadId);
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "❌ Error processing audit ZIP in background for uploadId: {UploadId}", uploadId);
                        await _hubContext.Clients.All.SendAsync("ImportProgress", new ImportProgressUpdate
                        {
                            UploadId = uploadId,
                            Status = "error",
                            Message = $"Error crítico: {ex.Message}"
                        });
                    }
                });

                _logger.LogInformation("✅ Returning success response with uploadId: {UploadId}", uploadId);
                return Ok(new { uploadId, message = "Procesamiento iniciado en segundo plano" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error starting process for importacion {Id}", id);
                return StatusCode(500, new { error = "Error al iniciar procesamiento: " + ex.Message });
            }
        }

        /// <summary>
        /// Elimina un archivo importado
        /// </summary>
        [HttpDelete("{id}")]
        public IActionResult DeleteImportacion(string id)
        {
            try
            {
                var uploadsPath = Path.Combine(_uploadService.GetUploadsDirectory(), "Importaciones");
                var files = Directory.GetFiles(uploadsPath);

                var fileToDelete = files.FirstOrDefault(f =>
                    Path.GetFileNameWithoutExtension(f).GetHashCode().ToString() == id);

                if (fileToDelete == null)
                {
                    return NotFound(new { error = "Archivo no encontrado" });
                }

                System.IO.File.Delete(fileToDelete);
                _logger.LogInformation("File deleted: {FilePath}", fileToDelete);

                return Ok(new { success = true });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting importacion {Id}", id);
                return StatusCode(500, new { error = "Error al eliminar archivo" });
            }
        }

        /// <summary>
        /// Obtiene los logs de un proceso de importación específico
        /// </summary>
        [HttpGet("logs/{uploadId}")]
        public async Task<IActionResult> GetProcessLogs(string uploadId)
        {
            try
            {
                var logs = await _processLogService.GetLogsByUploadIdAsync(uploadId);
                return Ok(logs);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving logs for uploadId {UploadId}", uploadId);
                return StatusCode(500, new { error = "Error al obtener logs" });
            }
        }
    }
}
