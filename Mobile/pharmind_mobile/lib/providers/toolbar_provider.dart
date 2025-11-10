import 'package:flutter/material.dart';

/// Acción del toolbar con icono, etiqueta y callback
class ToolbarAction {
  final IconData icon;
  final String? label;
  final VoidCallback onPressed;
  final Color? color;
  final bool isEnabled;

  const ToolbarAction({
    required this.icon,
    this.label,
    required this.onPressed,
    this.color,
    this.isEnabled = true,
  });
}

/// Provider para gestionar el estado y acciones del Bottom Toolbar
class ToolbarProvider extends ChangeNotifier {
  List<ToolbarAction> _actions = [];
  bool _isVisible = true;

  List<ToolbarAction> get actions => _actions;
  bool get isVisible => _isVisible;

  /// Establece las acciones del toolbar para el módulo actual
  void setActions(List<ToolbarAction> actions) {
    _actions = actions;
    notifyListeners();
  }

  /// Agrega una acción al toolbar
  void addAction(ToolbarAction action) {
    _actions.add(action);
    notifyListeners();
  }

  /// Limpia todas las acciones
  void clearActions() {
    _actions = [];
    notifyListeners();
  }

  /// Muestra u oculta el toolbar
  void setVisibility(bool visible) {
    _isVisible = visible;
    notifyListeners();
  }

  /// Oculta el toolbar
  void hide() {
    _isVisible = false;
    notifyListeners();
  }

  /// Muestra el toolbar
  void show() {
    _isVisible = true;
    notifyListeners();
  }

  /// Acciones predefinidas comunes

  static ToolbarAction createAction({
    required IconData icon,
    String? label,
    required VoidCallback onPressed,
    Color? color,
    bool isEnabled = true,
  }) {
    return ToolbarAction(
      icon: icon,
      label: label,
      onPressed: onPressed,
      color: color,
      isEnabled: isEnabled,
    );
  }

  static ToolbarAction createAddAction(VoidCallback onPressed, {bool isEnabled = true}) {
    return ToolbarAction(
      icon: Icons.add_circle_outline,
      label: 'Agregar',
      onPressed: onPressed,
      color: Colors.blue,
      isEnabled: isEnabled,
    );
  }

  static ToolbarAction createDeleteAction(VoidCallback onPressed, {bool isEnabled = true}) {
    return ToolbarAction(
      icon: Icons.delete_outline,
      label: 'Eliminar',
      onPressed: onPressed,
      color: Colors.red,
      isEnabled: isEnabled,
    );
  }

  static ToolbarAction createEditAction(VoidCallback onPressed, {bool isEnabled = true}) {
    return ToolbarAction(
      icon: Icons.edit_outlined,
      label: 'Editar',
      onPressed: onPressed,
      isEnabled: isEnabled,
    );
  }

  static ToolbarAction createShareAction(VoidCallback onPressed, {bool isEnabled = true}) {
    return ToolbarAction(
      icon: Icons.share_outlined,
      label: 'Compartir',
      onPressed: onPressed,
      isEnabled: isEnabled,
    );
  }

  static ToolbarAction createFavoriteAction(VoidCallback onPressed, {bool isEnabled = true}) {
    return ToolbarAction(
      icon: Icons.star_outline,
      label: 'Favorito',
      onPressed: onPressed,
      isEnabled: isEnabled,
    );
  }

  static ToolbarAction createFilterAction(VoidCallback onPressed, {bool isEnabled = true}) {
    return ToolbarAction(
      icon: Icons.filter_list,
      label: 'Filtrar',
      onPressed: onPressed,
      isEnabled: isEnabled,
    );
  }

  static ToolbarAction createSearchAction(VoidCallback onPressed, {bool isEnabled = true}) {
    return ToolbarAction(
      icon: Icons.search,
      label: 'Buscar',
      onPressed: onPressed,
      isEnabled: isEnabled,
    );
  }

  static ToolbarAction createSyncAction(VoidCallback onPressed, {bool isEnabled = true}) {
    return ToolbarAction(
      icon: Icons.sync,
      label: 'Sincronizar',
      onPressed: onPressed,
      isEnabled: isEnabled,
    );
  }

  static ToolbarAction createSettingsAction(VoidCallback onPressed, {bool isEnabled = true}) {
    return ToolbarAction(
      icon: Icons.settings_outlined,
      label: 'Configuración',
      onPressed: onPressed,
      isEnabled: isEnabled,
    );
  }
}
