import 'dart:convert';
import 'dart:math';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/gasto.dart';

class GastosService {
  static const String _keyGastos = 'gastos';

  Future<ResumenGastos> obtenerResumen({PeriodoGastos? periodo}) async {
    final prefs = await SharedPreferences.getInstance();
    final String? gastosJson = prefs.getString(_keyGastos);

    List<Gasto> gastos = [];
    if (gastosJson != null) {
      final List<dynamic> decoded = jsonDecode(gastosJson);
      gastos = decoded.map((json) => Gasto.fromJson(json)).toList();
    } else {
      // Generar datos de ejemplo
      gastos = _generarDatosEjemplo();
      await _guardarGastos(gastos);
    }

    // Filtrar por período si se especifica
    if (periodo != null) {
      gastos = gastos.where((g) => periodo.incluyeFecha(g.fecha)).toList();
    }

    // Calcular totales por estado
    double totalGastos = 0.0;
    double totalPendiente = 0.0;
    double totalAprobado = 0.0;
    double totalRechazado = 0.0;
    int cantidadGastos = gastos.length;
    int cantidadPendientes = 0;
    int cantidadAprobados = 0;
    int cantidadRechazados = 0;

    // Calcular totales por categoría
    Map<String, double> gastosPorCategoria = {};

    for (var gasto in gastos) {
      totalGastos += gasto.monto;

      switch (gasto.estado) {
        case 'pendiente':
          totalPendiente += gasto.monto;
          cantidadPendientes++;
          break;
        case 'aprobado':
          totalAprobado += gasto.monto;
          cantidadAprobados++;
          break;
        case 'rechazado':
          totalRechazado += gasto.monto;
          cantidadRechazados++;
          break;
      }

      // Acumular por categoría
      gastosPorCategoria[gasto.categoria] =
          (gastosPorCategoria[gasto.categoria] ?? 0.0) + gasto.monto;
    }

    return ResumenGastos(
      totalGastos: totalGastos,
      totalPendiente: totalPendiente,
      totalAprobado: totalAprobado,
      totalRechazado: totalRechazado,
      cantidadGastos: cantidadGastos,
      cantidadPendientes: cantidadPendientes,
      cantidadAprobados: cantidadAprobados,
      cantidadRechazados: cantidadRechazados,
      gastos: gastos,
      gastosPorCategoria: gastosPorCategoria,
    );
  }

  Future<void> agregarGasto(Gasto gasto) async {
    final prefs = await SharedPreferences.getInstance();
    final String? gastosJson = prefs.getString(_keyGastos);

    List<Gasto> gastos = [];
    if (gastosJson != null) {
      final List<dynamic> decoded = jsonDecode(gastosJson);
      gastos = decoded.map((json) => Gasto.fromJson(json)).toList();
    }

    gastos.add(gasto);
    await _guardarGastos(gastos);
  }

  Future<void> actualizarGasto(Gasto gastoActualizado) async {
    final prefs = await SharedPreferences.getInstance();
    final String? gastosJson = prefs.getString(_keyGastos);

    if (gastosJson != null) {
      final List<dynamic> decoded = jsonDecode(gastosJson);
      List<Gasto> gastos = decoded.map((json) => Gasto.fromJson(json)).toList();

      final index = gastos.indexWhere((g) => g.id == gastoActualizado.id);
      if (index != -1) {
        gastos[index] = gastoActualizado;
        await _guardarGastos(gastos);
      }
    }
  }

  Future<void> eliminarGasto(String id) async {
    final prefs = await SharedPreferences.getInstance();
    final String? gastosJson = prefs.getString(_keyGastos);

    if (gastosJson != null) {
      final List<dynamic> decoded = jsonDecode(gastosJson);
      List<Gasto> gastos = decoded.map((json) => Gasto.fromJson(json)).toList();

      gastos.removeWhere((g) => g.id == id);
      await _guardarGastos(gastos);
    }
  }

  Future<void> _guardarGastos(List<Gasto> gastos) async {
    final prefs = await SharedPreferences.getInstance();
    final gastosJson = jsonEncode(gastos.map((g) => g.toJson()).toList());
    await prefs.setString(_keyGastos, gastosJson);
  }

  List<Gasto> _generarDatosEjemplo() {
    final random = Random();
    final ahora = DateTime.now();
    final gastos = <Gasto>[];

    final categorias = [
      'transporte',
      'alimentacion',
      'hospedaje',
      'combustible',
      'materiales',
      'otros'
    ];

    final estados = ['pendiente', 'aprobado', 'rechazado'];

    final conceptos = {
      'transporte': [
        'Taxi al cliente',
        'Uber a reunión',
        'Peaje autopista',
        'Estacionamiento',
        'Transporte público'
      ],
      'alimentacion': [
        'Almuerzo con cliente',
        'Cena de negocios',
        'Desayuno de trabajo',
        'Café con prospecto'
      ],
      'hospedaje': [
        'Hotel - Viaje comercial',
        'Hospedaje conferencia',
        'Alojamiento capacitación'
      ],
      'combustible': [
        'Gasolina vehículo empresa',
        'Combustible ruta comercial',
        'Diesel camioneta'
      ],
      'materiales': [
        'Material promocional',
        'Muestras médicas',
        'Catálogos productos',
        'Material POP'
      ],
      'otros': [
        'Artículos de oficina',
        'Envío documentos',
        'Servicios varios'
      ],
    };

    // Generar 20 gastos de ejemplo
    for (int i = 0; i < 20; i++) {
      final categoria = categorias[random.nextInt(categorias.length)];
      final conceptosList = conceptos[categoria]!;
      final concepto = conceptosList[random.nextInt(conceptosList.length)];

      // Montos según categoría
      double monto;
      switch (categoria) {
        case 'hospedaje':
          monto = 80.0 + random.nextDouble() * 120.0; // 80-200
          break;
        case 'alimentacion':
          monto = 15.0 + random.nextDouble() * 45.0; // 15-60
          break;
        case 'combustible':
          monto = 30.0 + random.nextDouble() * 50.0; // 30-80
          break;
        case 'transporte':
          monto = 5.0 + random.nextDouble() * 25.0; // 5-30
          break;
        case 'materiales':
          monto = 20.0 + random.nextDouble() * 80.0; // 20-100
          break;
        default:
          monto = 10.0 + random.nextDouble() * 40.0; // 10-50
      }

      // Más gastos recientes pendientes, más viejos aprobados/rechazados
      String estado;
      if (i < 5) {
        estado = 'pendiente';
      } else if (i < 8) {
        estado = estados[random.nextInt(estados.length)];
      } else {
        estado = random.nextDouble() > 0.2 ? 'aprobado' : 'rechazado';
      }

      final diasAtras = random.nextInt(45);
      final fecha = ahora.subtract(Duration(days: diasAtras));

      gastos.add(Gasto(
        id: 'gasto_$i',
        concepto: concepto,
        descripcion: 'Gasto realizado en el marco de actividades comerciales',
        monto: double.parse(monto.toStringAsFixed(2)),
        moneda: 'USD',
        fecha: fecha,
        categoria: categoria,
        estado: estado,
        observaciones: estado == 'rechazado'
            ? 'Falta documentación o no cumple política'
            : null,
        comprobantes: [
          'comprobante_${i}_1.jpg',
          if (random.nextBool()) 'comprobante_${i}_2.jpg'
        ],
        fechaCreacion: fecha,
      ));
    }

    // Ordenar por fecha (más recientes primero)
    gastos.sort((a, b) => b.fecha.compareTo(a.fecha));
    return gastos;
  }

  Future<List<Gasto>> obtenerGastosPorPeriodo(PeriodoGastos periodo) async {
    final resumen = await obtenerResumen(periodo: periodo);
    return resumen.gastos;
  }

  Future<List<Gasto>> obtenerGastosPorEstado(String estado) async {
    final resumen = await obtenerResumen();
    return resumen.gastos.where((g) => g.estado == estado).toList();
  }

  Future<List<Gasto>> obtenerGastosPorCategoria(String categoria) async {
    final resumen = await obtenerResumen();
    return resumen.gastos.where((g) => g.categoria == categoria).toList();
  }
}
