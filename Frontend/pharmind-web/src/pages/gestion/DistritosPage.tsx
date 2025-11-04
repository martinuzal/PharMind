import { useState, useEffect } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { distritosService } from '../../services/distritos.service';
import { regionesService } from '../../services/regiones.service';
import type {
  Distrito,
  CreateDistritoDto,
  UpdateDistritoDto
} from '../../services/distritos.service';
import type { Region } from '../../services/regiones.service';
import '../crm/CRMPages.css';

const DistritosPage = () => {
  const { addNotification } = useNotifications();
  const [items, setItems] = useState<Distrito[]>([]);
  const [regiones, setRegiones] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedItem, setSelectedItem] = useState<Distrito | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 10;

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroActivo, setFiltroActivo] = useState('');
  const [filtroRegion, setFiltroRegion] = useState('');

  // Form state
  const [formData, setFormData] = useState<CreateDistritoDto>({
    regionId: '',
    codigo: '',
    nombre: '',
    descripcion: '',
    legacyCode: '',
    legajo: '',
    color: '#3B82F6',
    icono: 'location_city',
    activo: true,
    orden: undefined
  });

  useEffect(() => {
    loadRegiones();
    loadItems();
  }, [currentPage, searchTerm, filtroActivo, filtroRegion]);

  const loadRegiones = async () => {
    try {
      const response = await regionesService.getAll({ activo: true });
      setRegiones(response.items);
    } catch (error: any) {
      console.error('Error loading regiones:', error);
    }
  };

  const loadItems = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        pageSize: pageSize
      };
      if (searchTerm) params.nombre = searchTerm;
      if (filtroActivo !== '') params.activo = filtroActivo === 'true';
      if (filtroRegion) params.regionId = filtroRegion;

      const response = await distritosService.getAll(params);
      setItems(response.items);
      setTotalPages(response.totalPages);
      setTotalItems(response.totalItems);
    } catch (error: any) {
      addNotification({
        title: 'Error',
        message: 'No se pudieron cargar los distritos',
        type: 'error',
        category: 'distritos'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (mode: 'create' | 'edit', item?: Distrito) => {
    setModalMode(mode);
    if (mode === 'edit' && item) {
      setSelectedItem(item);
      setFormData({
        regionId: item.regionId,
        codigo: item.codigo,
        nombre: item.nombre,
        descripcion: item.descripcion || '',
        legacyCode: item.legacyCode || '',
        legajo: item.legajo || '',
        color: item.color || '#3B82F6',
        icono: item.icono || 'location_city',
        activo: item.activo,
        orden: item.orden
      });
    } else {
      setSelectedItem(null);
      setFormData({
        regionId: '',
        codigo: '',
        nombre: '',
        descripcion: '',
        legacyCode: '',
        legajo: '',
        color: '#3B82F6',
        icono: 'location_city',
        activo: true,
        orden: undefined
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (modalMode === 'create') {
        const createDto: CreateDistritoDto = {
          ...formData,
          descripcion: formData.descripcion || undefined,
          legacyCode: formData.legacyCode || undefined,
          legajo: formData.legajo || undefined,
          color: formData.color || undefined,
          icono: formData.icono || undefined
        };
        await distritosService.create(createDto);
        addNotification({
          title: 'Distrito creado',
          message: 'El distrito se creo correctamente',
          type: 'success',
          category: 'distritos'
        });
      } else if (selectedItem) {
        const updateDto: UpdateDistritoDto = {
          regionId: formData.regionId,
          codigo: formData.codigo,
          nombre: formData.nombre,
          descripcion: formData.descripcion || undefined,
          legacyCode: formData.legacyCode || undefined,
          legajo: formData.legajo || undefined,
          color: formData.color || undefined,
          icono: formData.icono || undefined,
          activo: formData.activo,
          orden: formData.orden
        };
        await distritosService.update(selectedItem.id, updateDto);
        addNotification({
          title: 'Distrito actualizado',
          message: 'El distrito se actualizo correctamente',
          type: 'success',
          category: 'distritos'
        });
      }
      handleCloseModal();
      loadItems();
    } catch (error: any) {
      addNotification({
        title: 'Error',
        message: error.response?.data?.message || 'No se pudo guardar el distrito',
        type: 'error',
        category: 'distritos'
      });
    }
  };

  const handleDelete = async (item: Distrito) => {
    if (!window.confirm(`Esta seguro de eliminar el distrito ${item.nombre}?`)) {
      return;
    }

    try {
      await distritosService.delete(item.id);
      addNotification({
        title: 'Distrito eliminado',
        message: 'El distrito se elimino correctamente',
        type: 'success',
        category: 'distritos'
      });
      loadItems();
    } catch (error: any) {
      addNotification({
        title: 'Error',
        message: 'No se pudo eliminar el distrito',
        type: 'error',
        category: 'distritos'
      });
    }
  };

  const getActivoBadgeClass = (activo: boolean) => {
    return activo ? 'badge badge-activo' : 'badge badge-inactivo';
  };

  if (loading && items.length === 0) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="header-content">
          <h1>
            <span className="material-icons">location_city</span>
            Distritos
          </h1>
          <p className="page-description">
            Gestion de distritos y subdivisiones territoriales
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal('create')}>
          <span className="material-icons">add</span>
          Nuevo Distrito
        </button>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-grid">
          <div className="form-group">
            <label>Buscar por nombre</label>
            <div className="search-bar">
              <span className="material-icons">search</span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="form-control"
                placeholder="Buscar distrito..."
              />
            </div>
          </div>
          <div className="form-group">
            <label>Region</label>
            <select
              value={filtroRegion}
              onChange={(e) => {
                setFiltroRegion(e.target.value);
                setCurrentPage(1);
              }}
              className="form-control"
            >
              <option value="">Todas</option>
              {regiones.map(region => (
                <option key={region.id} value={region.id}>
                  {region.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Estado</label>
            <select
              value={filtroActivo}
              onChange={(e) => {
                setFiltroActivo(e.target.value);
                setCurrentPage(1);
              }}
              className="form-control"
            >
              <option value="">Todos</option>
              <option value="true">Activo</option>
              <option value="false">Inactivo</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Codigo</th>
              <th>Nombre</th>
              <th>Region</th>
              <th>Descripcion</th>
              <th>Color</th>
              <th>Icono</th>
              <th>Agentes</th>
              <th>Orden</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={10} className="no-data">
                  <span className="material-icons">inbox</span>
                  <p>No hay distritos para mostrar</p>
                </td>
              </tr>
            ) : (
              items.map(item => (
                <tr key={item.id}>
                  <td><strong>{item.codigo}</strong></td>
                  <td>{item.nombre}</td>
                  <td>{item.regionNombre}</td>
                  <td>{item.descripcion || '-'}</td>
                  <td>
                    {item.color ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '4px',
                          backgroundColor: item.color,
                          border: '1px solid #ddd'
                        }}></div>
                        <span style={{ fontSize: '0.75rem', color: '#666' }}>{item.color}</span>
                      </div>
                    ) : '-'}
                  </td>
                  <td>
                    {item.icono ? (
                      <span className="material-icons" style={{ color: item.color || '#666' }}>
                        {item.icono}
                      </span>
                    ) : '-'}
                  </td>
                  <td>{item.cantidadAgentes}</td>
                  <td>{item.orden || '-'}</td>
                  <td>
                    <span className={getActivoBadgeClass(item.activo)}>
                      {item.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-icon btn-icon-edit"
                        onClick={() => handleOpenModal('edit', item)}
                        title="Editar"
                      >
                        <span className="material-icons">edit</span>
                      </button>
                      <button
                        className="btn-icon btn-icon-delete"
                        onClick={() => handleDelete(item)}
                        title="Eliminar"
                      >
                        <span className="material-icons">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <span className="material-icons">chevron_left</span>
            Anterior
          </button>
          <span className="pagination-info">
            Pagina {currentPage} de {totalPages} ({totalItems} registros)
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Siguiente
            <span className="material-icons">chevron_right</span>
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {modalMode === 'create' ? 'Nuevo Distrito' : 'Editar Distrito'}
              </h2>
              <button className="btn-close" onClick={handleCloseModal}>
                <span className="material-icons">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Region *</label>
                    <select
                      value={formData.regionId}
                      onChange={(e) => setFormData({ ...formData, regionId: e.target.value })}
                      className="form-control"
                      required
                    >
                      <option value="">Seleccionar region</option>
                      {regiones.map(region => (
                        <option key={region.id} value={region.id}>
                          {region.nombre} ({region.codigo})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Codigo *</label>
                    <input
                      type="text"
                      value={formData.codigo}
                      onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                      className="form-control"
                      required
                      disabled={modalMode === 'edit'}
                    />
                  </div>

                  <div className="form-group">
                    <label>Nombre *</label>
                    <input
                      type="text"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      className="form-control"
                      required
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>Descripcion</label>
                    <textarea
                      value={formData.descripcion}
                      onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                      className="form-control"
                      rows={2}
                    />
                  </div>

                  <div className="form-group">
                    <label>Color</label>
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label>Icono (Material Icons)</label>
                    <input
                      type="text"
                      value={formData.icono}
                      onChange={(e) => setFormData({ ...formData, icono: e.target.value })}
                      className="form-control"
                      placeholder="location_city, place, apartment"
                    />
                  </div>

                  <div className="form-group">
                    <label>Legacy Code</label>
                    <input
                      type="text"
                      value={formData.legacyCode}
                      onChange={(e) => setFormData({ ...formData, legacyCode: e.target.value })}
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label>Legajo</label>
                    <input
                      type="text"
                      value={formData.legajo}
                      onChange={(e) => setFormData({ ...formData, legajo: e.target.value })}
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label>Orden</label>
                    <input
                      type="number"
                      value={formData.orden || ''}
                      onChange={(e) => setFormData({ ...formData, orden: e.target.value ? parseInt(e.target.value) : undefined })}
                      className="form-control"
                      min="0"
                    />
                  </div>

                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.activo}
                        onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                      />
                      <span>Activo</span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {modalMode === 'create' ? 'Crear' : 'Actualizar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DistritosPage;
