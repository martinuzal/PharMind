import '../models/relacion.dart';
import '../models/interaccion.dart';
import '../models/tipo_interaccion.dart';
import '../models/producto.dart';
import '../models/cita.dart';
import '../models/cliente.dart';
import 'mobile_api_service.dart';
import 'cita_service.dart';
import 'cache_service.dart';
import 'producto_service.dart';
import 'dart:convert';

/// Callback para reportar el progreso de sincronización
typedef SyncProgressCallback = void Function({
  required String tableName,
  int? total,
  int? synced,
  bool? isLoading,
  bool? isCompleted,
  String? error,
});

/// Servicio para manejar la sincronización completa de datos offline
class OfflineSyncService {
  final MobileApiService _apiService = MobileApiService();
  final CitaService _citaService = CitaService();
  final CacheService _cacheService = CacheService();
  final ProductoService _productoService = ProductoService();

  /// Realiza la sincronización completa de todos los datos
  ///
  /// [agenteId] - ID del agente para filtrar las relaciones e interacciones
  /// [onProgress] - Callback para reportar el progreso de cada tabla
  /// [onStart] - Callback que se llama al iniciar la sincronización
  /// [onComplete] - Callback que se llama al completar toda la sincronización
  Future<void> syncAll({
    required String agenteId,
    required SyncProgressCallback onProgress,
    VoidCallback? onStart,
    VoidCallback? onComplete,
  }) async {
    print('🔄 Iniciando sincronización completa de datos...');

    onStart?.call();

    try {
      // 1. Sincronizar Clientes (solo los que tienen relación con el agente)
      // Las entidades dinámicas están incluidas en datosDinamicos de cada cliente
      await _syncClientes(agenteId: agenteId, onProgress: onProgress);

      // 2. Sincronizar Relaciones
      // Las entidades dinámicas están incluidas en datosDinamicos de cada relación
      await _syncRelaciones(agenteId: agenteId, onProgress: onProgress);

      // 3. Sincronizar Interacciones
      // Las entidades dinámicas están incluidas en datosDinamicos de cada interacción
      await _syncInteracciones(agenteId: agenteId, onProgress: onProgress);

      // 4. Sincronizar Tipos de Interacción
      await _syncTiposInteraccion(onProgress: onProgress);

      // 5. Sincronizar Productos
      await _syncProductos(onProgress: onProgress);

      // 6. Sincronizar Inventario
      await _syncInventario(agenteId: agenteId, onProgress: onProgress);

      // 7. Sincronizar Citas
      await _syncCitas(agenteId: agenteId, onProgress: onProgress);

      // 7. Sincronizar Muestras Entregadas
      await _syncMuestrasEntregadas(agenteId: agenteId, onProgress: onProgress);

      // 8. Sincronizar Productos Promocionados
      await _syncProductosPromocionados(agenteId: agenteId, onProgress: onProgress);

      // 9. Sincronizar Productos Solicitados
      await _syncProductosSolicitados(agenteId: agenteId, onProgress: onProgress);

      // 10. Sincronizar Movimientos de Inventario
      await _syncMovimientosInventario(agenteId: agenteId, onProgress: onProgress);

      // 11. Sincronizar Tiempo Utilizado
      await _syncTiempoUtilizado(agenteId: agenteId, onProgress: onProgress);

      // 12. Sincronizar Tipos de Actividad
      await _syncTiposActividad(onProgress: onProgress);

      // Guardar fecha de última sincronización
      await _cacheService.saveLastSyncDate(DateTime.now());

      print('✅ Sincronización completa exitosa');
      onComplete?.call();
    } catch (e) {
      print('❌ Error durante la sincronización: $e');
      rethrow;
    }
  }

  Future<void> _syncClientes({
    required String agenteId,
    required SyncProgressCallback onProgress,
  }) async {
    try {
      onProgress(tableName: 'clientes', isLoading: true);

      print('🔄 Sincronizando clientes...');
      final clientes = await _apiService.getClientesPorAgente(agenteId);

      onProgress(
        tableName: 'clientes',
        total: clientes.length,
        synced: 0,
      );

      // Guardar en cache
      await _cacheService.saveClientes(clientes);

      onProgress(
        tableName: 'clientes',
        synced: clientes.length,
        isLoading: false,
        isCompleted: true,
      );

      print('✅ ${clientes.length} clientes sincronizados');
    } catch (e) {
      print('❌ Error al sincronizar clientes: $e');
      onProgress(
        tableName: 'clientes',
        isLoading: false,
        error: e.toString(),
      );
      rethrow;
    }
  }

  Future<void> _syncRelaciones({
    required String agenteId,
    required SyncProgressCallback onProgress,
  }) async {
    try {
      onProgress(tableName: 'relaciones', isLoading: true);

      print('🔄 Sincronizando relaciones...');
      final relaciones = await _apiService.getRelaciones(agenteId);

      onProgress(
        tableName: 'relaciones',
        total: relaciones.length,
        synced: 0,
      );

      // Guardar en cache
      await _cacheService.saveRelaciones(relaciones);

      onProgress(
        tableName: 'relaciones',
        synced: relaciones.length,
        isLoading: false,
        isCompleted: true,
      );

      print('✅ ${relaciones.length} relaciones sincronizadas');
    } catch (e) {
      print('❌ Error al sincronizar relaciones: $e');
      onProgress(
        tableName: 'relaciones',
        isLoading: false,
        error: e.toString(),
      );
      rethrow;
    }
  }

  Future<void> _syncInteracciones({
    required String agenteId,
    required SyncProgressCallback onProgress,
  }) async {
    try {
      onProgress(tableName: 'interacciones', isLoading: true);

      print('🔄 Sincronizando interacciones...');
      final interacciones = await _apiService.getInteracciones(agenteId: agenteId);

      onProgress(
        tableName: 'interacciones',
        total: interacciones.length,
        synced: 0,
      );

      // Guardar en cache
      await _cacheService.saveInteracciones(interacciones);

      onProgress(
        tableName: 'interacciones',
        synced: interacciones.length,
        isLoading: false,
        isCompleted: true,
      );

      print('✅ ${interacciones.length} interacciones sincronizadas');
    } catch (e) {
      print('❌ Error al sincronizar interacciones: $e');
      onProgress(
        tableName: 'interacciones',
        isLoading: false,
        error: e.toString(),
      );
      rethrow;
    }
  }

  Future<void> _syncTiposInteraccion({
    required SyncProgressCallback onProgress,
  }) async {
    try {
      onProgress(tableName: 'tipos', isLoading: true);

      print('🔄 Sincronizando tipos de interacción...');
      final tipos = await _apiService.getTiposInteraccion();

      onProgress(
        tableName: 'tipos',
        total: tipos.length,
        synced: 0,
      );

      // Guardar en cache
      await _cacheService.saveTiposInteraccion(tipos);

      onProgress(
        tableName: 'tipos',
        synced: tipos.length,
        isLoading: false,
        isCompleted: true,
      );

      print('✅ ${tipos.length} tipos de interacción sincronizados');
    } catch (e) {
      print('❌ Error al sincronizar tipos de interacción: $e');
      onProgress(
        tableName: 'tipos',
        isLoading: false,
        error: e.toString(),
      );
      rethrow;
    }
  }

  Future<void> _syncProductos({
    required SyncProgressCallback onProgress,
  }) async {
    try {
      onProgress(tableName: 'productos', isLoading: true);

      print('🔄 Sincronizando productos...');
      final productos = await _apiService.getProductos(soloActivos: true);

      onProgress(
        tableName: 'productos',
        total: productos.length,
        synced: 0,
      );

      // Guardar en cache
      await _cacheService.saveProductos(productos);

      onProgress(
        tableName: 'productos',
        synced: productos.length,
        isLoading: false,
        isCompleted: true,
      );

      print('✅ ${productos.length} productos sincronizados');
    } catch (e) {
      print('❌ Error al sincronizar productos: $e');
      onProgress(
        tableName: 'productos',
        isLoading: false,
        error: e.toString(),
      );
      rethrow;
    }
  }

  Future<void> _syncInventario({
    required String agenteId,
    required SyncProgressCallback onProgress,
  }) async {
    try {
      onProgress(tableName: 'inventario', isLoading: true);

      print('🔄 Sincronizando inventario...');
      final inventario = await _productoService.getInventarioAgente(agenteId);

      onProgress(
        tableName: 'inventario',
        total: inventario.length,
        synced: 0,
      );

      // Convertir inventario a JSON para guardar en cache
      final inventarioJson = inventario.map((item) => item.toJson()).toList();
      await _cacheService.saveInventarioCache(inventarioJson);

      onProgress(
        tableName: 'inventario',
        synced: inventario.length,
        isLoading: false,
        isCompleted: true,
      );

      print('✅ ${inventario.length} items de inventario sincronizados');
    } catch (e) {
      print('❌ Error al sincronizar inventario: $e');
      onProgress(
        tableName: 'inventario',
        isLoading: false,
        error: e.toString(),
      );
      // No rethrow - permitir que continúe la sincronización aunque falle el inventario
    }
  }

  Future<void> _syncCitas({
    required String agenteId,
    required SyncProgressCallback onProgress,
  }) async {
    try {
      onProgress(tableName: 'citas', isLoading: true);

      print('🔄 Sincronizando citas...');

      // Cargar citas de los próximos 3 meses
      final ahora = DateTime.now();
      final inicio = DateTime(ahora.year, ahora.month, 1);
      final fin = DateTime(ahora.year, ahora.month + 3, 1);

      final citas = await _citaService.getCitasAgente(
        agenteId,
        desde: inicio,
        hasta: fin,
      );

      onProgress(
        tableName: 'citas',
        total: citas.length,
        synced: 0,
      );

      // Guardar en cache
      await _cacheService.saveCitas(citas);

      onProgress(
        tableName: 'citas',
        synced: citas.length,
        isLoading: false,
        isCompleted: true,
      );

      print('✅ ${citas.length} citas sincronizadas');
    } catch (e) {
      print('❌ Error al sincronizar citas: $e');
      onProgress(
        tableName: 'citas',
        isLoading: false,
        error: e.toString(),
      );
      rethrow;
    }
  }

  Future<void> _syncMuestrasEntregadas({
    required String agenteId,
    required SyncProgressCallback onProgress,
  }) async {
    try {
      onProgress(tableName: 'muestras_entregadas', isLoading: true);

      print('🔄 Sincronizando muestras entregadas...');
      final data = await _apiService.getMuestrasEntregadas(agenteId);

      onProgress(
        tableName: 'muestras_entregadas',
        total: data.length,
        synced: 0,
      );

      // Guardar en cache (JSON genérico por ahora)
      await _cacheService.saveGenericData('muestras_entregadas', data);

      onProgress(
        tableName: 'muestras_entregadas',
        synced: data.length,
        isLoading: false,
        isCompleted: true,
      );

      print('✅ ${data.length} muestras entregadas sincronizadas');
    } catch (e) {
      print('❌ Error al sincronizar muestras entregadas: $e');
      onProgress(
        tableName: 'muestras_entregadas',
        isLoading: false,
        error: e.toString(),
      );
      rethrow;
    }
  }

  Future<void> _syncProductosPromocionados({
    required String agenteId,
    required SyncProgressCallback onProgress,
  }) async {
    try {
      onProgress(tableName: 'productos_promocionados', isLoading: true);

      print('🔄 Sincronizando productos promocionados...');
      final data = await _apiService.getProductosPromocionados(agenteId);

      onProgress(
        tableName: 'productos_promocionados',
        total: data.length,
        synced: 0,
      );

      await _cacheService.saveGenericData('productos_promocionados', data);

      onProgress(
        tableName: 'productos_promocionados',
        synced: data.length,
        isLoading: false,
        isCompleted: true,
      );

      print('✅ ${data.length} productos promocionados sincronizados');
    } catch (e) {
      print('❌ Error al sincronizar productos promocionados: $e');
      onProgress(
        tableName: 'productos_promocionados',
        isLoading: false,
        error: e.toString(),
      );
      rethrow;
    }
  }

  Future<void> _syncProductosSolicitados({
    required String agenteId,
    required SyncProgressCallback onProgress,
  }) async {
    try {
      onProgress(tableName: 'productos_solicitados', isLoading: true);

      print('🔄 Sincronizando productos solicitados...');
      final data = await _apiService.getProductosSolicitados(agenteId);

      onProgress(
        tableName: 'productos_solicitados',
        total: data.length,
        synced: 0,
      );

      await _cacheService.saveGenericData('productos_solicitados', data);

      onProgress(
        tableName: 'productos_solicitados',
        synced: data.length,
        isLoading: false,
        isCompleted: true,
      );

      print('✅ ${data.length} productos solicitados sincronizados');
    } catch (e) {
      print('❌ Error al sincronizar productos solicitados: $e');
      onProgress(
        tableName: 'productos_solicitados',
        isLoading: false,
        error: e.toString(),
      );
      rethrow;
    }
  }

  Future<void> _syncMovimientosInventario({
    required String agenteId,
    required SyncProgressCallback onProgress,
  }) async {
    try {
      onProgress(tableName: 'movimientos_inventario', isLoading: true);

      print('🔄 Sincronizando movimientos de inventario...');
      final data = await _apiService.getMovimientosInventario(agenteId);

      onProgress(
        tableName: 'movimientos_inventario',
        total: data.length,
        synced: 0,
      );

      await _cacheService.saveGenericData('movimientos_inventario', data);

      onProgress(
        tableName: 'movimientos_inventario',
        synced: data.length,
        isLoading: false,
        isCompleted: true,
      );

      print('✅ ${data.length} movimientos de inventario sincronizados');
    } catch (e) {
      print('❌ Error al sincronizar movimientos de inventario: $e');
      onProgress(
        tableName: 'movimientos_inventario',
        isLoading: false,
        error: e.toString(),
      );
      rethrow;
    }
  }

  Future<void> _syncTiempoUtilizado({
    required String agenteId,
    required SyncProgressCallback onProgress,
  }) async {
    try {
      onProgress(tableName: 'tiempo_utilizado', isLoading: true);

      print('🔄 Sincronizando tiempo utilizado...');
      final data = await _apiService.getTiempoUtilizado(agenteId);

      onProgress(
        tableName: 'tiempo_utilizado',
        total: data.length,
        synced: 0,
      );

      await _cacheService.saveGenericData('tiempo_utilizado', data);

      onProgress(
        tableName: 'tiempo_utilizado',
        synced: data.length,
        isLoading: false,
        isCompleted: true,
      );

      print('✅ ${data.length} registros de tiempo utilizado sincronizados');
    } catch (e) {
      print('❌ Error al sincronizar tiempo utilizado: $e');
      onProgress(
        tableName: 'tiempo_utilizado',
        isLoading: false,
        error: e.toString(),
      );
      rethrow;
    }
  }

  Future<void> _syncTiposActividad({
    required SyncProgressCallback onProgress,
  }) async {
    try {
      onProgress(tableName: 'tipos_actividad', isLoading: true);

      print('🔄 Sincronizando tipos de actividad...');
      final data = await _apiService.getTiposActividad();

      onProgress(
        tableName: 'tipos_actividad',
        total: data.length,
        synced: 0,
      );

      await _cacheService.saveGenericData('tipos_actividad', data);

      onProgress(
        tableName: 'tipos_actividad',
        synced: data.length,
        isLoading: false,
        isCompleted: true,
      );

      print('✅ ${data.length} tipos de actividad sincronizados');
    } catch (e) {
      print('❌ Error al sincronizar tipos de actividad: $e');
      onProgress(
        tableName: 'tipos_actividad',
        isLoading: false,
        error: e.toString(),
      );
      rethrow;
    }
  }
}

/// Typedef para VoidCallback si no está disponible globalmente
typedef VoidCallback = void Function();
