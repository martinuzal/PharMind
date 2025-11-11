import 'package:flutter/material.dart';
import '../models/inventario_agente.dart';
import '../services/producto_service.dart';

class InventarioScreen extends StatefulWidget {
  final String agenteId;

  const InventarioScreen({
    super.key,
    required this.agenteId,
  });

  @override
  State<InventarioScreen> createState() => _InventarioScreenState();
}

class _InventarioScreenState extends State<InventarioScreen> with SingleTickerProviderStateMixin {
  final ProductoService _productoService = ProductoService();
  List<InventarioAgente> _inventario = [];
  List<InventarioAgente> _inventarioFiltrado = [];
  bool _isLoading = false;
  late TabController _tabController;

  int get _todosCount => _inventario.length;
  int get _stockBajoCount => _inventario.where((i) => i.stockBajo).length;
  int get _porVencerCount => _inventario.where((i) => i.estaPorVencer && !i.estaVencido).length;
  int get _vencidosCount => _inventario.where((i) => i.estaVencido).length;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
    _tabController.addListener(_onTabChanged);
    _cargarInventario();
  }

  @override
  void dispose() {
    _tabController.removeListener(_onTabChanged);
    _tabController.dispose();
    super.dispose();
  }

  void _onTabChanged() {
    if (_tabController.indexIsChanging) {
      _aplicarFiltro();
    }
  }

  Future<void> _cargarInventario() async {
    setState(() => _isLoading = true);

    try {
      final inventario = await _productoService.getInventarioAgente(widget.agenteId);
      setState(() {
        _inventario = inventario;
        _aplicarFiltro();
      });
    } catch (e) {
      print('⚠️ Error al cargar inventario: $e');

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error al cargar inventario: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      setState(() => _isLoading = false);
    }
  }

  void _aplicarFiltro() {
    var inventario = List<InventarioAgente>.from(_inventario);

    switch (_tabController.index) {
      case 0: // Todos
        // No filtrar
        break;
      case 1: // Stock Bajo
        inventario = inventario.where((i) => i.stockBajo).toList();
        break;
      case 2: // Por Vencer
        inventario = inventario.where((i) => i.estaPorVencer && !i.estaVencido).toList();
        break;
      case 3: // Vencidos
        inventario = inventario.where((i) => i.estaVencido).toList();
        break;
    }

    setState(() => _inventarioFiltrado = inventario);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Mi Inventario'),
        bottom: TabBar(
          controller: _tabController,
          tabs: [
            Tab(
              text: 'Todos',
              icon: Badge(
                label: Text('$_todosCount'),
                child: const Icon(Icons.inventory),
              ),
            ),
            Tab(
              text: 'Stock Bajo',
              icon: Badge(
                label: Text('$_stockBajoCount'),
                backgroundColor: Colors.orange,
                child: const Icon(Icons.warning),
              ),
            ),
            Tab(
              text: 'Por Vencer',
              icon: Badge(
                label: Text('$_porVencerCount'),
                backgroundColor: Colors.amber,
                child: const Icon(Icons.schedule),
              ),
            ),
            Tab(
              text: 'Vencidos',
              icon: Badge(
                label: Text('$_vencidosCount'),
                backgroundColor: Colors.red,
                child: const Icon(Icons.dangerous),
              ),
            ),
          ],
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _inventarioFiltrado.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.inbox_outlined,
                        size: 64,
                        color: Colors.grey[400],
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'No hay productos en el inventario',
                        style: TextStyle(
                          fontSize: 16,
                          color: Colors.grey[600],
                        ),
                      ),
                    ],
                  ),
                )
              : RefreshIndicator(
                  onRefresh: _cargarInventario,
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _inventarioFiltrado.length,
                    itemBuilder: (context, index) {
                      final item = _inventarioFiltrado[index];
                      return _buildInventarioCard(item);
                    },
                  ),
                ),
    );
  }

  Widget _buildInventarioCard(InventarioAgente item) {
    Color statusColor = Colors.green;
    IconData statusIcon = Icons.check_circle;
    String statusText = 'OK';

    if (item.estaVencido) {
      statusColor = Colors.red;
      statusIcon = Icons.dangerous;
      statusText = 'VENCIDO';
    } else if (item.estaPorVencer) {
      statusColor = Colors.amber;
      statusIcon = Icons.schedule;
      statusText = 'POR VENCER';
    } else if (item.stockBajo) {
      statusColor = Colors.orange;
      statusIcon = Icons.warning;
      statusText = 'STOCK BAJO';
    }

    final porcentajeDisponible = (item.cantidadInicial ?? 0) > 0
        ? (item.cantidadDisponible / (item.cantidadInicial ?? 1) * 100).round()
        : 0;

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: () => _mostrarDetalleInventario(item),
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Icono
                  Container(
                    width: 50,
                    height: 50,
                    decoration: BoxDecoration(
                      color: statusColor.withAlpha(30),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Icon(
                      Icons.medication,
                      size: 28,
                      color: statusColor,
                    ),
                  ),
                  const SizedBox(width: 12),
                  // Información
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          item.producto?.nombre ?? 'Producto desconocido',
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        if (item.loteActual != null)
                          Text(
                            'Lote: ${item.loteActual}',
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
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: statusColor.withAlpha(30),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(statusIcon, size: 14, color: statusColor),
                        const SizedBox(width: 4),
                        Text(
                          statusText,
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: statusColor,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              // Barra de progreso
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Disponible: ${item.cantidadDisponible} unidades',
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      Text(
                        '$porcentajeDisponible%',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: statusColor,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(4),
                    child: LinearProgressIndicator(
                      value: porcentajeDisponible / 100,
                      backgroundColor: Colors.grey[200],
                      valueColor: AlwaysStoppedAnimation<Color>(statusColor),
                      minHeight: 8,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              // Información adicional
              Row(
                children: [
                  Expanded(
                    child: _buildInfoChip(
                      Icons.inventory_2,
                      'Inicial: ${item.cantidadInicial}',
                      Colors.blue,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: _buildInfoChip(
                      Icons.local_shipping,
                      'Entregado: ${item.cantidadEntregada}',
                      Colors.green,
                    ),
                  ),
                ],
              ),
              if (item.fechaVencimiento != null) ...[
                const SizedBox(height: 8),
                _buildInfoChip(
                  Icons.calendar_today,
                  'Vence: ${_formatFecha(item.fechaVencimiento!)}',
                  item.estaVencido ? Colors.red : (item.estaPorVencer ? Colors.amber : Colors.grey),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInfoChip(IconData icon, String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
      decoration: BoxDecoration(
        color: color.withAlpha(30),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: color),
          const SizedBox(width: 4),
          Flexible(
            child: Text(
              label,
              style: TextStyle(
                fontSize: 12,
                color: color,
                fontWeight: FontWeight.w500,
              ),
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }

  void _mostrarDetalleInventario(InventarioAgente item) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return DraggableScrollableSheet(
          initialChildSize: 0.6,
          minChildSize: 0.4,
          maxChildSize: 0.9,
          expand: false,
          builder: (context, scrollController) {
            return SingleChildScrollView(
              controller: scrollController,
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Handle
                    Center(
                      child: Container(
                        width: 40,
                        height: 4,
                        decoration: BoxDecoration(
                          color: Colors.grey[300],
                          borderRadius: BorderRadius.circular(2),
                        ),
                      ),
                    ),
                    const SizedBox(height: 20),
                    // Nombre
                    Text(
                      item.producto?.nombre ?? 'Producto desconocido',
                      style: const TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 20),
                    // Estadísticas
                    Row(
                      children: [
                        Expanded(
                          child: _buildStatCard(
                            'Inicial',
                            item.cantidadInicial.toString(),
                            Icons.inventory_2,
                            Colors.blue,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: _buildStatCard(
                            'Disponible',
                            item.cantidadDisponible.toString(),
                            Icons.check_circle,
                            Colors.green,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: _buildStatCard(
                            'Entregado',
                            item.cantidadEntregada.toString(),
                            Icons.local_shipping,
                            Colors.orange,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: _buildStatCard(
                            'Consumido',
                            '${(item.cantidadInicial ?? 0) - item.cantidadDisponible - item.cantidadEntregada}',
                            Icons.trending_down,
                            Colors.red,
                          ),
                        ),
                      ],
                    ),
                    const Divider(height: 32),
                    // Detalles
                    if (item.loteActual != null)
                      _buildDetalle('Lote Actual', item.loteActual!),
                    if (item.fechaVencimiento != null)
                      _buildDetalle(
                        'Fecha de Vencimiento',
                        _formatFecha(item.fechaVencimiento!),
                      ),
                    if (item.fechaUltimaRecarga != null)
                      _buildDetalle(
                        'Última Recarga',
                        _formatFecha(item.fechaUltimaRecarga!),
                      ),
                    _buildDetalle(
                      'Fecha de Creación',
                      _formatFecha(item.fechaCreacion),
                    ),
                    // Alertas
                    if (item.estaVencido || item.estaPorVencer || item.stockBajo) ...[
                      const Divider(height: 32),
                      const Text(
                        'Alertas',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 12),
                      if (item.estaVencido)
                        _buildAlerta(
                          Icons.dangerous,
                          'Producto Vencido',
                          'Este producto ha superado su fecha de vencimiento',
                          Colors.red,
                        ),
                      if (item.estaPorVencer && !item.estaVencido)
                        _buildAlerta(
                          Icons.schedule,
                          'Por Vencer',
                          'Este producto vencerá pronto',
                          Colors.amber,
                        ),
                      if (item.stockBajo)
                        _buildAlerta(
                          Icons.warning,
                          'Stock Bajo',
                          'Quedan pocas unidades disponibles',
                          Colors.orange,
                        ),
                    ],
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildStatCard(String label, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withAlpha(30),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        children: [
          Icon(icon, size: 32, color: color),
          const SizedBox(height: 8),
          Text(
            value,
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              color: Colors.grey[700],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDetalle(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 150,
            child: Text(
              label,
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey[700],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAlerta(IconData icon, String titulo, String descripcion, Color color) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: color.withAlpha(30),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withAlpha(100)),
      ),
      child: Row(
        children: [
          Icon(icon, color: color, size: 24),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  titulo,
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: color,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  descripcion,
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey[700],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _formatFecha(DateTime fecha) {
    final meses = [
      'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
      'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
    ];
    return '${fecha.day} ${meses[fecha.month - 1]} ${fecha.year}';
  }
}
