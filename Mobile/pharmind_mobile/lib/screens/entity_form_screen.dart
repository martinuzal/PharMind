import 'package:flutter/material.dart';
import '../models/esquema_personalizado.dart';
import '../models/entidad_dinamica.dart';
import '../services/entity_service.dart';
import '../widgets/dynamic_form_field.dart';

class EntityFormScreen extends StatefulWidget {
  final EsquemaPersonalizado esquema;
  final EntidadDinamica? entidad;

  const EntityFormScreen({
    super.key,
    required this.esquema,
    this.entidad,
  });

  @override
  State<EntityFormScreen> createState() => _EntityFormScreenState();
}

class _EntityFormScreenState extends State<EntityFormScreen> {
  final _formKey = GlobalKey<FormState>();
  final EntityService _entityService = EntityService();
  final Map<String, dynamic> _formData = {};
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    if (widget.entidad != null) {
      _formData.addAll(widget.entidad!.datos);
    }
  }

  void _handleFieldChange(String fieldName, dynamic value) {
    setState(() {
      _formData[fieldName] = value;
    });
  }

  Future<void> _saveEntity() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    setState(() => _isSaving = true);

    try {
      final entidad = EntidadDinamica(
        id: widget.entidad?.id,
        esquemaId: widget.esquema.id!,
        datos: _formData,
        fechaCreacion: widget.entidad?.fechaCreacion,
        fechaActualizacion: DateTime.now(),
        usuarioId: widget.entidad?.usuarioId,
        nombreEntidad: widget.esquema.nombreEntidad,
      );

      if (widget.entidad == null) {
        await _entityService.createEntidad(entidad);
      } else {
        await _entityService.updateEntidad(widget.entidad!.id!, entidad);
      }

      if (mounted) {
        Navigator.pop(context, true);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              widget.entidad == null
                  ? 'Entidad creada exitosamente'
                  : 'Entidad actualizada exitosamente',
            ),
          ),
        );
      }
    } catch (e) {
      setState(() => _isSaving = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error al guardar: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  List<FieldSchema> _getSortedFields() {
    final fields = widget.esquema.fields;

    // Sort by position (row, col)
    final sortedFields = List<FieldSchema>.from(fields);
    sortedFields.sort((a, b) {
      // Sort by row first, then by column
      if (a.row != null && b.row != null) {
        final rowCompare = a.row!.compareTo(b.row!);
        if (rowCompare != 0) return rowCompare;

        if (a.col != null && b.col != null) {
          return a.col!.compareTo(b.col!);
        }
      }

      // If one has row but the other doesn't, prioritize the one with row
      if (a.row != null && b.row == null) return -1;
      if (a.row == null && b.row != null) return 1;

      return 0;
    });

    return sortedFields;
  }

  @override
  Widget build(BuildContext context) {
    final sortedFields = _getSortedFields();

    return Scaffold(
      appBar: AppBar(
        title: Text(
          widget.entidad == null
              ? 'Nueva ${widget.esquema.nombreEntidad}'
              : 'Editar ${widget.esquema.nombreEntidad}',
        ),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
      ),
      body: _isSaving
          ? const Center(child: CircularProgressIndicator())
          : Form(
              key: _formKey,
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  ...sortedFields.map((field) {
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 16),
                      child: DynamicFormField(
                        field: field,
                        value: _formData[field.name],
                        onChanged: _handleFieldChange,
                      ),
                    );
                  }),
                  const SizedBox(height: 24),
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: _isSaving
                              ? null
                              : () => Navigator.pop(context),
                          child: const Padding(
                            padding: EdgeInsets.all(16),
                            child: Text('Cancelar'),
                          ),
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: ElevatedButton(
                          onPressed: _isSaving ? null : _saveEntity,
                          child: const Padding(
                            padding: EdgeInsets.all(16),
                            child: Text('Guardar'),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
    );
  }
}
