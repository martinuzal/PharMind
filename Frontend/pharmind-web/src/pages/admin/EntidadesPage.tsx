import { useState, useEffect } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import SchemaBuilder from '../../components/schema/SchemaBuilder';
import '../../styles/EntidadesPage.css';

interface EsquemaPersonalizado {
  id?: string;
  empresaId?: string;
  entidadTipo: string;
  subTipo?: string;
  nombre: string;
  descripcion?: string;
  icono?: string;
  color?: string;
  schema: string;
  reglasValidacion?: string;
  reglasCorrelacion?: string;
  configuracionUI?: string;
  version?: number;
  activo: boolean;
  orden?: number;
}

const EntidadesPage = () => {
  const { addNotification } = useNotifications();
  const [esquemas, setEsquemas] = useState<EsquemaPersonalizado[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingEsquema, setEditingEsquema] = useState<EsquemaPersonalizado | null>(null);
  const [filterTipo, setFilterTipo] = useState<string>('');

  const [formData, setFormData] = useState<EsquemaPersonalizado>({
    entidadTipo: 'Cliente',
    subTipo: '',
    nombre: '',
    descripcion: '',
    icono: 'person',
    color: '#4db8b8',
    schema: '{}',
    activo: true,
    orden: 0
  });

  // Tab state for form/JSON/Preview view
  const [activeTab, setActiveTab] = useState<'form' | 'json' | 'preview'>('form');
  const [jsonText, setJsonText] = useState<string>('{}');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const showTabs = true;


  // Splitter state
  const [leftWidth, setLeftWidth] = useState(50); // Percentage
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;

    const modalContent = document.querySelector('.modal-content') as HTMLElement;
    if (!modalContent) return;

    const rect = modalContent.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const newLeftWidth = (offsetX / rect.width) * 100;

    // Constrain between 20% and 80%
    if (newLeftWidth >= 20 && newLeftWidth <= 80) {
      setLeftWidth(newLeftWidth);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const entidadTipos = [
    { value: 'Cliente', label: 'Cliente', icon: 'groups', description: 'Entidades externas (Médicos, Instituciones, Farmacias)' },
    { value: 'Agente', label: 'Agente', icon: 'badge', description: 'Entidades internas (Representantes, Supervisores, Regiones)' },
    { value: 'Relacion', label: 'Relación', icon: 'link', description: 'Vínculos entre Agentes y Clientes' },
    { value: 'Interaccion', label: 'Interacción', icon: 'touch_app', description: 'Acciones sobre Clientes o Relaciones' }
  ];

  const iconos = [
    'person', 'groups', 'business', 'local_pharmacy', 'medical_services',
    'badge', 'supervisor_account', 'account_tree', 'place',
    'event', 'assignment', 'description', 'inventory', 'shopping_cart',
    'call', 'email', 'campaign', 'analytics', 'trending_up'
  ];

  useEffect(() => {
    fetchEsquemas();
  }, []);

  const fetchEsquemas = async () => {
    setLoading(true);
    try {
      const url = filterTipo
        ? `http://localhost:5209/api/EsquemasPersonalizados?entidadTipo=${filterTipo}`
        : 'http://localhost:5209/api/EsquemasPersonalizados';

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setEsquemas(data);
      }
    } catch (error) {
      console.error('Error fetching esquemas:', error);
      addNotification({
        title: 'Error',
        message: 'No se pudieron cargar las entidades',
        type: 'error',
        category: 'admin'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEsquemas();
  }, [filterTipo]);

  const handleTabSwitch = (tab: 'form' | 'json' | 'preview') => {
    if (tab === 'json') {
      // Switching to JSON tab - sync formData to JSON
      // Parse schema string to object for better readability
      try {
        const formDataForJson = {
          ...formData,
          schema: typeof formData.schema === 'string' && formData.schema
            ? JSON.parse(formData.schema)
            : formData.schema || {}
        };
        setJsonText(JSON.stringify(formDataForJson, null, 2));
        setJsonError(null);
      } catch (error) {
        // If schema parsing fails, show as is
        setJsonText(JSON.stringify(formData, null, 2));
        setJsonError(null);
      }
    } else if (tab === 'form') {
      // Switching to form tab - try to parse JSON if coming from JSON tab
      if (activeTab === 'json') {
        try {
          const parsed = JSON.parse(jsonText);
          // Convert schema object back to string for formData
          if (parsed.schema && typeof parsed.schema === 'object') {
            parsed.schema = JSON.stringify(parsed.schema);
          }
          setFormData(parsed);
          setJsonError(null);
        } catch (error) {
          setJsonError('JSON inválido. Por favor corrija los errores antes de cambiar de pestaña.');
          return; // Don't switch tabs if JSON is invalid
        }
      }
    }
    // preview tab doesn't need any special handling
    setActiveTab(tab);
  };

  const handleJsonChange = (value: string) => {
    setJsonText(value);
    // Try to parse to validate
    try {
      JSON.parse(value);
      setJsonError(null);
    } catch (error) {
      setJsonError('JSON inválido');
    }
  };

  const handleCreate = () => {
    setEditingEsquema(null);
    setFormData({
      entidadTipo: 'Cliente',
      subTipo: '',
      nombre: '',
      descripcion: '',
      icono: 'person',
      color: '#4db8b8',
      schema: '{}',
      activo: true,
      orden: 0
    });
    setJsonText('{}');
    setJsonError(null);
    setActiveTab('form');
    setShowModal(true);
  };

  const handleEdit = (esquema: EsquemaPersonalizado) => {
    setEditingEsquema(esquema);
    setFormData(esquema);
    setJsonText(JSON.stringify(esquema, null, 2));
    setJsonError(null);
    setActiveTab('form');
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar esta entidad?')) return;

    try {
      const response = await fetch(`http://localhost:5209/api/EsquemasPersonalizados/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        addNotification({
          title: 'Éxito',
          message: 'Entidad eliminada correctamente',
          type: 'success',
          category: 'admin'
        });
        fetchEsquemas();
      }
    } catch (error) {
      console.error('Error deleting esquema:', error);
      addNotification({
        title: 'Error',
        message: 'No se pudo eliminar la entidad',
        type: 'error',
        category: 'admin'
      });
    }
  };

  const handleToggleActivo = async (id: string, activo: boolean) => {
    try {
      const response = await fetch(
        `http://localhost:5209/api/EsquemasPersonalizados/${id}/toggle-activo?activo=${!activo}`,
        { method: 'PATCH' }
      );

      if (response.ok) {
        addNotification({
          title: 'Éxito',
          message: `Entidad ${!activo ? 'activada' : 'desactivada'} correctamente`,
          type: 'success',
          category: 'admin'
        });
        fetchEsquemas();
      }
    } catch (error) {
      console.error('Error toggling activo:', error);
      addNotification({
        title: 'Error',
        message: 'No se pudo cambiar el estado',
        type: 'error',
        category: 'admin'
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // If on JSON tab, validate and parse JSON
    let dataToSave = formData;
    if (activeTab === 'json') {
      try {
        dataToSave = JSON.parse(jsonText);
        // Ensure schema is a string for the backend
        if (dataToSave.schema && typeof dataToSave.schema === 'object') {
          dataToSave.schema = JSON.stringify(dataToSave.schema);
        }
      } catch (error) {
        addNotification({
          title: 'Error',
          message: 'JSON inválido. Por favor corrija los errores.',
          type: 'error',
          category: 'admin'
        });
        return;
      }
    } else {
      // Ensure schema is a string for the backend
      if (dataToSave.schema && typeof dataToSave.schema === 'object') {
        dataToSave = {
          ...dataToSave,
          schema: JSON.stringify(dataToSave.schema)
        };
      }
    }

    if (!dataToSave.nombre || !dataToSave.entidadTipo) {
      addNotification({
        title: 'Error',
        message: 'Complete los campos requeridos',
        type: 'error',
        category: 'admin'
      });
      return;
    }

    try {
      const url = editingEsquema
        ? `http://localhost:5209/api/EsquemasPersonalizados/${editingEsquema.id}`
        : 'http://localhost:5209/api/EsquemasPersonalizados';

      const method = editingEsquema ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSave)
      });

      if (response.ok) {
        addNotification({
          title: 'Éxito',
          message: `Entidad ${editingEsquema ? 'actualizada' : 'creada'} correctamente`,
          type: 'success',
          category: 'admin'
        });
        setShowModal(false);
        fetchEsquemas();
      } else {
        const error = await response.text();
        throw new Error(error);
      }
    } catch (error: any) {
      console.error('Error saving esquema:', error);
      addNotification({
        title: 'Error',
        message: error.message || 'No se pudo guardar la entidad',
        type: 'error',
        category: 'admin'
      });
    }
  };

  return (
    <div className="entidades-page">
      <div className="page-header">
        <div>
          <h1>Gestión de Entidades</h1>
          <p className="page-subtitle">
            Configure los diferentes tipos de entidades del sistema
          </p>
        </div>
        <button className="btn-primary" onClick={handleCreate}>
          <span className="material-icons">add</span>
          Nueva Entidad
        </button>
      </div>

      <div className="filters-section">
        <div className="filter-group">
          <label>Filtrar por tipo:</label>
          <select
            value={filterTipo}
            onChange={(e) => setFilterTipo(e.target.value)}
            className="filter-select"
          >
            <option value="">Todos los tipos</option>
            {entidadTipos.map((tipo) => (
              <option key={tipo.value} value={tipo.value}>
                {tipo.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando entidades...</p>
        </div>
      ) : (
        <div className="entidades-grid">
          {esquemas.map((esquema) => (
            <div key={esquema.id} className="entidad-card">
              <div className="entidad-header">
                <div className="entidad-icon" style={{ backgroundColor: esquema.color || '#4db8b8' }}>
                  <span className="material-icons">{esquema.icono || 'category'}</span>
                </div>
                <div className="entidad-badge">{esquema.entidadTipo}</div>
              </div>

              <div className="entidad-body">
                <h3>{esquema.nombre}</h3>
                {esquema.subTipo && (
                  <p className="entidad-subtipo">Subtipo: {esquema.subTipo}</p>
                )}
                <p className="entidad-descripcion">
                  {esquema.descripcion || 'Sin descripción'}
                </p>
              </div>

              <div className="entidad-footer">
                <div className="entidad-status">
                  <span className={`status-badge ${esquema.activo ? 'active' : 'inactive'}`}>
                    {esquema.activo ? 'Activo' : 'Inactivo'}
                  </span>
                  <span className="entidad-orden">Orden: {esquema.orden || 0}</span>
                </div>

                <div className="entidad-actions">
                  <button
                    className="btn-icon"
                    onClick={() => handleToggleActivo(esquema.id!, esquema.activo)}
                    title={esquema.activo ? 'Desactivar' : 'Activar'}
                  >
                    <span className="material-icons">
                      {esquema.activo ? 'toggle_on' : 'toggle_off'}
                    </span>
                  </button>
                  <button
                    className="btn-icon"
                    onClick={() => handleEdit(esquema)}
                    title="Editar"
                  >
                    <span className="material-icons">edit</span>
                  </button>
                  <button
                    className="btn-icon btn-delete"
                    onClick={() => handleDelete(esquema.id!)}
                    title="Eliminar"
                  >
                    <span className="material-icons">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}

          {esquemas.length === 0 && (
            <div className="empty-state">
              <span className="material-icons">category</span>
              <h3>No hay entidades configuradas</h3>
              <p>Crea tu primera entidad para comenzar</p>
              <button className="btn-primary" onClick={handleCreate}>
                <span className="material-icons">add</span>
                Crear Entidad
              </button>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content modal-wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingEsquema ? 'Editar Entidad' : 'Nueva Entidad'}</h2>
              <button className="btn-close" onClick={() => setShowModal(false)}>
                <span className="material-icons">close</span>
              </button>
            </div>

            {showTabs && (
              <div className="modal-tabs" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className={`tab-button ${activeTab === 'form' ? 'active' : ''}`}
                    onClick={() => handleTabSwitch('form')}
                  >
                    <span className="material-icons">edit_note</span>
                    Formulario
                  </button>
                  <button
                    type="button"
                    className={`tab-button ${activeTab === 'preview' ? 'active' : ''}`}
                    onClick={() => handleTabSwitch('preview')}
                  >
                    <span className="material-icons">visibility</span>
                    Preview
                  </button>
                  <button
                    type="button"
                    className={`tab-button ${activeTab === 'json' ? 'active' : ''}`}
                    onClick={() => handleTabSwitch('json')}
                  >
                    <span className="material-icons">code</span>
                    JSON
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', paddingRight: '1.5rem' }}>
                  <button
                    type="submit"
                    className="btn-icon"
                    form="entity-form"
                    title={editingEsquema ? 'Guardar cambios' : 'Crear'}
                    style={{
                      color: '#22c55e',
                      borderColor: '#22c55e'
                    }}
                  >
                    <span className="material-icons">save</span>
                  </button>
                  <button
                    type="button"
                    className="btn-icon"
                    onClick={() => setShowModal(false)}
                    title="Cancelar"
                  >
                    <span className="material-icons">close</span>
                  </button>
                </div>
              </div>
            )}

            <form id="entity-form" onSubmit={handleSubmit}>
              {activeTab === 'form' ? (
              <div className="modal-form-layout" style={{ display: 'flex', gap: 0 }}>
                {/* Left Column - Basic Info */}
                <div className="modal-form-left" style={{ width: `${leftWidth}%`, minWidth: '200px' }}>
                  <div className="form-section">
                    <h3>Información Básica</h3>

                    <div className="form-group">
                      <label htmlFor="entidadTipo">
                        Tipo de Entidad <span className="required">*</span>
                      </label>
                      <select
                        id="entidadTipo"
                        value={formData.entidadTipo}
                        onChange={(e) => setFormData({ ...formData, entidadTipo: e.target.value })}
                        disabled={!!editingEsquema}
                        required
                      >
                        {entidadTipos.map((tipo) => (
                          <option key={tipo.value} value={tipo.value}>
                            {tipo.label} - {tipo.description}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="nombre">
                          Nombre <span className="required">*</span>
                        </label>
                        <input
                          id="nombre"
                          type="text"
                          value={formData.nombre}
                          onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                          placeholder="Ej: Médicos, Farmacias, Visitas..."
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="subTipo">Subtipo</label>
                        <input
                          id="subTipo"
                          type="text"
                          value={formData.subTipo || ''}
                          onChange={(e) => setFormData({ ...formData, subTipo: e.target.value })}
                          placeholder="Ej: Medico, Farmacia, Visita..."
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="descripcion">Descripción</label>
                      <textarea
                        id="descripcion"
                        value={formData.descripcion || ''}
                        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                        placeholder="Descripción de la entidad..."
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="form-section">
                    <h3>Apariencia</h3>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="icono">Icono</label>
                        <select
                          id="icono"
                          value={formData.icono || 'category'}
                          onChange={(e) => setFormData({ ...formData, icono: e.target.value })}
                        >
                          {iconos.map((icono) => (
                            <option key={icono} value={icono}>
                              {icono}
                            </option>
                          ))}
                        </select>
                        <div className="icon-preview">
                          <span className="material-icons" style={{ color: formData.color }}>
                            {formData.icono || 'category'}
                          </span>
                        </div>
                      </div>

                      <div className="form-group">
                        <label htmlFor="color">Color</label>
                        <input
                          id="color"
                          type="color"
                          value={formData.color || '#4db8b8'}
                          onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="orden">Orden</label>
                        <input
                          id="orden"
                          type="number"
                          value={formData.orden || 0}
                          onChange={(e) => setFormData({ ...formData, orden: parseInt(e.target.value) })}
                          min="0"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-section">
                    <div className="form-group-checkbox">
                      <input
                        id="activo"
                        type="checkbox"
                        checked={formData.activo}
                        onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                      />
                      <label htmlFor="activo">Entidad activa</label>
                    </div>
                  </div>
                </div>

                {/* Splitter */}
                <div
                  className="modal-splitter"
                  onMouseDown={handleMouseDown}
                  style={{ cursor: isDragging ? 'col-resize' : 'col-resize' }}
                >
                  <div className="splitter-handle"></div>
                </div>

                {/* Right Column - Schema Builder */}
                <div className="modal-form-right" style={{ width: `${100 - leftWidth}%`, minWidth: '200px' }}>
                  <SchemaBuilder
                    initialSchema={formData.schema}
                    onChange={(schema) => setFormData({ ...formData, schema })}
                  />
                </div>
              </div>
              ) : activeTab === 'preview' ? (
                <div className="preview-section">
                  <div className="preview-container">
                    <div className="preview-header">
                      <div className="preview-title">
                        <span className="material-icons">visibility</span>
                        <span>Vista Previa del Formulario</span>
                      </div>
                      <div className="preview-info">
                        <span className="material-icons">info</span>
                        <span>Los campos se muestran deshabilitados - esta es solo una vista previa</span>
                      </div>
                    </div>
                    <div className="preview-content">
                      {(() => {
                        try {
                          const schemaObj = typeof formData.schema === 'string'
                            ? JSON.parse(formData.schema)
                            : formData.schema;

                          if (!schemaObj || !schemaObj.fields || schemaObj.fields.length === 0) {
                            return (
                              <div className="preview-empty">
                                <span className="material-icons">dashboard_customize</span>
                                <p>No hay campos para mostrar</p>
                                <p className="preview-hint">Diseña tu formulario en la pestaña "Formulario"</p>
                              </div>
                            );
                          }

                          // Organize fields by row
                          const rowMap = new Map();
                          schemaObj.fields.forEach((field: any) => {
                            const row = field.position.row;
                            if (!rowMap.has(row)) {
                              rowMap.set(row, []);
                            }
                            rowMap.get(row).push(field);
                          });

                          // Sort fields within each row by column
                          rowMap.forEach((rowFields) => {
                            rowFields.sort((a: any, b: any) => a.position.col - b.position.col);
                          });

                          // Convert to sorted array of rows
                          const rows = Array.from(rowMap.entries())
                            .sort((a, b) => a[0] - b[0])
                            .map(([rowNum, fields]) => ({ rowNum, fields }));

                          return (
                            <div className="preview-form">
                              {rows.map(({ rowNum, fields }: any) => (
                                <div key={rowNum} className="preview-row">
                                  {fields.map((field: any) => (
                                    <div
                                      key={field.id}
                                      className={`preview-field ${field.type === 'section' ? 'preview-section' : ''}`}
                                      style={{
                                        gridColumnStart: field.position.col + 1,
                                        gridColumnEnd: `span ${field.span.cols}`,
                                      }}
                                    >
                                      {field.type === 'section' ? (
                                        <div className="preview-section-content">
                                          <div className="preview-section-line"></div>
                                          <h3 className="preview-section-title">{field.label}</h3>
                                          <div className="preview-section-line"></div>
                                        </div>
                                      ) : (
                                        <>
                                          <label className="preview-field-label">
                                            {field.label}
                                            {field.required && <span className="required">*</span>}
                                          </label>

                                          {(field.type === 'text' || field.type === 'email' ||
                                            field.type === 'phone' || field.type === 'url' ||
                                            field.type === 'number') && (
                                        <input
                                          type={field.type}
                                          placeholder={field.placeholder}
                                          disabled
                                          className="preview-input"
                                        />
                                      )}

                                      {field.type === 'textarea' && (
                                        <textarea
                                          placeholder={field.placeholder}
                                          disabled
                                          className="preview-textarea"
                                          rows={3}
                                        />
                                      )}

                                      {field.type === 'select' && (
                                        <select disabled className="preview-select">
                                          <option>{field.placeholder || 'Seleccionar...'}</option>
                                          {field.options?.map((opt: any, idx: number) => (
                                            <option key={idx}>
                                              {typeof opt === 'string' ? opt : opt.label}
                                            </option>
                                          ))}
                                        </select>
                                      )}

                                      {field.type === 'checkbox' && (
                                        <div className="preview-checkbox">
                                          <input type="checkbox" disabled id={`preview-${field.id}`} />
                                          <label htmlFor={`preview-${field.id}`}>{field.helpText || field.label}</label>
                                        </div>
                                      )}

                                      {field.type === 'radio' && (
                                        <div className="preview-radio-group">
                                          {field.options?.map((opt: any, idx: number) => (
                                            <div key={idx} className="preview-radio">
                                              <input
                                                type="radio"
                                                name={field.id}
                                                disabled
                                                id={`preview-${field.id}-${idx}`}
                                              />
                                              <label htmlFor={`preview-${field.id}-${idx}`}>
                                                {typeof opt === 'string' ? opt : opt.label}
                                              </label>
                                            </div>
                                          ))}
                                        </div>
                                      )}

                                      {(field.type === 'date' || field.type === 'datetime' || field.type === 'time') && (
                                        <input
                                          type={field.type === 'datetime' ? 'datetime-local' : field.type}
                                          disabled
                                          className="preview-input"
                                        />
                                      )}

                                      {field.type === 'address' && (
                                        <div className="preview-address-group">
                                          <input
                                            type="text"
                                            placeholder="Calle"
                                            disabled
                                            className="preview-input"
                                          />
                                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                            <input
                                              type="text"
                                              placeholder="Ciudad"
                                              disabled
                                              className="preview-input"
                                            />
                                            <input
                                              type="text"
                                              placeholder="Estado/Provincia"
                                              disabled
                                              className="preview-input"
                                            />
                                          </div>
                                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                            <input
                                              type="text"
                                              placeholder="Código Postal"
                                              disabled
                                              className="preview-input"
                                            />
                                            <input
                                              type="text"
                                              placeholder="País"
                                              disabled
                                              className="preview-input"
                                            />
                                          </div>
                                        </div>
                                      )}

                                      {field.type === 'file' && (
                                        <div className="preview-file-input">
                                          <button type="button" disabled className="preview-file-button">
                                            <span className="material-icons">upload_file</span>
                                            Seleccionar archivo
                                          </button>
                                        </div>
                                      )}

                                      {field.type === 'image' && (
                                        <div className="preview-file-input">
                                          <button type="button" disabled className="preview-file-button">
                                            <span className="material-icons">add_photo_alternate</span>
                                            Seleccionar imagen
                                          </button>
                                        </div>
                                      )}

                                      {field.type === 'color' && (
                                        <input
                                          type="color"
                                          disabled
                                          className="preview-input"
                                        />
                                      )}

                                      {field.type === 'slider' && (
                                        <input
                                          type="range"
                                          disabled
                                          className="preview-input"
                                        />
                                      )}

                                      {field.type === 'rating' && (
                                        <div className="preview-rating">
                                          {[1, 2, 3, 4, 5].map((star) => (
                                            <span key={star} className="material-icons" style={{ color: '#ddd', fontSize: '1.5rem' }}>
                                              star_border
                                            </span>
                                          ))}
                                        </div>
                                      )}

                                      {field.type === 'tags' && (
                                        <div className="preview-tags-input">
                                          <input
                                            type="text"
                                            placeholder="Escribe y presiona Enter para agregar etiquetas"
                                            disabled
                                            className="preview-input"
                                          />
                                        </div>
                                      )}

                                      {field.type === 'location' && (
                                        <div className="preview-location">
                                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                            <input
                                              type="number"
                                              placeholder="Latitud"
                                              disabled
                                              className="preview-input"
                                            />
                                            <input
                                              type="number"
                                              placeholder="Longitud"
                                              disabled
                                              className="preview-input"
                                            />
                                          </div>
                                          <div className="preview-map-placeholder">
                                            <span className="material-icons">map</span>
                                            <span>Mapa</span>
                                          </div>
                                        </div>
                                      )}

                                      {field.type === 'signature' && (
                                        <div className="preview-signature">
                                          <div className="preview-signature-canvas">
                                            <span className="material-icons">draw</span>
                                            <span>Área de firma</span>
                                          </div>
                                        </div>
                                      )}

                                          {field.helpText && field.type !== 'checkbox' && (
                                            <small className="preview-help-text">{field.helpText}</small>
                                          )}
                                        </>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ))}
                            </div>
                          );
                        } catch (error) {
                          return (
                            <div className="preview-error">
                              <span className="material-icons">error</span>
                              <p>Error al cargar la vista previa</p>
                              <p className="preview-error-detail">
                                {error instanceof Error ? error.message : 'Schema inválido'}
                              </p>
                            </div>
                          );
                        }
                      })()}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="json-section">
                  <div className="json-viewer-container">
                    <div className="json-viewer-header">
                      <div className="json-viewer-title">
                        <span className="material-icons">code</span>
                        <span>Vista JSON</span>
                      </div>
                      <button
                        type="button"
                        className="btn-copy"
                        onClick={() => {
                          navigator.clipboard.writeText(jsonText);
                          addNotification({
                            title: 'Copiado',
                            message: 'JSON copiado al portapapeles',
                            type: 'success',
                            category: 'admin'
                          });
                        }}
                        title="Copiar JSON"
                      >
                        <span className="material-icons">content_copy</span>
                      </button>
                    </div>
                    <div className="json-editor-wrapper">
                      <textarea
                        className={`json-editor ${jsonError ? 'error' : ''}`}
                        value={jsonText}
                        onChange={(e) => handleJsonChange(e.target.value)}
                        rows={40}
                        spellCheck={false}
                      />
                    </div>
                  </div>
                  {jsonError && (
                    <div className="json-error">
                      <span className="material-icons">error</span>
                      {jsonError}
                    </div>
                  )}
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EntidadesPage;
