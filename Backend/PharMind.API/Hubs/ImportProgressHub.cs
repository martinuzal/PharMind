using Microsoft.AspNetCore.SignalR;

namespace PharMind.API.Hubs
{
    public class ImportProgressHub : Hub
    {
        private readonly ILogger<ImportProgressHub> _logger;

        public ImportProgressHub(ILogger<ImportProgressHub> logger)
        {
            _logger = logger;
        }

        public override async Task OnConnectedAsync()
        {
            _logger.LogInformation("🔌 SignalR client connected: {ConnectionId}", Context.ConnectionId);
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            _logger.LogInformation("🔌 SignalR client disconnected: {ConnectionId}", Context.ConnectionId);
            if (exception != null)
            {
                _logger.LogError(exception, "SignalR client disconnected with error");
            }
            await base.OnDisconnectedAsync(exception);
        }
    }

    public class ImportProgressUpdate
    {
        public string UploadId { get; set; } = string.Empty;
        public int TotalFiles { get; set; }
        public int ProcessedFiles { get; set; }
        public string CurrentFile { get; set; } = string.Empty;
        public int CurrentFileProgress { get; set; }
        public string Status { get; set; } = string.Empty; // "processing", "completed", "error"
        public string? Message { get; set; }
        public Dictionary<string, int> FileResults { get; set; } = new();
        public List<string> Logs { get; set; } = new(); // Lista de mensajes de log para mostrar en UI
    }
}
