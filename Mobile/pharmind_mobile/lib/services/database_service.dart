import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';
import '../models/usuario.dart';

class DatabaseService {
  static final DatabaseService _instance = DatabaseService._internal();
  factory DatabaseService() => _instance;

  static Database? _database;

  DatabaseService._internal();

  // Getter para la base de datos
  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDatabase();
    return _database!;
  }

  // Inicializar base de datos
  Future<Database> _initDatabase() async {
    final databasePath = await getDatabasesPath();
    final path = join(databasePath, 'pharmind.db');

    print('Database path: $path');

    return await openDatabase(
      path,
      version: 6, // Incrementado de 5 a 6 para incluir tabla de inventario
      onCreate: _onCreate,
      onUpgrade: _onUpgrade,
    );
  }

  // Crear tablas
  Future<void> _onCreate(Database db, int version) async {
    // Tabla usuarios
    await db.execute('''
      CREATE TABLE usuarios (
        id TEXT PRIMARY KEY,
        nombre TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        rol TEXT NOT NULL,
        agenteId TEXT,
        fechaCreacion TEXT,
        ultimoAcceso TEXT,
        isSynced INTEGER DEFAULT 1,
        syncTimestamp TEXT
      )
    ''');

    // Tabla esquemas_personalizados
    await db.execute('''
      CREATE TABLE esquemas_personalizados (
        id TEXT PRIMARY KEY,
        nombreEntidad TEXT NOT NULL,
        descripcion TEXT,
        icono TEXT,
        esquemaJson TEXT NOT NULL,
        tipoEntidad TEXT,
        activo INTEGER DEFAULT 1,
        fechaCreacion TEXT,
        isSynced INTEGER DEFAULT 1,
        syncTimestamp TEXT
      )
    ''');

    // Tabla entidades_dinamicas
    await db.execute('''
      CREATE TABLE entidades_dinamicas (
        id TEXT PRIMARY KEY,
        esquemaId TEXT NOT NULL,
        datos TEXT NOT NULL,
        fechaCreacion TEXT,
        fechaActualizacion TEXT,
        usuarioId TEXT,
        nombreEntidad TEXT,
        isSynced INTEGER DEFAULT 1,
        syncTimestamp TEXT,
        isDeleted INTEGER DEFAULT 0,
        FOREIGN KEY (esquemaId) REFERENCES esquemas_personalizados (id)
      )
    ''');

    // Tabla para tablas maestras (catálogos)
    await db.execute('''
      CREATE TABLE maestras (
        tableName TEXT NOT NULL,
        value TEXT NOT NULL,
        label TEXT NOT NULL,
        isSynced INTEGER DEFAULT 1,
        syncTimestamp TEXT,
        PRIMARY KEY (tableName, value)
      )
    ''');

    print('Tablas creadas exitosamente: usuarios, esquemas_personalizados, entidades_dinamicas, maestras');
  }

  // Actualizar base de datos (para futuras versiones)
  Future<void> _onUpgrade(Database db, int oldVersion, int newVersion) async {
    print('Actualizando base de datos de versión $oldVersion a $newVersion');

    if (oldVersion < 2) {
      // Migración de versión 1 a 2: Agregar tablas para sincronización offline
      await db.execute('''
        CREATE TABLE esquemas_personalizados (
          id TEXT PRIMARY KEY,
          nombreEntidad TEXT NOT NULL,
          descripcion TEXT,
          icono TEXT,
          esquemaJson TEXT NOT NULL,
          tipoEntidad TEXT,
          activo INTEGER DEFAULT 1,
          fechaCreacion TEXT,
          isSynced INTEGER DEFAULT 1,
          syncTimestamp TEXT
        )
      ''');

      await db.execute('''
        CREATE TABLE entidades_dinamicas (
          id TEXT PRIMARY KEY,
          esquemaId TEXT NOT NULL,
          datos TEXT NOT NULL,
          fechaCreacion TEXT,
          fechaActualizacion TEXT,
          usuarioId TEXT,
          nombreEntidad TEXT,
          isSynced INTEGER DEFAULT 1,
          syncTimestamp TEXT,
          isDeleted INTEGER DEFAULT 0,
          FOREIGN KEY (esquemaId) REFERENCES esquemas_personalizados (id)
        )
      ''');

      await db.execute('''
        CREATE TABLE maestras (
          tableName TEXT NOT NULL,
          value TEXT NOT NULL,
          label TEXT NOT NULL,
          isSynced INTEGER DEFAULT 1,
          syncTimestamp TEXT,
          PRIMARY KEY (tableName, value)
        )
      ''');

      print('Tablas de sincronización offline creadas exitosamente');
    }

    if (oldVersion < 3) {
      // Migración de versión 2 a 3: Agregar agenteId a tabla usuarios
      await db.execute('ALTER TABLE usuarios ADD COLUMN agenteId TEXT');
      print('Columna agenteId agregada a tabla usuarios');
    }

    if (oldVersion < 4) {
      // Migración de versión 3 a 4: Crear tablas de cache offline
      await db.execute('''
        CREATE TABLE IF NOT EXISTS clientes_cache (
          id TEXT PRIMARY KEY,
          data TEXT NOT NULL,
          fechaActualizacion TEXT NOT NULL
        )
      ''');

      await db.execute('''
        CREATE TABLE IF NOT EXISTS relaciones_cache (
          id TEXT PRIMARY KEY,
          data TEXT NOT NULL,
          fechaActualizacion TEXT NOT NULL
        )
      ''');

      await db.execute('''
        CREATE TABLE IF NOT EXISTS interacciones_cache (
          id TEXT PRIMARY KEY,
          data TEXT NOT NULL,
          fechaActualizacion TEXT NOT NULL
        )
      ''');

      await db.execute('''
        CREATE TABLE IF NOT EXISTS tipos_interaccion_cache (
          id TEXT PRIMARY KEY,
          data TEXT NOT NULL,
          fechaActualizacion TEXT NOT NULL
        )
      ''');

      await db.execute('''
        CREATE TABLE IF NOT EXISTS productos_cache (
          id TEXT PRIMARY KEY,
          data TEXT NOT NULL,
          fechaActualizacion TEXT NOT NULL
        )
      ''');

      await db.execute('''
        CREATE TABLE IF NOT EXISTS citas_cache (
          id TEXT PRIMARY KEY,
          data TEXT NOT NULL,
          fechaActualizacion TEXT NOT NULL
        )
      ''');

      await db.execute('''
        CREATE TABLE IF NOT EXISTS sync_metadata (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL,
          fechaActualizacion TEXT NOT NULL
        )
      ''');

      print('Tablas de cache offline creadas exitosamente');
    }

    if (oldVersion < 5) {
      // Migración de versión 4 a 5: Agregar nuevas tablas de cache
      await db.execute('''
        CREATE TABLE IF NOT EXISTS muestras_entregadas_cache (
          id TEXT PRIMARY KEY,
          data TEXT NOT NULL,
          created_at TEXT NOT NULL
        )
      ''');

      await db.execute('''
        CREATE TABLE IF NOT EXISTS productos_promocionados_cache (
          id TEXT PRIMARY KEY,
          data TEXT NOT NULL,
          created_at TEXT NOT NULL
        )
      ''');

      await db.execute('''
        CREATE TABLE IF NOT EXISTS productos_solicitados_cache (
          id TEXT PRIMARY KEY,
          data TEXT NOT NULL,
          created_at TEXT NOT NULL
        )
      ''');

      await db.execute('''
        CREATE TABLE IF NOT EXISTS movimientos_inventario_cache (
          id TEXT PRIMARY KEY,
          data TEXT NOT NULL,
          created_at TEXT NOT NULL
        )
      ''');

      await db.execute('''
        CREATE TABLE IF NOT EXISTS tiempo_utilizado_cache (
          id TEXT PRIMARY KEY,
          data TEXT NOT NULL,
          created_at TEXT NOT NULL
        )
      ''');

      await db.execute('''
        CREATE TABLE IF NOT EXISTS tipos_actividad_cache (
          id TEXT PRIMARY KEY,
          data TEXT NOT NULL,
          created_at TEXT NOT NULL
        )
      ''');

      print('Nuevas tablas de cache (v5) creadas exitosamente');
    }

    if (oldVersion < 6) {
      // Migración de versión 5 a 6: Agregar tabla de inventario
      await db.execute('''
        CREATE TABLE IF NOT EXISTS inventario_cache (
          id TEXT PRIMARY KEY,
          data TEXT NOT NULL,
          created_at TEXT NOT NULL
        )
      ''');

      print('Tabla de inventario_cache (v6) creada exitosamente');
    }
  }

  // CRUD - Guardar usuario
  Future<int> saveUsuario(Usuario usuario) async {
    try {
      final db = await database;
      final timestamp = DateTime.now().toIso8601String();

      final usuarioMap = usuario.toMap();
      usuarioMap['isSynced'] = 1;
      usuarioMap['syncTimestamp'] = timestamp;

      // Verificar si el usuario ya existe
      final existing = await db.query(
        'usuarios',
        where: 'id = ?',
        whereArgs: [usuario.id],
      );

      int result;
      if (existing.isNotEmpty) {
        // Actualizar usuario existente
        result = await db.update(
          'usuarios',
          usuarioMap,
          where: 'id = ?',
          whereArgs: [usuario.id],
        );
        print('Usuario actualizado en cache: ${usuario.email}');
      } else {
        // Insertar nuevo usuario
        result = await db.insert(
          'usuarios',
          usuarioMap,
          conflictAlgorithm: ConflictAlgorithm.replace,
        );
        print('Usuario guardado en cache: ${usuario.email}');
      }

      return result;
    } catch (e) {
      print('Error al guardar usuario en cache: $e');
      rethrow;
    }
  }

  // CRUD - Obtener usuario por ID
  Future<Usuario?> getUsuarioById(String id) async {
    try {
      final db = await database;
      final results = await db.query(
        'usuarios',
        where: 'id = ?',
        whereArgs: [id],
      );

      if (results.isNotEmpty) {
        return Usuario.fromMap(results.first);
      }
      return null;
    } catch (e) {
      print('Error al obtener usuario por ID: $e');
      return null;
    }
  }

  // CRUD - Obtener usuario por email
  Future<Usuario?> getUsuarioByEmail(String email) async {
    try {
      final db = await database;
      final results = await db.query(
        'usuarios',
        where: 'email = ?',
        whereArgs: [email],
      );

      if (results.isNotEmpty) {
        print('Usuario encontrado en cache: $email');
        return Usuario.fromMap(results.first);
      }
      print('Usuario no encontrado en cache: $email');
      return null;
    } catch (e) {
      print('Error al obtener usuario por email: $e');
      return null;
    }
  }

  // CRUD - Obtener todos los usuarios
  Future<List<Usuario>> getAllUsuarios() async {
    try {
      final db = await database;
      final results = await db.query('usuarios');

      return results.map((map) => Usuario.fromMap(map)).toList();
    } catch (e) {
      print('Error al obtener todos los usuarios: $e');
      return [];
    }
  }

  // CRUD - Eliminar usuario
  Future<int> deleteUsuario(String id) async {
    try {
      final db = await database;
      final result = await db.delete(
        'usuarios',
        where: 'id = ?',
        whereArgs: [id],
      );
      print('Usuario eliminado del cache: ID $id');
      return result;
    } catch (e) {
      print('Error al eliminar usuario: $e');
      return 0;
    }
  }

  // CRUD - Limpiar todos los usuarios (útil para logout completo)
  Future<void> clearAllUsuarios() async {
    try {
      final db = await database;
      await db.delete('usuarios');
      print('Todos los usuarios eliminados del cache');
    } catch (e) {
      print('Error al limpiar usuarios: $e');
    }
  }

  // Sincronización - Marcar usuarios no sincronizados
  Future<void> markAsNotSynced(String userId) async {
    try {
      final db = await database;
      await db.update(
        'usuarios',
        {'isSynced': 0},
        where: 'id = ?',
        whereArgs: [userId],
      );
      print('Usuario marcado como no sincronizado: $userId');
    } catch (e) {
      print('Error al marcar usuario como no sincronizado: $e');
    }
  }

  // Sincronización - Obtener usuarios no sincronizados
  Future<List<Usuario>> getUnsyncedUsuarios() async {
    try {
      final db = await database;
      final results = await db.query(
        'usuarios',
        where: 'isSynced = ?',
        whereArgs: [0],
      );

      return results.map((map) => Usuario.fromMap(map)).toList();
    } catch (e) {
      print('Error al obtener usuarios no sincronizados: $e');
      return [];
    }
  }

  // Sincronización - Marcar como sincronizado
  Future<void> markAsSynced(String userId) async {
    try {
      final db = await database;
      final timestamp = DateTime.now().toIso8601String();
      await db.update(
        'usuarios',
        {
          'isSynced': 1,
          'syncTimestamp': timestamp,
        },
        where: 'id = ?',
        whereArgs: [userId],
      );
      print('Usuario marcado como sincronizado: $userId');
    } catch (e) {
      print('Error al marcar usuario como sincronizado: $e');
    }
  }

  // Cerrar base de datos
  Future<void> close() async {
    final db = await database;
    await db.close();
    _database = null;
    print('Base de datos cerrada');
  }

  // Eliminar base de datos (útil para desarrollo/testing)
  Future<void> deleteDatabase() async {
    final databasePath = await getDatabasesPath();
    final path = join(databasePath, 'pharmind.db');
    await databaseFactory.deleteDatabase(path);
    _database = null;
    print('Base de datos eliminada');
  }

  // ==================== ESQUEMAS PERSONALIZADOS ====================

  Future<void> saveEsquema(Map<String, dynamic> esquema) async {
    try {
      final db = await database;
      final timestamp = DateTime.now().toIso8601String();

      final esquemaData = {
        'id': esquema['id'],
        'nombreEntidad': esquema['nombreEntidad'],
        'descripcion': esquema['descripcion'],
        'icono': esquema['icono'],
        'esquemaJson': esquema['esquemaJson'],
        'tipoEntidad': esquema['tipoEntidad'],
        'activo': esquema['activo'] == true ? 1 : 0,
        'fechaCreacion': esquema['fechaCreacion'],
        'isSynced': 1,
        'syncTimestamp': timestamp,
      };

      await db.insert(
        'esquemas_personalizados',
        esquemaData,
        conflictAlgorithm: ConflictAlgorithm.replace,
      );
      print('Esquema guardado: ${esquema['nombreEntidad']}');
    } catch (e) {
      print('Error al guardar esquema: $e');
      rethrow;
    }
  }

  Future<List<Map<String, dynamic>>> getAllEsquemas() async {
    try {
      final db = await database;
      final results = await db.query('esquemas_personalizados');
      return results;
    } catch (e) {
      print('Error al obtener esquemas: $e');
      return [];
    }
  }

  Future<Map<String, dynamic>?> getEsquemaById(String id) async {
    try {
      final db = await database;
      final results = await db.query(
        'esquemas_personalizados',
        where: 'id = ?',
        whereArgs: [id],
      );
      return results.isNotEmpty ? results.first : null;
    } catch (e) {
      print('Error al obtener esquema: $e');
      return null;
    }
  }

  // ==================== ENTIDADES DINÁMICAS ====================

  Future<void> saveEntidad(Map<String, dynamic> entidad) async {
    try {
      final db = await database;
      final timestamp = DateTime.now().toIso8601String();

      final entidadData = {
        'id': entidad['id'],
        'esquemaId': entidad['esquemaId'],
        'datos': entidad['datos'],
        'fechaCreacion': entidad['fechaCreacion'],
        'fechaActualizacion': entidad['fechaActualizacion'],
        'usuarioId': entidad['usuarioId'],
        'nombreEntidad': entidad['nombreEntidad'],
        'isSynced': entidad['isSynced'] ?? 1,
        'syncTimestamp': timestamp,
        'isDeleted': 0,
      };

      await db.insert(
        'entidades_dinamicas',
        entidadData,
        conflictAlgorithm: ConflictAlgorithm.replace,
      );
      print('Entidad guardada: ${entidad['id']}');
    } catch (e) {
      print('Error al guardar entidad: $e');
      rethrow;
    }
  }

  Future<List<Map<String, dynamic>>> getEntidadesByEsquema(String esquemaId) async {
    try {
      final db = await database;
      final results = await db.query(
        'entidades_dinamicas',
        where: 'esquemaId = ? AND isDeleted = ?',
        whereArgs: [esquemaId, 0],
      );
      return results;
    } catch (e) {
      print('Error al obtener entidades: $e');
      return [];
    }
  }

  Future<Map<String, dynamic>?> getEntidadById(String id) async {
    try {
      final db = await database;
      final results = await db.query(
        'entidades_dinamicas',
        where: 'id = ? AND isDeleted = ?',
        whereArgs: [id, 0],
      );
      return results.isNotEmpty ? results.first : null;
    } catch (e) {
      print('Error al obtener entidad: $e');
      return null;
    }
  }

  Future<void> markEntidadAsDeleted(String id) async {
    try {
      final db = await database;
      await db.update(
        'entidades_dinamicas',
        {'isDeleted': 1, 'isSynced': 0},
        where: 'id = ?',
        whereArgs: [id],
      );
      print('Entidad marcada como eliminada: $id');
    } catch (e) {
      print('Error al marcar entidad como eliminada: $e');
      rethrow;
    }
  }

  Future<List<Map<String, dynamic>>> getUnsyncedEntidades() async {
    try {
      final db = await database;
      final results = await db.query(
        'entidades_dinamicas',
        where: 'isSynced = ?',
        whereArgs: [0],
      );
      return results;
    } catch (e) {
      print('Error al obtener entidades no sincronizadas: $e');
      return [];
    }
  }

  Future<void> markEntidadAsSynced(String id) async {
    try {
      final db = await database;
      final timestamp = DateTime.now().toIso8601String();
      await db.update(
        'entidades_dinamicas',
        {'isSynced': 1, 'syncTimestamp': timestamp},
        where: 'id = ?',
        whereArgs: [id],
      );
      print('Entidad marcada como sincronizada: $id');
    } catch (e) {
      print('Error al marcar entidad como sincronizada: $e');
      rethrow;
    }
  }

  // ==================== MAESTRAS (CATÁLOGOS) ====================

  Future<void> saveMaestra(String tableName, String value, String label) async {
    try {
      final db = await database;
      final timestamp = DateTime.now().toIso8601String();

      await db.insert(
        'maestras',
        {
          'tableName': tableName,
          'value': value,
          'label': label,
          'isSynced': 1,
          'syncTimestamp': timestamp,
        },
        conflictAlgorithm: ConflictAlgorithm.replace,
      );
    } catch (e) {
      print('Error al guardar maestra: $e');
      rethrow;
    }
  }

  Future<List<Map<String, dynamic>>> getMaestrasByTable(String tableName) async {
    try {
      final db = await database;
      final results = await db.query(
        'maestras',
        where: 'tableName = ?',
        whereArgs: [tableName],
      );
      return results;
    } catch (e) {
      print('Error al obtener maestras: $e');
      return [];
    }
  }

  Future<void> clearMaestrasByTable(String tableName) async {
    try {
      final db = await database;
      await db.delete(
        'maestras',
        where: 'tableName = ?',
        whereArgs: [tableName],
      );
      print('Maestras eliminadas de tabla: $tableName');
    } catch (e) {
      print('Error al limpiar maestras: $e');
    }
  }
}
