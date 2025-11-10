import 'package:flutter/material.dart';
import '../models/gasto.dart';
import '../services/gastos_service.dart';
import 'package:intl/intl.dart';

class GastosScreen extends StatefulWidget {
  const GastosScreen({super.key});

  @override
  State<GastosScreen> createState() => _GastosScreenState();
}

class _GastosScreenState extends State<GastosScreen> {
  final GastosService _gastosService = GastosService();
  ResumenGastos? _resumen;
  bool _isLoading = true;
  PeriodoGastos _periodoSeleccionado = PeriodoGastos.mesActual();
  String _filtroEstado = 'todos';

  @override
  void initState() {
    super.initState();
    _cargarResumen();
  }

  Future<void> _cargarResumen() async {
    setState(() => _isLoading = true);
    try {
      final resumen = await _gastosService.obtenerResumen(
        periodo: _periodoSeleccionado,
      );
      setState(() {
        _resumen = resumen;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Error al cargar gastos'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Rendición de Gastos'),
        backgroundColor: Colors.orange[700],
        foregroundColor: Colors.white,
        actions: [
          PopupMenuButton<String>(
            onSelected: (value) {
              setState(() {
                switch (value) {
                  case 'mes_actual':
                    _periodoSeleccionado = PeriodoGastos.mesActual();
                    break;
                  case 'mes_anterior':
                    _periodoSeleccionado = PeriodoGastos.mesAnterior();
                    break;
                  case 'ultimos_30':
                    _periodoSeleccionado = PeriodoGastos.ultimos30Dias();
                    break;
                }
              });
              _cargarResumen();
            },
            itemBuilder: (context) => [
              const PopupMenuItem(
                value: 'mes_actual',
                child: Text('Mes Actual'),
              ),
              const PopupMenuItem(
                value: 'mes_anterior',
                child: Text('Mes Anterior'),
              ),
              const PopupMenuItem(
                value: 'ultimos_30',
                child: Text('Últimos 30 días'),
              ),
            ],
            icon: const Icon(Icons.date_range),
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _cargarResumen,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Período seleccionado
                    Text(
                      _periodoSeleccionado.nombre,
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.grey[600],
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: 8),

                    // Resumen general
                    _buildResumenCard(),
                    const SizedBox(height: 20),

                    // Filtro por estado
                    _buildFiltroEstado(),
                    const SizedBox(height: 20),

                    // Lista de gastos
                    _buildListaGastos(),
                  ],
                ),
              ),
            ),
      floatingActionButton: FloatingActionButton(
        onPressed: _mostrarFormularioGasto,
        backgroundColor: Colors.orange[700],
        child: const Icon(Icons.add, color: Colors.white),
      ),
    );
  }

  Widget _buildResumenCard() {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Colors.orange.shade400,
              Colors.orange.shade600,
            ],
          ),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Column(
          children: [
            const Text(
              'Resumen de Gastos',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildResumenItem(
                  'Total',
                  _resumen?.totalGastosFormateado ?? '\$0.00',
                  Icons.attach_money,
                  Colors.white,
                ),
                _buildResumenItem(
                  'Pendiente',
                  _resumen?.totalPendienteFormateado ?? '\$0.00',
                  Icons.pending,
                  Colors.amber.shade100,
                ),
                _buildResumenItem(
                  'Aprobado',
                  _resumen?.totalAprobadoFormateado ?? '\$0.00',
                  Icons.check_circle,
                  Colors.green.shade100,
                ),
              ],
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.2),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Total de gastos: ${_resumen?.cantidadGastos ?? 0}',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  Text(
                    'Pendientes: ${_resumen?.cantidadPendientes ?? 0}',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildResumenItem(
      String label, String value, IconData icon, Color iconColor) {
    return Column(
      children: [
        Icon(icon, color: iconColor, size: 32),
        const SizedBox(height: 8),
        Text(
          label,
          style: const TextStyle(
            color: Colors.white70,
            fontSize: 12,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 14,
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }

  Widget _buildFiltroEstado() {
    return Row(
      children: [
        Expanded(
          child: _buildChipFiltro('Todos', 'todos', Colors.grey),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: _buildChipFiltro('Pendiente', 'pendiente', Colors.amber),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: _buildChipFiltro('Aprobado', 'aprobado', Colors.green),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: _buildChipFiltro('Rechazado', 'rechazado', Colors.red),
        ),
      ],
    );
  }

  Widget _buildChipFiltro(String label, String value, Color color) {
    final isSelected = _filtroEstado == value;
    return InkWell(
      onTap: () {
        setState(() {
          _filtroEstado = value;
        });
      },
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? color.withOpacity(0.2) : Colors.grey[100],
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: isSelected ? color : Colors.grey.shade300,
            width: 2,
          ),
        ),
        child: Center(
          child: Text(
            label,
            style: TextStyle(
              color: isSelected ? color : Colors.grey[600],
              fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
              fontSize: 12,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildListaGastos() {
    final gastos = _resumen?.gastos ?? [];
    final gastosFiltrados = _filtroEstado == 'todos'
        ? gastos
        : gastos.where((g) => g.estado == _filtroEstado).toList();

    if (gastosFiltrados.isEmpty) {
      return const Center(
        child: Padding(
          padding: EdgeInsets.all(32.0),
          child: Text('No hay gastos para mostrar'),
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Gastos (${gastosFiltrados.length})',
          style: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),
        ListView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: gastosFiltrados.length,
          itemBuilder: (context, index) {
            final gasto = gastosFiltrados[index];
            return _buildGastoCard(gasto);
          },
        ),
      ],
    );
  }

  Widget _buildGastoCard(Gasto gasto) {
    Color estadoColor;
    IconData estadoIcon;
    switch (gasto.estado) {
      case 'aprobado':
        estadoColor = Colors.green;
        estadoIcon = Icons.check_circle;
        break;
      case 'rechazado':
        estadoColor = Colors.red;
        estadoIcon = Icons.cancel;
        break;
      default:
        estadoColor = Colors.amber;
        estadoIcon = Icons.pending;
    }

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: InkWell(
        onTap: () => _mostrarDetalleGasto(gasto),
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          gasto.concepto,
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          gasto.categoriaTexto,
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.grey[600],
                          ),
                        ),
                      ],
                    ),
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        gasto.montoFormateado,
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Colors.orange[700],
                        ),
                      ),
                      const SizedBox(height: 4),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: estadoColor.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: estadoColor, width: 1),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(estadoIcon, size: 14, color: estadoColor),
                            const SizedBox(width: 4),
                            Text(
                              gasto.estadoTexto,
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                color: estadoColor,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Icon(Icons.calendar_today, size: 14, color: Colors.grey[600]),
                  const SizedBox(width: 4),
                  Text(
                    DateFormat('dd/MM/yyyy').format(gasto.fecha),
                    style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                  ),
                  const SizedBox(width: 16),
                  Icon(Icons.attach_file, size: 14, color: Colors.grey[600]),
                  const SizedBox(width: 4),
                  Text(
                    '${gasto.comprobantes.length} comprobante(s)',
                    style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _mostrarDetalleGasto(Gasto gasto) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.7,
        minChildSize: 0.5,
        maxChildSize: 0.95,
        builder: (context, scrollController) => Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
          ),
          child: Column(
            children: [
              Container(
                margin: const EdgeInsets.symmetric(vertical: 12),
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.grey[300],
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              Expanded(
                child: ListView(
                  controller: scrollController,
                  padding: const EdgeInsets.all(24),
                  children: [
                    Text(
                      gasto.concepto,
                      style: const TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 16),
                    _buildDetalleRow(
                      Icons.attach_money,
                      'Monto',
                      gasto.montoFormateado,
                      Colors.orange,
                    ),
                    _buildDetalleRow(
                      Icons.category,
                      'Categoría',
                      gasto.categoriaTexto,
                      Colors.blue,
                    ),
                    _buildDetalleRow(
                      Icons.calendar_today,
                      'Fecha',
                      DateFormat('dd/MM/yyyy').format(gasto.fecha),
                      Colors.purple,
                    ),
                    _buildDetalleRow(
                      Icons.info,
                      'Estado',
                      gasto.estadoTexto,
                      gasto.estado == 'aprobado'
                          ? Colors.green
                          : gasto.estado == 'rechazado'
                              ? Colors.red
                              : Colors.amber,
                    ),
                    const SizedBox(height: 16),
                    const Text(
                      'Descripción',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      gasto.descripcion,
                      style: TextStyle(color: Colors.grey[700]),
                    ),
                    if (gasto.observaciones != null) ...[
                      const SizedBox(height: 16),
                      const Text(
                        'Observaciones',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        gasto.observaciones!,
                        style: TextStyle(color: Colors.grey[700]),
                      ),
                    ],
                    const SizedBox(height: 16),
                    const Text(
                      'Comprobantes',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    ...gasto.comprobantes.map((comprobante) => Card(
                          margin: const EdgeInsets.only(bottom: 8),
                          child: ListTile(
                            leading: const Icon(Icons.receipt, color: Colors.orange),
                            title: Text(comprobante),
                            trailing: const Icon(Icons.chevron_right),
                            onTap: () {
                              // TODO: Abrir visor de imagen
                            },
                          ),
                        )),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDetalleRow(
      IconData icon, String label, String value, Color color) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, size: 20, color: color),
          ),
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
                const SizedBox(height: 2),
                Text(
                  value,
                  style: const TextStyle(
                    fontSize: 16,
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

  void _mostrarFormularioGasto() {
    // TODO: Implementar formulario completo con image_picker
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Formulario de nuevo gasto - Próximamente'),
        backgroundColor: Colors.orange,
      ),
    );
  }
}
