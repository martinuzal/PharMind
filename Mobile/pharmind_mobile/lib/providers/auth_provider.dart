import 'package:flutter/material.dart';
import '../models/usuario.dart';
import '../services/auth_service.dart';

class AuthProvider with ChangeNotifier {
  final AuthService _authService = AuthService();

  // Estado de autenticación
  bool _isAuthenticated = false;
  bool _isLoading = false;
  Usuario? _currentUser;
  String? _errorMessage;
  bool _isOfflineMode = false;

  // Getters
  bool get isAuthenticated => _isAuthenticated;
  bool get isLoading => _isLoading;
  Usuario? get currentUser => _currentUser;
  String? get errorMessage => _errorMessage;
  bool get isOfflineMode => _isOfflineMode;

  // Constructor
  AuthProvider() {
    _initAuth();
  }

  // Inicializar autenticación (verificar si ya está logueado)
  Future<void> _initAuth() async {
    try {
      _setLoading(true);
      final isAuth = await _authService.isAuthenticated();

      if (isAuth) {
        final user = await _authService.getCurrentUser();
        if (user != null) {
          _currentUser = user;
          _isAuthenticated = true;

          // Verificar si está en modo offline
          final token = await _authService.getStoredToken();
          _isOfflineMode = token?.startsWith('offline_') ?? false;

          print('Usuario autenticado: ${user.nombre}');
        }
      }
    } catch (e) {
      print('Error al inicializar autenticación: $e');
      _errorMessage = e.toString();
    } finally {
      _setLoading(false);
    }
  }

  // Verificar autenticación (usado por SplashScreen)
  Future<bool> checkAuth() async {
    try {
      _setLoading(true);
      _clearError();

      final isAuth = await _authService.isAuthenticated();

      if (isAuth) {
        final user = await _authService.getCurrentUser();
        if (user != null) {
          _currentUser = user;
          _isAuthenticated = true;

          // Verificar si está en modo offline
          final token = await _authService.getStoredToken();
          _isOfflineMode = token?.startsWith('offline_') ?? false;

          print('Autenticación verificada: ${user.nombre}');
          return true;
        }
      }

      _isAuthenticated = false;
      _currentUser = null;
      return false;
    } catch (e) {
      print('Error al verificar autenticación: $e');
      _errorMessage = e.toString();
      _isAuthenticated = false;
      _currentUser = null;
      return false;
    } finally {
      _setLoading(false);
    }
  }

  // Login
  Future<bool> login(String email, String password) async {
    try {
      _setLoading(true);
      _clearError();

      final authResponse = await _authService.login(email, password);

      _currentUser = authResponse.usuario;
      _isAuthenticated = true;
      _isOfflineMode = authResponse.token.startsWith('offline_');

      if (_isOfflineMode) {
        _errorMessage = 'Modo offline: Funcionalidad limitada';
      }

      print('Login exitoso: ${_currentUser!.nombre}');
      return true;
    } catch (e) {
      print('Error en login: $e');
      _errorMessage = e.toString().replaceAll('Exception: ', '');
      _isAuthenticated = false;
      _currentUser = null;
      return false;
    } finally {
      _setLoading(false);
    }
  }

  // Logout
  Future<void> logout() async {
    try {
      _setLoading(true);
      _clearError();

      await _authService.logout();

      _isAuthenticated = false;
      _currentUser = null;
      _isOfflineMode = false;

      print('Logout exitoso');
    } catch (e) {
      print('Error en logout: $e');
      _errorMessage = e.toString().replaceAll('Exception: ', '');
    } finally {
      _setLoading(false);
    }
  }

  // Sincronizar datos (cuando vuelve la conexión)
  Future<void> syncData() async {
    try {
      print('Sincronizando datos...');
      await _authService.syncData();

      // Actualizar usuario actual después de sincronizar
      final user = await _authService.getCurrentUser();
      if (user != null) {
        _currentUser = user;

        // Verificar si sigue en modo offline
        final token = await _authService.getStoredToken();
        _isOfflineMode = token?.startsWith('offline_') ?? false;

        notifyListeners();
        print('Sincronización completada');
      }
    } catch (e) {
      print('Error al sincronizar datos: $e');
      _errorMessage = e.toString();
      notifyListeners();
    }
  }

  // Actualizar usuario actual
  Future<void> refreshUser() async {
    try {
      final user = await _authService.getCurrentUser();
      if (user != null) {
        _currentUser = user;
        notifyListeners();
        print('Usuario actualizado: ${user.nombre}');
      }
    } catch (e) {
      print('Error al actualizar usuario: $e');
      _errorMessage = e.toString();
      notifyListeners();
    }
  }

  // Verificar conectividad
  Future<bool> checkConnectivity() async {
    try {
      final hasInternet = await _authService.hasInternetConnection();
      return hasInternet;
    } catch (e) {
      print('Error al verificar conectividad: $e');
      return false;
    }
  }

  // Métodos privados de utilidad
  void _setLoading(bool value) {
    _isLoading = value;
    notifyListeners();
  }

  void _clearError() {
    _errorMessage = null;
    notifyListeners();
  }

  // Limpiar mensaje de error manualmente
  void clearError() {
    _clearError();
  }
}
