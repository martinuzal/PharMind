import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../models/relacion.dart';
import '../models/interaccion.dart';
import '../models/cliente.dart';
import '../models/tipo_relacion.dart';
import '../models/tipo_interaccion.dart';

class MobileSyncResponse {
  final List<Relacion> relaciones;
  final List<Interaccion> interacciones;
  final List<Cliente> clientes;
  final List<TipoRelacion> tiposRelacion;
  final List<TipoInteraccion> tiposInteraccion;
  final DateTime fechaSincronizacion;
  final int totalRelaciones;
  final int totalInteracciones;
  final int totalClientes;

  MobileSyncResponse({
    required this.relaciones,
    required this.interacciones,
    required this.clientes,
    required this.tiposRelacion,
    required this.tiposInteraccion,
    required this.fechaSincronizacion,
    required this.totalRelaciones,
    required this.totalInteracciones,
    required this.totalClientes,
  });

  factory MobileSyncResponse.fromJson(Map<String, dynamic> json) {
    return MobileSyncResponse(
      relaciones: (json['relaciones'] as List?)
              ?.map((e) => Relacion.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      interacciones: (json['interacciones'] as List?)
              ?.map((e) => Interaccion.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      clientes: (json['clientes'] as List?)
              ?.map((e) => Cliente.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      tiposRelacion: (json['tiposRelacion'] as List?)
              ?.map((e) => TipoRelacion.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      tiposInteraccion: (json['tiposInteraccion'] as List?)
              ?.map((e) => TipoInteraccion.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      fechaSincronizacion: DateTime.parse(json['fechaSincronizacion'] as String),
      totalRelaciones: json['totalRelaciones'] as int,
      totalInteracciones: json['totalInteracciones'] as int,
      totalClientes: json['totalClientes'] as int,
    );
  }
}

class MobileDashboard {
  final int totalRelaciones;
  final int interaccionesHoy;
  final int interaccionesSemana;
  final int interaccionesMes;
  final Map<String, int> interaccionesPorTipo;

  MobileDashboard({
    required this.totalRelaciones,
    required this.interaccionesHoy,
    required this.interaccionesSemana,
    required this.interaccionesMes,
    required this.interaccionesPorTipo,
  });

  factory MobileDashboard.fromJson(Map<String, dynamic> json) {
    // Manejar interaccionesPorTipo que puede ser un Map o null/string vacío
    Map<String, int> interaccionesPorTipo = {};
    if (json['interaccionesPorTipo'] != null && json['interaccionesPorTipo'] is Map) {
      interaccionesPorTipo = Map<String, int>.from(json['interaccionesPorTipo'] as Map);
    }

    return MobileDashboard(
      totalRelaciones: json['totalRelaciones'] as int,
      interaccionesHoy: json['interaccionesHoy'] as int,
      interaccionesSemana: json['interaccionesSemana'] as int,
      interaccionesMes: json['interaccionesMes'] as int,
      interaccionesPorTipo: interaccionesPorTipo,
    );
  }
}

class MobileApiService {
  final Dio _dio;
  final FlutterSecureStorage _storage;
  // 10.0.2.2 es la IP especial para acceder al localhost del host desde el emulador Android
  static const String _baseUrl = 'http://10.0.2.2:5209/api';

  MobileApiService()
      : _dio = Dio(BaseOptions(
          baseUrl: _baseUrl,
          connectTimeout: const Duration(seconds: 30),
          receiveTimeout: const Duration(seconds: 30),
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        )),
        _storage = const FlutterSecureStorage() {
    _setupInterceptors();
  }

  void _setupInterceptors() {
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          // Agregar token JWT si existe (usa la misma clave que AuthService)
          final token = await _storage.read(key: 'auth_token');
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          print('📤 ${options.method} ${options.path}');
          return handler.next(options);
        },
        onResponse: (response, handler) {
          print('✅ ${response.statusCode} ${response.requestOptions.path}');
          return handler.next(response);
        },
        onError: (error, handler) {
          print('❌ Error: ${error.message}');
          print('   Path: ${error.requestOptions.path}');
          if (error.response != null) {
            print('   Status: ${error.response?.statusCode}');
            print('   Data: ${error.response?.data}');
          }
          return handler.next(error);
        },
      ),
    );
  }

  // ==================== SINCRONIZACIÓN ====================

  /// Sincroniza todos los datos del agente
  Future<MobileSyncResponse> syncAll({
    required String agenteId,
    DateTime? ultimaSincronizacion,
  }) async {
    try {
      final queryParams = {
        'agenteId': agenteId,
        if (ultimaSincronizacion != null)
          'ultimaSincronizacion': ultimaSincronizacion.toIso8601String(),
      };

      final response = await _dio.get(
        '/mobile/sync',
        queryParameters: queryParams,
      );

      return MobileSyncResponse.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // ==================== RELACIONES ====================

  /// Obtiene las relaciones del agente
  Future<List<Relacion>> getRelaciones(String agenteId) async {
    try {
      final response = await _dio.get(
        '/mobile/relaciones',
        queryParameters: {'agenteId': agenteId},
      );

      return (response.data as List)
          .map((e) => Relacion.fromJson(e as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// Obtiene una relación específica
  Future<Relacion> getRelacion(String id) async {
    try {
      final response = await _dio.get('/mobile/relaciones/$id');
      return Relacion.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// Crea una nueva relación
  Future<Relacion> createRelacion({
    required String tipoRelacionId,
    required String agenteId,
    required String clientePrincipalId,
    String? clienteSecundario1Id,
    String? clienteSecundario2Id,
    String? prioridad,
    String? frecuenciaVisitas,
    String? observaciones,
    Map<String, dynamic>? datosDinamicos,
  }) async {
    try {
      final data = {
        'tipoRelacionId': tipoRelacionId,
        'agenteId': agenteId,
        'clientePrincipalId': clientePrincipalId,
        if (clienteSecundario1Id != null) 'clienteSecundario1Id': clienteSecundario1Id,
        if (clienteSecundario2Id != null) 'clienteSecundario2Id': clienteSecundario2Id,
        if (prioridad != null) 'prioridad': prioridad,
        if (frecuenciaVisitas != null) 'frecuenciaVisitas': frecuenciaVisitas,
        if (observaciones != null) 'observaciones': observaciones,
        if (datosDinamicos != null) 'datosDinamicos': datosDinamicos,
      };

      final response = await _dio.post('/mobile/relaciones', data: data);
      return Relacion.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// Actualiza una relación existente
  Future<Relacion> updateRelacion({
    required String id,
    String? clientePrincipalId,
    String? clienteSecundario1Id,
    String? clienteSecundario2Id,
    String? prioridad,
    String? frecuenciaVisitas,
    String? observaciones,
    String? estado,
    DateTime? fechaFin,
    Map<String, dynamic>? datosDinamicos,
  }) async {
    try {
      final data = <String, dynamic>{
        if (clientePrincipalId != null) 'clientePrincipalId': clientePrincipalId,
        if (clienteSecundario1Id != null) 'clienteSecundario1Id': clienteSecundario1Id,
        if (clienteSecundario2Id != null) 'clienteSecundario2Id': clienteSecundario2Id,
        if (prioridad != null) 'prioridad': prioridad,
        if (frecuenciaVisitas != null) 'frecuenciaVisitas': frecuenciaVisitas,
        if (observaciones != null) 'observaciones': observaciones,
        if (estado != null) 'estado': estado,
        if (fechaFin != null) 'fechaFin': fechaFin.toIso8601String(),
        if (datosDinamicos != null) 'datosDinamicos': datosDinamicos,
      };

      final response = await _dio.put('/mobile/relaciones/$id', data: data);
      return Relacion.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // ==================== INTERACCIONES ====================

  /// Obtiene las interacciones del agente
  Future<List<Interaccion>> getInteracciones({
    required String agenteId,
    DateTime? desde,
    DateTime? hasta,
  }) async {
    try {
      final queryParams = {
        'agenteId': agenteId,
        if (desde != null) 'desde': desde.toIso8601String(),
        if (hasta != null) 'hasta': hasta.toIso8601String(),
      };

      final response = await _dio.get(
        '/mobile/interacciones',
        queryParameters: queryParams,
      );

      return (response.data as List)
          .map((e) => Interaccion.fromJson(e as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// Crea una nueva interacción
  Future<Interaccion> createInteraccion({
    required String tipoInteraccionId,
    required String relacionId,
    required String agenteId,
    required String clientePrincipalId,
    String? clienteSecundario1Id,
    required DateTime fecha,
    String? turno,
    int? duracionMinutos,
    String? objetivoVisita,
    String? resumenVisita,
    String? proximaAccion,
    DateTime? fechaProximaAccion,
    String? resultadoVisita,
    double? latitud,
    double? longitud,
    String? direccionCapturada,
    Map<String, dynamic>? datosDinamicos,
  }) async {
    try {
      final data = {
        'tipoInteraccionId': tipoInteraccionId,
        'relacionId': relacionId,
        'agenteId': agenteId,
        'clientePrincipalId': clientePrincipalId,
        if (clienteSecundario1Id != null) 'clienteSecundario1Id': clienteSecundario1Id,
        'fecha': fecha.toIso8601String(),
        if (turno != null) 'turno': turno,
        if (duracionMinutos != null) 'duracionMinutos': duracionMinutos,
        if (objetivoVisita != null) 'objetivoVisita': objetivoVisita,
        if (resumenVisita != null) 'resumenVisita': resumenVisita,
        if (proximaAccion != null) 'proximaAccion': proximaAccion,
        if (fechaProximaAccion != null) 'fechaProximaAccion': fechaProximaAccion.toIso8601String(),
        if (resultadoVisita != null) 'resultadoVisita': resultadoVisita,
        if (latitud != null) 'latitud': latitud,
        if (longitud != null) 'longitud': longitud,
        if (direccionCapturada != null) 'direccionCapturada': direccionCapturada,
        if (datosDinamicos != null) 'datosDinamicos': datosDinamicos,
      };

      final response = await _dio.post('/mobile/interacciones', data: data);
      return Interaccion.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// Actualiza una interacción existente
  Future<Interaccion> updateInteraccion({
    required String id,
    DateTime? fecha,
    String? turno,
    int? duracionMinutos,
    String? objetivoVisita,
    String? resumenVisita,
    String? proximaAccion,
    DateTime? fechaProximaAccion,
    String? resultadoVisita,
    double? latitud,
    double? longitud,
    String? direccionCapturada,
    Map<String, dynamic>? datosDinamicos,
  }) async {
    try {
      final data = <String, dynamic>{
        if (fecha != null) 'fecha': fecha.toIso8601String(),
        if (turno != null) 'turno': turno,
        if (duracionMinutos != null) 'duracionMinutos': duracionMinutos,
        if (objetivoVisita != null) 'objetivoVisita': objetivoVisita,
        if (resumenVisita != null) 'resumenVisita': resumenVisita,
        if (proximaAccion != null) 'proximaAccion': proximaAccion,
        if (fechaProximaAccion != null) 'fechaProximaAccion': fechaProximaAccion.toIso8601String(),
        if (resultadoVisita != null) 'resultadoVisita': resultadoVisita,
        if (latitud != null) 'latitud': latitud,
        if (longitud != null) 'longitud': longitud,
        if (direccionCapturada != null) 'direccionCapturada': direccionCapturada,
        if (datosDinamicos != null) 'datosDinamicos': datosDinamicos,
      };

      final response = await _dio.put('/mobile/interacciones/$id', data: data);
      return Interaccion.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// Crea múltiples interacciones en batch (para sincronización offline)
  Future<void> createInteraccionesBatch(List<Map<String, dynamic>> interacciones) async {
    try {
      await _dio.post(
        '/mobile/interacciones/batch',
        data: {'interacciones': interacciones},
      );
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // ==================== DASHBOARD ====================

  /// Obtiene las estadísticas del dashboard del agente
  Future<MobileDashboard> getDashboard(String agenteId) async {
    try {
      final response = await _dio.get(
        '/mobile/dashboard',
        queryParameters: {'agenteId': agenteId},
      );

      return MobileDashboard.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// Alias para obtener una relación por ID
  Future<Relacion> getRelacionById(String id) => getRelacion(id);

  /// Obtiene todos los tipos de interacción disponibles
  Future<List<TipoInteraccion>> getTiposInteraccion() async {
    try {
      final response = await _dio.get('/esquemaspersonalizados/tipo/Interaccion');
      return (response.data as List)
          .map((e) => TipoInteraccion.fromJson(e as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // ==================== ERROR HANDLING ====================

  Exception _handleError(DioException error) {
    if (error.response != null) {
      final statusCode = error.response!.statusCode;
      final data = error.response!.data;

      switch (statusCode) {
        case 400:
          return Exception('Datos inválidos: ${data['message'] ?? data}');
        case 401:
          return Exception('No autorizado. Por favor inicie sesión nuevamente.');
        case 403:
          return Exception('No tiene permisos para realizar esta acción.');
        case 404:
          return Exception('Recurso no encontrado.');
        case 500:
          return Exception('Error del servidor: ${data['message'] ?? data}');
        default:
          return Exception('Error desconocido: $statusCode');
      }
    } else {
      // Error de conexión
      if (error.type == DioExceptionType.connectionTimeout ||
          error.type == DioExceptionType.receiveTimeout) {
        return Exception('Tiempo de espera agotado. Verifique su conexión.');
      } else if (error.type == DioExceptionType.connectionError) {
        return Exception('No se pudo conectar al servidor. Verifique su conexión a internet.');
      } else {
        return Exception('Error de red: ${error.message}');
      }
    }
  }
}
