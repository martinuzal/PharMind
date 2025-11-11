import { useState, useEffect } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { usePage } from '../../contexts/PageContext';
import { useAuth } from '../../contexts/AuthContext';
import productosService from '../../services/productos.service';
import { agentesService, type Agente } from '../../services/agentes.service';
import type { InventarioAgente, RecargaInventarioDto, CreateInventarioDto, Producto } from '../../types/productos';
import '../crm/CRMPages.css';

const InventariosPage = () => {
  const { addNotification } = useNotifications();
  const { setToolbarContent, setToolbarCenterContent, setToolbarRightContent, clearToolbarContent } = usePage();
  const { user } = useAuth();

  // Data state
  const [inventarios, setInventarios] = useState<InventarioAgente[]>([]);
  const [inventariosFiltrados, setInventariosFiltrados] = useState<InventarioAgente[]>([]);
  const [loading, setLoading] = useState(true);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [agentes, setAgentes] = useState<Agente[]>([]);
  const [selectedAgenteId, setSelectedAgenteId] = useState<string>('');

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [tabActual, setTabActual] = useState<'todos' | 'stock-bajo' | 'por-vencer' | 'vencidos'>('todos');

  // Modal state
  const [showRecargaModal, setShowRecargaModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAsignarModal, setShowAsignarModal] = useState(false);
  const [selectedInventario, setSelectedInventario] = useState<InventarioAgente | null>(null);

  // Form state
  const [recargaFormData, setRecargaFormData] = useState<RecargaInventarioDto>({
    cantidad: 0,
    lote: '',
    fechaVencimiento: new Date(),
    observaciones: ''
  });

  const [asignarFormData, setAsignarFormData] = useState<CreateInventarioDto>({
    agenteId: '',
    productoId: '',
    cantidadInicial: 0,
    lote: '',
    fechaVencimiento: new Date(),
    observaciones: ''
  });

  useEffect(() => {
    // Si el usuario es un agente, cargar su inventario directamente
    if (user?.agenteId) {
      setSelectedAgenteId(user.agenteId);
      loadInventarios(user.agenteId);
    } else {
      // Si no es agente (manager, admin, etc.), cargar lista de agentes
      loadAgentes();
    }
  }, [user]);

  useEffect(() => {
    // Cargar inventarios cuando cambia el agente seleccionado
    if (selectedAgenteId) {
      loadInventarios(selectedAgenteId);
    }
  }, [selectedAgenteId]);

  useEffect(() => {
    aplicarFiltros();
  }, [inventarios, tabActual, searchTerm]);

  const loadAgentes = async () => {
    try {
      const response = await agentesService.getAll({ pageSize: 1000 });
      setAgentes(response.items.filter(a => a.activo));

      // Seleccionar primer agente por defecto si hay agentes
      if (response.items.length > 0) {
        setSelectedAgenteId(response.items[0].id);
      }
    } catch (error) {
      addNotification({
        title: 'Error',
        message: 'No se pudieron cargar los agentes',
        type: 'error',
        category: 'inventarios'
      });
    }
  };

  // Configurar toolbar
  useEffect(() => {
    const toolbarLeft = (
      <>
        <div className="entity-icon" style={{
          backgroundColor: '#06B6D4',
          padding: '0.375rem',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: '0.75rem',
          width: '32px',
          height: '32px'
        }}>
          <span className="material-icons" style={{ color: 'white', fontSize: '1.125rem' }}>inventory_2</span>
        </div>
        <span style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          {user?.agenteId ? 'Mi Inventario' : 'Inventarios de Agentes'}
        </span>
      </>
    );

    const toolbarCenter = (
      <div className="search-box">
        <span className="material-icons search-icon">search</span>
        <input
          type="text"
          placeholder="Buscar en inventario..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>
    );

    const toolbarRight = (
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          className="toolbar-icon-btn"
          onClick={handleOpenAsignarModal}
          title="Asignar Producto"
          style={{
            backgroundColor: '#10B981',
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
        <button
          className="toolbar-icon-btn"
          onClick={loadInventarios}
          title="Recargar"
          style={{
            backgroundColor: '#06B6D4',
            color: 'white',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <span className="material-icons">refresh</span>
        </button>
      </div>
    );

    setToolbarContent(toolbarLeft);
    setToolbarCenterContent(toolbarCenter);
    setToolbarRightContent(toolbarRight);

    return () => {
      clearToolbarContent();
    };
  }, [searchTerm, user, agentes, selectedAgenteId]);

  const loadInventarios = async (agenteId?: string) => {
    const targetAgenteId = agenteId || selectedAgenteId;

    if (!targetAgenteId) {
      setInventarios([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await productosService.getInventarioAgente(targetAgenteId);
      setInventarios(data);
    } catch (error: any) {
      addNotification({
        title: 'Error',
        message: 'No se pudo cargar el inventario',
        type: 'error',
        category: 'inventarios'
      });
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = () => {
    let filtered = [...inventarios];

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(inv =>
        inv.producto?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.producto?.codigoProducto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.loteActual?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por tab
    switch (tabActual) {
      case 'stock-bajo':
        filtered = filtered.filter(inv => inv.stockBajo && !inv.estaVencido);
        break;
      case 'por-vencer':
        filtered = filtered.filter(inv => inv.estaPorVencer && !inv.estaVencido);
        break;
      case 'vencidos':
        filtered = filtered.filter(inv => inv.estaVencido);
        break;
      default:
        // 'todos' - no filtrar
        break;
    }

    setInventariosFiltrados(filtered);
  };

  const contarPorCategoria = () => {
    return {
      todos: inventarios.length,
      stockBajo: inventarios.filter(inv => inv.stockBajo && !inv.estaVencido).length,
      porVencer: inventarios.filter(inv => inv.estaPorVencer && !inv.estaVencido).length,
      vencidos: inventarios.filter(inv => inv.estaVencido).length
    };
  };

  const handleOpenRecargaModal = (inventario: InventarioAgente) => {
    setSelectedInventario(inventario);
    setRecargaFormData({
      cantidad: 0,
      lote: '',
      fechaVencimiento: new Date(),
      observaciones: ''
    });
    setShowRecargaModal(true);
  };

  const handleCloseRecargaModal = () => {
    setShowRecargaModal(false);
    setSelectedInventario(null);
  };

  const handleViewDetail = (inventario: InventarioAgente) => {
    setSelectedInventario(inventario);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedInventario(null);
  };

  const handleOpenAsignarModal = async () => {
    if (!selectedAgenteId) return;

    try {
      // Cargar productos disponibles
      const productosData = await productosService.getAll();
      setProductos(productosData);

      // Resetear formulario con el agente seleccionado
      setAsignarFormData({
        agenteId: selectedAgenteId,
        productoId: '',
        cantidadInicial: 0,
        lote: '',
        fechaVencimiento: new Date(),
        observaciones: ''
      });

      setShowAsignarModal(true);
    } catch (error) {
      addNotification({
        title: 'Error',
        message: 'No se pudieron cargar los productos',
        type: 'error',
        category: 'inventarios'
      });
    }
  };

  const handleCloseAsignarModal = () => {
    setShowAsignarModal(false);
  };

  const handleAsignarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgenteId) return;

    try {
      await productosService.crearInventario(asignarFormData);
      addNotification({
        title: 'Éxito',
        message: 'Producto asignado al inventario correctamente',
        type: 'success',
        category: 'inventarios'
      });
      handleCloseAsignarModal();
      loadInventarios();
    } catch (error: any) {
      addNotification({
        title: 'Error',
        message: error.response?.data?.error || 'Error al asignar el producto',
        type: 'error',
        category: 'inventarios'
      });
    }
  };

  const handleRecargaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInventario) return;

    try {
      await productosService.recargarInventario(selectedInventario.id, recargaFormData);
      addNotification({
        title: 'Éxito',
        message: 'Recarga de inventario registrada correctamente',
        type: 'success',
        category: 'inventarios'
      });
      handleCloseRecargaModal();
      loadInventarios();
    } catch (error: any) {
      addNotification({
        title: 'Error',
        message: error.response?.data?.message || 'Error al registrar la recarga',
        type: 'error',
        category: 'inventarios'
      });
    }
  };

  const getPorcentajeStock = (inventario: InventarioAgente): number => {
    if (!inventario.cantidadInicial || inventario.cantidadInicial === 0) return 0;
    return Math.round((inventario.cantidadDisponible / inventario.cantidadInicial) * 100);
  };

  const getEstadoColor = (inventario: InventarioAgente): string => {
    if (inventario.estaVencido) return '#EF4444'; // Rojo
    if (inventario.estaPorVencer) return '#F59E0B'; // Naranja
    if (inventario.stockBajo) return '#F59E0B'; // Naranja
    return '#10B981'; // Verde
  };

  const getEstadoTexto = (inventario: InventarioAgente): string => {
    if (inventario.estaVencido) return 'Vencido';
    if (inventario.estaPorVencer) return 'Por Vencer';
    if (inventario.stockBajo) return 'Stock Bajo';
    return 'OK';
  };

  const contadores = contarPorCategoria();

  if (loading) {
    return <div className="page-container">Cargando...</div>;
  }

  return (
    <div className="page-container">
      {/* Selector de Agente - Solo para usuarios que NO son agentes */}
      {!user?.agenteId && agentes.length > 0 && (
        <div style={{
          marginBottom: '1rem',
          padding: '1rem',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '8px',
          border: '1px solid var(--border-color)'
        }}>
          <label style={{
            display: 'block',
            fontWeight: 600,
            marginBottom: '0.5rem',
            color: 'var(--text-primary)'
          }}>
            Seleccionar Agente:
          </label>
          <select
            className="form-control"
            value={selectedAgenteId}
            onChange={(e) => setSelectedAgenteId(e.target.value)}
            style={{ maxWidth: '400px' }}
          >
            {agentes.map(agente => (
              <option key={agente.id} value={agente.id}>
                {agente.nombre} {agente.apellido || ''} - {agente.codigoAgente}
                {agente.regionNombre && ` (${agente.regionNombre})`}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1rem',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '0'
      }}>
        <button
          onClick={() => setTabActual('todos')}
          style={{
            padding: '0.75rem 1.5rem',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            fontWeight: tabActual === 'todos' ? 600 : 400,
            color: tabActual === 'todos' ? 'var(--accent-color)' : 'var(--text-secondary)',
            borderBottom: tabActual === 'todos' ? '2px solid var(--accent-color)' : '2px solid transparent',
            transition: 'all 0.2s'
          }}
        >
          Todos ({contadores.todos})
        </button>
        <button
          onClick={() => setTabActual('stock-bajo')}
          style={{
            padding: '0.75rem 1.5rem',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            fontWeight: tabActual === 'stock-bajo' ? 600 : 400,
            color: tabActual === 'stock-bajo' ? 'var(--accent-color)' : 'var(--text-secondary)',
            borderBottom: tabActual === 'stock-bajo' ? '2px solid var(--accent-color)' : '2px solid transparent',
            transition: 'all 0.2s'
          }}
        >
          Stock Bajo ({contadores.stockBajo})
        </button>
        <button
          onClick={() => setTabActual('por-vencer')}
          style={{
            padding: '0.75rem 1.5rem',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            fontWeight: tabActual === 'por-vencer' ? 600 : 400,
            color: tabActual === 'por-vencer' ? 'var(--accent-color)' : 'var(--text-secondary)',
            borderBottom: tabActual === 'por-vencer' ? '2px solid var(--accent-color)' : '2px solid transparent',
            transition: 'all 0.2s'
          }}
        >
          Por Vencer ({contadores.porVencer})
        </button>
        <button
          onClick={() => setTabActual('vencidos')}
          style={{
            padding: '0.75rem 1.5rem',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            fontWeight: tabActual === 'vencidos' ? 600 : 400,
            color: tabActual === 'vencidos' ? 'var(--accent-color)' : 'var(--text-secondary)',
            borderBottom: tabActual === 'vencidos' ? '2px solid var(--accent-color)' : '2px solid transparent',
            transition: 'all 0.2s'
          }}
        >
          Vencidos ({contadores.vencidos})
        </button>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Lote</th>
              <th style={{ textAlign: 'center' }}>Stock</th>
              <th style={{ textAlign: 'center' }}>Disponible</th>
              <th style={{ textAlign: 'center' }}>Entregado</th>
              <th>Vencimiento</th>
              <th>Estado</th>
              <th style={{ textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {inventariosFiltrados.map(inventario => {
              const porcentaje = getPorcentajeStock(inventario);
              const estadoColor = getEstadoColor(inventario);

              return (
                <tr key={inventario.id}>
                  <td>
                    <div>
                      <div style={{ fontWeight: 500 }}>{inventario.producto?.nombre || 'N/A'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {inventario.producto?.codigoProducto}
                      </div>
                    </div>
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                    {inventario.loteActual || '-'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'center' }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                        {porcentaje}%
                      </div>
                      <div style={{
                        width: '100%',
                        height: '6px',
                        backgroundColor: 'var(--bg-primary)',
                        borderRadius: '3px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${porcentaje}%`,
                          height: '100%',
                          backgroundColor: estadoColor,
                          transition: 'width 0.3s'
                        }} />
                      </div>
                    </div>
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: 500 }}>
                    {inventario.cantidadDisponible}
                  </td>
                  <td style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                    {inventario.cantidadEntregada}
                  </td>
                  <td style={{ fontSize: '0.875rem' }}>
                    {inventario.fechaVencimiento
                      ? new Date(inventario.fechaVencimiento).toLocaleDateString('es-AR')
                      : '-'}
                    {inventario.diasParaVencer !== null && inventario.diasParaVencer !== undefined && (
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                        {inventario.diasParaVencer > 0
                          ? `${inventario.diasParaVencer} días`
                          : 'Vencido'}
                      </div>
                    )}
                  </td>
                  <td>
                    <span
                      className="badge-info"
                      style={{
                        backgroundColor: `${estadoColor}20`,
                        color: estadoColor,
                        borderColor: estadoColor
                      }}
                    >
                      {getEstadoTexto(inventario)}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-icon-view"
                        onClick={() => handleViewDetail(inventario)}
                        title="Ver detalles"
                      >
                        <span className="material-icons">visibility</span>
                      </button>
                      <button
                        className="btn-icon-edit"
                        onClick={() => handleOpenRecargaModal(inventario)}
                        title="Registrar recarga"
                        style={{ backgroundColor: '#D1FAE5', color: '#065F46' }}
                      >
                        <span className="material-icons">add_box</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {inventariosFiltrados.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
            No se encontraron items en el inventario
          </div>
        )}
      </div>

      {/* Modal Recarga */}
      {showRecargaModal && selectedInventario && (
        <div className="modal-overlay" onClick={handleCloseRecargaModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2>Registrar Recarga de Inventario</h2>
              <button className="modal-close" onClick={handleCloseRecargaModal}>
                <span className="material-icons">close</span>
              </button>
            </div>
            <form onSubmit={handleRecargaSubmit}>
              <div className="modal-body">
                <div style={{
                  padding: '0.75rem',
                  backgroundColor: 'var(--bg-primary)',
                  borderRadius: '6px',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                    {selectedInventario.producto?.nombre}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {selectedInventario.producto?.codigoProducto}
                  </div>
                </div>

                <div className="form-group">
                  <label>Cantidad a Recargar *</label>
                  <input
                    type="number"
                    className="form-control"
                    min="1"
                    value={recargaFormData.cantidad}
                    onChange={(e) => setRecargaFormData({ ...recargaFormData, cantidad: parseInt(e.target.value) || 0 })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Número de Lote *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={recargaFormData.lote}
                    onChange={(e) => setRecargaFormData({ ...recargaFormData, lote: e.target.value })}
                    required
                    maxLength={50}
                  />
                </div>

                <div className="form-group">
                  <label>Fecha de Vencimiento *</label>
                  <input
                    type="date"
                    className="form-control"
                    value={recargaFormData.fechaVencimiento.toISOString().split('T')[0]}
                    onChange={(e) => setRecargaFormData({ ...recargaFormData, fechaVencimiento: new Date(e.target.value) })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Observaciones</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={recargaFormData.observaciones}
                    onChange={(e) => setRecargaFormData({ ...recargaFormData, observaciones: e.target.value })}
                    maxLength={500}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={handleCloseRecargaModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Registrar Recarga
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detalle */}
      {showDetailModal && selectedInventario && (
        <div className="modal-overlay" onClick={handleCloseDetailModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
            <div className="modal-header">
              <h2>Detalle del Inventario</h2>
              <button className="modal-close" onClick={handleCloseDetailModal}>
                <span className="material-icons">close</span>
              </button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '0.75rem', fontSize: '0.9rem' }}>
                <div style={{ fontWeight: 600 }}>Producto:</div>
                <div>
                  <div style={{ fontWeight: 500 }}>{selectedInventario.producto?.nombre}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {selectedInventario.producto?.codigoProducto}
                  </div>
                </div>

                <div style={{ fontWeight: 600 }}>Lote Actual:</div>
                <div style={{ fontFamily: 'monospace' }}>{selectedInventario.loteActual || '-'}</div>

                <div style={{ fontWeight: 600 }}>Cantidad Inicial:</div>
                <div>{selectedInventario.cantidadInicial || '-'}</div>

                <div style={{ fontWeight: 600 }}>Disponible:</div>
                <div style={{ fontWeight: 600, color: '#10B981' }}>{selectedInventario.cantidadDisponible}</div>

                <div style={{ fontWeight: 600 }}>Entregado:</div>
                <div>{selectedInventario.cantidadEntregada}</div>

                <div style={{ fontWeight: 600 }}>Consumido:</div>
                <div>
                  {(selectedInventario.cantidadInicial || 0) - selectedInventario.cantidadDisponible - selectedInventario.cantidadEntregada}
                </div>

                <div style={{ fontWeight: 600 }}>Última Recarga:</div>
                <div>
                  {selectedInventario.fechaUltimaRecarga
                    ? new Date(selectedInventario.fechaUltimaRecarga).toLocaleDateString('es-AR')
                    : '-'}
                </div>

                <div style={{ fontWeight: 600 }}>Vencimiento:</div>
                <div>
                  {selectedInventario.fechaVencimiento
                    ? new Date(selectedInventario.fechaVencimiento).toLocaleDateString('es-AR')
                    : '-'}
                  {selectedInventario.diasParaVencer !== null && selectedInventario.diasParaVencer !== undefined && (
                    <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      ({selectedInventario.diasParaVencer > 0 ? `${selectedInventario.diasParaVencer} días` : 'Vencido'})
                    </span>
                  )}
                </div>

                <div style={{ fontWeight: 600 }}>Estado:</div>
                <div>
                  <span
                    className="badge-info"
                    style={{
                      backgroundColor: `${getEstadoColor(selectedInventario)}20`,
                      color: getEstadoColor(selectedInventario),
                      borderColor: getEstadoColor(selectedInventario)
                    }}
                  >
                    {getEstadoTexto(selectedInventario)}
                  </span>
                </div>
              </div>

              {selectedInventario.observaciones && (
                <div style={{ marginTop: '1.5rem' }}>
                  <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Observaciones:</div>
                  <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-primary)', borderRadius: '6px', fontSize: '0.875rem' }}>
                    {selectedInventario.observaciones}
                  </div>
                </div>
              )}

              {/* Progress bar */}
              <div style={{ marginTop: '1.5rem' }}>
                <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Nivel de Stock:</div>
                <div style={{
                  width: '100%',
                  height: '20px',
                  backgroundColor: 'var(--bg-primary)',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  <div style={{
                    width: `${getPorcentajeStock(selectedInventario)}%`,
                    height: '100%',
                    backgroundColor: getEstadoColor(selectedInventario),
                    transition: 'width 0.3s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '0.75rem',
                    fontWeight: 600
                  }}>
                    {getPorcentajeStock(selectedInventario)}%
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={handleCloseDetailModal}>
                Cerrar
              </button>
              <button className="btn-primary" onClick={() => {
                handleCloseDetailModal();
                handleOpenRecargaModal(selectedInventario);
              }}>
                Registrar Recarga
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Asignar Producto */}
      {showAsignarModal && (
        <div className="modal-overlay" onClick={handleCloseAsignarModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2>Asignar Producto al Inventario</h2>
              <button className="modal-close" onClick={handleCloseAsignarModal}>
                <span className="material-icons">close</span>
              </button>
            </div>
            <form onSubmit={handleAsignarSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Producto *</label>
                  <select
                    className="form-control"
                    value={asignarFormData.productoId}
                    onChange={(e) => setAsignarFormData({ ...asignarFormData, productoId: e.target.value })}
                    required
                  >
                    <option value="">Seleccione un producto</option>
                    {productos
                      .filter(p => p.activo && !inventarios.some(inv => inv.productoId === p.id))
                      .map(producto => (
                        <option key={producto.id} value={producto.id}>
                          {producto.nombre} - {producto.presentacion || 'N/A'}
                          {producto.esMuestra && ' (Muestra)'}
                        </option>
                      ))}
                  </select>
                  <small style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>
                    Solo se muestran productos activos que no están ya en su inventario
                  </small>
                </div>

                <div className="form-group">
                  <label>Cantidad Inicial *</label>
                  <input
                    type="number"
                    className="form-control"
                    min="1"
                    value={asignarFormData.cantidadInicial}
                    onChange={(e) => setAsignarFormData({ ...asignarFormData, cantidadInicial: parseInt(e.target.value) || 0 })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Número de Lote *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={asignarFormData.lote}
                    onChange={(e) => setAsignarFormData({ ...asignarFormData, lote: e.target.value })}
                    required
                    maxLength={50}
                  />
                </div>

                <div className="form-group">
                  <label>Fecha de Vencimiento *</label>
                  <input
                    type="date"
                    className="form-control"
                    value={asignarFormData.fechaVencimiento instanceof Date
                      ? asignarFormData.fechaVencimiento.toISOString().split('T')[0]
                      : new Date().toISOString().split('T')[0]}
                    onChange={(e) => setAsignarFormData({ ...asignarFormData, fechaVencimiento: new Date(e.target.value) })}
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="form-group">
                  <label>Observaciones</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={asignarFormData.observaciones}
                    onChange={(e) => setAsignarFormData({ ...asignarFormData, observaciones: e.target.value })}
                    maxLength={500}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={handleCloseAsignarModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Asignar Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventariosPage;
