import 'package:flutter/material.dart';
import '../models/frecuencia_indicador.dart';

class FrecuenciaIndicator extends StatelessWidget {
  final FrecuenciaIndicador? frecuencia;
  final bool showTooltip;

  const FrecuenciaIndicator({
    Key? key,
    this.frecuencia,
    this.showTooltip = true,
  }) : super(key: key);

  Color _getColor() {
    if (frecuencia == null) return const Color(0xFF6c757d); // gris

    switch (frecuencia!.estado) {
      case 'amarillo':
        return const Color(0xFFffc107);
      case 'verde':
        return const Color(0xFF28a745);
      case 'azul':
        return const Color(0xFF17a2b8);
      default:
        return const Color(0xFF6c757d); // gris
    }
  }

  String _getTooltipText() {
    if (frecuencia == null) return 'Sin datos de frecuencia';

    String statusText;
    switch (frecuencia!.estado) {
      case 'gris':
        statusText = 'Sin visitas registradas';
        break;
      case 'amarillo':
        statusText = '${frecuencia!.visitasPendientes} visita${frecuencia!.visitasPendientes != 1 ? 's' : ''} pendiente${frecuencia!.visitasPendientes != 1 ? 's' : ''}';
        break;
      case 'verde':
        statusText = 'Objetivo cumplido';
        break;
      case 'azul':
        statusText = 'Objetivo superado';
        break;
      default:
        statusText = 'Estado desconocido';
    }

    return '${frecuencia!.interaccionesRealizadas}/${frecuencia!.frecuenciaObjetivo} visitas - $statusText\nPeríodo: ${frecuencia!.periodoMedicion}';
  }

  @override
  Widget build(BuildContext context) {
    Widget indicator = Container(
      width: 5,
      height: double.infinity,
      decoration: BoxDecoration(
        color: _getColor(),
        borderRadius: const BorderRadius.only(
          topLeft: Radius.circular(2),
          bottomLeft: Radius.circular(2),
        ),
      ),
    );

    if (showTooltip && frecuencia != null) {
      return Tooltip(
        message: _getTooltipText(),
        child: indicator,
      );
    }

    return indicator;
  }
}
