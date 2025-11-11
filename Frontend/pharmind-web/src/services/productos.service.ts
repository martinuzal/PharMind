import api from './api';
import type {
  Producto,
  CreateProductoDto,
  UpdateProductoDto,
  InventarioAgente,
  RecargaInventarioDto,
  ActualizarInventarioDto,
  CreateInventarioDto
} from '../types/productos';

const productosService = {
  // ==================== PRODUCTOS ====================

  // Obtener todos los productos activos
  getAll: async (): Promise<Producto[]> => {
    const response = await api.get('/productos');
    return response.data;
  },

  // Obtener producto por ID
  getById: async (id: string): Promise<Producto> => {
    const response = await api.get(`/productos/${id}`);
    return response.data;
  },

  // Obtener productos por categoría
  getPorCategoria: async (categoria: string): Promise<Producto[]> => {
    const response = await api.get(`/productos/categoria/${categoria}`);
    return response.data;
  },

  // Buscar productos
  buscar: async (query: string): Promise<Producto[]> => {
    const response = await api.get('/productos/buscar', {
      params: { q: query }
    });
    return response.data;
  },

  // Obtener solo muestras médicas
  getMuestras: async (): Promise<Producto[]> => {
    const response = await api.get('/productos/muestras');
    return response.data;
  },

  // Obtener lista de categorías
  getCategorias: async (): Promise<string[]> => {
    const response = await api.get('/productos/categorias');
    return response.data;
  },

  // Crear nuevo producto
  create: async (data: CreateProductoDto): Promise<Producto> => {
    const response = await api.post('/productos', data);
    return response.data;
  },

  // Actualizar producto
  update: async (id: string, data: UpdateProductoDto): Promise<Producto> => {
    const response = await api.put(`/productos/${id}`, data);
    return response.data;
  },

  // ==================== INVENTARIOS ====================

  // Crear inventario inicial para un agente
  crearInventario: async (data: CreateInventarioDto): Promise<InventarioAgente> => {
    const response = await api.post('/inventarios', data);
    return response.data;
  },

  // Obtener inventario del agente
  getInventarioAgente: async (agenteId: string): Promise<InventarioAgente[]> => {
    const response = await api.get(`/inventarios/agente/${agenteId}`);
    return response.data;
  },

  // Obtener un inventario específico
  getInventarioById: async (id: string): Promise<InventarioAgente> => {
    const response = await api.get(`/inventarios/${id}`);
    return response.data;
  },

  // Registrar recarga de inventario
  recargarInventario: async (id: string, data: RecargaInventarioDto): Promise<InventarioAgente> => {
    const response = await api.post(`/inventarios/${id}/recarga`, data);
    return response.data;
  },

  // Actualizar inventario
  actualizarInventario: async (id: string, data: ActualizarInventarioDto): Promise<InventarioAgente> => {
    const response = await api.put(`/inventarios/${id}`, data);
    return response.data;
  },

  // Obtener items con stock bajo
  getInventarioStockBajo: async (agenteId: string): Promise<InventarioAgente[]> => {
    const response = await api.get(`/inventarios/agente/${agenteId}/stock-bajo`);
    return response.data;
  },

  // Obtener items por vencer
  getInventarioPorVencer: async (agenteId: string): Promise<InventarioAgente[]> => {
    const response = await api.get(`/inventarios/agente/${agenteId}/por-vencer`);
    return response.data;
  }
};

export default productosService;
