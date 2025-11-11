import React, { useState, useEffect } from 'react';
import './ProductSelectorModal.css';

interface Producto {
  id: string;
  codigoProducto: string;
  nombre: string;
  nombreComercial?: string;
  presentacion?: string;
  categoria?: string;
  laboratorio?: string;
  esMuestra: boolean;
  activo: boolean;
}

interface ProductOption {
  displayName: string;
  productos: Producto[];
}

export interface SelectedProduct {
  producto: Producto;
  resultado?: string;
  cantidad?: number;
}

interface ProductSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (producto: Producto, cantidad: number) => void;
  productos: Producto[];
  title: string;
  groupByNombreComercial?: boolean;
  incluirPresentacion?: boolean;
  // Nuevo modo para productos promocionados y muestras
  multiSelect?: boolean;
  showResultado?: boolean;
  showCantidad?: boolean;
  onMultiSelect?: (productos: SelectedProduct[]) => void;
}

const ProductSelectorModal: React.FC<ProductSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  productos,
  title,
  groupByNombreComercial = true,
  incluirPresentacion = false,
  multiSelect = false,
  showResultado = false,
  showCantidad = false,
  onMultiSelect
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null);
  const [groupedOptions, setGroupedOptions] = useState<Map<string, ProductOption>>(new Map());
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);

  useEffect(() => {
    if (isOpen) {
      console.log('🔍 DEBUG ProductSelectorModal - Modal abierto');
      console.log('🔍 DEBUG ProductSelectorModal - Productos recibidos:', productos.length);
      console.log('🔍 DEBUG ProductSelectorModal - groupByNombreComercial:', groupByNombreComercial);
      console.log('🔍 DEBUG ProductSelectorModal - incluirPresentacion:', incluirPresentacion);
      console.log('🔍 DEBUG ProductSelectorModal - multiSelect:', multiSelect);
      // Reset state when modal opens
      setSearchTerm('');
      setCantidad(1);
      setSelectedOption(null);
      setSelectedProducto(null);
      setSelectedProducts([]);
      groupProducts();
    }
  }, [isOpen, productos]);

  const groupProducts = () => {
    const grouped = new Map<string, ProductOption>();

    console.log('🔍 DEBUG groupProducts - Agrupando productos:', productos.length);

    productos.forEach(producto => {
      let key: string;

      if (groupByNombreComercial) {
        // Para productos promocionados: solo nombre comercial
        key = producto.nombreComercial || producto.nombre;
      } else if (incluirPresentacion) {
        // Para muestras y pedidos: nombre comercial + presentación
        const nombre = producto.nombreComercial || producto.nombre;
        const presentacion = producto.presentacion || '';
        key = presentacion ? `${nombre} - ${presentacion}` : nombre;
      } else {
        key = producto.nombre;
      }

      if (!grouped.has(key)) {
        grouped.set(key, {
          displayName: key,
          productos: []
        });
      }

      grouped.get(key)!.productos.push(producto);
    });

    console.log('🔍 DEBUG groupProducts - Grupos creados:', grouped.size);
    console.log('🔍 DEBUG groupProducts - Primeras 3 keys:', Array.from(grouped.keys()).slice(0, 3));

    setGroupedOptions(grouped);
  };

  const handleOptionSelect = (key: string, option: ProductOption) => {
    setSelectedOption(key);
    // Si solo hay un producto en el grupo, seleccionarlo directamente
    if (option.productos.length === 1) {
      setSelectedProducto(option.productos[0]);
    } else {
      setSelectedProducto(null);
    }
  };

  const handleProductSelect = (producto: Producto) => {
    setSelectedProducto(producto);
  };

  const handleMultiSelectToggle = (producto: Producto) => {
    const exists = selectedProducts.find(sp => sp.producto.id === producto.id);
    if (exists) {
      setSelectedProducts(selectedProducts.filter(sp => sp.producto.id !== producto.id));
    } else {
      setSelectedProducts([...selectedProducts, { producto, resultado: undefined, cantidad: 1 }]);
    }
  };

  const handleResultadoChange = (productoId: string, resultado: string) => {
    setSelectedProducts(selectedProducts.map(sp =>
      sp.producto.id === productoId ? { ...sp, resultado } : sp
    ));
  };

  const handleCantidadChange = (productoId: string, cantidad: number) => {
    setSelectedProducts(selectedProducts.map(sp =>
      sp.producto.id === productoId ? { ...sp, cantidad } : sp
    ));
  };

  const handleConfirm = () => {
    if (multiSelect && onMultiSelect) {
      onMultiSelect(selectedProducts);
      onClose();
    } else if (selectedProducto && cantidad > 0) {
      onSelect(selectedProducto, cantidad);
      onClose();
    }
  };

  const filteredOptions = Array.from(groupedOptions.entries()).filter(([key, option]) =>
    key.toLowerCase().includes(searchTerm.toLowerCase()) ||
    option.productos.some(p =>
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.categoria?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.laboratorio?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const selectedOptionData = selectedOption ? groupedOptions.get(selectedOption) : null;

  if (!isOpen) return null;

  // Renderizado para modo multi-selección (productos promocionados)
  if (multiSelect) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content product-selector-modal product-selector-multiselect" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>{title}</h3>
            <button type="button" className="btn-close" onClick={onClose}>
              <span className="material-icons">close</span>
            </button>
          </div>

          <div className="modal-body">
            {/* Búsqueda - 100% ancho, 70px alto */}
            <div className="search-box-full">
              <span className="material-icons search-icon">search</span>
              <input
                type="text"
                placeholder="Buscar producto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input-full"
                autoFocus
              />
              {searchTerm && (
                <button
                  className="search-clear"
                  onClick={() => setSearchTerm('')}
                >
                  <span className="material-icons">clear</span>
                </button>
              )}
            </div>

            {/* Lista de productos - 100% ancho */}
            <div className="products-grid">
              {filteredOptions.map(([key, option]) => {
                const producto = option.productos[0];
                const isSelected = selectedProducts.some(sp => sp.producto.id === producto.id);

                return (
                  <div
                    key={producto.id}
                    className={`product-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleMultiSelectToggle(producto)}
                  >
                    <div className="product-card-header">
                      <div className="product-card-info">
                        <div className="product-card-name">{option.displayName}</div>
                        {producto.categoria && (
                          <div className="product-card-category">{producto.categoria}</div>
                        )}
                      </div>
                      <div className="product-card-checkbox">
                        {isSelected && <span className="material-icons">check_circle</span>}
                        {!isSelected && <span className="material-icons">radio_button_unchecked</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
              {filteredOptions.length === 0 && (
                <div className="empty-state">
                  <span className="material-icons">search_off</span>
                  <p>No se encontraron productos</p>
                </div>
              )}
            </div>

            {/* Panel de productos seleccionados con resultado o cantidad */}
            {selectedProducts.length > 0 && (showResultado || showCantidad) && (
              <div className="selected-products-panel">
                <h4>
                  <span className="material-icons">playlist_add_check</span>
                  Productos Seleccionados ({selectedProducts.length})
                </h4>
                <div className="selected-products-list">
                  {selectedProducts.map(sp => (
                    <div key={sp.producto.id} className="selected-product-item">
                      <div className="selected-product-name">
                        {sp.producto.nombreComercial || sp.producto.nombre}
                        {sp.producto.presentacion && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                            {sp.producto.presentacion}
                          </div>
                        )}
                      </div>
                      {showResultado && (
                        <select
                          value={sp.resultado || ''}
                          onChange={(e) => handleResultadoChange(sp.producto.id, e.target.value)}
                          className="resultado-select"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <option value="">Seleccione resultado...</option>
                          <option value="Muy Positivo">Muy Positivo</option>
                          <option value="Positivo">Positivo</option>
                          <option value="Neutral">Neutral</option>
                          <option value="Negativo">Negativo</option>
                        </select>
                      )}
                      {showCantidad && (
                        <input
                          type="number"
                          min="1"
                          value={sp.cantidad || 1}
                          onChange={(e) => handleCantidadChange(sp.producto.id, parseInt(e.target.value) || 1)}
                          className="cantidad-input"
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            padding: '0.625rem 0.875rem',
                            border: '2px solid var(--border-color)',
                            borderRadius: '8px',
                            fontSize: '0.875rem',
                            width: '100px',
                            textAlign: 'center',
                            fontWeight: 600
                          }}
                        />
                      )}
                      <button
                        className="btn-remove"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMultiSelectToggle(sp.producto);
                        }}
                      >
                        <span className="material-icons">close</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleConfirm}
              disabled={selectedProducts.length === 0}
            >
              <span className="material-icons">add</span>
              Agregar {selectedProducts.length} Producto{selectedProducts.length !== 1 ? 's' : ''}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Renderizado normal (modo original)
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content product-selector-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button type="button" className="btn-close" onClick={onClose}>
            <span className="material-icons">close</span>
          </button>
        </div>

        <div className="modal-body">
          {/* Búsqueda */}
          <div className="search-box" style={{ marginBottom: '1rem' }}>
            <span className="material-icons search-icon">search</span>
            <input
              type="text"
              placeholder="Buscar producto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
              autoFocus
            />
            {searchTerm && (
              <button
                className="search-clear"
                onClick={() => setSearchTerm('')}
              >
                <span className="material-icons">clear</span>
              </button>
            )}
          </div>

          <div className="selector-content">
            {/* Lista de opciones agrupadas */}
            <div className="options-list">
              <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>
                Seleccione un producto ({filteredOptions.length})
              </h4>
              <div className="options-scroll">
                {filteredOptions.map(([key, option]) => (
                  <div
                    key={key}
                    className={`option-item ${selectedOption === key ? 'selected' : ''}`}
                    onClick={() => handleOptionSelect(key, option)}
                  >
                    <div className="option-info">
                      <div className="option-name">{option.displayName}</div>
                      {option.productos.length > 1 && (
                        <div className="option-count">
                          {option.productos.length} presentaciones
                        </div>
                      )}
                      {option.productos[0].categoria && (
                        <div className="option-category">{option.productos[0].categoria}</div>
                      )}
                    </div>
                    {selectedOption === key && (
                      <span className="material-icons" style={{ color: 'var(--primary-color)' }}>
                        check_circle
                      </span>
                    )}
                  </div>
                ))}
                {filteredOptions.length === 0 && (
                  <div className="empty-state">
                    <span className="material-icons">search_off</span>
                    <p>No se encontraron productos</p>
                  </div>
                )}
              </div>
            </div>

            {/* Panel de selección de presentación (si hay múltiples) */}
            {selectedOptionData && selectedOptionData.productos.length > 1 && (
              <div className="presentations-panel">
                <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>
                  Seleccione presentación
                </h4>
                <div className="presentations-list">
                  {selectedOptionData.productos.map(producto => (
                    <div
                      key={producto.id}
                      className={`presentation-item ${selectedProducto?.id === producto.id ? 'selected' : ''}`}
                      onClick={() => handleProductSelect(producto)}
                    >
                      <div className="presentation-info">
                        <div className="presentation-name">
                          {producto.presentacion || 'Sin presentación'}
                        </div>
                        <div className="presentation-code">
                          Código: {producto.codigoProducto}
                        </div>
                        {producto.laboratorio && (
                          <div className="presentation-lab">
                            {producto.laboratorio}
                          </div>
                        )}
                      </div>
                      {selectedProducto?.id === producto.id && (
                        <span className="material-icons" style={{ color: 'var(--primary-color)' }}>
                          check_circle
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Panel de cantidad */}
            {selectedProducto && (
              <div className="quantity-panel">
                <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>
                  Producto seleccionado
                </h4>
                <div className="selected-product-info">
                  <div className="selected-product-name">
                    {selectedProducto.nombreComercial || selectedProducto.nombre}
                  </div>
                  {selectedProducto.presentacion && (
                    <div className="selected-product-presentation">
                      {selectedProducto.presentacion}
                    </div>
                  )}
                  <div className="selected-product-code">
                    Código: {selectedProducto.codigoProducto}
                  </div>
                </div>

                <div className="quantity-input-group" style={{ marginTop: '1rem' }}>
                  <label htmlFor="cantidad" style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', display: 'block' }}>
                    Cantidad
                  </label>
                  <input
                    id="cantidad"
                    type="number"
                    min="1"
                    value={cantidad}
                    onChange={(e) => setCantidad(parseInt(e.target.value) || 1)}
                    className="quantity-input"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleConfirm}
            disabled={!selectedProducto}
          >
            <span className="material-icons">add</span>
            Agregar Producto
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductSelectorModal;
