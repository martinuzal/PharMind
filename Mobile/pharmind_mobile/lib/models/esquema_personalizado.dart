import 'dart:convert';

class EsquemaPersonalizado {
  final dynamic id;  // Can be int or String (GUID)
  final String nombreEntidad;
  final String? descripcion;
  final String? icono;  // Material icon name from backend
  final String? color;  // Hex color from backend
  final Map<String, dynamic> esquemaJson;
  final Map<String, dynamic>? configuracionUi;  // UI configuration (visibility, editability, etc.)
  final Map<String, dynamic>? reglasValidacion;  // Validation rules
  final Map<String, dynamic>? reglasCorrelacion;  // Correlation/auto-calculation rules
  final DateTime? fechaCreacion;
  final DateTime? fechaActualizacion;

  EsquemaPersonalizado({
    this.id,
    required this.nombreEntidad,
    this.descripcion,
    this.icono,
    this.color,
    required this.esquemaJson,
    this.configuracionUi,
    this.reglasValidacion,
    this.reglasCorrelacion,
    this.fechaCreacion,
    this.fechaActualizacion,
  });

  factory EsquemaPersonalizado.fromJson(Map<String, dynamic> json) {
    Map<String, dynamic> parsedEsquemaJson;

    // El backend usa 'schema' (con minúscula por JSON) o 'Schema'
    final schemaField = json['schema'] ?? json['Schema'] ?? json['esquemaJson'];

    print('DEBUG - Schema field type: ${schemaField.runtimeType}');
    print('DEBUG - Schema field content: $schemaField');

    if (schemaField is String) {
      try {
        parsedEsquemaJson = Map<String, dynamic>.from(
          jsonDecode(schemaField as String)
        );
      } catch (e) {
        print('ERROR parsing schema string: $e');
        parsedEsquemaJson = {};
      }
    } else if (schemaField is Map) {
      parsedEsquemaJson = Map<String, dynamic>.from(schemaField);
    } else {
      parsedEsquemaJson = {};
    }

    print('DEBUG - Parsed esquemaJson: $parsedEsquemaJson');
    print('DEBUG - Fields in esquemaJson: ${parsedEsquemaJson['fields']}');

    // Parse ConfiguracionUi
    Map<String, dynamic>? parsedConfiguracionUi;
    final configuracionUiField = json['configuracionUi'] ?? json['ConfiguracionUi'];
    if (configuracionUiField != null) {
      if (configuracionUiField is String) {
        try {
          parsedConfiguracionUi = Map<String, dynamic>.from(
            jsonDecode(configuracionUiField)
          );
        } catch (e) {
          print('ERROR parsing ConfiguracionUi: $e');
        }
      } else if (configuracionUiField is Map) {
        parsedConfiguracionUi = Map<String, dynamic>.from(configuracionUiField);
      }
    }

    // Parse ReglasValidacion
    Map<String, dynamic>? parsedReglasValidacion;
    final reglasValidacionField = json['reglasValidacion'] ?? json['ReglasValidacion'];
    if (reglasValidacionField != null) {
      if (reglasValidacionField is String) {
        try {
          parsedReglasValidacion = Map<String, dynamic>.from(
            jsonDecode(reglasValidacionField)
          );
        } catch (e) {
          print('ERROR parsing ReglasValidacion: $e');
        }
      } else if (reglasValidacionField is Map) {
        parsedReglasValidacion = Map<String, dynamic>.from(reglasValidacionField);
      }
    }

    // Parse ReglasCorrelacion
    Map<String, dynamic>? parsedReglasCorrelacion;
    final reglasCorrelacionField = json['reglasCorrelacion'] ?? json['ReglasCorrelacion'];
    if (reglasCorrelacionField != null) {
      if (reglasCorrelacionField is String) {
        try {
          parsedReglasCorrelacion = Map<String, dynamic>.from(
            jsonDecode(reglasCorrelacionField)
          );
        } catch (e) {
          print('ERROR parsing ReglasCorrelacion: $e');
        }
      } else if (reglasCorrelacionField is Map) {
        parsedReglasCorrelacion = Map<String, dynamic>.from(reglasCorrelacionField);
      }
    }

    return EsquemaPersonalizado(
      id: json['id'],  // Accepts both int and String
      nombreEntidad: json['nombre'] ?? json['Nombre'] ?? json['nombreEntidad'] ?? '',
      descripcion: json['descripcion'] ?? json['Descripcion'],
      icono: json['icono'] ?? json['Icono'],  // Material icon name from backend
      color: json['color'] ?? json['Color'],  // Hex color from backend
      esquemaJson: parsedEsquemaJson,
      configuracionUi: parsedConfiguracionUi,
      reglasValidacion: parsedReglasValidacion,
      reglasCorrelacion: parsedReglasCorrelacion,
      fechaCreacion: json['fechaCreacion'] != null
        ? DateTime.parse(json['fechaCreacion'])
        : null,
      fechaActualizacion: json['fechaActualizacion'] != null
        ? DateTime.parse(json['fechaActualizacion'])
        : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'nombreEntidad': nombreEntidad,
      'descripcion': descripcion,
      'icono': icono,
      'color': color,
      'esquemaJson': esquemaJson,
      'configuracionUi': configuracionUi,
      'reglasValidacion': reglasValidacion,
      'reglasCorrelacion': reglasCorrelacion,
      'fechaCreacion': fechaCreacion?.toIso8601String(),
      'fechaActualizacion': fechaActualizacion?.toIso8601String(),
    };
  }

  List<FieldSchema> get fields {
    if (esquemaJson['fields'] == null) return [];
    return (esquemaJson['fields'] as List)
        .map((f) => FieldSchema.fromJson(f))
        .toList();
  }

  LayoutConfig? get layoutConfig {
    if (esquemaJson['layoutConfig'] == null) return null;
    return LayoutConfig.fromJson(esquemaJson['layoutConfig']);
  }

  // Helper methods for ConfiguracionUi
  bool isFieldVisible(String fieldName) {
    if (configuracionUi == null) return true;
    final fieldConfig = configuracionUi!['fields']?[fieldName];
    if (fieldConfig == null) return true;
    return fieldConfig['visible'] ?? true;
  }

  bool isFieldEditable(String fieldName) {
    if (configuracionUi == null) return true;
    final fieldConfig = configuracionUi!['fields']?[fieldName];
    if (fieldConfig == null) return true;
    return fieldConfig['editable'] ?? true;
  }

  bool isFieldRequired(String fieldName) {
    // Check ReglasValidacion first
    if (reglasValidacion != null) {
      final requiredFields = reglasValidacion!['required'];
      if (requiredFields is List && requiredFields.contains(fieldName)) {
        return true;
      }
    }
    // Fallback to schema definition
    final field = fields.firstWhere(
      (f) => f.name == fieldName,
      orElse: () => FieldSchema(name: '', label: '', type: 'text'),
    );
    return field.required;
  }

  dynamic getFieldDefaultValue(String fieldName) {
    if (configuracionUi == null) return null;
    final fieldConfig = configuracionUi!['fields']?[fieldName];
    if (fieldConfig == null) return null;
    return fieldConfig['defaultValue'];
  }

  String? getFieldValidationPattern(String fieldName) {
    if (reglasValidacion == null) return null;
    final patterns = reglasValidacion!['patterns'];
    if (patterns is Map) {
      return patterns[fieldName];
    }
    return null;
  }

  Map<String, dynamic>? getFieldCorrelationRule(String fieldName) {
    if (reglasCorrelacion == null) return null;
    final rules = reglasCorrelacion!['rules'];
    if (rules is Map) {
      return rules[fieldName];
    }
    return null;
  }
}

class FieldSchema {
  final String name;
  final String label;
  final String type;
  final bool required;
  final List<dynamic>? options;
  final Map<String, dynamic>? dataSource;
  final String? helpText;
  final String? icon;
  final Map<String, dynamic>? position;
  final int? row;
  final int? col;
  final Map<String, dynamic>? repeaterConfig;

  FieldSchema({
    required this.name,
    required this.label,
    required this.type,
    this.required = false,
    this.options,
    this.dataSource,
    this.helpText,
    this.icon,
    this.position,
    this.row,
    this.col,
    this.repeaterConfig,
  });

  factory FieldSchema.fromJson(Map<String, dynamic> json) {
    // Extract row and col from nested position object if it exists
    int? row;
    int? col;
    Map<String, dynamic>? position;

    if (json['position'] != null && json['position'] is Map) {
      position = Map<String, dynamic>.from(json['position']);
      // Convert to int safely
      final rowValue = position['row'];
      final colValue = position['col'];
      row = rowValue is int ? rowValue : (rowValue is double ? rowValue.toInt() : null);
      col = colValue is int ? colValue : (colValue is double ? colValue.toInt() : null);
    } else {
      // Fallback to flat structure
      final rowValue = json['row'];
      final colValue = json['col'];
      row = rowValue is int ? rowValue : (rowValue is double ? rowValue.toInt() : null);
      col = colValue is int ? colValue : (colValue is double ? colValue.toInt() : null);
    }

    return FieldSchema(
      name: json['name'] ?? '',
      label: json['label'] ?? '',
      type: json['type'] ?? 'text',
      required: json['required'] ?? false,
      options: json['options'],
      dataSource: json['dataSource'],
      helpText: json['helpText'],
      icon: json['icon'],
      position: position,
      row: row,
      col: col,
      repeaterConfig: json['repeaterConfig'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'label': label,
      'type': type,
      'required': required,
      'options': options,
      'dataSource': dataSource,
      'helpText': helpText,
      'icon': icon,
      'position': position,
      'row': row,
      'col': col,
      'repeaterConfig': repeaterConfig,
    };
  }
}

class LayoutConfig {
  final int rows;
  final int columns;

  LayoutConfig({
    required this.rows,
    required this.columns,
  });

  factory LayoutConfig.fromJson(Map<String, dynamic> json) {
    return LayoutConfig(
      rows: json['rows'] ?? 1,
      columns: json['columns'] ?? 1,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'rows': rows,
      'columns': columns,
    };
  }
}
