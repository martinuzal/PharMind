import 'frecuencia_indicador.dart';

class Relacion {
  final String id;
  final String tipoRelacionId;
  final String tipoRelacionNombre;
  final String tipoRelacionSubTipo;
  final String? tipoRelacionIcono;
  final String? tipoRelacionColor;
  final String? tipoRelacionSchema;

  final String codigoRelacion;
  final String agenteId;
  final String? agenteNombre;

  // Cliente Principal
  final String clientePrincipalId;
  final String? clientePrincipalNombre;
  final String? clientePrincipalTelefono;
  final String? clientePrincipalEmail;
  final String? clientePrincipalEspecialidad;

  // Clientes Secundarios
  final String? clienteSecundario1Id;
  final String? clienteSecundario1Nombre;
  final String? clienteSecundario2Id;
  final String? clienteSecundario2Nombre;

  final String? tipoRelacion;
  final DateTime fechaInicio;
  final DateTime? fechaFin;
  final String estado;

  // Campos de planificación
  final String? frecuenciaVisitas;
  final String? prioridad; // A, B, C
  final String? prioridadVisita;
  final String? observaciones;

  // Datos dinámicos
  final Map<String, dynamic>? datosDinamicos;

  // Indicador de frecuencia
  final FrecuenciaIndicador? frecuencia;

  // Última interacción
  final DateTime? ultimaInteraccionFecha;
  final String? ultimaInteraccionTipo;

  // Auditoría
  final DateTime fechaCreacion;
  final DateTime? fechaModificacion;

  Relacion({
    required this.id,
    required this.tipoRelacionId,
    required this.tipoRelacionNombre,
    required this.tipoRelacionSubTipo,
    this.tipoRelacionIcono,
    this.tipoRelacionColor,
    this.tipoRelacionSchema,
    required this.codigoRelacion,
    required this.agenteId,
    this.agenteNombre,
    required this.clientePrincipalId,
    this.clientePrincipalNombre,
    this.clientePrincipalTelefono,
    this.clientePrincipalEmail,
    this.clientePrincipalEspecialidad,
    this.clienteSecundario1Id,
    this.clienteSecundario1Nombre,
    this.clienteSecundario2Id,
    this.clienteSecundario2Nombre,
    this.tipoRelacion,
    required this.fechaInicio,
    this.fechaFin,
    required this.estado,
    this.frecuenciaVisitas,
    this.prioridad,
    this.prioridadVisita,
    this.observaciones,
    this.datosDinamicos,
    this.frecuencia,
    this.ultimaInteraccionFecha,
    this.ultimaInteraccionTipo,
    required this.fechaCreacion,
    this.fechaModificacion,
  });

  factory Relacion.fromJson(Map<String, dynamic> json) {
    return Relacion(
      id: json['id'] as String,
      tipoRelacionId: json['tipoRelacionId'] as String,
      tipoRelacionNombre: json['tipoRelacionNombre'] as String,
      tipoRelacionSubTipo: json['tipoRelacionSubTipo'] as String,
      tipoRelacionIcono: json['tipoRelacionIcono'] as String?,
      tipoRelacionColor: json['tipoRelacionColor'] as String?,
      tipoRelacionSchema: json['tipoRelacionSchema'] as String?,
      codigoRelacion: json['codigoRelacion'] as String,
      agenteId: json['agenteId'] as String,
      agenteNombre: json['agenteNombre'] as String?,
      clientePrincipalId: json['clientePrincipalId'] as String,
      clientePrincipalNombre: json['clientePrincipalNombre'] as String?,
      clientePrincipalTelefono: json['clientePrincipalTelefono'] as String?,
      clientePrincipalEmail: json['clientePrincipalEmail'] as String?,
      clientePrincipalEspecialidad: json['clientePrincipalEspecialidad'] as String?,
      clienteSecundario1Id: json['clienteSecundario1Id'] as String?,
      clienteSecundario1Nombre: json['clienteSecundario1Nombre'] as String?,
      clienteSecundario2Id: json['clienteSecundario2Id'] as String?,
      clienteSecundario2Nombre: json['clienteSecundario2Nombre'] as String?,
      tipoRelacion: json['tipoRelacion'] as String?,
      fechaInicio: DateTime.parse(json['fechaInicio'] as String),
      fechaFin: json['fechaFin'] != null ? DateTime.parse(json['fechaFin'] as String) : null,
      estado: json['estado'] as String,
      frecuenciaVisitas: json['frecuenciaVisitas'] as String?,
      prioridad: json['prioridad'] as String?,
      prioridadVisita: json['prioridadVisita'] as String?,
      observaciones: json['observaciones'] as String?,
      datosDinamicos: json['datosDinamicos'] != null
          ? Map<String, dynamic>.from(json['datosDinamicos'] as Map)
          : null,
      frecuencia: json['frecuencia'] != null
          ? FrecuenciaIndicador.fromJson(json['frecuencia'] as Map<String, dynamic>)
          : null,
      ultimaInteraccionFecha: json['ultimaInteraccionFecha'] != null
          ? DateTime.parse(json['ultimaInteraccionFecha'] as String)
          : null,
      ultimaInteraccionTipo: json['ultimaInteraccionTipo'] as String?,
      fechaCreacion: DateTime.parse(json['fechaCreacion'] as String),
      fechaModificacion: json['fechaModificacion'] != null
          ? DateTime.parse(json['fechaModificacion'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'tipoRelacionId': tipoRelacionId,
      'tipoRelacionNombre': tipoRelacionNombre,
      'tipoRelacionSubTipo': tipoRelacionSubTipo,
      'tipoRelacionIcono': tipoRelacionIcono,
      'tipoRelacionColor': tipoRelacionColor,
      'tipoRelacionSchema': tipoRelacionSchema,
      'codigoRelacion': codigoRelacion,
      'agenteId': agenteId,
      'agenteNombre': agenteNombre,
      'clientePrincipalId': clientePrincipalId,
      'clientePrincipalNombre': clientePrincipalNombre,
      'clientePrincipalTelefono': clientePrincipalTelefono,
      'clientePrincipalEmail': clientePrincipalEmail,
      'clientePrincipalEspecialidad': clientePrincipalEspecialidad,
      'clienteSecundario1Id': clienteSecundario1Id,
      'clienteSecundario1Nombre': clienteSecundario1Nombre,
      'clienteSecundario2Id': clienteSecundario2Id,
      'clienteSecundario2Nombre': clienteSecundario2Nombre,
      'tipoRelacion': tipoRelacion,
      'fechaInicio': fechaInicio.toIso8601String(),
      'fechaFin': fechaFin?.toIso8601String(),
      'estado': estado,
      'frecuenciaVisitas': frecuenciaVisitas,
      'prioridad': prioridad,
      'prioridadVisita': prioridadVisita,
      'observaciones': observaciones,
      'datosDinamicos': datosDinamicos,
      'frecuencia': frecuencia?.toJson(),
      'ultimaInteraccionFecha': ultimaInteraccionFecha?.toIso8601String(),
      'ultimaInteraccionTipo': ultimaInteraccionTipo,
      'fechaCreacion': fechaCreacion.toIso8601String(),
      'fechaModificacion': fechaModificacion?.toIso8601String(),
    };
  }

  // Para almacenamiento en SQLite
  Map<String, dynamic> toDb() {
    return {
      'id': id,
      'tipoRelacionId': tipoRelacionId,
      'tipoRelacionNombre': tipoRelacionNombre,
      'tipoRelacionSubTipo': tipoRelacionSubTipo,
      'tipoRelacionIcono': tipoRelacionIcono,
      'tipoRelacionColor': tipoRelacionColor,
      'tipoRelacionSchema': tipoRelacionSchema,
      'codigoRelacion': codigoRelacion,
      'agenteId': agenteId,
      'agenteNombre': agenteNombre,
      'clientePrincipalId': clientePrincipalId,
      'clientePrincipalNombre': clientePrincipalNombre,
      'clientePrincipalTelefono': clientePrincipalTelefono,
      'clientePrincipalEmail': clientePrincipalEmail,
      'clientePrincipalEspecialidad': clientePrincipalEspecialidad,
      'clienteSecundario1Id': clienteSecundario1Id,
      'clienteSecundario1Nombre': clienteSecundario1Nombre,
      'clienteSecundario2Id': clienteSecundario2Id,
      'clienteSecundario2Nombre': clienteSecundario2Nombre,
      'tipoRelacion': tipoRelacion,
      'fechaInicio': fechaInicio.toIso8601String(),
      'fechaFin': fechaFin?.toIso8601String(),
      'estado': estado,
      'frecuenciaVisitas': frecuenciaVisitas,
      'prioridad': prioridad,
      'prioridadVisita': prioridadVisita,
      'observaciones': observaciones,
      'datosDinamicos': datosDinamicos != null ? datosDinamicos.toString() : null,
      'frecuenciaJson': frecuencia != null ? frecuencia!.toMap().toString() : null,
      'ultimaInteraccionFecha': ultimaInteraccionFecha?.toIso8601String(),
      'ultimaInteraccionTipo': ultimaInteraccionTipo,
      'fechaCreacion': fechaCreacion.toIso8601String(),
      'fechaModificacion': fechaModificacion?.toIso8601String(),
    };
  }

  factory Relacion.fromDb(Map<String, dynamic> map) {
    return Relacion(
      id: map['id'] as String,
      tipoRelacionId: map['tipoRelacionId'] as String,
      tipoRelacionNombre: map['tipoRelacionNombre'] as String,
      tipoRelacionSubTipo: map['tipoRelacionSubTipo'] as String,
      tipoRelacionIcono: map['tipoRelacionIcono'] as String?,
      tipoRelacionColor: map['tipoRelacionColor'] as String?,
      tipoRelacionSchema: map['tipoRelacionSchema'] as String?,
      codigoRelacion: map['codigoRelacion'] as String,
      agenteId: map['agenteId'] as String,
      agenteNombre: map['agenteNombre'] as String?,
      clientePrincipalId: map['clientePrincipalId'] as String,
      clientePrincipalNombre: map['clientePrincipalNombre'] as String?,
      clientePrincipalTelefono: map['clientePrincipalTelefono'] as String?,
      clientePrincipalEmail: map['clientePrincipalEmail'] as String?,
      clientePrincipalEspecialidad: map['clientePrincipalEspecialidad'] as String?,
      clienteSecundario1Id: map['clienteSecundario1Id'] as String?,
      clienteSecundario1Nombre: map['clienteSecundario1Nombre'] as String?,
      clienteSecundario2Id: map['clienteSecundario2Id'] as String?,
      clienteSecundario2Nombre: map['clienteSecundario2Nombre'] as String?,
      tipoRelacion: map['tipoRelacion'] as String?,
      fechaInicio: DateTime.parse(map['fechaInicio'] as String),
      fechaFin: map['fechaFin'] != null ? DateTime.parse(map['fechaFin'] as String) : null,
      estado: map['estado'] as String,
      frecuenciaVisitas: map['frecuenciaVisitas'] as String?,
      prioridad: map['prioridad'] as String?,
      prioridadVisita: map['prioridadVisita'] as String?,
      observaciones: map['observaciones'] as String?,
      datosDinamicos: null, // Will be handled separately if needed
      ultimaInteraccionFecha: map['ultimaInteraccionFecha'] != null
          ? DateTime.parse(map['ultimaInteraccionFecha'] as String)
          : null,
      ultimaInteraccionTipo: map['ultimaInteraccionTipo'] as String?,
      fechaCreacion: DateTime.parse(map['fechaCreacion'] as String),
      fechaModificacion: map['fechaModificacion'] != null
          ? DateTime.parse(map['fechaModificacion'] as String)
          : null,
    );
  }
}
