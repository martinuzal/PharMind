# Testing Fase 1 - API Móvil PharMind

Este documento describe cómo probar la implementación de la Fase 1 del módulo móvil.

## ✅ Componentes Implementados

### Backend
- **MobileController** ([Backend/PharMind.API/Controllers/MobileController.cs](../Backend/PharMind.API/Controllers/MobileController.cs))
  - ✅ Endpoints de sincronización
  - ✅ Endpoints de relaciones
  - ✅ Endpoints de interacciones
  - ✅ Endpoint de dashboard
  - ✅ DTOs optimizados para móvil

### Mobile (Flutter)
- **Modelos Dart**
  - ✅ `Relacion` - [lib/models/relacion.dart](pharmind_mobile/lib/models/relacion.dart)
  - ✅ `Interaccion` - [lib/models/interaccion.dart](pharmind_mobile/lib/models/interaccion.dart)
  - ✅ `Cliente` - [lib/models/cliente.dart](pharmind_mobile/lib/models/cliente.dart)
  - ✅ `TipoRelacion` - [lib/models/tipo_relacion.dart](pharmind_mobile/lib/models/tipo_relacion.dart)
  - ✅ `TipoInteraccion` - [lib/models/tipo_interaccion.dart](pharmind_mobile/lib/models/tipo_interaccion.dart)

- **Servicios**
  - ✅ `MobileApiService` - [lib/services/mobile_api_service.dart](pharmind_mobile/lib/services/mobile_api_service.dart)

- **Pantallas**
  - ✅ `TestSyncScreen` - [lib/screens/test_sync_screen.dart](pharmind_mobile/lib/screens/test_sync_screen.dart)

---

## 📋 Pre-requisitos

### 1. Backend en ejecución
El backend debe estar corriendo en `http://localhost:5209`

```bash
cd Backend/PharMind.API
dotnet run
```

### 2. Base de datos configurada
Asegúrate de tener:
- SQL Server ejecutándose
- Base de datos PharMind con datos de prueba
- Al menos un agente creado
- Algunas relaciones e interacciones de prueba

### 3. Usuario de prueba
Necesitas credenciales de un usuario con rol de agente para las pruebas.

---

## 🧪 Métodos de Prueba

### Opción 1: Swagger UI (Prueba de Backend)

1. **Acceder a Swagger**
   ```
   http://localhost:5209/swagger
   ```

2. **Autenticarse**
   - Usar el endpoint `/api/Auth/login`
   - Copiar el token JWT
   - Hacer clic en "Authorize" en Swagger
   - Pegar el token en formato: `Bearer {tu-token}`

3. **Probar endpoints móviles**

   #### Sincronización Completa
   ```
   GET /api/mobile/sync?agenteId={guid-del-agente}
   ```
   Respuesta esperada:
   - Lista de relaciones del agente
   - Lista de interacciones
   - Lista de clientes relacionados
   - Tipos de relación e interacción
   - Totales y fecha de sincronización

   #### Dashboard
   ```
   GET /api/mobile/dashboard?agenteId={guid-del-agente}
   ```
   Respuesta esperada:
   - Total de relaciones
   - Interacciones de hoy, semana y mes
   - Interacciones agrupadas por tipo

   #### Obtener Relaciones
   ```
   GET /api/mobile/relaciones?agenteId={guid-del-agente}
   ```

   #### Obtener Interacciones
   ```
   GET /api/mobile/interacciones?agenteId={guid-del-agente}&desde=2024-01-01T00:00:00
   ```

---

### Opción 2: App Flutter (Prueba de Integración)

1. **Configurar el emulador/dispositivo**
   ```bash
   cd Mobile/pharmind_mobile
   flutter devices
   ```

2. **Ejecutar la app**
   ```bash
   flutter run
   ```

3. **Acceder a la pantalla de prueba**
   - Iniciar sesión con credenciales válidas
   - En el home, hacer clic en el botón verde:
     **"Test API Mobile - Fase 1"**

4. **Ejecutar pruebas individuales**

   La pantalla `TestSyncScreen` ofrece botones para probar:

   - ✅ **Sincronización Completa**
     - Descarga todos los datos del agente
     - Muestra totales en tarjetas

   - ✅ **Dashboard**
     - Muestra estadísticas del agente
     - Interacciones por tipo

   - ✅ **Obtener Relaciones**
     - Lista todas las relaciones
     - Muestra detalles en un diálogo

   - ✅ **Obtener Interacciones**
     - Lista interacciones de los últimos 30 días
     - Muestra detalles en un diálogo

5. **Observar resultados**
   - Los resultados se muestran en tarjetas debajo de los botones
   - Los errores se destacan en rojo
   - Los éxitos se muestran en azul/verde

---

## 🔍 Verificaciones Importantes

### 1. Autenticación
- ✅ El token JWT se incluye automáticamente en las peticiones
- ✅ Errores 401 se manejan apropiadamente

### 2. Manejo de Errores
- ✅ Errores de red se muestran claramente
- ✅ Errores 400/500 muestran mensajes descriptivos
- ✅ Timeout configurado en 30 segundos

### 3. Datos Correctos
- ✅ Solo se devuelven datos del agente autenticado
- ✅ Datos desnormalizados correctamente (nombres de clientes, tipos, etc.)
- ✅ Fechas en formato ISO 8601
- ✅ Datos dinámicos como JSON

### 4. Rendimiento
- ⏱️ Sincronización completa < 3 segundos (depende del volumen)
- ⏱️ Dashboard < 1 segundo
- ⏱️ Consultas individuales < 500ms

---

## 🐛 Problemas Comunes

### Error: "No se pudo conectar al servidor"
**Causa:** Backend no está corriendo o puerto incorrecto
**Solución:**
1. Verificar que el backend esté en http://localhost:5209
2. Verificar que `mobile_api_service.dart` tenga el puerto correcto

### Error: "No autorizado"
**Causa:** Token JWT expirado o no válido
**Solución:**
1. Cerrar sesión y volver a iniciar
2. Verificar que el usuario tenga rol de agente

### Error: "Argumento u opción no válido"
**Causa:** ID de agente no válido
**Solución:**
1. Usar un GUID válido de un agente existente
2. Verificar en la base de datos: `SELECT Id FROM Agentes`

### No se muestran datos
**Causa:** El agente no tiene relaciones/interacciones
**Solución:**
1. Crear datos de prueba en la base de datos
2. Usar la aplicación web para crear relaciones e interacciones

---

## 📊 Datos de Prueba Recomendados

Para una prueba completa, crear en la base de datos:

1. **1 Agente** con usuario asociado
2. **3-5 Relaciones** del agente con diferentes tipos
3. **10-15 Interacciones** de diferentes tipos (visitas, llamadas, emails)
4. **3-5 Clientes** relacionados
5. **2-3 Tipos de Relación** activos
6. **2-3 Tipos de Interacción** activos

---

## ✅ Checklist de Pruebas

### Backend
- [ ] MobileController compila sin errores
- [ ] Swagger muestra todos los endpoints /api/mobile/*
- [ ] Endpoint /sync retorna datos válidos
- [ ] Endpoint /dashboard retorna estadísticas correctas
- [ ] Endpoint /relaciones filtra por agenteId
- [ ] Endpoint /interacciones filtra por fechas
- [ ] Batch create funciona para múltiples interacciones

### Mobile
- [ ] Modelos deserializan JSON correctamente
- [ ] MobileApiService se conecta al backend
- [ ] TestSyncScreen muestra datos sincronizados
- [ ] Errores se muestran apropiadamente
- [ ] Loading indicators funcionan
- [ ] Navegación entre pantallas funciona

### Integración
- [ ] Token JWT se incluye en headers
- [ ] Solo se muestran datos del agente autenticado
- [ ] Sincronización incremental funciona (con ultimaSincronizacion)
- [ ] Datos desnormalizados son correctos
- [ ] Geolocalización se transmite correctamente

---

## 📝 Notas de Implementación

### Optimizaciones Aplicadas
- ✅ Datos desnormalizados para reducir consultas
- ✅ Sincronización incremental con parámetro de fecha
- ✅ Batch operations para offline sync
- ✅ Filtrado server-side por agente
- ✅ Includes optimizados en EF Core

### Pendiente para Fase 2
- ⏳ Almacenamiento local en SQLite
- ⏳ Queue de sincronización offline
- ⏳ Provider para estado global
- ⏳ UI de Mi Cartera
- ⏳ Formularios dinámicos

---

## 🎯 Próximos Pasos

Una vez verificadas todas las pruebas de Fase 1:

1. **Fase 2**: Implementar Mi Cartera Screen
   - Lista de relaciones con filtros
   - Vista de mosaico y lista
   - Búsqueda
   - Detalles de relación

2. **Fase 3**: Offline-First Implementation
   - DatabaseService con SQLite
   - SyncService con cola
   - Gestión de conflictos

3. **Fase 4**: UI/UX Polish
   - Animaciones
   - Responsive design
   - Optimizaciones de rendimiento

---

## 📞 Soporte

Si encuentras problemas durante las pruebas:
1. Revisa los logs de la consola del backend
2. Verifica los prints en la consola de Flutter
3. Usa el debugger de VS Code
4. Consulta la documentación de Swagger
