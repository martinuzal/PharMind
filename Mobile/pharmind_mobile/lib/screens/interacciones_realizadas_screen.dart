import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/interaccion.dart';
import '../services/mobile_api_service.dart';

class InteraccionesRealizadasScreen extends StatefulWidget {
  final String agenteId;

  const InteraccionesRealizadasScreen({
    super.key,
    required this.agenteId,
  });

  @override
  State<InteraccionesRealizadasScreen> createState() => _InteraccionesRealizadasScreenState();
}

class _InteraccionesRealizadasScreenState extends State<InteraccionesRealizadasScreen> {
  final MobileApiService _apiService = MobileApiService();
  final TextEditingController _searchController = TextEditingController();

  List<Interaccion> _interacciones = [];
  List<Interaccion> _filteredInteracciones = [];
  bool _isLoading = false;
  String? _errorMessage;

  // Filtros
  String? _filtroTipo;
  String? _filtroEstado;
  DateTime? _desde;
  DateTime? _hasta;

  @override
  void initState() {
    super.initState();
    _loadInteracciones();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadInteracciones() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final interacciones = await _apiService.getInteracciones(
        agenteId: widget.agenteId,
        desde: _desde,
        hasta: _hasta,
      );

      setState(() {
        _interacciones = interacciones;
        _applyFilters();
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = 'Error al cargar interacciones: $e';
        _isLoading = false;
      });
    }
  }

  void _applyFilters() {
    List<Interaccion> filtered = List.from(_interacciones);

    // Filtro de búsqueda por texto
    if (_searchController.text.isNotEmpty) {
      final searchTerm = _searchController.text.toLowerCase();
      filtered = filtered.where((interaccion) {
        return (interaccion.clientePrincipalNombre?.toLowerCase().contains(searchTerm) ?? false) ||
            (interaccion.tipoInteraccionNombre.toLowerCase().contains(searchTerm)) ||
            (interaccion.resumenVisita?.toLowerCase().contains(searchTerm) ?? false) ||
            (interaccion.objetivoVisita?.toLowerCase().contains(searchTerm) ?? false);
      }).toList();
    }

    // Filtro por tipo de interacción
    if (_filtroTipo != null) {
      filtered = filtered.where((i) => i.tipoInteraccionNombre == _filtroTipo).toList();
    }

    // Filtro por estado
    if (_filtroEstado != null) {
      filtered = filtered.where((i) => i.estado == _filtroEstado).toList();
    }

    // Ordenar por fecha descendente (más reciente primero)
    filtered.sort((a, b) => b.fecha.compareTo(a.fecha));

    setState(() {
      _filteredInteracciones = filtered;
    });
  }

  void _clearFilters() {
    setState(() {
      _searchController.clear();
      _filtroTipo = null;
      _filtroEstado = null;
      _desde = null;
      _hasta = null;
      _applyFilters();
    });
  }

  Widget _buildFilterChips() {
    final tipos = _interacciones.map((i) => i.tipoInteraccionNombre).toSet().toList();
    final estados = _interacciones.map((i) => i.estado).toSet().toList();

    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Row(
        children: [
          // Filtro por tipo
          if (tipos.isNotEmpty)
            PopupMenuButton<String>(
              child: Chip(
                avatar: Icon(
                  Icons.filter_list,
                  size: 18,
                  color: _filtroTipo != null ? Colors.white : Colors.grey[700],
                ),
                label: Text(_filtroTipo ?? 'Tipo'),
                backgroundColor: _filtroTipo != null ? Colors.amber : Colors.grey[200],
                labelStyle: TextStyle(
                  color: _filtroTipo != null ? Colors.white : Colors.black87,
                  fontWeight: _filtroTipo != null ? FontWeight.bold : FontWeight.normal,
                ),
              ),
              onSelected: (value) {
                setState(() {
                  _filtroTipo = value;
                  _applyFilters();
                });
              },
              itemBuilder: (context) => [
                const PopupMenuItem(
                  value: null,
                  child: Text('Todos'),
                ),
                ...tipos.map((tipo) => PopupMenuItem(
                  value: tipo,
                  child: Text(tipo),
                )),
              ],
            ),
          const SizedBox(width: 8),

          // Filtro por estado
          if (estados.isNotEmpty)
            PopupMenuButton<String>(
              child: Chip(
                avatar: Icon(
                  Icons.check_circle_outline,
                  size: 18,
                  color: _filtroEstado != null ? Colors.white : Colors.grey[700],
                ),
                label: Text(_filtroEstado ?? 'Estado'),
                backgroundColor: _filtroEstado != null ? Colors.amber : Colors.grey[200],
                labelStyle: TextStyle(
                  color: _filtroEstado != null ? Colors.white : Colors.black87,
                  fontWeight: _filtroEstado != null ? FontWeight.bold : FontWeight.normal,
                ),
              ),
              onSelected: (value) {
                setState(() {
                  _filtroEstado = value;
                  _applyFilters();
                });
              },
              itemBuilder: (context) => [
                const PopupMenuItem(
                  value: null,
                  child: Text('Todos'),
                ),
                ...estados.map((estado) => PopupMenuItem(
                  value: estado,
                  child: Text(estado),
                )),
              ],
            ),
          const SizedBox(width: 8),

          // Botón de limpiar filtros
          if (_filtroTipo != null || _filtroEstado != null || _desde != null || _hasta != null)
            ActionChip(
              avatar: const Icon(Icons.clear, size: 18, color: Colors.white),
              label: const Text('Limpiar'),
              backgroundColor: Colors.red,
              labelStyle: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
              onPressed: _clearFilters,
            ),
        ],
      ),
    );
  }

  Widget _buildInteraccionCard(Interaccion interaccion) {
    final dateFormat = DateFormat('dd/MM/yyyy HH:mm');
    final iconColor = interaccion.tipoInteraccionColor != null
        ? _parseColor(interaccion.tipoInteraccionColor!)
        : Colors.amber;

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: () => _showInteraccionDetail(interaccion),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header con tipo e icono
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: iconColor.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Icon(
                      _parseIcon(interaccion.tipoInteraccionIcono),
                      color: iconColor,
                      size: 24,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          interaccion.tipoInteraccionNombre,
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Text(
                          dateFormat.format(interaccion.fecha),
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.grey[600],
                          ),
                        ),
                      ],
                    ),
                  ),
                  // Badge de estado
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: _getEstadoColor(interaccion.estado),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      interaccion.estado,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // Cliente
              if (interaccion.clientePrincipalNombre != null)
                Row(
                  children: [
                    Icon(Icons.person, size: 16, color: Colors.grey[600]),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        interaccion.clientePrincipalNombre!,
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),

              // Objetivo de la visita
              if (interaccion.objetivoVisita != null) ...[
                const SizedBox(height: 8),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(Icons.flag, size: 16, color: Colors.grey[600]),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        interaccion.objetivoVisita!,
                        style: TextStyle(
                          fontSize: 13,
                          color: Colors.grey[700],
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ],

              // Resumen
              if (interaccion.resumenVisita != null) ...[
                const SizedBox(height: 8),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(Icons.notes, size: 16, color: Colors.grey[600]),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        interaccion.resumenVisita!,
                        style: TextStyle(
                          fontSize: 13,
                          color: Colors.grey[700],
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ],

              // Información adicional (turno, duración)
              if (interaccion.turno != null || interaccion.duracionMinutos != null) ...[
                const SizedBox(height: 8),
                Row(
                  children: [
                    if (interaccion.turno != null) ...[
                      Icon(Icons.access_time, size: 14, color: Colors.grey[600]),
                      const SizedBox(width: 4),
                      Text(
                        interaccion.turno!,
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.grey[600],
                        ),
                      ),
                      const SizedBox(width: 16),
                    ],
                    if (interaccion.duracionMinutos != null) ...[
                      Icon(Icons.timer, size: 14, color: Colors.grey[600]),
                      const SizedBox(width: 4),
                      Text(
                        '${interaccion.duracionMinutos} min',
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.grey[600],
                        ),
                      ),
                    ],
                  ],
                ),
              ],

              // Próxima acción
              if (interaccion.proximaAccion != null) ...[
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.blue[50],
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    children: [
                      Icon(Icons.next_plan, size: 16, color: Colors.blue[700]),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          'Próxima: ${interaccion.proximaAccion}',
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.blue[700],
                            fontWeight: FontWeight.w500,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      if (interaccion.fechaProximaAccion != null)
                        Text(
                          DateFormat('dd/MM').format(interaccion.fechaProximaAccion!),
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.blue[700],
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                    ],
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  void _showInteraccionDetail(Interaccion interaccion) {
    final dateFormat = DateFormat('dd/MM/yyyy HH:mm');

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.7,
        minChildSize: 0.5,
        maxChildSize: 0.95,
        expand: false,
        builder: (context, scrollController) => Padding(
          padding: const EdgeInsets.all(20),
          child: ListView(
            controller: scrollController,
            children: [
              // Handle indicator
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  margin: const EdgeInsets.only(bottom: 20),
                  decoration: BoxDecoration(
                    color: Colors.grey[300],
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),

              // Título
              Text(
                interaccion.tipoInteraccionNombre,
                style: const TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                dateFormat.format(interaccion.fecha),
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.grey[600],
                ),
              ),
              const SizedBox(height: 20),

              // Estado
              _buildDetailRow('Estado', interaccion.estado, Icons.check_circle_outline),

              // Cliente principal
              if (interaccion.clientePrincipalNombre != null)
                _buildDetailRow('Cliente', interaccion.clientePrincipalNombre!, Icons.person),

              // Cliente secundario
              if (interaccion.clienteSecundario1Nombre != null)
                _buildDetailRow('Cliente Secundario', interaccion.clienteSecundario1Nombre!, Icons.person_outline),

              // Turno y duración
              if (interaccion.turno != null)
                _buildDetailRow('Turno', interaccion.turno!, Icons.access_time),

              if (interaccion.duracionMinutos != null)
                _buildDetailRow('Duración', '${interaccion.duracionMinutos} minutos', Icons.timer),

              // Objetivo
              if (interaccion.objetivoVisita != null)
                _buildDetailRow('Objetivo', interaccion.objetivoVisita!, Icons.flag, isMultiline: true),

              // Resumen
              if (interaccion.resumenVisita != null)
                _buildDetailRow('Resumen', interaccion.resumenVisita!, Icons.notes, isMultiline: true),

              // Resultado
              if (interaccion.resultadoVisita != null)
                _buildDetailRow('Resultado', interaccion.resultadoVisita!, Icons.assessment, isMultiline: true),

              // Próxima acción
              if (interaccion.proximaAccion != null)
                _buildDetailRow('Próxima Acción', interaccion.proximaAccion!, Icons.next_plan, isMultiline: true),

              if (interaccion.fechaProximaAccion != null)
                _buildDetailRow(
                  'Fecha Próxima Acción',
                  dateFormat.format(interaccion.fechaProximaAccion!),
                  Icons.calendar_today,
                ),

              // Geolocalización
              if (interaccion.latitud != null && interaccion.longitud != null)
                _buildDetailRow(
                  'Ubicación',
                  'Lat: ${interaccion.latitud!.toStringAsFixed(6)}, Lon: ${interaccion.longitud!.toStringAsFixed(6)}',
                  Icons.location_on,
                ),

              if (interaccion.direccionCapturada != null)
                _buildDetailRow('Dirección', interaccion.direccionCapturada!, Icons.place),

              // Sincronización
              _buildDetailRow(
                'Sincronización',
                interaccion.sincronizada ? 'Sincronizada' : 'Pendiente',
                interaccion.sincronizada ? Icons.cloud_done : Icons.cloud_off,
              ),

              const SizedBox(height: 20),

              // Botón cerrar
              ElevatedButton(
                onPressed: () => Navigator.pop(context),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.amber,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: const Text(
                  'Cerrar',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value, IconData icon, {bool isMultiline = false}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        crossAxisAlignment: isMultiline ? CrossAxisAlignment.start : CrossAxisAlignment.center,
        children: [
          Icon(icon, size: 20, color: Colors.amber),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey[600],
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  value,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Color _getEstadoColor(String estado) {
    switch (estado.toLowerCase()) {
      case 'completado':
      case 'completada':
        return Colors.green;
      case 'pendiente':
        return Colors.orange;
      case 'cancelado':
      case 'cancelada':
        return Colors.red;
      default:
        return Colors.blue;
    }
  }

  Color _parseColor(String? colorString) {
    if (colorString == null || colorString.isEmpty) return Colors.amber;
    try {
      if (colorString.startsWith('#')) {
        return Color(int.parse(colorString.substring(1), radix: 16) + 0xFF000000);
      }
      return Colors.amber;
    } catch (e) {
      return Colors.amber;
    }
  }

  IconData _parseIcon(String? iconString) {
    if (iconString == null || iconString.isEmpty) return Icons.check_circle;

    switch (iconString.toLowerCase()) {
      case 'phone':
      case 'call':
        return Icons.phone;
      case 'video':
      case 'videocam':
        return Icons.videocam;
      case 'email':
      case 'mail':
        return Icons.email;
      case 'meeting':
      case 'groups':
        return Icons.groups;
      case 'home':
      case 'house':
        return Icons.home;
      default:
        return Icons.check_circle;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Interacciones Realizadas'),
        backgroundColor: Colors.amber,
        foregroundColor: Colors.white,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadInteracciones,
          ),
        ],
      ),
      body: Column(
        children: [
          // Barra de búsqueda
          Container(
            color: Colors.amber,
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Buscar por cliente, tipo, resumen...',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: _searchController.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear),
                        onPressed: () {
                          _searchController.clear();
                          _applyFilters();
                        },
                      )
                    : null,
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
              ),
              onChanged: (value) => _applyFilters(),
            ),
          ),

          // Chips de filtros
          if (_interacciones.isNotEmpty)
            _buildFilterChips(),

          // Divider
          const Divider(height: 1),

          // Lista de interacciones
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _errorMessage != null
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.error_outline, size: 64, color: Colors.red[300]),
                            const SizedBox(height: 16),
                            Text(
                              _errorMessage!,
                              textAlign: TextAlign.center,
                              style: const TextStyle(fontSize: 16),
                            ),
                            const SizedBox(height: 16),
                            ElevatedButton(
                              onPressed: _loadInteracciones,
                              child: const Text('Reintentar'),
                            ),
                          ],
                        ),
                      )
                    : _filteredInteracciones.isEmpty
                        ? Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.inbox, size: 64, color: Colors.grey[300]),
                                const SizedBox(height: 16),
                                Text(
                                  _interacciones.isEmpty
                                      ? 'No hay interacciones registradas'
                                      : 'No se encontraron interacciones con los filtros aplicados',
                                  textAlign: TextAlign.center,
                                  style: TextStyle(fontSize: 16, color: Colors.grey[600]),
                                ),
                                if (_interacciones.isNotEmpty) ...[
                                  const SizedBox(height: 16),
                                  TextButton(
                                    onPressed: _clearFilters,
                                    child: const Text('Limpiar filtros'),
                                  ),
                                ],
                              ],
                            ),
                          )
                        : RefreshIndicator(
                            onRefresh: _loadInteracciones,
                            child: ListView.builder(
                              itemCount: _filteredInteracciones.length,
                              itemBuilder: (context, index) {
                                return _buildInteraccionCard(_filteredInteracciones[index]);
                              },
                            ),
                          ),
          ),

          // Toolbar inferior con estadísticas
          Container(
            decoration: BoxDecoration(
              color: Colors.grey[100],
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.1),
                  blurRadius: 4,
                  offset: const Offset(0, -2),
                ),
              ],
            ),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildStatItem(
                  Icons.list,
                  'Total',
                  _filteredInteracciones.length.toString(),
                  Colors.amber,
                ),
                _buildStatItem(
                  Icons.check_circle,
                  'Completadas',
                  _filteredInteracciones.where((i) => i.estado.toLowerCase() == 'completado' || i.estado.toLowerCase() == 'completada').length.toString(),
                  Colors.green,
                ),
                _buildStatItem(
                  Icons.pending,
                  'Pendientes',
                  _filteredInteracciones.where((i) => i.estado.toLowerCase() == 'pendiente').length.toString(),
                  Colors.orange,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatItem(IconData icon, String label, String value, Color color) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 20, color: color),
            const SizedBox(width: 6),
            Text(
              value,
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
          ],
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: Colors.grey[600],
          ),
        ),
      ],
    );
  }
}
