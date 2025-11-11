import 'producto.dart';

class Interaccion {
  final String id;
  final String tipoInteraccionId;
  final String tipoInteraccionNombre;
  final String tipoInteraccionSubTipo;
  final String? tipoInteraccionIcono;
  final String? tipoInteraccionColor;

  final String relacionId;
  final String agenteId;
  final String? agenteNombre;

  // Clientes (desnormalizado para rendimiento)
  final String clientePrincipalId;
  final String? clientePrincipalNombre;
  final String? clienteSecundario1Id;
  final String? clienteSecundario1Nombre;

  final DateTime fecha;
  final String? turno; // Mañana, Tarde, Noche
  final int? duracionMinutos;

  // Contenido
  final String? objetivoVisita;
  final String? resumenVisita;
  final String? proximaAccion;
  final DateTime? fechaProximaAccion;
  final String? resultadoVisita;

  // Geolocalización
  final double? latitud;
  final double? longitud;
  final String? direccionCapturada;

  // Datos dinámicos
  final Map<String, dynamic>? datosDinamicos;

  // Productos
  final List<ProductoPromocionado> productosPromocionados;
  final List<MuestraEntregada> muestrasEntregadas;
  final List<ProductoSolicitado> productosSolicitados;

  // Estado
  final String estado;
  final bool sincronizada;

  // Auditoría
  final DateTime fechaCreacion;
  final DateTime? fechaModificacion;
  final String? creadoPor;

  Interaccion({
    required this.id,
    required this.tipoInteraccionId,
    required this.tipoInteraccionNombre,
    required this.tipoInteraccionSubTipo,
    this.tipoInteraccionIcono,
    this.tipoInteraccionColor,
    required this.relacionId,
    required this.agenteId,
    this.agenteNombre,
    required this.clientePrincipalId,
    this.clientePrincipalNombre,
    this.clienteSecundario1Id,
    this.clienteSecundario1Nombre,
    required this.fecha,
    this.turno,
    this.duracionMinutos,
    this.objetivoVisita,
    this.resumenVisita,
    this.proximaAccion,
    this.fechaProximaAccion,
    this.resultadoVisita,
    this.latitud,
    this.longitud,
    this.direccionCapturada,
    this.datosDinamicos,
    this.productosPromocionados = const [],
    this.muestrasEntregadas = const [],
    this.productosSolicitados = const [],
    required this.estado,
    this.sincronizada = false,
    required this.fechaCreacion,
    this.fechaModificacion,
    this.creadoPor,
  });

  factory Interaccion.fromJson(Map<String, dynamic> json) {
    return Interaccion(
      id: json['id'] as String,
      tipoInteraccionId: json['tipoInteraccionId'] as String,
      tipoInteraccionNombre: json['tipoInteraccionNombre'] as String,
      tipoInteraccionSubTipo: json['tipoInteraccionSubTipo'] as String,
      tipoInteraccionIcono: json['tipoInteraccionIcono'] as String?,
      tipoInteraccionColor: json['tipoInteraccionColor'] as String?,
      relacionId: json['relacionId'] as String,
      agenteId: json['agenteId'] as String,
      agenteNombre: json['agenteNombre'] as String?,
      clientePrincipalId: json['clientePrincipalId'] as String,
      clientePrincipalNombre: json['clientePrincipalNombre'] as String?,
      clienteSecundario1Id: json['clienteSecundario1Id'] as String?,
      clienteSecundario1Nombre: json['clienteSecundario1Nombre'] as String?,
      fecha: DateTime.parse(json['fecha'] as String),
      turno: json['turno'] as String?,
      duracionMinutos: json['duracionMinutos'] as int?,
      objetivoVisita: json['objetivoVisita'] as String?,
      resumenVisita: json['resumenVisita'] as String?,
      proximaAccion: json['proximaAccion'] as String?,
      fechaProximaAccion: json['fechaProximaAccion'] != null
          ? DateTime.parse(json['fechaProximaAccion'] as String)
          : null,
      resultadoVisita: json['resultadoVisita'] as String?,
      latitud: (json['latitud'] as num?)?.toDouble(),
      longitud: (json['longitud'] as num?)?.toDouble(),
      direccionCapturada: json['direccionCapturada'] as String?,
      datosDinamicos: json['datosDinamicos'] != null
          ? Map<String, dynamic>.from(json['datosDinamicos'] as Map)
          : null,
      productosPromocionados: (json['productosPromocionados'] as List?)
              ?.map((e) => ProductoPromocionado.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      muestrasEntregadas: (json['muestrasEntregadas'] as List?)
              ?.map((e) => MuestraEntregada.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      productosSolicitados: (json['productosSolicitados'] as List?)
              ?.map((e) => ProductoSolicitado.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      estado: json['estado'] as String,
      sincronizada: json['sincronizada'] as bool? ?? false,
      fechaCreacion: DateTime.parse(json['fechaCreacion'] as String),
      fechaModificacion: json['fechaModificacion'] != null
          ? DateTime.parse(json['fechaModificacion'] as String)
          : null,
      creadoPor: json['creadoPor'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'tipoInteraccionId': tipoInteraccionId,
      'tipoInteraccionNombre': tipoInteraccionNombre,
      'tipoInteraccionSubTipo': tipoInteraccionSubTipo,
      'tipoInteraccionIcono': tipoInteraccionIcono,
      'tipoInteraccionColor': tipoInteraccionColor,
      'relacionId': relacionId,
      'agenteId': agenteId,
      'agenteNombre': agenteNombre,
      'clientePrincipalId': clientePrincipalId,
      'clientePrincipalNombre': clientePrincipalNombre,
      'clienteSecundario1Id': clienteSecundario1Id,
      'clienteSecundario1Nombre': clienteSecundario1Nombre,
      'fecha': fecha.toIso8601String(),
      'turno': turno,
      'duracionMinutos': duracionMinutos,
      'objetivoVisita': objetivoVisita,
      'resumenVisita': resumenVisita,
      'proximaAccion': proximaAccion,
      'fechaProximaAccion': fechaProximaAccion?.toIso8601String(),
      'resultadoVisita': resultadoVisita,
      'latitud': latitud,
      'longitud': longitud,
      'direccionCapturada': direccionCapturada,
      'datosDinamicos': datosDinamicos,
      'productosPromocionados': productosPromocionados.map((e) => e.toJson()).toList(),
      'muestrasEntregadas': muestrasEntregadas.map((e) => e.toJson()).toList(),
      'productosSolicitados': productosSolicitados.map((e) => e.toJson()).toList(),
      'estado': estado,
      'sincronizada': sincronizada,
      'fechaCreacion': fechaCreacion.toIso8601String(),
      'fechaModificacion': fechaModificacion?.toIso8601String(),
      'creadoPor': creadoPor,
    };
  }

  // Para almacenamiento en SQLite
  Map<String, dynamic> toDb() {
    return {
      'id': id,
      'tipoInteraccionId': tipoInteraccionId,
      'tipoInteraccionNombre': tipoInteraccionNombre,
      'tipoInteraccionSubTipo': tipoInteraccionSubTipo,
      'tipoInteraccionIcono': tipoInteraccionIcono,
      'tipoInteraccionColor': tipoInteraccionColor,
      'relacionId': relacionId,
      'agenteId': agenteId,
      'agenteNombre': agenteNombre,
      'clientePrincipalId': clientePrincipalId,
      'clientePrincipalNombre': clientePrincipalNombre,
      'clienteSecundario1Id': clienteSecundario1Id,
      'clienteSecundario1Nombre': clienteSecundario1Nombre,
      'fecha': fecha.toIso8601String(),
      'turno': turno,
      'duracionMinutos': duracionMinutos,
      'objetivoVisita': objetivoVisita,
      'resumenVisita': resumenVisita,
      'proximaAccion': proximaAccion,
      'fechaProximaAccion': fechaProximaAccion?.toIso8601String(),
      'resultadoVisita': resultadoVisita,
      'latitud': latitud,
      'longitud': longitud,
      'direccionCapturada': direccionCapturada,
      'datosDinamicos': datosDinamicos?.toString(),
      'estado': estado,
      'sincronizada': sincronizada ? 1 : 0,
      'fechaCreacion': fechaCreacion.toIso8601String(),
      'fechaModificacion': fechaModificacion?.toIso8601String(),
      'creadoPor': creadoPor,
    };
  }

  factory Interaccion.fromDb(Map<String, dynamic> map) {
    return Interaccion(
      id: map['id'] as String,
      tipoInteraccionId: map['tipoInteraccionId'] as String,
      tipoInteraccionNombre: map['tipoInteraccionNombre'] as String,
      tipoInteraccionSubTipo: map['tipoInteraccionSubTipo'] as String,
      tipoInteraccionIcono: map['tipoInteraccionIcono'] as String?,
      tipoInteraccionColor: map['tipoInteraccionColor'] as String?,
      relacionId: map['relacionId'] as String,
      agenteId: map['agenteId'] as String,
      agenteNombre: map['agenteNombre'] as String?,
      clientePrincipalId: map['clientePrincipalId'] as String,
      clientePrincipalNombre: map['clientePrincipalNombre'] as String?,
      clienteSecundario1Id: map['clienteSecundario1Id'] as String?,
      clienteSecundario1Nombre: map['clienteSecundario1Nombre'] as String?,
      fecha: DateTime.parse(map['fecha'] as String),
      turno: map['turno'] as String?,
      duracionMinutos: map['duracionMinutos'] as int?,
      objetivoVisita: map['objetivoVisita'] as String?,
      resumenVisita: map['resumenVisita'] as String?,
      proximaAccion: map['proximaAccion'] as String?,
      fechaProximaAccion: map['fechaProximaAccion'] != null
          ? DateTime.parse(map['fechaProximaAccion'] as String)
          : null,
      resultadoVisita: map['resultadoVisita'] as String?,
      latitud: map['latitud'] as double?,
      longitud: map['longitud'] as double?,
      direccionCapturada: map['direccionCapturada'] as String?,
      datosDinamicos: null, // Will be handled separately if needed
      estado: map['estado'] as String,
      sincronizada: (map['sincronizada'] as int) == 1,
      fechaCreacion: DateTime.parse(map['fechaCreacion'] as String),
      fechaModificacion: map['fechaModificacion'] != null
          ? DateTime.parse(map['fechaModificacion'] as String)
          : null,
      creadoPor: map['creadoPor'] as String?,
    );
  }

  // Crear copia con cambios
  Interaccion copyWith({
    String? id,
    String? tipoInteraccionId,
    String? tipoInteraccionNombre,
    String? tipoInteraccionSubTipo,
    String? tipoInteraccionIcono,
    String? tipoInteraccionColor,
    String? relacionId,
    String? agenteId,
    String? agenteNombre,
    String? clientePrincipalId,
    String? clientePrincipalNombre,
    String? clienteSecundario1Id,
    String? clienteSecundario1Nombre,
    DateTime? fecha,
    String? turno,
    int? duracionMinutos,
    String? objetivoVisita,
    String? resumenVisita,
    String? proximaAccion,
    DateTime? fechaProximaAccion,
    String? resultadoVisita,
    double? latitud,
    double? longitud,
    String? direccionCapturada,
    Map<String, dynamic>? datosDinamicos,
    List<ProductoPromocionado>? productosPromocionados,
    List<MuestraEntregada>? muestrasEntregadas,
    List<ProductoSolicitado>? productosSolicitados,
    String? estado,
    bool? sincronizada,
    DateTime? fechaCreacion,
    DateTime? fechaModificacion,
    String? creadoPor,
  }) {
    return Interaccion(
      id: id ?? this.id,
      tipoInteraccionId: tipoInteraccionId ?? this.tipoInteraccionId,
      tipoInteraccionNombre: tipoInteraccionNombre ?? this.tipoInteraccionNombre,
      tipoInteraccionSubTipo: tipoInteraccionSubTipo ?? this.tipoInteraccionSubTipo,
      tipoInteraccionIcono: tipoInteraccionIcono ?? this.tipoInteraccionIcono,
      tipoInteraccionColor: tipoInteraccionColor ?? this.tipoInteraccionColor,
      relacionId: relacionId ?? this.relacionId,
      agenteId: agenteId ?? this.agenteId,
      agenteNombre: agenteNombre ?? this.agenteNombre,
      clientePrincipalId: clientePrincipalId ?? this.clientePrincipalId,
      clientePrincipalNombre: clientePrincipalNombre ?? this.clientePrincipalNombre,
      clienteSecundario1Id: clienteSecundario1Id ?? this.clienteSecundario1Id,
      clienteSecundario1Nombre: clienteSecundario1Nombre ?? this.clienteSecundario1Nombre,
      fecha: fecha ?? this.fecha,
      turno: turno ?? this.turno,
      duracionMinutos: duracionMinutos ?? this.duracionMinutos,
      objetivoVisita: objetivoVisita ?? this.objetivoVisita,
      resumenVisita: resumenVisita ?? this.resumenVisita,
      proximaAccion: proximaAccion ?? this.proximaAccion,
      fechaProximaAccion: fechaProximaAccion ?? this.fechaProximaAccion,
      resultadoVisita: resultadoVisita ?? this.resultadoVisita,
      latitud: latitud ?? this.latitud,
      longitud: longitud ?? this.longitud,
      direccionCapturada: direccionCapturada ?? this.direccionCapturada,
      datosDinamicos: datosDinamicos ?? this.datosDinamicos,
      productosPromocionados: productosPromocionados ?? this.productosPromocionados,
      muestrasEntregadas: muestrasEntregadas ?? this.muestrasEntregadas,
      productosSolicitados: productosSolicitados ?? this.productosSolicitados,
      estado: estado ?? this.estado,
      sincronizada: sincronizada ?? this.sincronizada,
      fechaCreacion: fechaCreacion ?? this.fechaCreacion,
      fechaModificacion: fechaModificacion ?? this.fechaModificacion,
      creadoPor: creadoPor ?? this.creadoPor,
    );
  }
}
