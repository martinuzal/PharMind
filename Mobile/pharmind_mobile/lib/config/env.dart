/// Configuración de variables de entorno para PharMind Mobile
/// Usa --dart-define para configurar en tiempo de compilación
class AppConfig {
  // API Configuration
  static const String apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://10.0.2.2:5209/api', // Emulador Android
  );

  // Application Configuration
  static const String appName = String.fromEnvironment(
    'APP_NAME',
    defaultValue: 'PharMind',
  );

  static const String environment = String.fromEnvironment(
    'ENVIRONMENT',
    defaultValue: 'development',
  );

  // Feature Flags
  static const bool enableDebugMode = bool.fromEnvironment(
    'ENABLE_DEBUG_MODE',
    defaultValue: true,
  );

  static const bool enableOfflineMode = bool.fromEnvironment(
    'ENABLE_OFFLINE_MODE',
    defaultValue: true,
  );

  // Timeouts (en segundos)
  static const int connectTimeout = int.fromEnvironment(
    'CONNECT_TIMEOUT',
    defaultValue: 30,
  );

  static const int receiveTimeout = int.fromEnvironment(
    'RECEIVE_TIMEOUT',
    defaultValue: 30,
  );

  // Computed properties
  static bool get isDevelopment => environment == 'development';
  static bool get isProduction => environment == 'production';
  static bool get isStaging => environment == 'staging';

  /// Imprime la configuración actual (solo en modo debug)
  static void printConfig() {
    if (enableDebugMode) {
      // ignore: avoid_print
      print('🔧 App Configuration:');
      // ignore: avoid_print
      print('   Environment: $environment');
      // ignore: avoid_print
      print('   API Base URL: $apiBaseUrl');
      // ignore: avoid_print
      print('   App Name: $appName');
      // ignore: avoid_print
      print('   Debug Mode: $enableDebugMode');
      // ignore: avoid_print
      print('   Offline Mode: $enableOfflineMode');
      // ignore: avoid_print
      print('   Connect Timeout: ${connectTimeout}s');
      // ignore: avoid_print
      print('   Receive Timeout: ${receiveTimeout}s');
    }
  }

  /// Valida que la configuración esté correcta
  static void validate() {
    if (apiBaseUrl.isEmpty) {
      throw Exception('API_BASE_URL no puede estar vacía');
    }

    if (isProduction && apiBaseUrl.contains('localhost')) {
      throw Exception(
        'PRODUCCIÓN no puede usar localhost. Configure API_BASE_URL correctamente.',
      );
    }

    if (isProduction && apiBaseUrl.contains('10.0.2.2')) {
      throw Exception(
        'PRODUCCIÓN no puede usar IP del emulador. Configure API_BASE_URL correctamente.',
      );
    }
  }
}
