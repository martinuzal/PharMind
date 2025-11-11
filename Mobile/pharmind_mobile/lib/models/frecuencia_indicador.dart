class FrecuenciaIndicador {
  final int interaccionesRealizadas;
  final int frecuenciaObjetivo;
  final String periodoMedicion;
  final DateTime fechaInicioPeriodo;
  final DateTime fechaFinPeriodo;
  final String estado; // 'gris', 'amarillo', 'verde', 'azul'
  final int visitasPendientes;

  FrecuenciaIndicador({
    required this.interaccionesRealizadas,
    required this.frecuenciaObjetivo,
    required this.periodoMedicion,
    required this.fechaInicioPeriodo,
    required this.fechaFinPeriodo,
    required this.estado,
    required this.visitasPendientes,
  });

  factory FrecuenciaIndicador.fromJson(Map<String, dynamic> json) {
    return FrecuenciaIndicador(
      interaccionesRealizadas: json['interaccionesRealizadas'] ?? 0,
      frecuenciaObjetivo: json['frecuenciaObjetivo'] ?? 0,
      periodoMedicion: json['periodoMedicion'] ?? '',
      fechaInicioPeriodo: DateTime.parse(json['fechaInicioPeriodo']),
      fechaFinPeriodo: DateTime.parse(json['fechaFinPeriodo']),
      estado: json['estado'] ?? 'gris',
      visitasPendientes: json['visitasPendientes'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'interaccionesRealizadas': interaccionesRealizadas,
      'frecuenciaObjetivo': frecuenciaObjetivo,
      'periodoMedicion': periodoMedicion,
      'fechaInicioPeriodo': fechaInicioPeriodo.toIso8601String(),
      'fechaFinPeriodo': fechaFinPeriodo.toIso8601String(),
      'estado': estado,
      'visitasPendientes': visitasPendientes,
    };
  }

  Map<String, dynamic> toMap() {
    return {
      'interaccionesRealizadas': interaccionesRealizadas,
      'frecuenciaObjetivo': frecuenciaObjetivo,
      'periodoMedicion': periodoMedicion,
      'fechaInicioPeriodo': fechaInicioPeriodo.toIso8601String(),
      'fechaFinPeriodo': fechaFinPeriodo.toIso8601String(),
      'estado': estado,
      'visitasPendientes': visitasPendientes,
    };
  }

  factory FrecuenciaIndicador.fromMap(Map<String, dynamic> map) {
    return FrecuenciaIndicador(
      interaccionesRealizadas: map['interaccionesRealizadas'] ?? 0,
      frecuenciaObjetivo: map['frecuenciaObjetivo'] ?? 0,
      periodoMedicion: map['periodoMedicion'] ?? '',
      fechaInicioPeriodo: DateTime.parse(map['fechaInicioPeriodo']),
      fechaFinPeriodo: DateTime.parse(map['fechaFinPeriodo']),
      estado: map['estado'] ?? 'gris',
      visitasPendientes: map['visitasPendientes'] ?? 0,
    );
  }
}
