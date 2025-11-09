import 'dart:convert';

class TipoInteraccion {
  final String id;
  final String nombre;
  final String? subTipo;
  final String? icono;
  final String? color;
  final Map<String, dynamic>? schema;

  TipoInteraccion({
    required this.id,
    required this.nombre,
    this.subTipo,
    this.icono,
    this.color,
    this.schema,
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

    return TipoInteraccion(
      id: json['id'] as String,
      nombre: json['nombre'] as String,
      subTipo: json['subTipo'] as String?,
      icono: json['icono'] as String?,
      color: json['color'] as String?,
      schema: parsedSchema,
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
}
