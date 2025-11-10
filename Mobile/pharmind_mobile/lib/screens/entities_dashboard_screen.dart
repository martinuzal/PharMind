import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/esquema_personalizado.dart';
import '../services/entity_service.dart';
import '../widgets/loading_indicator.dart';
import '../providers/toolbar_provider.dart';
import '../widgets/bottom_toolbar.dart';
import 'entities_list_screen.dart';

class EntitiesDashboardScreen extends StatefulWidget {
  const EntitiesDashboardScreen({super.key});

  @override
  State<EntitiesDashboardScreen> createState() => _EntitiesDashboardScreenState();
}

class _EntitiesDashboardScreenState extends State<EntitiesDashboardScreen> {
  final EntityService _entityService = EntityService();
  List<EsquemaPersonalizado> _esquemas = [];
  Map<String, int> _entityCounts = {};
  bool _isLoading = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _loadData();

    // Configurar acciones del toolbar después de que el frame esté construido
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _setupToolbarActions();
    });
  }

  void _setupToolbarActions() {
    final toolbarProvider = Provider.of<ToolbarProvider>(context, listen: false);
    toolbarProvider.setActions([
      ToolbarProvider.createSyncAction(() => _loadData()),
      ToolbarProvider.createSearchAction(() {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Buscar no implementado aún')),
        );
      }),
    ]);
  }

  Future<void> _loadData() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final esquemas = await _entityService.getEsquemas();

      // Contar entidades por tipo
      Map<String, int> counts = {};
      for (var esquema in esquemas) {
        try {
          final entidades = await _entityService.getEntidadesByEsquema(esquema.id);
          counts[esquema.id.toString()] = entidades.length;
        } catch (e) {
          counts[esquema.id.toString()] = 0;
        }
      }

      setState(() {
        _esquemas = esquemas;
        _entityCounts = counts;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = e.toString();
        _isLoading = false;
      });
    }
  }

  // Agrupar esquemas por EntidadTipo
  Map<String, List<EsquemaPersonalizado>> _groupByType() {
    Map<String, List<EsquemaPersonalizado>> grouped = {
      'Cliente': [],
      'Agente': [],
      'Cartera': [],
      'Interaccion': [],
      'Otros': [],
    };

    for (var esquema in _esquemas) {
      // Obtener tipo de entidad del esquemaJson o asumir del nombre
      String tipo = 'Otros';
      if (esquema.esquemaJson['entidadTipo'] != null) {
        tipo = esquema.esquemaJson['entidadTipo'];
      } else {
        // Inferir del nombre
        final nombre = esquema.nombreEntidad.toLowerCase();
        if (nombre.contains('medico') || nombre.contains('farmacia') || nombre.contains('institucion')) {
          tipo = 'Cliente';
        } else if (nombre.contains('agente') || nombre.contains('visitador')) {
          tipo = 'Agente';
        } else if (nombre.contains('cartera')) {
          tipo = 'Cartera';
        } else if (nombre.contains('interaccion') || nombre.contains('visita')) {
          tipo = 'Interaccion';
        }
      }

      if (!grouped.containsKey(tipo)) {
        grouped['Otros']!.add(esquema);
      } else {
        grouped[tipo]!.add(esquema);
      }
    }

    return grouped;
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        body: LoadingIndicator(message: 'Cargando entidades...'),
      );
    }

    if (_errorMessage != null) {
      return Scaffold(
        appBar: AppBar(
          title: const Text('Entidades Dinámicas'),
        ),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(
                Icons.error_outline,
                size: 64,
                color: Colors.red,
              ),
              const SizedBox(height: 16),
              Text(
                'Error: $_errorMessage',
                textAlign: TextAlign.center,
                style: const TextStyle(color: Colors.red),
              ),
              const SizedBox(height: 24),
              ElevatedButton.icon(
                onPressed: _loadData,
                icon: const Icon(Icons.refresh),
                label: const Text('Reintentar'),
              ),
            ],
          ),
        ),
      );
    }

    final grouped = _groupByType();
    final totalEntities = _entityCounts.values.fold<int>(0, (sum, count) => sum + count);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Entidades Dinámicas'),
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadData,
            tooltip: 'Actualizar',
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _loadData,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // Total scorecard
            _buildTotalScorecard(totalEntities),
            const SizedBox(height: 24),

            // Scorecards por tipo
            ...grouped.entries.where((entry) => entry.value.isNotEmpty).map((entry) {
              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildCategoryHeader(entry.key),
                  const SizedBox(height: 12),
                  _buildCategoryScorecard(entry.key, entry.value),
                  const SizedBox(height: 16),
                  ...entry.value.map((esquema) => _buildEntityCard(esquema)),
                  const SizedBox(height: 24),
                ],
              );
            }).toList(),
          ],
        ),
      ),
      bottomNavigationBar: const BottomToolbar(),
    );
  }

  Widget _buildTotalScorecard(int total) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Colors.blue.shade600,
            Colors.blue.shade800,
          ],
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.blue.withOpacity(0.3),
            blurRadius: 10,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.2),
              borderRadius: BorderRadius.circular(15),
            ),
            child: const Icon(
              Icons.dashboard,
              size: 40,
              color: Colors.white,
            ),
          ),
          const SizedBox(width: 20),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Total de Entidades',
                  style: TextStyle(
                    fontSize: 16,
                    color: Colors.white70,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  total.toString(),
                  style: const TextStyle(
                    fontSize: 36,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCategoryHeader(String category) {
    IconData icon;
    Color color;

    switch (category) {
      case 'Cliente':
        icon = Icons.people;
        color = Colors.blue;
        break;
      case 'Agente':
        icon = Icons.person_pin;
        color = Colors.green;
        break;
      case 'Cartera':
        icon = Icons.folder_open;
        color = Colors.orange;
        break;
      case 'Interaccion':
        icon = Icons.handshake;
        color = Colors.purple;
        break;
      default:
        icon = Icons.category;
        color = Colors.grey;
    }

    return Row(
      children: [
        Icon(icon, color: color, size: 28),
        const SizedBox(width: 12),
        Text(
          category,
          style: TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.bold,
            color: color,
          ),
        ),
      ],
    );
  }

  Widget _buildCategoryScorecard(String category, List<EsquemaPersonalizado> esquemas) {
    int totalCount = 0;
    for (var esquema in esquemas) {
      totalCount += _entityCounts[esquema.id.toString()] ?? 0;
    }

    MaterialColor color;
    switch (category) {
      case 'Cliente':
        color = Colors.blue;
        break;
      case 'Agente':
        color = Colors.green;
        break;
      case 'Cartera':
        color = Colors.orange;
        break;
      case 'Interaccion':
        color = Colors.purple;
        break;
      default:
        color = Colors.grey;
    }

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            color[100]!,
            color[200]!,
          ],
        ),
        borderRadius: BorderRadius.circular(15),
        border: Border.all(color: color[300]!, width: 2),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                '${esquemas.length} tipo${esquemas.length != 1 ? 's' : ''}',
                style: TextStyle(
                  fontSize: 14,
                  color: color[700]!,
                  fontWeight: FontWeight.w500,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                '$totalCount entidad${totalCount != 1 ? 'es' : ''}',
                style: TextStyle(
                  fontSize: 12,
                  color: color[600]!,
                ),
              ),
            ],
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              color: color,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              totalCount.toString(),
              style: const TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEntityCard(EsquemaPersonalizado esquema) {
    final count = _entityCounts[esquema.id.toString()] ?? 0;
    // Get icon from the esquema model (backend Icono field) first, then fallback to JSON
    final iconName = esquema.icono ?? esquema.esquemaJson['icono'] ?? esquema.esquemaJson['icon'];
    // Get color from the esquema model (backend Color field) first, then fallback to theme
    final iconColor = _getColorFromHex(esquema.color) ?? Theme.of(context).primaryColor;

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: InkWell(
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => EntitiesListScreen(esquema: esquema),
            ),
          ).then((_) => _loadData());
        },
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              // Icono de la entidad
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: iconColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(
                  _getIconData(iconName),
                  size: 28,
                  color: iconColor,
                ),
              ),
              const SizedBox(width: 16),
              // Información
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      esquema.nombreEntidad,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    if (esquema.descripcion != null && esquema.descripcion!.isNotEmpty)
                      Padding(
                        padding: const EdgeInsets.only(top: 4),
                        child: Text(
                          esquema.descripcion!,
                          style: TextStyle(
                            fontSize: 13,
                            color: Colors.grey[600],
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                  ],
                ),
              ),
              // Contador
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: Colors.blue.shade50,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: Colors.blue.shade200),
                ),
                child: Text(
                  count.toString(),
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Colors.blue.shade700,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Icon(
                Icons.chevron_right,
                color: Colors.grey[400],
              ),
            ],
          ),
        ),
      ),
    );
  }

  IconData _getIconData(String? iconName) {
    if (iconName == null) return Icons.folder;

    // Map de nombres de Material Icons a IconData
    final iconMap = {
      'people': Icons.people,
      'person': Icons.person,
      'medical_services': Icons.medical_services,
      'local_pharmacy': Icons.local_pharmacy,
      'business': Icons.business,
      'folder': Icons.folder,
      'folder_open': Icons.folder_open,
      'description': Icons.description,
      'handshake': Icons.handshake,
      'category': Icons.category,
      'settings': Icons.settings,
      'dashboard': Icons.dashboard,
      'home': Icons.home,
      'star': Icons.star,
      'favorite': Icons.favorite,
    };

    return iconMap[iconName] ?? Icons.folder;
  }

  Color? _getColorFromHex(String? hexColor) {
    if (hexColor == null || hexColor.isEmpty) return null;

    // Remove # if present
    String hex = hexColor.replaceAll('#', '');

    // Add alpha channel if not present
    if (hex.length == 6) {
      hex = 'FF$hex';
    }

    try {
      return Color(int.parse(hex, radix: 16));
    } catch (e) {
      return null;
    }
  }
}
