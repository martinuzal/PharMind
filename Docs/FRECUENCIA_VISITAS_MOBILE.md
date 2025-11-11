# Implementación de Indicador de Frecuencia de Visitas - Mobile

## Resumen

Este documento describe la implementación del indicador de frecuencia de visitas (semáforo) para la aplicación móvil Flutter. Esta funcionalidad ya está implementada en el Backend y el Frontend Web, y debe ser replicada en Mobile.

## Estado del Backend

El Backend está **completamente implementado** y listo para ser consumido por Mobile:

### API Endpoint Disponible
- **GET** `/api/relaciones?page=1&pageSize=100&incluirFrecuencia=true&soloConPendientes=false`

### Estructura del DTO

```csharp
public class FrecuenciaIndicadorDto
{
    public int InteraccionesRealizadas { get; set; }
    public int FrecuenciaObjetivo { get; set; }
    public string PeriodoMedicion { get; set; }
    public DateTime FechaInicioPeriodo { get; set; }
    public DateTime FechaFinPeriodo { get; set; }
    public string Estado { get; set; } // "gris", "amarillo", "verde", "azul"
    public int VisitasPendientes { get; set; }
}

public class RelacionDto
{
    // ... campos existentes ...
    public FrecuenciaIndicadorDto? Frecuencia { get; set; }
}
```

## Lógica de Negocio

### Colores del Semáforo

1. **Gris (#6c757d)**: Sin interacciones en el período actual
2. **Amarillo (#ffc107)**: Interacciones realizadas < Frecuencia objetivo (hay visitas pendientes)
3. **Verde (#28a745)**: Interacciones realizadas = Frecuencia objetivo (meta cumplida)
4. **Azul (#17a2b8)**: Interacciones realizadas > Frecuencia objetivo (meta superada)

### Cálculo de Frecuencia

- El servicio `FrecuenciaVisitasService` calcula automáticamente:
  - Cuenta interacciones del período actual (obtenido de tabla `Periods`)
  - Filtra solo tipos de interacción con `medirFrecuencia = true` en su configuración
  - Suma todas las interacciones de tipos que usen el mismo `periodoEvaluacion`
  - Compara contra `FrecuenciaVisitas` definido en la relación

## Implementación en Mobile (Flutter)

### 1. Actualizar Modelos de Datos

Ubicación: `Mobile/pharmind_mobile/lib/models/`

```dart
class FrecuenciaIndicador {
  final int interaccionesRealizadas;
  final int frecuenciaObjetivo;
  final String periodoMedicion;
  final DateTime fechaInicioPeriodo;
  final DateTime fechaFinPeriodo;
  final String estado; // 'gris', 'amarillo', 'verde', 'azul'
  final int visitasPendientes;

  FrecuenciaIndicador({
    required this.interaccionesRealizadas,
    required this.frecuenciaObjetivo,
    required this.periodoMedicion,
    required this.fechaInicioPeriodo,
    required this.fechaFinPeriodo,
    required this.estado,
    required this.visitasPendientes,
  });

  factory FrecuenciaIndicador.fromJson(Map<String, dynamic> json) {
    return FrecuenciaIndicador(
      interaccionesRealizadas: json['interaccionesRealizadas'] ?? 0,
      frecuenciaObjetivo: json['frecuenciaObjetivo'] ?? 0,
      periodoMedicion: json['periodoMedicion'] ?? '',
      fechaInicioPeriodo: DateTime.parse(json['fechaInicioPeriodo']),
      fechaFinPeriodo: DateTime.parse(json['fechaFinPeriodo']),
      estado: json['estado'] ?? 'gris',
      visitasPendientes: json['visitasPendientes'] ?? 0,
    );
  }
}

class Relacion {
  // ... campos existentes ...
  final FrecuenciaIndicador? frecuencia;

  // Actualizar constructor y fromJson para incluir frecuencia
}
```

### 2. Crear Widget de Indicador

Ubicación: `Mobile/pharmind_mobile/lib/widgets/frecuencia_indicator.dart`

```dart
import 'package:flutter/material.dart';
import '../models/relacion.dart';

class FrecuenciaIndicator extends StatelessWidget {
  final FrecuenciaIndicador? frecuencia;
  final bool showTooltip;

  const FrecuenciaIndicator({
    Key? key,
    this.frecuencia,
    this.showTooltip = true,
  }) : super(key: key);

  Color _getColor() {
    if (frecuencia == null) return const Color(0xFF6c757d); // gris

    switch (frecuencia!.estado) {
      case 'amarillo':
        return const Color(0xFFffc107);
      case 'verde':
        return const Color(0xFF28a745);
      case 'azul':
        return const Color(0xFF17a2b8);
      default:
        return const Color(0xFF6c757d); // gris
    }
  }

  String _getTooltipText() {
    if (frecuencia == null) return 'Sin datos de frecuencia';

    String statusText;
    switch (frecuencia!.estado) {
      case 'gris':
        statusText = 'Sin visitas registradas';
        break;
      case 'amarillo':
        statusText = '${frecuencia!.visitasPendientes} visita(s) pendiente(s)';
        break;
      case 'verde':
        statusText = 'Objetivo cumplido';
        break;
      case 'azul':
        statusText = 'Objetivo superado';
        break;
      default:
        statusText = 'Estado desconocido';
    }

    return '${frecuencia!.interaccionesRealizadas}/${frecuencia!.frecuenciaObjetivo} visitas - $statusText\nPeríodo: ${frecuencia!.periodoMedicion}';
  }

  @override
  Widget build(BuildContext context) {
    return Tooltip(
      message: showTooltip ? _getTooltipText() : '',
      child: Container(
        width: 5,
        decoration: BoxDecoration(
          color: _getColor(),
          borderRadius: const BorderRadius.only(
            topLeft: Radius.circular(2),
            bottomLeft: Radius.circular(2),
          ),
        ),
      ),
    );
  }
}
```

### 3. Integrar en Lista de Relaciones

Ubicación: `Mobile/pharmind_mobile/lib/screens/relaciones_screen.dart`

```dart
// En el Card o ListTile de cada relación:
Card(
  child: Row(
    children: [
      // Agregar el indicador de frecuencia
      FrecuenciaIndicator(frecuencia: relacion.frecuencia),
      Expanded(
        child: ListTile(
          // ... contenido existente ...
        ),
      ),
    ],
  ),
)
```

### 4. Agregar Filtro de Pendientes

```dart
// En el estado del screen:
bool _soloConPendientes = false;

// En el AppBar o área de filtros:
FilterChip(
  label: const Text('Pendientes'),
  selected: _soloConPendientes,
  onSelected: (selected) {
    setState(() {
      _soloConPendientes = selected;
    });
  },
  avatar: const Icon(Icons.event_busy),
)

// En la lógica de filtrado:
List<Relacion> get relacionesFiltradas {
  var filtered = relaciones;

  if (_soloConPendientes) {
    filtered = filtered.where((rel) =>
      rel.frecuencia != null &&
      rel.frecuencia!.visitasPendientes > 0
    ).toList();
  }

  return filtered;
}
```

### 5. Actualizar Servicio API

Ubicación: `Mobile/pharmind_mobile/lib/services/api_service.dart`

```dart
Future<List<Relacion>> getRelaciones({
  int page = 1,
  int pageSize = 100,
  bool incluirFrecuencia = true,
  bool soloConPendientes = false,
}) async {
  final response = await dio.get(
    '/relaciones',
    queryParameters: {
      'page': page,
      'pageSize': pageSize,
      'incluirFrecuencia': incluirFrecuencia,
      'soloConPendientes': soloConPendientes,
    },
  );

  // Parse response...
}
```

## Sincronización Offline

Para el modo offline, se debe:

1. **Guardar datos de frecuencia en SQLite local** al sincronizar
2. **Calcular frecuencia localmente** usando la misma lógica que el Backend:
   - Contar interacciones del período actual almacenadas localmente
   - Filtrar por tipos con `medirFrecuencia = true`
   - Comparar contra `FrecuenciaVisitas` de la relación

Ejemplo de esquema SQLite:

```sql
-- Agregar columna a tabla local de Relaciones
ALTER TABLE relaciones ADD COLUMN frecuencia_json TEXT;

-- Almacenar el objeto completo de frecuencia como JSON
```

## Testing

### Casos de Prueba

1. **Relación sin interacciones**: Debe mostrar indicador gris
2. **Relación con visitas pendientes**: Debe mostrar amarillo + cantidad pendiente
3. **Relación con objetivo cumplido**: Debe mostrar verde
4. **Relación con objetivo superado**: Debe mostrar azul
5. **Filtro de pendientes**: Solo debe mostrar relaciones en amarillo
6. **Modo offline**: Debe calcular y mostrar indicador correctamente

## Referencias

- Backend Service: `Backend/PharMind.API/Services/FrecuenciaVisitasService.cs`
- Backend DTOs: `Backend/PharMind.API/DTOs/RelacionDTOs.cs`
- Frontend Web Component: `Frontend/pharmind-web/src/components/common/FrecuenciaIndicator.tsx`
- Frontend Web CSS: `Frontend/pharmind-web/src/components/common/FrecuenciaIndicator.css`
- Frontend Web Integration: `Frontend/pharmind-web/src/pages/cartera/MiCarteraPage.tsx`

## Notas Importantes

1. La frecuencia se calcula **automáticamente** en el Backend al llamar al endpoint con `incluirFrecuencia=true`
2. El período actual se obtiene de la tabla `Periods` en la base de datos
3. Solo se cuentan interacciones con `Status = false` (no eliminadas)
4. Solo se cuentan tipos de interacción con `medirFrecuencia = true` en su `ConfiguracionUi`
5. El campo `FrecuenciaVisitas` en Relacion es un string que se convierte a int para el cálculo
