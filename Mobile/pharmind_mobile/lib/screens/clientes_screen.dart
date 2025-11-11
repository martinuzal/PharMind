import 'package:flutter/material.dart';
import '../models/cliente.dart';
import '../services/mobile_api_service.dart';
import '../services/cache_service.dart';

class ClientesScreen extends StatefulWidget {
  final String agenteId;

  const ClientesScreen({
    super.key,
    required this.agenteId,
  });

  @override
  State<ClientesScreen> createState() => _ClientesScreenState();
}

class _ClientesScreenState extends State<ClientesScreen> {
  final MobileApiService _apiService = MobileApiService();
  final CacheService _cacheService = CacheService();
  final TextEditingController _searchController = TextEditingController();

  List<Cliente> _clientes = [];
  List<Cliente> _filteredClientes = [];
  bool _isLoading = false;
  bool _isOfflineMode = false;
  String? _errorMessage;

  String? _filtroTipo;
  String? _filtroEspecialidad;

  @override
  void initState() {
    super.initState();
    _loadClientes();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadClientes() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      // Intentar cargar desde API
      print('🌐 Intentando cargar clientes desde API...');
      final syncResponse = await _apiService.syncAll(
        agenteId: widget.agenteId,
      );

      setState(() {
        _clientes = syncResponse.clientes;
        _isOfflineMode = false;
        _applyFilters();
        _isLoading = false;
      });
      print('✅ ${_clientes.length} clientes cargados desde API');
    } catch (e) {
      // Si falla la API, intentar cargar desde caché
      print('⚠️ Error al cargar clientes desde API: $e');
      print('📦 Intentando cargar desde caché...');

      try {
        final cachedData = await _cacheService.getCachedClientes();
        if (cachedData.isNotEmpty) {
          final clientesFromCache = cachedData.map((json) => Cliente.fromJson(json)).toList();

          setState(() {
            _clientes = clientesFromCache;
            _isOfflineMode = true;
            _applyFilters();
            _isLoading = false;
          });

          print('✅ ${_clientes.length} clientes cargados desde caché');

          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Row(
                  children: [
                    Icon(Icons.offline_bolt, color: Colors.white),
                    SizedBox(width: 8),
                    Text('Modo sin conexión: mostrando datos en caché'),
                  ],
                ),
                backgroundColor: Colors.orange,
                duration: Duration(seconds: 3),
              ),
            );
          }
        } else {
          setState(() {
            _errorMessage = 'No hay datos en caché. Sincroniza cuando tengas conexión.';
            _isLoading = false;
          });
        }
      } catch (cacheError) {
        print('❌ Error al cargar desde caché: $cacheError');
        setState(() {
          _errorMessage = 'Error al cargar clientes: $e';
          _isLoading = false;
        });
      }
    }
  }

  void _applyFilters() {
    List<Cliente> filtered = List.from(_clientes);

    // Filtro de búsqueda
    if (_searchController.text.isNotEmpty) {
      final searchTerm = _searchController.text.toLowerCase();
      filtered = filtered.where((cliente) {
        return (cliente.razonSocial.toLowerCase().contains(searchTerm)) ||
            (cliente.nombre.toLowerCase().contains(searchTerm)) ||
            (cliente.apellido?.toLowerCase().contains(searchTerm) ?? false) ||
            (cliente.codigoCliente.toLowerCase().contains(searchTerm)) ||
            (cliente.especialidad?.toLowerCase().contains(searchTerm) ?? false);
      }).toList();
    }

    // Filtro por tipo
    if (_filtroTipo != null) {
      filtered = filtered.where((c) => c.tipoClienteNombre == _filtroTipo).toList();
    }

    // Filtro por especialidad
    if (_filtroEspecialidad != null) {
      filtered = filtered.where((c) => c.especialidad == _filtroEspecialidad).toList();
    }

    // Ordenar alfabéticamente
    filtered.sort((a, b) => a.razonSocial.compareTo(b.razonSocial));

    setState(() {
      _filteredClientes = filtered;
    });
  }

  void _clearFilters() {
    setState(() {
      _searchController.clear();
      _filtroTipo = null;
      _filtroEspecialidad = null;
      _applyFilters();
    });
  }

  Widget _buildFilterChips() {
    final tipos = _clientes.map((c) => c.tipoClienteNombre).toSet().toList();
    final especialidades = _clientes.where((c) => c.especialidad != null).map((c) => c.especialidad!).toSet().toList();

    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Row(
        children: [
          // Filtro por tipo
          if (tipos.isNotEmpty)
            PopupMenuButton<String>(
              child: Chip(
                avatar: Icon(
                  Icons.category,
                  size: 18,
                  color: _filtroTipo != null ? Colors.white : Colors.grey[700],
                ),
                label: Text(_filtroTipo ?? 'Tipo'),
                backgroundColor: _filtroTipo != null ? Colors.blue : Colors.grey[200],
                labelStyle: TextStyle(
                  color: _filtroTipo != null ? Colors.white : Colors.black87,
                  fontWeight: _filtroTipo != null ? FontWeight.bold : FontWeight.normal,
                ),
              ),
              onSelected: (value) {
                setState(() {
                  _filtroTipo = value;
                  _applyFilters();
                });
              },
              itemBuilder: (context) => [
                const PopupMenuItem(value: null, child: Text('Todos')),
                ...tipos.map((tipo) => PopupMenuItem(value: tipo, child: Text(tipo))),
              ],
            ),
          const SizedBox(width: 8),

          // Filtro por especialidad
          if (especialidades.isNotEmpty)
            PopupMenuButton<String>(
              child: Chip(
                avatar: Icon(
                  Icons.medical_services,
                  size: 18,
                  color: _filtroEspecialidad != null ? Colors.white : Colors.grey[700],
                ),
                label: Text(_filtroEspecialidad ?? 'Especialidad'),
                backgroundColor: _filtroEspecialidad != null ? Colors.blue : Colors.grey[200],
                labelStyle: TextStyle(
                  color: _filtroEspecialidad != null ? Colors.white : Colors.black87,
                  fontWeight: _filtroEspecialidad != null ? FontWeight.bold : FontWeight.normal,
                ),
              ),
              onSelected: (value) {
                setState(() {
                  _filtroEspecialidad = value;
                  _applyFilters();
                });
              },
              itemBuilder: (context) => [
                const PopupMenuItem(value: null, child: Text('Todas')),
                ...especialidades.map((esp) => PopupMenuItem(value: esp, child: Text(esp))),
              ],
            ),
          const SizedBox(width: 8),

          // Botón limpiar
          if (_filtroTipo != null || _filtroEspecialidad != null)
            ActionChip(
              avatar: const Icon(Icons.clear, size: 18, color: Colors.white),
              label: const Text('Limpiar'),
              backgroundColor: Colors.red,
              labelStyle: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
              onPressed: _clearFilters,
            ),
        ],
      ),
    );
  }

  Widget _buildClienteCard(Cliente cliente) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: () => _showClienteDetail(cliente),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.blue.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Icon(
                      _getIconForTipo(cliente.tipoClienteNombre),
                      color: Colors.blue,
                      size: 24,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          cliente.razonSocial,
                          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                        Text(
                          '${cliente.nombre}${cliente.apellido != null ? ' ${cliente.apellido}' : ''}',
                          style: TextStyle(fontSize: 13, color: Colors.grey[600]),
                        ),
                      ],
                    ),
                  ),
                  // Badge de tipo
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: Colors.blue,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      cliente.tipoClienteNombre,
                      style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // Especialidad
              if (cliente.especialidad != null)
                Row(
                  children: [
                    Icon(Icons.medical_services, size: 16, color: Colors.grey[600]),
                    const SizedBox(width: 8),
                    Text(
                      cliente.especialidad!,
                      style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
                    ),
                  ],
                ),

              // Contacto
              if (cliente.telefono != null || cliente.email != null) ...[
                const SizedBox(height: 8),
                Row(
                  children: [
                    if (cliente.telefono != null) ...[
                      Icon(Icons.phone, size: 16, color: Colors.grey[600]),
                      const SizedBox(width: 8),
                      Text(cliente.telefono!, style: TextStyle(fontSize: 13, color: Colors.grey[700])),
                      const SizedBox(width: 16),
                    ],
                    if (cliente.email != null) ...[
                      Icon(Icons.email, size: 16, color: Colors.grey[600]),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          cliente.email!,
                          style: TextStyle(fontSize: 13, color: Colors.grey[700]),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ],
                ),
              ],

              // Ubicación
              if (cliente.ciudad != null || cliente.provincia != null) ...[
                const SizedBox(height: 8),
                Row(
                  children: [
                    Icon(Icons.location_on, size: 16, color: Colors.grey[600]),
                    const SizedBox(width: 8),
                    Text(
                      [cliente.ciudad, cliente.provincia].where((e) => e != null).join(', '),
                      style: TextStyle(fontSize: 13, color: Colors.grey[700]),
                    ),
                  ],
                ),
              ],

              // Institución
              if (cliente.institucionNombre != null) ...[
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.grey[100],
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    children: [
                      Icon(Icons.business, size: 16, color: Colors.grey[700]),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          cliente.institucionNombre!,
                          style: TextStyle(fontSize: 12, color: Colors.grey[700]),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  void _showClienteDetail(Cliente cliente) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.7,
        minChildSize: 0.5,
        maxChildSize: 0.95,
        expand: false,
        builder: (context, scrollController) => Padding(
          padding: const EdgeInsets.all(20),
          child: ListView(
            controller: scrollController,
            children: [
              // Handle
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  margin: const EdgeInsets.only(bottom: 20),
                  decoration: BoxDecoration(
                    color: Colors.grey[300],
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),

              // Título
              Text(cliente.razonSocial, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
              const SizedBox(height: 4),
              Text(
                '${cliente.nombre}${cliente.apellido != null ? ' ${cliente.apellido}' : ''}',
                style: TextStyle(fontSize: 16, color: Colors.grey[600]),
              ),
              const SizedBox(height: 20),

              // Detalles
              _buildDetailRow('Tipo', cliente.tipoClienteNombre, Icons.category),
              _buildDetailRow('Código', cliente.codigoCliente, Icons.badge),
              if (cliente.especialidad != null)
                _buildDetailRow('Especialidad', cliente.especialidad!, Icons.medical_services),
              if (cliente.categoria != null)
                _buildDetailRow('Categoría', cliente.categoria!, Icons.star),
              if (cliente.segmento != null)
                _buildDetailRow('Segmento', cliente.segmento!, Icons.business_center),
              if (cliente.telefono != null)
                _buildDetailRow('Teléfono', cliente.telefono!, Icons.phone),
              if (cliente.email != null)
                _buildDetailRow('Email', cliente.email!, Icons.email),
              if (cliente.direccionCompleta != null)
                _buildDetailRow('Dirección', cliente.direccionCompleta!, Icons.location_on, isMultiline: true),
              if (cliente.ciudad != null)
                _buildDetailRow('Ciudad', cliente.ciudad!, Icons.location_city),
              if (cliente.provincia != null)
                _buildDetailRow('Provincia', cliente.provincia!, Icons.map),
              if (cliente.institucionNombre != null)
                _buildDetailRow('Institución', cliente.institucionNombre!, Icons.business),
              if (cliente.estado != null)
                _buildDetailRow('Estado', cliente.estado!, Icons.info),

              const SizedBox(height: 20),

              // Botón cerrar
              ElevatedButton(
                onPressed: () => Navigator.pop(context),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.blue,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: const Text('Cerrar', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value, IconData icon, {bool isMultiline = false}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        crossAxisAlignment: isMultiline ? CrossAxisAlignment.start : CrossAxisAlignment.center,
        children: [
          Icon(icon, size: 20, color: Colors.blue),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: TextStyle(fontSize: 12, color: Colors.grey[600], fontWeight: FontWeight.w500)),
                const SizedBox(height: 4),
                Text(value, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  IconData _getIconForTipo(String tipo) {
    switch (tipo.toLowerCase()) {
      case 'médico':
      case 'medico':
        return Icons.medical_services;
      case 'farmacia':
        return Icons.local_pharmacy;
      case 'hospital':
      case 'clínica':
      case 'clinica':
        return Icons.local_hospital;
      case 'distribuidor':
        return Icons.store;
      default:
        return Icons.person;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Clientes'),
        backgroundColor: Colors.blue,
        foregroundColor: Colors.white,
        elevation: 0,
        actions: [
          IconButton(icon: const Icon(Icons.refresh), onPressed: _loadClientes),
        ],
      ),
      body: Column(
        children: [
          // Barra de búsqueda
          Container(
            color: Colors.blue,
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Buscar por nombre, RUC, especialidad...',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: _searchController.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear),
                        onPressed: () {
                          _searchController.clear();
                          _applyFilters();
                        },
                      )
                    : null,
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
              ),
              onChanged: (value) => _applyFilters(),
            ),
          ),

          // Filtros
          if (_clientes.isNotEmpty) _buildFilterChips(),

          const Divider(height: 1),

          // Lista de clientes
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _errorMessage != null
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.error_outline, size: 64, color: Colors.red[300]),
                            const SizedBox(height: 16),
                            Text(_errorMessage!, textAlign: TextAlign.center, style: const TextStyle(fontSize: 16)),
                            const SizedBox(height: 16),
                            ElevatedButton(onPressed: _loadClientes, child: const Text('Reintentar')),
                          ],
                        ),
                      )
                    : _filteredClientes.isEmpty
                        ? Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.inbox, size: 64, color: Colors.grey[300]),
                                const SizedBox(height: 16),
                                Text(
                                  _clientes.isEmpty ? 'No hay clientes sincronizados' : 'No se encontraron clientes',
                                  textAlign: TextAlign.center,
                                  style: TextStyle(fontSize: 16, color: Colors.grey[600]),
                                ),
                                if (_clientes.isNotEmpty) ...[
                                  const SizedBox(height: 16),
                                  TextButton(onPressed: _clearFilters, child: const Text('Limpiar filtros')),
                                ],
                              ],
                            ),
                          )
                        : RefreshIndicator(
                            onRefresh: _loadClientes,
                            child: ListView.builder(
                              itemCount: _filteredClientes.length,
                              itemBuilder: (context, index) => _buildClienteCard(_filteredClientes[index]),
                            ),
                          ),
          ),

          // Toolbar inferior
          Container(
            decoration: BoxDecoration(
              color: Colors.grey[100],
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.1),
                  blurRadius: 4,
                  offset: const Offset(0, -2),
                ),
              ],
            ),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildStatItem(Icons.people, 'Total', _filteredClientes.length.toString(), Colors.blue),
                _buildStatItem(Icons.category, 'Tipos', _filteredClientes.map((c) => c.tipoClienteNombre).toSet().length.toString(), Colors.green),
                _buildStatItem(
                  Icons.medical_services,
                  'Especialidades',
                  _filteredClientes.where((c) => c.especialidad != null).map((c) => c.especialidad).toSet().length.toString(),
                  Colors.orange,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatItem(IconData icon, String label, String value, Color color) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 20, color: color),
            const SizedBox(width: 6),
            Text(value, style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: color)),
          ],
        ),
        const SizedBox(height: 4),
        Text(label, style: TextStyle(fontSize: 12, color: Colors.grey[600])),
      ],
    );
  }
}
