import 'dart:convert';
import 'dart:math';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/eficiencia.dart';

class EficienciaService {
  static const String _keyTareas = 'tareas_geo';

  Future<ResumenEficiencia> obtenerResumen() async {
    final prefs = await SharedPreferences.getInstance();
    final String? tareasJson = prefs.getString(_keyTareas);

    List<TareaGeo> tareas = [];
    if (tareasJson != null) {
      final List<dynamic> decoded = jsonDecode(tareasJson);
      tareas = decoded.map((json) => TareaGeo.fromJson(json)).toList();
    } else {
      // Generar datos de ejemplo
      tareas = _generarDatosEjemplo();
      await _guardarTareas(tareas);
    }

    // Calcular estadísticas
    final completadas = tareas.where((t) => t.estado == 'completada').length;
    final pendientes = tareas.where((t) => t.estado == 'pendiente').length;
    final enProgreso = tareas.where((t) => t.estado == 'en_progreso').length;

    // Calcular distancia total (usando fórmula de Haversine simplificada)
    double distanciaTotal = 0.0;
    for (int i = 0; i < tareas.length - 1; i++) {
      distanciaTotal += _calcularDistancia(
        tareas[i].latitud,
        tareas[i].longitud,
        tareas[i + 1].latitud,
        tareas[i + 1].longitud,
      );
    }

    // Calcular tiempo total
    int tiempoTotal = 0;
    for (var tarea in tareas) {
      if (tarea.duracionMinutos != null) {
        tiempoTotal += tarea.duracionMinutos!;
      }
    }

    // Calcular eficiencia (tareas completadas / total)
    double eficiencia = tareas.isNotEmpty ? (completadas / tareas.length * 100) : 0;

    return ResumenEficiencia(
      totalTareas: tareas.length,
      tareasCompletadas: completadas,
      tareasPendientes: pendientes,
      tareasEnProgreso: enProgreso,
      distanciaTotal: distanciaTotal,
      tiempoTotal: tiempoTotal,
      eficienciaPromedio: eficiencia,
      tareas: tareas,
    );
  }

  Future<void> _guardarTareas(List<TareaGeo> tareas) async {
    final prefs = await SharedPreferences.getInstance();
    final tareasJson = jsonEncode(tareas.map((t) => t.toJson()).toList());
    await prefs.setString(_keyTareas, tareasJson);
  }

  double _calcularDistancia(double lat1, double lon1, double lat2, double lon2) {
    const R = 6371.0; // Radio de la Tierra en kilómetros
    final dLat = _gradosARadianes(lat2 - lat1);
    final dLon = _gradosARadianes(lon2 - lon1);

    final a = sin(dLat / 2) * sin(dLat / 2) +
        cos(_gradosARadianes(lat1)) *
            cos(_gradosARadianes(lat2)) *
            sin(dLon / 2) *
            sin(dLon / 2);

    final c = 2 * atan2(sqrt(a), sqrt(1 - a));
    return R * c;
  }

  double _gradosARadianes(double grados) {
    return grados * pi / 180;
  }

  List<TareaGeo> _generarDatosEjemplo() {
    final random = Random();
    final ahora = DateTime.now();
    final tareas = <TareaGeo>[];

    // Coordenadas de ejemplo (área de Madrid, España)
    final double latBase = 40.4168;
    final double lonBase = -3.7038;

    final tipos = ['visita', 'llamada', 'reunion', 'otro'];
    final estados = ['completada', 'pendiente', 'en_progreso'];
    final clientes = [
      'Farmacia Central',
      'Hospital San Carlos',
      'Clínica La Paz',
      'Farmacia del Sol',
      'Centro Médico Norte',
      'Hospital Universitario',
      'Clínica Dental Sur',
      'Farmacia 24h',
    ];

    for (int i = 0; i < 15; i++) {
      // Generar coordenadas aleatorias en un radio de ~10km
      final lat = latBase + (random.nextDouble() - 0.5) * 0.1;
      final lon = lonBase + (random.nextDouble() - 0.5) * 0.1;

      final tipo = tipos[random.nextInt(tipos.length)];
      final estado = i < 8 ? 'completada' : estados[random.nextInt(estados.length)];
      final cliente = clientes[random.nextInt(clientes.length)];

      tareas.add(TareaGeo(
        id: 'tarea_$i',
        titulo: '${tipo == 'visita' ? 'Visita a' : tipo == 'llamada' ? 'Llamar a' : tipo == 'reunion' ? 'Reunión con' : 'Gestión de'} $cliente',
        descripcion: 'Seguimiento de productos y presentación de novedades',
        fecha: ahora.subtract(Duration(days: random.nextInt(15))),
        estado: estado,
        tipo: tipo,
        clienteNombre: cliente,
        latitud: lat,
        longitud: lon,
        direccion: 'Calle ${random.nextInt(100)}, Madrid',
        duracionMinutos: tipo == 'visita' ? 30 + random.nextInt(60) : 15 + random.nextInt(30),
      ));
    }

    // Ordenar por fecha
    tareas.sort((a, b) => b.fecha.compareTo(a.fecha));
    return tareas;
  }

  List<ZonaGeografica> obtenerZonasGeograficas(List<TareaGeo> tareas) {
    if (tareas.isEmpty) return [];

    // Agrupar tareas por proximidad (clustering simple)
    final zonas = <ZonaGeografica>[];
    final radio = 0.05; // ~5km

    final List<TareaGeo> tareasRestantes = List.from(tareas);

    while (tareasRestantes.isNotEmpty) {
      final tarea = tareasRestantes.removeAt(0);
      final tareasEnZona = [tarea];

      tareasRestantes.removeWhere((t) {
        final distancia = _calcularDistancia(
          tarea.latitud,
          tarea.longitud,
          t.latitud,
          t.longitud,
        );
        if (distancia < radio * 111) {
          // 111 km por grado aprox
          tareasEnZona.add(t);
          return true;
        }
        return false;
      });

      // Calcular centro de la zona
      final latPromedio =
          tareasEnZona.map((t) => t.latitud).reduce((a, b) => a + b) /
              tareasEnZona.length;
      final lonPromedio =
          tareasEnZona.map((t) => t.longitud).reduce((a, b) => a + b) /
              tareasEnZona.length;

      zonas.add(ZonaGeografica(
        nombre: 'Zona ${zonas.length + 1}',
        cantidadTareas: tareasEnZona.length,
        latitudCentro: latPromedio,
        longitudCentro: lonPromedio,
      ));
    }

    return zonas;
  }
}
