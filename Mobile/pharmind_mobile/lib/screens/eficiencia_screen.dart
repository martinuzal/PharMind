import 'package:flutter/material.dart';
import '../models/eficiencia.dart';
import '../services/eficiencia_service.dart';
import 'package:intl/intl.dart';

class EficienciaScreen extends StatefulWidget {
  const EficienciaScreen({super.key});

  @override
  State<EficienciaScreen> createState() => _EficienciaScreenState();
}

class _EficienciaScreenState extends State<EficienciaScreen> {
  final EficienciaService _eficienciaService = EficienciaService();
  ResumenEficiencia? _resumen;
  List<ZonaGeografica> _zonas = [];
  bool _isLoading = true;
  String _vistaActual = 'mapa'; // 'mapa' o 'lista'

  @override
  void initState() {
    super.initState();
    _cargarResumen();
  }

  Future<void> _cargarResumen() async {
    setState(() => _isLoading = true);
    try {
      final resumen = await _eficienciaService.obtenerResumen();
      final zonas = _eficienciaService.obtenerZonasGeograficas(resumen.tareas);
      setState(() {
        _resumen = resumen;
        _zonas = zonas;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Error al cargar datos de eficiencia'),
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
        title: const Text('Eficiencia'),
        backgroundColor: Colors.teal[700],
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: Icon(_vistaActual == 'mapa' ? Icons.list : Icons.map),
            onPressed: () {
              setState(() {
                _vistaActual = _vistaActual == 'mapa' ? 'lista' : 'mapa';
              });
            },
            tooltip: _vistaActual == 'mapa' ? 'Ver lista' : 'Ver mapa',
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
                    // Resumen de eficiencia
                    _buildResumenCard(),
                    const SizedBox(height: 20),

                    // Estadísticas rápidas
                    _buildEstadisticasRow(),
                    const SizedBox(height: 20),

                    // Vista principal (mapa o lista)
                    if (_vistaActual == 'mapa')
                      _buildMapaDistribucion()
                    else
                      _buildListaTareas(),
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
              Colors.teal.shade400,
              Colors.teal.shade600,
            ],
          ),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Column(
          children: [
            const Text(
              'Resumen de Eficiencia',
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
                  'Tareas',
                  '${_resumen?.totalTareas ?? 0}',
                  Icons.task_alt,
                ),
                _buildResumenItem(
                  'Completadas',
                  _resumen?.porcentajeCompletado ?? '0%',
                  Icons.check_circle,
                ),
                _buildResumenItem(
                  'Distancia',
                  _resumen?.distanciaTotalFormateada ?? '0 km',
                  Icons.route,
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

  Widget _buildEstadisticasRow() {
    return Row(
      children: [
        Expanded(
          child: _buildEstadisticaCard(
            'Pendientes',
            '${_resumen?.tareasPendientes ?? 0}',
            Colors.orange,
            Icons.pending_actions,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _buildEstadisticaCard(
            'En Progreso',
            '${_resumen?.tareasEnProgreso ?? 0}',
            Colors.blue,
            Icons.hourglass_empty,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _buildEstadisticaCard(
            'Tiempo',
            _resumen?.tiempoTotalFormateado ?? '0 min',
            Colors.purple,
            Icons.access_time,
          ),
        ),
      ],
    );
  }

  Widget _buildEstadisticaCard(
      String label, String value, Color color, IconData icon) {
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          children: [
            Icon(icon, color: color, size: 24),
            const SizedBox(height: 8),
            Text(
              value,
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: const TextStyle(fontSize: 11),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMapaDistribucion() {
    if (_resumen == null || _resumen!.tareas.isEmpty) {
      return const Center(
        child: Text('No hay tareas para mostrar'),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Distribución Geográfica',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),
        // Mapa simulado con distribución visual
        Card(
          elevation: 2,
          child: Container(
            height: 400,
            padding: const EdgeInsets.all(16),
            child: Stack(
              children: [
                // Fondo del mapa
                Container(
                  decoration: BoxDecoration(
                    color: Colors.grey[200],
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: CustomPaint(
                    painter: MapPainter(),
                    size: Size.infinite,
                  ),
                ),
                // Marcadores de tareas
                ..._buildMarcadoresTareas(),
              ],
            ),
          ),
        ),
        const SizedBox(height: 16),
        // Leyenda
        _buildLeyenda(),
        const SizedBox(height: 16),
        // Lista de zonas
        _buildZonasInfo(),
      ],
    );
  }

  List<Widget> _buildMarcadoresTareas() {
    if (_resumen == null) return [];

    // Normalizar coordenadas para el contenedor
    final tareas = _resumen!.tareas;
    final minLat = tareas.map((t) => t.latitud).reduce((a, b) => a < b ? a : b);
    final maxLat = tareas.map((t) => t.latitud).reduce((a, b) => a > b ? a : b);
    final minLon = tareas.map((t) => t.longitud).reduce((a, b) => a < b ? a : b);
    final maxLon = tareas.map((t) => t.longitud).reduce((a, b) => a > b ? a : b);

    final latRange = maxLat - minLat;
    final lonRange = maxLon - minLon;

    return tareas.map((tarea) {
      // Normalizar a 0-1
      final normalizedLat = latRange != 0 ? (tarea.latitud - minLat) / latRange : 0.5;
      final normalizedLon = lonRange != 0 ? (tarea.longitud - minLon) / lonRange : 0.5;

      // Convertir a posición en el contenedor (con márgenes)
      final left = normalizedLon * 0.85 + 0.075;
      final top = (1 - normalizedLat) * 0.85 + 0.075; // Invertir Y

      Color color;
      switch (tarea.estado) {
        case 'completada':
          color = Colors.green;
          break;
        case 'en_progreso':
          color = Colors.blue;
          break;
        default:
          color = Colors.orange;
      }

      return Positioned(
        left: left * 368, // ancho del contenedor - padding
        top: top * 368, // alto del contenedor - padding
        child: GestureDetector(
          onTap: () => _mostrarDetallesTarea(tarea),
          child: Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              color: color,
              shape: BoxShape.circle,
              border: Border.all(color: Colors.white, width: 2),
              boxShadow: [
                BoxShadow(
                  color: color.withOpacity(0.5),
                  blurRadius: 4,
                  spreadRadius: 1,
                ),
              ],
            ),
            child: Center(
              child: Icon(
                tarea.tipo == 'visita'
                    ? Icons.place
                    : tarea.tipo == 'llamada'
                        ? Icons.phone
                        : tarea.tipo == 'reunion'
                            ? Icons.people
                            : Icons.star,
                color: Colors.white,
                size: 16,
              ),
            ),
          ),
        ),
      );
    }).toList();
  }

  Widget _buildLeyenda() {
    return Card(
      elevation: 1,
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Leyenda',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
            ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 16,
              runSpacing: 8,
              children: [
                _buildLeyendaItem(Colors.green, 'Completada'),
                _buildLeyendaItem(Colors.blue, 'En Progreso'),
                _buildLeyendaItem(Colors.orange, 'Pendiente'),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLeyendaItem(Color color, String label) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 16,
          height: 16,
          decoration: BoxDecoration(
            color: color,
            shape: BoxShape.circle,
          ),
        ),
        const SizedBox(width: 6),
        Text(label, style: const TextStyle(fontSize: 12)),
      ],
    );
  }

  Widget _buildZonasInfo() {
    if (_zonas.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Zonas Identificadas',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),
        ..._zonas.map((zona) => Card(
              margin: const EdgeInsets.only(bottom: 8),
              child: ListTile(
                leading: CircleAvatar(
                  backgroundColor: Colors.teal,
                  child: Text(
                    '${zona.cantidadTareas}',
                    style: const TextStyle(color: Colors.white),
                  ),
                ),
                title: Text(zona.nombre),
                subtitle: Text('${zona.cantidadTareas} tareas en esta zona'),
                trailing: const Icon(Icons.chevron_right),
              ),
            )),
      ],
    );
  }

  Widget _buildListaTareas() {
    if (_resumen == null || _resumen!.tareas.isEmpty) {
      return const Center(
        child: Text('No hay tareas disponibles'),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Lista de Tareas',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),
        ListView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: _resumen!.tareas.length,
          itemBuilder: (context, index) {
            final tarea = _resumen!.tareas[index];
            return _buildTareaCard(tarea);
          },
        ),
      ],
    );
  }

  Widget _buildTareaCard(TareaGeo tarea) {
    Color estadoColor;
    switch (tarea.estado) {
      case 'completada':
        estadoColor = Colors.green;
        break;
      case 'en_progreso':
        estadoColor = Colors.blue;
        break;
      default:
        estadoColor = Colors.orange;
    }

    IconData tipoIcon;
    switch (tarea.tipo) {
      case 'visita':
        tipoIcon = Icons.place;
        break;
      case 'llamada':
        tipoIcon = Icons.phone;
        break;
      case 'reunion':
        tipoIcon = Icons.people;
        break;
      default:
        tipoIcon = Icons.assignment;
    }

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 2,
      child: InkWell(
        onTap: () => _mostrarDetallesTarea(tarea),
        borderRadius: BorderRadius.circular(4),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Icon(tipoIcon, color: Colors.teal, size: 24),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          tarea.titulo,
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 16,
                          ),
                        ),
                        if (tarea.clienteNombre != null)
                          Text(
                            tarea.clienteNombre!,
                            style: TextStyle(
                              fontSize: 13,
                              color: Colors.grey[600],
                            ),
                          ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: estadoColor.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: estadoColor, width: 1),
                    ),
                    child: Text(
                      tarea.estadoTexto,
                      style: TextStyle(
                        color: estadoColor,
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Icon(Icons.calendar_today, size: 14, color: Colors.grey[600]),
                  const SizedBox(width: 4),
                  Text(
                    DateFormat('dd MMM yyyy').format(tarea.fecha),
                    style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                  ),
                  const SizedBox(width: 16),
                  if (tarea.duracionMinutos != null) ...[
                    Icon(Icons.access_time, size: 14, color: Colors.grey[600]),
                    const SizedBox(width: 4),
                    Text(
                      '${tarea.duracionMinutos} min',
                      style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                    ),
                  ],
                ],
              ),
              if (tarea.direccion != null) ...[
                const SizedBox(height: 4),
                Row(
                  children: [
                    Icon(Icons.location_on, size: 14, color: Colors.grey[600]),
                    const SizedBox(width: 4),
                    Expanded(
                      child: Text(
                        tarea.direccion!,
                        style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                      ),
                    ),
                  ],
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  void _mostrarDetallesTarea(TareaGeo tarea) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        Color estadoColor;
        switch (tarea.estado) {
          case 'completada':
            estadoColor = Colors.green;
            break;
          case 'en_progreso':
            estadoColor = Colors.blue;
            break;
          default:
            estadoColor = Colors.orange;
        }

        return DraggableScrollableSheet(
          initialChildSize: 0.6,
          minChildSize: 0.4,
          maxChildSize: 0.9,
          expand: false,
          builder: (context, scrollController) {
            return Padding(
              padding: const EdgeInsets.all(20),
              child: ListView(
                controller: scrollController,
                children: [
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
                  Text(
                    tarea.titulo,
                    style: const TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: estadoColor.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: estadoColor, width: 1.5),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.circle, size: 8, color: estadoColor),
                        const SizedBox(width: 6),
                        Text(
                          tarea.estadoTexto,
                          style: TextStyle(
                            color: estadoColor,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),
                  _buildDetalle(Icons.description, 'Descripción', tarea.descripcion),
                  if (tarea.clienteNombre != null)
                    _buildDetalle(Icons.business, 'Cliente', tarea.clienteNombre!),
                  _buildDetalle(Icons.category, 'Tipo', tarea.tipoTexto),
                  _buildDetalle(
                    Icons.calendar_today,
                    'Fecha',
                    DateFormat('EEEE, d MMMM yyyy').format(tarea.fecha),
                  ),
                  if (tarea.duracionMinutos != null)
                    _buildDetalle(Icons.access_time, 'Duración',
                        '${tarea.duracionMinutos} minutos'),
                  if (tarea.direccion != null)
                    _buildDetalle(Icons.location_on, 'Dirección', tarea.direccion!),
                  _buildDetalle(Icons.pin_drop, 'Coordenadas',
                      '${tarea.latitud.toStringAsFixed(6)}, ${tarea.longitud.toStringAsFixed(6)}'),
                ],
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildDetalle(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 20, color: Colors.teal),
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
                    fontSize: 15,
                    fontWeight: FontWeight.w400,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// Painter personalizado para dibujar el fondo del mapa
class MapPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.grey.shade300
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1;

    // Dibujar grid
    const divisions = 8;
    for (int i = 0; i <= divisions; i++) {
      final x = (size.width / divisions) * i;
      final y = (size.height / divisions) * i;
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), paint);
      canvas.drawLine(Offset(0, y), Offset(size.width, y), paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
