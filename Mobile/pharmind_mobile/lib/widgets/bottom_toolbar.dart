import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/toolbar_provider.dart';

/// Bottom Toolbar contextual que se adapta según el módulo activo
class BottomToolbar extends StatelessWidget {
  const BottomToolbar({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<ToolbarProvider>(
      builder: (context, toolbarProvider, child) {
        if (!toolbarProvider.isVisible || toolbarProvider.actions.isEmpty) {
          return const SizedBox.shrink();
        }

        return Container(
          decoration: BoxDecoration(
            color: Colors.white,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.1),
                blurRadius: 8,
                offset: const Offset(0, -2),
              ),
            ],
          ),
          child: SafeArea(
            top: false,
            child: Container(
              height: 72,
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
              child: Row(
                mainAxisAlignment: toolbarProvider.actions.length <= 3
                    ? MainAxisAlignment.spaceEvenly
                    : MainAxisAlignment.spaceBetween,
                children: toolbarProvider.actions.map((action) {
                  return _ToolbarButton(action: action);
                }).toList(),
              ),
            ),
          ),
        );
      },
    );
  }
}

/// Botón individual del toolbar
class _ToolbarButton extends StatelessWidget {
  final ToolbarAction action;

  const _ToolbarButton({required this.action});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final color = action.isEnabled
        ? (action.color ?? theme.primaryColor)
        : Colors.grey.shade400;

    return Expanded(
      child: InkWell(
        onTap: action.isEnabled ? action.onPressed : null,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          margin: const EdgeInsets.symmetric(horizontal: 4),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            color: action.isEnabled
                ? color.withOpacity(0.1)
                : Colors.grey.shade100,
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                action.icon,
                color: color,
                size: 24,
              ),
              if (action.label != null) ...[
                const SizedBox(height: 4),
                Text(
                  action.label!,
                  style: TextStyle(
                    color: color,
                    fontSize: 11,
                    fontWeight: FontWeight.w500,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  textAlign: TextAlign.center,
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

/// Versión compacta del toolbar (sin etiquetas)
class CompactBottomToolbar extends StatelessWidget {
  const CompactBottomToolbar({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<ToolbarProvider>(
      builder: (context, toolbarProvider, child) {
        if (!toolbarProvider.isVisible || toolbarProvider.actions.isEmpty) {
          return const SizedBox.shrink();
        }

        return Container(
          decoration: BoxDecoration(
            color: Colors.white,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.1),
                blurRadius: 8,
                offset: const Offset(0, -2),
              ),
            ],
          ),
          child: SafeArea(
            top: false,
            child: Container(
              height: 56,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: toolbarProvider.actions.map((action) {
                  final theme = Theme.of(context);
                  final color = action.isEnabled
                      ? (action.color ?? theme.primaryColor)
                      : Colors.grey.shade400;

                  return IconButton(
                    onPressed: action.isEnabled ? action.onPressed : null,
                    icon: Icon(
                      action.icon,
                      color: color,
                    ),
                    tooltip: action.label,
                    iconSize: 28,
                  );
                }).toList(),
              ),
            ),
          ),
        );
      },
    );
  }
}
