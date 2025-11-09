import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/mobile_api_service.dart';
import '../services/database_service.dart';
import '../models/relacion.dart';
import '../models/interaccion.dart';
import '../providers/auth_provider.dart';

class TestSyncScreen extends StatefulWidget {
  const TestSyncScreen({super.key});

  @override
  State<TestSyncScreen> createState() => _TestSyncScreenState();
}

class _TestSyncScreenState extends State<TestSyncScreen> {
  final MobileApiService _apiService = MobileApiService();
  final DatabaseService _dbService = DatabaseService();
  bool _isLoading = false;
  String _status = 'Esperando acción...';
  MobileSyncResponse? _syncData;
  MobileDashboard? _dashboard;
  String? _error;

  String? get _agenteId {
    final user = Provider.of<AuthProvider>(context, listen: false).currentUser;
    return user?.agenteId;
  }

  Future<void> _testSync() async {
    if (_agenteId == null) {
      setState(() {
        _error = 'No se encontró el ID del agente. Usuario debe ser representante.';
        _status = 'Error: Sin agente ID';
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _status = 'Sincronizando datos...';
      _error = null;
    });

    try {
      final syncResponse = await _apiService.syncAll(
        agenteId: _agenteId!,
      );

      setState(() {
        _syncData = syncResponse;
        _status = 'Sincronización completada exitosamente!';
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _status = 'Error en sincronización';
        _isLoading = false;
      });
    }
  }

  Future<void> _testDashboard() async {
    if (_agenteId == null) {
      setState(() {
        _error = 'No se encontró el ID del agente. Usuario debe ser representante.';
        _status = 'Error: Sin agente ID';
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _status = 'Cargando dashboard...';
      _error = null;
    });

    try {
      final dashboard = await _apiService.getDashboard(_agenteId!);

      setState(() {
        _dashboard = dashboard;
        _status = 'Dashboard cargado exitosamente!';
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _status = 'Error al cargar dashboard';
        _isLoading = false;
      });
    }
  }

  Future<void> _testGetRelaciones() async {
    if (_agenteId == null) {
      setState(() {
        _error = 'No se encontró el ID del agente. Usuario debe ser representante.';
        _status = 'Error: Sin agente ID';
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _status = 'Obteniendo relaciones...';
      _error = null;
    });

    try {
      final relaciones = await _apiService.getRelaciones(_agenteId!);

      setState(() {
        _status = 'Relaciones obtenidas: ${relaciones.length}';
        _isLoading = false;
      });

      if (relaciones.isNotEmpty) {
        _showRelacionesDialog(relaciones);
      }
    } catch (e) {
      setState(() {
        _error = e.toString();
        _status = 'Error al obtener relaciones';
        _isLoading = false;
      });
    }
  }

  Future<void> _testGetInteracciones() async {
    if (_agenteId == null) {
      setState(() {
        _error = 'No se encontró el ID del agente. Usuario debe ser representante.';
        _status = 'Error: Sin agente ID';
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _status = 'Obteniendo interacciones...';
      _error = null;
    });

    try {
      final interacciones = await _apiService.getInteracciones(
        agenteId: _agenteId!,
        desde: DateTime.now().subtract(const Duration(days: 30)),
      );

      setState(() {
        _status = 'Interacciones obtenidas: ${interacciones.length}';
        _isLoading = false;
      });

      if (interacciones.isNotEmpty) {
        _showInteraccionesDialog(interacciones);
      }
    } catch (e) {
      setState(() {
        _error = e.toString();
        _status = 'Error al obtener interacciones';
        _isLoading = false;
      });
    }
  }

  Future<void> _inspectDatabase() async {
    setState(() {
      _isLoading = true;
      _status = 'Consultando base de datos SQLite...';
      _error = null;
    });

    try {
      // Obtener el usuario actual del provider
      final user = Provider.of<AuthProvider>(context, listen: false).currentUser;

      if (user == null) {
        setState(() {
          _error = 'No hay usuario autenticado';
          _status = 'Error: Sin usuario';
          _isLoading = false;
        });
        return;
      }

      // Consultar el usuario desde la base de datos SQLite
      final dbUser = await _dbService.getUsuarioById(user.id);

      String info = '=== USUARIO EN PROVIDER ===\n';
      info += 'ID: ${user.id}\n';
      info += 'Email: ${user.email}\n';
      info += 'Nombre: ${user.nombre}\n';
      info += 'Rol: ${user.rol}\n';
      info += 'AgenteId: ${user.agenteId ?? "NULL"}\n\n';

      if (dbUser != null) {
        info += '=== USUARIO EN SQLITE ===\n';
        info += 'ID: ${dbUser.id}\n';
        info += 'Email: ${dbUser.email}\n';
        info += 'Nombre: ${dbUser.nombre}\n';
        info += 'Rol: ${dbUser.rol}\n';
        info += 'AgenteId: ${dbUser.agenteId ?? "NULL"}\n';
      } else {
        info += '=== USUARIO EN SQLITE ===\n';
        info += 'NO ENCONTRADO EN LA BASE DE DATOS LOCAL';
      }

      setState(() {
        _status = 'Consulta completada';
        _isLoading = false;
      });

      _showDatabaseInfoDialog(info);
    } catch (e) {
      setState(() {
        _error = e.toString();
        _status = 'Error al consultar base de datos';
        _isLoading = false;
      });
    }
  }

  void _showDatabaseInfoDialog(String info) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Información de Base de Datos'),
        content: SingleChildScrollView(
          child: SelectableText(
            info,
            style: const TextStyle(fontFamily: 'monospace', fontSize: 12),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cerrar'),
          ),
        ],
      ),
    );
  }

  void _showRelacionesDialog(List<Relacion> relaciones) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Relaciones (${relaciones.length})'),
        content: SizedBox(
          width: double.maxFinite,
          child: ListView.builder(
            shrinkWrap: true,
            itemCount: relaciones.length,
            itemBuilder: (context, index) {
              final rel = relaciones[index];
              return ListTile(
                leading: CircleAvatar(
                  backgroundColor: _parseColor(rel.tipoRelacionColor),
                  child: Text(
                    rel.tipoRelacionNombre.substring(0, 1),
                    style: const TextStyle(color: Colors.white),
                  ),
                ),
                title: Text(rel.clientePrincipalNombre ?? 'Sin nombre'),
                subtitle: Text(
                  '${rel.tipoRelacionNombre}\n'
                  'Prioridad: ${rel.prioridad ?? "N/A"}\n'
                  'Estado: ${rel.estado}',
                ),
                isThreeLine: true,
              );
            },
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cerrar'),
          ),
        ],
      ),
    );
  }

  void _showInteraccionesDialog(List<Interaccion> interacciones) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Interacciones (${interacciones.length})'),
        content: SizedBox(
          width: double.maxFinite,
          child: ListView.builder(
            shrinkWrap: true,
            itemCount: interacciones.length,
            itemBuilder: (context, index) {
              final int = interacciones[index];
              return ListTile(
                leading: CircleAvatar(
                  backgroundColor: _parseColor(int.tipoInteraccionColor),
                  child: Icon(
                    _getIconForInteraccion(int.tipoInteraccionNombre),
                    color: Colors.white,
                    size: 20,
                  ),
                ),
                title: Text(int.clientePrincipalNombre ?? 'Sin nombre'),
                subtitle: Text(
                  '${int.tipoInteraccionNombre}\n'
                  '${_formatDate(int.fecha)}\n'
                  '${int.resumenVisita ?? "Sin resumen"}',
                ),
                isThreeLine: true,
              );
            },
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cerrar'),
          ),
        ],
      ),
    );
  }

  Color _parseColor(String? colorHex) {
    if (colorHex == null || colorHex.isEmpty) return Colors.blue;
    try {
      return Color(int.parse(colorHex.replaceAll('#', '0xFF')));
    } catch (e) {
      return Colors.blue;
    }
  }

  IconData _getIconForInteraccion(String tipo) {
    switch (tipo.toLowerCase()) {
      case 'visita':
        return Icons.location_on;
      case 'llamada':
        return Icons.phone;
      case 'email':
        return Icons.email;
      default:
        return Icons.event;
    }
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year} ${date.hour}:${date.minute.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Test API Móvil - Fase 1'),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Status Card
            Card(
              color: _error != null ? Colors.red[50] : Colors.blue[50],
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(
                          _error != null ? Icons.error : Icons.info,
                          color: _error != null ? Colors.red : Colors.blue,
                        ),
                        const SizedBox(width: 8),
                        const Text(
                          'Estado',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(
                      _status,
                      style: TextStyle(
                        color: _error != null ? Colors.red[900] : Colors.blue[900],
                      ),
                    ),
                    if (_error != null) ...[
                      const SizedBox(height: 8),
                      Text(
                        _error!,
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.red[700],
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ),

            const SizedBox(height: 24),

            // Debug Button
            const Text(
              'Debug',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),

            ElevatedButton.icon(
              onPressed: _isLoading ? null : _inspectDatabase,
              icon: const Icon(Icons.storage),
              label: const Text('Inspeccionar Base de Datos SQLite'),
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.all(16),
                backgroundColor: Colors.purple,
                foregroundColor: Colors.white,
              ),
            ),

            const SizedBox(height: 24),

            // Test Buttons
            const Text(
              'Pruebas de Endpoints',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),

            ElevatedButton.icon(
              onPressed: _isLoading ? null : _testSync,
              icon: const Icon(Icons.sync),
              label: const Text('Test: Sincronización Completa'),
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.all(16),
              ),
            ),

            const SizedBox(height: 12),

            ElevatedButton.icon(
              onPressed: _isLoading ? null : _testDashboard,
              icon: const Icon(Icons.dashboard),
              label: const Text('Test: Dashboard'),
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.all(16),
              ),
            ),

            const SizedBox(height: 12),

            ElevatedButton.icon(
              onPressed: _isLoading ? null : _testGetRelaciones,
              icon: const Icon(Icons.people),
              label: const Text('Test: Obtener Relaciones'),
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.all(16),
              ),
            ),

            const SizedBox(height: 12),

            ElevatedButton.icon(
              onPressed: _isLoading ? null : _testGetInteracciones,
              icon: const Icon(Icons.event_note),
              label: const Text('Test: Obtener Interacciones'),
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.all(16),
              ),
            ),

            if (_isLoading) ...[
              const SizedBox(height: 24),
              const Center(
                child: CircularProgressIndicator(),
              ),
            ],

            // Results Section
            if (_syncData != null) ...[
              const SizedBox(height: 24),
              const Divider(),
              const SizedBox(height: 16),
              const Text(
                'Resultados de Sincronización',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 16),
              _buildStatCard(
                'Relaciones',
                _syncData!.totalRelaciones.toString(),
                Icons.people,
                Colors.blue,
              ),
              _buildStatCard(
                'Interacciones',
                _syncData!.totalInteracciones.toString(),
                Icons.event_note,
                Colors.green,
              ),
              _buildStatCard(
                'Clientes',
                _syncData!.totalClientes.toString(),
                Icons.business,
                Colors.orange,
              ),
              _buildStatCard(
                'Tipos de Relación',
                _syncData!.tiposRelacion.length.toString(),
                Icons.category,
                Colors.purple,
              ),
              _buildStatCard(
                'Tipos de Interacción',
                _syncData!.tiposInteraccion.length.toString(),
                Icons.list,
                Colors.teal,
              ),
            ],

            if (_dashboard != null) ...[
              const SizedBox(height: 24),
              const Divider(),
              const SizedBox(height: 16),
              const Text(
                'Dashboard del Agente',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 16),
              _buildStatCard(
                'Total Relaciones',
                _dashboard!.totalRelaciones.toString(),
                Icons.people,
                Colors.blue,
              ),
              _buildStatCard(
                'Interacciones Hoy',
                _dashboard!.interaccionesHoy.toString(),
                Icons.today,
                Colors.green,
              ),
              _buildStatCard(
                'Interacciones Semana',
                _dashboard!.interaccionesSemana.toString(),
                Icons.date_range,
                Colors.orange,
              ),
              _buildStatCard(
                'Interacciones Mes',
                _dashboard!.interaccionesMes.toString(),
                Icons.calendar_month,
                Colors.purple,
              ),
              if (_dashboard!.interaccionesPorTipo.isNotEmpty) ...[
                const SizedBox(height: 16),
                const Text(
                  'Interacciones por Tipo',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                ..._dashboard!.interaccionesPorTipo.entries.map(
                  (entry) => ListTile(
                    leading: const Icon(Icons.bar_chart),
                    title: Text(entry.key),
                    trailing: Text(
                      entry.value.toString(),
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
              ],
            ],

            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildStatCard(String label, String value, IconData icon, Color color) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: color,
          child: Icon(icon, color: Colors.white),
        ),
        title: Text(label),
        trailing: Text(
          value,
          style: const TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
    );
  }
}
