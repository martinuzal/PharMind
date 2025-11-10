class TareaGeo {
  final String id;
  final String titulo;
  final String descripcion;
  final DateTime fecha;
  final String estado; // pendiente, en_progreso, completada
  final String tipo; // visita, llamada, reunion, otro
  final String? clienteNombre;
  final double latitud;
  final double longitud;
  final String? direccion;
  final int? duracionMinutos;

  TareaGeo({
    required this.id,
    required this.titulo,
    required this.descripcion,
    required this.fecha,
    required this.estado,
    required this.tipo,
    this.clienteNombre,
    required this.latitud,
    required this.longitud,
    this.direccion,
    this.duracionMinutos,
  });

  factory TareaGeo.fromJson(Map<String, dynamic> json) {
    return TareaGeo(
      id: json['id'] as String,
      titulo: json['titulo'] as String,
      descripcion: json['descripcion'] as String,
      fecha: DateTime.parse(json['fecha'] as String),
      estado: json['estado'] as String,
      tipo: json['tipo'] as String,
      clienteNombre: json['clienteNombre'] as String?,
      latitud: (json['latitud'] as num).toDouble(),
      longitud: (json['longitud'] as num).toDouble(),
      direccion: json['direccion'] as String?,
      duracionMinutos: json['duracionMinutos'] as int?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'titulo': titulo,
      'descripcion': descripcion,
      'fecha': fecha.toIso8601String(),
      'estado': estado,
      'tipo': tipo,
      'clienteNombre': clienteNombre,
      'latitud': latitud,
      'longitud': longitud,
      'direccion': direccion,
      'duracionMinutos': duracionMinutos,
    };
  }

  String get estadoTexto {
    switch (estado) {
      case 'pendiente':
        return 'Pendiente';
      case 'en_progreso':
        return 'En Progreso';
      case 'completada':
        return 'Completada';
      default:
        return estado;
    }
  }

  String get tipoTexto {
    switch (tipo) {
      case 'visita':
        return 'Visita';
      case 'llamada':
        return 'Llamada';
      case 'reunion':
        return 'Reunión';
      case 'otro':
        return 'Otro';
      default:
        return tipo;
    }
  }
}

class ResumenEficiencia {
  final int totalTareas;
  final int tareasCompletadas;
  final int tareasPendientes;
  final int tareasEnProgreso;
  final double distanciaTotal; // en kilómetros
  final int tiempoTotal; // en minutos
  final double eficienciaPromedio; // porcentaje
  final List<TareaGeo> tareas;

  ResumenEficiencia({
    this.totalTareas = 0,
    this.tareasCompletadas = 0,
    this.tareasPendientes = 0,
    this.tareasEnProgreso = 0,
    this.distanciaTotal = 0.0,
    this.tiempoTotal = 0,
    this.eficienciaPromedio = 0.0,
    this.tareas = const [],
  });

  String get porcentajeCompletado {
    if (totalTareas == 0) return '0%';
    final porcentaje = (tareasCompletadas / totalTareas * 100).toStringAsFixed(0);
    return '$porcentaje%';
  }

  String get distanciaTotalFormateada {
    if (distanciaTotal < 1) {
      return '${(distanciaTotal * 1000).toStringAsFixed(0)} m';
    }
    return '${distanciaTotal.toStringAsFixed(1)} km';
  }

  String get tiempoTotalFormateado {
    final horas = tiempoTotal ~/ 60;
    final minutos = tiempoTotal % 60;
    if (horas > 0) {
      return '$horas h $minutos min';
    }
    return '$minutos min';
  }
}

class ZonaGeografica {
  final String nombre;
  final int cantidadTareas;
  final double latitudCentro;
  final double longitudCentro;

  ZonaGeografica({
    required this.nombre,
    required this.cantidadTareas,
    required this.latitudCentro,
    required this.longitudCentro,
  });
}
