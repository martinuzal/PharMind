import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'dart:math';
import 'dart:convert';
import '../services/mobile_api_service.dart';
import '../services/sync_queue_service.dart';
import '../models/relacion.dart';
import '../models/tipo_relacion.dart';
import '../models/esquema_personalizado.dart';
import '../providers/toolbar_provider.dart';
import '../widgets/bottom_toolbar.dart';
import '../widgets/dynamic_form_field.dart';

class RelacionFormScreen extends StatefulWidget {
  final Relacion relacion;
  final String agenteId;

  const RelacionFormScreen({
    super.key,
    required this.relacion,
    required this.agenteId,
  });

  @override
  State<RelacionFormScreen> createState() => _RelacionFormScreenState();
}

class _RelacionFormScreenState extends State<RelacionFormScreen> {
  final MobileApiService _apiService = MobileApiService();
  final SyncQueueService _syncQueueService = SyncQueueService();
  final _formKey = GlobalKey<FormState>();

  // Static form fields
  String? _prioridad;
  String? _frecuenciaVisitas; // Guardado como String pero representa un número
  String? _estado;
  DateTime? _fechaFin;
  final TextEditingController _observacionesController = TextEditingController();
  final TextEditingController _frecuenciaController = TextEditingController();

  // Dynamic fields values
  Map<String, dynamic> _dynamicFieldsValues = {};

  // TipoRelacion with schema
  TipoRelacion? _tipoRelacion;

  bool _isLoading = true; // Iniciar en true para esperar carga del schema
  bool _modoOffline = false;

  @override
  void initState() {
    super.initState();
    _initializeForm();
  }

  Future<void> _initializeForm() async {
    // Initialize form fields with current relacion values
    // Normalize values to ensure they are in the dropdown lists or null
    final validPrioridades = ['A', 'B', 'C'];
    final validEstados = ['Activo', 'Inactivo', 'Completado'];

    _prioridad = validPrioridades.contains(widget.relacion.prioridad) ? widget.relacion.prioridad : null;
    _frecuenciaVisitas = widget.relacion.frecuenciaVisitas; // Guardar el valor numérico como String
    _frecuenciaController.text = widget.relacion.frecuenciaVisitas ?? '';
    _estado = validEstados.contains(widget.relacion.estado) ? widget.relacion.estado : null;
    _fechaFin = widget.relacion.fechaFin;
    _observacionesController.text = widget.relacion.observaciones ?? '';

    // Initialize dynamic fields with existing values
    _dynamicFieldsValues = widget.relacion.datosDinamicos ?? {};

    // Parse TipoRelacion schema
    if (widget.relacion.tipoRelacionSchema != null && widget.relacion.tipoRelacionSchema!.isNotEmpty) {
      try {
        print('📋 Parseando schema de TipoRelacion...');
        final schemaJson = jsonDecode(widget.relacion.tipoRelacionSchema!);
        _tipoRelacion = TipoRelacion(
          id: widget.relacion.tipoRelacionId,
          nombre: widget.relacion.tipoRelacionNombre,
          subTipo: widget.relacion.tipoRelacionSubTipo,
          icono: widget.relacion.tipoRelacionIcono,
          color: widget.relacion.tipoRelacionColor,
          schema: Map<String, dynamic>.from(schemaJson),
        );
        print('✅ Schema parseado correctamente');
        print('   Campos estáticos configurados: ${_tipoRelacion?.schema?['staticFields']?.keys.toList()}');
        print('   Campos dinámicos: ${_tipoRelacion?.getDynamicFields().length ?? 0}');
      } catch (e) {
        print('❌ Error parsing tipoRelacion schema: $e');
      }
    } else {
      print('⚠️ No hay schema disponible para esta relación');
    }

    // Marcar como inicializado y quitar loading
    setState(() {
      _isLoading = false;
    });

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
        onPressed: () => _guardarRelacion(),
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
    _observacionesController.dispose();
    _frecuenciaController.dispose();

    // Limpiar acciones del toolbar al salir del formulario
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        final toolbarProvider = Provider.of<ToolbarProvider>(context, listen: false);
        toolbarProvider.clearActions();
      }
    });

    super.dispose();
  }

  String _generateUuid() {
    final random = Random();
    final timestamp = DateTime.now().millisecondsSinceEpoch.toString();
    final randomPart = random.nextInt(999999).toString().padLeft(6, '0');
    return 'mobile_${timestamp}_$randomPart';
  }

  Future<void> _guardarRelacion() async {
    print('=== INICIANDO GUARDADO DE RELACIÓN ===');

    if (!_formKey.currentState!.validate()) {
      print('Validación del formulario falló');
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      print('Relación ID: ${widget.relacion.id}');
      print('Agente ID: ${widget.agenteId}');

      if (!_modoOffline) {
        // Intentar enviar al servidor primero
        print('MODO ONLINE: Intentando enviar al servidor...');
        try {
          final result = await _apiService.updateRelacion(
            id: widget.relacion.id,
            prioridad: _prioridad,
            frecuenciaVisitas: _frecuenciaVisitas,
            observaciones: _observacionesController.text.isNotEmpty ? _observacionesController.text : null,
            estado: _estado,
            fechaFin: _fechaFin,
            datosDinamicos: _dynamicFieldsValues.isNotEmpty ? _dynamicFieldsValues : null,
          );

          print('✅ Relación actualizada exitosamente en el servidor');
          print('ID de relación actualizada: ${result.id}');

          if (mounted) {
            // Limpiar toolbar antes de cerrar
            final toolbarProvider = Provider.of<ToolbarProvider>(context, listen: false);
            toolbarProvider.clearActions();

            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('✓ Relación actualizada exitosamente'),
                backgroundColor: Colors.green,
                duration: Duration(seconds: 2),
              ),
            );
            // Pequeño delay para que el usuario vea el mensaje antes de cerrar
            await Future.delayed(const Duration(milliseconds: 500));
            Navigator.of(context).pop(true);
          }
          return; // Salir si el envío fue exitoso
        } catch (e) {
          // Si falla el envío online, automáticamente guardar offline
          print('⚠️ Error al enviar al servidor: $e');
          print('🔄 Guardando automáticamente en modo offline...');
          // Continuar con el guardado offline sin mostrar diálogo
        }
      }

      // Modo offline o fallback automático: agregar a la cola de sincronización
      print('MODO OFFLINE: Guardando en cola de sincronización');
      final queueItem = SyncQueueItem(
        id: _generateUuid(),
        operationType: SyncOperationType.updateRelacion,
        entityId: widget.relacion.id,
        data: {
          'prioridad': _prioridad,
          'frecuenciaVisitas': _frecuenciaVisitas,
          'observaciones': _observacionesController.text.isNotEmpty ? _observacionesController.text : null,
          'estado': _estado,
          'fechaFin': _fechaFin?.toIso8601String(),
          'datosDinamicos': _dynamicFieldsValues.isNotEmpty ? _dynamicFieldsValues : null,
        },
        createdAt: DateTime.now(),
      );

      await _syncQueueService.addToQueue(queueItem);
      print('✅ Relación agregada a cola de sincronización');

      if (mounted) {
        // Limpiar toolbar antes de cerrar
        final toolbarProvider = Provider.of<ToolbarProvider>(context, listen: false);
        toolbarProvider.clearActions();

        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Relación guardada. Se sincronizará cuando haya conexión'),
            backgroundColor: Colors.orange,
            duration: Duration(seconds: 3),
          ),
        );
        Navigator.of(context).pop(true);
      }
    } catch (e, stackTrace) {
      print('❌ ERROR CRÍTICO al guardar relación: $e');
      print('Stack trace: $stackTrace');

      setState(() {
        _isLoading = false;
      });

      if (mounted) {
        // Extraer mensaje de error más amigable
        String errorMessage = 'Error al guardar relación';
        if (e.toString().contains('Exception:')) {
          final parts = e.toString().split('Exception:');
          if (parts.length > 1) {
            errorMessage = parts[1].trim();
          }
        }

        // Mostrar error solo si falló incluso el guardado offline
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('❌ $errorMessage'),
            backgroundColor: Colors.red,
            duration: const Duration(seconds: 4),
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Editar Relación'),
        backgroundColor: Colors.deepPurple,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Información de la relación (read-only)
                    Card(
                      elevation: 2,
                      color: Colors.blue[50],
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Icon(Icons.info_outline, color: Colors.blue[700]),
                                const SizedBox(width: 8),
                                Text(
                                  'Información de la Relación',
                                  style: TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.blue[900],
                                  ),
                                ),
                              ],
                            ),
                            const Divider(height: 24),
                            _buildReadOnlyField('Código', widget.relacion.codigoRelacion),
                            _buildReadOnlyField('Tipo', widget.relacion.tipoRelacionNombre),
                            _buildReadOnlyField('Cliente Principal', widget.relacion.clientePrincipalNombre ?? 'Sin asignar'),
                            if (widget.relacion.clienteSecundario1Nombre != null)
                              _buildReadOnlyField('Cliente Secundario 1', widget.relacion.clienteSecundario1Nombre!),
                            if (widget.relacion.clienteSecundario2Nombre != null)
                              _buildReadOnlyField('Cliente Secundario 2', widget.relacion.clienteSecundario2Nombre!),
                          ],
                        ),
                      ),
                    ),

                    const SizedBox(height: 24),

                    // Static fields with schema-based visibility (usar PascalCase para los nombres)
                    if (_tipoRelacion?.isStaticFieldVisible('Prioridad') ?? true)
                      Padding(
                        padding: const EdgeInsets.only(bottom: 16),
                        child: DropdownButtonFormField<String>(
                          value: _prioridad,
                          decoration: InputDecoration(
                            labelText: 'Prioridad',
                            border: const OutlineInputBorder(),
                            suffixIcon: _tipoRelacion?.isStaticFieldRequired('Prioridad') ?? false
                                ? const Icon(Icons.star, size: 16, color: Colors.red)
                                : null,
                          ),
                          items: [
                            const DropdownMenuItem(value: null, child: Text('Seleccionar...')),
                            ...['A', 'B', 'C'].map((prio) {
                              return DropdownMenuItem(
                                value: prio,
                                child: Text('Prioridad $prio'),
                              );
                            }),
                          ],
                          validator: (_tipoRelacion?.isStaticFieldRequired('Prioridad') ?? false)
                              ? (value) => value == null ? 'Este campo es requerido' : null
                              : null,
                          onChanged: (value) => setState(() => _prioridad = value),
                        ),
                      ),

                    if (_tipoRelacion?.isStaticFieldVisible('FrecuenciaVisitas') ?? true)
                      Padding(
                        padding: const EdgeInsets.only(bottom: 16),
                        child: TextFormField(
                          controller: _frecuenciaController,
                          decoration: InputDecoration(
                            labelText: 'Frecuencia de Visitas (Cantidad de interacciones en el ciclo)',
                            border: const OutlineInputBorder(),
                            suffixIcon: _tipoRelacion?.isStaticFieldRequired('FrecuenciaVisitas') ?? false
                                ? const Icon(Icons.star, size: 16, color: Colors.red)
                                : null,
                            hintText: 'Ej: 12',
                          ),
                          keyboardType: TextInputType.number,
                          inputFormatters: [
                            FilteringTextInputFormatter.digitsOnly,
                          ],
                          validator: (_tipoRelacion?.isStaticFieldRequired('FrecuenciaVisitas') ?? false)
                              ? (value) {
                                  if (value == null || value.isEmpty) {
                                    return 'Este campo es requerido';
                                  }
                                  final numero = int.tryParse(value);
                                  if (numero == null || numero <= 0) {
                                    return 'Debe ser un número mayor a 0';
                                  }
                                  return null;
                                }
                              : (value) {
                                  if (value != null && value.isNotEmpty) {
                                    final numero = int.tryParse(value);
                                    if (numero == null || numero <= 0) {
                                      return 'Debe ser un número mayor a 0';
                                    }
                                  }
                                  return null;
                                },
                          onChanged: (value) => setState(() => _frecuenciaVisitas = value.isNotEmpty ? value : null),
                        ),
                      ),

                    if (_tipoRelacion?.isStaticFieldVisible('Estado') ?? true)
                      Padding(
                        padding: const EdgeInsets.only(bottom: 16),
                        child: DropdownButtonFormField<String>(
                          value: _estado,
                          decoration: InputDecoration(
                            labelText: 'Estado',
                            border: const OutlineInputBorder(),
                            suffixIcon: _tipoRelacion?.isStaticFieldRequired('Estado') ?? false
                                ? const Icon(Icons.star, size: 16, color: Colors.red)
                                : null,
                          ),
                          items: [
                            const DropdownMenuItem(value: null, child: Text('Seleccionar...')),
                            ...['Activo', 'Inactivo', 'Completado'].map((est) {
                              return DropdownMenuItem(
                                value: est,
                                child: Text(est),
                              );
                            }),
                          ],
                          validator: (_tipoRelacion?.isStaticFieldRequired('Estado') ?? false)
                              ? (value) => value == null ? 'Este campo es requerido' : null
                              : null,
                          onChanged: (value) => setState(() => _estado = value),
                        ),
                      ),

                    if (_tipoRelacion?.isStaticFieldVisible('FechaFin') ?? true)
                      Padding(
                        padding: const EdgeInsets.only(bottom: 16),
                        child: TextFormField(
                          decoration: InputDecoration(
                            labelText: 'Fecha de Fin',
                            border: const OutlineInputBorder(),
                            suffixIcon: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                if (_tipoRelacion?.isStaticFieldRequired('FechaFin') ?? false)
                                  const Icon(Icons.star, size: 16, color: Colors.red),
                                const Icon(Icons.calendar_today),
                              ],
                            ),
                          ),
                          readOnly: true,
                          controller: TextEditingController(
                            text: _fechaFin != null
                                ? _fechaFin!.toString().split(' ')[0]
                                : '',
                          ),
                          validator: (_tipoRelacion?.isStaticFieldRequired('FechaFin') ?? false)
                              ? (value) => value == null || value.isEmpty ? 'Este campo es requerido' : null
                              : null,
                          onTap: () async {
                            final date = await showDatePicker(
                              context: context,
                              initialDate: _fechaFin ?? DateTime.now(),
                              firstDate: DateTime.now(),
                              lastDate: DateTime(2100),
                            );
                            if (date != null) {
                              setState(() => _fechaFin = date);
                            }
                          },
                        ),
                      ),

                    if (_tipoRelacion?.isStaticFieldVisible('Observaciones') ?? true)
                      Padding(
                        padding: const EdgeInsets.only(bottom: 16),
                        child: TextFormField(
                          controller: _observacionesController,
                          decoration: InputDecoration(
                            labelText: 'Observaciones',
                            border: const OutlineInputBorder(),
                            suffixIcon: _tipoRelacion?.isStaticFieldRequired('Observaciones') ?? false
                                ? const Icon(Icons.star, size: 16, color: Colors.red)
                                : null,
                          ),
                          maxLines: 4,
                          validator: (_tipoRelacion?.isStaticFieldRequired('Observaciones') ?? false)
                              ? (value) => value == null || value.isEmpty ? 'Este campo es requerido' : null
                              : null,
                        ),
                      ),

                    // Dynamic fields from schema
                    if (_tipoRelacion != null && _tipoRelacion!.getDynamicFields().isNotEmpty) ...[
                      const Divider(height: 32),
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.deepPurple[50],
                          borderRadius: BorderRadius.circular(8),
                          border: Border(
                            left: BorderSide(
                              color: Colors.deepPurple[700]!,
                              width: 4,
                            ),
                          ),
                        ),
                        child: Row(
                          children: [
                            Icon(Icons.dynamic_form, color: Colors.deepPurple[700]),
                            const SizedBox(width: 8),
                            Text(
                              'Campos Dinámicos',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: Colors.deepPurple[900],
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),
                      ...(_tipoRelacion!.getDynamicFields()).map((fieldJson) {
                        final fieldSchema = FieldSchema.fromJson(fieldJson);
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 16),
                          child: DynamicFormField(
                            field: fieldSchema,
                            value: _dynamicFieldsValues[fieldSchema.name],
                            onChanged: (name, value) {
                              setState(() {
                                _dynamicFieldsValues[name] = value;
                              });
                            },
                          ),
                        );
                      }),
                    ],

                    const SizedBox(height: 24),

                    // Botones de acción
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton(
                            onPressed: () => Navigator.of(context).pop(),
                            style: OutlinedButton.styleFrom(
                              padding: const EdgeInsets.symmetric(vertical: 16),
                            ),
                            child: const Text('Cancelar'),
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          flex: 2,
                          child: ElevatedButton(
                            onPressed: _guardarRelacion,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.deepPurple,
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(vertical: 16),
                            ),
                            child: const Text('Guardar Cambios'),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
      bottomNavigationBar: const BottomToolbar(),
    );
  }

  Widget _buildReadOnlyField(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 140,
            child: Text(
              '$label:',
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: Colors.black87,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(
                fontSize: 13,
                color: Colors.black54,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
