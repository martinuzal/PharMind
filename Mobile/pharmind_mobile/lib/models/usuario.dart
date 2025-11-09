class Usuario {
  final String id;
  final String nombre;
  final String email;
  final String rol;
  final String? agenteId;
  final DateTime? fechaCreacion;
  final DateTime? ultimoAcceso;

  Usuario({
    required this.id,
    required this.nombre,
    required this.email,
    required this.rol,
    this.agenteId,
    this.fechaCreacion,
    this.ultimoAcceso,
  });

  // Convertir de JSON a objeto Usuario
  factory Usuario.fromJson(Map<String, dynamic> json) {
    return Usuario(
      id: json['id']?.toString() ?? '',
      nombre: json['nombreCompleto'] ?? json['nombre'] ?? '',
      email: json['email'] ?? '',
      rol: (json['roles'] != null && json['roles'] is List && (json['roles'] as List).isNotEmpty)
          ? (json['roles'] as List).first.toString()
          : json['rol']?.toString() ?? 'Usuario',
      agenteId: json['agenteId']?.toString(),
      fechaCreacion: json['fechaCreacion'] != null
          ? DateTime.parse(json['fechaCreacion'])
          : null,
      ultimoAcceso: json['ultimoAcceso'] != null
          ? DateTime.parse(json['ultimoAcceso'])
          : null,
    );
  }

  // Convertir de objeto Usuario a JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'nombre': nombre,
      'email': email,
      'rol': rol,
      'agenteId': agenteId,
      'fechaCreacion': fechaCreacion?.toIso8601String(),
      'ultimoAcceso': ultimoAcceso?.toIso8601String(),
    };
  }

  // Convertir de mapa de base de datos local (SQLite)
  factory Usuario.fromMap(Map<String, dynamic> map) {
    return Usuario(
      id: map['id']?.toString() ?? '',
      nombre: map['nombre'] ?? '',
      email: map['email'] ?? '',
      rol: map['rol'] ?? 'Usuario',
      agenteId: map['agenteId']?.toString(),
      fechaCreacion: map['fechaCreacion'] != null
          ? DateTime.parse(map['fechaCreacion'])
          : null,
      ultimoAcceso: map['ultimoAcceso'] != null
          ? DateTime.parse(map['ultimoAcceso'])
          : null,
    );
  }

  // Convertir de objeto Usuario a mapa para SQLite
  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'nombre': nombre,
      'email': email,
      'rol': rol,
      'agenteId': agenteId,
      'fechaCreacion': fechaCreacion?.toIso8601String(),
      'ultimoAcceso': ultimoAcceso?.toIso8601String(),
    };
  }

  // Copiar con modificaciones
  Usuario copyWith({
    String? id,
    String? nombre,
    String? email,
    String? rol,
    String? agenteId,
    DateTime? fechaCreacion,
    DateTime? ultimoAcceso,
  }) {
    return Usuario(
      id: id ?? this.id,
      nombre: nombre ?? this.nombre,
      email: email ?? this.email,
      rol: rol ?? this.rol,
      agenteId: agenteId ?? this.agenteId,
      fechaCreacion: fechaCreacion ?? this.fechaCreacion,
      ultimoAcceso: ultimoAcceso ?? this.ultimoAcceso,
    );
  }

  @override
  String toString() {
    return 'Usuario{id: $id, nombre: $nombre, email: $email, rol: $rol}';
  }
}
