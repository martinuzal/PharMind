class TipoActividad {
  final String id;
  final String codigo;
  final String nombre;
  final String? descripcion;
  final String clasificacion; // "Laboral" o "ExtraLaboral"
  final String? color;
  final String? icono;
  final bool activo;
  final bool esSistema;
  final int? orden;
  final DateTime fechaCreacion;

  TipoActividad({
    required this.id,
    required this.codigo,
    required this.nombre,
    this.descripcion,
    this.clasificacion = 'Laboral',
    this.color,
    this.icono,
    this.activo = true,
    this.esSistema = false,
    this.orden,
    DateTime? fechaCreacion,
  }) : fechaCreacion = fechaCreacion ?? DateTime.now();

  factory TipoActividad.fromJson(Map<String, dynamic> json) {
    return TipoActividad(
      id: json['id'] as String,
      codigo: json['codigo'] as String,
      nombre: json['nombre'] as String,
      descripcion: json['descripcion'] as String?,
      clasificacion: json['clasificacion'] as String? ?? 'Laboral',
      color: json['color'] as String?,
      icono: json['icono'] as String?,
      activo: json['activo'] as bool? ?? true,
      esSistema: json['esSistema'] as bool? ?? false,
      orden: json['orden'] as int?,
      fechaCreacion: json['fechaCreacion'] != null
          ? DateTime.parse(json['fechaCreacion'] as String)
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'codigo': codigo,
      'nombre': nombre,
      'descripcion': descripcion,
      'clasificacion': clasificacion,
      'color': color,
      'icono': icono,
      'activo': activo,
      'esSistema': esSistema,
      'orden': orden,
      'fechaCreacion': fechaCreacion.toIso8601String(),
    };
  }

  TipoActividad copyWith({
    String? id,
    String? codigo,
    String? nombre,
    String? descripcion,
    String? clasificacion,
    String? color,
    String? icono,
    bool? activo,
    bool? esSistema,
    int? orden,
    DateTime? fechaCreacion,
  }) {
    return TipoActividad(
      id: id ?? this.id,
      codigo: codigo ?? this.codigo,
      nombre: nombre ?? this.nombre,
      descripcion: descripcion ?? this.descripcion,
      clasificacion: clasificacion ?? this.clasificacion,
      color: color ?? this.color,
      icono: icono ?? this.icono,
      activo: activo ?? this.activo,
      esSistema: esSistema ?? this.esSistema,
      orden: orden ?? this.orden,
      fechaCreacion: fechaCreacion ?? this.fechaCreacion,
    );
  }
}
