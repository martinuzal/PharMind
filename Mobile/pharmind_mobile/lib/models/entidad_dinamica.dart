import 'dart:convert';

class EntidadDinamica {
  final dynamic id;  // Can be int or String (GUID)
  final dynamic esquemaId;  // Can be int or String (GUID)
  final Map<String, dynamic> datos;
  final DateTime? fechaCreacion;
  final DateTime? fechaActualizacion;
  final dynamic usuarioId;  // Can be int or String (GUID)
  final String? nombreEntidad;

  EntidadDinamica({
    this.id,
    required this.esquemaId,
    required this.datos,
    this.fechaCreacion,
    this.fechaActualizacion,
    this.usuarioId,
    this.nombreEntidad,
  });

  factory EntidadDinamica.fromJson(Map<String, dynamic> json) {
    Map<String, dynamic> parsedDatos;

    print('DEBUG - Datos type: ${json['datos'].runtimeType}');
    print('DEBUG - Datos content: ${json['datos']}');

    if (json['datos'] is String) {
      try {
        parsedDatos = Map<String, dynamic>.from(
          jsonDecode(json['datos'] as String)
        );
      } catch (e) {
        print('ERROR parsing datos string: $e');
        parsedDatos = {};
      }
    } else if (json['datos'] is Map) {
      parsedDatos = Map<String, dynamic>.from(json['datos']);
    } else {
      parsedDatos = {};
    }

    print('DEBUG - Parsed datos: $parsedDatos');

    return EntidadDinamica(
      id: json['id'],  // Accepts both int and String
      esquemaId: json['esquemaId'] ?? json['EsquemaId'],
      datos: parsedDatos,
      fechaCreacion: json['fechaCreacion'] != null
        ? DateTime.parse(json['fechaCreacion'])
        : null,
      fechaActualizacion: json['fechaActualizacion'] != null
        ? DateTime.parse(json['fechaActualizacion'])
        : null,
      usuarioId: json['usuarioId'] ?? json['UsuarioId'],
      nombreEntidad: json['nombreEntidad'],
    );
  }

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{
      'esquemaId': esquemaId,
      'datos': datos is String ? datos : jsonEncode(datos),  // Handle both String and Map
    };

    // Only include id if it exists (for updates)
    if (id != null) {
      json['id'] = id;
    }

    // Only include usuarioId if it exists
    if (usuarioId != null) {
      json['usuarioId'] = usuarioId;
    }

    // Don't send fechaCreacion or fechaModificacion - backend handles these

    return json;
  }

  String getFieldValue(String fieldName, [String defaultValue = '']) {
    return datos[fieldName]?.toString() ?? defaultValue;
  }
}
