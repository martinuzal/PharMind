import 'package:flutter/material.dart';
import '../services/sync_service.dart';
import '../models/sync_stats.dart';

class SyncStatusWidget extends StatefulWidget {
  const SyncStatusWidget({super.key});

  @override
  State<SyncStatusWidget> createState() => _SyncStatusWidgetState();
}

class _SyncStatusWidgetState extends State<SyncStatusWidget> {
  final SyncService _syncService = SyncService();

  Future<Map<String, dynamic>> _loadSyncInfo() async {
    final lastSyncTime = await _syncService.getLastSyncTimeAgo();
    final stats = await _syncService.getLastSyncStats();
    final pendingCount = await _syncService.getPendingSyncCount();

    return {
      'lastSyncTime': lastSyncTime,
      'stats': stats,
      'pendingCount': pendingCount,
    };
  }

  void _showSyncDetailsDialog(SyncStats? stats, Map<String, int> pendingCount) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Row(
          children: [
            Icon(
              stats?.exitosa == true ? Icons.check_circle : Icons.error,
              color: stats?.exitosa == true ? Colors.green : Colors.red,
            ),
            const SizedBox(width: 8),
            const Text('Detalles de Sincronización'),
          ],
        ),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (stats != null) ...[
                Text(
                  'Última sincronización:',
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
                const SizedBox(height: 8),
                _buildStatRow(
                  Icons.cloud_download,
                  'Esquemas descargados',
                  '${stats.esquemasDescargados}',
                  Colors.blue,
                ),
                _buildStatRow(
                  Icons.download,
                  'Entidades recibidas',
                  '${stats.entidadesDescargadas}',
                  Colors.green,
                ),
                _buildStatRow(
                  Icons.upload,
                  'Entidades enviadas',
                  '${stats.entidadesEnviadas}',
                  Colors.orange,
                ),
                const SizedBox(height: 16),
                if (stats.entidadesPorTipo.isNotEmpty) ...[
                  const Text(
                    'Por tipo de entidad:',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                    ),
                  ),
                  const SizedBox(height: 8),
                  ...stats.entidadesPorTipo.entries.map((entry) {
                    return Padding(
                      padding: const EdgeInsets.only(left: 16, bottom: 4),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(entry.key),
                          Text(
                            '${entry.value}',
                            style: const TextStyle(fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                    );
                  }).toList(),
                  const SizedBox(height: 16),
                ],
              ],
              if (pendingCount['total']! > 0) ...[
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.orange[50],
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.orange),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.sync_problem, color: Colors.orange),
                          const SizedBox(width: 8),
                          Text(
                            'Pendientes de sincronizar: ${pendingCount['total']}',
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              color: Colors.orange,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      ...pendingCount.entries
                          .where((e) => e.key != 'total')
                          .map((entry) {
                        return Padding(
                          padding: const EdgeInsets.only(left: 32, top: 4),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(entry.key),
                              Text(
                                '${entry.value}',
                                style: const TextStyle(fontWeight: FontWeight.bold),
                              ),
                            ],
                          ),
                        );
                      }).toList(),
                    ],
                  ),
                ),
              ] else ...[
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.green[50],
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.green),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.check_circle, color: Colors.green),
                      const SizedBox(width: 8),
                      const Text(
                        'Todo sincronizado',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          color: Colors.green,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ],
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
  }

  Widget _buildStatRow(IconData icon, String label, String value, Color color) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          Icon(icon, size: 20, color: color),
          const SizedBox(width: 8),
          Expanded(child: Text(label)),
          Text(
            value,
            style: TextStyle(
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<Map<String, dynamic>>(
      future: _loadSyncInfo(),
      builder: (context, snapshot) {
        if (!snapshot.hasData) {
          return const SizedBox.shrink();
        }

        final data = snapshot.data!;
        final lastSyncTime = data['lastSyncTime'] as String;
        final stats = data['stats'] as SyncStats?;
        final pendingCount = data['pendingCount'] as Map<String, int>;
        final hasPending = pendingCount['total']! > 0;

        return InkWell(
          onTap: () => _showSyncDetailsDialog(stats, pendingCount),
          child: Container(
            margin: const EdgeInsets.only(bottom: 16),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              boxShadow: [
                BoxShadow(
                  color: Colors.grey.withOpacity(0.1),
                  blurRadius: 5,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: hasPending
                        ? Colors.orange.withOpacity(0.1)
                        : Colors.blue.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(
                    hasPending ? Icons.sync_problem : Icons.cloud_done,
                    color: hasPending ? Colors.orange : Colors.blue,
                    size: 24,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Sincronización',
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.grey,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        lastSyncTime,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      if (hasPending) ...[
                        const SizedBox(height: 4),
                        Text(
                          '${pendingCount['total']} pendiente${pendingCount['total']! > 1 ? 's' : ''}',
                          style: const TextStyle(
                            fontSize: 12,
                            color: Colors.orange,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
                const Icon(
                  Icons.chevron_right,
                  color: Colors.grey,
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
