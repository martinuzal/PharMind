const API_URL = 'http://localhost:5209/api';

export interface UploadProgress {
  uploadedBytes: number;
  totalBytes: number;
  percentage: number;
  chunkIndex: number;
  totalChunks: number;
}

export interface ChunkedUploadResult {
  success: boolean;
  uploadId: string;
  fileName: string;
  filePath?: string;
  error?: string;
}

export class ChunkedUploadService {
  private static readonly CHUNK_SIZE = 1024 * 1024; // 1MB por chunk
  private static readonly MAX_RETRIES = 3;

  /**
   * Inicia una nueva sesión de upload chunked
   */
  static async initializeUpload(
    fileName: string,
    fileSize: number,
    tipoImportacion: string
  ): Promise<string> {
    try {
      const response = await fetch(`${API_URL}/importaciones/initialize-upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName,
          fileSize,
          tipoImportacion,
          chunkSize: this.CHUNK_SIZE
        })
      });

      if (!response.ok) {
        throw new Error('Error al inicializar upload');
      }

      const data = await response.json();
      return data.uploadId;
    } catch (error) {
      console.error('Error initializing upload:', error);
      throw error;
    }
  }

  /**
   * Sube un chunk individual con reintentos
   */
  private static async uploadChunkWithRetry(
    uploadId: string,
    chunkIndex: number,
    chunk: Blob,
    retries = 0
  ): Promise<void> {
    try {
      const formData = new FormData();
      formData.append('uploadId', uploadId);
      formData.append('chunkIndex', chunkIndex.toString());
      formData.append('chunk', chunk, `chunk-${chunkIndex}`);

      const response = await fetch(`${API_URL}/importaciones/upload-chunk`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Error uploading chunk ${chunkIndex}`);
      }
    } catch (error) {
      if (retries < this.MAX_RETRIES) {
        console.log(`Retrying chunk ${chunkIndex}, attempt ${retries + 1}`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (retries + 1)));
        return this.uploadChunkWithRetry(uploadId, chunkIndex, chunk, retries + 1);
      }
      throw error;
    }
  }

  /**
   * Finaliza el upload y combina todos los chunks
   */
  static async finalizeUpload(uploadId: string): Promise<ChunkedUploadResult> {
    try {
      const response = await fetch(`${API_URL}/importaciones/finalize-upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uploadId })
      });

      if (!response.ok) {
        throw new Error('Error al finalizar upload');
      }

      return await response.json();
    } catch (error) {
      console.error('Error finalizing upload:', error);
      throw error;
    }
  }

  /**
   * Cancela un upload en progreso
   */
  static async cancelUpload(uploadId: string): Promise<void> {
    try {
      await fetch(`${API_URL}/importaciones/cancel-upload/${uploadId}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error('Error canceling upload:', error);
    }
  }

  /**
   * Método principal para subir un archivo en chunks
   */
  static async uploadFile(
    file: File,
    tipoImportacion: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<ChunkedUploadResult> {
    const totalChunks = Math.ceil(file.size / this.CHUNK_SIZE);
    let uploadId: string;

    try {
      // 1. Inicializar upload
      uploadId = await this.initializeUpload(file.name, file.size, tipoImportacion);

      // 2. Subir cada chunk
      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        const start = chunkIndex * this.CHUNK_SIZE;
        const end = Math.min(start + this.CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);

        await this.uploadChunkWithRetry(uploadId, chunkIndex, chunk);

        // Reportar progreso
        if (onProgress) {
          onProgress({
            uploadedBytes: end,
            totalBytes: file.size,
            percentage: Math.round((end / file.size) * 100),
            chunkIndex: chunkIndex + 1,
            totalChunks
          });
        }
      }

      // 3. Finalizar upload
      const result = await this.finalizeUpload(uploadId);
      return result;

    } catch (error) {
      // Si hay error, intentar cancelar el upload
      if (uploadId!) {
        await this.cancelUpload(uploadId);
      }
      throw error;
    }
  }

  /**
   * Valida el tamaño del archivo
   */
  static validateFileSize(file: File, maxSizeMB = 200): { valid: boolean; error?: string } {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return {
        valid: false,
        error: `El archivo excede el tamaño máximo permitido de ${maxSizeMB}MB`
      };
    }
    return { valid: true };
  }

  /**
   * Valida la extensión del archivo
   */
  static validateFileExtension(file: File, allowedExtensions = ['.xlsx', '.xls', '.csv', '.zip', '.txt']): { valid: boolean; error?: string } {
    const extension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    if (!allowedExtensions.includes(extension)) {
      return {
        valid: false,
        error: `Formato de archivo no permitido. Formatos válidos: ${allowedExtensions.join(', ')}`
      };
    }
    return { valid: true };
  }

  /**
   * Formatea el tamaño del archivo para mostrar
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Calcula el tiempo estimado restante
   */
  static estimateTimeRemaining(
    uploadedBytes: number,
    totalBytes: number,
    startTime: number
  ): string {
    const elapsedTime = Date.now() - startTime;
    const uploadSpeed = uploadedBytes / (elapsedTime / 1000);
    const remainingBytes = totalBytes - uploadedBytes;
    const remainingSeconds = remainingBytes / uploadSpeed;

    if (remainingSeconds < 60) {
      return `${Math.round(remainingSeconds)} segundos`;
    } else if (remainingSeconds < 3600) {
      return `${Math.round(remainingSeconds / 60)} minutos`;
    } else {
      return `${Math.round(remainingSeconds / 3600)} horas`;
    }
  }
}

export default ChunkedUploadService;
