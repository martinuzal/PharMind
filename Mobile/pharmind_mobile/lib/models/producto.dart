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
}
