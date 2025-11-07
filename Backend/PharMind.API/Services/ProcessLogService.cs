using Microsoft.EntityFrameworkCore;
using PharMind.API.Data;
using PharMind.API.Models;

namespace PharMind.API.Services
{
    public class ProcessLogService : IProcessLogService
    {
        private readonly PharMindDbContext _context;
        private readonly ILogger<ProcessLogService> _logger;

        public ProcessLogService(PharMindDbContext context, ILogger<ProcessLogService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task LogInfoAsync(string uploadId, string message, string? details = null)
        {
            await LogAsync(uploadId, "INFO", message, details);
        }

        public async Task LogWarningAsync(string uploadId, string message, string? details = null)
        {
            await LogAsync(uploadId, "WARNING", message, details);
        }

        public async Task LogErrorAsync(string uploadId, string message, string? details = null)
        {
            await LogAsync(uploadId, "ERROR", message, details);
        }

        public async Task<List<ProcessLog>> GetLogsByUploadIdAsync(string uploadId)
        {
            return await _context.ProcessLogs
                .Where(l => l.UploadId == uploadId)
                .OrderBy(l => l.Timestamp)
                .ToListAsync();
        }

        public async Task CleanupOldLogsAsync(TimeSpan olderThan)
        {
            var cutoffDate = DateTime.UtcNow - olderThan;

            var oldLogs = await _context.ProcessLogs
                .Where(l => l.Timestamp < cutoffDate)
                .ToListAsync();

            if (oldLogs.Any())
            {
                _context.ProcessLogs.RemoveRange(oldLogs);
                await _context.SaveChangesAsync();
                _logger.LogInformation("Cleaned up {Count} old process logs", oldLogs.Count);
            }
        }

        private async Task LogAsync(string uploadId, string level, string message, string? details)
        {
            try
            {
                var log = new ProcessLog
                {
                    UploadId = uploadId,
                    Timestamp = DateTime.UtcNow,
                    Level = level,
                    Message = message,
                    Details = details
                };

                _context.ProcessLogs.Add(log);
                await _context.SaveChangesAsync();

                // También loguear en consola para debugging
                var logMessage = $"[{level}] {uploadId}: {message}";
                switch (level)
                {
                    case "INFO":
                        _logger.LogInformation(logMessage);
                        break;
                    case "WARNING":
                        _logger.LogWarning(logMessage);
                        break;
                    case "ERROR":
                        _logger.LogError(logMessage);
                        break;
                }
            }
            catch (Exception ex)
            {
                // No queremos que falle el proceso principal si falla el logging
                _logger.LogError(ex, "Error saving process log to database: {Message}", message);
            }
        }
    }
}
