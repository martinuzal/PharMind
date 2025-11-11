import 'package:flutter/material.dart';
import '../models/producto.dart';
import '../services/mobile_api_service.dart';
import '../services/cache_service.dart';

enum ProductSelectorMode {
  multi, // Para productos promocionados (múltiples selecciones)
  single, // Para muestras o pedidos (una selección a la vez)
}

/// Widget para seleccionar productos con diferentes modos
/// - Multi: Permite seleccionar múltiples productos y asignar resultado (productos promocionados)
/// - Single: Permite seleccionar un producto y especificar cantidad (muestras/pedidos)
class ProductSelectorWidget extends StatefulWidget {
  final ProductSelectorMode mode;
  final String title;
  final bool esMuestra; // Si true, solo muestra productos marcados como muestra
  final Function(List<Producto>) onProductsSelected; // Para modo multi
  final Function(Producto, int)? onProductSelected; // Para modo single con cantidad

  const ProductSelectorWidget({
    Key? key,
    required this.mode,
    required this.title,
    this.esMuestra = false,
    required this.onProductsSelected,
    this.onProductSelected,
  }) : super(key: key);

  @override
  State<ProductSelectorWidget> createState() => _ProductSelectorWidgetState();
}

class _ProductSelectorWidgetState extends State<ProductSelectorWidget> {
  final MobileApiService _apiService = MobileApiService();
  final CacheService _cacheService = CacheService();
  final TextEditingController _searchController = TextEditingController();

  List<Producto> _allProductos = [];
  List<Producto> _filteredProductos = [];
  Set<String> _selectedProductIds = {};
  bool _isLoading = true;
  bool _isOfflineMode = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadProductos();
    _searchController.addListener(_filterProductos);
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadProductos() async {
    setState(() {
      _isLoading = true;
      _error = null;
      _isOfflineMode = false;
    });

    try {
      // Intentar cargar desde la API
      print('🌐 Cargando productos desde API (esMuestra: ${widget.esMuestra})...');

      final productos = await _apiService.getProductos(
        soloActivos: true,
        soloMuestras: widget.esMuestra,
        soloNoMuestras: !widget.esMuestra,
      );

      setState(() {
        _allProductos = productos;
        _filteredProductos = productos;
        _isLoading = false;
      });

      print('✅ ${productos.length} productos cargados desde API');
    } catch (e) {
      // Si falla la API, intentar cargar desde cache
      print('❌ Error al cargar desde API: $e');
      print('📦 Intentando cargar desde cache local...');

      try {
        final productosCache = await _cacheService.getProductosFromCache(
          soloMuestras: widget.esMuestra ? true : null, // Solo filtrar si buscamos muestras
        );

        // Si buscamos NO muestras, filtrar los que tienen esMuestra = false
        final productosFiltrados = widget.esMuestra
            ? productosCache
            : productosCache.where((p) => !p.esMuestra).toList();

        if (productosFiltrados.isEmpty) {
          throw Exception('No hay productos en cache. Conéctese a internet para la primera sincronización.');
        }

        setState(() {
          _allProductos = productosFiltrados;
          _filteredProductos = productosFiltrados;
          _isLoading = false;
          _isOfflineMode = true;
        });

        print('✅ ${productosFiltrados.length} productos cargados desde cache');
      } catch (cacheError) {
        setState(() {
          _error = cacheError.toString();
          _isLoading = false;
        });
      }
    }
  }

  void _filterProductos() {
    final query = _searchController.text.toLowerCase();
    setState(() {
      if (query.isEmpty) {
        _filteredProductos = _allProductos;
      } else {
        _filteredProductos = _allProductos.where((p) {
          final nombre = p.nombreComercial?.toLowerCase() ?? p.nombre.toLowerCase();
          final codigo = p.codigoProducto.toLowerCase();
          return nombre.contains(query) || codigo.contains(query);
        }).toList();
      }
    });
  }

  void _toggleProductSelection(Producto producto) {
    setState(() {
      if (_selectedProductIds.contains(producto.id)) {
        _selectedProductIds.remove(producto.id);
      } else {
        _selectedProductIds.add(producto.id);
      }
    });
  }

  void _handleSingleSelection(Producto producto) async {
    if (widget.onProductSelected != null) {
      // Mostrar diálogo para ingresar cantidad
      final cantidad = await _showQuantityDialog();
      if (cantidad != null && cantidad > 0) {
        widget.onProductSelected!(producto, cantidad);
        Navigator.of(context).pop();
      }
    }
  }

  Future<int?> _showQuantityDialog() async {
    final controller = TextEditingController(text: '1');

    return showDialog<int>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Cantidad'),
        content: TextField(
          controller: controller,
          keyboardType: TextInputType.number,
          decoration: const InputDecoration(
            labelText: 'Cantidad',
            border: OutlineInputBorder(),
          ),
          autofocus: true,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancelar'),
          ),
          ElevatedButton(
            onPressed: () {
              final cantidad = int.tryParse(controller.text);
              Navigator.of(context).pop(cantidad);
            },
            child: const Text('Aceptar'),
          ),
        ],
      ),
    );
  }

  void _handleMultiConfirm() {
    final selectedProducts = _allProductos
        .where((p) => _selectedProductIds.contains(p.id))
        .toList();
    widget.onProductsSelected(selectedProducts);
    Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      child: Container(
        width: MediaQuery.of(context).size.width * 0.9,
        height: MediaQuery.of(context).size.height * 0.8,
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // Header
            Row(
              children: [
                Expanded(
                  child: Row(
                    children: [
                      Text(
                        widget.title,
                        style: Theme.of(context).textTheme.titleLarge,
                      ),
                      if (_isOfflineMode) ...[
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.orange,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.cloud_off, size: 12, color: Colors.white),
                              SizedBox(width: 4),
                              Text(
                                'OFFLINE',
                                style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Colors.white),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.of(context).pop(),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Search bar
            TextField(
              controller: _searchController,
              decoration: InputDecoration(
                labelText: 'Buscar producto',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: _searchController.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear),
                        onPressed: () {
                          _searchController.clear();
                        },
                      )
                    : null,
                border: const OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16),

            // Selection counter (solo para modo multi)
            if (widget.mode == ProductSelectorMode.multi)
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.blue.shade50,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.check_circle, color: Colors.blue),
                    const SizedBox(width: 8),
                    Text(
                      '${_selectedProductIds.length} producto(s) seleccionado(s)',
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              ),
            const SizedBox(height: 16),

            // Product list
            Expanded(
              child: _buildProductList(),
            ),

            // Action buttons (solo para modo multi)
            if (widget.mode == ProductSelectorMode.multi) ...[
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => Navigator.of(context).pop(),
                      child: const Text('Cancelar'),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: _selectedProductIds.isEmpty
                          ? null
                          : _handleMultiConfirm,
                      child: const Text('Agregar'),
                    ),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildProductList() {
    if (_isLoading) {
      return const Center(
        child: CircularProgressIndicator(),
      );
    }

    if (_error != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 48, color: Colors.red),
            const SizedBox(height: 16),
            Text('Error: $_error'),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _loadProductos,
              child: const Text('Reintentar'),
            ),
          ],
        ),
      );
    }

    if (_filteredProductos.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.inventory_2_outlined, size: 48, color: Colors.grey[400]),
            const SizedBox(height: 16),
            Text(
              _searchController.text.isEmpty
                  ? 'No hay productos disponibles'
                  : 'No se encontraron productos',
              style: TextStyle(color: Colors.grey[600]),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      itemCount: _filteredProductos.length,
      itemBuilder: (context, index) {
        final producto = _filteredProductos[index];
        final isSelected = _selectedProductIds.contains(producto.id);

        return Card(
          margin: const EdgeInsets.only(bottom: 8),
          elevation: isSelected ? 4 : 1,
          color: isSelected ? Colors.blue.shade50 : null,
          child: ListTile(
            leading: widget.mode == ProductSelectorMode.multi
                ? Checkbox(
                    value: isSelected,
                    onChanged: (_) => _toggleProductSelection(producto),
                  )
                : CircleAvatar(
                    backgroundColor: Colors.blue,
                    child: Text(
                      producto.codigoProducto.substring(0, 1).toUpperCase(),
                      style: const TextStyle(color: Colors.white),
                    ),
                  ),
            title: Text(
              producto.displayName,
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
            subtitle: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Código: ${producto.codigoProducto}'),
                if (producto.laboratorio != null)
                  Text('Lab: ${producto.laboratorio}'),
                if (producto.esMuestra)
                  Chip(
                    label: const Text(
                      'MUESTRA',
                      style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.white),
                    ),
                    backgroundColor: Colors.orange,
                    padding: EdgeInsets.zero,
                    materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    visualDensity: VisualDensity.compact,
                  ),
              ],
            ),
            trailing: widget.mode == ProductSelectorMode.single
                ? const Icon(Icons.arrow_forward_ios, size: 16)
                : null,
            onTap: () {
              if (widget.mode == ProductSelectorMode.multi) {
                _toggleProductSelection(producto);
              } else {
                _handleSingleSelection(producto);
              }
            },
          ),
        );
      },
    );
  }
}
