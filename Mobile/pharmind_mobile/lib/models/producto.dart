class Producto {
  final String id;
  final String codigoProducto;
  final String nombre;
  final String? nombreComercial;
  final String? descripcion;
  final String? presentacion;
  final String? categoria;
  final String? laboratorio;
  final String? principioActivo;
  final String? concentracion;
  final String? viaAdministracion;
  final String? indicaciones;
  final String? contraindicaciones;
  final double? precioReferencia;
  final String? imagenUrl;
  final bool activo;
  final bool esMuestra;
  final bool requiereReceta;
  final String? lineaNegocioId;
  final DateTime fechaCreacion;

  Producto({
    required this.id,
    required this.codigoProducto,
    required this.nombre,
    this.nombreComercial,
    this.descripcion,
    this.presentacion,
    this.categoria,
    this.laboratorio,
    this.principioActivo,
    this.concentracion,
    this.viaAdministracion,
    this.indicaciones,
    this.contraindicaciones,
    this.precioReferencia,
    this.imagenUrl,
    this.activo = true,
    this.esMuestra = false,
    this.requiereReceta = false,
    this.lineaNegocioId,
    DateTime? fechaCreacion,
  }) : fechaCreacion = fechaCreacion ?? DateTime.now();

  factory Producto.fromJson(Map<String, dynamic> json) {
    return Producto(
      id: json['id'] as String,
      codigoProducto: json['codigoProducto'] as String,
      nombre: json['nombre'] as String,
      nombreComercial: json['nombreComercial'] as String?,
      descripcion: json['descripcion'] as String?,
      presentacion: json['presentacion'] as String?,
      categoria: json['categoria'] as String?,
      laboratorio: json['laboratorio'] as String?,
      principioActivo: json['principioActivo'] as String?,
      concentracion: json['concentracion'] as String?,
      viaAdministracion: json['viaAdministracion'] as String?,
      indicaciones: json['indicaciones'] as String?,
      contraindicaciones: json['contraindicaciones'] as String?,
      precioReferencia: json['precioReferencia'] != null
          ? (json['precioReferencia'] as num).toDouble()
          : null,
      imagenUrl: json['imagenUrl'] as String?,
      activo: json['activo'] as bool? ?? true,
      esMuestra: json['esMuestra'] as bool? ?? false,
      requiereReceta: json['requiereReceta'] as bool? ?? false,
      lineaNegocioId: json['lineaNegocioId'] as String?,
      fechaCreacion: json['fechaCreacion'] != null
          ? DateTime.parse(json['fechaCreacion'] as String)
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'codigoProducto': codigoProducto,
      'nombre': nombre,
      'nombreComercial': nombreComercial,
      'descripcion': descripcion,
      'presentacion': presentacion,
      'categoria': categoria,
      'laboratorio': laboratorio,
      'principioActivo': principioActivo,
      'concentracion': concentracion,
      'viaAdministracion': viaAdministracion,
      'indicaciones': indicaciones,
      'contraindicaciones': contraindicaciones,
      'precioReferencia': precioReferencia,
      'imagenUrl': imagenUrl,
      'activo': activo,
      'esMuestra': esMuestra,
      'requiereReceta': requiereReceta,
      'lineaNegocioId': lineaNegocioId,
      'fechaCreacion': fechaCreacion.toIso8601String(),
    };
  }

  Producto copyWith({
    String? id,
    String? codigoProducto,
    String? nombre,
    String? nombreComercial,
    String? descripcion,
    String? presentacion,
    String? categoria,
    String? laboratorio,
    String? principioActivo,
    String? concentracion,
    String? viaAdministracion,
    String? indicaciones,
    String? contraindicaciones,
    double? precioReferencia,
    String? imagenUrl,
    bool? activo,
    bool? esMuestra,
    bool? requiereReceta,
    String? lineaNegocioId,
    DateTime? fechaCreacion,
  }) {
    return Producto(
      id: id ?? this.id,
      codigoProducto: codigoProducto ?? this.codigoProducto,
      nombre: nombre ?? this.nombre,
      nombreComercial: nombreComercial ?? this.nombreComercial,
      descripcion: descripcion ?? this.descripcion,
      presentacion: presentacion ?? this.presentacion,
      categoria: categoria ?? this.categoria,
      laboratorio: laboratorio ?? this.laboratorio,
      principioActivo: principioActivo ?? this.principioActivo,
      concentracion: concentracion ?? this.concentracion,
      viaAdministracion: viaAdministracion ?? this.viaAdministracion,
      indicaciones: indicaciones ?? this.indicaciones,
      contraindicaciones: contraindicaciones ?? this.contraindicaciones,
      precioReferencia: precioReferencia ?? this.precioReferencia,
      imagenUrl: imagenUrl ?? this.imagenUrl,
      activo: activo ?? this.activo,
      esMuestra: esMuestra ?? this.esMuestra,
      requiereReceta: requiereReceta ?? this.requiereReceta,
      lineaNegocioId: lineaNegocioId ?? this.lineaNegocioId,
      fechaCreacion: fechaCreacion ?? this.fechaCreacion,
    );
  }

  String get displayName {
    final name = nombreComercial ?? nombre;
    if (presentacion != null && presentacion!.isNotEmpty) {
      return '$name - $presentacion';
    }
    return name;
  }
}

/// Producto presentado durante la visita con respuesta del cliente
class ProductoPromocionado {
  final String? id; // Puede ser null para productos nuevos
  final String productoId;
  final String productoNombre;
  final String? presentacion;
  final int cantidad;
  final String? observaciones; // Resultado: "Muy Positivo", "Positivo", "Neutral", "Negativo"

  ProductoPromocionado({
    this.id,
    required this.productoId,
    required this.productoNombre,
    this.presentacion,
    this.cantidad = 1, // Siempre 1 para productos promocionados
    this.observaciones,
  });

  factory ProductoPromocionado.fromJson(Map<String, dynamic> json) {
    return ProductoPromocionado(
      id: json['id'] as String?,
      productoId: json['productoId'] as String,
      productoNombre: json['productoNombre'] as String? ?? '',
      presentacion: json['presentacion'] as String?,
      cantidad: json['cantidad'] as int? ?? 1,
      observaciones: json['observaciones'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (id != null) 'id': id,
      'productoId': productoId,
      'cantidad': cantidad,
      'observaciones': observaciones,
    };
  }

  factory ProductoPromocionado.fromProducto(Producto producto, {String? resultado}) {
    return ProductoPromocionado(
      productoId: producto.id,
      productoNombre: producto.nombreComercial ?? producto.nombre,
      presentacion: producto.presentacion,
      cantidad: 1,
      observaciones: resultado,
    );
  }

  String get displayName {
    // Solo mostrar el nombre de la marca, no la presentación
    // porque se promociona la marca, no el producto específico
    return productoNombre;
  }

  // Crear una copia con cambios
  ProductoPromocionado copyWith({
    String? id,
    String? productoId,
    String? productoNombre,
    String? presentacion,
    int? cantidad,
    String? observaciones,
  }) {
    return ProductoPromocionado(
      id: id ?? this.id,
      productoId: productoId ?? this.productoId,
      productoNombre: productoNombre ?? this.productoNombre,
      presentacion: presentacion ?? this.presentacion,
      cantidad: cantidad ?? this.cantidad,
      observaciones: observaciones ?? this.observaciones,
    );
  }
}

/// Muestra médica entregada durante la visita
class MuestraEntregada {
  final String? id;
  final String productoId;
  final String productoNombre;
  final String? presentacion;
  final int cantidad;
  final String? observaciones;

  MuestraEntregada({
    this.id,
    required this.productoId,
    required this.productoNombre,
    this.presentacion,
    required this.cantidad,
    this.observaciones,
  });

  factory MuestraEntregada.fromJson(Map<String, dynamic> json) {
    return MuestraEntregada(
      id: json['id'] as String?,
      productoId: json['productoId'] as String,
      productoNombre: json['productoNombre'] as String? ?? '',
      presentacion: json['presentacion'] as String?,
      cantidad: json['cantidad'] as int? ?? 1,
      observaciones: json['observaciones'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (id != null) 'id': id,
      'productoId': productoId,
      'cantidad': cantidad,
      'observaciones': observaciones,
    };
  }

  factory MuestraEntregada.fromProducto(Producto producto, {int cantidad = 1}) {
    return MuestraEntregada(
      productoId: producto.id,
      productoNombre: producto.nombreComercial ?? producto.nombre,
      presentacion: producto.presentacion,
      cantidad: cantidad,
    );
  }

  String get displayName {
    if (presentacion != null && presentacion!.isNotEmpty) {
      return '$productoNombre - $presentacion';
    }
    return productoNombre;
  }

  MuestraEntregada copyWith({
    String? id,
    String? productoId,
    String? productoNombre,
    String? presentacion,
    int? cantidad,
    String? observaciones,
  }) {
    return MuestraEntregada(
      id: id ?? this.id,
      productoId: productoId ?? this.productoId,
      productoNombre: productoNombre ?? this.productoNombre,
      presentacion: presentacion ?? this.presentacion,
      cantidad: cantidad ?? this.cantidad,
      observaciones: observaciones ?? this.observaciones,
    );
  }
}

/// Producto solicitado/pedido durante la visita
class ProductoSolicitado {
  final String? id;
  final String productoId;
  final String productoNombre;
  final String? presentacion;
  final int cantidad;
  final String estado; // "Pendiente", "Aprobado", "Rechazado", etc.
  final String? observaciones;

  ProductoSolicitado({
    this.id,
    required this.productoId,
    required this.productoNombre,
    this.presentacion,
    required this.cantidad,
    this.estado = 'Pendiente',
    this.observaciones,
  });

  factory ProductoSolicitado.fromJson(Map<String, dynamic> json) {
    return ProductoSolicitado(
      id: json['id'] as String?,
      productoId: json['productoId'] as String,
      productoNombre: json['productoNombre'] as String? ?? '',
      presentacion: json['presentacion'] as String?,
      cantidad: json['cantidad'] as int? ?? 1,
      estado: json['estado'] as String? ?? 'Pendiente',
      observaciones: json['observaciones'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (id != null) 'id': id,
      'productoId': productoId,
      'cantidad': cantidad,
      'estado': estado,
      'observaciones': observaciones,
    };
  }

  factory ProductoSolicitado.fromProducto(Producto producto, {int cantidad = 1}) {
    return ProductoSolicitado(
      productoId: producto.id,
      productoNombre: producto.nombreComercial ?? producto.nombre,
      presentacion: producto.presentacion,
      cantidad: cantidad,
      estado: 'Pendiente',
    );
  }

  String get displayName {
    if (presentacion != null && presentacion!.isNotEmpty) {
      return '$productoNombre - $presentacion';
    }
    return productoNombre;
  }

  ProductoSolicitado copyWith({
    String? id,
    String? productoId,
    String? productoNombre,
    String? presentacion,
    int? cantidad,
    String? estado,
    String? observaciones,
  }) {
    return ProductoSolicitado(
      id: id ?? this.id,
      productoId: productoId ?? this.productoId,
      productoNombre: productoNombre ?? this.productoNombre,
      presentacion: presentacion ?? this.presentacion,
      cantidad: cantidad ?? this.cantidad,
      estado: estado ?? this.estado,
      observaciones: observaciones ?? this.observaciones,
    );
  }
}
