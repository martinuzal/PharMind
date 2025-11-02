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
      version: 1,
      onCreate: _onCreate,
      onUpgrade: _onUpgrade,
    );
  }

  // Crear tablas
  Future<void> _onCreate(Database db, int version) async {
    await db.execute('''
      CREATE TABLE usuarios (
        id TEXT PRIMARY KEY,
        nombre TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        rol TEXT NOT NULL,
        fechaCreacion TEXT,
        ultimoAcceso TEXT,
        isSynced INTEGER DEFAULT 1,
        syncTimestamp TEXT
      )
    ''');

    print('Tabla usuarios creada exitosamente');
  }

  // Actualizar base de datos (para futuras versiones)
  Future<void> _onUpgrade(Database db, int oldVersion, int newVersion) async {
    if (oldVersion < newVersion) {
      // Aquí se pueden agregar migraciones futuras
      print('Actualizando base de datos de versión $oldVersion a $newVersion');
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
}
