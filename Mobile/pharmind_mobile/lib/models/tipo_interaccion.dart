import 'dart:convert';

class TipoInteraccion {
  final String id;
  final String nombre;
  final String? subTipo;
  final String? icono;
  final String? color;
  final Map<String, dynamic>? schema;
  final Map<String, dynamic>? configuracionUi;

  TipoInteraccion({
    required this.id,
    required this.nombre,
    this.subTipo,
    this.icono,
    this.color,
    this.schema,
    this.configuracionUi,
  });

  factory TipoInteraccion.fromJson(Map<String, dynamic> json) {
    // Parsear schema que puede venir como string JSON o como Map
    Map<String, dynamic>? parsedSchema;
    if (json['schema'] != null) {
      if (json['schema'] is String) {
        // Si es string JSON, deserializarlo
        try {
          final decoded = jsonDecode(json['schema'] as String);
          parsedSchema = Map<String, dynamic>.from(decoded as Map);
        } catch (e) {
          parsedSchema = null;
        }
      } else if (json['schema'] is Map) {
        // Si ya es un Map, usarlo directamente
        parsedSchema = Map<String, dynamic>.from(json['schema'] as Map);
      }
    }

    // Parsear configuracionUi que puede venir como string JSON o como Map
    // El backend envía en PascalCase: ConfiguracionUi
    Map<String, dynamic>? parsedConfiguracionUi;
    final configuracionUiKey = json['ConfiguracionUi'] ?? json['configuracionUi'];
    if (configuracionUiKey != null) {
      if (configuracionUiKey is String) {
        try {
          final decoded = jsonDecode(configuracionUiKey as String);
          parsedConfiguracionUi = Map<String, dynamic>.from(decoded as Map);
        } catch (e) {
          parsedConfiguracionUi = null;
        }
      } else if (configuracionUiKey is Map) {
        parsedConfiguracionUi = Map<String, dynamic>.from(configuracionUiKey as Map);
      }
    }

    return TipoInteraccion(
      id: json['id'] as String,
      nombre: json['nombre'] as String,
      subTipo: json['subTipo'] as String?,
      icono: json['icono'] as String?,
      color: json['color'] as String?,
      schema: parsedSchema,
      configuracionUi: parsedConfiguracionUi,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'nombre': nombre,
      'subTipo': subTipo,
      'icono': icono,
      'color': color,
      'schema': schema,
      'configuracionUi': configuracionUi,
    };
  }

  Map<String, dynamic> toDb() {
    return {
      'id': id,
      'nombre': nombre,
      'subTipo': subTipo,
      'icono': icono,
      'color': color,
      'schema': schema?.toString(),
    };
  }

  factory TipoInteraccion.fromDb(Map<String, dynamic> map) {
    return TipoInteraccion(
      id: map['id'] as String,
      nombre: map['nombre'] as String,
      subTipo: map['subTipo'] as String?,
      icono: map['icono'] as String?,
      color: map['color'] as String?,
      schema: null, // Will be parsed separately if needed
    );
  }

  // Helper methods to check static field configuration
  bool isStaticFieldVisible(String fieldName) {
    if (schema == null) return true;
    final staticFieldsConfig = schema!['staticFieldsConfig'];
    if (staticFieldsConfig == null) return true;
    final campos = staticFieldsConfig['campos'];
    if (campos == null) return true;
    final fieldConfig = campos[fieldName];
    if (fieldConfig == null) return true;
    return fieldConfig['visible'] ?? true;
  }

  bool isStaticFieldRequired(String fieldName) {
    if (schema == null) return false;
    final staticFieldsConfig = schema!['staticFieldsConfig'];
    if (staticFieldsConfig == null) return false;
    final campos = staticFieldsConfig['campos'];
    if (campos == null) return false;
    final fieldConfig = campos[fieldName];
    if (fieldConfig == null) return false;
    return fieldConfig['requerido'] ?? false;
  }

  // Get dynamic fields from schema
  List<Map<String, dynamic>> getDynamicFields() {
    if (schema == null) return [];
    final fields = schema!['fields'];
    if (fields == null || fields is! List) return [];
    return List<Map<String, dynamic>>.from(
      fields.map((f) => Map<String, dynamic>.from(f as Map))
    );
  }
}
