class Gasto {
  final String id;
  final String concepto;
  final String descripcion;
  final double monto;
  final String moneda;
  final DateTime fecha;
  final String categoria; // transporte, alimentacion, hospedaje, otros
  final String estado; // pendiente, aprobado, rechazado
  final String? observaciones;
  final List<String> comprobantes; // rutas de fotos/archivos
  final DateTime fechaCreacion;

  Gasto({
    required this.id,
    required this.concepto,
    required this.descripcion,
    required this.monto,
    this.moneda = 'USD',
    required this.fecha,
    required this.categoria,
    this.estado = 'pendiente',
    this.observaciones,
    this.comprobantes = const [],
    required this.fechaCreacion,
  });

  factory Gasto.fromJson(Map<String, dynamic> json) {
    return Gasto(
      id: json['id'] as String,
      concepto: json['concepto'] as String,
      descripcion: json['descripcion'] as String,
      monto: (json['monto'] as num).toDouble(),
      moneda: json['moneda'] as String? ?? 'USD',
      fecha: DateTime.parse(json['fecha'] as String),
      categoria: json['categoria'] as String,
      estado: json['estado'] as String? ?? 'pendiente',
      observaciones: json['observaciones'] as String?,
      comprobantes: (json['comprobantes'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          [],
      fechaCreacion: DateTime.parse(json['fechaCreacion'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'concepto': concepto,
      'descripcion': descripcion,
      'monto': monto,
      'moneda': moneda,
      'fecha': fecha.toIso8601String(),
      'categoria': categoria,
      'estado': estado,
      'observaciones': observaciones,
      'comprobantes': comprobantes,
      'fechaCreacion': fechaCreacion.toIso8601String(),
    };
  }

  String get categoriaTexto {
    switch (categoria) {
      case 'transporte':
        return 'Transporte';
      case 'alimentacion':
        return 'Alimentación';
      case 'hospedaje':
        return 'Hospedaje';
      case 'combustible':
        return 'Combustible';
      case 'materiales':
        return 'Materiales';
      case 'otros':
        return 'Otros';
      default:
        return categoria;
    }
  }

  String get estadoTexto {
    switch (estado) {
      case 'pendiente':
        return 'Pendiente';
      case 'aprobado':
        return 'Aprobado';
      case 'rechazado':
        return 'Rechazado';
      default:
        return estado;
    }
  }

  String get montoFormateado {
    return '\$$moneda ${monto.toStringAsFixed(2)}';
  }
}

class ResumenGastos {
  final double totalGastos;
  final double totalPendiente;
  final double totalAprobado;
  final double totalRechazado;
  final int cantidadGastos;
  final int cantidadPendientes;
  final int cantidadAprobados;
  final int cantidadRechazados;
  final List<Gasto> gastos;
  final Map<String, double> gastosPorCategoria;

  ResumenGastos({
    this.totalGastos = 0.0,
    this.totalPendiente = 0.0,
    this.totalAprobado = 0.0,
    this.totalRechazado = 0.0,
    this.cantidadGastos = 0,
    this.cantidadPendientes = 0,
    this.cantidadAprobados = 0,
    this.cantidadRechazados = 0,
    this.gastos = const [],
    this.gastosPorCategoria = const {},
  });

  String get totalGastosFormateado {
    return '\$${totalGastos.toStringAsFixed(2)}';
  }

  String get totalPendienteFormateado {
    return '\$${totalPendiente.toStringAsFixed(2)}';
  }

  String get totalAprobadoFormateado {
    return '\$${totalAprobado.toStringAsFixed(2)}';
  }
}

class PeriodoGastos {
  final DateTime fechaInicio;
  final DateTime fechaFin;
  final String nombre;

  PeriodoGastos({
    required this.fechaInicio,
    required this.fechaFin,
    required this.nombre,
  });

  bool incluyeFecha(DateTime fecha) {
    return fecha.isAfter(fechaInicio.subtract(const Duration(days: 1))) &&
        fecha.isBefore(fechaFin.add(const Duration(days: 1)));
  }

  static PeriodoGastos mesActual() {
    final ahora = DateTime.now();
    final inicio = DateTime(ahora.year, ahora.month, 1);
    final fin = DateTime(ahora.year, ahora.month + 1, 0);
    return PeriodoGastos(
      fechaInicio: inicio,
      fechaFin: fin,
      nombre: 'Mes Actual',
    );
  }

  static PeriodoGastos mesAnterior() {
    final ahora = DateTime.now();
    final inicio = DateTime(ahora.year, ahora.month - 1, 1);
    final fin = DateTime(ahora.year, ahora.month, 0);
    return PeriodoGastos(
      fechaInicio: inicio,
      fechaFin: fin,
      nombre: 'Mes Anterior',
    );
  }

  static PeriodoGastos ultimos30Dias() {
    final ahora = DateTime.now();
    final inicio = ahora.subtract(const Duration(days: 30));
    return PeriodoGastos(
      fechaInicio: inicio,
      fechaFin: ahora,
      nombre: 'Últimos 30 días',
    );
  }
}
