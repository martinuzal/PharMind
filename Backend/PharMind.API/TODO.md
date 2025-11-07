# Tareas Pendientes - PharMind Backend

## Prioridad Alta

### 1. Crear tabla Importaciones en la base de datos
**Fecha agregada**: 2025-11-06
**Contexto**: Actualmente, la información de las importaciones se lee directamente del sistema de archivos. Se necesita una tabla persistente para relacionar:
- Archivo físico (nombre, path, tamaño, fecha de carga)
- UploadId del proceso
- Logs de ProcessLog (relación con la tabla ProcessLogs)
- Resultados del procesamiento (registros procesados, exitosos, errores)
- Estado (pendiente, procesando, completado, error)
- Usuario que realizó la importación
- Fecha de importación

**Archivos relacionados**:
- `Controllers/ImportacionesController.cs` - Endpoint `/api/importaciones/list` (línea 190-231)
- `Models/` - Crear nuevo modelo `Importacion.cs`
- `Data/PharMindDbContext.cs` - Agregar DbSet

**Beneficios**:
- Poder consultar historial de importaciones de forma eficiente
- Relacionar archivos con sus logs de procesamiento
- Mostrar estadísticas reales en el frontend
- Permitir re-procesamiento de archivos fallidos

---

## Prioridad Media

### 2. Investigar problema de SignalR en frontend
**Fecha agregada**: 2025-11-06
**Contexto**: SignalR conecta pero se desconecta rápidamente. Los mensajes no llegan al frontend. Se implementó polling como workaround temporal.

**Problema identificado**:
- React Strict Mode causa doble mount/unmount en desarrollo
- Cliente se conecta y desconecta rápidamente
- Mensajes se pierden durante desconexión

**Solución temporal**: Sistema de polling que consulta `/api/importaciones/logs/{uploadId}` cada 2 segundos

**Archivos relacionados**:
- `Frontend/pharmind-web/src/pages/auditoria/ImportacionesPage.tsx` (línea 305-356)
- `Hubs/ImportProgressHub.cs`
- `Services/AuditoriaPrescripcionesService.cs`

**Posibles soluciones**:
- Implementar reconexión automática en cliente SignalR
- Usar `HubConnection.keepAliveInterval`
- Buffer de mensajes en servidor hasta confirmar recepción
- Investigar configuración de React Strict Mode

---

## Prioridad Baja

### 3. Optimizar polling de logs
**Fecha agregada**: 2025-11-06
**Contexto**: El polling actual hace consultas cada 2 segundos a la base de datos. Podría optimizarse.

**Mejoras posibles**:
- Implementar polling adaptativo (más frecuente al inicio, menos al final)
- Cache de logs en memoria en el backend
- Long polling en vez de short polling
- Volver a SignalR cuando el problema esté resuelto

---

## Completadas ✓

*(Ninguna por ahora)*

---

## Notas

- Este archivo debe actualizarse cada vez que se identifique una nueva tarea o se complete una existente
- Prioridades: Alta (urgente/bloqueante), Media (importante pero no urgente), Baja (mejoras/optimizaciones)
