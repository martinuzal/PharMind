import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/tiempo_utilizado.dart';

class TiempoService {
  static const String _tiempoKey = 'tiempo_utilizado_historial';

  // Obtener resumen de tiempo utilizado
  Future<ResumenTiempo> obtenerResumen() async {
    try {
      final historial = await _cargarHistorial();
      final ahora = DateTime.now();

      // Calcular totales
      int totalHoy = 0;
      int totalSemana = 0;
      int totalMes = 0;

      for (var registro in historial) {
        final minutos = registro.minutosTotal;

        // Hoy
        if (_esMismoDia(registro.fecha, ahora)) {
          totalHoy += minutos;
        }

        // Esta semana
        if (_esEstaSemana(registro.fecha, ahora)) {
          totalSemana += minutos;
        }

        // Este mes
        if (_esEsteMes(registro.fecha, ahora)) {
          totalMes += minutos;
        }
      }

      return ResumenTiempo(
        totalMinutosHoy: totalHoy,
        totalMinutosSemana: totalSemana,
        totalMinutosMes: totalMes,
        historial: historial,
      );
    } catch (e) {
      print('Error al obtener resumen: $e');
      return ResumenTiempo();
    }
  }

  // Registrar tiempo utilizado (simulado para demo)
  Future<void> registrarTiempo({
    required int minutosClientes,
    required int minutosInteracciones,
    required int minutosRelaciones,
  }) async {
    try {
      final historial = await _cargarHistorial();
      final ahora = DateTime.now();

      // Buscar si ya existe un registro para hoy
      final indiceHoy = historial.indexWhere((r) => _esMismoDia(r.fecha, ahora));

      final nuevoRegistro = TiempoUtilizado(
        fecha: ahora,
        minutosEnClientes: minutosClientes,
        minutosEnInteracciones: minutosInteracciones,
        minutosEnRelaciones: minutosRelaciones,
        minutosTotal: minutosClientes + minutosInteracciones + minutosRelaciones,
      );

      if (indiceHoy >= 0) {
        historial[indiceHoy] = nuevoRegistro;
      } else {
        historial.add(nuevoRegistro);
      }

      await _guardarHistorial(historial);
    } catch (e) {
      print('Error al registrar tiempo: $e');
    }
  }

  // Cargar historial desde SharedPreferences
  Future<List<TiempoUtilizado>> _cargarHistorial() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final historialJson = prefs.getString(_tiempoKey);

      if (historialJson != null) {
        final List<dynamic> decoded = jsonDecode(historialJson);
        return decoded.map((item) => TiempoUtilizado.fromJson(item)).toList();
      }

      // Si no hay datos, generar datos de ejemplo
      return _generarDatosEjemplo();
    } catch (e) {
      print('Error al cargar historial: $e');
      return _generarDatosEjemplo();
    }
  }

  // Guardar historial en SharedPreferences
  Future<void> _guardarHistorial(List<TiempoUtilizado> historial) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final historialJson = jsonEncode(historial.map((item) => item.toJson()).toList());
      await prefs.setString(_tiempoKey, historialJson);
    } catch (e) {
      print('Error al guardar historial: $e');
    }
  }

  // Generar datos de ejemplo para demostración
  List<TiempoUtilizado> _generarDatosEjemplo() {
    final ahora = DateTime.now();
    final ejemplos = <TiempoUtilizado>[];

    // Últimos 30 días
    for (int i = 0; i < 30; i++) {
      final fecha = ahora.subtract(Duration(days: i));
      final minutosClientes = (20 + (i % 40));
      final minutosInteracciones = (30 + (i % 60));
      final minutosRelaciones = (15 + (i % 30));

      ejemplos.add(TiempoUtilizado(
        fecha: fecha,
        minutosEnClientes: minutosClientes,
        minutosEnInteracciones: minutosInteracciones,
        minutosEnRelaciones: minutosRelaciones,
        minutosTotal: minutosClientes + minutosInteracciones + minutosRelaciones,
      ));
    }

    return ejemplos;
  }

  // Helpers para comparar fechas
  bool _esMismoDia(DateTime fecha1, DateTime fecha2) {
    return fecha1.year == fecha2.year &&
        fecha1.month == fecha2.month &&
        fecha1.day == fecha2.day;
  }

  bool _esEstaSemana(DateTime fecha, DateTime ahora) {
    final inicioSemana = ahora.subtract(Duration(days: ahora.weekday - 1));
    return fecha.isAfter(inicioSemana.subtract(const Duration(days: 1))) &&
        fecha.isBefore(ahora.add(const Duration(days: 1)));
  }

  bool _esEsteMes(DateTime fecha, DateTime ahora) {
    return fecha.year == ahora.year && fecha.month == ahora.month;
  }
}
