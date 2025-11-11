// ==================== PRODUCTO ====================

export interface Producto {
  id: string;
  codigoProducto: string;
  nombre: string;
  nombreComercial?: string;
  descripcion?: string;
  presentacion?: string;
  categoria?: string;
  laboratorio?: string;
  principioActivo?: string;
  concentracion?: string;
  viaAdministracion?: string;
  indicaciones?: string;
  contraindicaciones?: string;
  precioReferencia?: number;
  imagenUrl?: string;
  activo: boolean;
  esMuestra: boolean;
  requiereReceta: boolean;
  lineaNegocioId?: string;
  lineaNegocioNombre?: string;
  fechaCreacion: Date;
}

export interface CreateProductoDto {
  codigoProducto: string;
  nombre: string;
  nombreComercial?: string;
  descripcion?: string;
  presentacion?: string;
  categoria?: string;
  laboratorio?: string;
  principioActivo?: string;
  concentracion?: string;
  viaAdministracion?: string;
  indicaciones?: string;
  contraindicaciones?: string;
  precioReferencia?: number;
  imagenUrl?: string;
  activo?: boolean;
  esMuestra?: boolean;
  requiereReceta?: boolean;
  lineaNegocioId?: string;
}

export interface UpdateProductoDto {
  nombre?: string;
  nombreComercial?: string;
  descripcion?: string;
  presentacion?: string;
  categoria?: string;
  precioReferencia?: number;
  imagenUrl?: string;
  activo?: boolean;
}

export interface ProductoListResponse {
  items: Producto[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

// ==================== INVENTARIO AGENTE ====================

export interface InventarioAgente {
  id: string;
  agenteId: string;
  productoId: string;
  producto?: Producto;
  cantidadDisponible: number;
  cantidadInicial?: number;
  cantidadEntregada: number;
  fechaUltimaRecarga?: Date;
  loteActual?: string;
  fechaVencimiento?: Date;
  observaciones?: string;
  // Helpers calculados
  estaPorVencer: boolean;
  estaVencido: boolean;
  stockBajo: boolean;
  diasParaVencer?: number;
}

export interface RecargaInventarioDto {
  cantidad: number;
  lote: string;
  fechaVencimiento: Date;
  observaciones?: string;
}

export interface ActualizarInventarioDto {
  cantidadEntregada?: number;
  observaciones?: string;
}

export interface CreateInventarioDto {
  agenteId: string;
  productoId: string;
  cantidadInicial: number;
  lote: string;
  fechaVencimiento: Date;
  observaciones?: string;
}

export interface InventarioListResponse {
  items: InventarioAgente[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

// ==================== MUESTRA MÉDICA ====================

export interface MuestraMedica {
  id: string;
  interaccionId: string;
  productoId: string;
  producto?: Producto;
  agenteId: string;
  clienteId: string;
  clienteNombre?: string;
  cantidad: number;
  lote?: string;
  fechaVencimiento?: Date;
  fechaEntrega: Date;
  observaciones?: string;
  firmaDigital?: string;
  fotoComprobante?: string;
}

export interface CreateMuestraMedicaDto {
  interaccionId: string;
  productoId: string;
  agenteId: string;
  clienteId: string;
  cantidad: number;
  lote?: string;
  fechaVencimiento?: Date;
  fechaEntrega?: Date;
  observaciones?: string;
  firmaDigital?: string;
  fotoComprobante?: string;
}
