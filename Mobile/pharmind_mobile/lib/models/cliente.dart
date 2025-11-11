class Cliente {
  final String id;
  final String tipoClienteId;
  final String tipoClienteNombre;
  final String? tipoClienteSubTipo;

  final String codigoCliente;
  final String nombre;
  final String? apellido;
  final String razonSocial;

  final String? especialidad;
  final String? categoria;
  final String? segmento;

  final String? email;
  final String? telefono;

  // Dirección
  final String? direccionCompleta;
  final String? ciudad;
  final String? provincia;

  // Institución
  final String? institucionId;
  final String? institucionNombre;

  final String? estado;

  // Datos dinámicos
  final Map<String, dynamic>? datosDinamicos;

  Cliente({
    required this.id,
    required this.tipoClienteId,
    required this.tipoClienteNombre,
    this.tipoClienteSubTipo,
    required this.codigoCliente,
    required this.nombre,
    this.apellido,
    required this.razonSocial,
    this.especialidad,
    this.categoria,
    this.segmento,
    this.email,
    this.telefono,
    this.direccionCompleta,
    this.ciudad,
    this.provincia,
    this.institucionId,
    this.institucionNombre,
    this.estado,
    this.datosDinamicos,
  });

  factory Cliente.fromJson(Map<String, dynamic> json) {
    return Cliente(
      id: json['id'] as String,
      tipoClienteId: json['tipoClienteId'] as String,
      tipoClienteNombre: json['tipoClienteNombre'] as String? ?? '',
      tipoClienteSubTipo: json['tipoClienteSubTipo'] as String?,
      codigoCliente: json['codigoCliente'] as String? ?? '',
      nombre: json['nombre'] as String? ?? '',
      apellido: json['apellido'] as String?,
      razonSocial: json['razonSocial'] as String? ?? '',
      especialidad: json['especialidad'] as String?,
      categoria: json['categoria'] as String?,
      segmento: json['segmento'] as String?,
      email: json['email'] as String?,
      telefono: json['telefono'] as String?,
      direccionCompleta: json['direccionCompleta'] as String?,
      ciudad: json['ciudad'] as String?,
      provincia: json['provincia'] as String?,
      institucionId: json['institucionId'] as String?,
      institucionNombre: json['institucionNombre'] as String?,
      estado: json['estado'] as String?,
      datosDinamicos: json['datosDinamicos'] != null
          ? Map<String, dynamic>.from(json['datosDinamicos'] as Map)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'tipoClienteId': tipoClienteId,
      'tipoClienteNombre': tipoClienteNombre,
      'tipoClienteSubTipo': tipoClienteSubTipo,
      'codigoCliente': codigoCliente,
      'nombre': nombre,
      'apellido': apellido,
      'razonSocial': razonSocial,
      'especialidad': especialidad,
      'categoria': categoria,
      'segmento': segmento,
      'email': email,
      'telefono': telefono,
      'direccionCompleta': direccionCompleta,
      'ciudad': ciudad,
      'provincia': provincia,
      'institucionId': institucionId,
      'institucionNombre': institucionNombre,
      'estado': estado,
      'datosDinamicos': datosDinamicos,
    };
  }

  // Para almacenamiento en SQLite
  Map<String, dynamic> toDb() {
    return {
      'id': id,
      'tipoClienteId': tipoClienteId,
      'tipoClienteNombre': tipoClienteNombre,
      'tipoClienteSubTipo': tipoClienteSubTipo,
      'codigoCliente': codigoCliente,
      'nombre': nombre,
      'apellido': apellido,
      'razonSocial': razonSocial,
      'especialidad': especialidad,
      'categoria': categoria,
      'segmento': segmento,
      'email': email,
      'telefono': telefono,
      'direccionCompleta': direccionCompleta,
      'ciudad': ciudad,
      'provincia': provincia,
      'institucionId': institucionId,
      'institucionNombre': institucionNombre,
      'estado': estado,
      'datosDinamicos': datosDinamicos?.toString(),
    };
  }

  factory Cliente.fromDb(Map<String, dynamic> map) {
    return Cliente(
      id: map['id'] as String,
      tipoClienteId: map['tipoClienteId'] as String,
      tipoClienteNombre: map['tipoClienteNombre'] as String? ?? '',
      tipoClienteSubTipo: map['tipoClienteSubTipo'] as String?,
      codigoCliente: map['codigoCliente'] as String? ?? '',
      nombre: map['nombre'] as String? ?? '',
      apellido: map['apellido'] as String?,
      razonSocial: map['razonSocial'] as String? ?? '',
      especialidad: map['especialidad'] as String?,
      categoria: map['categoria'] as String?,
      segmento: map['segmento'] as String?,
      email: map['email'] as String?,
      telefono: map['telefono'] as String?,
      direccionCompleta: map['direccionCompleta'] as String?,
      ciudad: map['ciudad'] as String?,
      provincia: map['provincia'] as String?,
      institucionId: map['institucionId'] as String?,
      institucionNombre: map['institucionNombre'] as String?,
      estado: map['estado'] as String?,
      datosDinamicos: null, // Will be handled separately if needed
    );
  }
}
