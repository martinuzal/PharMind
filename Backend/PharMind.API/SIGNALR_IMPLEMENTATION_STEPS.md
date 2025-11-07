# Pasos para Implementar SignalR con Progreso en Tiempo Real

## Backend Changes

### 1. Program.cs - Agregar SignalR
Después de la línea `builder.Services.AddScoped<IAuditoriaPrescripcionesService, AuditoriaPrescripcionesService>();`

```csharp
// SignalR
builder.Services.AddSignalR();

// CORS - actualizar para permitir SignalR
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); // Necesario para SignalR
    });
});
```

Después de `app.MapControllers();` agregar:
```csharp
// SignalR Hub
app.MapHub<PharMind.API.Hubs.ImportProgressHub>("/hubs/import-progress");
```

### 2. AuditoriaPrescripcionesService.cs - Inyectar IHubContext

En el constructor, agregar:
```csharp
private readonly IHubContext<ImportProgressHub> _hubContext;

public AuditoriaPrescripcionesService(
    PharMindDbContext context,
    ILogger<AuditoriaPrescripcionesService> logger,
    IWebHostEnvironment environment,
    IHubContext<ImportProgressHub> hubContext)
{
    _context = context;
    _logger = logger;
    _environment = environment;
    _hubContext = hubContext;
}
```

En ProcessAuditoriaZipAsync, después de encontrar los archivos (línea ~82), agregar:
```csharp
int fileIndex = 0;
foreach (var fileName in processOrder)
{
    fileIndex++;
    var filePath = Path.Combine(tempDirectory, fileName);

    // Enviar progreso: iniciando archivo
    await _hubContext.Clients.All.SendAsync("ImportProgress", new ImportProgressUpdate
    {
        UploadId = uploadId,
        TotalFiles = processOrder.Length,
        ProcessedFiles = fileIndex - 1,
        CurrentFile = fileName,
        CurrentFileProgress = 0,
        Status = "processing",
        Message = $"Procesando {fileName}..."
    });

    // ... resto del código ...

    // Después de procesar el archivo exitosamente
    await _hubContext.Clients.All.SendAsync("ImportProgress", new ImportProgressUpdate
    {
        UploadId = uploadId,
        TotalFiles = processOrder.Length,
        ProcessedFiles = fileIndex,
        CurrentFile = fileName,
        CurrentFileProgress = 100,
        Status = "processing",
        Message = $"Completado {fileName}: {fileResult.RegistrosExitosos} registros"
    });
}

// Al final del try, enviar completado
await _hubContext.Clients.All.SendAsync("ImportProgress", new ImportProgressUpdate
{
    UploadId = uploadId,
    TotalFiles = processOrder.Length,
    ProcessedFiles = processOrder.Length,
    CurrentFile = "",
    CurrentFileProgress = 100,
    Status = "completed",
    Message = "Importación completada exitosamente",
    FileResults = result.RegistrosPorArchivo
});
```

### 3. ImportacionesController.cs - Hacer proceso asíncrono

Cambiar el endpoint ProcessImportacion para ejecutar en background:
```csharp
[HttpPost("{id}/process")]
public async Task<IActionResult> ProcessImportacion(string id)
{
    var fileToProcess = files.FirstOrDefault(f =>
        Path.GetFileNameWithoutExtension(f).GetHashCode().ToString() == id);

    if (!fileToProcess.EndsWith(".zip", StringComparison.OrdinalIgnoreCase))
    {
        return BadRequest(new { error = "Solo se pueden procesar archivos ZIP" });
    }

    var uploadId = Guid.NewGuid().ToString();

    // Ejecutar en background
    _ = Task.Run(async () =>
    {
        try
        {
            await _auditoriaService.ProcessAuditoriaZipAsync(fileToProcess, uploadId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing audit ZIP in background");
            await _hubContext.Clients.All.SendAsync("ImportProgress", new ImportProgressUpdate
            {
                UploadId = uploadId,
                Status = "error",
                Message = $"Error: {ex.Message}"
            });
        }
    });

    return Ok(new { uploadId, message = "Procesamiento iniciado en segundo plano" });
}
```

Inyectar IHubContext en el controller también.

## Frontend Changes

### 1. Instalar SignalR Client
```bash
npm install @microsoft/signalr
```

### 2. Crear servicio SignalR: src/services/signalr.service.ts
```typescript
import * as signalR from '@microsoft/signalr';

class SignalRService {
  private connection: signalR.HubConnection | null = null;

  async connect(): Promise<void> {
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5209/hubs/import-progress')
      .withAutomaticReconnect()
      .build();

    await this.connection.start();
    console.log('SignalR connected');
  }

  onImportProgress(callback: (update: any) => void): void {
    this.connection?.on('ImportProgress', callback);
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.stop();
    }
  }
}

export const signalRService = new SignalRService();
```

### 3. Actualizar ImportacionesPage.tsx

Agregar estados para progreso:
```typescript
const [processingProgress, setProcessingProgress] = useState<any>(null);
const [showAlert, setShowAlert] = useState(false);
const [alertMessage, setAlertMessage] = useState('');
const [alertType, setAlertType] = useState<'success' | 'error'>('success');
```

Conectar SignalR en useEffect:
```typescript
useEffect(() => {
  signalRService.connect();

  signalRService.onImportProgress((update) => {
    setProcessingProgress(update);

    if (update.status === 'completed') {
      setShowAlert(true);
      setAlertType('success');
      setAlertMessage(`Auditoría importada exitosamente. ${update.message}`);
      setShowProcessModal(false);
      fetchImportaciones();
    } else if (update.status === 'error') {
      setShowAlert(true);
      setAlertType('error');
      setAlertMessage(update.message);
      setShowProcessModal(false);
    }
  });

  return () => {
    signalRService.disconnect();
  };
}, []);
```

En handleStartProcessing, simplificar:
```typescript
const handleStartProcessing = async () => {
  if (!selectedImportacion) return;

  try {
    setProcessing(true);
    const response = await fetch(
      `http://localhost:5209/api/importaciones/${selectedImportacion.id}/process`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' } }
    );

    if (!response.ok) throw new Error('Error al iniciar procesamiento');

    // El progreso llegará vía SignalR
  } catch (error) {
    setAlertType('error');
    setAlertMessage('Error al iniciar el procesamiento');
    setShowAlert(true);
    setShowProcessModal(false);
  }
};
```

Actualizar el modal de procesamiento para mostrar progreso:
```typescript
{showProcessModal && (
  <div className="modal-overlay">
    <div className="modal">
      <h3>Procesando Auditoría</h3>

      {processingProgress && (
        <div className="progress-container">
          <div className="progress-info">
            <p><strong>{processingProgress.message}</strong></p>
            <p>Archivo {processingProgress.processedFiles} de {processingProgress.totalFiles}</p>
            {processingProgress.currentFile && (
              <p className="current-file">📄 {processingProgress.currentFile}</p>
            )}
          </div>

          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${(processingProgress.processedFiles / processingProgress.totalFiles) * 100}%`
              }}
            />
          </div>

          <div className="progress-percentage">
            {Math.round((processingProgress.processedFiles / processingProgress.totalFiles) * 100)}%
          </div>
        </div>
      )}

      <div className="modal-actions">
        <button
          className="btn-secondary"
          onClick={() => setShowProcessModal(false)}
          disabled={processing}
        >
          Cerrar
        </button>
      </div>
    </div>
  </div>
)}

{showAlert && (
  <div className={`alert alert-${alertType}`}>
    <span>{alertMessage}</span>
    <button onClick={() => setShowAlert(false)}>×</button>
  </div>
)}
```

### 4. CSS para progreso y alerts

En ImportacionesPage.css agregar:
```css
.progress-container {
  margin: 20px 0;
}

.progress-info {
  margin-bottom: 15px;
}

.current-file {
  color: #666;
  font-size: 14px;
  margin-top: 5px;
}

.progress-bar {
  width: 100%;
  height: 30px;
  background-color: #e0e0e0;
  border-radius: 15px;
  overflow: hidden;
  margin: 10px 0;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4CAF50, #45a049);
  transition: width 0.3s ease;
}

.progress-percentage {
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  color: #4CAF50;
}

.alert {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 15px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 10000;
  display: flex;
  align-items: center;
  gap: 15px;
  animation: slideIn 0.3s ease;
}

.alert-success {
  background-color: #4CAF50;
  color: white;
}

.alert-error {
  background-color: #f44336;
  color: white;
}

.alert button {
  background: transparent;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
}

@keyframes slideIn {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
```

## Resultado Final

- ✅ Proceso en background sin bloquear UI
- ✅ Barra de progreso en tiempo real
- ✅ Muestra archivo actual siendo procesado
- ✅ Notificación al completar (éxito o error)
- ✅ Usuario puede cerrar modal mientras procesa
