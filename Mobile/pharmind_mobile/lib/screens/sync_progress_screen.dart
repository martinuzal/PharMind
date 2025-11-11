import 'package:flutter/material.dart';
import '../services/offline_sync_service.dart';
import '../services/sync_queue_service.dart';

/// Modelo para rastrear el progreso de sincronización de cada tabla
class TableSyncProgress {
  final String tableName;
  final String displayName;
  final IconData icon;
  int total;
  int synced;
  bool isLoading;
  bool isCompleted;
  String? error;

  TableSyncProgress({
    required this.tableName,
    required this.displayName,
    required this.icon,
    this.total = 0,
    this.synced = 0,
    this.isLoading = false,
    this.isCompleted = false,
    this.error,
  });

  double get progress => total > 0 ? synced / total : 0.0;

  Color get statusColor {
    if (error != null) return Colors.red;
    if (isCompleted) return Colors.green;
    if (isLoading) return Colors.blue;
    return Colors.grey;
  }
}

/// Pantalla que muestra el progreso de sincronización en tiempo real
class SyncProgressScreen extends StatefulWidget {
  final String agenteId;

  const SyncProgressScreen({
    Key? key,
    required this.agenteId,
  }) : super(key: key);

  @override
  State<SyncProgressScreen> createState() => SyncProgressScreenState();
}

class SyncProgressScreenState extends State<SyncProgressScreen> {
  late List<TableSyncProgress> _tables;
  bool _isSyncing = false;
  bool _isCompleted = false;
  DateTime? _startTime;
  DateTime? _endTime;
  final OfflineSyncService _syncService = OfflineSyncService();
  final SyncQueueService _syncQueueService = SyncQueueService();
  int _pendingItemsCount = 0;
  bool _isSyncingQueue = false;

  @override
  void initState() {
    super.initState();
    _initializeTables();
    _loadPendingItemsCount();
    // Iniciar la sincronización automáticamente
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _startSync();
    });
  }

  Future<void> _loadPendingItemsCount() async {
    final count = await _syncQueueService.getPendingCount();
    setState(() {
      _pendingItemsCount = count;
    });
  }

  void _initializeTables() {
    _tables = [
      TableSyncProgress(
        tableName: 'clientes',
        displayName: 'Clientes',
        icon: Icons.business,
      ),
      TableSyncProgress(
        tableName: 'relaciones',
        displayName: 'Relaciones',
        icon: Icons.people,
      ),
      TableSyncProgress(
        tableName: 'interacciones',
        displayName: 'Interacciones',
        icon: Icons.chat,
      ),
      TableSyncProgress(
        tableName: 'tipos',
        displayName: 'Tipos de Interacción',
        icon: Icons.category,
      ),
      TableSyncProgress(
        tableName: 'productos',
        displayName: 'Productos',
        icon: Icons.medical_services,
      ),
      TableSyncProgress(
        tableName: 'inventario',
        displayName: 'Inventario del Agente',
        icon: Icons.inventory_2,
      ),
      TableSyncProgress(
        tableName: 'citas',
        displayName: 'Citas',
        icon: Icons.event,
      ),
      TableSyncProgress(
        tableName: 'entidades_dinamicas',
        displayName: 'Datos Dinámicos',
        icon: Icons.data_object,
      ),
      // Nuevas tablas de sincronización
      TableSyncProgress(
        tableName: 'muestras_entregadas',
        displayName: 'Muestras Entregadas',
        icon: Icons.inventory,
      ),
      TableSyncProgress(
        tableName: 'productos_promocionados',
        displayName: 'Productos Promocionados',
        icon: Icons.campaign,
      ),
      TableSyncProgress(
        tableName: 'productos_solicitados',
        displayName: 'Productos Solicitados',
        icon: Icons.request_page,
      ),
      TableSyncProgress(
        tableName: 'movimientos_inventario',
        displayName: 'Movimientos de Inventario',
        icon: Icons.move_to_inbox,
      ),
      TableSyncProgress(
        tableName: 'tiempo_utilizado',
        displayName: 'Tiempo Utilizado',
        icon: Icons.schedule,
      ),
      TableSyncProgress(
        tableName: 'tipos_actividad',
        displayName: 'Tipos de Actividad',
        icon: Icons.category_outlined,
      ),
    ];
  }

  /// Actualiza el progreso de una tabla específica
  void updateTableProgress({
    required String tableName,
    int? total,
    int? synced,
    bool? isLoading,
    bool? isCompleted,
    String? error,
  }) {
    if (!mounted) return;

    setState(() {
      final table = _tables.firstWhere((t) => t.tableName == tableName);
      if (total != null) table.total = total;
      if (synced != null) table.synced = synced;
      if (isLoading != null) table.isLoading = isLoading;
      if (isCompleted != null) table.isCompleted = isCompleted;
      if (error != null) table.error = error;
    });
  }

  /// Marca el inicio de la sincronización
  void startSync() {
    if (!mounted) return;
    setState(() {
      _isSyncing = true;
      _isCompleted = false;
      _startTime = DateTime.now();
      _endTime = null;
    });
  }

  /// Marca el fin de la sincronización
  void completeSync() {
    if (!mounted) return;
    setState(() {
      _isSyncing = false;
      _isCompleted = true;
      _endTime = DateTime.now();
    });
  }

  /// Inicia el proceso de sincronización
  Future<void> _startSync() async {
    startSync();

    try {
      // PASO 1: Enviar datos pendientes al servidor (Upward Sync)
      print('🔄 PASO 1: Enviando datos pendientes al servidor...');
      final pendingItems = await _syncQueueService.getPendingItems();

      if (pendingItems.isNotEmpty) {
        print('📤 Enviando ${pendingItems.length} operaciones pendientes...');
        final syncResult = await _syncQueueService.processQueue();

        if (mounted) {
          if (syncResult.hasErrors) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(
                  '⚠️ ${syncResult.successCount} dato(s) enviado(s), ${syncResult.failureCount + syncResult.removedCount} con error',
                ),
                backgroundColor: Colors.orange,
                duration: const Duration(seconds: 3),
              ),
            );
          } else if (syncResult.successCount > 0) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('✓ ${syncResult.successCount} dato(s) enviado(s) correctamente'),
                backgroundColor: Colors.green,
                duration: const Duration(seconds: 2),
              ),
            );
          }
        }

        // Actualizar contador de pendientes
        await _loadPendingItemsCount();
      } else {
        print('✅ No hay datos pendientes para enviar');
      }

      // PASO 2: Descargar datos del servidor (Downward Sync)
      print('🔄 PASO 2: Descargando datos del servidor...');
      await _syncService.syncAll(
        agenteId: widget.agenteId,
        onProgress: updateTableProgress,
        onStart: () {},
        onComplete: completeSync,
      );
    } catch (e) {
      print('Error durante la sincronización: $e');
      if (mounted) {
        setState(() {
          _isSyncing = false;
          _endTime = DateTime.now();
        });

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error al sincronizar: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  String _formatDuration() {
    if (_startTime == null) return '';
    final end = _endTime ?? DateTime.now();
    final duration = end.difference(_startTime!);

    if (duration.inMinutes > 0) {
      return '${duration.inMinutes}m ${duration.inSeconds % 60}s';
    }
    return '${duration.inSeconds}s';
  }

  int get _totalRecords => _tables.fold(0, (sum, t) => sum + t.total);
  int get _syncedRecords => _tables.fold(0, (sum, t) => sum + t.synced);
  double get _overallProgress => _totalRecords > 0 ? _syncedRecords / _totalRecords : 0.0;

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: () async {
        // No permitir volver atrás mientras se sincroniza
        return !_isSyncing;
      },
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Sincronización de Datos'),
          automaticallyImplyLeading: !_isSyncing,
          backgroundColor: Colors.blue,
          foregroundColor: Colors.white,
        ),
        body: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Header con progreso general
              _buildOverallProgress(),
              const SizedBox(height: 24),

              // Lista de tablas con progreso individual
              Expanded(
                child: ListView.builder(
                  itemCount: _tables.length,
                  itemBuilder: (context, index) {
                    return _buildTableProgressCard(_tables[index]);
                  },
                ),
              ),

              const SizedBox(height: 16),

              // Sección de datos pendientes de envío
              if (_isCompleted && _pendingItemsCount > 0) ...[
                const Divider(height: 32),
                _buildPendingDataSection(),
                const SizedBox(height: 16),
              ],

              // Botón de acción
              _buildActionButton(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildOverallProgress() {
    return Card(
      elevation: 4,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Progreso General',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                if (_isSyncing)
                  const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                else if (_isCompleted)
                  const Icon(Icons.check_circle, color: Colors.green, size: 24),
              ],
            ),
            const SizedBox(height: 12),

            // Barra de progreso general
            LinearProgressIndicator(
              value: _overallProgress,
              minHeight: 10,
              backgroundColor: Colors.grey[200],
              valueColor: AlwaysStoppedAnimation<Color>(
                _isCompleted ? Colors.green : Colors.blue,
              ),
            ),
            const SizedBox(height: 8),

            // Estadísticas
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '$_syncedRecords / $_totalRecords registros',
                  style: TextStyle(
                    color: Colors.grey[700],
                    fontWeight: FontWeight.w500,
                  ),
                ),
                Text(
                  '${(_overallProgress * 100).toStringAsFixed(0)}%',
                  style: TextStyle(
                    color: Colors.grey[700],
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),

            // Tiempo transcurrido
            if (_startTime != null) ...[
              const SizedBox(height: 8),
              Row(
                children: [
                  Icon(Icons.timer, size: 16, color: Colors.grey[600]),
                  const SizedBox(width: 4),
                  Text(
                    _formatDuration(),
                    style: TextStyle(
                      color: Colors.grey[600],
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildTableProgressCard(TableSyncProgress table) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header de la tabla
            Row(
              children: [
                Icon(
                  table.icon,
                  color: table.statusColor,
                  size: 24,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    table.displayName,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                _buildStatusIcon(table),
              ],
            ),

            const SizedBox(height: 12),

            // Barra de progreso
            LinearProgressIndicator(
              value: table.progress,
              backgroundColor: Colors.grey[200],
              valueColor: AlwaysStoppedAnimation<Color>(table.statusColor),
            ),

            const SizedBox(height: 8),

            // Información de registros
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  table.error != null
                      ? 'Error: ${table.error}'
                      : '${table.synced} / ${table.total} registros',
                  style: TextStyle(
                    color: table.error != null ? Colors.red : Colors.grey[700],
                    fontSize: 13,
                  ),
                ),
                if (table.total > 0)
                  Text(
                    '${(table.progress * 100).toStringAsFixed(0)}%',
                    style: TextStyle(
                      color: Colors.grey[700],
                      fontSize: 13,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusIcon(TableSyncProgress table) {
    if (table.error != null) {
      return const Icon(Icons.error, color: Colors.red, size: 20);
    }
    if (table.isCompleted) {
      return const Icon(Icons.check_circle, color: Colors.green, size: 20);
    }
    if (table.isLoading) {
      return const SizedBox(
        width: 20,
        height: 20,
        child: CircularProgressIndicator(strokeWidth: 2),
      );
    }
    return const Icon(Icons.pending, color: Colors.grey, size: 20);
  }

  Widget _buildPendingDataSection() {
    return Card(
      elevation: 4,
      color: Colors.orange[50],
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.upload, color: Colors.orange[700], size: 28),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Datos Pendientes de Envío',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Colors.orange[900],
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '$_pendingItemsCount registro(s) esperando ser enviado(s) al servidor',
                        style: TextStyle(
                          fontSize: 14,
                          color: Colors.grey[700],
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: _isSyncingQueue ? null : _syncPendingData,
                icon: _isSyncingQueue
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                      )
                    : const Icon(Icons.cloud_upload),
                label: Text(_isSyncingQueue ? 'Enviando...' : 'Enviar Datos al Servidor'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.orange[700],
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _syncPendingData() async {
    setState(() {
      _isSyncingQueue = true;
    });

    try {
      final items = await _syncQueueService.getAllPendingItems();

      if (items.isEmpty) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('No hay datos pendientes para sincronizar'),
              backgroundColor: Colors.blue,
            ),
          );
        }
        return;
      }

      int successCount = 0;
      int errorCount = 0;

      for (final item in items) {
        try {
          await _syncQueueService.processQueueItem(item);
          successCount++;
        } catch (e) {
          print('Error al procesar item ${item.id}: $e');
          errorCount++;
        }
      }

      // Recargar contador
      await _loadPendingItemsCount();

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              '✓ $successCount dato(s) enviado(s)${errorCount > 0 ? ', $errorCount error(es)' : ''}',
            ),
            backgroundColor: errorCount > 0 ? Colors.orange : Colors.green,
            duration: const Duration(seconds: 4),
          ),
        );
      }
    } catch (e) {
      print('Error durante la sincronización de datos pendientes: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error al sincronizar: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      setState(() {
        _isSyncingQueue = false;
      });
    }
  }

  Widget _buildActionButton() {
    if (_isCompleted) {
      return ElevatedButton.icon(
        onPressed: () => Navigator.of(context).pop(true), // Retorna true indicando que la sync fue exitosa
        icon: const Icon(Icons.check),
        label: const Text('Finalizar'),
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.green,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(vertical: 16),
        ),
      );
    }

    return ElevatedButton(
      onPressed: null, // Deshabilitado durante la sincronización
      style: ElevatedButton.styleFrom(
        padding: const EdgeInsets.symmetric(vertical: 16),
      ),
      child: _isSyncing
          ? const Text('Sincronizando...')
          : const Text('Esperando sincronización...'),
    );
  }
}
