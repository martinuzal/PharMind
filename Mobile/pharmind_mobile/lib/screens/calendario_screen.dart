import 'package:flutter/material.dart';
import 'package:table_calendar/table_calendar.dart';
import '../models/cita.dart';
import '../services/cita_service.dart';
import 'cita_form_screen.dart';

class CalendarioScreen extends StatefulWidget {
  final String agenteId;

  const CalendarioScreen({
    super.key,
    required this.agenteId,
  });

  @override
  State<CalendarioScreen> createState() => _CalendarioScreenState();
}

class _CalendarioScreenState extends State<CalendarioScreen> with SingleTickerProviderStateMixin {
  final CitaService _citaService = CitaService();
  late TabController _tabController;
  late DateTime _fechaSeleccionada;
  late DateTime _mesFocused;

  List<Cita> _todasLasCitas = [];
  List<Cita> _citasDelDia = [];
  bool _isLoading = false;

  CalendarFormat _calendarFormat = CalendarFormat.month;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _fechaSeleccionada = DateTime.now();
    _mesFocused = DateTime.now();
    _cargarCitasDelMes();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _cargarCitasDelMes() async {
    setState(() => _isLoading = true);

    try {
      final citas = await _citaService.getCitasMes(
        widget.agenteId,
        year: _mesFocused.year,
        month: _mesFocused.month,
      );

      setState(() {
        _todasLasCitas = citas;
        _actualizarCitasDelDia();
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error al cargar citas: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      setState(() => _isLoading = false);
    }
  }

  void _actualizarCitasDelDia() {
    _citasDelDia = _todasLasCitas.where((cita) {
      return _isSameDay(cita.fechaInicio, _fechaSeleccionada);
    }).toList()..sort((a, b) => a.fechaInicio.compareTo(b.fechaInicio));
  }

  List<Cita> _getCitasParaDia(DateTime day) {
    return _todasLasCitas.where((cita) {
      return _isSameDay(cita.fechaInicio, day);
    }).toList();
  }

  bool _isSameDay(DateTime? a, DateTime? b) {
    if (a == null || b == null) return false;
    return a.year == b.year && a.month == b.month && a.day == b.day;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Mi Calendario'),
        actions: [
          IconButton(
            icon: const Icon(Icons.today),
            onPressed: () {
              setState(() {
                _fechaSeleccionada = DateTime.now();
                _mesFocused = DateTime.now();
                _actualizarCitasDelDia();
              });
            },
            tooltip: 'Ir a Hoy',
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'Día', icon: Icon(Icons.view_day)),
            Tab(text: 'Semana', icon: Icon(Icons.view_week)),
            Tab(text: 'Mes', icon: Icon(Icons.calendar_month)),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildVistaDia(),
          _buildVistaSemana(),
          _buildVistaMes(),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _crearNuevaCita,
        child: const Icon(Icons.add),
        tooltip: 'Nueva Cita',
      ),
    );
  }

  // ==================== VISTA DÍA ====================
  Widget _buildVistaDia() {
    return Column(
      children: [
        // Selector de fecha
        Container(
          padding: const EdgeInsets.all(16),
          color: Colors.grey[100],
          child: Row(
            children: [
              IconButton(
                icon: const Icon(Icons.chevron_left),
                onPressed: () {
                  setState(() {
                    _fechaSeleccionada = _fechaSeleccionada.subtract(const Duration(days: 1));
                    _actualizarCitasDelDia();
                  });
                },
              ),
              Expanded(
                child: GestureDetector(
                  onTap: _seleccionarFecha,
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: Colors.grey[300]!),
                    ),
                    child: Column(
                      children: [
                        Text(
                          _formatDiaSemana(_fechaSeleccionada),
                          style: TextStyle(
                            fontSize: 14,
                            color: Colors.grey[600],
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          _formatFechaCompleta(_fechaSeleccionada),
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              IconButton(
                icon: const Icon(Icons.chevron_right),
                onPressed: () {
                  setState(() {
                    _fechaSeleccionada = _fechaSeleccionada.add(const Duration(days: 1));
                    _actualizarCitasDelDia();
                  });
                },
              ),
            ],
          ),
        ),
        // Lista de citas del día
        Expanded(
          child: _isLoading
              ? const Center(child: CircularProgressIndicator())
              : _citasDelDia.isEmpty
                  ? _buildEmptyState('No hay citas programadas para este día')
                  : RefreshIndicator(
                      onRefresh: _cargarCitasDelMes,
                      child: ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: _citasDelDia.length,
                        itemBuilder: (context, index) {
                          final cita = _citasDelDia[index];
                          return _buildCitaCard(cita);
                        },
                      ),
                    ),
        ),
      ],
    );
  }

  // ==================== VISTA SEMANA ====================
  Widget _buildVistaSemana() {
    // Calcular inicio y fin de la semana
    final inicioSemana = _fechaSeleccionada.subtract(Duration(days: _fechaSeleccionada.weekday - 1));
    final finSemana = inicioSemana.add(const Duration(days: 6));

    final citasSemana = _todasLasCitas.where((cita) {
      return !cita.fechaInicio.isBefore(inicioSemana) &&
             !cita.fechaInicio.isAfter(finSemana.add(const Duration(days: 1)));
    }).toList();

    return Column(
      children: [
        // Selector de semana
        Container(
          padding: const EdgeInsets.all(16),
          color: Colors.grey[100],
          child: Row(
            children: [
              IconButton(
                icon: const Icon(Icons.chevron_left),
                onPressed: () {
                  setState(() {
                    _fechaSeleccionada = _fechaSeleccionada.subtract(const Duration(days: 7));
                    _actualizarCitasDelDia();
                  });
                },
              ),
              Expanded(
                child: Text(
                  '${_formatFechaCorta(inicioSemana)} - ${_formatFechaCorta(finSemana)}',
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
              IconButton(
                icon: const Icon(Icons.chevron_right),
                onPressed: () {
                  setState(() {
                    _fechaSeleccionada = _fechaSeleccionada.add(const Duration(days: 7));
                    _actualizarCitasDelDia();
                  });
                },
              ),
            ],
          ),
        ),
        // Vista de días de la semana
        Expanded(
          child: _isLoading
              ? const Center(child: CircularProgressIndicator())
              : ListView.builder(
                  itemCount: 7,
                  itemBuilder: (context, index) {
                    final dia = inicioSemana.add(Duration(days: index));
                    final citasDelDia = _todasLasCitas.where((cita) {
                      return _isSameDay(cita.fechaInicio, dia);
                    }).toList()..sort((a, b) => a.fechaInicio.compareTo(b.fechaInicio));

                    return _buildDiaSemanaCard(dia, citasDelDia);
                  },
                ),
        ),
      ],
    );
  }

  Widget _buildDiaSemanaCard(DateTime dia, List<Cita> citas) {
    final esHoy = _isSameDay(dia, DateTime.now());
    final esDiaSeleccionado = _isSameDay(dia, _fechaSeleccionada);

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      color: esDiaSeleccionado ? Colors.blue[50] : null,
      child: ExpansionTile(
        leading: Container(
          width: 50,
          height: 50,
          decoration: BoxDecoration(
            color: esHoy ? Colors.blue : Colors.grey[200],
            shape: BoxShape.circle,
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                _formatDiaSemanaCorto(dia),
                style: TextStyle(
                  fontSize: 10,
                  color: esHoy ? Colors.white : Colors.grey[600],
                  fontWeight: FontWeight.bold,
                ),
              ),
              Text(
                '${dia.day}',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: esHoy ? Colors.white : Colors.black,
                ),
              ),
            ],
          ),
        ),
        title: Text(
          citas.isEmpty ? 'Sin citas' : '${citas.length} cita${citas.length > 1 ? 's' : ''}',
          style: const TextStyle(fontWeight: FontWeight.w500),
        ),
        children: citas.isEmpty
            ? [
                const Padding(
                  padding: EdgeInsets.all(16),
                  child: Text('No hay citas programadas'),
                ),
              ]
            : citas.map((cita) => _buildCitaListTile(cita)).toList(),
      ),
    );
  }

  // ==================== VISTA MES ====================
  Widget _buildVistaMes() {
    return Column(
      children: [
        // Calendario
        TableCalendar<Cita>(
          firstDay: DateTime.utc(2020, 1, 1),
          lastDay: DateTime.utc(2030, 12, 31),
          focusedDay: _mesFocused,
          calendarFormat: _calendarFormat,
          selectedDayPredicate: (day) => _isSameDay(_fechaSeleccionada, day),
          eventLoader: _getCitasParaDia,
          onDaySelected: (selectedDay, focusedDay) {
            setState(() {
              _fechaSeleccionada = selectedDay;
              _mesFocused = focusedDay;
              _actualizarCitasDelDia();
            });
          },
          onPageChanged: (focusedDay) {
            setState(() {
              _mesFocused = focusedDay;
            });
            _cargarCitasDelMes();
          },
          onFormatChanged: (format) {
            setState(() {
              _calendarFormat = format;
            });
          },
          calendarStyle: CalendarStyle(
            todayDecoration: BoxDecoration(
              color: Colors.blue[300],
              shape: BoxShape.circle,
            ),
            selectedDecoration: const BoxDecoration(
              color: Colors.blue,
              shape: BoxShape.circle,
            ),
            markerDecoration: const BoxDecoration(
              color: Colors.orange,
              shape: BoxShape.circle,
            ),
          ),
          headerStyle: const HeaderStyle(
            formatButtonVisible: true,
            titleCentered: true,
          ),
        ),
        const Divider(),
        // Citas del día seleccionado
        Expanded(
          child: _isLoading
              ? const Center(child: CircularProgressIndicator())
              : _citasDelDia.isEmpty
                  ? _buildEmptyState('Selecciona un día con citas')
                  : Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Padding(
                          padding: const EdgeInsets.all(16),
                          child: Text(
                            'Citas del ${_formatFechaCompleta(_fechaSeleccionada)}',
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                        Expanded(
                          child: ListView.builder(
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                            itemCount: _citasDelDia.length,
                            itemBuilder: (context, index) {
                              final cita = _citasDelDia[index];
                              return _buildCitaCard(cita);
                            },
                          ),
                        ),
                      ],
                    ),
        ),
      ],
    );
  }

  // ==================== WIDGETS REUTILIZABLES ====================
  Widget _buildCitaCard(Cita cita) {
    final Color estadoColor = _getEstadoColor(cita.estado);

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: () => _verDetalleCita(cita),
        borderRadius: BorderRadius.circular(12),
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            border: Border(
              left: BorderSide(color: estadoColor, width: 4),
            ),
          ),
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      cita.titulo,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: estadoColor.withAlpha(30),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      cita.estado,
                      style: TextStyle(
                        fontSize: 12,
                        color: estadoColor,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Icon(Icons.access_time, size: 16, color: Colors.grey[600]),
                  const SizedBox(width: 4),
                  Text(
                    '${_formatHora(cita.fechaInicio)} - ${_formatHora(cita.fechaFin)}',
                    style: TextStyle(fontSize: 14, color: Colors.grey[700]),
                  ),
                  const SizedBox(width: 16),
                  if (cita.duracionMinutos > 0) ...[
                    Icon(Icons.timelapse, size: 16, color: Colors.grey[600]),
                    const SizedBox(width: 4),
                    Text(
                      '${cita.duracionMinutos} min',
                      style: TextStyle(fontSize: 14, color: Colors.grey[700]),
                    ),
                  ],
                ],
              ),
              if (cita.descripcion != null && cita.descripcion!.isNotEmpty) ...[
                const SizedBox(height: 8),
                Text(
                  cita.descripcion!,
                  style: TextStyle(fontSize: 14, color: Colors.grey[600]),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
              if (cita.ubicacion != null) ...[
                const SizedBox(height: 8),
                Row(
                  children: [
                    Icon(Icons.location_on, size: 16, color: Colors.grey[600]),
                    const SizedBox(width: 4),
                    Expanded(
                      child: Text(
                        cita.ubicacion!,
                        style: TextStyle(fontSize: 14, color: Colors.grey[600]),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ],
              if (cita.clienteNombre != null) ...[
                const SizedBox(height: 8),
                Row(
                  children: [
                    Icon(Icons.person, size: 16, color: Colors.grey[600]),
                    const SizedBox(width: 4),
                    Text(
                      cita.clienteNombre!,
                      style: TextStyle(fontSize: 14, color: Colors.grey[600]),
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

  Widget _buildCitaListTile(Cita cita) {
    final Color estadoColor = _getEstadoColor(cita.estado);

    return ListTile(
      leading: Container(
        width: 4,
        height: 40,
        decoration: BoxDecoration(
          color: estadoColor,
          borderRadius: BorderRadius.circular(2),
        ),
      ),
      title: Text(cita.titulo),
      subtitle: Text('${_formatHora(cita.fechaInicio)} - ${_formatHora(cita.fechaFin)}'),
      trailing: Icon(Icons.chevron_right, color: Colors.grey[400]),
      onTap: () => _verDetalleCita(cita),
    );
  }

  Widget _buildEmptyState(String mensaje) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.event_busy, size: 64, color: Colors.grey[400]),
          const SizedBox(height: 16),
          Text(
            mensaje,
            style: TextStyle(fontSize: 16, color: Colors.grey[600]),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  // ==================== ACCIONES ====================
  void _crearNuevaCita() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => CitaFormScreen(
          agenteId: widget.agenteId,
          fechaInicial: _fechaSeleccionada,
        ),
      ),
    ).then((resultado) {
      if (resultado == true) {
        _cargarCitasDelMes();
      }
    });
  }

  void _verDetalleCita(Cita cita) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => CitaFormScreen(
          agenteId: widget.agenteId,
          cita: cita,
        ),
      ),
    ).then((resultado) {
      if (resultado == true) {
        _cargarCitasDelMes();
      }
    });
  }

  Future<void> _seleccionarFecha() async {
    final fecha = await showDatePicker(
      context: context,
      initialDate: _fechaSeleccionada,
      firstDate: DateTime(2020),
      lastDate: DateTime(2030),
    );

    if (fecha != null) {
      setState(() {
        _fechaSeleccionada = fecha;
        _mesFocused = fecha;
        _actualizarCitasDelDia();
      });
    }
  }

  // ==================== HELPERS ====================
  Color _getEstadoColor(String estado) {
    switch (estado.toLowerCase()) {
      case 'programada':
        return Colors.blue;
      case 'completada':
        return Colors.green;
      case 'cancelada':
        return Colors.red;
      case 'reprogramada':
        return Colors.orange;
      default:
        return Colors.grey;
    }
  }

  String _formatDiaSemana(DateTime fecha) {
    const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    return dias[fecha.weekday - 1];
  }

  String _formatDiaSemanaCorto(DateTime fecha) {
    const dias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    return dias[fecha.weekday - 1];
  }

  String _formatFechaCompleta(DateTime fecha) {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return '${fecha.day} de ${meses[fecha.month - 1]} de ${fecha.year}';
  }

  String _formatFechaCorta(DateTime fecha) {
    const meses = [
      'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
      'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
    ];
    return '${fecha.day} ${meses[fecha.month - 1]}';
  }

  String _formatHora(DateTime fecha) {
    return '${fecha.hour.toString().padLeft(2, '0')}:${fecha.minute.toString().padLeft(2, '0')}';
  }
}
