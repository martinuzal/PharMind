import 'producto.dart';

class InventarioAgente {
  final String id;
  final String agenteId;
  final String productoId;
  final int cantidadDisponible;
  final int? cantidadInicial;
  final int cantidadEntregada;
  final DateTime? fechaUltimaRecarga;
  final String? loteActual;
  final DateTime? fechaVencimiento;
  final String? observaciones;
  final DateTime fechaCreacion;

  // Producto relacionado (opcional, cargado desde el servidor)
  final Producto? producto;

  InventarioAgente({
    required this.id,
    required this.agenteId,
    required this.productoId,
    this.cantidadDisponible = 0,
    this.cantidadInicial,
    this.cantidadEntregada = 0,
    this.fechaUltimaRecarga,
    this.loteActual,
    this.fechaVencimiento,
    this.observaciones,
    DateTime? fechaCreacion,
    this.producto,
  }) : fechaCreacion = fechaCreacion ?? DateTime.now();

  factory InventarioAgente.fromJson(Map<String, dynamic> json) {
    return InventarioAgente(
      id: json['id'] as String,
      agenteId: json['agenteId'] as String,
      productoId: json['productoId'] as String,
      cantidadDisponible: json['cantidadDisponible'] as int? ?? 0,
      cantidadInicial: json['cantidadInicial'] as int?,
      cantidadEntregada: json['cantidadEntregada'] as int? ?? 0,
      fechaUltimaRecarga: json['fechaUltimaRecarga'] != null
          ? DateTime.parse(json['fechaUltimaRecarga'] as String)
          : null,
      loteActual: json['loteActual'] as String?,
      fechaVencimiento: json['fechaVencimiento'] != null
          ? DateTime.parse(json['fechaVencimiento'] as String)
          : null,
      observaciones: json['observaciones'] as String?,
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
      'agenteId': agenteId,
      'productoId': productoId,
      'cantidadDisponible': cantidadDisponible,
      'cantidadInicial': cantidadInicial,
      'cantidadEntregada': cantidadEntregada,
      'fechaUltimaRecarga': fechaUltimaRecarga?.toIso8601String(),
      'loteActual': loteActual,
      'fechaVencimiento': fechaVencimiento?.toIso8601String(),
      'observaciones': observaciones,
      'fechaCreacion': fechaCreacion.toIso8601String(),
      if (producto != null) 'producto': producto!.toJson(),
    };
  }

  // Helper para saber si está por vencer (30 días)
  bool get estaPorVencer {
    if (fechaVencimiento == null) return false;
    final diasRestantes = fechaVencimiento!.difference(DateTime.now()).inDays;
    return diasRestantes <= 30 && diasRestantes >= 0;
  }

  // Helper para saber si está vencido
  bool get estaVencido {
    if (fechaVencimiento == null) return false;
    return fechaVencimiento!.isBefore(DateTime.now());
  }

  // Helper para saber si el stock es bajo (menos del 20% del inicial)
  bool get stockBajo {
    if (cantidadInicial == null || cantidadInicial == 0) return false;
    return cantidadDisponible < (cantidadInicial! * 0.2);
  }

  InventarioAgente copyWith({
    String? id,
    String? agenteId,
    String? productoId,
    int? cantidadDisponible,
    int? cantidadInicial,
    int? cantidadEntregada,
    DateTime? fechaUltimaRecarga,
    String? loteActual,
    DateTime? fechaVencimiento,
    String? observaciones,
    DateTime? fechaCreacion,
    Producto? producto,
  }) {
    return InventarioAgente(
      id: id ?? this.id,
      agenteId: agenteId ?? this.agenteId,
      productoId: productoId ?? this.productoId,
      cantidadDisponible: cantidadDisponible ?? this.cantidadDisponible,
      cantidadInicial: cantidadInicial ?? this.cantidadInicial,
      cantidadEntregada: cantidadEntregada ?? this.cantidadEntregada,
      fechaUltimaRecarga: fechaUltimaRecarga ?? this.fechaUltimaRecarga,
      loteActual: loteActual ?? this.loteActual,
      fechaVencimiento: fechaVencimiento ?? this.fechaVencimiento,
      observaciones: observaciones ?? this.observaciones,
      fechaCreacion: fechaCreacion ?? this.fechaCreacion,
      producto: producto ?? this.producto,
    );
  }
}
