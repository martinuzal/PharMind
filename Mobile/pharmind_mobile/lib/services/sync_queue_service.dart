import 'package:sqflite/sqflite.dart';
import 'dart:convert';
import 'database_service.dart';
import 'mobile_api_service.dart';

/// Tipos de operaciones pendientes de sincronización
enum SyncOperationType {
  createRelacion,
  updateRelacion,
  createInteraccion,
  updateInteraccion,
}

/// Representa una operación pendiente en la cola de sincronización
class SyncQueueItem {
  final String id;
  final SyncOperationType operationType;
  final String entityId; // ID de la entidad (relación o interacción)
  final Map<String, dynamic> data; // Datos a enviar
  final DateTime createdAt;
  final int retryCount;
  final String? errorMessage;

  SyncQueueItem({
    required this.id,
    required this.operationType,
    required this.entityId,
    required this.data,
    required this.createdAt,
    this.retryCount = 0,
    this.errorMessage,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'operationType': operationType.index,
      'entityId': entityId,
      'data': jsonEncode(data),
      'createdAt': createdAt.toIso8601String(),
      'retryCount': retryCount,
      'errorMessage': errorMessage,
    };
  }

  factory SyncQueueItem.fromMap(Map<String, dynamic> map) {
    return SyncQueueItem(
      id: map['id'] as String,
      operationType: SyncOperationType.values[map['operationType'] as int],
      entityId: map['entityId'] as String,
      data: jsonDecode(map['data'] as String) as Map<String, dynamic>,
      createdAt: DateTime.parse(map['createdAt'] as String),
      retryCount: map['retryCount'] as int,
      errorMessage: map['errorMessage'] as String?,
    );
  }

  SyncQueueItem copyWith({
    String? id,
    SyncOperationType? operationType,
    String? entityId,
    Map<String, dynamic>? data,
    DateTime? createdAt,
    int? retryCount,
    String? errorMessage,
  }) {
    return SyncQueueItem(
      id: id ?? this.id,
      operationType: operationType ?? this.operationType,
      entityId: entityId ?? this.entityId,
      data: data ?? this.data,
      createdAt: createdAt ?? this.createdAt,
      retryCount: retryCount ?? this.retryCount,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }
}

/// Servicio para gestionar la cola de sincronización offline
class SyncQueueService {
  static final SyncQueueService _instance = SyncQueueService._internal();
  factory SyncQueueService() => _instance;
  SyncQueueService._internal();

  final DatabaseService _dbService = DatabaseService();
  final MobileApiService _apiService = MobileApiService();

  // Nombre de la tabla de cola de sincronización
  static const String _tableName = 'sync_queue';

  /// Inicializa la tabla de cola de sincronización
  Future<void> initializeSyncQueue() async {
    final db = await _dbService.database;

    // Crear tabla si no existe
    await db.execute('''
      CREATE TABLE IF NOT EXISTS $_tableName (
        id TEXT PRIMARY KEY,
        operationType INTEGER NOT NULL,
        entityId TEXT NOT NULL,
        data TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        retryCount INTEGER DEFAULT 0,
        errorMessage TEXT
      )
    ''');

    print('Tabla de cola de sincronización inicializada');
  }

  /// Agrega una operación a la cola de sincronización
  Future<void> addToQueue(SyncQueueItem item) async {
    try {
      final db = await _dbService.database;
      await db.insert(
        _tableName,
        item.toMap(),
        conflictAlgorithm: ConflictAlgorithm.replace,
      );
      print('✅ Operación agregada a la cola: ${item.operationType} - ${item.entityId}');
    } catch (e) {
      print('❌ Error al agregar a la cola: $e');
      rethrow;
    }
  }

  /// Obtiene todos los items pendientes en la cola
  Future<List<SyncQueueItem>> getPendingItems() async {
    try {
      final db = await _dbService.database;
      final results = await db.query(
        _tableName,
        orderBy: 'createdAt ASC',
      );
      return results.map((map) => SyncQueueItem.fromMap(map)).toList();
    } catch (e) {
      print('❌ Error al obtener items pendientes: $e');
      return [];
    }
  }

  /// Obtiene el número de items pendientes
  Future<int> getPendingCount() async {
    try {
      final db = await _dbService.database;
      final result = await db.rawQuery('SELECT COUNT(*) as count FROM $_tableName');
      return Sqflite.firstIntValue(result) ?? 0;
    } catch (e) {
      print('❌ Error al contar items pendientes: $e');
      return 0;
    }
  }

  /// Elimina un item de la cola después de sincronización exitosa
  Future<void> removeFromQueue(String id) async {
    try {
      final db = await _dbService.database;
      await db.delete(
        _tableName,
        where: 'id = ?',
        whereArgs: [id],
      );
      print('✅ Item removido de la cola: $id');
    } catch (e) {
      print('❌ Error al remover de la cola: $e');
      rethrow;
    }
  }

  /// Actualiza el contador de reintentos y mensaje de error
  Future<void> updateRetryCount(String id, int retryCount, String? errorMessage) async {
    try {
      final db = await _dbService.database;
      await db.update(
        _tableName,
        {
          'retryCount': retryCount,
          'errorMessage': errorMessage,
        },
        where: 'id = ?',
        whereArgs: [id],
      );
      print('⚠️ Item actualizado con reintento $retryCount: $id');
    } catch (e) {
      print('❌ Error al actualizar reintento: $e');
      rethrow;
    }
  }

  /// Procesa la cola de sincronización (envía operaciones pendientes al servidor)
  /// Estrategia: Last Write Wins (las actualizaciones más recientes sobrescriben)
  Future<SyncResult> processQueue() async {
    print('🔄 Iniciando procesamiento de cola de sincronización...');

    final result = SyncResult();
    final pendingItems = await getPendingItems();

    if (pendingItems.isEmpty) {
      print('✅ No hay items pendientes para sincronizar');
      return result;
    }

    print('📤 Procesando ${pendingItems.length} items pendientes...');

    for (final item in pendingItems) {
      try {
        await _processItem(item);
        await removeFromQueue(item.id);
        result.successCount++;
        print('✅ Item sincronizado: ${item.operationType} - ${item.entityId}');
      } catch (e) {
        result.failureCount++;
        final newRetryCount = item.retryCount + 1;
        final errorMsg = e.toString();

        // Límite de 3 reintentos
        if (newRetryCount >= 3) {
          print('❌ Item falló después de 3 reintentos, removiendo: ${item.entityId}');
          await removeFromQueue(item.id);
          result.removedCount++;
        } else {
          await updateRetryCount(item.id, newRetryCount, errorMsg);
        }

        print('❌ Error al sincronizar item ${item.entityId}: $errorMsg');
      }
    }

    print('🏁 Sincronización completada: ${result.successCount} éxitos, ${result.failureCount} fallos, ${result.removedCount} removidos');
    return result;
  }

  /// Procesa un item individual de la cola
  Future<void> _processItem(SyncQueueItem item) async {
    switch (item.operationType) {
      case SyncOperationType.createRelacion:
        await _apiService.createRelacion(
          tipoRelacionId: item.data['tipoRelacionId'] as String,
          agenteId: item.data['agenteId'] as String,
          clientePrincipalId: item.data['clientePrincipalId'] as String,
          clienteSecundario1Id: item.data['clienteSecundario1Id'] as String?,
          clienteSecundario2Id: item.data['clienteSecundario2Id'] as String?,
          prioridad: item.data['prioridad'] as String?,
          frecuenciaVisitas: item.data['frecuenciaVisitas'] as String?,
          observaciones: item.data['observaciones'] as String?,
          datosDinamicos: item.data['datosDinamicos'] as Map<String, dynamic>?,
        );
        break;

      case SyncOperationType.updateRelacion:
        await _apiService.updateRelacion(
          id: item.entityId,
          clientePrincipalId: item.data['clientePrincipalId'] as String?,
          clienteSecundario1Id: item.data['clienteSecundario1Id'] as String?,
          clienteSecundario2Id: item.data['clienteSecundario2Id'] as String?,
          prioridad: item.data['prioridad'] as String?,
          frecuenciaVisitas: item.data['frecuenciaVisitas'] as String?,
          observaciones: item.data['observaciones'] as String?,
          estado: item.data['estado'] as String?,
          fechaFin: item.data['fechaFin'] != null
              ? DateTime.parse(item.data['fechaFin'] as String)
              : null,
          datosDinamicos: item.data['datosDinamicos'] as Map<String, dynamic>?,
        );
        break;

      case SyncOperationType.createInteraccion:
        await _apiService.createInteraccion(
          tipoInteraccionId: item.data['tipoInteraccionId'] as String,
          relacionId: item.data['relacionId'] as String,
          agenteId: item.data['agenteId'] as String,
          clientePrincipalId: item.data['clientePrincipalId'] as String,
          clienteSecundario1Id: item.data['clienteSecundario1Id'] as String?,
          fecha: DateTime.parse(item.data['fecha'] as String),
          turno: item.data['turno'] as String?,
          duracionMinutos: item.data['duracionMinutos'] as int?,
          objetivoVisita: item.data['objetivoVisita'] as String?,
          resumenVisita: item.data['resumenVisita'] as String?,
          proximaAccion: item.data['proximaAccion'] as String?,
          fechaProximaAccion: item.data['fechaProximaAccion'] != null
              ? DateTime.parse(item.data['fechaProximaAccion'] as String)
              : null,
          resultadoVisita: item.data['resultadoVisita'] as String?,
          latitud: item.data['latitud'] as double?,
          longitud: item.data['longitud'] as double?,
          direccionCapturada: item.data['direccionCapturada'] as String?,
          datosDinamicos: item.data['datosDinamicos'] as Map<String, dynamic>?,
        );
        break;

      case SyncOperationType.updateInteraccion:
        await _apiService.updateInteraccion(
          id: item.entityId,
          fecha: item.data['fecha'] != null
              ? DateTime.parse(item.data['fecha'] as String)
              : null,
          turno: item.data['turno'] as String?,
          duracionMinutos: item.data['duracionMinutos'] as int?,
          objetivoVisita: item.data['objetivoVisita'] as String?,
          resumenVisita: item.data['resumenVisita'] as String?,
          proximaAccion: item.data['proximaAccion'] as String?,
          fechaProximaAccion: item.data['fechaProximaAccion'] != null
              ? DateTime.parse(item.data['fechaProximaAccion'] as String)
              : null,
          resultadoVisita: item.data['resultadoVisita'] as String?,
          latitud: item.data['latitud'] as double?,
          longitud: item.data['longitud'] as double?,
          direccionCapturada: item.data['direccionCapturada'] as String?,
          datosDinamicos: item.data['datosDinamicos'] as Map<String, dynamic>?,
        );
        break;
    }
  }

  /// Limpia toda la cola (útil para desarrollo/testing)
  Future<void> clearQueue() async {
    try {
      final db = await _dbService.database;
      await db.delete(_tableName);
      print('🗑️ Cola de sincronización limpiada');
    } catch (e) {
      print('❌ Error al limpiar cola: $e');
      rethrow;
    }
  }
}

/// Resultado del procesamiento de la cola
class SyncResult {
  int successCount = 0;
  int failureCount = 0;
  int removedCount = 0;

  bool get hasErrors => failureCount > 0 || removedCount > 0;
  bool get isSuccess => successCount > 0 && !hasErrors;
  int get totalProcessed => successCount + failureCount + removedCount;
}
