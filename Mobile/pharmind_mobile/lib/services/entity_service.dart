import 'package:flutter/foundation.dart' show kIsWeb;
import '../models/esquema_personalizado.dart';
import '../models/entidad_dinamica.dart';
import 'api_service.dart';
import 'sync_service.dart';
import 'database_service.dart';
import 'dart:convert';

class EntityService {
  final ApiService _apiService = ApiService();
  final SyncService _syncService = SyncService();
  final DatabaseService _dbService = DatabaseService();

  // Obtener todos los esquemas de entidades
  Future<List<EsquemaPersonalizado>> getEsquemas() async {
    try {
      final hasConn = await _syncService.hasConnection();

      if (hasConn) {
        // Si hay conexión, obtener del servidor y actualizar cache
        try {
          final response = await _apiService.get('/api/EsquemasPersonalizados');
          final List<dynamic> data = response.data;

          // Guardar en cache (solo en plataformas móviles/desktop, no en web)
          if (!kIsWeb) {
            for (var esquemaJson in data) {
              // Mapear campos del backend al formato local
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
          }

          return data.map((json) => EsquemaPersonalizado.fromJson(json)).toList();
        } catch (e) {
          print('Error al obtener esquemas del servidor, usando cache: $e');
          // Si falla el servidor, usar cache (solo en plataformas que soportan SQLite)
          if (!kIsWeb) {
            return _getEsquemasFromCache();
          }
          rethrow;
        }
      } else {
        // Sin conexión, usar cache (solo en plataformas que soportan SQLite)
        if (!kIsWeb) {
          print('Sin conexión, obteniendo esquemas del cache');
          return _getEsquemasFromCache();
        }
        throw Exception('Sin conexión y no hay cache disponible en web');
      }
    } catch (e) {
      print('Error al obtener esquemas: $e');
      rethrow;
    }
  }

  Future<List<EsquemaPersonalizado>> _getEsquemasFromCache() async {
    final esquemas = await _dbService.getAllEsquemas();
    return esquemas.map((esquemaMap) {
      return EsquemaPersonalizado.fromJson({
        'id': esquemaMap['id'],
        'nombreEntidad': esquemaMap['nombreEntidad'],
        'descripcion': esquemaMap['descripcion'],
        'icono': esquemaMap['icono'],
        'esquemaJson': esquemaMap['esquemaJson'],
        'tipoEntidad': esquemaMap['tipoEntidad'],
        'activo': esquemaMap['activo'] == 1,
        'fechaCreacion': esquemaMap['fechaCreacion'],
      });
    }).toList();
  }

  // Obtener un esquema por ID
  Future<EsquemaPersonalizado> getEsquemaById(dynamic id) async {
    try {
      final hasConn = await _syncService.hasConnection();

      if (hasConn) {
        try {
          final response = await _apiService.get('/api/EsquemasPersonalizados/$id');
          return EsquemaPersonalizado.fromJson(response.data);
        } catch (e) {
          print('Error al obtener esquema del servidor, usando cache: $e');
          // Si falla el servidor, usar cache
          final esquemaMap = await _dbService.getEsquemaById(id.toString());
          if (esquemaMap != null) {
            return EsquemaPersonalizado.fromJson({
              'id': esquemaMap['id'],
              'nombreEntidad': esquemaMap['nombreEntidad'],
              'descripcion': esquemaMap['descripcion'],
              'icono': esquemaMap['icono'],
              'esquemaJson': esquemaMap['esquemaJson'],
              'tipoEntidad': esquemaMap['tipoEntidad'],
              'activo': esquemaMap['activo'] == 1,
              'fechaCreacion': esquemaMap['fechaCreacion'],
            });
          }
          rethrow;
        }
      } else {
        // Sin conexión, usar cache
        final esquemaMap = await _dbService.getEsquemaById(id.toString());
        if (esquemaMap != null) {
          return EsquemaPersonalizado.fromJson({
            'id': esquemaMap['id'],
            'nombreEntidad': esquemaMap['nombreEntidad'],
            'descripcion': esquemaMap['descripcion'],
            'icono': esquemaMap['icono'],
            'esquemaJson': esquemaMap['esquemaJson'],
            'tipoEntidad': esquemaMap['tipoEntidad'],
            'activo': esquemaMap['activo'] == 1,
            'fechaCreacion': esquemaMap['fechaCreacion'],
          });
        }
        throw Exception('Esquema no encontrado en cache');
      }
    } catch (e) {
      print('Error al obtener esquema $id: $e');
      rethrow;
    }
  }

  // Obtener entidades de un esquema específico
  Future<List<EntidadDinamica>> getEntidadesByEsquema(dynamic esquemaId) async {
    try {
      final hasConn = await _syncService.hasConnection();

      if (hasConn) {
        // Si hay conexión, obtener del servidor y actualizar cache
        try {
          final response = await _apiService.get('/api/EntidadesDinamicas/esquema/$esquemaId');
          final List<dynamic> data = response.data;

          // Guardar en cache (solo en plataformas móviles/desktop, no en web)
          if (!kIsWeb) {
            final esquemaMap = await _dbService.getEsquemaById(esquemaId.toString());
            for (var entidadJson in data) {
              await _dbService.saveEntidad({
                'id': entidadJson['id'],
                'esquemaId': entidadJson['esquemaId'] ?? entidadJson['EsquemaId'],
                'datos': entidadJson['datos'] is String
                    ? entidadJson['datos']
                    : jsonEncode(entidadJson['datos']),
                'fechaCreacion': entidadJson['fechaCreacion'],
                'fechaActualizacion': entidadJson['fechaActualizacion'],
                'usuarioId': entidadJson['usuarioId'] ?? entidadJson['UsuarioId'],
                'nombreEntidad': esquemaMap?['nombreEntidad'],
                'isSynced': 1,
              });
            }
          }

          return data.map((json) => EntidadDinamica.fromJson(json)).toList();
        } catch (e) {
          print('Error al obtener entidades del servidor, usando cache: $e');
          // Si falla el servidor, usar cache (solo en plataformas que soportan SQLite)
          if (!kIsWeb) {
            return _getEntidadesFromCache(esquemaId);
          }
          rethrow;
        }
      } else {
        // Sin conexión, usar cache (solo en plataformas que soportan SQLite)
        if (!kIsWeb) {
          print('Sin conexión, obteniendo entidades del cache');
          return _getEntidadesFromCache(esquemaId);
        }
        throw Exception('Sin conexión y no hay cache disponible en web');
      }
    } catch (e) {
      print('Error al obtener entidades del esquema $esquemaId: $e');
      rethrow;
    }
  }

  Future<List<EntidadDinamica>> _getEntidadesFromCache(dynamic esquemaId) async {
    final entidades = await _dbService.getEntidadesByEsquema(esquemaId.toString());
    return entidades.map((entidadMap) {
      return EntidadDinamica.fromJson({
        'id': entidadMap['id'],
        'esquemaId': entidadMap['esquemaId'],
        'datos': entidadMap['datos'],
        'fechaCreacion': entidadMap['fechaCreacion'],
        'fechaActualizacion': entidadMap['fechaActualizacion'],
        'usuarioId': entidadMap['usuarioId'],
        'nombreEntidad': entidadMap['nombreEntidad'],
      });
    }).toList();
  }

  // Obtener una entidad por ID
  Future<EntidadDinamica> getEntidadById(dynamic id) async {
    try {
      final hasConn = await _syncService.hasConnection();

      if (hasConn) {
        try {
          final response = await _apiService.get('/api/EntidadesDinamicas/$id');
          return EntidadDinamica.fromJson(response.data);
        } catch (e) {
          print('Error al obtener entidad del servidor, usando cache: $e');
          // Si falla el servidor, usar cache
          final entidadMap = await _dbService.getEntidadById(id.toString());
          if (entidadMap != null) {
            return EntidadDinamica.fromJson({
              'id': entidadMap['id'],
              'esquemaId': entidadMap['esquemaId'],
              'datos': entidadMap['datos'],
              'fechaCreacion': entidadMap['fechaCreacion'],
              'fechaActualizacion': entidadMap['fechaActualizacion'],
              'usuarioId': entidadMap['usuarioId'],
              'nombreEntidad': entidadMap['nombreEntidad'],
            });
          }
          rethrow;
        }
      } else {
        // Sin conexión, usar cache
        final entidadMap = await _dbService.getEntidadById(id.toString());
        if (entidadMap != null) {
          return EntidadDinamica.fromJson({
            'id': entidadMap['id'],
            'esquemaId': entidadMap['esquemaId'],
            'datos': entidadMap['datos'],
            'fechaCreacion': entidadMap['fechaCreacion'],
            'fechaActualizacion': entidadMap['fechaActualizacion'],
            'usuarioId': entidadMap['usuarioId'],
            'nombreEntidad': entidadMap['nombreEntidad'],
          });
        }
        throw Exception('Entidad no encontrada en cache');
      }
    } catch (e) {
      print('Error al obtener entidad $id: $e');
      rethrow;
    }
  }

  // Crear una nueva entidad
  Future<EntidadDinamica> createEntidad(EntidadDinamica entidad) async {
    try {
      final hasConn = await _syncService.hasConnection();

      // Generar ID temporal para la entidad si no tiene
      final tempId = entidad.id ?? DateTime.now().millisecondsSinceEpoch.toString();

      // Guardar en base de datos local primero
      await _dbService.saveEntidad({
        'id': tempId,
        'esquemaId': entidad.esquemaId,
        'datos': jsonEncode(entidad.datos),
        'fechaCreacion': DateTime.now().toIso8601String(),
        'fechaActualizacion': DateTime.now().toIso8601String(),
        'usuarioId': entidad.usuarioId,
        'nombreEntidad': entidad.nombreEntidad,
        'isSynced': hasConn ? 0 : 0, // Marcar como no sincronizada
      });

      if (hasConn) {
        // Intentar sincronizar con el servidor
        try {
          final response = await _apiService.post(
            '/api/EntidadesDinamicas',
            data: entidad.toJson(),
          );

          final newEntity = EntidadDinamica.fromJson(response.data);

          // Actualizar en la base de datos local con el ID del servidor
          await _dbService.saveEntidad({
            'id': newEntity.id,
            'esquemaId': newEntity.esquemaId,
            'datos': jsonEncode(newEntity.datos),
            'fechaCreacion': newEntity.fechaCreacion?.toIso8601String() ?? DateTime.now().toIso8601String(),
            'fechaActualizacion': newEntity.fechaActualizacion?.toIso8601String() ?? DateTime.now().toIso8601String(),
            'usuarioId': newEntity.usuarioId,
            'nombreEntidad': newEntity.nombreEntidad,
            'isSynced': 1, // Marcar como sincronizada
          });

          print('Entidad creada y sincronizada con el servidor');
          return newEntity;
        } catch (e) {
          print('Error al sincronizar con servidor, entidad guardada localmente: $e');
          // La entidad ya está guardada localmente, retornar la versión local
          return EntidadDinamica(
            id: tempId,
            esquemaId: entidad.esquemaId,
            datos: entidad.datos,
            fechaCreacion: DateTime.now(),
            fechaActualizacion: DateTime.now(),
            usuarioId: entidad.usuarioId,
            nombreEntidad: entidad.nombreEntidad,
          );
        }
      } else {
        print('Sin conexión, entidad guardada localmente');
        return EntidadDinamica(
          id: tempId,
          esquemaId: entidad.esquemaId,
          datos: entidad.datos,
          fechaCreacion: DateTime.now(),
          fechaActualizacion: DateTime.now(),
          usuarioId: entidad.usuarioId,
          nombreEntidad: entidad.nombreEntidad,
        );
      }
    } catch (e) {
      print('Error al crear entidad: $e');
      rethrow;
    }
  }

  // Actualizar una entidad existente
  Future<EntidadDinamica> updateEntidad(dynamic id, EntidadDinamica entidad) async {
    try {
      final hasConn = await _syncService.hasConnection();

      // Actualizar en base de datos local primero
      await _dbService.saveEntidad({
        'id': id,
        'esquemaId': entidad.esquemaId,
        'datos': jsonEncode(entidad.datos),
        'fechaCreacion': entidad.fechaCreacion?.toIso8601String(),
        'fechaActualizacion': DateTime.now().toIso8601String(),
        'usuarioId': entidad.usuarioId,
        'nombreEntidad': entidad.nombreEntidad,
        'isSynced': 0, // Marcar como no sincronizada
      });

      if (hasConn) {
        // Intentar sincronizar con el servidor
        try {
          await _apiService.put(
            '/api/EntidadesDinamicas/$id',
            data: entidad.toJson(),
          );

          // Marcar como sincronizada
          await _dbService.markEntidadAsSynced(id.toString());

          print('Entidad actualizada y sincronizada con el servidor');
        } catch (e) {
          print('Error al sincronizar con servidor, entidad actualizada localmente: $e');
          // La entidad ya está actualizada localmente
        }
      } else {
        print('Sin conexión, entidad actualizada localmente');
      }

      // Backend returns 204 No Content, so return the updated entity
      return entidad;
    } catch (e) {
      print('Error al actualizar entidad $id: $e');
      rethrow;
    }
  }

  // Eliminar una entidad
  Future<void> deleteEntidad(dynamic id) async {
    try {
      final hasConn = await _syncService.hasConnection();

      // Marcar como eliminada en base de datos local (soft delete)
      await _dbService.markEntidadAsDeleted(id.toString());

      if (hasConn) {
        // Intentar eliminar del servidor
        try {
          await _apiService.delete('/api/EntidadesDinamicas/$id');
          print('Entidad eliminada del servidor');
        } catch (e) {
          print('Error al eliminar del servidor, marcada como eliminada localmente: $e');
          // Ya está marcada como eliminada localmente
        }
      } else {
        print('Sin conexión, entidad marcada como eliminada localmente');
      }
    } catch (e) {
      print('Error al eliminar entidad $id: $e');
      rethrow;
    }
  }

  // Obtener opciones de un campo desde fuente de datos SQL
  Future<List<Map<String, dynamic>>> getFieldOptions(
    String tableName,
    String valueField,
    String labelField,
  ) async {
    try {
      // Usar el servicio de sincronización que maneja cache automáticamente
      return await _syncService.getMaestrasOptions(tableName, valueField, labelField);
    } catch (e) {
      print('Error al obtener opciones del campo: $e');
      return [];
    }
  }
}
