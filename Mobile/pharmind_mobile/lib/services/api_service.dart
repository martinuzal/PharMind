import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;

  late Dio _dio;
  final _storage = const FlutterSecureStorage();

  // URL base - Para web (Chrome) y Windows usar localhost
  // Para emulador Android usar 10.0.2.2 que apunta al localhost del host
  // Para dispositivo físico, cambiar a la IP de la máquina en la red local
  static const String baseUrl = 'http://localhost:5209';

  // Para emulador Android, usar:
  // static const String baseUrl = 'http://10.0.2.2:5209';

  // Para dispositivo físico, usar:
  // static const String baseUrl = 'http://192.168.1.X:5209'; // Reemplazar X con tu IP

  ApiService._internal() {
    _dio = Dio(
      BaseOptions(
        baseUrl: baseUrl,
        connectTimeout: const Duration(seconds: 30),
        receiveTimeout: const Duration(seconds: 30),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    // Interceptor para agregar token JWT en cada request
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          // Obtener token del almacenamiento seguro
          final token = await _storage.read(key: 'auth_token');
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          print('Request: ${options.method} ${options.path}');
          return handler.next(options);
        },
        onResponse: (response, handler) {
          print('Response: ${response.statusCode} ${response.requestOptions.path}');
          return handler.next(response);
        },
        onError: (error, handler) async {
          print('Error: ${error.response?.statusCode} ${error.requestOptions.path}');

          // Manejo de errores específicos
          if (error.response?.statusCode == 401) {
            // Token expirado o inválido
            await _storage.delete(key: 'auth_token');
            print('Token expirado o inválido. Sesión cerrada.');
          }

          return handler.next(error);
        },
      ),
    );
  }

  // Getter para acceder al Dio instance
  Dio get dio => _dio;

  // Método GET
  Future<Response> get(
    String path, {
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      final response = await _dio.get(
        path,
        queryParameters: queryParameters,
        options: options,
      );
      return response;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // Método POST
  Future<Response> post(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      final response = await _dio.post(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
      );
      return response;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // Método PUT
  Future<Response> put(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      final response = await _dio.put(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
      );
      return response;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // Método DELETE
  Future<Response> delete(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      final response = await _dio.delete(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
      );
      return response;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // Manejo centralizado de errores
  Exception _handleError(DioException error) {
    String errorMessage = 'Error desconocido';

    switch (error.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        errorMessage = 'Error de conexión: Tiempo de espera agotado';
        break;
      case DioExceptionType.badResponse:
        final statusCode = error.response?.statusCode;
        final data = error.response?.data;

        if (data is Map && data.containsKey('message')) {
          errorMessage = data['message'];
        } else {
          switch (statusCode) {
            case 400:
              errorMessage = 'Solicitud incorrecta';
              break;
            case 401:
              errorMessage = 'No autorizado. Credenciales inválidas';
              break;
            case 403:
              errorMessage = 'Acceso prohibido';
              break;
            case 404:
              errorMessage = 'Recurso no encontrado';
              break;
            case 500:
              errorMessage = 'Error del servidor';
              break;
            default:
              errorMessage = 'Error del servidor: $statusCode';
          }
        }
        break;
      case DioExceptionType.cancel:
        errorMessage = 'Solicitud cancelada';
        break;
      case DioExceptionType.unknown:
        if (error.message?.contains('SocketException') ?? false) {
          errorMessage = 'Sin conexión a internet. Verifique su conexión';
        } else {
          errorMessage = 'Error de conexión al servidor';
        }
        break;
      default:
        errorMessage = 'Error inesperado: ${error.message}';
    }

    return Exception(errorMessage);
  }

  // Actualizar el token manualmente si es necesario
  Future<void> updateToken(String token) async {
    await _storage.write(key: 'auth_token', value: token);
  }

  // Remover el token
  Future<void> removeToken() async {
    await _storage.delete(key: 'auth_token');
  }
}
