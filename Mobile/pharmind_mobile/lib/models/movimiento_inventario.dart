class MovimientoInventario {
  final String id;
  final String inventarioAgenteId;
  final String tipoMovimiento; // "Entrada", "Salida", "Ajuste"
  final int cantidad;
  final int cantidadAnterior;
  final int cantidadNueva;
  final String? muestraMedicaId;
  final String? motivo;
  final String? observaciones;
  final DateTime fechaMovimiento;
  final DateTime fechaCreacion;

  MovimientoInventario({
    required this.id,
    required this.inventarioAgenteId,
    required this.tipoMovimiento,
    required this.cantidad,
    required this.cantidadAnterior,
    required this.cantidadNueva,
    this.muestraMedicaId,
    this.motivo,
    this.observaciones,
    DateTime? fechaMovimiento,
    DateTime? fechaCreacion,
  })  : fechaMovimiento = fechaMovimiento ?? DateTime.now(),
        fechaCreacion = fechaCreacion ?? DateTime.now();

  factory MovimientoInventario.fromJson(Map<String, dynamic> json) {
    return MovimientoInventario(
      id: json['id'] as String,
      inventarioAgenteId: json['inventarioAgenteId'] as String,
      tipoMovimiento: json['tipoMovimiento'] as String,
      cantidad: json['cantidad'] as int,
      cantidadAnterior: json['cantidadAnterior'] as int,
      cantidadNueva: json['cantidadNueva'] as int,
      muestraMedicaId: json['muestraMedicaId'] as String?,
      motivo: json['motivo'] as String?,
      observaciones: json['observaciones'] as String?,
      fechaMovimiento: json['fechaMovimiento'] != null
          ? DateTime.parse(json['fechaMovimiento'] as String)
          : DateTime.now(),
      fechaCreacion: json['fechaCreacion'] != null
          ? DateTime.parse(json['fechaCreacion'] as String)
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'inventarioAgenteId': inventarioAgenteId,
      'tipoMovimiento': tipoMovimiento,
      'cantidad': cantidad,
      'cantidadAnterior': cantidadAnterior,
      'cantidadNueva': cantidadNueva,
      'muestraMedicaId': muestraMedicaId,
      'motivo': motivo,
      'observaciones': observaciones,
      'fechaMovimiento': fechaMovimiento.toIso8601String(),
      'fechaCreacion': fechaCreacion.toIso8601String(),
    };
  }

  MovimientoInventario copyWith({
    String? id,
    String? inventarioAgenteId,
    String? tipoMovimiento,
    int? cantidad,
    int? cantidadAnterior,
    int? cantidadNueva,
    String? muestraMedicaId,
    String? motivo,
    String? observaciones,
    DateTime? fechaMovimiento,
    DateTime? fechaCreacion,
  }) {
    return MovimientoInventario(
      id: id ?? this.id,
      inventarioAgenteId: inventarioAgenteId ?? this.inventarioAgenteId,
      tipoMovimiento: tipoMovimiento ?? this.tipoMovimiento,
      cantidad: cantidad ?? this.cantidad,
      cantidadAnterior: cantidadAnterior ?? this.cantidadAnterior,
      cantidadNueva: cantidadNueva ?? this.cantidadNueva,
      muestraMedicaId: muestraMedicaId ?? this.muestraMedicaId,
      motivo: motivo ?? this.motivo,
      observaciones: observaciones ?? this.observaciones,
      fechaMovimiento: fechaMovimiento ?? this.fechaMovimiento,
      fechaCreacion: fechaCreacion ?? this.fechaCreacion,
    );
  }
}
