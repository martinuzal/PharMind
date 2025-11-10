import 'package:flutter/material.dart';
import '../models/tiempo_utilizado.dart';
import '../services/tiempo_service.dart';
import 'package:intl/intl.dart';

class TiempoUtilizadoScreen extends StatefulWidget {
  const TiempoUtilizadoScreen({super.key});

  @override
  State<TiempoUtilizadoScreen> createState() => _TiempoUtilizadoScreenState();
}

class _TiempoUtilizadoScreenState extends State<TiempoUtilizadoScreen> {
  final TiempoService _tiempoService = TiempoService();
  ResumenTiempo? _resumen;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _cargarResumen();
  }

  Future<void> _cargarResumen() async {
    setState(() => _isLoading = true);
    try {
      final resumen = await _tiempoService.obtenerResumen();
      setState(() {
        _resumen = resumen;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Error al cargar estadísticas'),
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
        title: const Text('Tiempo Utilizado'),
        backgroundColor: Colors.purple[700],
        foregroundColor: Colors.white,
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
                    // Resumen general
                    _buildResumenCard(),
                    const SizedBox(height: 20),

                    // Gráfica de barras simple
                    _buildGraficaBarras(),
                    const SizedBox(height: 20),

                    // Historial
                    _buildHistorialSection(),
                  ],
                ),
              ),
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
              Colors.purple.shade400,
              Colors.purple.shade600,
            ],
          ),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Column(
          children: [
            const Text(
              'Resumen de Tiempo',
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
                  'Hoy',
                  _resumen?.formatearTiempo(_resumen!.totalMinutosHoy) ?? '0 min',
                  Icons.today,
                ),
                _buildResumenItem(
                  'Semana',
                  _resumen?.formatearTiempo(_resumen!.totalMinutosSemana) ?? '0 min',
                  Icons.calendar_view_week,
                ),
                _buildResumenItem(
                  'Mes',
                  _resumen?.formatearTiempo(_resumen!.totalMinutosMes) ?? '0 min',
                  Icons.calendar_month,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildResumenItem(String label, String value, IconData icon) {
    return Column(
      children: [
        Icon(icon, color: Colors.white, size: 32),
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
            fontSize: 16,
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }

  Widget _buildGraficaBarras() {
    final historial = _resumen?.historial ?? [];
    if (historial.isEmpty) return const SizedBox.shrink();

    // Tomar solo los últimos 7 días
    final ultimos7Dias = historial.take(7).toList();
    final maxMinutos = ultimos7Dias.map((r) => r.minutosTotal).reduce((a, b) => a > b ? a : b).toDouble();

    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Últimos 7 días',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            SizedBox(
              height: 200,
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.end,
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: ultimos7Dias.map((registro) {
                  final altura = maxMinutos > 0 ? (registro.minutosTotal / maxMinutos) * 180 : 0.0;
                  return _buildBarra(
                    DateFormat('EEE').format(registro.fecha),
                    altura,
                    registro.minutosTotal,
                  );
                }).toList(),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBarra(String dia, double altura, int minutos) {
    return Expanded(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 4),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.end,
          children: [
            Text(
              '$minutos',
              style: TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.bold,
                color: Colors.purple[700],
              ),
            ),
            const SizedBox(height: 4),
            Container(
              height: altura,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Colors.purple.shade300,
                    Colors.purple.shade600,
                  ],
                ),
                borderRadius: const BorderRadius.vertical(top: Radius.circular(8)),
              ),
            ),
            const SizedBox(height: 8),
            Text(
              dia,
              style: const TextStyle(fontSize: 11),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHistorialSection() {
    final historial = _resumen?.historial ?? [];
    if (historial.isEmpty) {
      return const Center(
        child: Text('No hay datos disponibles'),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Historial Detallado',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),
        ListView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: historial.length > 10 ? 10 : historial.length,
          itemBuilder: (context, index) {
            final registro = historial[index];
            return _buildHistorialItem(registro);
          },
        ),
      ],
    );
  }

  Widget _buildHistorialItem(TiempoUtilizado registro) {
    final esHoy = _esHoy(registro.fecha);

    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      elevation: esHoy ? 3 : 1,
      color: esHoy ? Colors.purple[50] : null,
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Icon(
                      Icons.calendar_today,
                      size: 16,
                      color: Colors.purple[700],
                    ),
                    const SizedBox(width: 8),
                    Text(
                      DateFormat('EEEE, d MMM yyyy').format(registro.fecha),
                      style: TextStyle(
                        fontWeight: esHoy ? FontWeight.bold : FontWeight.normal,
                        color: esHoy ? Colors.purple[700] : Colors.black87,
                      ),
                    ),
                  ],
                ),
                if (esHoy)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: Colors.purple[700],
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Text(
                      'HOY',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _buildDetalleItem(
                  Icons.contacts,
                  'Clientes',
                  '${registro.minutosEnClientes} min',
                  Colors.blue,
                ),
                _buildDetalleItem(
                  Icons.check_circle,
                  'Interacciones',
                  '${registro.minutosEnInteracciones} min',
                  Colors.amber,
                ),
                _buildDetalleItem(
                  Icons.people,
                  'Relaciones',
                  '${registro.minutosEnRelaciones} min',
                  Colors.green,
                ),
              ],
            ),
            const Divider(height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Total:',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  registro.tiempoTotalFormateado,
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                    color: Colors.purple[700],
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDetalleItem(IconData icon, String label, String value, Color color) {
    return Expanded(
      child: Column(
        children: [
          Icon(icon, color: color, size: 20),
          const SizedBox(height: 4),
          Text(
            label,
            style: const TextStyle(fontSize: 10),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 2),
          Text(
            value,
            style: TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 12,
              color: color,
            ),
          ),
        ],
      ),
    );
  }

  bool _esHoy(DateTime fecha) {
    final ahora = DateTime.now();
    return fecha.year == ahora.year &&
        fecha.month == ahora.month &&
        fecha.day == ahora.day;
  }
}
