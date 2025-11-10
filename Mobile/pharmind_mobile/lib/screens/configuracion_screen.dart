import 'package:flutter/material.dart';
import '../services/config_service.dart';
import '../models/configuracion.dart';

class ConfiguracionScreen extends StatefulWidget {
  const ConfiguracionScreen({super.key});

  @override
  State<ConfiguracionScreen> createState() => _ConfiguracionScreenState();
}

class _ConfiguracionScreenState extends State<ConfiguracionScreen> {
  final ConfigService _configService = ConfigService();
  late Configuracion _config;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _cargarConfiguracion();
  }

  Future<void> _cargarConfiguracion() async {
    setState(() => _isLoading = true);
    try {
      final config = await _configService.cargarConfiguracion();
      setState(() {
        _config = config;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Error al cargar la configuración'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Future<void> _guardarConfiguracion(Configuracion nuevaConfig) async {
    final success = await _configService.guardarConfiguracion(nuevaConfig);
    if (success) {
      setState(() => _config = nuevaConfig);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Configuración guardada correctamente'),
            backgroundColor: Colors.green,
            duration: Duration(seconds: 2),
          ),
        );
      }
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Error al guardar la configuración'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Future<void> _resetearConfiguracion() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Restablecer configuración'),
        content: const Text(
          '¿Está seguro que desea restablecer todas las configuraciones a sus valores predeterminados?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancelar'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: const Text('Restablecer'),
          ),
        ],
      ),
    );

    if (confirm == true) {
      await _configService.resetearConfiguracion();
      await _cargarConfiguracion();
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Scaffold(
        appBar: AppBar(
          title: const Text('Configuración'),
          backgroundColor: Colors.blue[700],
          foregroundColor: Colors.white,
        ),
        body: const Center(
          child: CircularProgressIndicator(),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Configuración'),
        backgroundColor: Colors.blue[700],
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.restore),
            onPressed: _resetearConfiguracion,
            tooltip: 'Restablecer configuración',
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Sección: Notificaciones
          _buildSectionHeader('Notificaciones'),
          _buildSwitchTile(
            title: 'Notificaciones habilitadas',
            subtitle: 'Recibir notificaciones de la aplicación',
            value: _config.notificacionesHabilitadas,
            icon: Icons.notifications,
            onChanged: (value) {
              _guardarConfiguracion(_config.copyWith(
                notificacionesHabilitadas: value,
              ));
            },
          ),
          _buildSwitchTile(
            title: 'Sonido',
            subtitle: 'Reproducir sonido con las notificaciones',
            value: _config.sonidoHabilitado,
            icon: Icons.volume_up,
            enabled: _config.notificacionesHabilitadas,
            onChanged: (value) {
              _guardarConfiguracion(_config.copyWith(
                sonidoHabilitado: value,
              ));
            },
          ),
          _buildSwitchTile(
            title: 'Vibración',
            subtitle: 'Vibrar con las notificaciones',
            value: _config.vibracionHabilitada,
            icon: Icons.vibration,
            enabled: _config.notificacionesHabilitadas,
            onChanged: (value) {
              _guardarConfiguracion(_config.copyWith(
                vibracionHabilitada: value,
              ));
            },
          ),

          const SizedBox(height: 24),

          // Sección: Sincronización
          _buildSectionHeader('Sincronización'),
          _buildSwitchTile(
            title: 'Sincronización automática',
            subtitle: 'Sincronizar datos automáticamente',
            value: _config.sincronizacionAutomatica,
            icon: Icons.sync,
            onChanged: (value) {
              _guardarConfiguracion(_config.copyWith(
                sincronizacionAutomatica: value,
              ));
            },
          ),
          _buildDropdownTile(
            title: 'Intervalo de sincronización',
            subtitle: 'Frecuencia de sincronización automática',
            value: _config.intervaloSincronizacionMinutos,
            icon: Icons.timer,
            enabled: _config.sincronizacionAutomatica,
            items: const [
              DropdownMenuItem(value: 15, child: Text('15 minutos')),
              DropdownMenuItem(value: 30, child: Text('30 minutos')),
              DropdownMenuItem(value: 60, child: Text('1 hora')),
              DropdownMenuItem(value: 120, child: Text('2 horas')),
            ],
            onChanged: (value) {
              if (value != null) {
                _guardarConfiguracion(_config.copyWith(
                  intervaloSincronizacionMinutos: value,
                ));
              }
            },
          ),
          _buildSwitchTile(
            title: 'Solo WiFi',
            subtitle: 'Sincronizar solo cuando esté conectado a WiFi',
            value: _config.sincronizarSoloWifi,
            icon: Icons.wifi,
            onChanged: (value) {
              _guardarConfiguracion(_config.copyWith(
                sincronizarSoloWifi: value,
              ));
            },
          ),

          const SizedBox(height: 24),

          // Sección: Visualización
          _buildSectionHeader('Visualización'),
          _buildSwitchTile(
            title: 'Modo oscuro',
            subtitle: 'Usar tema oscuro en la aplicación',
            value: _config.modoOscuro,
            icon: Icons.dark_mode,
            onChanged: (value) {
              _guardarConfiguracion(_config.copyWith(
                modoOscuro: value,
              ));
            },
          ),
          _buildDropdownTile(
            title: 'Formato de fecha',
            subtitle: 'Formato para mostrar fechas',
            value: _config.formatoFecha,
            icon: Icons.calendar_today,
            items: const [
              DropdownMenuItem(
                value: 'dd/MM/yyyy',
                child: Text('DD/MM/YYYY'),
              ),
              DropdownMenuItem(
                value: 'MM/dd/yyyy',
                child: Text('MM/DD/YYYY'),
              ),
            ],
            onChanged: (value) {
              if (value != null) {
                _guardarConfiguracion(_config.copyWith(
                  formatoFecha: value,
                ));
              }
            },
          ),
          _buildDropdownTile(
            title: 'Idioma',
            subtitle: 'Idioma de la aplicación',
            value: _config.idioma,
            icon: Icons.language,
            items: const [
              DropdownMenuItem(value: 'es', child: Text('Español')),
              DropdownMenuItem(value: 'en', child: Text('English')),
            ],
            onChanged: (value) {
              if (value != null) {
                _guardarConfiguracion(_config.copyWith(
                  idioma: value,
                ));
              }
            },
          ),

          const SizedBox(height: 24),

          // Sección: Geolocalización
          _buildSectionHeader('Geolocalización'),
          _buildSwitchTile(
            title: 'Geolocalización automática',
            subtitle: 'Capturar ubicación automáticamente en interacciones',
            value: _config.geolocalizacionAutomatica,
            icon: Icons.location_on,
            onChanged: (value) {
              _guardarConfiguracion(_config.copyWith(
                geolocalizacionAutomatica: value,
              ));
            },
          ),
          _buildDropdownTile(
            title: 'Precisión de geolocalización',
            subtitle: 'Radio de precisión para ubicación',
            value: _config.precisionGeolocalizacion,
            icon: Icons.my_location,
            enabled: _config.geolocalizacionAutomatica,
            items: const [
              DropdownMenuItem(value: 10, child: Text('Alta (10 metros)')),
              DropdownMenuItem(value: 50, child: Text('Media (50 metros)')),
              DropdownMenuItem(value: 100, child: Text('Baja (100 metros)')),
            ],
            onChanged: (value) {
              if (value != null) {
                _guardarConfiguracion(_config.copyWith(
                  precisionGeolocalizacion: value,
                ));
              }
            },
          ),

          const SizedBox(height: 24),

          // Sección: Datos
          _buildSectionHeader('Datos'),
          _buildDropdownTile(
            title: 'Retención de datos locales',
            subtitle: 'Días para conservar datos en el dispositivo',
            value: _config.diasRetencionDatosLocales,
            icon: Icons.storage,
            items: const [
              DropdownMenuItem(value: 7, child: Text('7 días')),
              DropdownMenuItem(value: 15, child: Text('15 días')),
              DropdownMenuItem(value: 30, child: Text('30 días')),
              DropdownMenuItem(value: 60, child: Text('60 días')),
            ],
            onChanged: (value) {
              if (value != null) {
                _guardarConfiguracion(_config.copyWith(
                  diasRetencionDatosLocales: value,
                ));
              }
            },
          ),
          _buildSwitchTile(
            title: 'Guardar borradores',
            subtitle: 'Guardar automáticamente borradores de formularios',
            value: _config.guardarBorradores,
            icon: Icons.save,
            onChanged: (value) {
              _guardarConfiguracion(_config.copyWith(
                guardarBorradores: value,
              ));
            },
          ),

          const SizedBox(height: 32),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12, top: 8),
      child: Text(
        title,
        style: TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.bold,
          color: Colors.blue[700],
        ),
      ),
    );
  }

  Widget _buildSwitchTile({
    required String title,
    required String subtitle,
    required bool value,
    required IconData icon,
    required Function(bool) onChanged,
    bool enabled = true,
  }) {
    return Card(
      elevation: 2,
      margin: const EdgeInsets.only(bottom: 12),
      child: SwitchListTile(
        title: Text(
          title,
          style: TextStyle(
            fontWeight: FontWeight.w500,
            color: enabled ? Colors.black87 : Colors.grey,
          ),
        ),
        subtitle: Text(
          subtitle,
          style: TextStyle(
            fontSize: 12,
            color: enabled ? Colors.grey[600] : Colors.grey[400],
          ),
        ),
        secondary: Icon(
          icon,
          color: enabled ? Colors.blue[700] : Colors.grey,
        ),
        value: value,
        onChanged: enabled ? onChanged : null,
        activeColor: Colors.blue[700],
      ),
    );
  }

  Widget _buildDropdownTile<T>({
    required String title,
    required String subtitle,
    required T value,
    required IconData icon,
    required List<DropdownMenuItem<T>> items,
    required Function(T?) onChanged,
    bool enabled = true,
  }) {
    return Card(
      elevation: 2,
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: Icon(
          icon,
          color: enabled ? Colors.blue[700] : Colors.grey,
        ),
        title: Text(
          title,
          style: TextStyle(
            fontWeight: FontWeight.w500,
            color: enabled ? Colors.black87 : Colors.grey,
          ),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              subtitle,
              style: TextStyle(
                fontSize: 12,
                color: enabled ? Colors.grey[600] : Colors.grey[400],
              ),
            ),
            const SizedBox(height: 8),
            DropdownButton<T>(
              value: value,
              isExpanded: true,
              items: items,
              onChanged: enabled ? onChanged : null,
              underline: Container(
                height: 1,
                color: enabled ? Colors.blue[700] : Colors.grey,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
