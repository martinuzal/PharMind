using System.Collections.Concurrent;

namespace PharMind.API.Services
{
    public class UploadSession
    {
        public string UploadId { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        public long FileSize { get; set; }
        public string TipoImportacion { get; set; } = string.Empty;
        public int ChunkSize { get; set; }
        public int TotalChunks { get; set; }
        public string TempDirectory { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public ConcurrentDictionary<int, bool> ReceivedChunks { get; set; } = new();
    }

    public interface IChunkedUploadService
    {
        UploadSession InitializeUpload(string fileName, long fileSize, string tipoImportacion, int chunkSize);
        Task SaveChunkAsync(string uploadId, int chunkIndex, Stream chunkStream);
        Task<string> FinalizeUploadAsync(string uploadId);
        Task CancelUploadAsync(string uploadId);
        void CleanupOldSessions(TimeSpan maxAge);
        string GetUploadsDirectory();
    }

    public class ChunkedUploadService : IChunkedUploadService
    {
        private static readonly ConcurrentDictionary<string, UploadSession> _sessions = new();
        private readonly IWebHostEnvironment _environment;
        private readonly ILogger<ChunkedUploadService> _logger;

        public ChunkedUploadService(IWebHostEnvironment environment, ILogger<ChunkedUploadService> logger)
        {
            _environment = environment;
            _logger = logger;
        }

        public UploadSession InitializeUpload(string fileName, long fileSize, string tipoImportacion, int chunkSize)
        {
            var uploadId = Guid.NewGuid().ToString();
            var totalChunks = (int)Math.Ceiling((double)fileSize / chunkSize);

            // Crear directorio temporal para chunks
            var tempDirectory = Path.Combine(
                _environment.ContentRootPath,
                "Uploads",
                "Temp",
                uploadId
            );

            Directory.CreateDirectory(tempDirectory);

            var session = new UploadSession
            {
                UploadId = uploadId,
                FileName = fileName,
                FileSize = fileSize,
                TipoImportacion = tipoImportacion,
                ChunkSize = chunkSize,
                TotalChunks = totalChunks,
                TempDirectory = tempDirectory,
                CreatedAt = DateTime.UtcNow
            };

            _sessions[uploadId] = session;

            _logger.LogInformation(
                "Upload session initialized: {UploadId}, File: {FileName}, Size: {FileSize}, Chunks: {TotalChunks}",
                uploadId, fileName, fileSize, totalChunks
            );

            return session;
        }

        public async Task SaveChunkAsync(string uploadId, int chunkIndex, Stream chunkStream)
        {
            if (!_sessions.TryGetValue(uploadId, out var session))
            {
                throw new InvalidOperationException($"Upload session {uploadId} not found");
            }

            var chunkPath = Path.Combine(session.TempDirectory, $"chunk_{chunkIndex}");

            using (var fileStream = new FileStream(chunkPath, FileMode.Create, FileAccess.Write))
            {
                await chunkStream.CopyToAsync(fileStream);
            }

            session.ReceivedChunks[chunkIndex] = true;

            _logger.LogInformation(
                "Chunk saved: {UploadId}, Chunk: {ChunkIndex}/{TotalChunks}",
                uploadId, chunkIndex + 1, session.TotalChunks
            );
        }

        public async Task<string> FinalizeUploadAsync(string uploadId)
        {
            if (!_sessions.TryGetValue(uploadId, out var session))
            {
                throw new InvalidOperationException($"Upload session {uploadId} not found");
            }

            // Verificar que todos los chunks fueron recibidos
            for (int i = 0; i < session.TotalChunks; i++)
            {
                if (!session.ReceivedChunks.ContainsKey(i))
                {
                    throw new InvalidOperationException($"Missing chunk {i}");
                }
            }

            // Crear directorio de importaciones si no existe
            var uploadsDirectory = Path.Combine(_environment.ContentRootPath, "Uploads", "Importaciones");
            Directory.CreateDirectory(uploadsDirectory);

            // Generar nombre de archivo único
            var timestamp = DateTime.Now.ToString("yyyyMMdd_HHmmss");
            var sanitizedFileName = Path.GetFileNameWithoutExtension(session.FileName);
            var extension = Path.GetExtension(session.FileName);
            var finalFileName = $"{sanitizedFileName}_{timestamp}{extension}";
            var finalPath = Path.Combine(uploadsDirectory, finalFileName);

            // Combinar todos los chunks en el archivo final
            using (var finalStream = new FileStream(finalPath, FileMode.Create, FileAccess.Write))
            {
                for (int i = 0; i < session.TotalChunks; i++)
                {
                    var chunkPath = Path.Combine(session.TempDirectory, $"chunk_{i}");
                    using (var chunkStream = new FileStream(chunkPath, FileMode.Open, FileAccess.Read))
                    {
                        await chunkStream.CopyToAsync(finalStream);
                    }
                }
            }

            _logger.LogInformation(
                "Upload finalized: {UploadId}, File: {FinalPath}, Size: {FileSize}",
                uploadId, finalPath, session.FileSize
            );

            // Limpiar chunks temporales
            await CleanupSessionAsync(uploadId);

            return finalPath;
        }

        public async Task CancelUploadAsync(string uploadId)
        {
            await CleanupSessionAsync(uploadId);
            _logger.LogInformation("Upload cancelled: {UploadId}", uploadId);
        }

        private async Task CleanupSessionAsync(string uploadId)
        {
            if (_sessions.TryRemove(uploadId, out var session))
            {
                try
                {
                    if (Directory.Exists(session.TempDirectory))
                    {
                        await Task.Run(() => Directory.Delete(session.TempDirectory, true));
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error cleaning up session {UploadId}", uploadId);
                }
            }
        }

        public void CleanupOldSessions(TimeSpan maxAge)
        {
            var cutoffTime = DateTime.UtcNow - maxAge;

            var oldSessions = _sessions.Where(s => s.Value.CreatedAt < cutoffTime).ToList();

            foreach (var session in oldSessions)
            {
                _ = CleanupSessionAsync(session.Key);
            }

            if (oldSessions.Any())
            {
                _logger.LogInformation("Cleaned up {Count} old upload sessions", oldSessions.Count);
            }
        }

        public string GetUploadsDirectory()
        {
            return Path.Combine(_environment.ContentRootPath, "Uploads");
        }
    }
}
