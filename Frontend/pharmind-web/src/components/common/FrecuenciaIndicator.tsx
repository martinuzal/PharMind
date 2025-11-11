import React from 'react';
import './FrecuenciaIndicator.css';

export interface FrecuenciaIndicadorData {
  interaccionesRealizadas: number;
  frecuenciaObjetivo: number;
  periodoMedicion: string;
  fechaInicioPeriodo: string;
  fechaFinPeriodo: string;
  estado: 'gris' | 'amarillo' | 'verde' | 'azul';
  visitasPendientes: number;
}

interface FrecuenciaIndicatorProps {
  frecuencia?: FrecuenciaIndicadorData | null;
  showTooltip?: boolean;
}

const FrecuenciaIndicator: React.FC<FrecuenciaIndicatorProps> = ({
  frecuencia,
  showTooltip = true
}) => {
  if (!frecuencia) {
    return <div className="frecuencia-indicator frecuencia-gris" />;
  }

  const getTooltipText = () => {
    const { interaccionesRealizadas, frecuenciaObjetivo, visitasPendientes, periodoMedicion } = frecuencia;

    let statusText = '';
    switch (frecuencia.estado) {
      case 'gris':
        statusText = 'Sin visitas registradas';
        break;
      case 'amarillo':
        statusText = `${visitasPendientes} visita${visitasPendientes !== 1 ? 's' : ''} pendiente${visitasPendientes !== 1 ? 's' : ''}`;
        break;
      case 'verde':
        statusText = 'Objetivo cumplido';
        break;
      case 'azul':
        statusText = 'Objetivo superado';
        break;
    }

    return `${interaccionesRealizadas}/${frecuenciaObjetivo} visitas - ${statusText}\nPeríodo: ${periodoMedicion}`;
  };

  return (
    <div
      className={`frecuencia-indicator frecuencia-${frecuencia.estado}`}
      title={showTooltip ? getTooltipText() : undefined}
    />
  );
};

export default FrecuenciaIndicator;
export type { FrecuenciaIndicadorData };
