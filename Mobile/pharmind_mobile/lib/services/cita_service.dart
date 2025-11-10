import 'package:dio/dio.dart';
import '../models/cita.dart';
import 'api_service.dart';

class CitaService {
  final Dio _dio;
  static const String _baseUrl = '${ApiService.baseUrl}/api/citas';

  CitaService() : _dio = ApiService().dio;

  /// Obtener citas del agente
  Future<List<Cita>> getCitasAgente(
    String agenteId, {
    DateTime? desde,
    DateTime? hasta,
  }) async {
    try {
      final queryParams = <String, dynamic>{'agenteId': agenteId};
      if (desde != null) queryParams['desde'] = desde.toIso8601String();
      if (hasta != null) queryParams['hasta'] = hasta.toIso8601String();

      final response = await _dio.get(_baseUrl, queryParameters: queryParams);

      if (response.statusCode == 200) {
        final List<dynamic> data = response.data as List;
        return data.map((json) => Cita.fromJson(json)).toList();
      }
      throw Exception('Error al obtener citas');
    } catch (e) {
      print('Error en getCitasAgente: $e');
      rethrow;
    }
  }

  /// Obtener citas del día
  Future<List<Cita>> getCitasHoy(String agenteId) async {
    final hoy = DateTime.now();
    final inicio = DateTime(hoy.year, hoy.month, hoy.day);
    final fin = inicio.add(const Duration(days: 1));

    return getCitasAgente(agenteId, desde: inicio, hasta: fin);
  }

  /// Obtener citas de la semana
  Future<List<Cita>> getCitasSemana(String agenteId) async {
    final hoy = DateTime.now();
    final inicioSemana = hoy.subtract(Duration(days: hoy.weekday - 1));
    final inicio = DateTime(inicioSemana.year, inicioSemana.month, inicioSemana.day);
    final fin = inicio.add(const Duration(days: 7));

    return getCitasAgente(agenteId, desde: inicio, hasta: fin);
  }

  /// Obtener citas del mes
  Future<List<Cita>> getCitasMes(String agenteId, {int? year, int? month}) async {
    final fecha = DateTime.now();
    final inicio = DateTime(year ?? fecha.year, month ?? fecha.month, 1);
    final fin = DateTime(year ?? fecha.year, (month ?? fecha.month) + 1, 1);

    return getCitasAgente(agenteId, desde: inicio, hasta: fin);
  }

  /// Obtener una cita por ID
  Future<Cita> getCita(String id) async {
    try {
      final response = await _dio.get('$_baseUrl/$id');

      if (response.statusCode == 200) {
        return Cita.fromJson(response.data);
      }
      throw Exception('Error al obtener cita');
    } catch (e) {
      print('Error en getCita: $e');
      rethrow;
    }
  }

  /// Crear nueva cita
  Future<Cita> crearCita(Cita cita) async {
    try {
      final response = await _dio.post(_baseUrl, data: cita.toJson());

      if (response.statusCode == 201 || response.statusCode == 200) {
        return Cita.fromJson(response.data);
      }
      throw Exception('Error al crear cita');
    } catch (e) {
      print('Error en crearCita: $e');
      rethrow;
    }
  }

  /// Actualizar cita existente
  Future<Cita> actualizarCita(String id, Cita cita) async {
    try {
      final response = await _dio.put('$_baseUrl/$id', data: cita.toJson());

      if (response.statusCode == 200) {
        return Cita.fromJson(response.data);
      }
      throw Exception('Error al actualizar cita');
    } catch (e) {
      print('Error en actualizarCita: $e');
      rethrow;
    }
  }

  /// Eliminar cita
  Future<void> eliminarCita(String id) async {
    try {
      final response = await _dio.delete('$_baseUrl/$id');

      if (response.statusCode != 200 && response.statusCode != 204) {
        throw Exception('Error al eliminar cita');
      }
    } catch (e) {
      print('Error en eliminarCita: $e');
      rethrow;
    }
  }

  /// Cambiar estado de cita
  Future<Cita> cambiarEstado(String id, String nuevoEstado) async {
    try {
      final response = await _dio.patch(
        '$_baseUrl/$id/estado',
        data: {'estado': nuevoEstado},
      );

      if (response.statusCode == 200) {
        return Cita.fromJson(response.data);
      }
      throw Exception('Error al cambiar estado');
    } catch (e) {
      print('Error en cambiarEstado: $e');
      rethrow;
    }
  }

  /// Marcar cita como completada y vincular con interacción
  Future<Cita> completarCita(String id, String interaccionId) async {
    try {
      final response = await _dio.patch(
        '$_baseUrl/$id/completar',
        data: {'interaccionId': interaccionId},
      );

      if (response.statusCode == 200) {
        return Cita.fromJson(response.data);
      }
      throw Exception('Error al completar cita');
    } catch (e) {
      print('Error en completarCita: $e');
      rethrow;
    }
  }
}
