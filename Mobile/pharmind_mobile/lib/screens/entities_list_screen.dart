import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/esquema_personalizado.dart';
import '../models/entidad_dinamica.dart';
import '../services/entity_service.dart';
import '../providers/toolbar_provider.dart';
import '../widgets/bottom_toolbar.dart';
import 'entity_form_screen.dart';

class EntitiesListScreen extends StatefulWidget {
  final EsquemaPersonalizado esquema;

  const EntitiesListScreen({
    super.key,
    required this.esquema,
  });

  @override
  State<EntitiesListScreen> createState() => _EntitiesListScreenState();
}

class _EntitiesListScreenState extends State<EntitiesListScreen> {
  final EntityService _entityService = EntityService();
  final TextEditingController _searchController = TextEditingController();
  List<EntidadDinamica> _entidades = [];
  List<EntidadDinamica> _filteredEntidades = [];
  bool _isLoading = false;
  String? _errorMessage;
  bool _isSearching = false;

  @override
  void initState() {
    super.initState();
    _loadEntidades();
    _searchController.addListener(_filterEntidades);

    // Configurar acciones del toolbar después de que el frame esté construido
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _setupToolbarActions();
    });
  }

  void _setupToolbarActions() {
    final toolbarProvider = Provider.of<ToolbarProvider>(context, listen: false);
    toolbarProvider.setActions([
      ToolbarProvider.createAddAction(() => _navigateToForm()),
      ToolbarProvider.createSearchAction(() {
        setState(() {
          _isSearching = !_isSearching;
          if (!_isSearching) {
            _searchController.clear();
          }
        });
      }),
      ToolbarProvider.createSyncAction(() => _loadEntidades()),
    ]);
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadEntidades() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final entidades = await _entityService.getEntidadesByEsquema(widget.esquema.id!);
      setState(() {
        _entidades = entidades;
        _filteredEntidades = entidades;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = e.toString();
        _isLoading = false;
      });
    }
  }

  void _filterEntidades() {
    final query = _searchController.text.toLowerCase();

    if (query.isEmpty) {
      setState(() {
        _filteredEntidades = _entidades;
      });
      return;
    }

    setState(() {
      _filteredEntidades = _entidades.where((entidad) {
        // Search in all field values
        for (var field in widget.esquema.fields) {
          final value = entidad.getFieldValue(field.name, '').toLowerCase();
          if (value.contains(query)) {
            return true;
          }
        }
        return false;
      }).toList();
    });
  }

  Future<void> _deleteEntidad(dynamic id) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Confirmar eliminación'),
        content: const Text('¿Está seguro que desea eliminar esta entidad?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancelar'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: const Text('Eliminar'),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      try {
        await _entityService.deleteEntidad(id);
        _loadEntidades();
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Entidad eliminada exitosamente')),
          );
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Error al eliminar: $e')),
          );
        }
      }
    }
  }

  void _navigateToForm({EntidadDinamica? entidad}) async {
    final result = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => EntityFormScreen(
          esquema: widget.esquema,
          entidad: entidad,
        ),
      ),
    );

    if (result == true) {
      _loadEntidades();
    }
  }

  Widget _buildEntityCard(EntidadDinamica entidad) {
    final fields = widget.esquema.fields;

    // Get first 3 fields for display
    final displayFields = fields.take(3).toList();

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: ListTile(
        title: Text(
          displayFields.isNotEmpty
              ? entidad.getFieldValue(displayFields[0].name, 'Sin título')
              : 'Entidad #${entidad.id}',
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (displayFields.length > 1)
              Text('${displayFields[1].label}: ${entidad.getFieldValue(displayFields[1].name, '-')}'),
            if (displayFields.length > 2)
              Text('${displayFields[2].label}: ${entidad.getFieldValue(displayFields[2].name, '-')}'),
          ],
        ),
        trailing: PopupMenuButton<String>(
          onSelected: (value) {
            if (value == 'edit') {
              _navigateToForm(entidad: entidad);
            } else if (value == 'delete' && entidad.id != null) {
              _deleteEntidad(entidad.id!);
            }
          },
          itemBuilder: (context) => [
            const PopupMenuItem(
              value: 'edit',
              child: Row(
                children: [
                  Icon(Icons.edit, size: 20),
                  SizedBox(width: 8),
                  Text('Editar'),
                ],
              ),
            ),
            const PopupMenuItem(
              value: 'delete',
              child: Row(
                children: [
                  Icon(Icons.delete, size: 20, color: Colors.red),
                  SizedBox(width: 8),
                  Text('Eliminar', style: TextStyle(color: Colors.red)),
                ],
              ),
            ),
          ],
        ),
        onTap: () => _navigateToForm(entidad: entidad),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.esquema.nombreEntidad),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        actions: [
          IconButton(
            icon: Icon(_isSearching ? Icons.close : Icons.search),
            onPressed: () {
              setState(() {
                _isSearching = !_isSearching;
                if (!_isSearching) {
                  _searchController.clear();
                }
              });
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Search bar
          if (_isSearching)
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                boxShadow: [
                  BoxShadow(
                    color: Colors.grey.withOpacity(0.1),
                    blurRadius: 4,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: TextField(
                controller: _searchController,
                autofocus: true,
                decoration: InputDecoration(
                  hintText: 'Buscar entidades...',
                  prefixIcon: const Icon(Icons.search),
                  suffixIcon: _searchController.text.isNotEmpty
                      ? IconButton(
                          icon: const Icon(Icons.clear),
                          onPressed: () {
                            _searchController.clear();
                          },
                        )
                      : null,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  filled: true,
                  fillColor: Colors.grey[50],
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 12,
                  ),
                ),
              ),
            ),
          // Results count
          if (_isSearching && _searchController.text.isNotEmpty)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              color: Colors.blue[50],
              child: Row(
                children: [
                  Icon(Icons.info_outline, size: 16, color: Colors.blue[700]),
                  const SizedBox(width: 8),
                  Text(
                    '${_filteredEntidades.length} resultado${_filteredEntidades.length != 1 ? 's' : ''} encontrado${_filteredEntidades.length != 1 ? 's' : ''}',
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.blue[700],
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),
          // List
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _errorMessage != null
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.error_outline, size: 48, color: Colors.red),
                            const SizedBox(height: 16),
                            Text(
                              'Error al cargar datos',
                              style: Theme.of(context).textTheme.titleLarge,
                            ),
                            const SizedBox(height: 8),
                            Text(_errorMessage!),
                            const SizedBox(height: 16),
                            ElevatedButton.icon(
                              onPressed: _loadEntidades,
                              icon: const Icon(Icons.refresh),
                              label: const Text('Reintentar'),
                            ),
                          ],
                        ),
                      )
                    : _filteredEntidades.isEmpty
                        ? Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(
                                  _isSearching && _searchController.text.isNotEmpty
                                      ? Icons.search_off
                                      : Icons.inbox,
                                  size: 64,
                                  color: Colors.grey,
                                ),
                                const SizedBox(height: 16),
                                Text(
                                  _isSearching && _searchController.text.isNotEmpty
                                      ? 'No se encontraron resultados'
                                      : 'No hay entidades registradas',
                                  style: Theme.of(context).textTheme.titleLarge,
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  _isSearching && _searchController.text.isNotEmpty
                                      ? 'Intenta con otros términos de búsqueda'
                                      : 'Presiona el botón + para crear una nueva',
                                ),
                              ],
                            ),
                          )
                        : RefreshIndicator(
                            onRefresh: _loadEntidades,
                            child: ListView.builder(
                              itemCount: _filteredEntidades.length,
                              itemBuilder: (context, index) {
                                return _buildEntityCard(_filteredEntidades[index]);
                              },
                            ),
                          ),
          ),
        ],
      ),
      bottomNavigationBar: const BottomToolbar(),
    );
  }
}
