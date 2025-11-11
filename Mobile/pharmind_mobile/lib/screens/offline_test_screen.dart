import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'dart:io';
import '../services/database_service.dart';
import '../services/sync_queue_service.dart';
import '../services/mobile_api_service.dart';
import '../services/cache_service.dart';
import '../providers/auth_provider.dart';

/// Pantalla para probar funcionalidad offline
class OfflineTestScreen extends StatefulWidget {
  const OfflineTestScreen({super.key});

  @override
  State<OfflineTestScreen> createState() => _OfflineTestScreenState();
}

class _OfflineTestScreenState extends State<OfflineTestScreen> {
  final DatabaseService _dbService = DatabaseService();
  final SyncQueueService _syncQueueService = SyncQueueService();
  final MobileApiService _apiService = MobileApiService();
  final CacheService _cacheService = CacheService();

  bool _isLoading = false;
  String _statusMessage = '';
  int _pendingItems = 0;
  Map<String, int> _cacheStats = {};
  bool _hasInternet = true;

  @override
  void initState() {
    super.initState();
    _loadStats();
  }

  Future<void> _loadStats() async {
    setState(() => _isLoading = true);
    try {
      // Inicializar cache
      await _cacheService.initializeCacheTables();

      // Verificar conectividad
      _hasInternet = await _checkRealInternetConnection();

      // Obtener stats de cola de sincronización
      _pendingItems = await _syncQueueService.getPendingCount();

      // Obtener stats de cache usando el CacheService
      final cacheStats = await _cacheService.getCacheStats();

      final db = await _dbService.database;

      final usuarios = await db.rawQuery('SELECT COUNT(*) as count FROM usuarios');
      final relacionesPendientes = await db.rawQuery(
        'SELECT COUNT(*) as count FROM sync_queue WHERE operationType IN (0, 1)',
      );
      final interaccionesPendientes = await db.rawQuery(
        'SELECT COUNT(*) as count FROM sync_queue WHERE operationType IN (2, 3)',
      );

      _cacheStats = {
        'usuarios': (usuarios.first['count'] as int?) ?? 0,
        'relacionesPendientes': (relacionesPendientes.first['count'] as int?) ?? 0,
        'interaccionesPendientes': (interaccionesPendientes.first['count'] as int?) ?? 0,
        'relacionesCache': cacheStats['relaciones'] ?? 0,
        'interaccionesCache': cacheStats['interacciones'] ?? 0,
        'tiposRelacion': cacheStats['tiposRelacion'] ?? 0,
        'tiposInteraccion': cacheStats['tiposInteraccion'] ?? 0,
        'productos': cacheStats['productos'] ?? 0,
        'citas': cacheStats['citas'] ?? 0,
      };

      setState(() => _statusMessage = 'Estadísticas actualizadas');
    } catch (e) {
      setState(() => _statusMessage = 'Error: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<bool> _checkRealInternetConnection() async {
    try {
      final result = await InternetAddress.lookup('google.com');
      return result.isNotEmpty && result[0].rawAddress.isNotEmpty;
    } catch (e) {
      return false;
    }
  }

  Future<void> _testApiConnection() async {
    setState(() {
      _isLoading = true;
      _statusMessage = 'Probando conexión a API...';
    });

    try {
      await _apiService.testConnection();
      setState(() => _statusMessage = '✅ API respondiendo correctamente');
    } catch (e) {
      setState(() => _statusMessage = '❌ Error de API: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _forceSyncQueue() async {
    setState(() {
      _isLoading = true;
      _statusMessage = 'Sincronizando cola...';
    });

    try {
      final result = await _syncQueueService.processQueue();

      setState(() {
        _statusMessage = '''✅ Sincronización completada:
- ${result.successCount} exitosos
- ${result.failureCount} fallos
- ${result.removedCount} removidos''';
      });

      await _loadStats();
    } catch (e) {
      setState(() => _statusMessage = '❌ Error en sincronización: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _clearSyncQueue() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Limpiar Cola'),
        content: const Text('¿Está seguro que desea limpiar la cola de sincronización? Esto eliminará todas las operaciones pendientes.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('Cancelar'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.of(context).pop(true),
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('Limpiar'),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    setState(() {
      _isLoading = true;
      _statusMessage = 'Limpiando cola...';
    });

    try {
      await _syncQueueService.clearQueue();
      setState(() => _statusMessage = '✅ Cola limpiada correctamente');
      await _loadStats();
    } catch (e) {
      setState(() => _statusMessage = '❌ Error al limpiar cola: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _clearDatabase() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('⚠️ Limpiar Base de Datos'),
        content: const Text('¿Está seguro? Esto eliminará TODOS los datos locales incluyendo el cache. Deberá cerrar sesión y volver a iniciar.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('Cancelar'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.of(context).pop(true),
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('Eliminar Todo'),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    setState(() {
      _isLoading = true;
      _statusMessage = 'Eliminando base de datos...';
    });

    try {
      await _dbService.deleteDatabase();
      setState(() => _statusMessage = '✅ Base de datos eliminada. Por favor, cierre sesión.');
      await _loadStats();
    } catch (e) {
      setState(() => _statusMessage = '❌ Error al eliminar base de datos: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _viewQueueDetails() async {
    setState(() => _isLoading = true);

    try {
      final items = await _syncQueueService.getPendingItems();

      if (!mounted) return;

      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text('Detalles de Cola'),
          content: SizedBox(
            width: double.maxFinite,
            child: items.isEmpty
                ? const Text('No hay items pendientes')
                : ListView.builder(
                    shrinkWrap: true,
                    itemCount: items.length,
                    itemBuilder: (context, index) {
                      final item = items[index];
                      return Card(
                        margin: const EdgeInsets.only(bottom: 8),
                        child: ListTile(
                          title: Text(item.operationType.toString().split('.').last),
                          subtitle: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('Entity: ${item.entityId}'),
                              Text('Reintentos: ${item.retryCount}'),
                              if (item.errorMessage != null)
                                Text(
                                  'Error: ${item.errorMessage}',
                                  style: const TextStyle(color: Colors.red, fontSize: 10),
                                ),
                            ],
                          ),
                          trailing: Text(
                            '${item.createdAt.day}/${item.createdAt.month}',
                            style: const TextStyle(fontSize: 10),
                          ),
                        ),
                      );
                    },
                  ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Cerrar'),
            ),
          ],
        ),
      );
    } catch (e) {
      setState(() => _statusMessage = '❌ Error al obtener detalles: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Pruebas Offline'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadStats,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadStats,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Estado de conexión
                    _buildConnectionStatusCard(authProvider),
                    const SizedBox(height: 16),

                    // Estadísticas de cola
                    _buildQueueStatsCard(),
                    const SizedBox(height: 16),

                    // Estadísticas de cache
                    _buildCacheStatsCard(),
                    const SizedBox(height: 16),

                    // Mensaje de estado
                    if (_statusMessage.isNotEmpty)
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: _statusMessage.startsWith('✅')
                              ? Colors.green.shade50
                              : _statusMessage.startsWith('❌')
                                  ? Colors.red.shade50
                                  : Colors.blue.shade50,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(
                            color: _statusMessage.startsWith('✅')
                                ? Colors.green
                                : _statusMessage.startsWith('❌')
                                    ? Colors.red
                                    : Colors.blue,
                          ),
                        ),
                        child: Text(
                          _statusMessage,
                          style: TextStyle(
                            color: _statusMessage.startsWith('✅')
                                ? Colors.green.shade900
                                : _statusMessage.startsWith('❌')
                                    ? Colors.red.shade900
                                    : Colors.blue.shade900,
                            fontSize: 12,
                          ),
                        ),
                      ),
                    const SizedBox(height: 16),

                    // Acciones
                    const Text(
                      'Acciones de Prueba',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 12),

                    _buildActionButton(
                      label: 'Probar Conexión a API',
                      icon: Icons.cloud_done,
                      color: Colors.blue,
                      onPressed: _testApiConnection,
                    ),
                    const SizedBox(height: 8),

                    _buildActionButton(
                      label: 'Forzar Sincronización',
                      icon: Icons.sync,
                      color: Colors.green,
                      onPressed: _pendingItems > 0 ? _forceSyncQueue : null,
                    ),
                    const SizedBox(height: 8),

                    _buildActionButton(
                      label: 'Ver Detalles de Cola',
                      icon: Icons.list,
                      color: Colors.purple,
                      onPressed: _viewQueueDetails,
                    ),
                    const SizedBox(height: 8),

                    _buildActionButton(
                      label: 'Limpiar Cola de Sincronización',
                      icon: Icons.delete_sweep,
                      color: Colors.orange,
                      onPressed: _pendingItems > 0 ? _clearSyncQueue : null,
                    ),
                    const SizedBox(height: 8),

                    _buildActionButton(
                      label: '⚠️ Limpiar Base de Datos',
                      icon: Icons.delete_forever,
                      color: Colors.red,
                      onPressed: _clearDatabase,
                    ),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildConnectionStatusCard(AuthProvider authProvider) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  _hasInternet ? Icons.cloud_done : Icons.cloud_off,
                  color: _hasInternet ? Colors.green : Colors.orange,
                  size: 32,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Estado de Conexión',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        _hasInternet ? 'Conectado a Internet' : 'Sin conexión',
                        style: TextStyle(
                          color: _hasInternet ? Colors.green : Colors.orange,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const Divider(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Modo offline activo:'),
                Text(
                  authProvider.isOfflineMode ? 'SÍ' : 'NO',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: authProvider.isOfflineMode ? Colors.orange : Colors.green,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQueueStatsCard() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  Icons.pending_actions,
                  color: _pendingItems > 0 ? Colors.orange : Colors.green,
                  size: 32,
                ),
                const SizedBox(width: 12),
                const Expanded(
                  child: Text(
                    'Cola de Sincronización',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
            const Divider(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Operaciones pendientes:'),
                Text(
                  _pendingItems.toString(),
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: _pendingItems > 0 ? Colors.orange : Colors.green,
                  ),
                ),
              ],
            ),
            if (_cacheStats['relacionesPendientes'] != null || _cacheStats['interaccionesPendientes'] != null) ...[
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('  - Relaciones:', style: TextStyle(fontSize: 12)),
                  Text(
                    '${_cacheStats['relacionesPendientes'] ?? 0}',
                    style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('  - Interacciones:', style: TextStyle(fontSize: 12)),
                  Text(
                    '${_cacheStats['interaccionesPendientes'] ?? 0}',
                    style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildCacheStatsCard() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Row(
              children: [
                Icon(Icons.storage, color: Colors.blue, size: 32),
                SizedBox(width: 12),
                Text(
                  'Cache Local',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
              ],
            ),
            const Divider(height: 24),
            _buildCacheStatRow('Usuarios:', _cacheStats['usuarios'] ?? 0),
            _buildCacheStatRow('Relaciones:', _cacheStats['relacionesCache'] ?? 0),
            _buildCacheStatRow('Interacciones:', _cacheStats['interaccionesCache'] ?? 0),
            _buildCacheStatRow('Tipos de Relación:', _cacheStats['tiposRelacion'] ?? 0),
            _buildCacheStatRow('Tipos de Interacción:', _cacheStats['tiposInteraccion'] ?? 0),
            _buildCacheStatRow('Productos:', _cacheStats['productos'] ?? 0),
            _buildCacheStatRow('Citas:', _cacheStats['citas'] ?? 0),
          ],
        ),
      ),
    );
  }

  Widget _buildCacheStatRow(String label, int value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label),
          Text(
            value.toString(),
            style: const TextStyle(fontWeight: FontWeight.bold),
          ),
        ],
      ),
    );
  }

  Widget _buildActionButton({
    required String label,
    required IconData icon,
    required Color color,
    required VoidCallback? onPressed,
  }) {
    return ElevatedButton.icon(
      onPressed: onPressed,
      icon: Icon(icon),
      label: Text(label),
      style: ElevatedButton.styleFrom(
        backgroundColor: color,
        foregroundColor: Colors.white,
        padding: const EdgeInsets.all(16),
        alignment: Alignment.centerLeft,
      ),
    );
  }
}
