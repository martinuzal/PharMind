import 'producto.dart';

class MuestraMedica {
  final String id;
  final String interaccionId;
  final String productoId;
  final String agenteId;
  final String clienteId;
  final int cantidad;
  final String? lote;
  final DateTime? fechaVencimiento;
  final DateTime fechaEntrega;
  final String? observaciones;
  final String? firmaDigital; // Base64
  final String? fotoComprobante; // URL o Base64
  final DateTime fechaCreacion;

  // Producto relacionado (opcional)
  final Producto? producto;

  MuestraMedica({
    required this.id,
    required this.interaccionId,
    required this.productoId,
    required this.agenteId,
    required this.clienteId,
    required this.cantidad,
    this.lote,
    this.fechaVencimiento,
    DateTime? fechaEntrega,
    this.observaciones,
    this.firmaDigital,
    this.fotoComprobante,
    DateTime? fechaCreacion,
    this.producto,
  })  : fechaEntrega = fechaEntrega ?? DateTime.now(),
        fechaCreacion = fechaCreacion ?? DateTime.now();

  factory MuestraMedica.fromJson(Map<String, dynamic> json) {
    return MuestraMedica(
      id: json['id'] as String,
      interaccionId: json['interaccionId'] as String,
      productoId: json['productoId'] as String,
      agenteId: json['agenteId'] as String,
      clienteId: json['clienteId'] as String,
      cantidad: json['cantidad'] as int,
      lote: json['lote'] as String?,
      fechaVencimiento: json['fechaVencimiento'] != null
          ? DateTime.parse(json['fechaVencimiento'] as String)
          : null,
      fechaEntrega: json['fechaEntrega'] != null
          ? DateTime.parse(json['fechaEntrega'] as String)
          : DateTime.now(),
      observaciones: json['observaciones'] as String?,
      firmaDigital: json['firmaDigital'] as String?,
      fotoComprobante: json['fotoComprobante'] as String?,
      fechaCreacion: json['fechaCreacion'] != null
          ? DateTime.parse(json['fechaCreacion'] as String)
          : DateTime.now(),
      producto: json['producto'] != null
          ? Producto.fromJson(json['producto'] as Map<String, dynamic>)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'interaccionId': interaccionId,
      'productoId': productoId,
      'agenteId': agenteId,
      'clienteId': clienteId,
      'cantidad': cantidad,
      'lote': lote,
      'fechaVencimiento': fechaVencimiento?.toIso8601String(),
      'fechaEntrega': fechaEntrega.toIso8601String(),
      'observaciones': observaciones,
      'firmaDigital': firmaDigital,
      'fotoComprobante': fotoComprobante,
      'fechaCreacion': fechaCreacion.toIso8601String(),
      if (producto != null) 'producto': producto!.toJson(),
    };
  }

  MuestraMedica copyWith({
    String? id,
    String? interaccionId,
    String? productoId,
    String? agenteId,
    String? clienteId,
    int? cantidad,
    String? lote,
    DateTime? fechaVencimiento,
    DateTime? fechaEntrega,
    String? observaciones,
    String? firmaDigital,
    String? fotoComprobante,
    DateTime? fechaCreacion,
    Producto? producto,
  }) {
    return MuestraMedica(
      id: id ?? this.id,
      interaccionId: interaccionId ?? this.interaccionId,
      productoId: productoId ?? this.productoId,
      agenteId: agenteId ?? this.agenteId,
      clienteId: clienteId ?? this.clienteId,
      cantidad: cantidad ?? this.cantidad,
      lote: lote ?? this.lote,
      fechaVencimiento: fechaVencimiento ?? this.fechaVencimiento,
      fechaEntrega: fechaEntrega ?? this.fechaEntrega,
      observaciones: observaciones ?? this.observaciones,
      firmaDigital: firmaDigital ?? this.firmaDigital,
      fotoComprobante: fotoComprobante ?? this.fotoComprobante,
      fechaCreacion: fechaCreacion ?? this.fechaCreacion,
      producto: producto ?? this.producto,
    );
  }
}
