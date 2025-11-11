// Tipos para la configuración de interacciones en ConfiguracionUi

export interface ProductosPromocionadosConfig {
  habilitado: boolean;
  minCantidad?: number;
  maxCantidad?: number;
  requerido?: boolean;
  label?: string;
  helpText?: string;
}

export interface MuestrasEntregadasConfig {
  habilitado: boolean;
  requerido?: boolean;
  label?: string;
  helpText?: string;
}

export interface PedidoProductosConfig {
  habilitado: boolean;
  requerido?: boolean;
  label?: string;
  helpText?: string;
}

export interface FrequencyConfig {
  medirFrecuencia: boolean;
  periodoEvaluacion?: 'semanal' | 'mensual' | 'trimestral' | 'anual' | 'ciclo';
  frecuenciaMinima?: number;
  frecuenciaObjetivo?: number;
  label?: string;
  helpText?: string;
}

export interface InteractionLayoutConfig {
  showProductosPromovidos?: boolean;
  showMuestrasEntregadas?: boolean;
  showPedidoProductos?: boolean;
  seccionOrden?: string[];
}

export interface InteractionConfiguracionUi {
  productosPromocionados?: ProductosPromocionadosConfig;
  muestrasEntregadas?: MuestrasEntregadasConfig;
  pedidoProductos?: PedidoProductosConfig;
  frecuencia?: FrequencyConfig;
  layout?: InteractionLayoutConfig;
}

// Valores por defecto
export const defaultProductosPromocionadosConfig: ProductosPromocionadosConfig = {
  habilitado: false,
  minCantidad: 0,
  maxCantidad: 10,
  requerido: false,
  label: 'Productos Promocionados',
  helpText: 'Ingrese los productos que fueron promocionados durante la visita'
};

export const defaultMuestrasEntregadasConfig: MuestrasEntregadasConfig = {
  habilitado: false,
  requerido: false,
  label: 'Muestras/Materiales Entregados',
  helpText: 'Registre las muestras médicas o materiales entregados'
};

export const defaultPedidoProductosConfig: PedidoProductosConfig = {
  habilitado: false,
  requerido: false,
  label: 'Pedido de Productos',
  helpText: 'Permite registrar pedidos de productos durante la visita'
};

export const defaultFrequencyConfig: FrequencyConfig = {
  medirFrecuencia: false,
  periodoEvaluacion: 'mensual',
  frecuenciaMinima: 1,
  frecuenciaObjetivo: 4,
  label: 'Medición de Frecuencia',
  helpText: 'Permite evaluar la frecuencia de visitas en un período determinado'
};

export const defaultInteractionConfig: InteractionConfiguracionUi = {
  productosPromocionados: defaultProductosPromocionadosConfig,
  muestrasEntregadas: defaultMuestrasEntregadasConfig,
  pedidoProductos: defaultPedidoProductosConfig,
  frecuencia: defaultFrequencyConfig,
  layout: {
    showProductosPromovidos: true,
    showMuestrasEntregadas: true,
    showPedidoProductos: true,
    seccionOrden: ['productosPromocionados', 'muestrasEntregadas', 'pedidoProductos']
  }
};

// Helper para parsear la configuración desde JSON
export function parseInteractionConfig(configuracionUiJson?: string | null): InteractionConfiguracionUi {
  if (!configuracionUiJson) {
    return defaultInteractionConfig;
  }

  try {
    const parsed = JSON.parse(configuracionUiJson);
    return {
      productosPromocionados: {
        ...defaultProductosPromocionadosConfig,
        ...parsed.productosPromocionados
      },
      muestrasEntregadas: {
        ...defaultMuestrasEntregadasConfig,
        ...parsed.muestrasEntregadas
      },
      pedidoProductos: {
        ...defaultPedidoProductosConfig,
        ...parsed.pedidoProductos
      },
      frecuencia: {
        ...defaultFrequencyConfig,
        ...parsed.frecuencia
      },
      layout: {
        ...defaultInteractionConfig.layout,
        ...parsed.layout
      }
    };
  } catch (error) {
    console.error('Error parsing InteractionConfiguracionUi:', error);
    return defaultInteractionConfig;
  }
}

// Helper para validar productos promocionados
export interface ProductosPromocionadosValidation {
  isValid: boolean;
  error?: string;
}

export function validateProductosPromocionados(
  productos: any[],
  config: ProductosPromocionadosConfig
): ProductosPromocionadosValidation {
  if (!config.habilitado) {
    return { isValid: true };
  }

  const cantidad = productos?.length || 0;

  if (config.requerido && cantidad === 0) {
    return {
      isValid: false,
      error: 'Debe informar al menos un producto promocionado'
    };
  }

  if (config.minCantidad && cantidad < config.minCantidad) {
    return {
      isValid: false,
      error: `Debe informar al menos ${config.minCantidad} producto(s) promocionado(s)`
    };
  }

  if (config.maxCantidad && cantidad > config.maxCantidad) {
    return {
      isValid: false,
      error: `Puede informar máximo ${config.maxCantidad} producto(s) promocionado(s)`
    };
  }

  return { isValid: true };
}
