# Implementación de Productos/Muestras Médicas y Sistema de Calendario

## ✅ COMPLETADO

### **Backend - Base de Datos**

#### Modelos Creados (C#)
1. **`Producto.cs`** - Catálogo de productos farmacéuticos
   - CodigoProducto, Nombre, NombreComercial, Presentación
   - Categoría, Laboratorio, PrincipioActivo, Concentración
   - Indicaciones, Contraindicaciones, PrecioReferencia
   - Flags: EsMuestra, RequiereReceta, Activo

2. **`InventarioAgente.cs`** - Stock de productos por agente
   - CantidadDisponible, CantidadInicial, CantidadEntregada
   - LoteActual, FechaVencimiento, FechaUltimaRecarga

3. **`MuestraMedica.cs`** - Muestras entregadas en interacciones
   - Vinculado a Interacción, Producto, Cliente
   - Cantidad, Lote, FechaEntrega
   - FirmaDigital (Base64), FotoComprobante

4. **`MovimientoInventario.cs`** - Historial de movimientos
   - TipoMovimiento (Entrada/Salida/Ajuste)
   - CantidadAnterior, CantidadNueva, Motivo

5. **`Cita.cs`** - Sistema de calendario y citas
   - Título, Descripción, FechaInicio, FechaFin
   - TipoCita (Visita/Llamada/Evento/Reunión)
   - Estado (Programada/Completada/Cancelada/Reprogramada)
   - Prioridad, Ubicación (con lat/long)
   - Recordatorio, MinutosAntes
   - Orden (para optimización de rutas), DistanciaKm

#### Base de Datos
- ✅ Tablas creadas en SQL Server
- ✅ Foreign Keys configuradas
- ✅ Índices únicos (CodigoProducto, CodigoCita)
- ✅ Relaciones con LineasNegocio, Agentes, Clientes, Interacciones
- ✅ Script: `create_productos_citas.sql`

#### Datos de Prueba
- ✅ 10 Productos farmacéuticos (Paracetamol, Ibuprofeno, Amoxicilina, etc.)
- ✅ 3 Inventarios para el primer agente
- ✅ 5 Citas de ejemplo (hoy, mañana, próxima semana)
- ✅ Script: `seed_productos_citas.sql`

#### DbContext
- ✅ DbSets agregados: Productos, InventariosAgente, MuestrasMedicas, MovimientosInventario, Citas
- ✅ Configuración de relaciones en OnModelCreating
- ✅ Migración: `20251110025608_AddProductosYCitas`

---

### **Mobile - Flutter**

#### Modelos Dart Creados
1. **`producto.dart`** - Modelo de Producto
   - fromJson/toJson, copyWith
   - Propiedades completas del producto

2. **`inventario_agente.dart`** - Modelo de Inventario
   - Helpers: `estaPorVencer`, `estaVencido`, `stockBajo`
   - Relación opcional con Producto

3. **`muestra_medica.dart`** - Modelo de Muestra
   - Soporte para firma digital y foto
   - Vinculación con interacción

4. **`cita.dart`** - Modelo de Cita
   - Helpers: `esHoy`, `yaPaso`, `enProgreso`, `duracionMinutos`, `debeNotificar`
   - Propiedades completas del calendario

#### Servicios Dart Creados
1. **`producto_service.dart`**
   - `getProductos()` - Listar todos
   - `getProducto(id)` - Obtener uno
   - `getProductosPorCategoria(categoria)`
   - `getInventarioAgente(agenteId)`
   - `actualizarInventario(id, cantidad)`
   - `buscarProductos(query)`

2. **`cita_service.dart`**
   - `getCitasAgente(agenteId, desde, hasta)`
   - `getCitasHoy(agenteId)`
   - `getCitasSemana(agenteId)`
   - `getCitasMes(agenteId, year, month)`
   - `crearCita(cita)`
   - `actualizarCita(id, cita)`
   - `eliminarCita(id)`
   - `cambiarEstado(id, estado)`
   - `completarCita(id, interaccionId)`

---

## 📋 PENDIENTE - Próximos Pasos

### **1. Backend - DTOs y Controladores**

#### DTOs a Crear (`Backend/PharMind.API/DTOs/`)
```csharp
// ProductoDto.cs
public class ProductoDto
{
    public string Id { get; set; }
    public string CodigoProducto { get; set; }
    public string Nombre { get; set; }
    public string? NombreComercial { get; set; }
    public string? Presentacion { get; set; }
    public string? Categoria { get; set; }
    public bool EsMuestra { get; set; }
    // ... resto de propiedades
}

// InventarioAgenteDto.cs
public class InventarioAgenteDto
{
    public string Id { get; set; }
    public string ProductoId { get; set; }
    public ProductoDto? Producto { get; set; }
    public int CantidadDisponible { get; set; }
    public string? LoteActual { get; set; }
    // ... resto
}

// CitaDto.cs
public class CitaDto
{
    public string Id { get; set; }
    public string CodigoCita { get; set; }
    public string Titulo { get; set; }
    public DateTime FechaInicio { get; set; }
    public DateTime FechaFin { get; set; }
    public string Estado { get; set; }
    public string? ClienteNombre { get; set; }
    // ... resto
}

// CreateCitaDto.cs, UpdateCitaDto.cs
// CreateMuestraMedicaDto.cs
```

#### Controladores a Crear

**`ProductosController.cs`**
```csharp
[ApiController]
[Route("api/[controller]")]
public class ProductosController : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<ProductoDto>>> GetProductos()

    [HttpGet("{id}")]
    public async Task<ActionResult<ProductoDto>> GetProducto(string id)

    [HttpGet("categoria/{categoria}")]
    public async Task<ActionResult<List<ProductoDto>>> GetPorCategoria(string categoria)

    [HttpGet("buscar")]
    public async Task<ActionResult<List<ProductoDto>>> Buscar([FromQuery] string q)
}
```

**`InventariosController.cs`**
```csharp
[HttpGet("agente/{agenteId}")]
public async Task<ActionResult<List<InventarioAgenteDto>>> GetInventarioAgente(string agenteId)

[HttpPut("{id}")]
public async Task<ActionResult<InventarioAgenteDto>> ActualizarInventario(string id, UpdateInventarioDto dto)

[HttpPost("{id}/recarga")]
public async Task<ActionResult> RegistrarRecarga(string id, RecargaInventarioDto dto)
```

**`CitasController.cs`**
```csharp
[HttpGet]
public async Task<ActionResult<List<CitaDto>>> GetCitas(
    [FromQuery] string agenteId,
    [FromQuery] DateTime? desde,
    [FromQuery] DateTime? hasta)

[HttpGet("{id}")]
public async Task<ActionResult<CitaDto>> GetCita(string id)

[HttpPost]
public async Task<ActionResult<CitaDto>> CrearCita([FromBody] CreateCitaDto dto)

[HttpPut("{id}")]
public async Task<ActionResult<CitaDto>> ActualizarCita(string id, [FromBody] UpdateCitaDto dto)

[HttpPatch("{id}/estado")]
public async Task<ActionResult<CitaDto>> CambiarEstado(string id, [FromBody] CambiarEstadoDto dto)

[HttpPatch("{id}/completar")]
public async Task<ActionResult<CitaDto>> CompletarCita(string id, [FromBody] CompletarCitaDto dto)

[HttpDelete("{id}")]
public async Task<ActionResult> EliminarCita(string id)
```

#### Actualizar MobileController
```csharp
// Agregar a MobileSyncResponse
public List<ProductoDto> Productos { get; set; }
public List<InventarioAgenteDto> Inventarios { get; set; }
public List<CitaDto> Citas { get; set; }

// En método SyncData
response.Productos = await GetProductosActivos();
response.Inventarios = await GetInventarioAgente(agenteId);
response.Citas = await GetCitasAgente(agenteId, ultimaSincronizacion);
```

---

### **2. Mobile - UI Screens**

#### Catálogo de Productos (`lib/screens/productos/`)

**`productos_page.dart`** - Pantalla principal
```dart
- ListView de productos con búsqueda
- Filtros por categoría
- Card por producto con:
  - Nombre comercial y genérico
  - Presentación
  - Laboratorio
  - Badge "Muestra" si esMuestra
  - Badge "Receta" si requiereReceta
```

**`producto_detalle_page.dart`** - Detalle de producto
```dart
- Información completa
- Indicaciones y contraindicaciones
- Precio de referencia
- Botón "Agregar a Interacción" (para muestras)
```

#### Inventario (`lib/screens/inventario/`)

**`inventario_page.dart`**
```dart
- Lista de productos en inventario
- Indicadores visuales:
  - Stock bajo (rojo)
  - Por vencer (amarillo)
  - Vencido (gris)
- Stock disponible vs entregado
- Lote y fecha de vencimiento
- Botón para registrar recarga
```

**`recarga_inventario_dialog.dart`**
```dart
- Formulario para recarga:
  - Cantidad
  - Lote
  - Fecha de vencimiento
```

#### Calendario (`lib/screens/calendario/`)

**`calendario_page.dart`** - Vista principal
```dart
- TabBar: Día / Semana / Mes
- Vista de día: Timeline con citas
- Vista de semana: Grid 7 columnas
- Vista de mes: Calendario mensual con dots
- FloatingActionButton para nueva cita
```

**`cita_detalle_page.dart`**
```dart
- Información de la cita
- Mapa con ubicación (si tiene coordenadas)
- Botones:
  - Editar
  - Completar (vincular con interacción)
  - Cancelar
  - Reprogramar
```

**`crear_cita_page.dart`** / **`editar_cita_page.dart`**
```dart
FormFields:
- Título (required)
- Cliente/Relación (selector)
- Fecha y hora inicio
- Fecha y hora fin
- Todo el día (switch)
- Tipo de cita (dropdown)
- Prioridad (dropdown)
- Ubicación (text + mapa picker)
- Recordatorio (switch)
- Minutos antes (number)
- Descripción/Notas
```

#### Integración en Interacciones

**Actualizar `crear_interaccion_page.dart`**
```dart
// Agregar sección "Muestras Entregadas"
- Selector multi-producto
- Cantidad por producto
- Actualización automática de inventario
- Opción para capturar firma digital
- Opción para foto de comprobante
```

---

### **3. Paquetes Flutter Necesarios**

Agregar a `pubspec.yaml`:
```yaml
dependencies:
  # Calendario
  table_calendar: ^3.0.9
  syncfusion_flutter_calendar: ^24.1.41  # Alternativa profesional

  # Mapas
  google_maps_flutter: ^2.5.0
  geolocator: ^10.1.0
  geocoding: ^2.1.1

  # Notificaciones
  flutter_local_notifications: ^16.3.0
  timezone: ^0.9.2

  # Firma digital
  signature: ^5.4.1

  # Cámara
  image_picker: ^1.0.5
  camera: ^0.10.5+5

  # QR/Barcode (para códigos de producto)
  qr_code_scanner: ^1.0.1
```

---

### **4. Funcionalidades Avanzadas**

#### Optimización de Rutas
```dart
// lib/services/ruta_service.dart
- Algoritmo para ordenar citas por proximidad
- Integración con Google Maps Directions API
- Cálculo de distancia y tiempo entre citas
- Actualización automática de campo Orden y DistanciaKm
```

#### Notificaciones Locales
```dart
// lib/services/notificacion_service.dart
- Programar notificación al crear cita
- Notificación X minutos antes
- Cancelar al completar/cancelar cita
- Deep linking a detalle de cita
```

#### Sincronización Mejorada
```dart
// Actualizar lib/services/sync_service.dart

Future<SyncStats> sincronizarCompleto() async {
  // 1. Descargar productos y citas
  final productos = await productoService.getProductos();
  final inventarios = await productoService.getInventarioAgente(agenteId);
  final citas = await citaService.getCitasMes(agenteId);

  // 2. Guardar en DB local
  await db.guardarProductos(productos);
  await db.guardarInventarios(inventarios);
  await db.guardarCitas(citas);

  // 3. Subir muestras creadas offline
  final muestrasPendientes = await db.getMuestrasNoSincronizadas();
  for (var muestra in muestrasPendientes) {
    await mobileApiService.crearMuestra(muestra);
  }

  // 4. Subir citas creadas offline
  final citasPendientes = await db.getCitasNoSincronizadas();
  for (var cita in citasPendientes) {
    await citaService.crearCita(cita);
  }
}
```

---

### **5. Dashboard Mejorado**

Agregar widgets en `lib/screens/dashboard_page.dart`:

```dart
// Métricas de Productos
- Total de muestras entregadas (mes)
- Producto más entregado
- Stock bajo (alertas)
- Productos por vencer

// Métricas de Calendario
- Citas hoy
- Citas pendientes
- % de cumplimiento (completadas vs programadas)
- Próxima cita (countdown)

// Widget: Calendario miniatura del mes
- Dots en días con citas
- Colores por prioridad
```

---

## 📊 Estructura de Archivos Completa

```
Backend/PharMind.API/
├── Models/
│   ├── Producto.cs ✅
│   ├── InventarioAgente.cs ✅
│   ├── MuestraMedica.cs ✅
│   ├── MovimientoInventario.cs ✅
│   └── Cita.cs ✅
├── DTOs/
│   ├── ProductoDto.cs ⏳
│   ├── InventarioAgenteDto.cs ⏳
│   ├── CitaDto.cs ⏳
│   └── ... (Create/Update DTOs) ⏳
├── Controllers/
│   ├── ProductosController.cs ⏳
│   ├── InventariosController.cs ⏳
│   ├── CitasController.cs ⏳
│   └── MobileController.cs (actualizar) ⏳
└── Data/
    └── PharMindDbContext.cs ✅

Mobile/pharmind_mobile/lib/
├── models/
│   ├── producto.dart ✅
│   ├── inventario_agente.dart ✅
│   ├── muestra_medica.dart ✅
│   └── cita.dart ✅
├── services/
│   ├── producto_service.dart ✅
│   ├── cita_service.dart ✅
│   ├── ruta_service.dart ⏳
│   └── notificacion_service.dart ⏳
├── screens/
│   ├── productos/
│   │   ├── productos_page.dart ⏳
│   │   └── producto_detalle_page.dart ⏳
│   ├── inventario/
│   │   ├── inventario_page.dart ⏳
│   │   └── recarga_inventario_dialog.dart ⏳
│   └── calendario/
│       ├── calendario_page.dart ⏳
│       ├── cita_detalle_page.dart ⏳
│       ├── crear_cita_page.dart ⏳
│       └── widgets/ (day_view, week_view, month_view) ⏳
└── widgets/
    ├── producto_card.dart ⏳
    ├── inventario_card.dart ⏳
    └── cita_card.dart ⏳
```

---

## 🎯 Plan de Implementación Sugerido

### **Fase 1: Backend API (1-2 días)**
1. Crear DTOs
2. Crear ProductosController
3. Crear InventariosController
4. Crear CitasController
5. Actualizar MobileController.SyncData
6. Probar endpoints con Postman

### **Fase 2: Mobile Productos (2-3 días)**
7. UI de catálogo de productos
8. UI de inventario del agente
9. Integrar entrega de muestras en interacciones
10. Probar flujo completo

### **Fase 3: Mobile Calendario (3-4 días)**
11. UI de calendario (día/semana/mes)
12. CRUD de citas
13. Notificaciones locales
14. Optimización de rutas con Google Maps
15. Probar flujo completo

### **Fase 4: Integración y Pulido (1-2 días)**
16. Actualizar sincronización completa
17. Actualizar dashboard con nuevas métricas
18. Testing end-to-end
19. Corrección de bugs

---

## 🚀 Comandos Útiles

### Ejecutar Backend
```bash
cd Backend/PharMind.API
dotnet run
```

### Ejecutar Mobile
```bash
cd Mobile/pharmind_mobile
flutter run
```

### Verificar Base de Datos
```sql
-- Ver productos
SELECT * FROM Productos;

-- Ver inventario
SELECT ia.*, p.Nombre
FROM InventariosAgente ia
JOIN Productos p ON ia.ProductoId = p.Id;

-- Ver citas del día
SELECT * FROM Citas
WHERE CAST(FechaInicio AS DATE) = CAST(GETDATE() AS DATE);
```

---

## ✅ Checklist de Testing

- [ ] Productos se listan correctamente en mobile
- [ ] Inventario muestra stock correcto
- [ ] Entrega de muestras descuenta inventario
- [ ] Calendario muestra citas por día/semana/mes
- [ ] Crear cita funciona
- [ ] Editar cita actualiza correctamente
- [ ] Completar cita vincula con interacción
- [ ] Notificaciones se programan correctamente
- [ ] Sincronización descarga/sube datos
- [ ] Modo offline funciona para crear citas
- [ ] Dashboard muestra métricas actualizadas

---

**Última actualización:** 2025-11-10
**Estado:** Fase 1 completada (Backend DB + Mobile Models/Services)
**Siguiente:** DTOs y Controladores Backend
