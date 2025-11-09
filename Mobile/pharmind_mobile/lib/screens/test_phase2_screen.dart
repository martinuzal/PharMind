import 'package:flutter/material.dart';
import 'dart:math';
import '../services/mobile_api_service.dart';
import '../services/sync_queue_service.dart';

class TestPhase2Screen extends StatefulWidget {
  final String agenteId;

  const TestPhase2Screen({
    super.key,
    required this.agenteId,
  });

  @override
  State<TestPhase2Screen> createState() => _TestPhase2ScreenState();
}

class _TestPhase2ScreenState extends State<TestPhase2Screen> {
  final MobileApiService _apiService = MobileApiService();
  final SyncQueueService _syncQueueService = SyncQueueService();

  String _generateUuid() {
    final random = Random();
    final timestamp = DateTime.now().millisecondsSinceEpoch.toString();
    final randomPart = random.nextInt(999999).toString().padLeft(6, '0');
    return 'queue_${timestamp}_$randomPart';
  }

  bool _isLoading = false;
  String _statusMessage = 'Listo para probar Phase 2';
  int _pendingCount = 0;
  SyncResult? _lastSyncResult;

  @override
  void initState() {
    super.initState();
    _initSyncQueue();
    _updatePendingCount();
  }

  Future<void> _initSyncQueue() async {
    await _syncQueueService.initializeSyncQueue();
    await _updatePendingCount();
  }

  Future<void> _updatePendingCount() async {
    final count = await _syncQueueService.getPendingCount();
    setState(() {
      _pendingCount = count;
    });
  }

  Future<void> _testUpdateRelacion() async {
    setState(() {
      _isLoading = true;
      _statusMessage = 'Probando actualización de relación...';
    });

    try {
      // Primero obtener las relaciones del agente
      final relaciones = await _apiService.getRelaciones(widget.agenteId);

      if (relaciones.isEmpty) {
        setState(() {
          _statusMessage = 'No hay relaciones para actualizar. Crea una primero.';
          _isLoading = false;
        });
        return;
      }

      // Actualizar la primera relación
      final relacionId = relaciones.first.id;
      final updated = await _apiService.updateRelacion(
        id: relacionId,
        observaciones: 'Actualizado desde Phase 2 - ${DateTime.now()}',
        prioridad: 'A',
      );

      setState(() {
        _statusMessage = '✅ Relación actualizada exitosamente!\nID: $relacionId\nObservaciones: ${updated.observaciones}';
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _statusMessage = '❌ Error al actualizar relación: $e';
        _isLoading = false;
      });
    }
  }

  Future<void> _testUpdateInteraccion() async {
    setState(() {
      _isLoading = true;
      _statusMessage = 'Probando actualización de interacción...';
    });

    try {
      // Primero obtener las interacciones del agente
      final interacciones = await _apiService.getInteracciones(
        agenteId: widget.agenteId,
      );

      if (interacciones.isEmpty) {
        setState(() {
          _statusMessage = 'No hay interacciones para actualizar. Crea una primero.';
          _isLoading = false;
        });
        return;
      }

      // Actualizar la primera interacción
      final interaccionId = interacciones.first.id;
      final updated = await _apiService.updateInteraccion(
        id: interaccionId,
        resumenVisita: 'Actualizado desde Phase 2 - ${DateTime.now()}',
        resultadoVisita: 'Exitoso',
      );

      setState(() {
        _statusMessage = '✅ Interacción actualizada exitosamente!\nID: $interaccionId\nResumen: ${updated.resumenVisita}';
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _statusMessage = '❌ Error al actualizar interacción: $e';
        _isLoading = false;
      });
    }
  }

  Future<void> _testOfflineUpdate() async {
    setState(() {
      _isLoading = true;
      _statusMessage = 'Agregando actualización a la cola offline...';
    });

    try {
      // Obtener una relación para simular actualización offline
      final relaciones = await _apiService.getRelaciones(widget.agenteId);

      if (relaciones.isEmpty) {
        setState(() {
          _statusMessage = 'No hay relaciones. Crea una primero.';
          _isLoading = false;
        });
        return;
      }

      final relacionId = relaciones.first.id;

      // Agregar actualización a la cola
      final queueItem = SyncQueueItem(
        id: _generateUuid(),
        operationType: SyncOperationType.updateRelacion,
        entityId: relacionId,
        data: {
          'observaciones': 'Actualización offline - ${DateTime.now()}',
          'prioridad': 'B',
        },
        createdAt: DateTime.now(),
      );

      await _syncQueueService.addToQueue(queueItem);
      await _updatePendingCount();

      setState(() {
        _statusMessage = '✅ Actualización agregada a la cola!\nItems pendientes: $_pendingCount';
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _statusMessage = '❌ Error al agregar a la cola: $e';
        _isLoading = false;
      });
    }
  }

  Future<void> _testProcessQueue() async {
    setState(() {
      _isLoading = true;
      _statusMessage = 'Procesando cola de sincronización...';
    });

    try {
      final result = await _syncQueueService.processQueue();
      await _updatePendingCount();

      setState(() {
        _lastSyncResult = result;
        _statusMessage = '''
✅ Sincronización completada!
━━━━━━━━━━━━━━━━━━━━━━
📊 Resultado:
   • Exitosos: ${result.successCount}
   • Fallos: ${result.failureCount}
   • Removidos: ${result.removedCount}
   • Total procesados: ${result.totalProcessed}
━━━━━━━━━━━━━━━━━━━━━━
Pendientes: $_pendingCount
        ''';
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _statusMessage = '❌ Error al procesar cola: $e';
        _isLoading = false;
      });
      await _updatePendingCount();
    }
  }

  Future<void> _testClearQueue() async {
    setState(() {
      _isLoading = true;
      _statusMessage = 'Limpiando cola...';
    });

    try {
      await _syncQueueService.clearQueue();
      await _updatePendingCount();

      setState(() {
        _statusMessage = '✅ Cola limpiada exitosamente!';
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _statusMessage = '❌ Error al limpiar cola: $e';
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Test Phase 2 - Bidirectional Sync'),
        backgroundColor: Colors.deepPurple,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Sync Status Card
              Card(
                color: _pendingCount > 0 ? Colors.orange[50] : Colors.green[50],
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    children: [
                      Icon(
                        _pendingCount > 0 ? Icons.sync_problem : Icons.cloud_done,
                        size: 48,
                        color: _pendingCount > 0 ? Colors.orange : Colors.green,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Cola de Sincronización',
                        style: Theme.of(context).textTheme.titleLarge,
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '$_pendingCount items pendientes',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              color: _pendingCount > 0 ? Colors.orange[700] : Colors.green[700],
                              fontWeight: FontWeight.bold,
                            ),
                      ),
                      if (_lastSyncResult != null) ...[
                        const SizedBox(height: 8),
                        const Divider(),
                        Text(
                          'Última sincronización:',
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                        Text(
                          '${_lastSyncResult!.successCount} éxitos, ${_lastSyncResult!.failureCount} fallos',
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                      ],
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 24),

              // Status Message
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.grey[100],
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.grey[300]!),
                ),
                child: Text(
                  _statusMessage,
                  style: const TextStyle(fontFamily: 'monospace'),
                ),
              ),

              const SizedBox(height: 24),

              // Test Buttons
              _buildSectionTitle('Tests de Actualización (Online)'),
              const SizedBox(height: 8),
              ElevatedButton.icon(
                onPressed: _isLoading ? null : _testUpdateRelacion,
                icon: const Icon(Icons.edit),
                label: const Text('Actualizar Relación'),
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.all(16),
                ),
              ),
              const SizedBox(height: 8),
              ElevatedButton.icon(
                onPressed: _isLoading ? null : _testUpdateInteraccion,
                icon: const Icon(Icons.edit_note),
                label: const Text('Actualizar Interacción'),
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.all(16),
                ),
              ),

              const SizedBox(height: 24),

              _buildSectionTitle('Tests de Cola de Sincronización (Offline)'),
              const SizedBox(height: 8),
              ElevatedButton.icon(
                onPressed: _isLoading ? null : _testOfflineUpdate,
                icon: const Icon(Icons.add_to_queue),
                label: const Text('Agregar Actualización a Cola'),
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.all(16),
                  backgroundColor: Colors.orange,
                ),
              ),
              const SizedBox(height: 8),
              ElevatedButton.icon(
                onPressed: _isLoading || _pendingCount == 0 ? null : _testProcessQueue,
                icon: const Icon(Icons.sync),
                label: const Text('Procesar Cola (Sincronizar)'),
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.all(16),
                  backgroundColor: Colors.green,
                ),
              ),
              const SizedBox(height: 8),
              OutlinedButton.icon(
                onPressed: _isLoading || _pendingCount == 0 ? null : _testClearQueue,
                icon: const Icon(Icons.delete_sweep),
                label: const Text('Limpiar Cola'),
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.all(16),
                  foregroundColor: Colors.red,
                ),
              ),

              const SizedBox(height: 24),

              // Loading Indicator
              if (_isLoading)
                const Center(
                  child: CircularProgressIndicator(),
                ),

              const SizedBox(height: 16),

              // Info Card
              Card(
                color: Colors.blue[50],
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Icon(Icons.info_outline, color: Colors.blue[700]),
                          const SizedBox(width: 8),
                          Text(
                            'Cómo Funciona',
                            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                  color: Colors.blue[700],
                                  fontWeight: FontWeight.bold,
                                ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      _buildInfoItem('1. Tests Online actualizan directamente al servidor'),
                      _buildInfoItem('2. Tests Offline agregan operaciones a una cola local'),
                      _buildInfoItem('3. "Procesar Cola" sincroniza todas las operaciones pendientes'),
                      _buildInfoItem('4. Estrategia: Last Write Wins (última escritura gana)'),
                      _buildInfoItem('5. Reintentos automáticos hasta 3 veces por operación'),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: const TextStyle(
        fontSize: 16,
        fontWeight: FontWeight.bold,
        color: Colors.deepPurple,
      ),
    );
  }

  Widget _buildInfoItem(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('• ', style: TextStyle(fontWeight: FontWeight.bold)),
          Expanded(child: Text(text, style: const TextStyle(fontSize: 12))),
        ],
      ),
    );
  }
}
