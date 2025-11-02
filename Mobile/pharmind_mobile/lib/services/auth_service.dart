import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import '../models/usuario.dart';
import '../models/auth_response.dart';
import 'api_service.dart';
import 'database_service.dart';

class AuthService {
  static final AuthService _instance = AuthService._internal();
  factory AuthService() => _instance;

  final ApiService _apiService = ApiService();
  final DatabaseService _dbService = DatabaseService();
  final FlutterSecureStorage _storage = const FlutterSecureStorage();
  final Connectivity _connectivity = Connectivity();

  AuthService._internal();

  // Verificar conectividad
  Future<bool> hasInternetConnection() async {
    try {
      final ConnectivityResult connectivityResult = await _connectivity.checkConnectivity();
      // Verificar si hay conexión (cualquier tipo excepto none)
      return connectivityResult != ConnectivityResult.none;
    } catch (e) {
      print('Error al verificar conectividad: $e');
      return false;
    }
  }

  // Login - Con soporte offline/online
  Future<AuthResponse> login(String email, String password) async {
    try {
      // Validaciones básicas
      if (email.isEmpty || password.isEmpty) {
        throw Exception('Email y contraseña son requeridos');
      }

      if (!_isValidEmail(email)) {
        throw Exception('Email inválido');
      }

      if (password.length < 6) {
        throw Exception('La contraseña debe tener al menos 6 caracteres');
      }

      // Verificar conectividad
      final hasInternet = await hasInternetConnection();

      if (hasInternet) {
        // Modo ONLINE - Intentar login con el servidor
        print('Modo ONLINE: Intentando login con servidor...');
        return await _loginOnline(email, password);
      } else {
        // Modo OFFLINE - Intentar login con cache local
        print('Modo OFFLINE: Intentando login con cache local...');
        return await _loginOffline(email, password);
      }
    } catch (e) {
      print('Error en login: $e');
      rethrow;
    }
  }

  // Login ONLINE - Autenticación con el servidor
  Future<AuthResponse> _loginOnline(String email, String password) async {
    try {
      final response = await _apiService.post(
        '/api/auth/login',
        data: {
          'email': email,
          'password': password,
        },
      );

      if (response.statusCode == 200) {
        final authResponse = AuthResponse.fromJson(response.data);

        // Guardar token en almacenamiento seguro
        await saveToken(authResponse.token);

        // Guardar usuario en cache local para modo offline (solo en móvil, no en web)
        if (!kIsWeb) {
          await _dbService.saveUsuario(authResponse.usuario);
        }

        print('Login exitoso ONLINE: ${authResponse.usuario.nombre}');
        return authResponse;
      } else {
        throw Exception('Error en la respuesta del servidor');
      }
    } catch (e) {
      print('Error en login online: $e');
      throw Exception(e.toString().replaceAll('Exception: ', ''));
    }
  }

  // Login OFFLINE - Autenticación con cache local (solo verifica email)
  Future<AuthResponse> _loginOffline(String email, String password) async {
    try {
      // En web no hay soporte offline (SQLite no funciona en web)
      if (kIsWeb) {
        throw Exception(
          'Sin conexión a internet. No es posible hacer login en modo web sin conexión.',
        );
      }

      // Buscar usuario en cache local
      final usuario = await _dbService.getUsuarioByEmail(email);

      if (usuario != null) {
        // En modo offline, solo verificamos que el usuario existe en cache
        // No podemos validar la contraseña sin el servidor
        // Esto es una limitación de seguridad del modo offline

        print('ADVERTENCIA: Login offline - No se valida contraseña');

        // Generar un token temporal para modo offline
        final offlineToken = 'offline_${DateTime.now().millisecondsSinceEpoch}';
        await saveToken(offlineToken);

        // Retornar respuesta de autenticación
        return AuthResponse(
          token: offlineToken,
          usuario: usuario,
          message: 'Login offline exitoso. Funcionalidad limitada.',
          success: true,
        );
      } else {
        throw Exception(
          'Usuario no encontrado en cache local. '
          'Necesita conexión a internet para el primer login.',
        );
      }
    } catch (e) {
      print('Error en login offline: $e');
      rethrow;
    }
  }

  // Guardar token
  Future<void> saveToken(String token) async {
    try {
      await _storage.write(key: 'auth_token', value: token);
      print('Token guardado exitosamente');
    } catch (e) {
      print('Error al guardar token: $e');
      rethrow;
    }
  }

  // Obtener token almacenado
  Future<String?> getStoredToken() async {
    try {
      final token = await _storage.read(key: 'auth_token');
      return token;
    } catch (e) {
      print('Error al obtener token: $e');
      return null;
    }
  }

  // Obtener usuario actual - Con soporte offline/online
  Future<Usuario?> getCurrentUser() async {
    try {
      final token = await getStoredToken();

      if (token == null || token.isEmpty) {
        print('No hay token almacenado');
        return null;
      }

      // Si es token offline, obtener de cache local (solo en móvil)
      if (token.startsWith('offline_')) {
        if (!kIsWeb) {
          print('Token offline detectado - Obteniendo usuario de cache local');
          final usuarios = await _dbService.getAllUsuarios();
          if (usuarios.isNotEmpty) {
            return usuarios.first; // Retornar el primer usuario en cache
          }
        }
        return null;
      }

      // Verificar conectividad
      final hasInternet = await hasInternetConnection();

      if (hasInternet) {
        // Modo ONLINE - Obtener usuario del servidor
        return await _getCurrentUserOnline();
      } else {
        // Modo OFFLINE - Obtener usuario del cache local
        return await _getCurrentUserOffline();
      }
    } catch (e) {
      print('Error al obtener usuario actual: $e');
      return null;
    }
  }

  // Obtener usuario actual ONLINE
  Future<Usuario?> _getCurrentUserOnline() async {
    try {
      final response = await _apiService.get('/api/auth/me');

      if (response.statusCode == 200) {
        final usuario = Usuario.fromJson(response.data);

        // Actualizar cache local (solo en móvil, no en web)
        if (!kIsWeb) {
          await _dbService.saveUsuario(usuario);
        }

        print('Usuario actual obtenido ONLINE: ${usuario.nombre}');
        return usuario;
      }
      return null;
    } catch (e) {
      print('Error al obtener usuario online: $e');
      // Si falla online, intentar con cache local (solo en móvil)
      if (!kIsWeb) {
        return await _getCurrentUserOffline();
      }
      return null;
    }
  }

  // Obtener usuario actual OFFLINE
  Future<Usuario?> _getCurrentUserOffline() async {
    try {
      final usuarios = await _dbService.getAllUsuarios();
      if (usuarios.isNotEmpty) {
        print('Usuario actual obtenido OFFLINE del cache');
        return usuarios.first;
      }
      return null;
    } catch (e) {
      print('Error al obtener usuario offline: $e');
      return null;
    }
  }

  // Logout - Limpiar sesión
  Future<void> logout() async {
    try {
      final hasInternet = await hasInternetConnection();

      if (hasInternet) {
        // Intentar notificar al servidor (opcional)
        try {
          await _apiService.post('/api/auth/logout');
          print('Logout notificado al servidor');
        } catch (e) {
          print('Error al notificar logout al servidor: $e');
          // Continuar con logout local aunque falle el servidor
        }
      }

      // Limpiar token
      await _storage.delete(key: 'auth_token');

      // Limpiar cache local (opcional - puedes mantener el cache para offline)
      // await _dbService.clearAllUsuarios();

      print('Sesión cerrada exitosamente');
    } catch (e) {
      print('Error en logout: $e');
      rethrow;
    }
  }

  // Verificar si está autenticado
  Future<bool> isAuthenticated() async {
    try {
      final token = await getStoredToken();
      return token != null && token.isNotEmpty;
    } catch (e) {
      print('Error al verificar autenticación: $e');
      return false;
    }
  }

  // Validar formato de email
  bool _isValidEmail(String email) {
    final emailRegex = RegExp(
      r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
    );
    return emailRegex.hasMatch(email);
  }

  // Sincronizar datos cuando hay conexión
  Future<void> syncData() async {
    try {
      final hasInternet = await hasInternetConnection();
      if (!hasInternet) {
        print('Sin conexión a internet. Sincronización cancelada.');
        return;
      }

      print('Iniciando sincronización de datos...');

      // Obtener usuarios no sincronizados
      final unsyncedUsuarios = await _dbService.getUnsyncedUsuarios();

      if (unsyncedUsuarios.isEmpty) {
        print('No hay datos para sincronizar');
        return;
      }

      // Aquí puedes implementar la lógica de sincronización con el servidor
      // Por ejemplo, enviar cambios locales al servidor
      for (final usuario in unsyncedUsuarios) {
        try {
          // Enviar actualización al servidor
          await _apiService.put('/api/usuarios/${usuario.id}', data: usuario.toJson());
          // Marcar como sincronizado
          await _dbService.markAsSynced(usuario.id);
          print('Usuario sincronizado: ${usuario.email}');
        } catch (e) {
          print('Error al sincronizar usuario ${usuario.email}: $e');
        }
      }

      print('Sincronización completada');
    } catch (e) {
      print('Error en sincronización: $e');
    }
  }
}
