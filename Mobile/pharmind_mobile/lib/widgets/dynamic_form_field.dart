import 'package:flutter/material.dart';
import '../models/esquema_personalizado.dart';
import '../services/entity_service.dart';

class DynamicFormField extends StatefulWidget {
  final FieldSchema field;
  final dynamic value;
  final Function(String, dynamic) onChanged;

  const DynamicFormField({
    super.key,
    required this.field,
    this.value,
    required this.onChanged,
  });

  @override
  State<DynamicFormField> createState() => _DynamicFormFieldState();
}

class _DynamicFormFieldState extends State<DynamicFormField> {
  final EntityService _entityService = EntityService();
  List<Map<String, dynamic>> _dynamicOptions = [];
  bool _loadingOptions = false;
  late TextEditingController _dateController;

  @override
  void initState() {
    super.initState();
    _dateController = TextEditingController(
      text: widget.field.type == 'date' && widget.value != null
        ? widget.value.toString()
        : '',
    );

    print('DEBUG INIT: Field name=${widget.field.name}, type=${widget.field.type}');
    print('DEBUG INIT: dataSource=${widget.field.dataSource}');
    print('DEBUG INIT: dataSource != null? ${widget.field.dataSource != null}');

    if (widget.field.dataSource != null && widget.field.type == 'select') {
      print('DEBUG INIT: Calling _loadDynamicOptions for ${widget.field.name}');
      _loadDynamicOptions();
    }
  }

  @override
  void dispose() {
    _dateController.dispose();
    super.dispose();
  }

  Future<void> _loadDynamicOptions() async {
    final dataSource = widget.field.dataSource;
    if (dataSource == null) {
      print('DEBUG: dataSource is null for field ${widget.field.name}');
      return;
    }

    final tableName = dataSource['tableName'] ?? '';
    final valueField = dataSource['valueField'] ?? 'id';
    final labelField = dataSource['labelField'] ?? 'nombre';

    print('DEBUG: Loading options for field ${widget.field.name}');
    print('DEBUG: tableName=$tableName, valueField=$valueField, labelField=$labelField');

    setState(() => _loadingOptions = true);

    try {
      final options = await _entityService.getFieldOptions(
        tableName,
        valueField,
        labelField,
      );
      print('DEBUG: Loaded ${options.length} options for field ${widget.field.name}');
      print('DEBUG: Options: $options');
      setState(() {
        _dynamicOptions = options;
        _loadingOptions = false;
      });
    } catch (e) {
      print('DEBUG: Error loading options for field ${widget.field.name}: $e');
      setState(() => _loadingOptions = false);
    }
  }

  List<dynamic> _getOptions() {
    if (widget.field.dataSource != null && _dynamicOptions.isNotEmpty) {
      return _dynamicOptions;
    }
    return widget.field.options ?? [];
  }

  @override
  Widget build(BuildContext context) {
    switch (widget.field.type) {
      case 'text':
      case 'email':
      case 'tel':
        return TextFormField(
          initialValue: widget.value?.toString() ?? '',
          decoration: InputDecoration(
            labelText: widget.field.label,
            hintText: widget.field.helpText,
            border: const OutlineInputBorder(),
          ),
          keyboardType: widget.field.type == 'email'
              ? TextInputType.emailAddress
              : widget.field.type == 'tel'
                  ? TextInputType.phone
                  : TextInputType.text,
          validator: (value) {
            if (widget.field.required && (value == null || value.isEmpty)) {
              return 'Este campo es requerido';
            }
            return null;
          },
          onChanged: (value) => widget.onChanged(widget.field.name, value),
        );

      case 'number':
        return TextFormField(
          initialValue: widget.value?.toString() ?? '',
          decoration: InputDecoration(
            labelText: widget.field.label,
            hintText: widget.field.helpText,
            border: const OutlineInputBorder(),
          ),
          keyboardType: TextInputType.number,
          validator: (value) {
            if (widget.field.required && (value == null || value.isEmpty)) {
              return 'Este campo es requerido';
            }
            return null;
          },
          onChanged: (value) => widget.onChanged(
            widget.field.name,
            value.isEmpty ? null : num.tryParse(value),
          ),
        );

      case 'textarea':
        return TextFormField(
          initialValue: widget.value?.toString() ?? '',
          decoration: InputDecoration(
            labelText: widget.field.label,
            hintText: widget.field.helpText,
            border: const OutlineInputBorder(),
          ),
          maxLines: 4,
          validator: (value) {
            if (widget.field.required && (value == null || value.isEmpty)) {
              return 'Este campo es requerido';
            }
            return null;
          },
          onChanged: (value) => widget.onChanged(widget.field.name, value),
        );

      case 'select':
        if (_loadingOptions) {
          return const Center(child: CircularProgressIndicator());
        }

        final options = _getOptions();
        return DropdownButtonFormField<String>(
          value: widget.value?.toString(),
          decoration: InputDecoration(
            labelText: widget.field.label,
            hintText: widget.field.helpText,
            border: const OutlineInputBorder(),
          ),
          items: options.map((option) {
            final value = option is Map
                ? option['value']?.toString()
                : option.toString();
            final label = option is Map
                ? option['label']?.toString()
                : option.toString();

            return DropdownMenuItem<String>(
              value: value,
              child: Text(label ?? value ?? ''),
            );
          }).toList(),
          validator: (value) {
            if (widget.field.required && (value == null || value.isEmpty)) {
              return 'Este campo es requerido';
            }
            return null;
          },
          onChanged: (value) => widget.onChanged(widget.field.name, value),
        );

      case 'radio':
        final options = _getOptions();
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Text(
                widget.field.label,
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
              ),
            ),
            ...options.map((option) {
              final value = option is Map
                  ? option['value']?.toString()
                  : option.toString();
              final label = option is Map
                  ? option['label']?.toString()
                  : option.toString();

              return RadioListTile<String>(
                title: Text(label ?? value ?? ''),
                value: value ?? '',
                groupValue: widget.value?.toString(),
                onChanged: (newValue) => widget.onChanged(widget.field.name, newValue),
              );
            }),
          ],
        );

      case 'checkbox':
        return CheckboxListTile(
          title: Text(widget.field.label),
          subtitle: widget.field.helpText != null
              ? Text(widget.field.helpText!)
              : null,
          value: widget.value == true || widget.value == 'true',
          onChanged: (value) => widget.onChanged(widget.field.name, value),
        );

      case 'date':
        // Update controller if value changed from parent
        if (widget.value != null && _dateController.text != widget.value.toString()) {
          _dateController.text = widget.value.toString();
        }
        return TextFormField(
          controller: _dateController,
          decoration: InputDecoration(
            labelText: widget.field.label,
            hintText: widget.field.helpText,
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
                _dateController.text = formattedDate;
              });
              widget.onChanged(
                widget.field.name,
                formattedDate,
              );
            }
          },
          validator: (value) {
            if (widget.field.required && (value == null || value.isEmpty)) {
              return 'Este campo es requerido';
            }
            return null;
          },
        );

      case 'rating':
        final rating = int.tryParse(widget.value?.toString() ?? '0') ?? 0;
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              widget.field.label,
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
            ),
            const SizedBox(height: 8),
            Row(
              children: List.generate(5, (index) {
                return IconButton(
                  icon: Icon(
                    index < rating ? Icons.star : Icons.star_border,
                    color: Colors.amber,
                  ),
                  onPressed: () => widget.onChanged(
                    widget.field.name,
                    index + 1,
                  ),
                );
              }),
            ),
          ],
        );

      case 'slider':
        final sliderValue = (widget.value is num)
            ? (widget.value as num).toDouble()
            : double.tryParse(widget.value?.toString() ?? '0') ?? 0.0;

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              widget.field.label,
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                Expanded(
                  child: Slider(
                    value: sliderValue,
                    min: 0,
                    max: 100,
                    divisions: 100,
                    label: sliderValue.round().toString(),
                    onChanged: (value) => widget.onChanged(
                      widget.field.name,
                      value.round(),
                    ),
                  ),
                ),
                SizedBox(
                  width: 50,
                  child: Text(
                    sliderValue.round().toString(),
                    style: const TextStyle(fontSize: 16),
                    textAlign: TextAlign.center,
                  ),
                ),
              ],
            ),
          ],
        );

      case 'section':
        // Sección es solo un divisor visual con título
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 12),
              decoration: BoxDecoration(
                color: Colors.blue[50],
                borderRadius: BorderRadius.circular(4),
                border: Border(
                  left: BorderSide(
                    color: Colors.blue[700]!,
                    width: 4,
                  ),
                ),
              ),
              child: Row(
                children: [
                  Icon(
                    Icons.label,
                    size: 20,
                    color: Colors.blue[700],
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      widget.field.label,
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Colors.blue[900],
                      ),
                    ),
                  ),
                ],
              ),
            ),
            if (widget.field.helpText != null)
              Padding(
                padding: const EdgeInsets.only(top: 4, left: 12),
                child: Text(
                  widget.field.helpText!,
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey[600],
                  ),
                ),
              ),
            const SizedBox(height: 8),
          ],
        );

      case 'repeater':
        // Grupo repetitivo - permite agregar múltiples instancias
        final List<Map<String, dynamic>> items = widget.value is List
            ? List<Map<String, dynamic>>.from(
                (widget.value as List).map((item) =>
                  item is Map ? Map<String, dynamic>.from(item) : <String, dynamic>{}
                )
              )
            : [];

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 8),
            Row(
              children: [
                Expanded(
                  child: Text(
                    widget.field.label,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.add_circle, color: Colors.green),
                  onPressed: () {
                    final newItems = List<Map<String, dynamic>>.from(items);
                    newItems.add(<String, dynamic>{});
                    widget.onChanged(widget.field.name, newItems);
                  },
                  tooltip: 'Agregar',
                ),
              ],
            ),
            if (widget.field.helpText != null)
              Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: Text(
                  widget.field.helpText!,
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey[600],
                  ),
                ),
              ),
            ...items.asMap().entries.map((entry) {
              final index = entry.key;

              return Card(
                margin: const EdgeInsets.only(bottom: 12),
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              'Elemento ${index + 1}',
                              style: const TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                          IconButton(
                            icon: const Icon(Icons.delete, color: Colors.red, size: 20),
                            onPressed: () {
                              final newItems = List<Map<String, dynamic>>.from(items);
                              newItems.removeAt(index);
                              widget.onChanged(widget.field.name, newItems);
                            },
                            tooltip: 'Eliminar',
                          ),
                        ],
                      ),
                      const Divider(),
                      Text(
                        'Contenido del elemento repetitivo',
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.grey[600],
                          fontStyle: FontStyle.italic,
                        ),
                      ),
                      // TODO: Aquí se renderizarían los campos internos del repeater
                      // según el repeaterConfig definido en el esquema
                    ],
                  ),
                ),
              );
            }),
            if (items.isEmpty)
              Center(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Text(
                    'No hay elementos. Presiona + para agregar',
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey[600],
                    ),
                  ),
                ),
              ),
          ],
        );

      default:
        return TextFormField(
          initialValue: widget.value?.toString() ?? '',
          decoration: InputDecoration(
            labelText: widget.field.label,
            hintText: widget.field.helpText,
            border: const OutlineInputBorder(),
          ),
          onChanged: (value) => widget.onChanged(widget.field.name, value),
        );
    }
  }
}
