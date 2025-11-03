class SyncStats {
  final DateTime timestamp;
  final int esquemasDescargados;
  final int entidadesDescargadas;
  final int entidadesEnviadas;
  final Map<String, int> entidadesPorTipo; // nombreEntidad -> cantidad
  final bool exitosa;
  final String? errorMessage;

  SyncStats({
    required this.timestamp,
    this.esquemasDescargados = 0,
    this.entidadesDescargadas = 0,
    this.entidadesEnviadas = 0,
    this.entidadesPorTipo = const {},
    this.exitosa = true,
    this.errorMessage,
  });

  Map<String, dynamic> toJson() {
    return {
      'timestamp': timestamp.toIso8601String(),
      'esquemasDescargados': esquemasDescargados,
      'entidadesDescargadas': entidadesDescargadas,
      'entidadesEnviadas': entidadesEnviadas,
      'entidadesPorTipo': entidadesPorTipo,
      'exitosa': exitosa,
      'errorMessage': errorMessage,
    };
  }

  factory SyncStats.fromJson(Map<String, dynamic> json) {
    return SyncStats(
      timestamp: DateTime.parse(json['timestamp']),
      esquemasDescargados: json['esquemasDescargados'] ?? 0,
      entidadesDescargadas: json['entidadesDescargadas'] ?? 0,
      entidadesEnviadas: json['entidadesEnviadas'] ?? 0,
      entidadesPorTipo: Map<String, int>.from(json['entidadesPorTipo'] ?? {}),
      exitosa: json['exitosa'] ?? true,
      errorMessage: json['errorMessage'],
    );
  }

  String getSummary() {
    if (!exitosa) {
      return 'Error: ${errorMessage ?? "Error desconocido"}';
    }

    final parts = <String>[];

    if (esquemasDescargados > 0) {
      parts.add('$esquemasDescargados esquemas');
    }

    if (entidadesDescargadas > 0) {
      parts.add('$entidadesDescargadas recibidas');
    }

    if (entidadesEnviadas > 0) {
      parts.add('$entidadesEnviadas enviadas');
    }

    if (parts.isEmpty) {
      return 'Sin cambios';
    }

    return parts.join(', ');
  }
}
