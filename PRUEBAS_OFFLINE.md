# Guía de Pruebas de Funcionalidad Offline

## Resumen

PharMind Mobile está diseñado para funcionar sin conexión a internet. Esta guía explica cómo probar y verificar que todo funcione correctamente en modo offline.

---

## 🎯 Objetivos de las Pruebas Offline

1. Verificar que el usuario pueda usar la app sin conexión
2. Confirmar que los datos se guardan localmente
3. Asegurar que la sincronización funcione cuando vuelva la conexión
4. Probar el sistema de cola de sincronización

---

## 📱 Pantalla de Pruebas Offline

He creado una pantalla especial de diagnóstico ubicada en el **Home Screen** con el nombre **"Pruebas Offline"** (botón naranja).

### Funcionalidades de la Pantalla:

1. **Estado de Conexión**
   - Muestra si hay conexión a Internet
   - Indica si el modo offline está activo

2. **Cola de Sincronización**
   - Número de operaciones pendientes
   - Desglose por tipo (Relaciones/Interacciones)

3. **Cache Local**
   - Datos almacenados localmente
   - Usuarios en cache

4. **Acciones Disponibles**:
   - **Probar Conexión a API**: Verifica si el backend responde
   - **Forzar Sincronización**: Procesa la cola manualmente
   - **Ver Detalles de Cola**: Lista todas las operaciones pendientes
   - **Limpiar Cola**: Elimina todas las operaciones pendientes (⚠️ cuidado)
   - **Limpiar Base de Datos**: Borra TODOS los datos locales (⚠️⚠️ extremo cuidado)

---

## 🧪 Plan de Pruebas

### 1. Preparación Inicial

**Paso 1**: Iniciar sesión normalmente con conexión
```
1. Abrir la app
2. Login con credenciales válidas
3. Esperar que descargue datos iniciales
4. Verificar que aparezcan relaciones/interacciones
```

**Paso 2**: Ir a la pantalla de Pruebas Offline
```
1. En Home, hacer clic en "Pruebas Offline"
2. Verificar que muestra "Conectado a Internet"
3. Verificar que "Cola de Sincronización" muestre 0 operaciones
```

---

### 2. Simular Pérdida de Conexión

Hay **3 formas** de simular modo offline:

#### Opción A: Modo Avión (Recomendado)
```
1. Activar modo avión en el dispositivo/emulador
2. Pull-to-refresh en Pruebas Offline
3. Debe mostrar "Sin conexión"
```

#### Opción B: Desconectar WiFi/Datos
```
1. Desactivar WiFi y datos móviles
2. Pull-to-refresh en Pruebas Offline
3. Debe mostrar "Sin conexión"
```

#### Opción C: Apagar el Backend (Desarrollo)
```
1. Detener el servidor backend (dotnet run)
2. Pull-to-refresh en Pruebas Offline
3. "Probar Conexión a API" debe fallar
```

---

### 3. Pruebas de Operaciones Offline

#### Test 1: Editar una Relación Existente

**Objetivo**: Verificar que los cambios se guardan localmente

```
Pasos:
1. Sin conexión, ir a "Mi Cartera"
2. Seleccionar una relación existente
3. Hacer clic en el ícono de edición (lápiz)
4. Cambiar campos como:
   - Prioridad: de A a B
   - Frecuencia de Visitas: cambiar el número
   - Observaciones: agregar texto
5. Guardar

Resultado Esperado:
✅ Cambios se guardan localmente
✅ Aparece en "Pruebas Offline" > Cola: 1 operación pendiente (updateRelacion)
✅ La relación muestra los nuevos datos en la UI
```

#### Test 2: Crear una Nueva Interacción

**Objetivo**: Verificar que se pueden crear interacciones offline

```
Pasos:
1. Sin conexión, ir a "Mi Cartera"
2. Seleccionar una relación
3. Hacer clic en "Nueva Interacción"
4. Llenar el formulario:
   - Tipo de Interacción
   - Fecha
   - Observaciones
   - Productos (opcional)
5. Guardar

Resultado Esperado:
✅ Interacción se guarda con ID temporal
✅ Cola de sincronización aumenta
✅ La interacción aparece en el historial
```

#### Test 3: Agregar Productos a una Interacción

**Objetivo**: Verificar que los productos se manejan correctamente offline

```
Pasos:
1. Sin conexión, crear/editar una interacción
2. Agregar:
   - Productos promocionados
   - Muestras entregadas
   - Productos solicitados
3. Guardar

Resultado Esperado:
✅ Productos se guardan en la interacción
✅ Los datos persisten al reabrir
```

---

### 4. Restaurar Conexión y Sincronizar

#### Test 4: Sincronización Automática

**Objetivo**: Verificar que los cambios se sincronizan automáticamente

```
Pasos:
1. Con operaciones en cola, restaurar la conexión:
   - Desactivar modo avión
   - Reconectar WiFi
2. Volver a la pantalla de Pruebas Offline
3. Pull-to-refresh

Resultado Esperado:
✅ "Estado de Conexión" muestra "Conectado a Internet"
✅ Al hacer pull-to-refresh en pantallas, debe sincronizar
✅ Cola de sincronización debe procesarse gradualmente
```

#### Test 5: Sincronización Manual

**Objetivo**: Forzar sincronización inmediata

```
Pasos:
1. Con conexión restaurada
2. Ir a "Pruebas Offline"
3. Hacer clic en "Forzar Sincronización"

Resultado Esperado:
✅ Mensaje de éxito mostrando:
   - N exitosos
   - 0 fallos
   - 0 removidos
✅ Cola de sincronización debe quedar en 0
✅ Los cambios deben aparecer en el backend/web
```

---

### 5. Pruebas de Conflictos

#### Test 6: Estrategia Last Write Wins

**Objetivo**: Verificar que las actualizaciones más recientes ganan

```
Escenario:
1. Dispositivo A sin conexión: Edita Relación X (Prioridad = A)
2. Dispositivo B con conexión: Edita Relación X (Prioridad = B)
3. Dispositivo A recupera conexión y sincroniza

Resultado Esperado:
✅ La prioridad final es A (última escritura)
✅ No hay errores en la sincronización
```

---

### 6. Pruebas de Límites

#### Test 7: Múltiples Operaciones en Cola

**Objetivo**: Verificar que la cola maneja muchas operaciones

```
Pasos:
1. Sin conexión
2. Hacer múltiples cambios:
   - Editar 5 relaciones diferentes
   - Crear 3 interacciones nuevas
   - Editar 2 interacciones existentes
3. Verificar en "Pruebas Offline" que muestra 10 operaciones
4. Restaurar conexión
5. Sincronizar

Resultado Esperado:
✅ Todas las operaciones se sincronizan correctamente
✅ No se pierden datos
✅ El orden de las operaciones se respeta
```

#### Test 8: Reintentos de Sincronización

**Objetivo**: Verificar el sistema de reintentos

```
Pasos:
1. Crear operaciones offline
2. Intentar sincronizar SIN conexión (debe fallar)
3. Las operaciones deben tener retryCount = 1
4. Intentar 2 veces más (retryCount = 2, 3)
5. Al 3er intento fallido, la operación se debe remover

Resultado Esperado:
✅ Sistema reintenta hasta 3 veces
✅ Después del 3er fallo, elimina la operación
✅ Muestra mensaje de operaciones removidas
```

---

## 🐛 Problemas Conocidos a Verificar

### 1. Cache de Datos Maestros

**Problema Potencial**: Tipos de Relación/Interacción no disponibles offline

**Verificar**:
- [ ] Al crear una relación offline, los tipos aparecen
- [ ] Al crear una interacción offline, los tipos aparecen
- [ ] Los schemas dinámicos se cargan correctamente

**Si falla**: Necesitamos implementar cache para TipoRelacion y TipoInteraccion

---

### 2. Cache de Productos

**Problema Potencial**: Productos no disponibles offline

**Verificar**:
- [ ] Al agregar productos a una interacción offline, aparecen
- [ ] El filtro de muestras funciona
- [ ] La búsqueda de productos funciona

**Si falla**: Necesitamos implementar cache para Productos

---

### 3. Imágenes y Archivos

**Problema Potencial**: Archivos adjuntos no disponibles offline

**Verificar**:
- [ ] Las fotos de perfil de clientes se muestran
- [ ] Los íconos de tipos se muestran

**Si falla**: Implementar cache de assets

---

## 📊 Métricas a Monitorear

Durante las pruebas, registrar:

1. **Tiempos de Respuesta**
   - Creación de relación offline: < 500ms
   - Creación de interacción offline: < 500ms
   - Sincronización de 10 operaciones: < 5s

2. **Uso de Almacenamiento**
   - Tamaño de la base de datos SQLite
   - Cantidad de registros en cache

3. **Tasa de Éxito de Sincronización**
   - % de operaciones sincronizadas correctamente
   - % de operaciones con errores
   - % de operaciones removidas después de reintentos

---

## 🔍 Verificación en el Backend

Después de sincronizar, verificar en el backend:

```sql
-- Ver relaciones actualizadas
SELECT * FROM Relaciones WHERE FechaModificacion > DATEADD(minute, -10, GETDATE());

-- Ver interacciones creadas
SELECT * FROM Interacciones WHERE FechaCreacion > DATEADD(minute, -10, GETDATE());

-- Ver productos en interacciones
SELECT * FROM ProductosPromocionados;
SELECT * FROM MuestrasEntregadas;
SELECT * FROM ProductosSolicitados;
```

O en la aplicación web:
1. Ir a "Relaciones"
2. Buscar las relaciones modificadas
3. Verificar que los cambios aparecen

---

## 🚀 Herramientas de Diagnóstico

### Logs en Flutter

La app imprime logs útiles en la consola:

```
✅ Operación agregada a la cola: updateRelacion - abc123
📤 Procesando 5 items pendientes...
✅ Item sincronizado: updateRelacion - abc123
🏁 Sincronización completada: 5 éxitos, 0 fallos, 0 removidos
```

### Ver Logs en Tiempo Real

```bash
# Android
adb logcat | grep -i pharmind

# iOS
# En Xcode: View > Debug Area > Activate Console
```

---

## ✅ Checklist Final

Antes de considerar el modo offline como funcional:

- [ ] Login funciona (con fallback offline)
- [ ] Datos se descargan y cachean correctamente
- [ ] Creación de entidades offline funciona
- [ ] Edición de entidades offline funciona
- [ ] Cola de sincronización almacena operaciones
- [ ] Sincronización automática funciona
- [ ] Sincronización manual funciona
- [ ] Sistema de reintentos funciona
- [ ] Conflictos se resuelven (Last Write Wins)
- [ ] No se pierden datos
- [ ] Performance es aceptable
- [ ] UI muestra claramente el estado offline

---

## 📝 Próximos Pasos

### Mejoras Pendientes:

1. **Cache de Datos Maestros**
   - Implementar cache para TipoRelacion
   - Implementar cache para TipoInteraccion
   - Implementar cache para Productos
   - Implementar cache para Clientes

2. **Indicadores Visuales**
   - Badge en items no sincronizados
   - Indicador de progreso durante sincronización
   - Notificación cuando sincronización completa

3. **Sincronización Inteligente**
   - Sincronizar solo cambios (delta sync)
   - Detectar y resolver conflictos avanzados
   - Comprimir datos en la cola

4. **Pruebas Automatizadas**
   - Tests unitarios para cola de sincronización
   - Tests de integración offline
   - Tests de performance

---

## 💡 Consejos para Desarrollo

1. **Siempre probar sin conexión primero**: Desarrolla asumiendo que no hay internet
2. **Usar IDs temporales**: Genera GUIDs locales para nuevas entidades
3. **Marcar entidades no sincronizadas**: Usa flags `sincronizada` en los modelos
4. **Logs detallados**: Imprime cada operación de la cola
5. **Manejo de errores robusto**: No crashear si la sincronización falla

---

## 🆘 Solución de Problemas

### Problema: "Cola de sincronización no se vacía"

**Soluciones**:
1. Verificar logs en la consola para ver errores
2. Usar "Ver Detalles de Cola" para ver qué operaciones fallan
3. Verificar que el backend esté corriendo
4. Verificar que el token no haya expirado

### Problema: "Cambios no aparecen después de sincronizar"

**Soluciones**:
1. Hacer pull-to-refresh en la pantalla
2. Cerrar y reabrir la app
3. Verificar en el backend que los datos llegaron
4. Revisar logs de errores

### Problema: "App muy lenta offline"

**Soluciones**:
1. Verificar tamaño de la base de datos SQLite
2. Agregar índices a tablas frecuentes
3. Limitar cantidad de datos cacheados
4. Implementar paginación en listas

---

## 📞 Contacto

Para reportar bugs o sugerencias sobre el modo offline:
- Crear un issue en el repositorio
- Documentar pasos para reproducir
- Incluir logs de la consola
- Indicar dispositivo y versión de la app

---

**Última actualización**: 2025-11-11
**Versión**: 1.0.0
