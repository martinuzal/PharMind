import '../models/frecuencia_indicador.dart';
import '../models/relacion.dart';
import '../models/interaccion.dart';
import '../models/tipo_interaccion.dart';

/// Servicio para calcular indicadores de frecuencia de visitas localmente
class FrecuenciaService {
  FrecuenciaService();

  /// Calcula el indicador de frecuencia para una relación específica
  /// basándose en sus interacciones y tipos de interacción
  FrecuenciaIndicador? calcularFrecuencia(
    Relacion relacion,
    List<Interaccion> interacciones,
    List<TipoInteraccion> tiposInteraccion,
  ) {
    print('\n🔍 Calculando frecuencia para: ${relacion.codigoRelacion}');
    print('   Total interacciones recibidas: ${interacciones.length}');
    print('   Total tipos recibidos: ${tiposInteraccion.length}');

    // Si la relación no tiene frecuencia configurada, retornar null
    if (relacion.frecuenciaVisitas == null || relacion.frecuenciaVisitas!.isEmpty) {
      print('   ⚠️ Sin frecuencia configurada');
      return null;
    }

    int? frecuenciaObjetivo;
    try {
      frecuenciaObjetivo = int.parse(relacion.frecuenciaVisitas!);
      print('   🎯 Objetivo: $frecuenciaObjetivo');
    } catch (e) {
      print('⚠️ Error parseando FrecuenciaVisitas: ${relacion.frecuenciaVisitas}');
      return null;
    }

    if (frecuenciaObjetivo <= 0) {
      return null;
    }

    // Determinar el período de medición (por ahora usamos ciclo = año actual)
    final now = DateTime.now();
    final fechaInicioPeriodo = DateTime(now.year, 1, 1); // Inicio del año
    final fechaFinPeriodo = DateTime(now.year, 12, 31, 23, 59, 59); // Fin del año
    final periodoMedicion = 'Ciclo ${now.year}';
    print('   📅 Período: $fechaInicioPeriodo hasta $fechaFinPeriodo');

    // Crear un map de tipoId -> medirFrecuencia
    final Map<String, bool> tiposMidenFrecuencia = {};
    print('   🔧 Analizando configuración de tipos de interacción:');
    for (var tipo in tiposInteraccion) {
      print('   📝 Tipo "${tipo.nombre}" (${tipo.id})');
      print('      - configuracionUi es null: ${tipo.configuracionUi == null}');

      // Verificar si configuracionUi.frecuencia.medirFrecuencia = true
      bool mideFrecuencia = false;
      if (tipo.configuracionUi != null) {
        print('      - configuracionUi keys: ${tipo.configuracionUi!.keys.toList()}');

        // medirFrecuencia está dentro del objeto 'frecuencia'
        final frecuenciaConfig = tipo.configuracionUi!['frecuencia'];
        print('      - frecuencia config: $frecuenciaConfig');

        if (frecuenciaConfig != null && frecuenciaConfig is Map) {
          print('      - medirFrecuencia value: ${frecuenciaConfig['medirFrecuencia']}');
          mideFrecuencia = frecuenciaConfig['medirFrecuencia'] == true;
        }
      }

      tiposMidenFrecuencia[tipo.id] = mideFrecuencia;
      if (mideFrecuencia) {
        print('      ✅ MIDE frecuencia');
      } else {
        print('      ❌ NO mide frecuencia');
      }
    }

    final interaccionesDeRelacion = interacciones.where((i) => i.relacionId == relacion.id).toList();
    print('   📋 Interacciones de esta relación: ${interaccionesDeRelacion.length}');

    // Filtrar interacciones de esta relación en el período que miden frecuencia
    final interaccionesRelacion = interacciones.where((interaccion) {
      // Verificar que sea de esta relación
      if (interaccion.relacionId != relacion.id) {
        return false;
      }

      // Verificar si está en el período (incluir las fechas límite)
      if (interaccion.fecha.isBefore(fechaInicioPeriodo) ||
          interaccion.fecha.isAfter(fechaFinPeriodo)) {
        print('  ⏰ Interacción fuera de período: ${interaccion.fecha} (Período: $fechaInicioPeriodo - $fechaFinPeriodo)');
        return false;
      }

      // Verificar si este tipo de interacción mide frecuencia
      final mideFrecuencia = tiposMidenFrecuencia[interaccion.tipoInteraccionId] == true;
      if (!mideFrecuencia) {
        print('  ❌ Tipo ${interaccion.tipoInteraccionId} NO mide frecuencia');
      } else {
        print('  ✅ Interacción válida: ${interaccion.tipoInteraccionId} - ${interaccion.fecha}');
      }
      return mideFrecuencia;
    }).toList();

    print('📊 Relación ${relacion.codigoRelacion}: ${interaccionesRelacion.length} interacciones válidas de ${interacciones.where((i) => i.relacionId == relacion.id).length} totales');

    int interaccionesRealizadas = interaccionesRelacion.length;

    // Calcular estado del semáforo
    String estado;
    int visitasPendientes;

    if (interaccionesRealizadas == 0) {
      estado = 'gris'; // Sin visitas registradas
      visitasPendientes = frecuenciaObjetivo;
    } else if (interaccionesRealizadas < frecuenciaObjetivo) {
      estado = 'amarillo'; // Visitas pendientes
      visitasPendientes = frecuenciaObjetivo - interaccionesRealizadas;
    } else if (interaccionesRealizadas == frecuenciaObjetivo) {
      estado = 'verde'; // Objetivo cumplido
      visitasPendientes = 0;
    } else {
      estado = 'azul'; // Objetivo superado
      visitasPendientes = 0;
    }

    return FrecuenciaIndicador(
      interaccionesRealizadas: interaccionesRealizadas,
      frecuenciaObjetivo: frecuenciaObjetivo,
      periodoMedicion: periodoMedicion,
      fechaInicioPeriodo: fechaInicioPeriodo,
      fechaFinPeriodo: fechaFinPeriodo,
      estado: estado,
      visitasPendientes: visitasPendientes,
    );
  }

  /// Calcula frecuencia para múltiples relaciones
  Map<String, FrecuenciaIndicador> calcularFrecuenciasParaRelaciones(
    List<Relacion> relaciones,
    List<Interaccion> interacciones,
    List<TipoInteraccion> tiposInteraccion,
  ) {
    final Map<String, FrecuenciaIndicador> resultados = {};

    for (var relacion in relaciones) {
      final frecuencia = calcularFrecuencia(relacion, interacciones, tiposInteraccion);
      if (frecuencia != null) {
        resultados[relacion.id] = frecuencia;
      }
    }

    return resultados;
  }
}
