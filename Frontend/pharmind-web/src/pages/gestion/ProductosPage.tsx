import { useState, useEffect } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { usePage } from '../../contexts/PageContext';
import productosService from '../../services/productos.service';
import type { Producto, CreateProductoDto, UpdateProductoDto } from '../../types/productos';
import '../crm/CRMPages.css';

const ProductosPage = () => {
  const { addNotification } = useNotifications();
  const { setToolbarContent, setToolbarCenterContent, setToolbarRightContent, clearToolbarContent } = usePage();

  // Data state
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState('');
  const [categorias, setCategorias] = useState<string[]>([]);
  const [soloMuestras, setSoloMuestras] = useState(false);
  const [soloActivos, setSoloActivos] = useState(true);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null);

  // Form state
  const [formData, setFormData] = useState<CreateProductoDto>({
    codigoProducto: '',
    nombre: '',
    nombreComercial: '',
    descripcion: '',
    presentacion: '',
    categoria: '',
    laboratorio: '',
    principioActivo: '',
    concentracion: '',
    viaAdministracion: '',
    indicaciones: '',
    contraindicaciones: '',
    precioReferencia: undefined,
    imagenUrl: '',
    activo: true,
    esMuestra: false,
    requiereReceta: false
  });

  useEffect(() => {
    loadProductos();
    loadCategorias();
  }, []);

  // Configurar toolbar
  useEffect(() => {
    const toolbarLeft = (
      <>
        <div className="entity-icon" style={{
          backgroundColor: '#6366F1',
          padding: '0.375rem',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: '0.75rem',
          width: '32px',
          height: '32px'
        }}>
          <span className="material-icons" style={{ color: 'white', fontSize: '1.125rem' }}>shopping_cart</span>
        </div>
        <span style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>Catálogo de Productos</span>
      </>
    );

    const toolbarCenter = (
      <div className="search-box">
        <span className="material-icons search-icon">search</span>
        <input
          type="text"
          placeholder="Buscar producto..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>
    );

    const toolbarRight = (
      <button
        className="toolbar-icon-btn"
        onClick={() => handleOpenModal('create')}
        title="Nuevo Producto"
        style={{
          backgroundColor: '#6366F1',
          color: 'white',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <span className="material-icons">add</span>
      </button>
    );

    setToolbarContent(toolbarLeft);
    setToolbarCenterContent(toolbarCenter);
    setToolbarRightContent(toolbarRight);

    return () => {
      clearToolbarContent();
    };
  }, [searchTerm]);

  const loadProductos = async () => {
    try {
      setLoading(true);
      const data = await productosService.getAll();
      setProductos(data);
    } catch (error: any) {
      addNotification({
        title: 'Error',
        message: 'No se pudieron cargar los productos',
        type: 'error',
        category: 'productos'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCategorias = async () => {
    try {
      const data = await productosService.getCategorias();
      setCategorias(data);
    } catch (error) {
      console.error('Error cargando categorías:', error);
    }
  };

  const handleOpenModal = (mode: 'create' | 'edit', producto?: Producto) => {
    setModalMode(mode);
    if (mode === 'edit' && producto) {
      setSelectedProducto(producto);
      setFormData({
        codigoProducto: producto.codigoProducto,
        nombre: producto.nombre,
        nombreComercial: producto.nombreComercial || '',
        descripcion: producto.descripcion || '',
        presentacion: producto.presentacion || '',
        categoria: producto.categoria || '',
        laboratorio: producto.laboratorio || '',
        principioActivo: producto.principioActivo || '',
        concentracion: producto.concentracion || '',
        viaAdministracion: producto.viaAdministracion || '',
        indicaciones: producto.indicaciones || '',
        contraindicaciones: producto.contraindicaciones || '',
        precioReferencia: producto.precioReferencia,
        imagenUrl: producto.imagenUrl || '',
        activo: producto.activo,
        esMuestra: producto.esMuestra,
        requiereReceta: producto.requiereReceta
      });
    } else {
      setSelectedProducto(null);
      setFormData({
        codigoProducto: '',
        nombre: '',
        nombreComercial: '',
        descripcion: '',
        presentacion: '',
        categoria: '',
        laboratorio: '',
        principioActivo: '',
        concentracion: '',
        viaAdministracion: '',
        indicaciones: '',
        contraindicaciones: '',
        precioReferencia: undefined,
        imagenUrl: '',
        activo: true,
        esMuestra: false,
        requiereReceta: false
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedProducto(null);
  };

  const handleViewDetail = (producto: Producto) => {
    setSelectedProducto(producto);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedProducto(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (modalMode === 'create') {
        await productosService.create(formData);
        addNotification({
          title: 'Éxito',
          message: 'Producto creado correctamente',
          type: 'success',
          category: 'productos'
        });
      } else if (selectedProducto) {
        const updateDto: UpdateProductoDto = {
          nombre: formData.nombre,
          nombreComercial: formData.nombreComercial,
          descripcion: formData.descripcion,
          presentacion: formData.presentacion,
          categoria: formData.categoria,
          precioReferencia: formData.precioReferencia,
          imagenUrl: formData.imagenUrl,
          activo: formData.activo
        };
        await productosService.update(selectedProducto.id, updateDto);
        addNotification({
          title: 'Éxito',
          message: 'Producto actualizado correctamente',
          type: 'success',
          category: 'productos'
        });
      }
      handleCloseModal();
      loadProductos();
    } catch (error: any) {
      addNotification({
        title: 'Error',
        message: error.response?.data?.message || 'Error al guardar el producto',
        type: 'error',
        category: 'productos'
      });
    }
  };

  // Filtrar productos
  const productosFiltrados = productos.filter(producto => {
    const matchesSearch = !searchTerm ||
      producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      producto.codigoProducto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (producto.nombreComercial && producto.nombreComercial.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (producto.principioActivo && producto.principioActivo.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategoria = !categoriaFilter || producto.categoria === categoriaFilter;
    const matchesMuestras = !soloMuestras || producto.esMuestra;
    const matchesActivos = !soloActivos || producto.activo;

    return matchesSearch && matchesCategoria && matchesMuestras && matchesActivos;
  });

  if (loading) {
    return <div className="page-container">Cargando...</div>;
  }

  return (
    <div className="page-container">
      {/* Filters */}
      <div className="filters-bar" style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <select
          value={categoriaFilter}
          onChange={(e) => setCategoriaFilter(e.target.value)}
          className="form-control"
          style={{ width: '200px' }}
        >
          <option value="">Todas las categorías</option>
          {categorias.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={soloMuestras}
            onChange={(e) => setSoloMuestras(e.target.checked)}
          />
          <span>Solo Muestras Médicas</span>
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={soloActivos}
            onChange={(e) => setSoloActivos(e.target.checked)}
          />
          <span>Solo Activos</span>
        </label>

        <div style={{ marginLeft: 'auto', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          {productosFiltrados.length} producto{productosFiltrados.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Presentación</th>
              <th>Laboratorio</th>
              <th>Precio Ref.</th>
              <th>Estado</th>
              <th style={{ textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productosFiltrados.map(producto => (
              <tr key={producto.id}>
                <td style={{ fontFamily: 'monospace', fontWeight: 500 }}>
                  {producto.codigoProducto}
                </td>
                <td>
                  <div>
                    <div style={{ fontWeight: 500 }}>{producto.nombre}</div>
                    {producto.nombreComercial && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {producto.nombreComercial}
                      </div>
                    )}
                  </div>
                </td>
                <td>
                  <span className="badge-info" style={{ fontSize: '0.75rem' }}>
                    {producto.categoria || 'Sin categoría'}
                  </span>
                </td>
                <td style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  {producto.presentacion || '-'}
                </td>
                <td style={{ fontSize: '0.875rem' }}>
                  {producto.laboratorio || '-'}
                </td>
                <td style={{ textAlign: 'right', fontWeight: 500 }}>
                  {producto.precioReferencia
                    ? `$${producto.precioReferencia.toFixed(2)}`
                    : '-'}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                    <span className={producto.activo ? 'badge-success' : 'badge-error'}>
                      {producto.activo ? 'Activo' : 'Inactivo'}
                    </span>
                    {producto.esMuestra && (
                      <span className="badge-info" style={{ fontSize: '0.7rem' }}>Muestra</span>
                    )}
                    {producto.requiereReceta && (
                      <span className="badge-warning" style={{ fontSize: '0.7rem' }}>Receta</span>
                    )}
                  </div>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn-icon-view"
                      onClick={() => handleViewDetail(producto)}
                      title="Ver detalles"
                    >
                      <span className="material-icons">visibility</span>
                    </button>
                    <button
                      className="btn-icon-edit"
                      onClick={() => handleOpenModal('edit', producto)}
                      title="Editar"
                    >
                      <span className="material-icons">edit</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {productosFiltrados.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
            No se encontraron productos
          </div>
        )}
      </div>

      {/* Modal Crear/Editar */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h2>{modalMode === 'create' ? 'Nuevo Producto' : 'Editar Producto'}</h2>
              <button className="modal-close" onClick={handleCloseModal}>
                <span className="material-icons">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Código del Producto *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.codigoProducto}
                      onChange={(e) => setFormData({ ...formData, codigoProducto: e.target.value })}
                      required
                      disabled={modalMode === 'edit'}
                      maxLength={50}
                    />
                  </div>

                  <div className="form-group">
                    <label>Categoría</label>
                    <select
                      className="form-control"
                      value={formData.categoria}
                      onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    >
                      <option value="">Seleccione categoría</option>
                      {categorias.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Nombre del Producto *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    required
                    maxLength={200}
                  />
                </div>

                <div className="form-group">
                  <label>Nombre Comercial</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.nombreComercial}
                    onChange={(e) => setFormData({ ...formData, nombreComercial: e.target.value })}
                    maxLength={200}
                  />
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Principio Activo</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.principioActivo}
                      onChange={(e) => setFormData({ ...formData, principioActivo: e.target.value })}
                      maxLength={500}
                    />
                  </div>

                  <div className="form-group">
                    <label>Concentración</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.concentracion}
                      onChange={(e) => setFormData({ ...formData, concentracion: e.target.value })}
                      placeholder="Ej: 500mg"
                      maxLength={100}
                    />
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Presentación</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.presentacion}
                      onChange={(e) => setFormData({ ...formData, presentacion: e.target.value })}
                      placeholder="Ej: Caja x 30 tabletas"
                      maxLength={100}
                    />
                  </div>

                  <div className="form-group">
                    <label>Vía de Administración</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.viaAdministracion}
                      onChange={(e) => setFormData({ ...formData, viaAdministracion: e.target.value })}
                      placeholder="Ej: Oral"
                      maxLength={50}
                    />
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Laboratorio</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.laboratorio}
                      onChange={(e) => setFormData({ ...formData, laboratorio: e.target.value })}
                      maxLength={200}
                    />
                  </div>

                  <div className="form-group">
                    <label>Precio de Referencia</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      value={formData.precioReferencia || ''}
                      onChange={(e) => setFormData({ ...formData, precioReferencia: e.target.value ? parseFloat(e.target.value) : undefined })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Descripción</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    maxLength={1000}
                  />
                </div>

                <div className="form-group">
                  <label>Indicaciones</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={formData.indicaciones}
                    onChange={(e) => setFormData({ ...formData, indicaciones: e.target.value })}
                    maxLength={2000}
                  />
                </div>

                <div className="form-group">
                  <label>Contraindicaciones</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={formData.contraindicaciones}
                    onChange={(e) => setFormData({ ...formData, contraindicaciones: e.target.value })}
                    maxLength={2000}
                  />
                </div>

                <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.activo}
                      onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                    />
                    <span>Activo</span>
                  </label>

                  {modalMode === 'create' && (
                    <>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={formData.esMuestra}
                          onChange={(e) => setFormData({ ...formData, esMuestra: e.target.checked })}
                        />
                        <span>Es Muestra Médica</span>
                      </label>

                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={formData.requiereReceta}
                          onChange={(e) => setFormData({ ...formData, requiereReceta: e.target.checked })}
                        />
                        <span>Requiere Receta</span>
                      </label>
                    </>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={handleCloseModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {modalMode === 'create' ? 'Crear' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detalle */}
      {showDetailModal && selectedProducto && (
        <div className="modal-overlay" onClick={handleCloseDetailModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h2>Detalle del Producto</h2>
              <button className="modal-close" onClick={handleCloseDetailModal}>
                <span className="material-icons">close</span>
              </button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '0.75rem', fontSize: '0.9rem' }}>
                <div style={{ fontWeight: 600 }}>Código:</div>
                <div style={{ fontFamily: 'monospace' }}>{selectedProducto.codigoProducto}</div>

                <div style={{ fontWeight: 600 }}>Nombre:</div>
                <div>{selectedProducto.nombre}</div>

                {selectedProducto.nombreComercial && (
                  <>
                    <div style={{ fontWeight: 600 }}>Nombre Comercial:</div>
                    <div>{selectedProducto.nombreComercial}</div>
                  </>
                )}

                <div style={{ fontWeight: 600 }}>Categoría:</div>
                <div>{selectedProducto.categoria || '-'}</div>

                {selectedProducto.principioActivo && (
                  <>
                    <div style={{ fontWeight: 600 }}>Principio Activo:</div>
                    <div>{selectedProducto.principioActivo}</div>
                  </>
                )}

                {selectedProducto.concentracion && (
                  <>
                    <div style={{ fontWeight: 600 }}>Concentración:</div>
                    <div>{selectedProducto.concentracion}</div>
                  </>
                )}

                {selectedProducto.presentacion && (
                  <>
                    <div style={{ fontWeight: 600 }}>Presentación:</div>
                    <div>{selectedProducto.presentacion}</div>
                  </>
                )}

                {selectedProducto.viaAdministracion && (
                  <>
                    <div style={{ fontWeight: 600 }}>Vía Administración:</div>
                    <div>{selectedProducto.viaAdministracion}</div>
                  </>
                )}

                {selectedProducto.laboratorio && (
                  <>
                    <div style={{ fontWeight: 600 }}>Laboratorio:</div>
                    <div>{selectedProducto.laboratorio}</div>
                  </>
                )}

                {selectedProducto.precioReferencia && (
                  <>
                    <div style={{ fontWeight: 600 }}>Precio Referencia:</div>
                    <div>${selectedProducto.precioReferencia.toFixed(2)}</div>
                  </>
                )}

                <div style={{ fontWeight: 600 }}>Estado:</div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <span className={selectedProducto.activo ? 'badge-success' : 'badge-error'}>
                    {selectedProducto.activo ? 'Activo' : 'Inactivo'}
                  </span>
                  {selectedProducto.esMuestra && <span className="badge-info">Muestra Médica</span>}
                  {selectedProducto.requiereReceta && <span className="badge-warning">Requiere Receta</span>}
                </div>
              </div>

              {selectedProducto.descripcion && (
                <div style={{ marginTop: '1.5rem' }}>
                  <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Descripción:</div>
                  <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-primary)', borderRadius: '6px', fontSize: '0.875rem' }}>
                    {selectedProducto.descripcion}
                  </div>
                </div>
              )}

              {selectedProducto.indicaciones && (
                <div style={{ marginTop: '1rem' }}>
                  <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Indicaciones:</div>
                  <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-primary)', borderRadius: '6px', fontSize: '0.875rem' }}>
                    {selectedProducto.indicaciones}
                  </div>
                </div>
              )}

              {selectedProducto.contraindicaciones && (
                <div style={{ marginTop: '1rem' }}>
                  <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: '#EF4444' }}>Contraindicaciones:</div>
                  <div style={{ padding: '0.75rem', backgroundColor: '#FEE2E2', borderRadius: '6px', fontSize: '0.875rem', color: '#991B1B' }}>
                    {selectedProducto.contraindicaciones}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={handleCloseDetailModal}>
                Cerrar
              </button>
              <button className="btn-primary" onClick={() => {
                handleCloseDetailModal();
                handleOpenModal('edit', selectedProducto);
              }}>
                Editar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductosPage;
