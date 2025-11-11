import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../models/producto.dart';

/// Tabla para mostrar y gestionar productos solicitados (pedidos)
/// Cada producto tiene una cantidad editable
class ProductosSolicitadosTable extends StatelessWidget {
  final List<ProductoSolicitado> productos;
  final Function(int index, int cantidad) onCantidadChanged;
  final Function(int index) onRemove;

  const ProductosSolicitadosTable({
    super.key,
    required this.productos,
    required this.onCantidadChanged,
    required this.onRemove,
  });

  @override
  Widget build(BuildContext context) {
    if (productos.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          border: Border.all(color: Colors.grey.shade300),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Center(
          child: Text(
            'No hay productos solicitados agregados',
            style: TextStyle(color: Colors.grey.shade600),
          ),
        ),
      );
    }

    return Container(
      decoration: BoxDecoration(
        border: Border.all(color: Colors.grey.shade300),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        children: [
          // Header
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.grey.shade100,
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(8),
                topRight: Radius.circular(8),
              ),
            ),
            child: Row(
              children: [
                Expanded(
                  flex: 2,
                  child: Text(
                    'Producto',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      color: Colors.grey.shade700,
                    ),
                    overflow: TextOverflow.ellipsis,
                    maxLines: 1,
                  ),
                ),
                Expanded(
                  flex: 2,
                  child: Text(
                    'Cantidad',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      color: Colors.grey.shade700,
                    ),
                    textAlign: TextAlign.center,
                    overflow: TextOverflow.ellipsis,
                    maxLines: 1,
                  ),
                ),
                const SizedBox(width: 48),
              ],
            ),
          ),

          // Rows
          ...productos.asMap().entries.map((entry) {
            final index = entry.key;
            final producto = entry.value;
            return _ProductoSolicitadoRow(
              producto: producto,
              onCantidadChanged: (cantidad) => onCantidadChanged(index, cantidad),
              onRemove: () => onRemove(index),
            );
          }),
        ],
      ),
    );
  }
}

class _ProductoSolicitadoRow extends StatefulWidget {
  final ProductoSolicitado producto;
  final Function(int cantidad) onCantidadChanged;
  final VoidCallback onRemove;

  const _ProductoSolicitadoRow({
    required this.producto,
    required this.onCantidadChanged,
    required this.onRemove,
  });

  @override
  State<_ProductoSolicitadoRow> createState() => _ProductoSolicitadoRowState();
}

class _ProductoSolicitadoRowState extends State<_ProductoSolicitadoRow> {
  late TextEditingController _cantidadController;

  @override
  void initState() {
    super.initState();
    _cantidadController = TextEditingController(
      text: widget.producto.cantidad.toString(),
    );
  }

  @override
  void dispose() {
    _cantidadController.dispose();
    super.dispose();
  }

  void _incrementCantidad() {
    final currentValue = int.tryParse(_cantidadController.text) ?? 1;
    final newValue = currentValue + 1;
    _cantidadController.text = newValue.toString();
    widget.onCantidadChanged(newValue);
  }

  void _decrementCantidad() {
    final currentValue = int.tryParse(_cantidadController.text) ?? 1;
    if (currentValue > 1) {
      final newValue = currentValue - 1;
      _cantidadController.text = newValue.toString();
      widget.onCantidadChanged(newValue);
    }
  }

  Color _getEstadoColor() {
    switch (widget.producto.estado) {
      case 'Pendiente':
        return Colors.orange;
      case 'Aprobado':
        return Colors.green;
      case 'Rechazado':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        border: Border(
          top: BorderSide(color: Colors.grey.shade200),
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            // Producto info
            Expanded(
              flex: 2,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    widget.producto.displayName,
                    style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 13),
                    overflow: TextOverflow.ellipsis,
                    maxLines: 2,
                  ),
                  const SizedBox(height: 4),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: _getEstadoColor().withOpacity(0.2),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: _getEstadoColor()),
                    ),
                    child: Text(
                      widget.producto.estado,
                      style: TextStyle(
                        fontSize: 9,
                        fontWeight: FontWeight.bold,
                        color: _getEstadoColor(),
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // Cantidad controls
            Expanded(
              flex: 2,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Decrement button
                  IconButton(
                    icon: const Icon(Icons.remove_circle_outline),
                    onPressed: _decrementCantidad,
                    iconSize: 16,
                    padding: const EdgeInsets.all(2),
                    constraints: const BoxConstraints(minWidth: 20, minHeight: 20),
                  ),

                  // Cantidad input
                  SizedBox(
                    width: 35,
                    child: TextField(
                      controller: _cantidadController,
                      textAlign: TextAlign.center,
                      keyboardType: TextInputType.number,
                      style: const TextStyle(fontSize: 13),
                      inputFormatters: [
                        FilteringTextInputFormatter.digitsOnly,
                      ],
                      decoration: const InputDecoration(
                        contentPadding: EdgeInsets.symmetric(horizontal: 2, vertical: 4),
                        border: OutlineInputBorder(),
                        isDense: true,
                      ),
                      onChanged: (value) {
                        final cantidad = int.tryParse(value);
                        if (cantidad != null && cantidad > 0) {
                          widget.onCantidadChanged(cantidad);
                        }
                      },
                    ),
                  ),

                  // Increment button
                  IconButton(
                    icon: const Icon(Icons.add_circle_outline),
                    onPressed: _incrementCantidad,
                    iconSize: 16,
                    padding: const EdgeInsets.all(2),
                    constraints: const BoxConstraints(minWidth: 20, minHeight: 20),
                  ),
                ],
              ),
            ),

            // Remove button
            SizedBox(
              width: 40,
              child: IconButton(
                icon: const Icon(Icons.delete_outline, color: Colors.red, size: 18),
                onPressed: widget.onRemove,
                tooltip: 'Eliminar',
                padding: const EdgeInsets.all(2),
                constraints: const BoxConstraints(minWidth: 28, minHeight: 28),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
