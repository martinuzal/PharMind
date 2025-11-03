import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:shared_preferences/shared_preferences.dart';
import '../models/esquema_personalizado.dart';
import '../models/entidad_dinamica.dart';
import '../models/sync_stats.dart';
import 'api_service.dart';
import 'database_service.dart';
import 'dart:convert';

class SyncService {
  static final SyncService _instance = SyncService._internal();
  factory SyncService() => _instance;

  final ApiService _apiService = ApiService();
  final DatabaseService _dbService = DatabaseService();

  SyncService._internal();

  // Verificar conectividad
  Future<bool> hasConnection() async {
    if (kIsWeb) {
      // En web, asumimos que siempre hay conexión
      return true;
    }

    try {
      final connectivityResult = await Connectivity().checkConnectivity();
      return connectivityResult != ConnectivityResult.none;
    } catch (e) {
      print('Error al verificar conectividad: $e');
      return false;
    }
  }

  // ==================== SINCRONIZACIÓN COMPLETA ====================

  Future<SyncStats> syncAll() async {
    int esquemasDescargados = 0;
    int entidadesDescargadas = 0;
    int entidadesEnviadas = 0;
    Map<String, int> entidadesPorTipo = {};

    try {
      // En web, no hay sincronización porque no hay base de datos local
      if (kIsWeb) {
        print('Modo web: sincronización no disponible');
        return SyncStats(
          timestamp: DateTime.now(),
          exitosa: false,
          errorMessage: 'Sincronización no disponible en web',
        );
      }

      final hasConn = await hasConnection();
      if (!hasConn) {
        print('Sin conexión. Sincronización cancelada.');
        return SyncStats(
          timestamp: DateTime.now(),
          exitosa: false,
          errorMessage: 'Sin conexión a internet',
        );
      }

      print('Iniciando sincronización completa...');

      // 1. Descargar datos del servidor (servidor -> local)
      final downloadStats = await syncFromServer();
      esquemasDescargados = downloadStats['esquemas'] ?? 0;
      entidadesDescargadas = downloadStats['entidades'] ?? 0;
      entidadesPorTipo = Map<String, int>.from(downloadStats['entidadesPorTipo'] ?? {});

      // 2. Subir cambios locales al servidor (local -> servidor)
      entidadesEnviadas = await syncToServer();

      // 2.5. Reconciliar entidades que ya existen en el servidor
      await reconcileWithServer();

      // 3. Guardar estadísticas de sincronización
      final stats = SyncStats(
        timestamp: DateTime.now(),
        esquemasDescargados: esquemasDescargados,
        entidadesDescargadas: entidadesDescargadas,
        entidadesEnviadas: entidadesEnviadas,
        entidadesPorTipo: entidadesPorTipo,
        exitosa: true,
      );

      await saveLastSyncStats(stats);

      // 4. Guardar timestamp de última sincronización
      await saveLastSyncTimestamp();

      print('Sincronización completa exitosa');
      return stats;
    } catch (e) {
      print('Error en sincronización completa: $e');
      final errorStats = SyncStats(
        timestamp: DateTime.now(),
        esquemasDescargados: esquemasDescargados,
        entidadesDescargadas: entidadesDescargadas,
        entidadesEnviadas: entidadesEnviadas,
        entidadesPorTipo: entidadesPorTipo,
        exitosa: false,
        errorMessage: e.toString(),
      );
      await saveLastSyncStats(errorStats);
      return errorStats;
    }
  }

  // ==================== DESCARG AR DEL SERVIDOR (Servidor -> Local) ====================

  Future<Map<String, dynamic>> syncFromServer() async {
    try {
      print('Descargando datos del servidor...');

      // Descargar esquemas
      final esquemasCount = await _downloadEsquemas();

      // Descargar entidades de cada esquema
      final entidadesStats = await _downloadEntidades();

      print('Datos descargados del servidor exitosamente');

      return {
        'esquemas': esquemasCount,
        'entidades': entidadesStats['total'] ?? 0,
        'entidadesPorTipo': entidadesStats['porTipo'] ?? {},
      };
    } catch (e) {
      print('Error al descargar del servidor: $e');
      rethrow;
    }
  }

  Future<int> _downloadEsquemas() async {
    try {
      final response = await _apiService.get('/api/EsquemasPersonalizados');
      final List<dynamic> data = response.data;

      for (var esquemaJson in data) {
        final esquemaMap = {
          'id': esquemaJson['id'],
          'nombreEntidad': esquemaJson['nombre'], // Backend usa 'nombre'
          'descripcion': esquemaJson['descripcion'],
          'icono': esquemaJson['icono'],
          'esquemaJson': esquemaJson['schema'], // Backend usa 'schema'
          'tipoEntidad': esquemaJson['entidadTipo'], // Backend usa 'entidadTipo'
          'activo': esquemaJson['activo'],
          'fechaCreacion': esquemaJson['fechaCreacion'],
        };

        await _dbService.saveEsquema(esquemaMap);
      }

      print('Esquemas descargados: ${data.length}');
      return data.length;
    } catch (e) {
      print('Error al descargar esquemas: $e');
      rethrow;
    }
  }

  Future<Map<String, dynamic>> _downloadEntidades() async {
    try {
      // Obtener todos los esquemas locales
      final esquemas = await _dbService.getAllEsquemas();

      int totalEntidades = 0;
      Map<String, int> entidadesPorTipo = {};

      for (var esquema in esquemas) {
        final esquemaId = esquema['id'];
        final nombreEntidad = esquema['nombreEntidad'] ?? 'Desconocido';

        // Descargar entidades de este esquema
        try {
          final response = await _apiService.get('/api/EntidadesDinamicas/esquema/$esquemaId');
          final List<dynamic> data = response.data;

          for (var entidadJson in data) {
            final entidadMap = {
              'id': entidadJson['id'],
              'esquemaId': entidadJson['esquemaId'] ?? entidadJson['EsquemaId'],
              'datos': entidadJson['datos'] is String
                  ? entidadJson['datos']
                  : jsonEncode(entidadJson['datos']),
              'fechaCreacion': entidadJson['fechaCreacion'],
              'fechaActualizacion': entidadJson['fechaActualizacion'],
              'usuarioId': entidadJson['usuarioId'] ?? entidadJson['UsuarioId'],
              'nombreEntidad': nombreEntidad,
              'isSynced': 1,
            };

            await _dbService.saveEntidad(entidadMap);
          }

          // Actualizar contadores
          totalEntidades += data.length;
          entidadesPorTipo[nombreEntidad] = (entidadesPorTipo[nombreEntidad] ?? 0) + data.length;
        } catch (e) {
          print('Error al descargar entidades del esquema $esquemaId: $e');
          // Continuar con el siguiente esquema
        }
      }

      print('Entidades descargadas: $totalEntidades');
      return {
        'total': totalEntidades,
        'porTipo': entidadesPorTipo,
      };
    } catch (e) {
      print('Error al descargar entidades: $e');
      rethrow;
    }
  }

  // ==================== SUBIR AL SERVIDOR (Local -> Servidor) ====================

  Future<int> syncToServer() async {
    int entidadesEnviadas = 0;

    try {
      print('Subiendo cambios locales al servidor...');

      // Subir entidades no sincronizadas
      final unsyncedEntidades = await _dbService.getUnsyncedEntidades();

      for (var entidadData in unsyncedEntidades) {
        try {
          // Verificar si es eliminación o creación/actualización
          if (entidadData['isDeleted'] == 1) {
            // Eliminar del servidor
            await _apiService.delete('/api/EntidadesDinamicas/${entidadData['id']}');
            print('Entidad eliminada en servidor: ${entidadData['id']}');
          } else {
            // Preparar datos para enviar
            final datos = entidadData['datos'];
            final datosMap = datos is String ? jsonDecode(datos) : datos;

            final entidad = EntidadDinamica(
              id: entidadData['id'],
              esquemaId: entidadData['esquemaId'],
              datos: datosMap,
              usuarioId: entidadData['usuarioId'],
            );

            if (entidadData['id'] == null || entidadData['id'].toString().isEmpty) {
              // Crear en servidor
              final response = await _apiService.post(
                '/api/EntidadesDinamicas',
                data: entidad.toJson(),
              );

              // Actualizar ID local con el ID del servidor
              final newId = response.data['id'];
              await _dbService.saveEntidad({
                ...entidadData,
                'id': newId,
                'isSynced': 1,
              });

              print('Entidad creada en servidor: $newId');
            } else {
              // Actualizar en servidor
              await _apiService.put(
                '/api/EntidadesDinamicas/${entidadData['id']}',
                data: entidad.toJson(),
              );

              // Marcar como sincronizada
              await _dbService.markEntidadAsSynced(entidadData['id']);

              print('Entidad actualizada en servidor: ${entidadData['id']}');
            }
          }

          // Incrementar contador de entidades enviadas
          entidadesEnviadas++;
        } catch (e) {
          print('Error al sincronizar entidad ${entidadData['id']}: $e');
          // Continuar con la siguiente entidad
        }
      }

      print('Cambios locales subidos exitosamente: $entidadesEnviadas');
      return entidadesEnviadas;
    } catch (e) {
      print('Error al subir al servidor: $e');
      rethrow;
    }
  }

  // ==================== SINCRONIZACIÓN DE MAESTRAS ====================

  Future<void> syncMaestras(String tableName, String valueField, String labelField) async {
    try {
      final hasConn = await hasConnection();
      if (!hasConn) {
        print('Sin conexión. Usando maestras en cache.');
        return;
      }

      final response = await _apiService.get(
        '/api/EntidadesDinamicas/fieldOptions',
        queryParameters: {
          'tableName': tableName,
          'valueField': valueField,
          'labelField': labelField,
        },
      );

      final List<dynamic> data = response.data;

      // Limpiar maestras existentes
      await _dbService.clearMaestrasByTable(tableName);

      // Guardar nuevas maestras
      for (var item in data) {
        await _dbService.saveMaestra(
          tableName,
          item['value']?.toString() ?? '',
          item['label']?.toString() ?? '',
        );
      }

      print('Maestras sincronizadas para $tableName: ${data.length} registros');
    } catch (e) {
      print('Error al sincronizar maestras de $tableName: $e');
      // No hacer rethrow para permitir uso de cache
    }
  }

  Future<List<Map<String, dynamic>>> getMaestrasOptions(
    String tableName,
    String valueField,
    String labelField,
  ) async {
    try {
      // Intentar sincronizar primero
      await syncMaestras(tableName, valueField, labelField);

      // Obtener del cache
      final maestras = await _dbService.getMaestrasByTable(tableName);

      return maestras.map((m) => {
        'value': m['value'],
        'label': m['label'],
      }).toList();
    } catch (e) {
      print('Error al obtener maestras: $e');
      // Devolver cache aunque falle la sincronización
      final maestras = await _dbService.getMaestrasByTable(tableName);
      return maestras.map((m) => {
        'value': m['value'],
        'label': m['label'],
      }).toList();
    }
  }

  // ==================== TIMESTAMP DE SINCRONIZACIÓN ====================

  /// Guarda el timestamp de la última sincronización exitosa
  Future<void> saveLastSyncTimestamp() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('last_sync_timestamp', DateTime.now().toIso8601String());
      print('Timestamp de sincronización guardado: ${DateTime.now()}');
    } catch (e) {
      print('Error al guardar timestamp de sincronización: $e');
    }
  }

  /// Obtiene el timestamp de la última sincronización
  Future<DateTime?> getLastSyncTimestamp() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final timestampStr = prefs.getString('last_sync_timestamp');
      if (timestampStr != null) {
        return DateTime.parse(timestampStr);
      }
      return null;
    } catch (e) {
      print('Error al obtener timestamp de sincronización: $e');
      return null;
    }
  }

  /// Obtiene el tiempo transcurrido desde la última sincronización en formato legible
  Future<String> getLastSyncTimeAgo() async {
    try {
      final lastSync = await getLastSyncTimestamp();
      if (lastSync == null) {
        return 'Nunca sincronizado';
      }

      final now = DateTime.now();
      final difference = now.difference(lastSync);

      if (difference.inSeconds < 60) {
        return 'Hace ${difference.inSeconds} segundos';
      } else if (difference.inMinutes < 60) {
        return 'Hace ${difference.inMinutes} minuto${difference.inMinutes > 1 ? 's' : ''}';
      } else if (difference.inHours < 24) {
        return 'Hace ${difference.inHours} hora${difference.inHours > 1 ? 's' : ''}';
      } else if (difference.inDays < 30) {
        return 'Hace ${difference.inDays} día${difference.inDays > 1 ? 's' : ''}';
      } else {
        final months = (difference.inDays / 30).floor();
        return 'Hace $months mes${months > 1 ? 'es' : ''}';
      }
    } catch (e) {
      print('Error al calcular tiempo desde última sincronización: $e');
      return 'Desconocido';
    }
  }

  // ==================== ESTADÍSTICAS DE SINCRONIZACIÓN ====================

  /// Guarda las estadísticas de la última sincronización
  Future<void> saveLastSyncStats(SyncStats stats) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('last_sync_stats', jsonEncode(stats.toJson()));
      print('Estadísticas de sincronización guardadas');
    } catch (e) {
      print('Error al guardar estadísticas de sincronización: $e');
    }
  }

  /// Obtiene las estadísticas de la última sincronización
  Future<SyncStats?> getLastSyncStats() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final statsStr = prefs.getString('last_sync_stats');
      if (statsStr != null) {
        return SyncStats.fromJson(jsonDecode(statsStr));
      }
      return null;
    } catch (e) {
      print('Error al obtener estadísticas de sincronización: $e');
      return null;
    }
  }

  /// Obtiene el conteo de entidades pendientes de sincronización
  Future<Map<String, int>> getPendingSyncCount() async {
    try {
      if (kIsWeb) {
        return {'total': 0, 'porTipo': 0};
      }

      final unsyncedEntidades = await _dbService.getUnsyncedEntidades();
      int total = unsyncedEntidades.length;

      // Contar por tipo de entidad
      Map<String, int> porTipo = {};
      for (var entidad in unsyncedEntidades) {
        final nombreEntidad = entidad['nombreEntidad'] ?? 'Desconocido';
        porTipo[nombreEntidad] = (porTipo[nombreEntidad] ?? 0) + 1;
      }

      return {
        'total': total,
        ...porTipo,
      };
    } catch (e) {
      print('Error al obtener entidades pendientes: $e');
      return {'total': 0};
    }
  }

  /// Marca todas las entidades locales que existen en el servidor como sincronizadas
  Future<void> reconcileWithServer() async {
    try {
      if (kIsWeb) {
        print('Modo web: reconciliación no disponible');
        return;
      }

      final hasConn = await hasConnection();
      if (!hasConn) {
        print('Sin conexión. Reconciliación cancelada.');
        return;
      }

      print('Iniciando reconciliación con servidor...');

      // Obtener todas las entidades no sincronizadas
      final unsyncedEntidades = await _dbService.getUnsyncedEntidades();

      for (var entidadData in unsyncedEntidades) {
        try {
          final entidadId = entidadData['id'];

          // Verificar si la entidad existe en el servidor
          try {
            await _apiService.get('/api/EntidadesDinamicas/$entidadId');

            // Si existe, marcarla como sincronizada
            await _dbService.markEntidadAsSynced(entidadId);
            print('Entidad $entidadId marcada como sincronizada');
          } catch (e) {
            // Si no existe (404), la entidad realmente necesita ser sincronizada
            print('Entidad $entidadId no existe en servidor');
          }
        } catch (e) {
          print('Error al verificar entidad ${entidadData['id']}: $e');
        }
      }

      print('Reconciliación completada');
    } catch (e) {
      print('Error en reconciliación: $e');
    }
  }
}
