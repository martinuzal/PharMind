import 'package:flutter/material.dart';
import '../models/producto.dart';
import '../services/producto_service.dart';

class ProductosScreen extends StatefulWidget {
  const ProductosScreen({super.key});

  @override
  State<ProductosScreen> createState() => _ProductosScreenState();
}

class _ProductosScreenState extends State<ProductosScreen> {
  final ProductoService _productoService = ProductoService();
  List<Producto> _productos = [];
  List<Producto> _productosFiltrados = [];
  List<String> _categorias = [];
  String? _categoriaSeleccionada;
  bool _isLoading = false;
  bool _soloMuestras = false;
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _cargarProductos();
    _cargarCategorias();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _cargarProductos() async {
    setState(() => _isLoading = true);

    try {
      final productos = await _productoService.getProductos();
      setState(() {
        _productos = productos;
        _aplicarFiltros();
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error al cargar productos: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _cargarCategorias() async {
    try {
      final categorias = await _productoService.getCategorias();
      setState(() => _categorias = categorias);
    } catch (e) {
      debugPrint('Error al cargar categorías: $e');
    }
  }

  void _aplicarFiltros() {
    var productos = List<Producto>.from(_productos);

    // Filtro por búsqueda
    final query = _searchController.text.toLowerCase();
    if (query.isNotEmpty) {
      productos = productos.where((p) {
        return p.nombre.toLowerCase().contains(query) ||
            p.codigoProducto.toLowerCase().contains(query) ||
            (p.nombreComercial?.toLowerCase().contains(query) ?? false) ||
            (p.principioActivo?.toLowerCase().contains(query) ?? false);
      }).toList();
    }

    // Filtro por categoría
    if (_categoriaSeleccionada != null && _categoriaSeleccionada != 'Todas') {
      productos = productos
          .where((p) => p.categoria == _categoriaSeleccionada)
          .toList();
    }

    // Filtro solo muestras
    if (_soloMuestras) {
      productos = productos.where((p) => p.esMuestra).toList();
    }

    setState(() => _productosFiltrados = productos);
  }

  void _mostrarFiltros() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Filtros',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 20),
                  // Filtro por categoría
                  const Text(
                    'Categoría',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 8),
                  DropdownButtonFormField<String>(
                    value: _categoriaSeleccionada,
                    decoration: const InputDecoration(
                      border: OutlineInputBorder(),
                      contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    ),
                    items: [
                      const DropdownMenuItem(value: null, child: Text('Todas')),
                      ..._categorias.map((cat) => DropdownMenuItem(
                            value: cat,
                            child: Text(cat),
                          )),
                    ],
                    onChanged: (value) {
                      setModalState(() => _categoriaSeleccionada = value);
                      setState(() {
                        _categoriaSeleccionada = value;
                        _aplicarFiltros();
                      });
                    },
                  ),
                  const SizedBox(height: 16),
                  // Filtro solo muestras
                  SwitchListTile(
                    title: const Text('Solo Muestras Médicas'),
                    value: _soloMuestras,
                    onChanged: (value) {
                      setModalState(() => _soloMuestras = value);
                      setState(() {
                        _soloMuestras = value;
                        _aplicarFiltros();
                      });
                    },
                  ),
                  const SizedBox(height: 16),
                  // Botones
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () {
                            setState(() {
                              _categoriaSeleccionada = null;
                              _soloMuestras = false;
                              _aplicarFiltros();
                            });
                            Navigator.pop(context);
                          },
                          child: const Text('Limpiar'),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: ElevatedButton(
                          onPressed: () => Navigator.pop(context),
                          child: const Text('Aplicar'),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Catálogo de Productos'),
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list),
            onPressed: _mostrarFiltros,
            tooltip: 'Filtros',
          ),
        ],
      ),
      body: Column(
        children: [
          // Barra de búsqueda
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Buscar productos...',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: _searchController.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear),
                        onPressed: () {
                          _searchController.clear();
                          _aplicarFiltros();
                        },
                      )
                    : null,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              onChanged: (value) => _aplicarFiltros(),
            ),
          ),
          // Chips de filtros activos
          if (_categoriaSeleccionada != null || _soloMuestras)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              height: 40,
              child: ListView(
                scrollDirection: Axis.horizontal,
                children: [
                  if (_categoriaSeleccionada != null)
                    Chip(
                      label: Text(_categoriaSeleccionada!),
                      deleteIcon: const Icon(Icons.close, size: 18),
                      onDeleted: () {
                        setState(() {
                          _categoriaSeleccionada = null;
                          _aplicarFiltros();
                        });
                      },
                    ),
                  if (_soloMuestras)
                    Padding(
                      padding: const EdgeInsets.only(left: 8),
                      child: Chip(
                        label: const Text('Solo Muestras'),
                        deleteIcon: const Icon(Icons.close, size: 18),
                        onDeleted: () {
                          setState(() {
                            _soloMuestras = false;
                            _aplicarFiltros();
                          });
                        },
                      ),
                    ),
                ],
              ),
            ),
          // Lista de productos
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _productosFiltrados.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.inventory_2_outlined,
                              size: 64,
                              color: Colors.grey[400],
                            ),
                            const SizedBox(height: 16),
                            Text(
                              'No se encontraron productos',
                              style: TextStyle(
                                fontSize: 16,
                                color: Colors.grey[600],
                              ),
                            ),
                          ],
                        ),
                      )
                    : RefreshIndicator(
                        onRefresh: _cargarProductos,
                        child: ListView.builder(
                          padding: const EdgeInsets.all(16),
                          itemCount: _productosFiltrados.length,
                          itemBuilder: (context, index) {
                            final producto = _productosFiltrados[index];
                            return _buildProductoCard(producto);
                          },
                        ),
                      ),
          ),
        ],
      ),
    );
  }

  Widget _buildProductoCard(Producto producto) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: () => _mostrarDetalleProducto(producto),
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Icono del producto
                  Container(
                    width: 60,
                    height: 60,
                    decoration: BoxDecoration(
                      color: Colors.blue[50],
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Icon(
                      Icons.medication,
                      size: 32,
                      color: Colors.blue[700],
                    ),
                  ),
                  const SizedBox(width: 12),
                  // Información del producto
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: Text(
                                producto.nombre,
                                style: const TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                            if (producto.esMuestra)
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 8,
                                  vertical: 2,
                                ),
                                decoration: BoxDecoration(
                                  color: Colors.green[100],
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: Text(
                                  'MUESTRA',
                                  style: TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.green[800],
                                  ),
                                ),
                              ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Text(
                          producto.codigoProducto,
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.grey[600],
                          ),
                        ),
                        if (producto.nombreComercial != null)
                          Text(
                            producto.nombreComercial!,
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.grey[600],
                              fontStyle: FontStyle.italic,
                            ),
                          ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              // Categoría y laboratorio
              Wrap(
                spacing: 8,
                runSpacing: 4,
                children: [
                  if (producto.categoria != null)
                    _buildChip(
                      Icons.category,
                      producto.categoria!,
                      Colors.blue,
                    ),
                  if (producto.laboratorio != null)
                    _buildChip(
                      Icons.business,
                      producto.laboratorio!,
                      Colors.orange,
                    ),
                  if (producto.presentacion != null)
                    _buildChip(
                      Icons.inventory,
                      producto.presentacion!,
                      Colors.purple,
                    ),
                ],
              ),
              // Precio
              if (producto.precioReferencia != null) ...[
                const SizedBox(height: 8),
                Text(
                  '\$${producto.precioReferencia!.toStringAsFixed(2)}',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Colors.green[700],
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildChip(IconData icon, String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: color),
          const SizedBox(width: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              color: color.withOpacity(0.8),
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  void _mostrarDetalleProducto(Producto producto) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return DraggableScrollableSheet(
          initialChildSize: 0.7,
          minChildSize: 0.5,
          maxChildSize: 0.95,
          expand: false,
          builder: (context, scrollController) {
            return SingleChildScrollView(
              controller: scrollController,
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Handle del modal
                    Center(
                      child: Container(
                        width: 40,
                        height: 4,
                        decoration: BoxDecoration(
                          color: Colors.grey[300],
                          borderRadius: BorderRadius.circular(2),
                        ),
                      ),
                    ),
                    const SizedBox(height: 20),
                    // Nombre y código
                    Text(
                      producto.nombre,
                      style: const TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      producto.codigoProducto,
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.grey[600],
                      ),
                    ),
                    if (producto.nombreComercial != null) ...[
                      const SizedBox(height: 4),
                      Text(
                        'Nombre Comercial: ${producto.nombreComercial}',
                        style: const TextStyle(
                          fontSize: 14,
                          fontStyle: FontStyle.italic,
                        ),
                      ),
                    ],
                    const SizedBox(height: 16),
                    // Tags
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        if (producto.esMuestra)
                          Chip(
                            label: const Text('Muestra Médica'),
                            backgroundColor: Colors.green[100],
                            avatar: Icon(Icons.local_hospital, size: 18, color: Colors.green[800]),
                          ),
                        if (producto.requiereReceta)
                          Chip(
                            label: const Text('Requiere Receta'),
                            backgroundColor: Colors.red[100],
                            avatar: Icon(Icons.receipt, size: 18, color: Colors.red[800]),
                          ),
                      ],
                    ),
                    const Divider(height: 32),
                    // Descripción
                    if (producto.descripcion != null) ...[
                      _buildSeccion('Descripción', producto.descripcion!),
                      const SizedBox(height: 16),
                    ],
                    // Información técnica
                    if (producto.principioActivo != null)
                      _buildDetalle('Principio Activo', producto.principioActivo!),
                    if (producto.concentracion != null)
                      _buildDetalle('Concentración', producto.concentracion!),
                    if (producto.categoria != null)
                      _buildDetalle('Categoría', producto.categoria!),
                    if (producto.presentacion != null)
                      _buildDetalle('Presentación', producto.presentacion!),
                    if (producto.viaAdministracion != null)
                      _buildDetalle('Vía de Administración', producto.viaAdministracion!),
                    if (producto.laboratorio != null)
                      _buildDetalle('Laboratorio', producto.laboratorio!),
                    // Indicaciones y contraindicaciones
                    if (producto.indicaciones != null) ...[
                      const SizedBox(height: 16),
                      _buildSeccion('Indicaciones', producto.indicaciones!),
                    ],
                    if (producto.contraindicaciones != null) ...[
                      const SizedBox(height: 16),
                      _buildSeccion('Contraindicaciones', producto.contraindicaciones!),
                    ],
                    // Precio
                    if (producto.precioReferencia != null) ...[
                      const Divider(height: 32),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'Precio de Referencia',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                          Text(
                            '\$${producto.precioReferencia!.toStringAsFixed(2)}',
                            style: TextStyle(
                              fontSize: 24,
                              fontWeight: FontWeight.bold,
                              color: Colors.green[700],
                            ),
                          ),
                        ],
                      ),
                    ],
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildSeccion(String titulo, String contenido) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          titulo,
          style: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          contenido,
          style: TextStyle(
            fontSize: 14,
            color: Colors.grey[700],
          ),
        ),
      ],
    );
  }

  Widget _buildDetalle(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 150,
            child: Text(
              label,
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey[700],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
