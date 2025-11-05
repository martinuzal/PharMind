import { useState, useEffect } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { usePage } from '../../contexts/PageContext';
import { managersService } from '../../services/managers.service';
import { regionesService } from '../../services/regiones.service';
import { distritosService } from '../../services/distritos.service';
import { lineasNegocioService } from '../../services/lineasnegocio.service';
import type {
  Manager,
  CreateManagerDto,
  UpdateManagerDto
} from '../../services/managers.service';
import type { Region } from '../../services/regiones.service';
import type { Distrito } from '../../services/distritos.service';
import type { LineaNegocio } from '../../services/lineasnegocio.service';
import '../crm/CRMPages.css';

const ManagersPage = () => {
  const { addNotification } = useNotifications();
  const { setToolbarContent, setToolbarCenterContent, setToolbarRightContent, clearToolbarContent } = usePage();
  const [items, setItems] = useState<Manager[]>([]);
  const [regiones, setRegiones] = useState<Region[]>([]);
  const [distritos, setDistritos] = useState<Distrito[]>([]);
  const [lineasNegocio, setLineasNegocio] = useState<LineaNegocio[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedItem, setSelectedItem] = useState<Manager | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 10;

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroActivo, setFiltroActivo] = useState('');
  const [filtroCargo, setFiltroCargo] = useState('');

  // Form state
  const [formData, setFormData] = useState<CreateManagerDto>({
    usuarioId: '',
    codigo: '',
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    cargo: '',
    fechaIngreso: undefined,
    legacyCode: '',
    legajo: '',
    activo: true,
    observaciones: '',
    regionIds: [],
    distritoIds: [],
    lineaNegocioIds: []
  });

  useEffect(() => {
    loadReferences();
    loadItems();
  }, [currentPage, searchTerm, filtroActivo, filtroCargo]);

  // Configurar toolbar
  useEffect(() => {
    // Izquierda: Icono + Título
    const toolbarLeft = (
      <>
        <div className="entity-icon" style={{
          backgroundColor: '#8B5CF6',
          padding: '0.375rem',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: '0.75rem',
          width: '32px',
          height: '32px'
        }}>
          <span className="material-icons" style={{ color: 'white', fontSize: '1.125rem' }}>manage_accounts</span>
        </div>
        <span style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>Managers</span>
      </>
    );

    // Centro: Búsqueda
    const toolbarCenter = (
      <div className="search-box">
        <span className="material-icons search-icon">search</span>
        <input
          type="text"
          placeholder="Buscar manager..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="search-input"
        />
      </div>
    );

    // Derecha: Botón de agregar
    const toolbarRight = (
      <button
        className="toolbar-icon-btn"
        onClick={() => handleOpenModal('create')}
        title="Nuevo Manager"
        style={{
          backgroundColor: '#8B5CF6',
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

  const loadReferences = async () => {
    try {
      const [regionesRes, distritosRes, lineasRes] = await Promise.all([
        regionesService.getAll({ activo: true }),
        distritosService.getAll({ activo: true }),
        lineasNegocioService.getAll({ activo: true })
      ]);
      setRegiones(regionesRes.items);
      setDistritos(distritosRes.items);
      setLineasNegocio(lineasRes.items);
    } catch (error: any) {
      console.error('Error loading references:', error);
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
      if (filtroCargo) params.cargo = filtroCargo;

      const response = await managersService.getAll(params);
      setItems(response.items);
      setTotalPages(response.totalPages);
      setTotalItems(response.totalItems);
    } catch (error: any) {
      addNotification({
        title: 'Error',
        message: 'No se pudieron cargar los managers',
        type: 'error',
        category: 'managers'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (mode: 'create' | 'edit', item?: Manager) => {
    setModalMode(mode);
    if (mode === 'edit' && item) {
      setSelectedItem(item);
      setFormData({
        usuarioId: item.usuarioId,
        codigo: item.codigo,
        nombre: item.nombre,
        apellido: item.apellido || '',
        email: item.email || '',
        telefono: item.telefono || '',
        cargo: item.cargo || '',
        fechaIngreso: item.fechaIngreso ? new Date(item.fechaIngreso) : undefined,
        legacyCode: item.legacyCode || '',
        legajo: item.legajo || '',
        activo: item.activo,
        observaciones: item.observaciones || '',
        regionIds: item.regionIds || [],
        distritoIds: item.distritoIds || [],
        lineaNegocioIds: item.lineaNegocioIds || []
      });
    } else {
      setSelectedItem(null);
      setFormData({
        usuarioId: '',
        codigo: '',
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        cargo: '',
        fechaIngreso: undefined,
        legacyCode: '',
        legajo: '',
        activo: true,
        observaciones: '',
        regionIds: [],
        distritoIds: [],
        lineaNegocioIds: []
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
        const createDto: CreateManagerDto = {
          ...formData,
          apellido: formData.apellido || undefined,
          email: formData.email || undefined,
          telefono: formData.telefono || undefined,
          cargo: formData.cargo || undefined,
          legacyCode: formData.legacyCode || undefined,
          legajo: formData.legajo || undefined,
          observaciones: formData.observaciones || undefined
        };
        await managersService.create(createDto);
        addNotification({
          title: 'Manager creado',
          message: 'El manager se creo correctamente',
          type: 'success',
          category: 'managers'
        });
      } else if (selectedItem) {
        const updateDto: UpdateManagerDto = {
          codigo: formData.codigo,
          nombre: formData.nombre,
          apellido: formData.apellido || undefined,
          email: formData.email || undefined,
          telefono: formData.telefono || undefined,
          cargo: formData.cargo || undefined,
          fechaIngreso: formData.fechaIngreso,
          legacyCode: formData.legacyCode || undefined,
          legajo: formData.legajo || undefined,
          activo: formData.activo,
          observaciones: formData.observaciones || undefined,
          regionIds: formData.regionIds,
          distritoIds: formData.distritoIds,
          lineaNegocioIds: formData.lineaNegocioIds
        };
        await managersService.update(selectedItem.id, updateDto);
        addNotification({
          title: 'Manager actualizado',
          message: 'El manager se actualizo correctamente',
          type: 'success',
          category: 'managers'
        });
      }
      handleCloseModal();
      loadItems();
    } catch (error: any) {
      addNotification({
        title: 'Error',
        message: error.response?.data?.message || 'No se pudo guardar el manager',
        type: 'error',
        category: 'managers'
      });
    }
  };

  const handleDelete = async (item: Manager) => {
    if (!window.confirm(`Esta seguro de eliminar al manager ${item.nombre} ${item.apellido || ''}?`)) {
      return;
    }

    try {
      await managersService.delete(item.id);
      addNotification({
        title: 'Manager eliminado',
        message: 'El manager se elimino correctamente',
        type: 'success',
        category: 'managers'
      });
      loadItems();
    } catch (error: any) {
      addNotification({
        title: 'Error',
        message: 'No se pudo eliminar el manager',
        type: 'error',
        category: 'managers'
      });
    }
  };

  const toggleSelection = (id: string, type: 'regionIds' | 'distritoIds' | 'lineaNegocioIds') => {
    const currentIds = formData[type] || [];
    const newIds = currentIds.includes(id)
      ? currentIds.filter(itemId => itemId !== id)
      : [...currentIds, id];
    setFormData({ ...formData, [type]: newIds });
  };

  const getActivoBadgeClass = (activo: boolean) => {
    return activo ? 'badge badge-activo' : 'badge badge-inactivo';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
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
      {/* Filters */}
      <div className="filters-section">
        <div className="filters-grid">
          <div className="form-group">
            <label>Cargo</label>
            <input
              type="text"
              value={filtroCargo}
              onChange={(e) => {
                setFiltroCargo(e.target.value);
                setCurrentPage(1);
              }}
              className="form-control"
              placeholder="Gerente, Supervisor, etc."
            />
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
              <th>Email</th>
              <th>Cargo</th>
              <th>Regiones</th>
              <th>Distritos</th>
              <th>Lineas</th>
              <th>Fecha Ingreso</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={10} className="no-data">
                  <span className="material-icons">inbox</span>
                  <p>No hay managers para mostrar</p>
                </td>
              </tr>
            ) : (
              items.map(item => (
                <tr key={item.id}>
                  <td><strong>{item.codigo}</strong></td>
                  <td>{item.nombre} {item.apellido}</td>
                  <td>{item.email || '-'}</td>
                  <td>{item.cargo || '-'}</td>
                  <td>{item.cantidadRegiones}</td>
                  <td>{item.cantidadDistritos}</td>
                  <td>{item.cantidadLineasNegocio}</td>
                  <td>{formatDate(item.fechaIngreso)}</td>
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
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px' }}>
            <div className="modal-header">
              <h2>
                {modalMode === 'create' ? 'Nuevo Manager' : 'Editar Manager'}
              </h2>
              <button className="btn-close" onClick={handleCloseModal}>
                <span className="material-icons">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Usuario ID *</label>
                    <input
                      type="text"
                      value={formData.usuarioId}
                      onChange={(e) => setFormData({ ...formData, usuarioId: e.target.value })}
                      className="form-control"
                      required
                      disabled={modalMode === 'edit'}
                    />
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

                  <div className="form-group">
                    <label>Apellido</label>
                    <input
                      type="text"
                      value={formData.apellido}
                      onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label>Telefono</label>
                    <input
                      type="tel"
                      value={formData.telefono}
                      onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label>Cargo</label>
                    <input
                      type="text"
                      value={formData.cargo}
                      onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                      className="form-control"
                      placeholder="Gerente Regional, Supervisor, etc."
                    />
                  </div>

                  <div className="form-group">
                    <label>Fecha de Ingreso</label>
                    <input
                      type="date"
                      value={formData.fechaIngreso ? new Date(formData.fechaIngreso).toISOString().split('T')[0] : ''}
                      onChange={(e) => setFormData({ ...formData, fechaIngreso: e.target.value ? new Date(e.target.value) : undefined })}
                      className="form-control"
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

                  <div className="form-group full-width">
                    <label>Observaciones</label>
                    <textarea
                      value={formData.observaciones}
                      onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                      className="form-control"
                      rows={2}
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

                {/* Multi-select sections */}
                <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                  {/* Regiones */}
                  <div>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
                      Regiones Asignadas
                    </h3>
                    <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '0.5rem', padding: '0.75rem' }}>
                      {regiones.map(region => (
                        <label key={region.id} className="checkbox-label" style={{ display: 'flex', marginBottom: '0.5rem' }}>
                          <input
                            type="checkbox"
                            checked={(formData.regionIds || []).includes(region.id)}
                            onChange={() => toggleSelection(region.id, 'regionIds')}
                          />
                          <span>{region.nombre} ({region.codigo})</span>
                        </label>
                      ))}
                      {regiones.length === 0 && (
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textAlign: 'center' }}>
                          No hay regiones disponibles
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Distritos */}
                  <div>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
                      Distritos Asignados
                    </h3>
                    <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '0.5rem', padding: '0.75rem' }}>
                      {distritos.map(distrito => (
                        <label key={distrito.id} className="checkbox-label" style={{ display: 'flex', marginBottom: '0.5rem' }}>
                          <input
                            type="checkbox"
                            checked={(formData.distritoIds || []).includes(distrito.id)}
                            onChange={() => toggleSelection(distrito.id, 'distritoIds')}
                          />
                          <span>{distrito.nombre} ({distrito.codigo})</span>
                        </label>
                      ))}
                      {distritos.length === 0 && (
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textAlign: 'center' }}>
                          No hay distritos disponibles
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Lineas de Negocio */}
                  <div>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
                      Lineas de Negocio Asignadas
                    </h3>
                    <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '0.5rem', padding: '0.75rem' }}>
                      {lineasNegocio.map(linea => (
                        <label key={linea.id} className="checkbox-label" style={{ display: 'flex', marginBottom: '0.5rem' }}>
                          <input
                            type="checkbox"
                            checked={(formData.lineaNegocioIds || []).includes(linea.id)}
                            onChange={() => toggleSelection(linea.id, 'lineaNegocioIds')}
                          />
                          <span>{linea.nombre} ({linea.codigo})</span>
                        </label>
                      ))}
                      {lineasNegocio.length === 0 && (
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textAlign: 'center' }}>
                          No hay lineas de negocio disponibles
                        </p>
                      )}
                    </div>
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

export default ManagersPage;
