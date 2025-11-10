class Configuracion {
  // Configuraciones generales
  final bool notificacionesHabilitadas;
  final bool sonidoHabilitado;
  final bool vibracionHabilitada;

  // Configuraciones de sincronización
  final bool sincronizacionAutomatica;
  final int intervaloSincronizacionMinutos; // 15, 30, 60, 120
  final bool sincronizarSoloWifi;

  // Configuraciones de visualización
  final String idioma; // 'es', 'en'
  final String formatoFecha; // 'dd/MM/yyyy', 'MM/dd/yyyy'
  final bool modoOscuro;

  // Configuraciones de geolocalización
  final bool geolocalizacionAutomatica;
  final int precisionGeolocalizacion; // 10, 50, 100 metros

  // Configuraciones de datos
  final int diasRetencionDatosLocales; // 7, 15, 30, 60 días
  final bool guardarBorradores;

  Configuracion({
    this.notificacionesHabilitadas = true,
    this.sonidoHabilitado = true,
    this.vibracionHabilitada = true,
    this.sincronizacionAutomatica = true,
    this.intervaloSincronizacionMinutos = 30,
    this.sincronizarSoloWifi = false,
    this.idioma = 'es',
    this.formatoFecha = 'dd/MM/yyyy',
    this.modoOscuro = false,
    this.geolocalizacionAutomatica = true,
    this.precisionGeolocalizacion = 50,
    this.diasRetencionDatosLocales = 30,
    this.guardarBorradores = true,
  });

  factory Configuracion.fromJson(Map<String, dynamic> json) {
    return Configuracion(
      notificacionesHabilitadas: json['notificacionesHabilitadas'] as bool? ?? true,
      sonidoHabilitado: json['sonidoHabilitado'] as bool? ?? true,
      vibracionHabilitada: json['vibracionHabilitada'] as bool? ?? true,
      sincronizacionAutomatica: json['sincronizacionAutomatica'] as bool? ?? true,
      intervaloSincronizacionMinutos: json['intervaloSincronizacionMinutos'] as int? ?? 30,
      sincronizarSoloWifi: json['sincronizarSoloWifi'] as bool? ?? false,
      idioma: json['idioma'] as String? ?? 'es',
      formatoFecha: json['formatoFecha'] as String? ?? 'dd/MM/yyyy',
      modoOscuro: json['modoOscuro'] as bool? ?? false,
      geolocalizacionAutomatica: json['geolocalizacionAutomatica'] as bool? ?? true,
      precisionGeolocalizacion: json['precisionGeolocalizacion'] as int? ?? 50,
      diasRetencionDatosLocales: json['diasRetencionDatosLocales'] as int? ?? 30,
      guardarBorradores: json['guardarBorradores'] as bool? ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'notificacionesHabilitadas': notificacionesHabilitadas,
      'sonidoHabilitado': sonidoHabilitado,
      'vibracionHabilitada': vibracionHabilitada,
      'sincronizacionAutomatica': sincronizacionAutomatica,
      'intervaloSincronizacionMinutos': intervaloSincronizacionMinutos,
      'sincronizarSoloWifi': sincronizarSoloWifi,
      'idioma': idioma,
      'formatoFecha': formatoFecha,
      'modoOscuro': modoOscuro,
      'geolocalizacionAutomatica': geolocalizacionAutomatica,
      'precisionGeolocalizacion': precisionGeolocalizacion,
      'diasRetencionDatosLocales': diasRetencionDatosLocales,
      'guardarBorradores': guardarBorradores,
    };
  }

  Configuracion copyWith({
    bool? notificacionesHabilitadas,
    bool? sonidoHabilitado,
    bool? vibracionHabilitada,
    bool? sincronizacionAutomatica,
    int? intervaloSincronizacionMinutos,
    bool? sincronizarSoloWifi,
    String? idioma,
    String? formatoFecha,
    bool? modoOscuro,
    bool? geolocalizacionAutomatica,
    int? precisionGeolocalizacion,
    int? diasRetencionDatosLocales,
    bool? guardarBorradores,
  }) {
    return Configuracion(
      notificacionesHabilitadas: notificacionesHabilitadas ?? this.notificacionesHabilitadas,
      sonidoHabilitado: sonidoHabilitado ?? this.sonidoHabilitado,
      vibracionHabilitada: vibracionHabilitada ?? this.vibracionHabilitada,
      sincronizacionAutomatica: sincronizacionAutomatica ?? this.sincronizacionAutomatica,
      intervaloSincronizacionMinutos: intervaloSincronizacionMinutos ?? this.intervaloSincronizacionMinutos,
      sincronizarSoloWifi: sincronizarSoloWifi ?? this.sincronizarSoloWifi,
      idioma: idioma ?? this.idioma,
      formatoFecha: formatoFecha ?? this.formatoFecha,
      modoOscuro: modoOscuro ?? this.modoOscuro,
      geolocalizacionAutomatica: geolocalizacionAutomatica ?? this.geolocalizacionAutomatica,
      precisionGeolocalizacion: precisionGeolocalizacion ?? this.precisionGeolocalizacion,
      diasRetencionDatosLocales: diasRetencionDatosLocales ?? this.diasRetencionDatosLocales,
      guardarBorradores: guardarBorradores ?? this.guardarBorradores,
    );
  }
}
