import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'dart:math';
import 'package:geolocator/geolocator.dart';
import '../services/mobile_api_service.dart';
import '../services/sync_queue_service.dart';
import '../models/relacion.dart';
import '../models/tipo_interaccion.dart';
import '../providers/toolbar_provider.dart';
import '../widgets/bottom_toolbar.dart';
import '../models/esquema_personalizado.dart';

class InteraccionFormScreen extends StatefulWidget {
  final String relacionId;
  final String agenteId;
  final List<TipoInteraccion> tiposInteraccionPermitidos;
  final Relacion relacion;

  const InteraccionFormScreen({
    super.key,
    required this.relacionId,
    required this.agenteId,
    required this.tiposInteraccionPermitidos,
    required this.relacion,
  });

  @override
  State<InteraccionFormScreen> createState() => _InteraccionFormScreenState();
}

class _InteraccionFormScreenState extends State<InteraccionFormScreen> {
  final MobileApiService _apiService = MobileApiService();
  final SyncQueueService _syncQueueService = SyncQueueService();
  final _formKey = GlobalKey<FormState>();

  // Form fields
  TipoInteraccion? _tipoInteraccionSeleccionado;
  DateTime _fecha = DateTime.now();
  TimeOfDay _hora = TimeOfDay.now();
  String? _turno;
  int? _duracionMinutos;
  final TextEditingController _objetivoController = TextEditingController();
  final TextEditingController _resumenController = TextEditingController();
  final TextEditingController _proximaAccionController = TextEditingController();
  DateTime? _fechaProximaAccion;
  String? _resultadoVisita;

  // Dynamic fields values
  Map<String, dynamic> _dynamicFieldsValues = {};

  // Geolocation
  Position? _position;
  bool _capturandoUbicacion = false;
  String? _direccionCapturada;

  bool _isLoading = false;
  bool _modoOffline = false;

  @override
  void initState() {
    super.initState();

    // Pre-seleccionar el primer tipo de interacción si solo hay uno permitido
    if (widget.tiposInteraccionPermitidos.length == 1) {
      _tipoInteraccionSeleccionado = widget.tiposInteraccionPermitidos.first;
    }

    // Configurar acciones del toolbar después de que el frame esté construido
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _setupToolbarActions();
    });
  }

  void _setupToolbarActions() {
    final toolbarProvider = Provider.of<ToolbarProvider>(context, listen: false);
    toolbarProvider.setActions([
      ToolbarProvider.createAction(
        icon: Icons.save,
        label: 'Guardar',
        onPressed: () => _guardarInteraccion(),
      ),
      ToolbarProvider.createAction(
        icon: Icons.close,
        label: 'Cancelar',
        onPressed: () => Navigator.of(context).pop(),
      ),
    ]);
  }

  @override
  void dispose() {
    _objetivoController.dispose();
    _resumenController.dispose();
    _proximaAccionController.dispose();

    // Limpiar acciones del toolbar al salir del formulario
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final toolbarProvider = Provider.of<ToolbarProvider>(context, listen: false);
      toolbarProvider.clearActions();
    });

    super.dispose();
  }

  String _generateUuid() {
    final random = Random();
    final timestamp = DateTime.now().millisecondsSinceEpoch.toString();
    final randomPart = random.nextInt(999999).toString().padLeft(6, '0');
    return 'mobile_${timestamp}_$randomPart';
  }

  Future<void> _capturarUbicacion() async {
    setState(() {
      _capturandoUbicacion = true;
    });

    try {
      // Verificar permisos
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          throw Exception('Permiso de ubicación denegado');
        }
      }

      if (permission == LocationPermission.deniedForever) {
        throw Exception('Permiso de ubicación denegado permanentemente. Por favor habilítelo en configuración.');
      }

      // Obtener ubicación
      final position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );

      setState(() {
        _position = position;
        _direccionCapturada = 'Lat: ${position.latitude.toStringAsFixed(6)}, Long: ${position.longitude.toStringAsFixed(6)}';
        _capturandoUbicacion = false;
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Ubicación capturada exitosamente')),
        );
      }
    } catch (e) {
      setState(() {
        _capturandoUbicacion = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error al capturar ubicación: $e')),
        );
      }
    }
  }

  Future<void> _guardarInteraccion() async {
    print('=== INICIANDO GUARDADO DE INTERACCIÓN ===');

    if (!_formKey.currentState!.validate()) {
      print('Validación del formulario falló');
      return;
    }

    if (_tipoInteraccionSeleccionado == null) {
      print('No hay tipo de interacción seleccionado');
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Por favor seleccione un tipo de interacción')),
      );
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      // Combinar fecha y hora
      final fechaHora = DateTime(
        _fecha.year,
        _fecha.month,
        _fecha.day,
        _hora.hour,
        _hora.minute,
      );

      print('Fecha y hora de interacción: $fechaHora');
      print('Tipo de interacción: ${_tipoInteraccionSeleccionado!.nombre} (${_tipoInteraccionSeleccionado!.id})');
      print('Relación ID: ${widget.relacionId}');
      print('Agente ID: ${widget.agenteId}');

      final interaccionData = {
        'tipoInteraccionId': _tipoInteraccionSeleccionado!.id,
        'relacionId': widget.relacionId,
        'agenteId': widget.agenteId,
        'clientePrincipalId': widget.relacion.clientePrincipalId,
        'clienteSecundario1Id': widget.relacion.clienteSecundario1Id,
        'fecha': fechaHora.toIso8601String(),
        'turno': _turno,
        'duracionMinutos': _duracionMinutos,
        'objetivoVisita': _objetivoController.text.isNotEmpty ? _objetivoController.text : null,
        'resumenVisita': _resumenController.text.isNotEmpty ? _resumenController.text : null,
        'proximaAccion': _proximaAccionController.text.isNotEmpty ? _proximaAccionController.text : null,
        'fechaProximaAccion': _fechaProximaAccion?.toIso8601String(),
        'resultadoVisita': _resultadoVisita,
        'latitud': _position?.latitude,
        'longitud': _position?.longitude,
        'direccionCapturada': _direccionCapturada,
        'datosDinamicos': _dynamicFieldsValues,
      };

      print('Datos de interacción preparados: ${interaccionData.keys.join(", ")}');

      if (_modoOffline) {
        print('MODO OFFLINE: Guardando en cola de sincronización');
        // Modo offline: agregar a la cola de sincronización
        final queueItem = SyncQueueItem(
          id: _generateUuid(),
          operationType: SyncOperationType.createInteraccion,
          entityId: _generateUuid(), // Temporary ID
          data: interaccionData,
          createdAt: DateTime.now(),
        );

        await _syncQueueService.addToQueue(queueItem);
        print('Interacción agregada a cola de sincronización');

        if (mounted) {
          // Limpiar toolbar antes de cerrar
          final toolbarProvider = Provider.of<ToolbarProvider>(context, listen: false);
          toolbarProvider.clearActions();

          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Interacción guardada en cola para sincronización posterior'),
              backgroundColor: Colors.orange,
              duration: Duration(seconds: 3),
            ),
          );
          Navigator.of(context).pop(true);
        }
      } else {
        print('MODO ONLINE: Enviando al servidor');
        // Modo online: enviar directamente
        final result = await _apiService.createInteraccion(
          tipoInteraccionId: interaccionData['tipoInteraccionId'] as String,
          relacionId: interaccionData['relacionId'] as String,
          agenteId: interaccionData['agenteId'] as String,
          clientePrincipalId: interaccionData['clientePrincipalId'] as String,
          clienteSecundario1Id: interaccionData['clienteSecundario1Id'] as String?,
          fecha: DateTime.parse(interaccionData['fecha'] as String),
          turno: interaccionData['turno'] as String?,
          duracionMinutos: interaccionData['duracionMinutos'] as int?,
          objetivoVisita: interaccionData['objetivoVisita'] as String?,
          resumenVisita: interaccionData['resumenVisita'] as String?,
          proximaAccion: interaccionData['proximaAccion'] as String?,
          fechaProximaAccion: interaccionData['fechaProximaAccion'] != null
              ? DateTime.parse(interaccionData['fechaProximaAccion'] as String)
              : null,
          resultadoVisita: interaccionData['resultadoVisita'] as String?,
          latitud: interaccionData['latitud'] as double?,
          longitud: interaccionData['longitud'] as double?,
          direccionCapturada: interaccionData['direccionCapturada'] as String?,
          datosDinamicos: interaccionData['datosDinamicos'] as Map<String, dynamic>?,
        );

        print('✅ Interacción creada exitosamente en el servidor');
        print('ID de interacción creada: ${result.id}');

        if (mounted) {
          // Limpiar toolbar antes de cerrar
          final toolbarProvider = Provider.of<ToolbarProvider>(context, listen: false);
          toolbarProvider.clearActions();

          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('✓ Interacción creada exitosamente'),
              backgroundColor: Colors.green,
              duration: Duration(seconds: 2),
            ),
          );
          // Pequeño delay para que el usuario vea el mensaje antes de cerrar
          await Future.delayed(const Duration(milliseconds: 500));
          Navigator.of(context).pop(true);
        }
      }
    } catch (e, stackTrace) {
      print('❌ ERROR al guardar interacción: $e');
      print('Stack trace: $stackTrace');

      setState(() {
        _isLoading = false;
      });

      if (mounted) {
        // Extraer mensaje de error más amigable
        String errorMessage = 'Error al guardar interacción';
        if (e.toString().contains('Exception:')) {
          errorMessage = e.toString().replaceAll('Exception: ', '');
        } else {
          errorMessage = '$errorMessage: ${e.toString()}';
        }

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(errorMessage),
            backgroundColor: Colors.red,
            duration: const Duration(seconds: 5),
            action: SnackBarAction(
              label: 'Ver detalles',
              textColor: Colors.white,
              onPressed: () {
                showDialog(
                  context: context,
                  builder: (context) => AlertDialog(
                    title: const Text('Error detallado'),
                    content: SingleChildScrollView(
                      child: Text('$e\n\nStack trace:\n$stackTrace'),
                    ),
                    actions: [
                      TextButton(
                        onPressed: () => Navigator.pop(context),
                        child: const Text('Cerrar'),
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
        );
      }
    }

    print('=== FIN GUARDADO DE INTERACCIÓN ===');
  }

  // Build dynamic field widget based on field schema
  Widget _buildDynamicField(FieldSchema field) {
    final currentValue = _dynamicFieldsValues[field.name];

    switch (field.type) {
      case 'text':
      case 'email':
      case 'tel':
        return TextFormField(
          initialValue: currentValue?.toString() ?? '',
          decoration: InputDecoration(
            labelText: '${field.label}${field.required ? ' *' : ''}',
            hintText: field.helpText,
            border: const OutlineInputBorder(),
          ),
          keyboardType: field.type == 'email'
              ? TextInputType.emailAddress
              : field.type == 'tel'
                  ? TextInputType.phone
                  : TextInputType.text,
          validator: field.required
              ? (value) => (value == null || value.isEmpty) ? 'Este campo es requerido' : null
              : null,
          onChanged: (value) {
            setState(() {
              _dynamicFieldsValues[field.name] = value;
            });
          },
        );

      case 'number':
        return TextFormField(
          initialValue: currentValue?.toString() ?? '',
          decoration: InputDecoration(
            labelText: '${field.label}${field.required ? ' *' : ''}',
            hintText: field.helpText,
            border: const OutlineInputBorder(),
          ),
          keyboardType: TextInputType.number,
          validator: field.required
              ? (value) => (value == null || value.isEmpty) ? 'Este campo es requerido' : null
              : null,
          onChanged: (value) {
            setState(() {
              _dynamicFieldsValues[field.name] = value.isEmpty ? null : num.tryParse(value);
            });
          },
        );

      case 'textarea':
        return TextFormField(
          initialValue: currentValue?.toString() ?? '',
          decoration: InputDecoration(
            labelText: '${field.label}${field.required ? ' *' : ''}',
            hintText: field.helpText,
            border: const OutlineInputBorder(),
          ),
          maxLines: 4,
          validator: field.required
              ? (value) => (value == null || value.isEmpty) ? 'Este campo es requerido' : null
              : null,
          onChanged: (value) {
            setState(() {
              _dynamicFieldsValues[field.name] = value;
            });
          },
        );

      case 'select':
        return DropdownButtonFormField<String>(
          value: currentValue?.toString(),
          decoration: InputDecoration(
            labelText: '${field.label}${field.required ? ' *' : ''}',
            hintText: field.helpText,
            border: const OutlineInputBorder(),
          ),
          items: (field.options ?? []).map((option) {
            final value = option is String ? option : option.toString();
            return DropdownMenuItem<String>(
              value: value,
              child: Text(value),
            );
          }).toList(),
          validator: field.required
              ? (value) => value == null ? 'Este campo es requerido' : null
              : null,
          onChanged: (value) {
            setState(() {
              _dynamicFieldsValues[field.name] = value;
            });
          },
        );

      case 'checkbox':
        return CheckboxListTile(
          title: Text(field.label),
          subtitle: field.helpText != null ? Text(field.helpText!) : null,
          value: currentValue == true || currentValue == 'true',
          onChanged: (value) {
            setState(() {
              _dynamicFieldsValues[field.name] = value;
            });
          },
        );

      case 'date':
        final dateController = TextEditingController(
          text: currentValue?.toString() ?? '',
        );
        return TextFormField(
          controller: dateController,
          decoration: InputDecoration(
            labelText: '${field.label}${field.required ? ' *' : ''}',
            hintText: field.helpText,
            border: const OutlineInputBorder(),
            suffixIcon: const Icon(Icons.calendar_today),
          ),
          readOnly: true,
          onTap: () async {
            final date = await showDatePicker(
              context: context,
              initialDate: DateTime.now(),
              firstDate: DateTime(1900),
              lastDate: DateTime(2100),
            );
            if (date != null) {
              final formattedDate = date.toIso8601String().split('T')[0];
              setState(() {
                dateController.text = formattedDate;
                _dynamicFieldsValues[field.name] = formattedDate;
              });
            }
          },
          validator: field.required
              ? (value) => (value == null || value.isEmpty) ? 'Este campo es requerido' : null
              : null,
        );

      default:
        return TextFormField(
          initialValue: currentValue?.toString() ?? '',
          decoration: InputDecoration(
            labelText: '${field.label}${field.required ? ' *' : ''}',
            hintText: field.helpText,
            border: const OutlineInputBorder(),
          ),
          onChanged: (value) {
            setState(() {
              _dynamicFieldsValues[field.name] = value;
            });
          },
        );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Nueva Interacción'),
        backgroundColor: Colors.deepPurple,
        actions: [
          // Toggle offline mode
          IconButton(
            icon: Icon(_modoOffline ? Icons.cloud_off : Icons.cloud_done),
            onPressed: () {
              setState(() {
                _modoOffline = !_modoOffline;
              });
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(_modoOffline ? 'Modo offline activado' : 'Modo online activado'),
                  duration: const Duration(seconds: 1),
                ),
              );
            },
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : Form(
              key: _formKey,
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  // Información de la relación
                  Card(
                    color: Colors.deepPurple.withAlpha(25),
                    child: Padding(
                      padding: const EdgeInsets.all(12),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              const Icon(Icons.account_circle, color: Colors.deepPurple, size: 20),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  widget.relacion.clientePrincipalNombre ?? 'Sin nombre',
                                  style: const TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 4),
                          Text(
                            widget.relacion.tipoRelacionNombre,
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.grey[600],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                  const SizedBox(height: 24),

                  // Tipo de interacción
                  DropdownButtonFormField<TipoInteraccion>(
                    decoration: InputDecoration(
                      labelText: 'Tipo de Interacción *',
                      border: const OutlineInputBorder(),
                      prefixIcon: const Icon(Icons.category),
                      // Indicador visual de campo preseleccionado
                      suffixIcon: widget.tiposInteraccionPermitidos.length == 1
                          ? const Icon(Icons.lock, size: 16, color: Colors.grey)
                          : null,
                    ),
                    value: _tipoInteraccionSeleccionado,
                    items: widget.tiposInteraccionPermitidos.map((tipo) {
                      return DropdownMenuItem(
                        value: tipo,
                        child: Text(tipo.nombre),
                      );
                    }).toList(),
                    // Solo permitir cambios si hay más de una opción
                    onChanged: widget.tiposInteraccionPermitidos.length > 1
                        ? (value) {
                            setState(() {
                              _tipoInteraccionSeleccionado = value;
                            });
                          }
                        : null,
                    validator: (value) {
                      if (value == null) {
                        return 'Por favor seleccione un tipo de interacción';
                      }
                      return null;
                    },
                    disabledHint: _tipoInteraccionSeleccionado != null
                        ? Text(_tipoInteraccionSeleccionado!.nombre)
                        : null,
                  ),

                  const SizedBox(height: 16),

                  // Fecha y hora
                  Row(
                    children: [
                      Expanded(
                        flex: 2,
                        child: InkWell(
                          onTap: () async {
                            final fecha = await showDatePicker(
                              context: context,
                              initialDate: _fecha,
                              firstDate: DateTime(2020),
                              lastDate: DateTime.now().add(const Duration(days: 365)),
                            );
                            if (fecha != null) {
                              setState(() {
                                _fecha = fecha;
                              });
                            }
                          },
                          child: InputDecorator(
                            decoration: const InputDecoration(
                              labelText: 'Fecha *',
                              border: OutlineInputBorder(),
                              prefixIcon: Icon(Icons.calendar_today),
                            ),
                            child: Text(
                              '${_fecha.day}/${_fecha.month}/${_fecha.year}',
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: InkWell(
                          onTap: () async {
                            final hora = await showTimePicker(
                              context: context,
                              initialTime: _hora,
                            );
                            if (hora != null) {
                              setState(() {
                                _hora = hora;
                              });
                            }
                          },
                          child: InputDecorator(
                            decoration: const InputDecoration(
                              labelText: 'Hora *',
                              border: OutlineInputBorder(),
                              prefixIcon: Icon(Icons.access_time),
                            ),
                            child: Text(
                              '${_hora.hour.toString().padLeft(2, '0')}:${_hora.minute.toString().padLeft(2, '0')}',
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 16),

                  // Turno (conditional based on schema)
                  if (_tipoInteraccionSeleccionado?.isStaticFieldVisible('Turno') ?? true) ...[
                    DropdownButtonFormField<String>(
                      decoration: InputDecoration(
                        labelText: 'Turno${(_tipoInteraccionSeleccionado?.isStaticFieldRequired('Turno') ?? false) ? ' *' : ''}',
                        border: const OutlineInputBorder(),
                        prefixIcon: const Icon(Icons.wb_sunny),
                      ),
                      initialValue: _turno,
                      items: ['Mañana', 'Tarde', 'Noche'].map((turno) {
                        return DropdownMenuItem(
                          value: turno,
                          child: Text(turno),
                        );
                      }).toList(),
                      validator: (_tipoInteraccionSeleccionado?.isStaticFieldRequired('Turno') ?? false)
                        ? (value) => value == null ? 'Este campo es requerido' : null
                        : null,
                      onChanged: (value) {
                        setState(() {
                          _turno = value;
                        });
                      },
                    ),
                    const SizedBox(height: 16),
                  ],

                  // Duración (conditional based on schema)
                  if (_tipoInteraccionSeleccionado?.isStaticFieldVisible('DuracionMinutos') ?? true) ...[
                    TextFormField(
                      decoration: InputDecoration(
                        labelText: 'Duración (minutos)${(_tipoInteraccionSeleccionado?.isStaticFieldRequired('DuracionMinutos') ?? false) ? ' *' : ''}',
                        border: const OutlineInputBorder(),
                        prefixIcon: const Icon(Icons.timer),
                      ),
                      keyboardType: TextInputType.number,
                      validator: (_tipoInteraccionSeleccionado?.isStaticFieldRequired('DuracionMinutos') ?? false)
                        ? (value) => (value == null || value.isEmpty) ? 'Este campo es requerido' : null
                        : null,
                      onChanged: (value) {
                        _duracionMinutos = int.tryParse(value);
                      },
                    ),
                    const SizedBox(height: 16),
                  ],

                  // Objetivo (conditional based on schema)
                  if (_tipoInteraccionSeleccionado?.isStaticFieldVisible('ObjetivoVisita') ?? true) ...[
                    TextFormField(
                      controller: _objetivoController,
                      decoration: InputDecoration(
                        labelText: 'Objetivo de la Visita${(_tipoInteraccionSeleccionado?.isStaticFieldRequired('ObjetivoVisita') ?? false) ? ' *' : ''}',
                        border: const OutlineInputBorder(),
                        prefixIcon: const Icon(Icons.flag),
                      ),
                      maxLines: 2,
                      validator: (_tipoInteraccionSeleccionado?.isStaticFieldRequired('ObjetivoVisita') ?? false)
                        ? (value) => (value == null || value.isEmpty) ? 'Este campo es requerido' : null
                        : null,
                    ),
                    const SizedBox(height: 16),
                  ],

                  // Resumen (conditional based on schema)
                  if (_tipoInteraccionSeleccionado?.isStaticFieldVisible('ResumenVisita') ?? true) ...[
                    TextFormField(
                      controller: _resumenController,
                      decoration: InputDecoration(
                        labelText: 'Resumen de la Visita${(_tipoInteraccionSeleccionado?.isStaticFieldRequired('ResumenVisita') ?? false) ? ' *' : ''}',
                        border: const OutlineInputBorder(),
                        prefixIcon: const Icon(Icons.notes),
                      ),
                      maxLines: 4,
                      validator: (_tipoInteraccionSeleccionado?.isStaticFieldRequired('ResumenVisita') ?? false)
                        ? (value) => (value == null || value.isEmpty) ? 'Por favor ingrese un resumen' : null
                        : null,
                    ),
                    const SizedBox(height: 16),
                  ],

                  // Resultado (conditional based on schema)
                  if (_tipoInteraccionSeleccionado?.isStaticFieldVisible('Resultado') ?? true) ...[
                    DropdownButtonFormField<String>(
                      decoration: InputDecoration(
                        labelText: 'Resultado${(_tipoInteraccionSeleccionado?.isStaticFieldRequired('Resultado') ?? false) ? ' *' : ''}',
                        border: const OutlineInputBorder(),
                        prefixIcon: const Icon(Icons.check_circle),
                      ),
                      initialValue: _resultadoVisita,
                      items: ['Exitoso', 'Pendiente', 'Cancelado', 'Reagendar'].map((resultado) {
                        return DropdownMenuItem(
                          value: resultado,
                          child: Text(resultado),
                        );
                      }).toList(),
                      validator: (_tipoInteraccionSeleccionado?.isStaticFieldRequired('Resultado') ?? false)
                        ? (value) => value == null ? 'Este campo es requerido' : null
                        : null,
                      onChanged: (value) {
                        setState(() {
                          _resultadoVisita = value;
                        });
                      },
                    ),
                    const SizedBox(height: 16),
                  ],

                  // Próxima acción (conditional based on schema)
                  if (_tipoInteraccionSeleccionado?.isStaticFieldVisible('ProximaAccion') ?? true) ...[
                    TextFormField(
                      controller: _proximaAccionController,
                      decoration: InputDecoration(
                        labelText: 'Próxima Acción${(_tipoInteraccionSeleccionado?.isStaticFieldRequired('ProximaAccion') ?? false) ? ' *' : ''}',
                        border: const OutlineInputBorder(),
                        prefixIcon: const Icon(Icons.next_plan),
                      ),
                      maxLines: 2,
                      validator: (_tipoInteraccionSeleccionado?.isStaticFieldRequired('ProximaAccion') ?? false)
                        ? (value) => (value == null || value.isEmpty) ? 'Este campo es requerido' : null
                        : null,
                    ),
                    const SizedBox(height: 16),
                  ],

                  // Fecha próxima acción (conditional based on schema)
                  if (_tipoInteraccionSeleccionado?.isStaticFieldVisible('FechaProximaAccion') ?? true) ...[
                    InkWell(
                      onTap: () async {
                        final fecha = await showDatePicker(
                          context: context,
                          initialDate: DateTime.now(),
                          firstDate: DateTime.now(),
                          lastDate: DateTime.now().add(const Duration(days: 365)),
                        );
                        if (fecha != null) {
                          setState(() {
                            _fechaProximaAccion = fecha;
                          });
                        }
                      },
                      child: InputDecorator(
                        decoration: InputDecoration(
                          labelText: 'Fecha Próxima Acción${(_tipoInteraccionSeleccionado?.isStaticFieldRequired('FechaProximaAccion') ?? false) ? ' *' : ''}',
                          border: const OutlineInputBorder(),
                          prefixIcon: const Icon(Icons.event),
                          suffixIcon: _fechaProximaAccion != null
                              ? IconButton(
                                  icon: const Icon(Icons.clear),
                                  onPressed: () {
                                    setState(() {
                                      _fechaProximaAccion = null;
                                    });
                                  },
                                )
                              : null,
                        ),
                        child: Text(
                          _fechaProximaAccion != null
                              ? '${_fechaProximaAccion!.day}/${_fechaProximaAccion!.month}/${_fechaProximaAccion!.year}'
                              : 'Seleccionar fecha',
                          style: TextStyle(
                            color: _fechaProximaAccion != null ? Colors.black : Colors.grey,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                  ],

                  // Dynamic fields from schema
                  ...(_tipoInteraccionSeleccionado?.getDynamicFields() ?? []).map((fieldJson) {
                    final fieldSchema = FieldSchema.fromJson(fieldJson);
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 16),
                      child: _buildDynamicField(fieldSchema),
                    );
                  }),

                  const SizedBox(height: 24),

                  // Geolocalización
                  Card(
                    color: _position != null ? Colors.green.withAlpha(25) : Colors.grey.withAlpha(25),
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Icon(
                                _position != null ? Icons.location_on : Icons.location_off,
                                color: _position != null ? Colors.green : Colors.grey,
                              ),
                              const SizedBox(width: 8),
                              const Text(
                                'Ubicación',
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                          if (_position != null) ...[
                            const SizedBox(height: 8),
                            Text(
                              _direccionCapturada ?? 'Ubicación capturada',
                              style: const TextStyle(fontSize: 12),
                            ),
                          ],
                          const SizedBox(height: 12),
                          ElevatedButton.icon(
                            onPressed: _capturandoUbicacion ? null : _capturarUbicacion,
                            icon: _capturandoUbicacion
                                ? const SizedBox(
                                    width: 16,
                                    height: 16,
                                    child: CircularProgressIndicator(strokeWidth: 2),
                                  )
                                : const Icon(Icons.my_location),
                            label: Text(
                              _capturandoUbicacion
                                  ? 'Capturando...'
                                  : _position != null
                                      ? 'Recapturar Ubicación'
                                      : 'Capturar Ubicación',
                            ),
                            style: ElevatedButton.styleFrom(
                              minimumSize: const Size(double.infinity, 40),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                  const SizedBox(height: 24),

                  // Botones de acción
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () {
                            Navigator.of(context).pop();
                          },
                          child: const Text('Cancelar'),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        flex: 2,
                        child: ElevatedButton.icon(
                          onPressed: _isLoading ? null : _guardarInteraccion,
                          icon: Icon(_modoOffline ? Icons.save : Icons.cloud_upload),
                          label: Text(_modoOffline ? 'Guardar Offline' : 'Guardar'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.deepPurple,
                            minimumSize: const Size(0, 48),
                          ),
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 16),

                  // Info card
                  if (_modoOffline)
                    Card(
                      color: Colors.orange.withAlpha(25),
                      child: Padding(
                        padding: const EdgeInsets.all(12),
                        child: Row(
                          children: [
                            const Icon(Icons.info_outline, color: Colors.orange, size: 20),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                'Modo offline: Los datos se guardarán localmente y se sincronizarán cuando haya conexión.',
                                style: TextStyle(fontSize: 12, color: Colors.orange[700]),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                ],
              ),
            ),
      bottomNavigationBar: const BottomToolbar(),
    );
  }
}
