import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../widgets/loading_indicator.dart';
import '../widgets/sync_status_widget.dart';
import 'entities_dashboard_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  bool _isRefreshing = false;

  @override
  void initState() {
    super.initState();
    _checkConnectivity();
  }

  Future<void> _checkConnectivity() async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final hasConnection = await authProvider.checkConnectivity();

    if (!mounted) return;

    if (!hasConnection && authProvider.isOfflineMode) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Modo offline: Sin conexión a internet'),
          backgroundColor: Colors.orange,
          duration: Duration(seconds: 3),
        ),
      );
    }
  }

  Future<void> _handleLogout() async {
    // Mostrar diálogo de confirmación
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Cerrar Sesión'),
        content: const Text('¿Está seguro que desea cerrar sesión?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('Cancelar'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.of(context).pop(true),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
              foregroundColor: Colors.white,
            ),
            child: const Text('Cerrar Sesión'),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    if (!mounted) return;

    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    await authProvider.logout();

    if (!mounted) return;

    // Navegar a login
    Navigator.of(context).pushReplacementNamed('/login');
  }

  Future<void> _handleRefresh() async {
    setState(() {
      _isRefreshing = true;
    });

    final authProvider = Provider.of<AuthProvider>(context, listen: false);

    // Verificar conectividad
    final hasConnection = await authProvider.checkConnectivity();

    if (hasConnection) {
      // Sincronizar datos
      await authProvider.syncData();
      // Actualizar usuario
      await authProvider.refreshUser();

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Datos sincronizados'),
            backgroundColor: Colors.green,
            duration: Duration(seconds: 2),
          ),
        );
      }
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Sin conexión a internet'),
            backgroundColor: Colors.orange,
            duration: Duration(seconds: 2),
          ),
        );
      }
    }

    setState(() {
      _isRefreshing = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (context, authProvider, child) {
        final user = authProvider.currentUser;

        if (user == null) {
          return const Scaffold(
            body: LoadingIndicator(message: 'Cargando...'),
          );
        }

        return Scaffold(
          appBar: AppBar(
            title: const Text('PharMind'),
            elevation: 0,
            actions: [
              // Indicador de modo offline
              if (authProvider.isOfflineMode)
                Container(
                  margin: const EdgeInsets.only(right: 8),
                  child: const Tooltip(
                    message: 'Modo Offline',
                    child: Icon(
                      Icons.cloud_off,
                      color: Colors.orange,
                    ),
                  ),
                ),
              // Botón de sincronización
              IconButton(
                icon: _isRefreshing
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                        ),
                      )
                    : const Icon(Icons.refresh),
                onPressed: _isRefreshing ? null : _handleRefresh,
                tooltip: 'Sincronizar',
              ),
              // Botón de logout
              IconButton(
                icon: const Icon(Icons.logout),
                onPressed: _handleLogout,
                tooltip: 'Cerrar Sesión',
              ),
            ],
          ),
          body: RefreshIndicator(
            onRefresh: _handleRefresh,
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              child: Column(
                children: [
                  // Header con información del usuario
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [
                          Theme.of(context).primaryColor,
                          Theme.of(context).primaryColor.withOpacity(0.7),
                        ],
                      ),
                    ),
                    child: Column(
                      children: [
                        // Avatar
                        CircleAvatar(
                          radius: 50,
                          backgroundColor: Colors.white,
                          child: Text(
                            user.nombre.isNotEmpty
                                ? user.nombre[0].toUpperCase()
                                : 'U',
                            style: TextStyle(
                              fontSize: 40,
                              fontWeight: FontWeight.bold,
                              color: Theme.of(context).primaryColor,
                            ),
                          ),
                        ),
                        const SizedBox(height: 16),
                        // Nombre
                        Text(
                          'Bienvenido, ${user.nombre}',
                          style: const TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 8),
                        // Email
                        Text(
                          user.email,
                          style: TextStyle(
                            fontSize: 16,
                            color: Colors.white.withOpacity(0.9),
                          ),
                        ),
                        const SizedBox(height: 8),
                        // Rol
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 6,
                          ),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.2),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(
                            user.rol,
                            style: const TextStyle(
                              fontSize: 14,
                              color: Colors.white,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  // Contenido principal
                  Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Alerta de modo offline
                        if (authProvider.isOfflineMode)
                          Container(
                            margin: const EdgeInsets.only(bottom: 20),
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: Colors.orange[50],
                              border: Border.all(color: Colors.orange),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Row(
                              children: [
                                const Icon(
                                  Icons.warning_amber,
                                  color: Colors.orange,
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      const Text(
                                        'Modo Offline',
                                        style: TextStyle(
                                          fontWeight: FontWeight.bold,
                                          color: Colors.orange,
                                        ),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        'Funcionalidad limitada. Conéctese a internet para sincronizar.',
                                        style: TextStyle(
                                          fontSize: 12,
                                          color: Colors.orange[800],
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        // Título de sección
                        const Text(
                          'Información del Usuario',
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 16),
                        // Tarjetas de información
                        _buildInfoCard(
                          icon: Icons.person,
                          title: 'Nombre',
                          value: user.nombre,
                        ),
                        _buildInfoCard(
                          icon: Icons.email,
                          title: 'Email',
                          value: user.email,
                        ),
                        _buildInfoCard(
                          icon: Icons.badge,
                          title: 'Rol',
                          value: user.rol,
                        ),
                        if (user.fechaCreacion != null)
                          _buildInfoCard(
                            icon: Icons.calendar_today,
                            title: 'Fecha de Creación',
                            value: _formatDate(user.fechaCreacion!),
                          ),
                        if (user.ultimoAcceso != null)
                          _buildInfoCard(
                            icon: Icons.access_time,
                            title: 'Último Acceso',
                            value: _formatDate(user.ultimoAcceso!),
                          ),
                        const SizedBox(height: 20),
                        // Título de módulos
                        const Text(
                          'Módulos',
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 16),
                        // Botón de entidades dinámicas
                        InkWell(
                          onTap: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) => const EntitiesDashboardScreen(),
                              ),
                            );
                          },
                          child: Container(
                            padding: const EdgeInsets.all(20),
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                begin: Alignment.topLeft,
                                end: Alignment.bottomRight,
                                colors: [
                                  Colors.blue.shade400,
                                  Colors.blue.shade600,
                                ],
                              ),
                              borderRadius: BorderRadius.circular(16),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.blue.withOpacity(0.3),
                                  blurRadius: 8,
                                  offset: const Offset(0, 4),
                                ),
                              ],
                            ),
                            child: Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(
                                    color: Colors.white.withOpacity(0.2),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: const Icon(
                                    Icons.folder_open,
                                    size: 32,
                                    color: Colors.white,
                                  ),
                                ),
                                const SizedBox(width: 16),
                                const Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        'Entidades Dinámicas',
                                        style: TextStyle(
                                          fontSize: 18,
                                          fontWeight: FontWeight.bold,
                                          color: Colors.white,
                                        ),
                                      ),
                                      SizedBox(height: 4),
                                      Text(
                                        'Gestionar datos de entidades personalizadas',
                                        style: TextStyle(
                                          fontSize: 13,
                                          color: Colors.white70,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                const Icon(
                                  Icons.chevron_right,
                                  color: Colors.white,
                                  size: 28,
                                ),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(height: 20),
                        // Widget de estado de sincronización
                        const SyncStatusWidget(),
                        const SizedBox(height: 20),
                        // Información adicional
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Colors.blue[50],
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Icon(
                                    Icons.info_outline,
                                    color: Colors.blue[700],
                                  ),
                                  const SizedBox(width: 8),
                                  Text(
                                    'Información del Sistema',
                                    style: TextStyle(
                                      fontWeight: FontWeight.bold,
                                      color: Colors.blue[700],
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 12),
                              Text(
                                'ID de Usuario: ${user.id}',
                                style: TextStyle(color: Colors.blue[900]),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                'Estado: ${authProvider.isOfflineMode ? 'Offline' : 'Online'}',
                                style: TextStyle(color: Colors.blue[900]),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildInfoCard({
    required IconData icon,
    required String title,
    required String value,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            blurRadius: 5,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: Theme.of(context).primaryColor.withOpacity(0.1),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(
              icon,
              color: Theme.of(context).primaryColor,
              size: 24,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey[600],
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  value,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _formatDate(DateTime date) {
    final months = [
      'Ene',
      'Feb',
      'Mar',
      'Abr',
      'May',
      'Jun',
      'Jul',
      'Ago',
      'Sep',
      'Oct',
      'Nov',
      'Dic'
    ];
    return '${date.day} ${months[date.month - 1]} ${date.year}, ${date.hour.toString().padLeft(2, '0')}:${date.minute.toString().padLeft(2, '0')}';
  }
}
