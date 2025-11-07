namespace PharMind.API.DTOs
{
    public class InitializeUploadDto
    {
        public string FileName { get; set; } = string.Empty;
        public long FileSize { get; set; }
        public string TipoImportacion { get; set; } = string.Empty;
        public int ChunkSize { get; set; }
    }

    public class InitializeUploadResponseDto
    {
        public string UploadId { get; set; } = string.Empty;
    }

    public class FinalizeUploadDto
    {
        public string UploadId { get; set; } = string.Empty;
    }

    public class ChunkedUploadResultDto
    {
        public bool Success { get; set; }
        public string UploadId { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        public string? FilePath { get; set; }
        public string? Error { get; set; }
    }

    public class UploadChunkDto
    {
        public string UploadId { get; set; } = string.Empty;
        public int ChunkIndex { get; set; }
        public IFormFile Chunk { get; set; } = null!;
    }
}
