import 'package:flutter/material.dart';
import '../models/producto.dart';

/// Tabla para mostrar y gestionar productos promocionados
/// Cada producto tiene un resultado (Muy Positivo, Positivo, Neutral, Negativo)
class ProductosPromocionadosTable extends StatelessWidget {
  final List<ProductoPromocionado> productos;
  final Function(int index, String resultado) onResultadoChanged;
  final Function(int index) onRemove;

  const ProductosPromocionadosTable({
    super.key,
    required this.productos,
    required this.onResultadoChanged,
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
            'No hay productos promocionados agregados',
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
                  flex: 3,
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
                    'Resultado',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      color: Colors.grey.shade700,
                    ),
                    overflow: TextOverflow.ellipsis,
                    maxLines: 1,
                  ),
                ),
                const SizedBox(width: 40),
              ],
            ),
          ),

          // Rows
          ...productos.asMap().entries.map((entry) {
            final index = entry.key;
            final producto = entry.value;
            return _ProductoPromocionadoRow(
              producto: producto,
              onResultadoChanged: (resultado) => onResultadoChanged(index, resultado),
              onRemove: () => onRemove(index),
            );
          }).toList(),
        ],
      ),
    );
  }
}

class _ProductoPromocionadoRow extends StatelessWidget {
  final ProductoPromocionado producto;
  final Function(String resultado) onResultadoChanged;
  final VoidCallback onRemove;

  const _ProductoPromocionadoRow({
    required this.producto,
    required this.onResultadoChanged,
    required this.onRemove,
  });

  Color _getResultadoColor(String? resultado) {
    switch (resultado) {
      case 'Muy Positivo':
        return Colors.green.shade700;
      case 'Positivo':
        return Colors.green;
      case 'Neutral':
        return Colors.orange;
      case 'Negativo':
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
              flex: 3,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    producto.displayName,
                    style: const TextStyle(fontWeight: FontWeight.w500),
                  ),
                ],
              ),
            ),

            // Resultado dropdown
            Expanded(
              flex: 2,
              child: DropdownButtonFormField<String>(
                value: producto.observaciones,
                isExpanded: true,
                decoration: const InputDecoration(
                  contentPadding: EdgeInsets.symmetric(horizontal: 8, vertical: 8),
                  border: OutlineInputBorder(),
                  isDense: true,
                ),
                items: const [
                  DropdownMenuItem(
                    value: 'Muy Positivo',
                    child: Text('Muy Positivo', overflow: TextOverflow.ellipsis),
                  ),
                  DropdownMenuItem(
                    value: 'Positivo',
                    child: Text('Positivo', overflow: TextOverflow.ellipsis),
                  ),
                  DropdownMenuItem(
                    value: 'Neutral',
                    child: Text('Neutral', overflow: TextOverflow.ellipsis),
                  ),
                  DropdownMenuItem(
                    value: 'Negativo',
                    child: Text('Negativo', overflow: TextOverflow.ellipsis),
                  ),
                ],
                onChanged: (value) {
                  if (value != null) {
                    onResultadoChanged(value);
                  }
                },
                hint: const Text('Seleccione', overflow: TextOverflow.ellipsis),
                icon: Icon(
                  Icons.arrow_drop_down,
                  color: _getResultadoColor(producto.observaciones),
                  size: 20,
                ),
              ),
            ),

            const SizedBox(width: 8),

            // Remove button
            IconButton(
              icon: const Icon(Icons.delete_outline, color: Colors.red),
              onPressed: onRemove,
              tooltip: 'Eliminar',
            ),
          ],
        ),
      ),
    );
  }
}
