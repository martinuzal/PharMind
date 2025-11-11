import 'dart:convert';
import 'package:sqflite/sqflite.dart';
import 'database_service.dart';
import '../models/cliente.dart';
import '../models/relacion.dart';
import '../models/interaccion.dart';
import '../models/tipo_relacion.dart';
import '../models/tipo_interaccion.dart';
import '../models/producto.dart';
import '../models/cita.dart';

/// Servicio para gestionar el cache local de datos
/// Permite trabajar offline guardando y recuperando datos de SQLite
class CacheService {
  static final CacheService _instance = CacheService._internal();
  factory CacheService() => _instance;
  CacheService._internal();

  final DatabaseService _dbService = DatabaseService();

  // ==================== INICIALIZACIÓN ====================

  /// Inicializa todas las tablas de cache
  Future<void> initializeCacheTables() async {
    final db = await _dbService.database;

    // Tabla de Relaciones
    await db.execute('''
      CREATE TABLE IF NOT EXISTS relaciones_cache (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        fechaActualizacion TEXT NOT NULL
      )
    ''');

    // Tabla de Interacciones
    await db.execute('''
      CREATE TABLE IF NOT EXISTS interacciones_cache (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        fechaActualizacion TEXT NOT NULL
      )
    ''');

    // Tabla de Tipos de Relación
    await db.execute('''
      CREATE TABLE IF NOT EXISTS tipos_relacion_cache (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        fechaActualizacion TEXT NOT NULL
      )
    ''');

    // Tabla de Tipos de Interacción
    await db.execute('''
      CREATE TABLE IF NOT EXISTS tipos_interaccion_cache (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        fechaActualizacion TEXT NOT NULL
      )
    ''');

    // Tabla de Productos
    await db.execute('''
      CREATE TABLE IF NOT EXISTS productos_cache (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        fechaActualizacion TEXT NOT NULL
      )
    ''');

    // Tabla de Citas
    await db.execute('''
      CREATE TABLE IF NOT EXISTS citas_cache (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        fechaActualizacion TEXT NOT NULL
      )
    ''');

    // Tabla de Muestras Entregadas
    await db.execute('''
      CREATE TABLE IF NOT EXISTS muestras_entregadas_cache (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        created_at TEXT NOT NULL
      )
    ''');

    // Tabla de Productos Promocionados
    await db.execute('''
      CREATE TABLE IF NOT EXISTS productos_promocionados_cache (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        created_at TEXT NOT NULL
      )
    ''');

    // Tabla de Productos Solicitados
    await db.execute('''
      CREATE TABLE IF NOT EXISTS productos_solicitados_cache (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        created_at TEXT NOT NULL
      )
    ''');

    // Tabla de Movimientos de Inventario
    await db.execute('''
      CREATE TABLE IF NOT EXISTS movimientos_inventario_cache (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        created_at TEXT NOT NULL
      )
    ''');

    // Tabla de Tiempo Utilizado
    await db.execute('''
      CREATE TABLE IF NOT EXISTS tiempo_utilizado_cache (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        created_at TEXT NOT NULL
      )
    ''');

    // Tabla de Tipos de Actividad
    await db.execute('''
      CREATE TABLE IF NOT EXISTS tipos_actividad_cache (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        created_at TEXT NOT NULL
      )
    ''');

    // Tabla de metadata de sincronización
    await db.execute('''
      CREATE TABLE IF NOT EXISTS sync_metadata (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        fechaActualizacion TEXT NOT NULL
      )
    ''');

    print('✅ Tablas de cache inicializadas');
  }

  // ==================== CLIENTES ====================

  /// Guarda una lista de clientes en cache
  Future<void> saveClientes(List<Cliente> clientes) async {
    try {
      final db = await _dbService.database;
      final batch = db.batch();

      for (final cliente in clientes) {
        try {
          final jsonData = cliente.toJson();
          final jsonString = jsonEncode(jsonData);

          batch.insert(
            'clientes_cache',
            {
              'id': cliente.id,
              'data': jsonString,
              'fechaActualizacion': DateTime.now().toIso8601String(),
            },
            conflictAlgorithm: ConflictAlgorithm.replace,
          );
        } catch (e) {
          print('⚠️ Error al serializar cliente ${cliente.id}: $e');
          // Continuar con los demás
        }
      }

      await batch.commit(noResult: true);
      print('💾 ${clientes.length} clientes guardados en cache');
    } catch (e) {
      print('❌ Error al guardar clientes: $e');
      rethrow;
    }
  }

  /// Obtiene todos los clientes del cache
  Future<List<Cliente>> getClientesFromCache({String? agenteId}) async {
    try {
      final db = await _dbService.database;
      final results = await db.query('clientes_cache');

      final clientes = results
          .map((row) => Cliente.fromJson(jsonDecode(row['data'] as String) as Map<String, dynamic>))
          .toList();

      print('📦 ${clientes.length} clientes recuperados del cache');
      return clientes;
    } catch (e) {
      print('❌ Error al obtener clientes del cache: $e');
      return [];
    }
  }

  /// Obtiene un cliente específico del cache
  Future<Cliente?> getClienteFromCache(String id) async {
    try {
      final db = await _dbService.database;
      final results = await db.query(
        'clientes_cache',
        where: 'id = ?',
        whereArgs: [id],
      );

      if (results.isEmpty) return null;

      return Cliente.fromJson(jsonDecode(results.first['data'] as String) as Map<String, dynamic>);
    } catch (e) {
      print('❌ Error al obtener cliente del cache: $e');
      return null;
    }
  }

  // ==================== RELACIONES ====================

  /// Guarda una lista de relaciones en cache
  Future<void> saveRelaciones(List<Relacion> relaciones) async {
    try {
      final db = await _dbService.database;
      final batch = db.batch();

      for (final relacion in relaciones) {
        try {
          // Convertir a JSON y remover el campo frecuencia (se calcula localmente)
          final jsonData = relacion.toJson();
          jsonData.remove('frecuencia'); // No guardar frecuencia, se recalcula localmente
          final jsonString = jsonEncode(jsonData);

          batch.insert(
            'relaciones_cache',
            {
              'id': relacion.id,
              'data': jsonString,
              'fechaActualizacion': DateTime.now().toIso8601String(),
            },
            conflictAlgorithm: ConflictAlgorithm.replace,
          );
        } catch (e) {
          print('⚠️ Error al serializar relación ${relacion.id}: $e');
          // Continuar con las demás
        }
      }

      await batch.commit(noResult: true);
      print('💾 ${relaciones.length} relaciones guardadas en cache');
    } catch (e) {
      print('❌ Error al guardar relaciones: $e');
      rethrow;
    }
  }

  /// Obtiene todas las relaciones del cache
  Future<List<Relacion>> getRelacionesFromCache({String? agenteId}) async {
    try {
      final db = await _dbService.database;
      final results = await db.query('relaciones_cache');

      final relaciones = results
          .map((row) => Relacion.fromJson(jsonDecode(row['data'] as String) as Map<String, dynamic>))
          .toList();

      // Filtrar por agente si se especifica
      if (agenteId != null) {
        return relaciones.where((r) => r.agenteId == agenteId).toList();
      }

      print('📦 ${relaciones.length} relaciones recuperadas del cache');
      return relaciones;
    } catch (e) {
      print('❌ Error al obtener relaciones del cache: $e');
      return [];
    }
  }

  /// Obtiene una relación específica del cache
  Future<Relacion?> getRelacionFromCache(String id) async {
    try {
      final db = await _dbService.database;
      final results = await db.query(
        'relaciones_cache',
        where: 'id = ?',
        whereArgs: [id],
      );

      if (results.isEmpty) return null;

      return Relacion.fromJson(jsonDecode(results.first['data'] as String) as Map<String, dynamic>);
    } catch (e) {
      print('❌ Error al obtener relación del cache: $e');
      return null;
    }
  }

  /// Actualiza una relación en el cache
  Future<void> updateRelacionInCache(Relacion relacion) async {
    final db = await _dbService.database;
    await db.update(
      'relaciones_cache',
      {
        'data': jsonEncode(relacion.toJson()),
        'fechaActualizacion': DateTime.now().toIso8601String(),
      },
      where: 'id = ?',
      whereArgs: [relacion.id],
    );
    print('💾 Relación ${relacion.id} actualizada en cache');
  }

  // ==================== INTERACCIONES ====================

  /// Guarda una lista de interacciones en cache
  Future<void> saveInteracciones(List<Interaccion> interacciones) async {
    final db = await _dbService.database;
    final batch = db.batch();

    for (final interaccion in interacciones) {
      batch.insert(
        'interacciones_cache',
        {
          'id': interaccion.id,
          'data': jsonEncode(interaccion.toJson()),
          'fechaActualizacion': DateTime.now().toIso8601String(),
        },
        conflictAlgorithm: ConflictAlgorithm.replace,
      );
    }

    await batch.commit(noResult: true);
    print('💾 ${interacciones.length} interacciones guardadas en cache');
  }

  /// Obtiene todas las interacciones del cache
  Future<List<Interaccion>> getInteraccionesFromCache({String? agenteId, String? relacionId}) async {
    try {
      final db = await _dbService.database;
      final results = await db.query('interacciones_cache');

      var interacciones = results
          .map((row) => Interaccion.fromJson(jsonDecode(row['data'] as String) as Map<String, dynamic>))
          .toList();

      // Filtrar por agente si se especifica
      if (agenteId != null) {
        interacciones = interacciones.where((i) => i.agenteId == agenteId).toList();
      }

      // Filtrar por relación si se especifica
      if (relacionId != null) {
        interacciones = interacciones.where((i) => i.relacionId == relacionId).toList();
      }

      print('📦 ${interacciones.length} interacciones recuperadas del cache');
      return interacciones;
    } catch (e) {
      print('❌ Error al obtener interacciones del cache: $e');
      return [];
    }
  }

  /// Obtiene una interacción específica del cache
  Future<Interaccion?> getInteraccionFromCache(String id) async {
    try {
      final db = await _dbService.database;
      final results = await db.query(
        'interacciones_cache',
        where: 'id = ?',
        whereArgs: [id],
      );

      if (results.isEmpty) return null;

      return Interaccion.fromJson(jsonDecode(results.first['data'] as String) as Map<String, dynamic>);
    } catch (e) {
      print('❌ Error al obtener interacción del cache: $e');
      return null;
    }
  }

  /// Actualiza una interacción en el cache
  Future<void> updateInteraccionInCache(Interaccion interaccion) async {
    final db = await _dbService.database;
    await db.update(
      'interacciones_cache',
      {
        'data': jsonEncode(interaccion.toJson()),
        'fechaActualizacion': DateTime.now().toIso8601String(),
      },
      where: 'id = ?',
      whereArgs: [interaccion.id],
    );
    print('💾 Interacción ${interaccion.id} actualizada en cache');
  }

  // ==================== TIPOS DE RELACIÓN ====================

  /// Guarda tipos de relación en cache
  Future<void> saveTiposRelacion(List<TipoRelacion> tipos) async {
    final db = await _dbService.database;
    final batch = db.batch();

    for (final tipo in tipos) {
      batch.insert(
        'tipos_relacion_cache',
        {
          'id': tipo.id,
          'data': jsonEncode(tipo.toJson()),
          'fechaActualizacion': DateTime.now().toIso8601String(),
        },
        conflictAlgorithm: ConflictAlgorithm.replace,
      );
    }

    await batch.commit(noResult: true);
    print('💾 ${tipos.length} tipos de relación guardados en cache');
  }

  /// Obtiene tipos de relación del cache
  Future<List<TipoRelacion>> getTiposRelacionFromCache() async {
    try {
      final db = await _dbService.database;
      final results = await db.query('tipos_relacion_cache');

      final tipos = results
          .map((row) => TipoRelacion.fromJson(jsonDecode(row['data'] as String) as Map<String, dynamic>))
          .toList();

      print('📦 ${tipos.length} tipos de relación recuperados del cache');
      return tipos;
    } catch (e) {
      print('❌ Error al obtener tipos de relación del cache: $e');
      return [];
    }
  }

  // ==================== TIPOS DE INTERACCIÓN ====================

  /// Guarda tipos de interacción en cache
  Future<void> saveTiposInteraccion(List<TipoInteraccion> tipos) async {
    try {
      final db = await _dbService.database;
      final batch = db.batch();

      for (final tipo in tipos) {
        try {
          final jsonData = tipo.toJson();
          final jsonString = jsonEncode(jsonData);

          batch.insert(
            'tipos_interaccion_cache',
            {
              'id': tipo.id,
              'data': jsonString,
              'fechaActualizacion': DateTime.now().toIso8601String(),
            },
            conflictAlgorithm: ConflictAlgorithm.replace,
          );
        } catch (e) {
          print('⚠️ Error al serializar tipo de interacción ${tipo.id}: $e');
          // Continuar con los demás
        }
      }

      await batch.commit(noResult: true);
      print('💾 ${tipos.length} tipos de interacción guardados en cache');
    } catch (e) {
      print('❌ Error al guardar tipos de interacción: $e');
      rethrow;
    }
  }

  /// Obtiene tipos de interacción del cache
  Future<List<TipoInteraccion>> getTiposInteraccionFromCache() async {
    try {
      final db = await _dbService.database;
      final results = await db.query('tipos_interaccion_cache');

      final tipos = results
          .map((row) => TipoInteraccion.fromJson(jsonDecode(row['data'] as String) as Map<String, dynamic>))
          .toList();

      print('📦 ${tipos.length} tipos de interacción recuperados del cache');
      return tipos;
    } catch (e) {
      print('❌ Error al obtener tipos de interacción del cache: $e');
      return [];
    }
  }

  // ==================== PRODUCTOS ====================

  /// Guarda productos en cache
  Future<void> saveProductos(List<Producto> productos) async {
    final db = await _dbService.database;
    final batch = db.batch();

    for (final producto in productos) {
      batch.insert(
        'productos_cache',
        {
          'id': producto.id,
          'data': jsonEncode(producto.toJson()),
          'fechaActualizacion': DateTime.now().toIso8601String(),
        },
        conflictAlgorithm: ConflictAlgorithm.replace,
      );
    }

    await batch.commit(noResult: true);
    print('💾 ${productos.length} productos guardados en cache');
  }

  /// Obtiene productos del cache
  Future<List<Producto>> getProductosFromCache({bool? soloMuestras}) async {
    try {
      final db = await _dbService.database;
      final results = await db.query('productos_cache');

      var productos = results
          .map((row) => Producto.fromJson(jsonDecode(row['data'] as String) as Map<String, dynamic>))
          .toList();

      // Filtrar por muestras si se especifica
      if (soloMuestras != null) {
        productos = productos.where((p) => p.esMuestra == soloMuestras).toList();
      }

      print('📦 ${productos.length} productos recuperados del cache');
      return productos;
    } catch (e) {
      print('❌ Error al obtener productos del cache: $e');
      return [];
    }
  }

  // ==================== METADATA ====================

  /// Guarda metadata de sincronización
  Future<void> saveMetadata(String key, String value) async {
    final db = await _dbService.database;
    await db.insert(
      'sync_metadata',
      {
        'key': key,
        'value': value,
        'fechaActualizacion': DateTime.now().toIso8601String(),
      },
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  /// Obtiene metadata de sincronización
  Future<String?> getMetadata(String key) async {
    try {
      final db = await _dbService.database;
      final results = await db.query(
        'sync_metadata',
        where: 'key = ?',
        whereArgs: [key],
      );

      if (results.isEmpty) return null;
      return results.first['value'] as String;
    } catch (e) {
      print('❌ Error al obtener metadata: $e');
      return null;
    }
  }

  /// Guarda la fecha de última sincronización
  Future<void> saveLastSyncDate(DateTime date) async {
    await saveMetadata('last_sync_date', date.toIso8601String());
  }

  /// Obtiene la fecha de última sincronización
  Future<DateTime?> getLastSyncDate() async {
    final dateStr = await getMetadata('last_sync_date');
    if (dateStr == null) return null;
    return DateTime.parse(dateStr);
  }

  // ==================== CITAS ====================

  /// Guarda citas en cache
  Future<void> saveCitas(List<Cita> citas) async {
    try {
      final db = await _dbService.database;
      final batch = db.batch();

      for (final cita in citas) {
        try {
          final jsonData = cita.toJson();
          final jsonString = jsonEncode(jsonData);

          batch.insert(
            'citas_cache',
            {
              'id': cita.id,
              'data': jsonString,
              'fechaActualizacion': DateTime.now().toIso8601String(),
            },
            conflictAlgorithm: ConflictAlgorithm.replace,
          );
        } catch (e) {
          print('⚠️ Error al serializar cita ${cita.id}: $e');
        }
      }

      await batch.commit(noResult: true);
      print('💾 ${citas.length} citas guardadas en cache');
    } catch (e) {
      print('❌ Error al guardar citas: $e');
      rethrow;
    }
  }

  /// Obtiene citas del cache
  Future<List<Cita>> getCitasFromCache({String? agenteId, int? year, int? month}) async {
    try {
      final db = await _dbService.database;
      final results = await db.query('citas_cache');

      var citas = results
          .map((row) => Cita.fromJson(jsonDecode(row['data'] as String) as Map<String, dynamic>))
          .toList();

      // Filtrar por agente si se especifica
      if (agenteId != null) {
        citas = citas.where((c) => c.agenteId == agenteId).toList();
      }

      // Filtrar por año y mes si se especifica
      if (year != null && month != null) {
        citas = citas.where((c) {
          return c.fechaInicio.year == year && c.fechaInicio.month == month;
        }).toList();
      }

      print('📦 ${citas.length} citas recuperadas del cache');
      return citas;
    } catch (e) {
      print('❌ Error al obtener citas del cache: $e');
      return [];
    }
  }

  // ==================== UTILIDADES ====================

  /// Limpia todo el cache (útil para desarrollo/testing)
  Future<void> clearAllCache() async {
    final db = await _dbService.database;
    await db.delete('clientes_cache');
    await db.delete('relaciones_cache');
    await db.delete('interacciones_cache');
    await db.delete('tipos_relacion_cache');
    await db.delete('tipos_interaccion_cache');
    await db.delete('productos_cache');
    await db.delete('citas_cache');
    await db.delete('sync_metadata');
    print('🗑️ Todo el cache ha sido limpiado');
  }

  /// Obtiene estadísticas del cache
  Future<Map<String, int>> getCacheStats() async {
    final db = await _dbService.database;

    final clientesCount = Sqflite.firstIntValue(
      await db.rawQuery('SELECT COUNT(*) FROM clientes_cache'),
    ) ?? 0;

    final relacionesCount = Sqflite.firstIntValue(
      await db.rawQuery('SELECT COUNT(*) FROM relaciones_cache'),
    ) ?? 0;

    final interaccionesCount = Sqflite.firstIntValue(
      await db.rawQuery('SELECT COUNT(*) FROM interacciones_cache'),
    ) ?? 0;

    final tiposRelacionCount = Sqflite.firstIntValue(
      await db.rawQuery('SELECT COUNT(*) FROM tipos_relacion_cache'),
    ) ?? 0;

    final tiposInteraccionCount = Sqflite.firstIntValue(
      await db.rawQuery('SELECT COUNT(*) FROM tipos_interaccion_cache'),
    ) ?? 0;

    final productosCount = Sqflite.firstIntValue(
      await db.rawQuery('SELECT COUNT(*) FROM productos_cache'),
    ) ?? 0;

    final citasCount = Sqflite.firstIntValue(
      await db.rawQuery('SELECT COUNT(*) FROM citas_cache'),
    ) ?? 0;

    return {
      'clientes': clientesCount,
      'relaciones': relacionesCount,
      'interacciones': interaccionesCount,
      'tiposRelacion': tiposRelacionCount,
      'tiposInteraccion': tiposInteraccionCount,
      'productos': productosCount,
      'citas': citasCount,
    };
  }

  /// Guarda datos genéricos en una tabla de caché con formato JSON
  /// Útil para tablas auxiliares que no requieren estructura específica
  Future<void> saveGenericData(String tableName, List<Map<String, dynamic>> data) async {
    final db = await _dbService.database;
    final cacheTableName = '${tableName}_cache';

    await db.transaction((txn) async {
      // Limpiar datos anteriores
      await txn.delete(cacheTableName);

      // Insertar nuevos datos
      for (final item in data) {
        await txn.insert(
          cacheTableName,
          {
            'id': item['id'] ?? '',
            'data': jsonEncode(item),
            'created_at': DateTime.now().toIso8601String(),
          },
          conflictAlgorithm: ConflictAlgorithm.replace,
        );
      }
    });

    print('✅ ${data.length} registros guardados en $cacheTableName');
  }

  /// Obtiene datos genéricos de una tabla de caché
  Future<List<Map<String, dynamic>>> getGenericData(String tableName) async {
    final db = await _dbService.database;
    final cacheTableName = '${tableName}_cache';

    final results = await db.query(cacheTableName);

    return results.map((row) {
      final data = row['data'] as String;
      return jsonDecode(data) as Map<String, dynamic>;
    }).toList();
  }

  /// Obtiene un registro específico por ID desde el caché de relaciones
  Future<Map<String, dynamic>?> getRelacionById(String relacionId) async {
    final db = await _dbService.database;
    final results = await db.query(
      'relaciones_cache',
      where: 'id = ?',
      whereArgs: [relacionId],
      limit: 1,
    );

    if (results.isEmpty) return null;

    final data = results.first['data'] as String;
    return jsonDecode(data) as Map<String, dynamic>;
  }

  /// Obtiene las interacciones de una relación específica desde el caché
  Future<List<Map<String, dynamic>>> getInteraccionesByRelacionId(String relacionId) async {
    final db = await _dbService.database;
    final results = await db.query('interacciones_cache');

    return results
        .map((row) {
          final data = row['data'] as String;
          return jsonDecode(data) as Map<String, dynamic>;
        })
        .where((interaccion) => interaccion['relacionId'] == relacionId)
        .toList();
  }

  /// Obtiene todos los clientes desde el caché
  Future<List<Map<String, dynamic>>> getCachedClientes() async {
    final db = await _dbService.database;
    final results = await db.query('clientes_cache');

    return results.map((row) {
      final data = row['data'] as String;
      return jsonDecode(data) as Map<String, dynamic>;
    }).toList();
  }

  /// Obtiene un cliente específico por ID desde el caché
  Future<Map<String, dynamic>?> getClienteById(String clienteId) async {
    final db = await _dbService.database;
    final results = await db.query(
      'clientes_cache',
      where: 'id = ?',
      whereArgs: [clienteId],
      limit: 1,
    );

    if (results.isEmpty) return null;

    final data = results.first['data'] as String;
    return jsonDecode(data) as Map<String, dynamic>;
  }

  /// Obtiene todos los productos desde el caché
  Future<List<Map<String, dynamic>>> getCachedProductos() async {
    final db = await _dbService.database;
    final results = await db.query('productos_cache');

    return results.map((row) {
      final data = row['data'] as String;
      return jsonDecode(data) as Map<String, dynamic>;
    }).toList();
  }

  /// Obtiene todas las interacciones desde el caché
  Future<List<Map<String, dynamic>>> getCachedInteracciones() async {
    final db = await _dbService.database;
    final results = await db.query('interacciones_cache');

    return results.map((row) {
      final data = row['data'] as String;
      return jsonDecode(data) as Map<String, dynamic>;
    }).toList();
  }

  /// Obtiene todas las relaciones desde el caché
  Future<List<Map<String, dynamic>>> getCachedRelaciones() async {
    final db = await _dbService.database;
    final results = await db.query('relaciones_cache');

    return results.map((row) {
      final data = row['data'] as String;
      return jsonDecode(data) as Map<String, dynamic>;
    }).toList();
  }

  /// Obtiene todos los tipos de interacción desde el caché
  Future<List<Map<String, dynamic>>> getCachedTiposInteraccion() async {
    final db = await _dbService.database;
    final results = await db.query('tipos_interaccion_cache');

    return results.map((row) {
      final data = row['data'] as String;
      return jsonDecode(data) as Map<String, dynamic>;
    }).toList();
  }

  /// Guarda inventario del agente en caché
  Future<void> saveInventarioCache(List<Map<String, dynamic>> inventario) async {
    final db = await _dbService.database;

    await db.transaction((txn) async {
      // Limpiar inventario anterior
      await txn.delete('inventario_cache');

      // Insertar nuevo inventario
      for (final item in inventario) {
        await txn.insert(
          'inventario_cache',
          {
            'id': item['id'] ?? '',
            'data': jsonEncode(item),
            'created_at': DateTime.now().toIso8601String(),
          },
          conflictAlgorithm: ConflictAlgorithm.replace,
        );
      }
    });

    print('✅ ${inventario.length} items de inventario guardados en caché');
  }

  /// Obtiene todo el inventario desde el caché
  Future<List<Map<String, dynamic>>> getCachedInventario() async {
    final db = await _dbService.database;
    final results = await db.query('inventario_cache');

    return results.map((row) {
      final data = row['data'] as String;
      return jsonDecode(data) as Map<String, dynamic>;
    }).toList();
  }
}
