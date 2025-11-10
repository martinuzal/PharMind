class TiempoUtilizado {
  final DateTime fecha;
  final int minutosEnClientes;
  final int minutosEnInteracciones;
  final int minutosEnRelaciones;
  final int minutosTotal;

  TiempoUtilizado({
    required this.fecha,
    this.minutosEnClientes = 0,
    this.minutosEnInteracciones = 0,
    this.minutosEnRelaciones = 0,
    this.minutosTotal = 0,
  });

  factory TiempoUtilizado.fromJson(Map<String, dynamic> json) {
    return TiempoUtilizado(
      fecha: DateTime.parse(json['fecha'] as String),
      minutosEnClientes: json['minutosEnClientes'] as int? ?? 0,
      minutosEnInteracciones: json['minutosEnInteracciones'] as int? ?? 0,
      minutosEnRelaciones: json['minutosEnRelaciones'] as int? ?? 0,
      minutosTotal: json['minutosTotal'] as int? ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'fecha': fecha.toIso8601String(),
      'minutosEnClientes': minutosEnClientes,
      'minutosEnInteracciones': minutosEnInteracciones,
      'minutosEnRelaciones': minutosEnRelaciones,
      'minutosTotal': minutosTotal,
    };
  }

  String get tiempoTotalFormateado {
    final horas = minutosTotal ~/ 60;
    final minutos = minutosTotal % 60;
    if (horas > 0) {
      return '$horas h $minutos min';
    }
    return '$minutos min';
  }
}

class ResumenTiempo {
  final int totalMinutosHoy;
  final int totalMinutosSemana;
  final int totalMinutosMes;
  final List<TiempoUtilizado> historial;

  ResumenTiempo({
    this.totalMinutosHoy = 0,
    this.totalMinutosSemana = 0,
    this.totalMinutosMes = 0,
    this.historial = const [],
  });

  String formatearTiempo(int minutos) {
    final horas = minutos ~/ 60;
    final mins = minutos % 60;
    if (horas > 0) {
      return '$horas h $mins min';
    }
    return '$mins min';
  }
}
