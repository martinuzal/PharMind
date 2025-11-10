import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/configuracion.dart';

class ConfigService {
  static const String _configKey = 'app_configuracion';

  Configuracion? _configuracion;

  // Obtener configuración actual
  Configuracion get configuracion => _configuracion ?? Configuracion();

  // Cargar configuración desde SharedPreferences
  Future<Configuracion> cargarConfiguracion() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final configJson = prefs.getString(_configKey);

      if (configJson != null) {
        final Map<String, dynamic> decoded = jsonDecode(configJson);
        _configuracion = Configuracion.fromJson(decoded);
      } else {
        // Si no existe configuración guardada, crear una con valores por defecto
        _configuracion = Configuracion();
        await guardarConfiguracion(_configuracion!);
      }

      return _configuracion!;
    } catch (e) {
      print('Error al cargar configuración: $e');
      // En caso de error, retornar configuración por defecto
      _configuracion = Configuracion();
      return _configuracion!;
    }
  }

  // Guardar configuración en SharedPreferences
  Future<bool> guardarConfiguracion(Configuracion config) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final configJson = jsonEncode(config.toJson());
      await prefs.setString(_configKey, configJson);
      _configuracion = config;
      return true;
    } catch (e) {
      print('Error al guardar configuración: $e');
      return false;
    }
  }

  // Actualizar una configuración específica
  Future<bool> actualizarConfiguracion({
    bool? notificacionesHabilitadas,
    bool? sonidoHabilitado,
    bool? vibracionHabilitada,
    bool? sincronizacionAutomatica,
    int? intervaloSincronizacionMinutos,
    bool? sincronizarSoloWifi,
    String? idioma,
    String? formatoFecha,
    bool? modoOscuro,
    bool? geolocalizacionAutomatica,
    int? precisionGeolocalizacion,
    int? diasRetencionDatosLocales,
    bool? guardarBorradores,
  }) async {
    final configActual = _configuracion ?? Configuracion();

    final nuevaConfig = configActual.copyWith(
      notificacionesHabilitadas: notificacionesHabilitadas,
      sonidoHabilitado: sonidoHabilitado,
      vibracionHabilitada: vibracionHabilitada,
      sincronizacionAutomatica: sincronizacionAutomatica,
      intervaloSincronizacionMinutos: intervaloSincronizacionMinutos,
      sincronizarSoloWifi: sincronizarSoloWifi,
      idioma: idioma,
      formatoFecha: formatoFecha,
      modoOscuro: modoOscuro,
      geolocalizacionAutomatica: geolocalizacionAutomatica,
      precisionGeolocalizacion: precisionGeolocalizacion,
      diasRetencionDatosLocales: diasRetencionDatosLocales,
      guardarBorradores: guardarBorradores,
    );

    return await guardarConfiguracion(nuevaConfig);
  }

  // Resetear configuración a valores por defecto
  Future<bool> resetearConfiguracion() async {
    return await guardarConfiguracion(Configuracion());
  }

  // Obtener intervalo de sincronización en milisegundos
  int get intervaloSincronizacionMs {
    return (_configuracion?.intervaloSincronizacionMinutos ?? 30) * 60 * 1000;
  }

  // Verificar si las notificaciones están habilitadas
  bool get notificacionesHabilitadas {
    return _configuracion?.notificacionesHabilitadas ?? true;
  }

  // Verificar si el modo oscuro está habilitado
  bool get modoOscuroHabilitado {
    return _configuracion?.modoOscuro ?? false;
  }

  // Verificar si la sincronización automática está habilitada
  bool get sincronizacionAutomaticaHabilitada {
    return _configuracion?.sincronizacionAutomatica ?? true;
  }

  // Verificar si debe sincronizar solo con WiFi
  bool get sincronizarSoloWifi {
    return _configuracion?.sincronizarSoloWifi ?? false;
  }

  // Verificar si la geolocalización automática está habilitada
  bool get geolocalizacionAutomaticaHabilitada {
    return _configuracion?.geolocalizacionAutomatica ?? true;
  }

  // Obtener formato de fecha
  String get formatoFecha {
    return _configuracion?.formatoFecha ?? 'dd/MM/yyyy';
  }

  // Obtener idioma
  String get idioma {
    return _configuracion?.idioma ?? 'es';
  }
}
