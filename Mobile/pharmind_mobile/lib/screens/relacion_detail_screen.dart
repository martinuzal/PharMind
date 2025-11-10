import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/mobile_api_service.dart';
import '../models/relacion.dart';
import '../models/interaccion.dart';
import '../models/tipo_interaccion.dart';
import '../providers/toolbar_provider.dart';
import '../widgets/bottom_toolbar.dart';
import 'interaccion_form_screen.dart';
import 'relacion_form_screen.dart';

class RelacionDetailScreen extends StatefulWidget {
  final String relacionId;
  final String agenteId;

  const RelacionDetailScreen({
    super.key,
    required this.relacionId,
    required this.agenteId,
  });

  @override
  State<RelacionDetailScreen> createState() => _RelacionDetailScreenState();
}

class _RelacionDetailScreenState extends State<RelacionDetailScreen> with SingleTickerProviderStateMixin {
  final MobileApiService _apiService = MobileApiService();

  Relacion? _relacion;
  List<Interaccion> _interacciones = [];
  List<TipoInteraccion> _tiposInteraccionPermitidos = [];
  bool _isLoading = true;
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadData();

    // Configurar acciones del toolbar después de que el frame esté construido
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _setupToolbarActions();
    });
  }

  void _setupToolbarActions() {
    final toolbarProvider = Provider.of<ToolbarProvider>(context, listen: false);
    toolbarProvider.setActions([
      ToolbarProvider.createAddAction(() => _mostrarSelectorTipoInteraccion()),
      ToolbarProvider.createEditAction(() => _editarRelacion()),
      ToolbarProvider.createDeleteAction(() => _confirmarEliminarRelacion()),
      ToolbarProvider.createShareAction(() {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Compartir no implementado aún')),
        );
      }),
    ]);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadData() async {
    setState(() {
      _isLoading = true;
    });

    try {
      // Cargar la relación
      final relacion = await _apiService.getRelacionById(widget.relacionId);

      // Cargar las interacciones de esta relación
      final interacciones = await _apiService.getInteracciones(
        agenteId: widget.agenteId,
      );

      // Filtrar solo las interacciones de esta relación
      final interaccionesRelacion = interacciones
          .where((i) => i.relacionId == widget.relacionId)
          .toList();

      // Ordenar por fecha descendente
      interaccionesRelacion.sort((a, b) => b.fecha.compareTo(a.fecha));

      // Cargar todos los tipos de interacción disponibles
      final todosTipos = await _apiService.getTiposInteraccion();

      // Filtrar los tipos permitidos según el schema de la relación
      final tiposPermitidos = _filterTiposInteraccionPermitidos(
        relacion,
        todosTipos,
      );

      setState(() {
        _relacion = relacion;
        _interacciones = interaccionesRelacion;
        _tiposInteraccionPermitidos = tiposPermitidos;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error al cargar datos: $e')),
        );
      }
    }
  }

  List<TipoInteraccion> _filterTiposInteraccionPermitidos(
    Relacion relacion,
    List<TipoInteraccion> todosTipos,
  ) {
    try {
      print('🔍 DEBUG: tipoRelacionSchema = ${relacion.tipoRelacionSchema}');

      // Parsear el schema del tipo de relación
      if (relacion.tipoRelacionSchema == null || relacion.tipoRelacionSchema!.isEmpty) {
        print('⚠️ Schema vacío o nulo, mostrando todos los tipos');
        // Si no hay schema, permitir todas las interacciones
        return todosTipos;
      }

      final schemaJson = json.decode(relacion.tipoRelacionSchema!);
      print('📄 Schema parseado: $schemaJson');

      // Buscar la propiedad interactionsConfig en el schema
      if (schemaJson is Map && schemaJson.containsKey('interactionsConfig')) {
        final interactionsConfig = schemaJson['interactionsConfig'];
        print('✅ interactionsConfig encontrado: $interactionsConfig');

        // Si interactionsConfig es una lista de IDs
        if (interactionsConfig is List && interactionsConfig.isNotEmpty) {
          final allowedIds = interactionsConfig.cast<String>();
          print('🎯 IDs permitidos: $allowedIds');

          // Filtrar solo los tipos permitidos
          final filtered = todosTipos.where((tipo) => allowedIds.contains(tipo.id)).toList();
          print('✨ Tipos filtrados: ${filtered.length} de ${todosTipos.length}');
          return filtered;
        } else {
          print('⚠️ interactionsConfig está vacío o no es una lista');
        }
      } else {
        print('⚠️ No se encontró interactionsConfig en el schema');
      }

      // Si no hay interactionsConfig o está vacío, permitir todas
      print('📋 Retornando todos los tipos (${todosTipos.length})');
      return todosTipos;
    } catch (e) {
      print('❌ Error al filtrar tipos de interacción: $e');
      // En caso de error, permitir todas las interacciones
      return todosTipos;
    }
  }

  Color _getPrioridadColor(String? prioridad) {
    switch (prioridad?.toUpperCase()) {
      case 'A':
        return Colors.red;
      case 'B':
        return Colors.orange;
      case 'C':
        return Colors.blue;
      default:
        return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_relacion?.codigoRelacion ?? 'Relación'),
        backgroundColor: Colors.deepPurple,
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'Detalles', icon: Icon(Icons.info_outline)),
            Tab(text: 'Interacciones', icon: Icon(Icons.history)),
          ],
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _relacion == null
              ? const Center(child: Text('No se encontró la relación'))
              : TabBarView(
                  controller: _tabController,
                  children: [
                    _buildDetallesTab(),
                    _buildInteraccionesTab(),
                  ],
                ),
      bottomNavigationBar: const BottomToolbar(),
    );
  }

  Widget _buildDetallesTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Card principal
          Card(
            elevation: 2,
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Tipo de relación
                  Row(
                    children: [
                      const Icon(Icons.category, color: Colors.deepPurple),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Tipo de Relación',
                              style: TextStyle(
                                fontSize: 12,
                                color: Colors.grey,
                              ),
                            ),
                            Text(
                              _relacion!.tipoRelacionNombre,
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ),
                      if (_relacion!.prioridad != null)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: _getPrioridadColor(_relacion!.prioridad).withAlpha(25),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: _getPrioridadColor(_relacion!.prioridad),
                              width: 1.5,
                            ),
                          ),
                          child: Text(
                            'Prioridad ${_relacion!.prioridad}',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              color: _getPrioridadColor(_relacion!.prioridad),
                            ),
                          ),
                        ),
                    ],
                  ),

                  const Divider(height: 24),

                  // Cliente Principal
                  _buildInfoRow(
                    icon: Icons.person,
                    label: 'Cliente Principal',
                    value: _relacion!.clientePrincipalNombre ?? 'Sin asignar',
                  ),

                  // Cliente Secundario 1
                  if (_relacion!.clienteSecundario1Nombre != null)
                    _buildInfoRow(
                      icon: Icons.person_outline,
                      label: 'Cliente Secundario 1',
                      value: _relacion!.clienteSecundario1Nombre!,
                    ),

                  // Cliente Secundario 2
                  if (_relacion!.clienteSecundario2Nombre != null)
                    _buildInfoRow(
                      icon: Icons.person_outline,
                      label: 'Cliente Secundario 2',
                      value: _relacion!.clienteSecundario2Nombre!,
                    ),

                  const Divider(height: 24),

                  // Estado
                  _buildInfoRow(
                    icon: Icons.circle,
                    label: 'Estado',
                    value: _relacion!.estado,
                    valueColor: _relacion!.estado == 'Activo' ? Colors.green : Colors.grey,
                  ),

                  // Frecuencia de visitas
                  if (_relacion!.frecuenciaVisitas != null)
                    _buildInfoRow(
                      icon: Icons.event_repeat,
                      label: 'Frecuencia de Visitas',
                      value: _relacion!.frecuenciaVisitas!,
                    ),

                  // Fecha de inicio
                  _buildInfoRow(
                    icon: Icons.calendar_today,
                    label: 'Fecha de Inicio',
                    value: _relacion!.fechaInicio.toString().split('T')[0],
                  ),

                  // Fecha de fin
                  if (_relacion!.fechaFin != null)
                    _buildInfoRow(
                      icon: Icons.event_busy,
                      label: 'Fecha de Fin',
                      value: _relacion!.fechaFin!.toString().split('T')[0],
                    ),
                ],
              ),
            ),
          ),

          // Observaciones
          if (_relacion!.observaciones != null && _relacion!.observaciones!.isNotEmpty) ...[
            const SizedBox(height: 16),
            Card(
              elevation: 2,
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.notes, color: Colors.deepPurple),
                        SizedBox(width: 8),
                        Text(
                          'Observaciones',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Text(
                      _relacion!.observaciones!,
                      style: const TextStyle(fontSize: 14),
                    ),
                  ],
                ),
              ),
            ),
          ],

          // Resumen de interacciones
          const SizedBox(height: 16),
          Card(
            elevation: 2,
            color: Colors.blue[50],
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(
                    children: [
                      Icon(Icons.analytics, color: Colors.blue),
                      SizedBox(width: 8),
                      Text(
                        'Resumen de Actividad',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'Total de Interacciones: ${_interacciones.length}',
                    style: const TextStyle(fontSize: 14),
                  ),
                  if (_relacion!.ultimaInteraccionFecha != null) ...[
                    const SizedBox(height: 8),
                    Text(
                      'Última Interacción: ${_relacion!.ultimaInteraccionFecha!.toString().split('T')[0]}',
                      style: const TextStyle(fontSize: 14),
                    ),
                  ],
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoRow({
    required IconData icon,
    required String label,
    required String value,
    Color? valueColor,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 20, color: Colors.grey[600]),
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
                  ),
                ),
                Text(
                  value,
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                    color: valueColor ?? Colors.black87,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInteraccionesTab() {
    if (_interacciones.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.chat_bubble_outline, size: 80, color: Colors.grey[400]),
            const SizedBox(height: 16),
            Text(
              'Sin interacciones aún',
              style: TextStyle(
                fontSize: 18,
                color: Colors.grey[600],
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Presiona el botón + para crear la primera interacción',
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey[500],
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _loadData,
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _interacciones.length,
        itemBuilder: (context, index) {
          final interaccion = _interacciones[index];
          return _buildInteraccionCard(interaccion);
        },
      ),
    );
  }

  Widget _buildInteraccionCard(Interaccion interaccion) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: _parseColor(interaccion.tipoInteraccionColor).withAlpha(25),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(
                    _parseIcon(interaccion.tipoInteraccionIcono),
                    color: _parseColor(interaccion.tipoInteraccionColor),
                    size: 20,
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
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        interaccion.fecha.toString().split('T')[0],
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.grey[600],
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),

            if (interaccion.resumenVisita != null && interaccion.resumenVisita!.isNotEmpty) ...[
              const SizedBox(height: 12),
              Text(
                interaccion.resumenVisita!,
                style: const TextStyle(fontSize: 13),
                maxLines: 3,
                overflow: TextOverflow.ellipsis,
              ),
            ],

            if (interaccion.resultadoVisita != null) ...[
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.blue.withAlpha(25),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  'Resultado: ${interaccion.resultadoVisita}',
                  style: const TextStyle(fontSize: 12, color: Colors.blue),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  void _mostrarSelectorTipoInteraccion() {
    if (_tiposInteraccionPermitidos.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('No hay tipos de interacción disponibles'),
        ),
      );
      return;
    }

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (BuildContext context) {
        return DraggableScrollableSheet(
          initialChildSize: 0.6,
          minChildSize: 0.4,
          maxChildSize: 0.9,
          expand: false,
          builder: (context, scrollController) {
            return Column(
              children: [
                // Header
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.deepPurple.withOpacity(0.1),
                    borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
                  ),
                  child: Column(
                    children: [
                      Container(
                        width: 40,
                        height: 4,
                        decoration: BoxDecoration(
                          color: Colors.grey[300],
                          borderRadius: BorderRadius.circular(2),
                        ),
                      ),
                      const SizedBox(height: 16),
                      const Text(
                        'Selecciona el tipo de interacción',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        '${_tiposInteraccionPermitidos.length} tipos disponibles',
                        style: TextStyle(
                          fontSize: 14,
                          color: Colors.grey[600],
                        ),
                      ),
                    ],
                  ),
                ),
                // Lista de tipos
                Expanded(
                  child: ListView.builder(
                    controller: scrollController,
                    padding: const EdgeInsets.all(16),
                    itemCount: _tiposInteraccionPermitidos.length,
                    itemBuilder: (context, index) {
                      final tipo = _tiposInteraccionPermitidos[index];
                      return Card(
                        margin: const EdgeInsets.only(bottom: 12),
                        elevation: 2,
                        child: InkWell(
                          onTap: () {
                            Navigator.pop(context);
                            _crearInteraccionConTipo(tipo);
                          },
                          borderRadius: BorderRadius.circular(12),
                          child: Padding(
                            padding: const EdgeInsets.all(16),
                            child: Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(
                                    color: _parseColor(tipo.color).withAlpha(25),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Icon(
                                    _parseIcon(tipo.icono),
                                    color: _parseColor(tipo.color),
                                    size: 28,
                                  ),
                                ),
                                const SizedBox(width: 16),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        tipo.nombre,
                                        style: const TextStyle(
                                          fontSize: 16,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                      if (tipo.subTipo?.isNotEmpty ?? false)
                                        Text(
                                          tipo.subTipo ?? '',
                                          style: TextStyle(
                                            fontSize: 13,
                                            color: Colors.grey[600],
                                          ),
                                        ),
                                    ],
                                  ),
                                ),
                                Icon(
                                  Icons.arrow_forward_ios,
                                  size: 16,
                                  color: Colors.grey[400],
                                ),
                              ],
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ],
            );
          },
        );
      },
    );
  }

  void _crearInteraccionConTipo(TipoInteraccion tipo) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => InteraccionFormScreen(
          relacionId: widget.relacionId,
          agenteId: widget.agenteId,
          tiposInteraccionPermitidos: [tipo], // Solo el tipo seleccionado
          relacion: _relacion!,
        ),
      ),
    ).then((_) => _loadData());
  }

  void _editarRelacion() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => RelacionFormScreen(
          relacion: _relacion!,
          agenteId: widget.agenteId,
        ),
      ),
    ).then((_) => _loadData());
  }

  void _confirmarEliminarRelacion() {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Row(
            children: [
              Icon(Icons.warning_amber_rounded, color: Colors.orange, size: 28),
              SizedBox(width: 12),
              Text('Confirmar eliminación'),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('¿Estás seguro de que deseas eliminar esta relación?'),
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.grey[100],
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      _relacion!.tipoRelacionNombre,
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      _relacion!.clientePrincipalNombre ?? 'Sin cliente',
                      style: TextStyle(
                        fontSize: 13,
                        color: Colors.grey[700],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 12),
              const Text(
                'Esta acción no se puede deshacer.',
                style: TextStyle(
                  fontSize: 13,
                  color: Colors.red,
                  fontStyle: FontStyle.italic,
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancelar'),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.pop(context);
                _eliminarRelacion();
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red,
                foregroundColor: Colors.white,
              ),
              child: const Text('Eliminar'),
            ),
          ],
        );
      },
    );
  }

  Future<void> _eliminarRelacion() async {
    try {
      // TODO: Implementar eliminación lógica
      // await _apiService.deleteRelacion(widget.relacionId);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Función de eliminación en desarrollo'),
            backgroundColor: Colors.orange,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error al eliminar relación: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  // Helper para parsear color desde string hex
  Color _parseColor(String? colorHex) {
    if (colorHex == null || colorHex.isEmpty) {
      return Colors.green;
    }

    try {
      String hex = colorHex.replaceAll('#', '');
      if (hex.length == 6) {
        hex = 'FF$hex'; // Agregar alpha si no está presente
      }
      return Color(int.parse(hex, radix: 16));
    } catch (e) {
      return Colors.green;
    }
  }

  // Helper para parsear icono desde string de Material Icons
  IconData _parseIcon(String? iconName) {
    if (iconName == null || iconName.isEmpty) {
      return Icons.chat;
    }

    // Mapeo de iconos comunes para interacciones
    final iconMap = {
      'chat': Icons.chat,
      'phone': Icons.phone,
      'call': Icons.call,
      'email': Icons.email,
      'videocam': Icons.videocam,
      'meeting_room': Icons.meeting_room,
      'event': Icons.event,
      'calendar_today': Icons.calendar_today,
      'description': Icons.description,
      'note': Icons.note,
      'assignment': Icons.assignment,
      'medical_services': Icons.medical_services,
      'local_pharmacy': Icons.local_pharmacy,
      'store': Icons.store,
    };

    return iconMap[iconName.toLowerCase()] ?? Icons.chat;
  }
}
