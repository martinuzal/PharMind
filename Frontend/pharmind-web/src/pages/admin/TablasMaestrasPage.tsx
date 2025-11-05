import { useState, useEffect } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { usePage } from '../../contexts/PageContext';
import '../../styles/TablasMaestrasPage.css';

interface ColumnaDef {
  nombre: string;
  tipo: string;
  longitud?: number;
  esRequerido: boolean;
  esClavePrimaria: boolean;
  esUnico: boolean;
  valorPorDefecto?: string;
}

interface TablaMaestra {
  id?: string;
  nombreTabla: string;
  descripcion?: string;
  esquemaColumnas: string;
  tablaCreada: boolean;
  activo: boolean;
}

const TablasMaestrasPage = () => {
  const { addNotification } = useNotifications();
  const { setToolbarContent, setToolbarRightContent, clearToolbarContent } = usePage();

  const [tablas, setTablas] = useState<TablaMaestra[]>([]);
  const [filteredTablas, setFilteredTablas] = useState<TablaMaestra[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDataModal, setShowDataModal] = useState(false);
  const [showSchemaModal, setShowSchemaModal] = useState(false);
  const [selectedTabla, setSelectedTabla] = useState<TablaMaestra | null>(null);
  const [formData, setFormData] = useState<Partial<TablaMaestra>>({
    nombreTabla: '',
    descripcion: '',
    esquemaColumnas: '[]',
    activo: true
  });
  const [columnas, setColumnas] = useState<ColumnaDef[]>([]);
  const [datos, setDatos] = useState<any[]>([]);
  const [editingRow, setEditingRow] = useState<any>(null);

  useEffect(() => {
    fetchTablas();
    return () => clearToolbarContent();
  }, []);

  useEffect(() => {
    setupToolbar();
  }, [searchTerm]);

  useEffect(() => {
    const filtered = tablas.filter(tabla =>
      tabla.nombreTabla.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tabla.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTablas(filtered);
  }, [searchTerm, tablas]);

  const setupToolbar = () => {
    // Título y buscador
    setToolbarContent(
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span className="material-icons" style={{ fontSize: '1.75rem', color: 'var(--accent-color)' }}>
            table_chart
          </span>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Tablas Maestras
            </h1>
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Crear y gestionar tablas SQL dinámicas
            </p>
          </div>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          background: 'var(--bg-primary)',
          border: '1px solid var(--border-color)',
          borderRadius: '0.5rem',
          padding: '0.5rem 1rem',
          flex: 1,
          maxWidth: '400px'
        }}>
          <span className="material-icons" style={{ color: 'var(--text-secondary)' }}>search</span>
          <input
            type="text"
            placeholder="Buscar tablas por nombre o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: '0.875rem',
              color: 'var(--text-primary)',
              flex: 1
            }}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '0.25rem',
                color: 'var(--text-secondary)'
              }}
            >
              <span className="material-icons">clear</span>
            </button>
          )}
        </div>
      </div>
    );

    // Botón de nueva tabla
    setToolbarRightContent(
      <button
        className="btn-primary"
        onClick={handleCreate}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.75rem 1.5rem',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
          fontWeight: 600,
          cursor: 'pointer',
          whiteSpace: 'nowrap'
        }}
      >
        <span className="material-icons">add</span>
        Nueva Tabla Maestra
      </button>
    );
  };

  const fetchTablas = async () => {
    try {
      const response = await fetch('http://localhost:5209/api/TablasMaestras');
      if (response.ok) {
        const data = await response.json();
        setTablas(data);
        setFilteredTablas(data);
      }
    } catch (error) {
      console.error('Error:', error);
      addNotification({ title: 'Error', message: 'Error al cargar tablas maestras', type: 'error', category: 'system' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setFormData({ nombreTabla: '', descripcion: '', esquemaColumnas: '[]', activo: true });
    setColumnas([]);
    setShowModal(true);
  };

  const handleAddColumn = () => {
    setColumnas([...columnas, {
      nombre: '',
      tipo: 'nvarchar',
      longitud: 255,
      esRequerido: false,
      esClavePrimaria: false,
      esUnico: false
    }]);
  };

  const handleColumnChange = (index: number, field: string, value: any) => {
    const newColumnas = [...columnas];
    (newColumnas[index] as any)[field] = value;
    setColumnas(newColumnas);
  };

  const handleRemoveColumn = (index: number) => {
    setColumnas(columnas.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nombreTabla) {
      addNotification({ title: 'Error', message: 'El nombre de la tabla es requerido', type: 'error', category: 'system' });
      return;
    }

    const tablaData = {
      ...formData,
      esquemaColumnas: JSON.stringify(columnas)
    };

    console.log('Enviando datos:', tablaData);
    console.log('Columnas:', columnas);

    try {
      const response = await fetch('http://localhost:5209/api/TablasMaestras', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tablaData)
      });

      if (response.ok) {
        addNotification({ title: 'Éxito', message: 'Tabla creada exitosamente', type: 'success', category: 'system' });
        setShowModal(false);
        fetchTablas();
        setFormData({ nombreTabla: '', descripcion: '', esquemaColumnas: '[]', activo: true });
        setColumnas([]);
      } else {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        let errorMessage = 'Error al crear tabla';
        try {
          const error = JSON.parse(errorText);
          errorMessage = error.error || error.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        addNotification({ title: 'Error', message: errorMessage, type: 'error', category: 'system' });
      }
    } catch (error) {
      console.error('Excepción al crear tabla:', error);
      addNotification({ title: 'Error', message: `Error al crear tabla: ${error}`, type: 'error', category: 'system' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar esta tabla? Se eliminará la tabla SQL.')) return;

    try {
      const response = await fetch(`http://localhost:5209/api/TablasMaestras/${id}`, { method: 'DELETE' });
      if (response.ok) {
        addNotification({ title: 'Éxito', message: 'Tabla eliminada', type: 'success', category: 'system' });
        fetchTablas();
      }
    } catch (error) {
      addNotification({ title: 'Error', message: 'Error al eliminar tabla', type: 'error', category: 'system' });
    }
  };

  const handleViewData = async (tabla: TablaMaestra) => {
    if (!tabla.tablaCreada) {
      addNotification({ title: 'Error', message: 'La tabla no ha sido creada aún', type: 'error', category: 'system' });
      return;
    }

    setSelectedTabla(tabla);
    setLoadingData(true);
    setShowDataModal(true);
    try {
      const response = await fetch(`http://localhost:5209/api/TablasMaestras/${tabla.id}/datos`);
      if (response.ok) {
        const data = await response.json();
        setDatos(data);
        setColumnas(JSON.parse(tabla.esquemaColumnas));
      } else {
        addNotification({ title: 'Error', message: 'Error al cargar datos', type: 'error', category: 'system' });
        setShowDataModal(false);
      }
    } catch (error) {
      addNotification({ title: 'Error', message: 'Error al cargar datos', type: 'error', category: 'system' });
      setShowDataModal(false);
    } finally {
      setLoadingData(false);
    }
  };

  const handleViewSchema = (tabla: TablaMaestra) => {
    setSelectedTabla(tabla);
    setColumnas(JSON.parse(tabla.esquemaColumnas));
    setShowSchemaModal(true);
  };

  const getTipoColumnaLabel = (tipo: string) => {
    const tipos: Record<string, string> = {
      'nvarchar': 'Texto',
      'int': 'Número',
      'bit': 'Si/No',
      'datetime': 'Fecha',
      'decimal': 'Decimal'
    };
    return tipos[tipo] || tipo;
  };

  const handleAddRow = () => {
    const newRow: any = {};
    columnas.forEach(col => {
      newRow[col.nombre] = '';
    });
    setEditingRow(newRow);
  };

  const handleSaveRow = async () => {
    if (!selectedTabla || !editingRow) return;

    try {
      const url = editingRow.Id
        ? `http://localhost:5209/api/TablasMaestras/${selectedTabla.id}/datos/${editingRow.Id}`
        : `http://localhost:5209/api/TablasMaestras/${selectedTabla.id}/datos`;

      const method = editingRow.Id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingRow)
      });

      if (response.ok) {
        addNotification({ title: 'Éxito', message: 'Dato guardado', type: 'success', category: 'system' });
        setEditingRow(null);
        handleViewData(selectedTabla);
      }
    } catch (error) {
      addNotification({ title: 'Error', message: 'Error al guardar dato', type: 'error', category: 'system' });
    }
  };

  const handleDeleteRow = async (id: string) => {
    if (!selectedTabla || !confirm('¿Eliminar este registro?')) return;

    try {
      const response = await fetch(`http://localhost:5209/api/TablasMaestras/${selectedTabla.id}/datos/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        addNotification({ title: 'Éxito', message: 'Registro eliminado', type: 'success', category: 'system' });
        handleViewData(selectedTabla);
      }
    } catch (error) {
      addNotification({ title: 'Error', message: 'Error al eliminar', type: 'error', category: 'system' });
    }
  };

  if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

  return (
    <div className="tablas-maestras-page">

      {filteredTablas.length === 0 && !loading && (
        <div className="empty-state">
          <span className="material-icons">table_chart</span>
          <p>{searchTerm ? 'No se encontraron tablas que coincidan con la búsqueda' : 'No hay tablas maestras creadas'}</p>
          {!searchTerm && (
            <button className="btn-primary" onClick={handleCreate}>
              <span className="material-icons">add</span>
              Crear Primera Tabla
            </button>
          )}
        </div>
      )}

      <div className="tablas-grid">
        {filteredTablas.map((tabla) => {
          const cols = JSON.parse(tabla.esquemaColumnas);
          return (
            <div key={tabla.id} className="tabla-card">
              <div className="tabla-header">
                <h3>{tabla.nombreTabla}</h3>
                <div className="tabla-badges">
                  {tabla.tablaCreada ? (
                    <span className="badge badge-success">Creada</span>
                  ) : (
                    <span className="badge badge-warning">Pendiente</span>
                  )}
                </div>
              </div>
              <p className="tabla-description">{tabla.descripcion || 'Sin descripción'}</p>

              <div className="tabla-info">
                <div className="info-item">
                  <span className="material-icons">view_column</span>
                  <span>{cols.length} columna{cols.length !== 1 ? 's' : ''}</span>
                </div>
                <button
                  className="btn-link"
                  onClick={() => handleViewSchema(tabla)}
                  title="Ver esquema"
                >
                  Ver estructura
                </button>
              </div>

              <div className="tabla-actions">
                {tabla.tablaCreada && (
                  <button className="btn-secondary btn-sm" onClick={() => handleViewData(tabla)}>
                    <span className="material-icons">table_view</span>
                    Ver Datos
                  </button>
                )}
                <button className="btn-icon btn-delete" onClick={() => handleDelete(tabla.id!)} title="Eliminar">
                  <span className="material-icons">delete</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Nueva Tabla Maestra</h2>
              <button className="btn-close" onClick={() => setShowModal(false)}>
                <span className="material-icons">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-form">
                <div className="form-group">
                  <label>Nombre de la Tabla *</label>
                  <input
                    type="text"
                    value={formData.nombreTabla}
                    onChange={(e) => setFormData({ ...formData, nombreTabla: e.target.value })}
                    placeholder="ej: Paises, TipoDocumento"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Descripción</label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="form-section">
                  <div className="section-header">
                    <h3>Columnas</h3>
                    <button type="button" className="btn-secondary btn-sm" onClick={handleAddColumn}>
                      <span className="material-icons">add</span>
                      Agregar Columna
                    </button>
                  </div>

                  <div className="columnas-list">
                    {columnas.map((col, index) => (
                      <div key={index} className="columna-item">
                        <div className="form-row">
                          <div className="form-group">
                            <label>Nombre</label>
                            <input
                              type="text"
                              value={col.nombre}
                              onChange={(e) => handleColumnChange(index, 'nombre', e.target.value)}
                              placeholder="ej: Codigo, Nombre"
                            />
                          </div>
                          <div className="form-group">
                            <label>Tipo</label>
                            <select
                              value={col.tipo}
                              onChange={(e) => handleColumnChange(index, 'tipo', e.target.value)}
                            >
                              <option value="nvarchar">Texto</option>
                              <option value="int">Número</option>
                              <option value="bit">Si/No</option>
                              <option value="datetime">Fecha</option>
                              <option value="decimal">Decimal</option>
                            </select>
                          </div>
                          {col.tipo === 'nvarchar' && (
                            <div className="form-group">
                              <label>Longitud</label>
                              <input
                                type="number"
                                value={col.longitud}
                                onChange={(e) => handleColumnChange(index, 'longitud', parseInt(e.target.value))}
                              />
                            </div>
                          )}
                        </div>
                        <div className="form-row checkbox-row">
                          <label>
                            <input
                              type="checkbox"
                              checked={col.esRequerido}
                              onChange={(e) => handleColumnChange(index, 'esRequerido', e.target.checked)}
                            />
                            Requerido
                          </label>
                          <label>
                            <input
                              type="checkbox"
                              checked={col.esClavePrimaria}
                              onChange={(e) => handleColumnChange(index, 'esClavePrimaria', e.target.checked)}
                            />
                            Clave Primaria
                          </label>
                          <label>
                            <input
                              type="checkbox"
                              checked={col.esUnico}
                              onChange={(e) => handleColumnChange(index, 'esUnico', e.target.checked)}
                            />
                            Único
                          </label>
                          <button
                            type="button"
                            className="btn-icon btn-delete"
                            onClick={() => handleRemoveColumn(index)}
                          >
                            <span className="material-icons">delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Crear Tabla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDataModal && selectedTabla && (
        <div className="modal-overlay" onClick={() => setShowDataModal(false)}>
          <div className="modal-content modal-xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Datos de {selectedTabla.nombreTabla}</h2>
              <button className="btn-close" onClick={() => setShowDataModal(false)}>
                <span className="material-icons">close</span>
              </button>
            </div>

            <div className="modal-body">
              {loadingData ? (
                <div className="loading-container">
                  <div className="spinner"></div>
                  <p>Cargando datos...</p>
                </div>
              ) : (
                <>
                  <div className="modal-toolbar">
                    <button className="btn-primary btn-sm" onClick={handleAddRow} disabled={!!editingRow}>
                      <span className="material-icons">add</span>
                      Nuevo Registro
                    </button>
                    <div className="data-count">
                      {datos.length} registro{datos.length !== 1 ? 's' : ''}
                    </div>
                  </div>

                  {datos.length === 0 && !editingRow ? (
                    <div className="empty-state-small">
                      <span className="material-icons">inbox</span>
                      <p>No hay datos en esta tabla</p>
                      <button className="btn-primary btn-sm" onClick={handleAddRow}>
                        <span className="material-icons">add</span>
                        Agregar Primer Registro
                      </button>
                    </div>
                  ) : (
                    <div className="table-container">
                      <table className="data-table">
                        <thead>
                          <tr>
                            {columnas.map((col) => (
                              <th key={col.nombre}>
                                {col.nombre}
                                {col.esClavePrimaria && <span className="pk-badge" title="Clave Primaria">PK</span>}
                              </th>
                            ))}
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {editingRow && (
                            <tr className="editing-row">
                              {columnas.map((col) => (
                                <td key={col.nombre}>
                                  <input
                                    type={col.tipo === 'int' || col.tipo === 'decimal' ? 'number' : 'text'}
                                    value={editingRow[col.nombre] || ''}
                                    onChange={(e) => setEditingRow({ ...editingRow, [col.nombre]: e.target.value })}
                                    disabled={col.esClavePrimaria && editingRow[col.nombre]}
                                  />
                                </td>
                              ))}
                              <td>
                                <button className="btn-icon" onClick={handleSaveRow} title="Guardar">
                                  <span className="material-icons">save</span>
                                </button>
                                <button className="btn-icon" onClick={() => setEditingRow(null)} title="Cancelar">
                                  <span className="material-icons">close</span>
                                </button>
                              </td>
                            </tr>
                          )}
                          {datos.map((row, index) => (
                            <tr key={index}>
                              {columnas.map((col) => (
                                <td key={col.nombre}>{String(row[col.nombre] || '')}</td>
                              ))}
                              <td>
                                <button className="btn-icon" onClick={() => setEditingRow(row)} title="Editar">
                                  <span className="material-icons">edit</span>
                                </button>
                                <button className="btn-icon btn-delete" onClick={() => handleDeleteRow(row.Id)} title="Eliminar">
                                  <span className="material-icons">delete</span>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {showSchemaModal && selectedTabla && (
        <div className="modal-overlay" onClick={() => setShowSchemaModal(false)}>
          <div className="modal-content modal-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Estructura de {selectedTabla.nombreTabla}</h2>
              <button className="btn-close" onClick={() => setShowSchemaModal(false)}>
                <span className="material-icons">close</span>
              </button>
            </div>

            <div className="modal-body">
              <div className="schema-table">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Columna</th>
                      <th>Tipo</th>
                      <th>Propiedades</th>
                    </tr>
                  </thead>
                  <tbody>
                    {columnas.map((col, index) => (
                      <tr key={index}>
                        <td>
                          <strong>{col.nombre}</strong>
                        </td>
                        <td>
                          {getTipoColumnaLabel(col.tipo)}
                          {col.tipo === 'nvarchar' && col.longitud && ` (${col.longitud})`}
                        </td>
                        <td>
                          <div className="properties-badges">
                            {col.esClavePrimaria && <span className="badge badge-primary">PK</span>}
                            {col.esRequerido && <span className="badge badge-info">Requerido</span>}
                            {col.esUnico && <span className="badge badge-warning">Único</span>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TablasMaestrasPage;
