import 'package:flutter/material.dart';
import '../models/cita.dart';
import '../services/cita_service.dart';

class CitaFormScreen extends StatefulWidget {
  final String agenteId;
  final Cita? cita; // null = crear, no-null = editar
  final DateTime? fechaInicial;

  const CitaFormScreen({
    super.key,
    required this.agenteId,
    this.cita,
    this.fechaInicial,
  });

  @override
  State<CitaFormScreen> createState() => _CitaFormScreenState();
}

class _CitaFormScreenState extends State<CitaFormScreen> {
  final _formKey = GlobalKey<FormState>();
  final CitaService _citaService = CitaService();

  late TextEditingController _tituloController;
  late TextEditingController _descripcionController;
  late TextEditingController _ubicacionController;
  late TextEditingController _notasController;

  late DateTime _fechaInicio;
  late DateTime _fechaFin;
  late TimeOfDay _horaInicio;
  late TimeOfDay _horaFin;

  String _tipoCita = 'Visita';
  String _estado = 'Programada';
  String _prioridad = 'Media';
  bool _todoElDia = false;
  bool _recordatorio = true;
  int _minutosAntes = 30;

  bool _isLoading = false;
  bool _isEditing = false;

  final List<String> _tiposCita = [
    'Visita',
    'Reunión',
    'Presentación',
    'Capacitación',
    'Congreso',
    'Otro'
  ];

  final List<String> _estados = [
    'Programada',
    'Completada',
    'Cancelada',
    'Reprogramada'
  ];

  final List<String> _prioridades = [
    'Alta',
    'Media',
    'Baja'
  ];

  @override
  void initState() {
    super.initState();
    _isEditing = widget.cita != null;

    // Inicializar controladores
    _tituloController = TextEditingController(text: widget.cita?.titulo ?? '');
    _descripcionController = TextEditingController(text: widget.cita?.descripcion ?? '');
    _ubicacionController = TextEditingController(text: widget.cita?.ubicacion ?? '');
    _notasController = TextEditingController(text: widget.cita?.notas ?? '');

    // Inicializar fechas y horas
    if (widget.cita != null) {
      _fechaInicio = widget.cita!.fechaInicio;
      _fechaFin = widget.cita!.fechaFin;
      _horaInicio = TimeOfDay.fromDateTime(widget.cita!.fechaInicio);
      _horaFin = TimeOfDay.fromDateTime(widget.cita!.fechaFin);
      _tipoCita = widget.cita!.tipoCita ?? 'Visita';
      _estado = widget.cita!.estado;
      _prioridad = widget.cita!.prioridad ?? 'Media';
      _todoElDia = widget.cita!.todoElDia;
      _recordatorio = widget.cita!.recordatorio;
      _minutosAntes = widget.cita!.minutosAntes;
    } else {
      final fechaBase = widget.fechaInicial ?? DateTime.now();
      _fechaInicio = DateTime(fechaBase.year, fechaBase.month, fechaBase.day, 9, 0);
      _fechaFin = _fechaInicio.add(const Duration(hours: 1));
      _horaInicio = const TimeOfDay(hour: 9, minute: 0);
      _horaFin = const TimeOfDay(hour: 10, minute: 0);
    }
  }

  @override
  void dispose() {
    _tituloController.dispose();
    _descripcionController.dispose();
    _ubicacionController.dispose();
    _notasController.dispose();
    super.dispose();
  }

  Future<void> _guardarCita() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    setState(() => _isLoading = true);

    try {
      // Combinar fecha y hora
      final fechaInicioFinal = DateTime(
        _fechaInicio.year,
        _fechaInicio.month,
        _fechaInicio.day,
        _todoElDia ? 0 : _horaInicio.hour,
        _todoElDia ? 0 : _horaInicio.minute,
      );

      final fechaFinFinal = DateTime(
        _fechaFin.year,
        _fechaFin.month,
        _fechaFin.day,
        _todoElDia ? 23 : _horaFin.hour,
        _todoElDia ? 59 : _horaFin.minute,
      );

      final citaData = Cita(
        id: widget.cita?.id ?? '',
        codigoCita: widget.cita?.codigoCita ?? '',
        agenteId: widget.agenteId,
        titulo: _tituloController.text,
        descripcion: _descripcionController.text.isEmpty ? null : _descripcionController.text,
        fechaInicio: fechaInicioFinal,
        fechaFin: fechaFinFinal,
        todoElDia: _todoElDia,
        tipoCita: _tipoCita,
        estado: _estado,
        prioridad: _prioridad,
        ubicacion: _ubicacionController.text.isEmpty ? null : _ubicacionController.text,
        recordatorio: _recordatorio,
        minutosAntes: _minutosAntes,
        notas: _notasController.text.isEmpty ? null : _notasController.text,
        fechaCreacion: widget.cita?.fechaCreacion ?? DateTime.now(),
      );

      if (_isEditing) {
        await _citaService.actualizarCita(widget.cita!.id, citaData);
      } else {
        await _citaService.crearCita(citaData);
      }

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(_isEditing ? 'Cita actualizada' : 'Cita creada'),
            backgroundColor: Colors.green,
          ),
        );
        Navigator.pop(context, true);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _eliminarCita() async {
    final confirmado = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Eliminar Cita'),
        content: const Text('¿Está seguro que desea eliminar esta cita?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancelar'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('Eliminar'),
          ),
        ],
      ),
    );

    if (confirmado != true) return;

    setState(() => _isLoading = true);

    try {
      await _citaService.eliminarCita(widget.cita!.id);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Cita eliminada'),
            backgroundColor: Colors.green,
          ),
        );
        Navigator.pop(context, true);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error al eliminar: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_isEditing ? 'Editar Cita' : 'Nueva Cita'),
        actions: [
          if (_isEditing)
            IconButton(
              icon: const Icon(Icons.delete),
              onPressed: _eliminarCita,
              tooltip: 'Eliminar',
            ),
        ],
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // Título
            TextFormField(
              controller: _tituloController,
              decoration: const InputDecoration(
                labelText: 'Título *',
                hintText: 'Ej: Visita Dr. Martínez',
                prefixIcon: Icon(Icons.title),
              ),
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'El título es requerido';
                }
                return null;
              },
            ),
            const SizedBox(height: 16),

            // Tipo de Cita y Prioridad
            Row(
              children: [
                Expanded(
                  child: DropdownButtonFormField<String>(
                    value: _tipoCita,
                    decoration: const InputDecoration(
                      labelText: 'Tipo de Cita',
                      prefixIcon: Icon(Icons.category),
                    ),
                    items: _tiposCita.map((tipo) {
                      return DropdownMenuItem(value: tipo, child: Text(tipo));
                    }).toList(),
                    onChanged: (value) {
                      setState(() => _tipoCita = value!);
                    },
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: DropdownButtonFormField<String>(
                    value: _prioridad,
                    decoration: const InputDecoration(
                      labelText: 'Prioridad',
                      prefixIcon: Icon(Icons.flag),
                    ),
                    items: _prioridades.map((prioridad) {
                      return DropdownMenuItem(value: prioridad, child: Text(prioridad));
                    }).toList(),
                    onChanged: (value) {
                      setState(() => _prioridad = value!);
                    },
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Estado (solo si está editando)
            if (_isEditing) ...[
              DropdownButtonFormField<String>(
                value: _estado,
                decoration: const InputDecoration(
                  labelText: 'Estado',
                  prefixIcon: Icon(Icons.info),
                ),
                items: _estados.map((estado) {
                  return DropdownMenuItem(value: estado, child: Text(estado));
                }).toList(),
                onChanged: (value) {
                  setState(() => _estado = value!);
                },
              ),
              const SizedBox(height: 16),
            ],

            // Todo el día
            SwitchListTile(
              title: const Text('Todo el día'),
              subtitle: const Text('La cita durará todo el día'),
              value: _todoElDia,
              onChanged: (value) {
                setState(() => _todoElDia = value);
              },
            ),
            const Divider(),

            // Fecha y Hora de Inicio
            ListTile(
              leading: const Icon(Icons.calendar_today),
              title: const Text('Fecha de Inicio'),
              subtitle: Text(_formatFecha(_fechaInicio)),
              trailing: const Icon(Icons.edit),
              onTap: () async {
                final fecha = await showDatePicker(
                  context: context,
                  initialDate: _fechaInicio,
                  firstDate: DateTime(2020),
                  lastDate: DateTime(2030),
                );
                if (fecha != null) {
                  setState(() => _fechaInicio = fecha);
                }
              },
            ),

            if (!_todoElDia)
              ListTile(
                leading: const Icon(Icons.access_time),
                title: const Text('Hora de Inicio'),
                subtitle: Text(_formatHora(_horaInicio)),
                trailing: const Icon(Icons.edit),
                onTap: () async {
                  final hora = await showTimePicker(
                    context: context,
                    initialTime: _horaInicio,
                  );
                  if (hora != null) {
                    setState(() => _horaInicio = hora);
                  }
                },
              ),

            const Divider(),

            // Fecha y Hora de Fin
            ListTile(
              leading: const Icon(Icons.calendar_today),
              title: const Text('Fecha de Fin'),
              subtitle: Text(_formatFecha(_fechaFin)),
              trailing: const Icon(Icons.edit),
              onTap: () async {
                final fecha = await showDatePicker(
                  context: context,
                  initialDate: _fechaFin,
                  firstDate: _fechaInicio,
                  lastDate: DateTime(2030),
                );
                if (fecha != null) {
                  setState(() => _fechaFin = fecha);
                }
              },
            ),

            if (!_todoElDia)
              ListTile(
                leading: const Icon(Icons.access_time),
                title: const Text('Hora de Fin'),
                subtitle: Text(_formatHora(_horaFin)),
                trailing: const Icon(Icons.edit),
                onTap: () async {
                  final hora = await showTimePicker(
                    context: context,
                    initialTime: _horaFin,
                  );
                  if (hora != null) {
                    setState(() => _horaFin = hora);
                  }
                },
              ),

            const Divider(),
            const SizedBox(height: 16),

            // Descripción
            TextFormField(
              controller: _descripcionController,
              decoration: const InputDecoration(
                labelText: 'Descripción',
                hintText: 'Detalles de la cita...',
                prefixIcon: Icon(Icons.description),
              ),
              maxLines: 3,
            ),
            const SizedBox(height: 16),

            // Ubicación
            TextFormField(
              controller: _ubicacionController,
              decoration: const InputDecoration(
                labelText: 'Ubicación',
                hintText: 'Hospital Central, Consultorio 3',
                prefixIcon: Icon(Icons.location_on),
              ),
            ),
            const SizedBox(height: 16),

            // Recordatorio
            SwitchListTile(
              title: const Text('Recordatorio'),
              subtitle: const Text('Recibir notificación antes de la cita'),
              value: _recordatorio,
              onChanged: (value) {
                setState(() => _recordatorio = value);
              },
            ),

            if (_recordatorio)
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: DropdownButtonFormField<int>(
                  value: _minutosAntes,
                  decoration: const InputDecoration(
                    labelText: 'Minutos antes',
                    prefixIcon: Icon(Icons.notifications_active),
                  ),
                  items: const [
                    DropdownMenuItem(value: 5, child: Text('5 minutos')),
                    DropdownMenuItem(value: 10, child: Text('10 minutos')),
                    DropdownMenuItem(value: 15, child: Text('15 minutos')),
                    DropdownMenuItem(value: 30, child: Text('30 minutos')),
                    DropdownMenuItem(value: 60, child: Text('1 hora')),
                    DropdownMenuItem(value: 120, child: Text('2 horas')),
                    DropdownMenuItem(value: 1440, child: Text('1 día')),
                  ],
                  onChanged: (value) {
                    setState(() => _minutosAntes = value!);
                  },
                ),
              ),

            const SizedBox(height: 16),

            // Notas
            TextFormField(
              controller: _notasController,
              decoration: const InputDecoration(
                labelText: 'Notas',
                hintText: 'Información adicional...',
                prefixIcon: Icon(Icons.note),
              ),
              maxLines: 3,
            ),

            const SizedBox(height: 24),

            // Botón Guardar
            ElevatedButton(
              onPressed: _isLoading ? null : _guardarCita,
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
              child: _isLoading
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : Text(_isEditing ? 'Actualizar Cita' : 'Crear Cita'),
            ),
          ],
        ),
      ),
    );
  }

  String _formatFecha(DateTime fecha) {
    const meses = [
      'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
      'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
    ];
    return '${fecha.day} ${meses[fecha.month - 1]} ${fecha.year}';
  }

  String _formatHora(TimeOfDay hora) {
    return '${hora.hour.toString().padLeft(2, '0')}:${hora.minute.toString().padLeft(2, '0')}';
  }
}
