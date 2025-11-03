import 'dart:convert';

class EsquemaPersonalizado {
  final dynamic id;  // Can be int or String (GUID)
  final String nombreEntidad;
  final String? descripcion;
  final String? icono;  // Material icon name from backend
  final String? color;  // Hex color from backend
  final Map<String, dynamic> esquemaJson;
  final DateTime? fechaCreacion;
  final DateTime? fechaActualizacion;

  EsquemaPersonalizado({
    this.id,
    required this.nombreEntidad,
    this.descripcion,
    this.icono,
    this.color,
    required this.esquemaJson,
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

    return EsquemaPersonalizado(
      id: json['id'],  // Accepts both int and String
      nombreEntidad: json['nombre'] ?? json['Nombre'] ?? json['nombreEntidad'] ?? '',
      descripcion: json['descripcion'] ?? json['Descripcion'],
      icono: json['icono'] ?? json['Icono'],  // Material icon name from backend
      color: json['color'] ?? json['Color'],  // Hex color from backend
      esquemaJson: parsedEsquemaJson,
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
