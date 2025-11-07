using PharMind.API.Models;

namespace PharMind.API.Services
{
    public interface IProcessLogService
    {
        /// <summary>
        /// Registra un log de información para un proceso
        /// </summary>
        Task LogInfoAsync(string uploadId, string message, string? details = null);

        /// <summary>
        /// Registra un log de advertencia para un proceso
        /// </summary>
        Task LogWarningAsync(string uploadId, string message, string? details = null);

        /// <summary>
        /// Registra un log de error para un proceso
        /// </summary>
        Task LogErrorAsync(string uploadId, string message, string? details = null);

        /// <summary>
        /// Obtiene todos los logs de un proceso específico
        /// </summary>
        Task<List<ProcessLog>> GetLogsByUploadIdAsync(string uploadId);

        /// <summary>
        /// Elimina logs antiguos de procesos completados (mantenimiento)
        /// </summary>
        Task CleanupOldLogsAsync(TimeSpan olderThan);
    }
}
