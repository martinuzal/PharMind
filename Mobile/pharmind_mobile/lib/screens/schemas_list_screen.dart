import 'package:flutter/material.dart';
import '../models/esquema_personalizado.dart';
import '../services/entity_service.dart';
import 'entities_list_screen.dart';

class SchemasListScreen extends StatefulWidget {
  const SchemasListScreen({super.key});

  @override
  State<SchemasListScreen> createState() => _SchemasListScreenState();
}

class _SchemasListScreenState extends State<SchemasListScreen> {
  final EntityService _entityService = EntityService();
  List<EsquemaPersonalizado> _esquemas = [];
  bool _isLoading = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _loadEsquemas();
  }

  Future<void> _loadEsquemas() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final esquemas = await _entityService.getEsquemas();
      setState(() {
        _esquemas = esquemas;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = e.toString();
        _isLoading = false;
      });
    }
  }

  void _navigateToEntities(EsquemaPersonalizado esquema) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => EntitiesListScreen(esquema: esquema),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Entidades Dinámicas'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _errorMessage != null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.error_outline, size: 48, color: Colors.red),
                      const SizedBox(height: 16),
                      Text(
                        'Error al cargar esquemas',
                        style: Theme.of(context).textTheme.titleLarge,
                      ),
                      const SizedBox(height: 8),
                      Text(_errorMessage!),
                      const SizedBox(height: 16),
                      ElevatedButton.icon(
                        onPressed: _loadEsquemas,
                        icon: const Icon(Icons.refresh),
                        label: const Text('Reintentar'),
                      ),
                    ],
                  ),
                )
              : _esquemas.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.folder_open, size: 64, color: Colors.grey),
                          const SizedBox(height: 16),
                          Text(
                            'No hay esquemas disponibles',
                            style: Theme.of(context).textTheme.titleLarge,
                          ),
                          const SizedBox(height: 8),
                          const Text('Los esquemas se crean desde la aplicación web'),
                        ],
                      ),
                    )
                  : RefreshIndicator(
                      onRefresh: _loadEsquemas,
                      child: ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: _esquemas.length,
                        itemBuilder: (context, index) {
                          final esquema = _esquemas[index];
                          return Card(
                            margin: const EdgeInsets.only(bottom: 12),
                            child: ListTile(
                              leading: CircleAvatar(
                                backgroundColor: Theme.of(context).colorScheme.primaryContainer,
                                child: Icon(
                                  Icons.folder,
                                  color: Theme.of(context).colorScheme.onPrimaryContainer,
                                ),
                              ),
                              title: Text(
                                esquema.nombreEntidad,
                                style: const TextStyle(fontWeight: FontWeight.bold),
                              ),
                              subtitle: esquema.descripcion != null
                                  ? Text(esquema.descripcion!)
                                  : null,
                              trailing: const Icon(Icons.chevron_right),
                              onTap: () => _navigateToEntities(esquema),
                            ),
                          );
                        },
                      ),
                    ),
    );
  }
}
