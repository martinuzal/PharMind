class Cita {
  final String id;
  final String codigoCita;
  final String agenteId;
  final String? relacionId;
  final String? clienteId;
  final String? interaccionId;
  final String titulo;
  final String? descripcion;
  final DateTime fechaInicio;
  final DateTime fechaFin;
  final bool todoElDia;
  final String? tipoCita; // Visita, Llamada, Evento, Reunión
  final String estado; // Programada, Completada, Cancelada, Reprogramada
  final String? prioridad; // Alta, Media, Baja
  final String? ubicacion;
  final double? latitud;
  final double? longitud;
  final String? color;
  final bool recordatorio;
  final int minutosAntes;
  final String? notas;
  final int? orden;
  final double? distanciaKm;
  final int? tiempoEstimadoMinutos;
  final DateTime fechaCreacion;

  // Nombres relacionados (opcional, cargados desde el servidor)
  final String? clienteNombre;
  final String? relacionNombre;

  Cita({
    required this.id,
    required this.codigoCita,
    required this.agenteId,
    this.relacionId,
    this.clienteId,
    this.interaccionId,
    required this.titulo,
    this.descripcion,
    required this.fechaInicio,
    required this.fechaFin,
    this.todoElDia = false,
    this.tipoCita,
    this.estado = 'Programada',
    this.prioridad,
    this.ubicacion,
    this.latitud,
    this.longitud,
    this.color,
    this.recordatorio = true,
    this.minutosAntes = 30,
    this.notas,
    this.orden,
    this.distanciaKm,
    this.tiempoEstimadoMinutos,
    DateTime? fechaCreacion,
    this.clienteNombre,
    this.relacionNombre,
  }) : fechaCreacion = fechaCreacion ?? DateTime.now();

  factory Cita.fromJson(Map<String, dynamic> json) {
    return Cita(
      id: json['id'] as String,
      codigoCita: json['codigoCita'] as String,
      agenteId: json['agenteId'] as String,
      relacionId: json['relacionId'] as String?,
      clienteId: json['clienteId'] as String?,
      interaccionId: json['interaccionId'] as String?,
      titulo: json['titulo'] as String,
      descripcion: json['descripcion'] as String?,
      fechaInicio: DateTime.parse(json['fechaInicio'] as String),
      fechaFin: DateTime.parse(json['fechaFin'] as String),
      todoElDia: json['todoElDia'] as bool? ?? false,
      tipoCita: json['tipoCita'] as String?,
      estado: json['estado'] as String? ?? 'Programada',
      prioridad: json['prioridad'] as String?,
      ubicacion: json['ubicacion'] as String?,
      latitud: json['latitud'] != null ? (json['latitud'] as num).toDouble() : null,
      longitud: json['longitud'] != null ? (json['longitud'] as num).toDouble() : null,
      color: json['color'] as String?,
      recordatorio: json['recordatorio'] as bool? ?? true,
      minutosAntes: json['minutosAntes'] as int? ?? 30,
      notas: json['notas'] as String?,
      orden: json['orden'] as int?,
      distanciaKm: json['distanciaKm'] != null ? (json['distanciaKm'] as num).toDouble() : null,
      tiempoEstimadoMinutos: json['tiempoEstimadoMinutos'] as int?,
      fechaCreacion: json['fechaCreacion'] != null
          ? DateTime.parse(json['fechaCreacion'] as String)
          : DateTime.now(),
      clienteNombre: json['clienteNombre'] as String?,
      relacionNombre: json['relacionNombre'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'codigoCita': codigoCita,
      'agenteId': agenteId,
      'relacionId': relacionId,
      'clienteId': clienteId,
      'interaccionId': interaccionId,
      'titulo': titulo,
      'descripcion': descripcion,
      'fechaInicio': fechaInicio.toIso8601String(),
      'fechaFin': fechaFin.toIso8601String(),
      'todoElDia': todoElDia,
      'tipoCita': tipoCita,
      'estado': estado,
      'prioridad': prioridad,
      'ubicacion': ubicacion,
      'latitud': latitud,
      'longitud': longitud,
      'color': color,
      'recordatorio': recordatorio,
      'minutosAntes': minutosAntes,
      'notas': notas,
      'orden': orden,
      'distanciaKm': distanciaKm,
      'tiempoEstimadoMinutos': tiempoEstimadoMinutos,
      'fechaCreacion': fechaCreacion.toIso8601String(),
      if (clienteNombre != null) 'clienteNombre': clienteNombre,
      if (relacionNombre != null) 'relacionNombre': relacionNombre,
    };
  }

  // Helper para saber si la cita es hoy
  bool get esHoy {
    final hoy = DateTime.now();
    return fechaInicio.year == hoy.year &&
        fechaInicio.month == hoy.month &&
        fechaInicio.day == hoy.day;
  }

  // Helper para saber si la cita ya pasó
  bool get yaPaso {
    return fechaFin.isBefore(DateTime.now());
  }

  // Helper para saber si está en progreso
  bool get enProgreso {
    final ahora = DateTime.now();
    return fechaInicio.isBefore(ahora) && fechaFin.isAfter(ahora);
  }

  // Helper para duración en minutos
  int get duracionMinutos {
    return fechaFin.difference(fechaInicio).inMinutes;
  }

  // Helper para saber si debe mostrar recordatorio
  bool get debeNotificar {
    if (!recordatorio || estado != 'Programada') return false;
    final horaNotificacion = fechaInicio.subtract(Duration(minutes: minutosAntes));
    final ahora = DateTime.now();
    return ahora.isAfter(horaNotificacion) && ahora.isBefore(fechaInicio);
  }

  Cita copyWith({
    String? id,
    String? codigoCita,
    String? agenteId,
    String? relacionId,
    String? clienteId,
    String? interaccionId,
    String? titulo,
    String? descripcion,
    DateTime? fechaInicio,
    DateTime? fechaFin,
    bool? todoElDia,
    String? tipoCita,
    String? estado,
    String? prioridad,
    String? ubicacion,
    double? latitud,
    double? longitud,
    String? color,
    bool? recordatorio,
    int? minutosAntes,
    String? notas,
    int? orden,
    double? distanciaKm,
    int? tiempoEstimadoMinutos,
    DateTime? fechaCreacion,
    String? clienteNombre,
    String? relacionNombre,
  }) {
    return Cita(
      id: id ?? this.id,
      codigoCita: codigoCita ?? this.codigoCita,
      agenteId: agenteId ?? this.agenteId,
      relacionId: relacionId ?? this.relacionId,
      clienteId: clienteId ?? this.clienteId,
      interaccionId: interaccionId ?? this.interaccionId,
      titulo: titulo ?? this.titulo,
      descripcion: descripcion ?? this.descripcion,
      fechaInicio: fechaInicio ?? this.fechaInicio,
      fechaFin: fechaFin ?? this.fechaFin,
      todoElDia: todoElDia ?? this.todoElDia,
      tipoCita: tipoCita ?? this.tipoCita,
      estado: estado ?? this.estado,
      prioridad: prioridad ?? this.prioridad,
      ubicacion: ubicacion ?? this.ubicacion,
      latitud: latitud ?? this.latitud,
      longitud: longitud ?? this.longitud,
      color: color ?? this.color,
      recordatorio: recordatorio ?? this.recordatorio,
      minutosAntes: minutosAntes ?? this.minutosAntes,
      notas: notas ?? this.notas,
      orden: orden ?? this.orden,
      distanciaKm: distanciaKm ?? this.distanciaKm,
      tiempoEstimadoMinutos: tiempoEstimadoMinutos ?? this.tiempoEstimadoMinutos,
      fechaCreacion: fechaCreacion ?? this.fechaCreacion,
      clienteNombre: clienteNombre ?? this.clienteNombre,
      relacionNombre: relacionNombre ?? this.relacionNombre,
    );
  }
}
