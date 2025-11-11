import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/mobile_api_service.dart';
import '../services/frecuencia_service.dart';
import '../services/cache_service.dart';
import '../services/cita_service.dart';
import '../models/relacion.dart';
import '../models/interaccion.dart';
import '../models/tipo_interaccion.dart';
import '../providers/toolbar_provider.dart';
import '../widgets/bottom_toolbar.dart';
import '../widgets/frecuencia_indicator.dart';
import 'relacion_detail_screen.dart';

class RelacionesScreen extends StatefulWidget {
  final String agenteId;

  const RelacionesScreen({
    super.key,
    required this.agenteId,
  });

  @override
  State<RelacionesScreen> createState() => _RelacionesScreenState();
}

class _RelacionesScreenState extends State<RelacionesScreen> {
  final MobileApiService _apiService = MobileApiService();
  final FrecuenciaService _frecuenciaService = FrecuenciaService();
  final CacheService _cacheService = CacheService();
  final CitaService _citaService = CitaService();
  List<Relacion> _relaciones = [];
  List<Relacion> _relacionesFiltradas = [];
  bool _isLoading = true;
  bool _isOfflineMode = false;
  String _searchQuery = '';
  bool _soloConPendientes = false;

  @override
  void initState() {
    super.initState();
    _loadRelaciones();

    // Configurar acciones del toolbar después de que el frame esté construido
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _setupToolbarActions();
    });
  }

  void _setupToolbarActions() {
    final toolbarProvider = Provider.of<ToolbarProvider>(context, listen: false);
    toolbarProvider.setActions([
      ToolbarProvider.createSearchAction(() {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Búsqueda ya está activa en la pantalla')),
        );
      }),
      ToolbarProvider.createFilterAction(() {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Filtros ya están disponibles en la pantalla')),
        );
      }),
      ToolbarProvider.createSyncAction(() => _loadRelaciones()),
    ]);
  }

  Future<void> _loadRelaciones() async {
    setState(() {
      _isLoading = true;
      _isOfflineMode = false;
    });

    // Inicializar tablas de cache
    await _cacheService.initializeCacheTables();

    try {
      // Intentar cargar desde la API
      print('🌐 Intentando cargar desde la API...');

      final relaciones = await _apiService.getRelaciones(
        widget.agenteId,
        incluirFrecuencia: false,
      );

      final interacciones = await _apiService.getInteracciones(agenteId: widget.agenteId);
      final tiposInteraccion = await _apiService.getTiposInteraccion();

      // Cargar productos para tener disponibles offline
      final productos = await _apiService.getProductos(soloActivos: true);

      // Cargar citas de los próximos 3 meses para tener disponibles offline
      final ahora = DateTime.now();
      final inicio = DateTime(ahora.year, ahora.month, 1);
      final fin = DateTime(ahora.year, ahora.month + 3, 1);
      final citas = await _citaService.getCitasAgente(widget.agenteId, desde: inicio, hasta: fin);

      print('✅ Datos cargados desde la API');
      print('   Relaciones: ${relaciones.length}');
      print('   Interacciones: ${interacciones.length}');
      print('   Tipos: ${tiposInteraccion.length}');
      print('   Productos: ${productos.length}');
      print('   Citas: ${citas.length}');

      // Guardar en cache para uso offline
      await _cacheService.saveRelaciones(relaciones);
      await _cacheService.saveInteracciones(interacciones);
      await _cacheService.saveTiposInteraccion(tiposInteraccion);
      await _cacheService.saveProductos(productos);
      await _cacheService.saveCitas(citas);
      await _cacheService.saveLastSyncDate(DateTime.now());

      // Procesar y mostrar datos
      _procesarYMostrarRelaciones(relaciones, interacciones, tiposInteraccion);

    } catch (e) {
      // Si falla la API, intentar cargar desde cache
      print('❌ Error al cargar desde API: $e');
      print('📦 Intentando cargar desde cache local...');

      try {
        final relacionesCache = await _cacheService.getRelacionesFromCache(agenteId: widget.agenteId);
        final interaccionesCache = await _cacheService.getInteraccionesFromCache(agenteId: widget.agenteId);
        final tiposInteraccionCache = await _cacheService.getTiposInteraccionFromCache();

        if (relacionesCache.isEmpty) {
          throw Exception('No hay datos en cache. Conéctese a internet para la primera sincronización.');
        }

        print('✅ Datos cargados desde cache');
        print('   Relaciones: ${relacionesCache.length}');
        print('   Interacciones: ${interaccionesCache.length}');
        print('   Tipos: ${tiposInteraccionCache.length}');

        setState(() {
          _isOfflineMode = true;
        });

        // Procesar y mostrar datos del cache
        _procesarYMostrarRelaciones(relacionesCache, interaccionesCache, tiposInteraccionCache);

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('📦 Trabajando en modo offline con datos cacheados'),
              backgroundColor: Colors.orange,
              duration: Duration(seconds: 3),
            ),
          );
        }

      } catch (cacheError) {
        setState(() {
          _isLoading = false;
        });
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Error: $cacheError'),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    }
  }

  void _procesarYMostrarRelaciones(
    List<Relacion> relaciones,
    List<Interaccion> interacciones,
    List<TipoInteraccion> tiposInteraccion,
  ) {
    print('📊 Calculando frecuencias localmente...');

    // Calcular frecuencia para cada relación
    final relacionesConFrecuencia = relaciones.map((rel) {
      final frecuencia = _frecuenciaService.calcularFrecuencia(
        rel,
        interacciones,
        tiposInteraccion,
      );

      if (frecuencia != null) {
        print('  ✅ ${rel.clientePrincipalNombre}: ${frecuencia.estado} (${frecuencia.interaccionesRealizadas}/${frecuencia.frecuenciaObjetivo})');
      } else {
        print('  ⚪ ${rel.clientePrincipalNombre}: Sin frecuencia configurada');
      }

      // Crear nueva instancia de Relacion con la frecuencia calculada
      return Relacion(
        id: rel.id,
        tipoRelacionId: rel.tipoRelacionId,
        tipoRelacionNombre: rel.tipoRelacionNombre,
        tipoRelacionSubTipo: rel.tipoRelacionSubTipo,
        tipoRelacionIcono: rel.tipoRelacionIcono,
        tipoRelacionColor: rel.tipoRelacionColor,
        tipoRelacionSchema: rel.tipoRelacionSchema,
        codigoRelacion: rel.codigoRelacion,
        agenteId: rel.agenteId,
        agenteNombre: rel.agenteNombre,
        clientePrincipalId: rel.clientePrincipalId,
        clientePrincipalNombre: rel.clientePrincipalNombre,
        clientePrincipalTelefono: rel.clientePrincipalTelefono,
        clientePrincipalEmail: rel.clientePrincipalEmail,
        clientePrincipalEspecialidad: rel.clientePrincipalEspecialidad,
        clienteSecundario1Id: rel.clienteSecundario1Id,
        clienteSecundario1Nombre: rel.clienteSecundario1Nombre,
        clienteSecundario2Id: rel.clienteSecundario2Id,
        clienteSecundario2Nombre: rel.clienteSecundario2Nombre,
        tipoRelacion: rel.tipoRelacion,
        fechaInicio: rel.fechaInicio,
        fechaFin: rel.fechaFin,
        estado: rel.estado,
        frecuenciaVisitas: rel.frecuenciaVisitas,
        prioridad: rel.prioridad,
        prioridadVisita: rel.prioridadVisita,
        observaciones: rel.observaciones,
        datosDinamicos: rel.datosDinamicos,
        frecuencia: frecuencia,
        ultimaInteraccionFecha: rel.ultimaInteraccionFecha,
        ultimaInteraccionTipo: rel.ultimaInteraccionTipo,
        fechaCreacion: rel.fechaCreacion,
        fechaModificacion: rel.fechaModificacion,
      );
    }).toList();

    setState(() {
      _relaciones = relacionesConFrecuencia;
      _aplicarFiltros();
      _isLoading = false;
    });
  }

  void _aplicarFiltros() {
    _relacionesFiltradas = _relaciones.where((relacion) {
      // Filtro por búsqueda
      final matchesSearch = _searchQuery.isEmpty ||
          relacion.clientePrincipalNombre?.toLowerCase().contains(_searchQuery.toLowerCase()) == true ||
          relacion.tipoRelacionNombre.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          relacion.codigoRelacion.toLowerCase().contains(_searchQuery.toLowerCase());

      // Filtro por pendientes (solo relaciones con visitas pendientes)
      final matchesPendientes = !_soloConPendientes ||
          (relacion.frecuencia != null && relacion.frecuencia!.visitasPendientes > 0);

      return matchesSearch && matchesPendientes;
    }).toList();
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

  IconData _getPrioridadIcon(String? prioridad) {
    switch (prioridad?.toUpperCase()) {
      case 'A':
        return Icons.priority_high;
      case 'B':
        return Icons.remove;
      case 'C':
        return Icons.arrow_downward;
      default:
        return Icons.help_outline;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            const Text('Mi Cartera'),
            if (_isOfflineMode) ...[
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.orange,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.cloud_off, size: 14, color: Colors.white),
                    SizedBox(width: 4),
                    Text(
                      'OFFLINE',
                      style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.white),
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
        backgroundColor: Colors.deepPurple,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadRelaciones,
          ),
        ],
      ),
      body: Column(
        children: [
          // Barra de búsqueda
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              decoration: InputDecoration(
                hintText: 'Buscar por cliente, tipo o código...',
                prefixIcon: const Icon(Icons.search),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                filled: true,
                fillColor: Colors.grey[100],
              ),
              onChanged: (value) {
                setState(() {
                  _searchQuery = value;
                  _aplicarFiltros();
                });
              },
            ),
          ),

          // Filtros
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: [
                // Filtro de Pendientes
                FilterChip(
                  label: const Text('Pendientes'),
                  selected: _soloConPendientes,
                  onSelected: (selected) {
                    setState(() {
                      _soloConPendientes = selected;
                      _aplicarFiltros();
                    });
                  },
                  avatar: Icon(
                    Icons.event_busy,
                    size: 18,
                    color: _soloConPendientes ? Colors.white : Colors.orange,
                  ),
                  selectedColor: Colors.orange,
                  checkmarkColor: Colors.white,
                ),
              ],
            ),
          ),

          const SizedBox(height: 8),

          // Contador de resultados
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              children: [
                Text(
                  '${_relacionesFiltradas.length} cliente(s) en cartera',
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.grey[600],
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),

          // Lista de relaciones
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _relacionesFiltradas.isEmpty
                    ? _buildEmptyState()
                    : RefreshIndicator(
                        onRefresh: _loadRelaciones,
                        child: ListView.builder(
                          padding: const EdgeInsets.all(16),
                          itemCount: _relacionesFiltradas.length,
                          itemBuilder: (context, index) {
                            final relacion = _relacionesFiltradas[index];
                            return _buildRelacionCard(relacion);
                          },
                        ),
                      ),
          ),
        ],
      ),
      bottomNavigationBar: const BottomToolbar(),
    );
  }

  Widget _buildChipFilter({
    required String label,
    required String value,
    required List<String> options,
    required Function(String) onChanged,
  }) {
    return PopupMenuButton<String>(
      onSelected: onChanged,
      child: Chip(
        label: Text('$label: $value'),
        deleteIcon: const Icon(Icons.arrow_drop_down, size: 18),
        onDeleted: () {},
      ),
      itemBuilder: (context) => options.map((option) {
        return PopupMenuItem<String>(
          value: option,
          child: Text(option),
        );
      }).toList(),
    );
  }

  Widget _buildRelacionCard(Relacion relacion) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => RelacionDetailScreen(
                relacionId: relacion.id,
                agenteId: widget.agenteId,
              ),
            ),
          ).then((_) => _loadRelaciones()); // Recargar al volver
        },
        borderRadius: BorderRadius.circular(12),
        child: IntrinsicHeight(
          child: Row(
            children: [
              // Indicador de frecuencia
              FrecuenciaIndicator(frecuencia: relacion.frecuencia),
              // Contenido del card
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header con tipo y prioridad
              Row(
                children: [
                  // Icono de tipo
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: _parseColor(relacion.tipoRelacionColor).withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Icon(
                      _parseIcon(relacion.tipoRelacionIcono),
                      color: _parseColor(relacion.tipoRelacionColor),
                      size: 24,
                    ),
                  ),
                  const SizedBox(width: 12),

                  // Tipo y código
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          relacion.tipoRelacionNombre,
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: Colors.deepPurple,
                          ),
                        ),
                        Text(
                          relacion.codigoRelacion,
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.grey[600],
                          ),
                        ),
                      ],
                    ),
                  ),

                  // Chip de prioridad
                  if (relacion.prioridad != null)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: _getPrioridadColor(relacion.prioridad).withOpacity(0.1),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: _getPrioridadColor(relacion.prioridad),
                          width: 1.5,
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            _getPrioridadIcon(relacion.prioridad),
                            size: 16,
                            color: _getPrioridadColor(relacion.prioridad),
                          ),
                          const SizedBox(width: 4),
                          Text(
                            relacion.prioridad!,
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              color: _getPrioridadColor(relacion.prioridad),
                            ),
                          ),
                        ],
                      ),
                    ),
                ],
              ),

              const Divider(height: 24),

              // Cliente principal
              Row(
                children: [
                  Icon(Icons.person, size: 18, color: Colors.grey[600]),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      relacion.clientePrincipalNombre ?? 'Sin cliente',
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),

              // Información adicional
              const SizedBox(height: 12),
              Row(
                children: [
                  // Estado
                  _buildInfoChip(
                    icon: Icons.circle,
                    label: relacion.estado,
                    color: relacion.estado == 'Activo' ? Colors.green : Colors.grey,
                  ),
                  const SizedBox(width: 8),

                  // Frecuencia de visitas
                  if (relacion.frecuenciaVisitas != null)
                    _buildInfoChip(
                      icon: Icons.event_repeat,
                      label: relacion.frecuenciaVisitas!,
                      color: Colors.blue,
                    ),
                ],
              ),

              // Última interacción
              if (relacion.ultimaInteraccionFecha != null) ...[
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.amber.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.history, size: 16, color: Colors.amber),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          'Última interacción: ${relacion.ultimaInteraccionFecha!.toString().split('T')[0]}',
                          style: const TextStyle(fontSize: 12),
                        ),
                      ),
                    ],
                  ),
                ),
              ],

              // Observaciones
              if (relacion.observaciones != null && relacion.observaciones!.isNotEmpty) ...[
                const SizedBox(height: 12),
                Text(
                  relacion.observaciones!,
                  style: TextStyle(
                    fontSize: 13,
                    color: Colors.grey[700],
                    fontStyle: FontStyle.italic,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
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

  Widget _buildInfoChip({
    required IconData icon,
    required String label,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: color),
          const SizedBox(width: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              color: color,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.inbox_outlined,
            size: 80,
            color: Colors.grey[400],
          ),
          const SizedBox(height: 16),
          Text(
            _searchQuery.isEmpty && !_soloConPendientes
                ? 'No tienes relaciones asignadas'
                : 'No se encontraron relaciones',
            style: TextStyle(
              fontSize: 18,
              color: Colors.grey[600],
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            _searchQuery.isEmpty && !_soloConPendientes
                ? 'Las relaciones asignadas aparecerán aquí'
                : 'Intenta cambiar los filtros de búsqueda',
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey[500],
            ),
          ),
        ],
      ),
    );
  }

  // Helper para parsear color desde string hex
  Color _parseColor(String? colorHex) {
    if (colorHex == null || colorHex.isEmpty) {
      return Colors.deepPurple;
    }

    try {
      String hex = colorHex.replaceAll('#', '');
      if (hex.length == 6) {
        hex = 'FF$hex'; // Agregar alpha si no está presente
      }
      return Color(int.parse(hex, radix: 16));
    } catch (e) {
      return Colors.deepPurple;
    }
  }

  // Helper para parsear icono desde string de Material Icons
  IconData _parseIcon(String? iconName) {
    if (iconName == null || iconName.isEmpty) {
      return Icons.account_circle;
    }

    // Mapeo de iconos comunes
    final iconMap = {
      'account_circle': Icons.account_circle,
      'person': Icons.person,
      'business': Icons.business,
      'local_hospital': Icons.local_hospital,
      'medical_services': Icons.medical_services,
      'store': Icons.store,
      'local_pharmacy': Icons.local_pharmacy,
      'people': Icons.people,
      'groups': Icons.groups,
      'handshake': Icons.handshake,
      'folder': Icons.folder,
      'work': Icons.work,
    };

    return iconMap[iconName.toLowerCase()] ?? Icons.account_circle;
  }
}
