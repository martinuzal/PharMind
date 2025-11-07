namespace PharMind.API.Models
{
    public class ProcessLog
    {
        public int Id { get; set; }
        public string UploadId { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public string Level { get; set; } = string.Empty; // INFO, WARNING, ERROR
        public string Message { get; set; } = string.Empty;
        public string? Details { get; set; }
    }
}
