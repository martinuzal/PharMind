import 'package:dio/dio.dart';
import '../models/producto.dart';
import '../models/inventario_agente.dart';
import 'api_service.dart';
import 'cache_service.dart';

class ProductoService {
  final Dio _dio;
  final CacheService _cacheService = CacheService();
  static const String _baseUrl = '${ApiService.baseUrl}/api/productos';
  static const String _inventarioUrl = '${ApiService.baseUrl}/api/inventarios';

  ProductoService() : _dio = ApiService().dio;

  /// Obtener todos los productos activos (con soporte offline)
  Future<List<Producto>> getProductos() async {
    try {
      // Intentar cargar desde API
      final response = await _dio.get(_baseUrl);

      if (response.statusCode == 200) {
        final List<dynamic> data = response.data as List;
        return data.map((json) => Producto.fromJson(json)).toList();
      }
      throw Exception('Error al obtener productos');
    } catch (e) {
      print('⚠️ Error al cargar productos desde API: $e');
      print('📦 Intentando cargar desde caché...');

      // Si falla la API, cargar desde caché
      try {
        final cachedData = await _cacheService.getCachedProductos();
        if (cachedData.isNotEmpty) {
          print('✅ ${cachedData.length} productos cargados desde caché');
          return cachedData.map((json) => Producto.fromJson(json)).toList();
        }
      } catch (cacheError) {
        print('❌ Error al cargar desde caché: $cacheError');
      }

      rethrow;
    }
  }

  /// Obtener un producto por ID
  Future<Producto> getProducto(String id) async {
    try {
      final response = await _dio.get('$_baseUrl/$id');

      if (response.statusCode == 200) {
        return Producto.fromJson(response.data);
      }
      throw Exception('Error al obtener producto');
    } catch (e) {
      print('Error en getProducto: $e');
      rethrow;
    }
  }

  /// Obtener productos por categoría
  Future<List<Producto>> getProductosPorCategoria(String categoria) async {
    try {
      final response = await _dio.get(
        _baseUrl,
        queryParameters: {'categoria': categoria},
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = response.data as List;
        return data.map((json) => Producto.fromJson(json)).toList();
      }
      throw Exception('Error al obtener productos por categoría');
    } catch (e) {
      print('Error en getProductosPorCategoria: $e');
      rethrow;
    }
  }

  /// Obtener inventario del agente (con soporte offline)
  Future<List<InventarioAgente>> getInventarioAgente(String agenteId) async {
    try {
      final response = await _dio.get(
        '$_inventarioUrl/agente/$agenteId',
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = response.data as List;

        // Guardar en caché para uso offline
        await _cacheService.saveInventarioCache(data.cast<Map<String, dynamic>>());

        return data.map((json) => InventarioAgente.fromJson(json)).toList();
      }
      throw Exception('Error al obtener inventario');
    } catch (e) {
      print('⚠️ Error al cargar inventario desde API: $e');
      print('📦 Intentando cargar desde caché...');

      // Si falla la API, cargar desde caché
      try {
        final cachedData = await _cacheService.getCachedInventario();
        if (cachedData.isNotEmpty) {
          print('✅ ${cachedData.length} items de inventario cargados desde caché');
          return cachedData.map((json) => InventarioAgente.fromJson(json)).toList();
        }
      } catch (cacheError) {
        print('❌ Error al cargar desde caché: $cacheError');
      }

      rethrow;
    }
  }

  /// Actualizar cantidad de inventario (después de entregar muestras)
  Future<InventarioAgente> actualizarInventario(
    String inventarioId,
    int cantidadEntregada,
  ) async {
    try {
      final response = await _dio.put(
        '$_inventarioUrl/$inventarioId',
        data: {
          'cantidadEntregada': cantidadEntregada,
        },
      );

      if (response.statusCode == 200) {
        return InventarioAgente.fromJson(response.data);
      }
      throw Exception('Error al actualizar inventario');
    } catch (e) {
      print('Error en actualizarInventario: $e');
      rethrow;
    }
  }

  /// Buscar productos por nombre o código
  Future<List<Producto>> buscarProductos(String query) async {
    try {
      final response = await _dio.get(
        '$_baseUrl/buscar',
        queryParameters: {'q': query},
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = response.data as List;
        return data.map((json) => Producto.fromJson(json)).toList();
      }
      throw Exception('Error al buscar productos');
    } catch (e) {
      print('Error en buscarProductos: $e');
      rethrow;
    }
  }

  /// Obtener todas las categorías de productos
  Future<List<String>> getCategorias() async {
    try {
      final response = await _dio.get('$_baseUrl/categorias');

      if (response.statusCode == 200) {
        final List<dynamic> data = response.data as List;
        return data.map((cat) => cat.toString()).toList();
      }
      throw Exception('Error al obtener categorías');
    } catch (e) {
      print('Error en getCategorias: $e');
      rethrow;
    }
  }

  /// Obtener solo productos que son muestras médicas
  Future<List<Producto>> getProductosMuestras() async {
    try {
      final response = await _dio.get('$_baseUrl/muestras');

      if (response.statusCode == 200) {
        final List<dynamic> data = response.data as List;
        return data.map((json) => Producto.fromJson(json)).toList();
      }
      throw Exception('Error al obtener muestras médicas');
    } catch (e) {
      print('Error en getProductosMuestras: $e');
      rethrow;
    }
  }

  /// Obtener items de inventario con stock bajo
  Future<List<InventarioAgente>> getInventarioStockBajo(String agenteId) async {
    try {
      final response = await _dio.get(
        '$_inventarioUrl/agente/$agenteId/stock-bajo',
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = response.data as List;
        return data.map((json) => InventarioAgente.fromJson(json)).toList();
      }
      throw Exception('Error al obtener items con stock bajo');
    } catch (e) {
      print('Error en getInventarioStockBajo: $e');
      rethrow;
    }
  }

  /// Obtener items de inventario por vencer
  Future<List<InventarioAgente>> getInventarioPorVencer(String agenteId) async {
    try {
      final response = await _dio.get(
        '$_inventarioUrl/agente/$agenteId/por-vencer',
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = response.data as List;
        return data.map((json) => InventarioAgente.fromJson(json)).toList();
      }
      throw Exception('Error al obtener items por vencer');
    } catch (e) {
      print('Error en getInventarioPorVencer: $e');
      rethrow;
    }
  }
}
