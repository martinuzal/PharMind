import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useNotifications } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import DynamicFormField from '../../components/dynamic/DynamicFormField';
import '../../styles/DynamicEntityPage.css';

interface EsquemaPersonalizado {
  id: string;
  nombre: string;
  entidadTipo: string;
  subTipo?: string;
  descripcion?: string;
  icono?: string;
  color?: string;
  schema: string;
  activo: boolean;
}

interface EntidadDinamica {
  id?: string;
  esquemaId: string;
  datos: string; // JSON
  fullDescription?: string;
  estado?: string;
  fechaCreacion?: string;
}

const DynamicEntityPage = () => {
  const { tipo, subtipo } = useParams<{ tipo: string; subtipo: string }>();
  const { addNotification } = useNotifications();
  const { user } = useAuth();

  console.log('DynamicEntityPage montado con params:', { tipo, subtipo });

  const [esquema, setEsquema] = useState<EsquemaPersonalizado | null>(null);
  const [entidades, setEntidades] = useState<EntidadDinamica[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEntidad, setEditingEntidad] = useState<EntidadDinamica | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [activeTab, setActiveTab] = useState<'form' | 'json'>('form');
  const [jsonText, setJsonText] = useState<string>('{}');
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Always show tabs for all users
  const showTabs = true;

  useEffect(() => {
    fetchEsquema();
  }, [tipo, subtipo]);

  useEffect(() => {
    if (esquema) {
      fetchEntidades();
    }
  }, [esquema]);

  const fetchEsquema = async () => {
    if (!tipo || !subtipo) {
      setLoading(false);
      return;
    }

    try {
      // Mapear el tipo de la URL al entidadTipo correcto
      const tipoMap: { [key: string]: string } = {
        'clientes': 'Cliente',
        'agentes': 'Agente',
        'relaciones': 'Relacion',
        'interacciones': 'Interaccion'
      };

      const entidadTipo = tipoMap[tipo.toLowerCase()] || capitalizeFirst(tipo);

      console.log('Buscando esquema:', { tipo, subtipo, entidadTipo });

      const response = await fetch(
        `http://localhost:5209/api/EsquemasPersonalizados/tipo/${entidadTipo}`
      );

      if (response.ok) {
        const esquemas = await response.json();
        console.log('Esquemas encontrados:', esquemas);

        // Intentar encontrar por subTipo (case-insensitive)
        let esquemaMatch = esquemas.find(
          (e: EsquemaPersonalizado) => e.subTipo?.toLowerCase() === subtipo?.toLowerCase()
        );

        // Si no se encuentra por subTipo, intentar por nombre (case-insensitive)
        if (!esquemaMatch) {
          esquemaMatch = esquemas.find(
            (e: EsquemaPersonalizado) => e.nombre?.toLowerCase().includes(subtipo?.toLowerCase())
          );
        }

        // Si solo hay un esquema de este tipo, usarlo
        if (!esquemaMatch && esquemas.length === 1) {
          esquemaMatch = esquemas[0];
        }

        console.log('Esquema seleccionado:', esquemaMatch);

        if (esquemaMatch) {
          setEsquema(esquemaMatch);
        } else {
          addNotification({
            title: 'Error',
            message: `No se encontró el esquema especificado para "${subtipo}"`,
            type: 'error',
            category: 'system'
          });
        }
      }
    } catch (error) {
      console.error('Error fetching esquema:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEntidades = async () => {
    if (!esquema) return;

    try {
      const response = await fetch(
        `http://localhost:5209/api/EntidadesDinamicas/esquema/${esquema.id}`
      );

      if (response.ok) {
        const data = await response.json();
        setEntidades(data);
      }
    } catch (error) {
      console.error('Error fetching entidades:', error);
    }
  };

  const handleCreate = () => {
    setEditingEntidad(null);
    setFormData({});
    setJsonText('{}');
    setJsonError(null);
    setActiveTab('form');
    setShowModal(true);
  };

  const handleEdit = (entidad: EntidadDinamica) => {
    setEditingEntidad(entidad);
    const datos = JSON.parse(entidad.datos);
    setFormData(datos);
    setJsonText(JSON.stringify(datos, null, 2));
    setJsonError(null);
    setActiveTab('form');
    setShowModal(true);
  };

  const handleTabSwitch = (tab: 'form' | 'json') => {
    if (tab === 'json') {
      // Switching to JSON tab - sync formData to JSON
      setJsonText(JSON.stringify(formData, null, 2));
      setJsonError(null);
    } else {
      // Switching to form tab - try to parse JSON
      try {
        const parsed = JSON.parse(jsonText);
        setFormData(parsed);
        setJsonError(null);
      } catch (error) {
        setJsonError('JSON inválido. Por favor corrija los errores antes de cambiar de pestaña.');
        return; // Don't switch tabs if JSON is invalid
      }
    }
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

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar este registro?')) return;

    try {
      const response = await fetch(`http://localhost:5209/api/EntidadesDinamicas/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        addNotification({
          title: 'Éxito',
          message: 'Registro eliminado correctamente',
          type: 'success',
          category: 'system'
        });
        fetchEntidades();
      }
    } catch (error) {
      console.error('Error deleting entidad:', error);
      addNotification({
        title: 'Error',
        message: 'No se pudo eliminar el registro',
        type: 'error',
        category: 'system'
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
      } catch (error) {
        addNotification({
          title: 'Error',
          message: 'JSON inválido. Por favor corrija los errores.',
          type: 'error',
          category: 'system'
        });
        return;
      }
    }

    // Generar FullDescription a partir de los primeros 2-3 campos
    const fullDescription = Object.entries(dataToSave)
      .slice(0, 2)
      .map(([key, value]) => String(value))
      .filter(v => v)
      .join(' - ') || esquema?.nombre || 'Sin descripción';

    const entidadData: EntidadDinamica = {
      esquemaId: esquema!.id,
      datos: JSON.stringify(dataToSave),
      fullDescription: fullDescription,
      estado: 'Activo'
    };

    try {
      const url = editingEntidad
        ? `http://localhost:5209/api/EntidadesDinamicas/${editingEntidad.id}`
        : 'http://localhost:5209/api/EntidadesDinamicas';

      const method = editingEntidad ? 'PUT' : 'POST';

      if (editingEntidad) {
        entidadData.id = editingEntidad.id;
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entidadData)
      });

      if (response.ok) {
        addNotification({
          title: 'Éxito',
          message: `Registro ${editingEntidad ? 'actualizado' : 'creado'} correctamente`,
          type: 'success',
          category: 'system'
        });
        setShowModal(false);
        fetchEntidades();
      }
    } catch (error) {
      console.error('Error saving entidad:', error);
      addNotification({
        title: 'Error',
        message: 'No se pudo guardar el registro',
        type: 'error',
        category: 'system'
      });
    }
  };

  const capitalizeFirst = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const getSchemaFields = () => {
    try {
      const schema = JSON.parse(esquema!.schema);
      return schema.fields || [];
    } catch {
      return [];
    }
  };

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData({ ...formData, [fieldName]: value });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando...</p>
      </div>
    );
  }

  if (!esquema) {
    return (
      <div className="empty-state">
        <span className="material-icons">error_outline</span>
        <h3>Esquema no encontrado</h3>
        <p>No se pudo cargar la configuración de esta entidad</p>
      </div>
    );
  }

  return (
    <div className="dynamic-entity-page">
      <div className="page-header">
        <div className="header-info">
          <div className="entity-icon" style={{ backgroundColor: esquema.color || '#4db8b8' }}>
            <span className="material-icons">{esquema.icono || 'category'}</span>
          </div>
          <div>
            <h1>{esquema.nombre}</h1>
            <p className="page-subtitle">{esquema.descripcion || `Gestión de ${esquema.nombre}`}</p>
          </div>
        </div>
        <button className="btn-primary" onClick={handleCreate}>
          <span className="material-icons">add</span>
          Nuevo Registro
        </button>
      </div>

      <div className="entities-grid">
        {entidades.map((entidad) => {
          const datos = JSON.parse(entidad.datos);
          return (
            <div key={entidad.id} className="entity-card">
              <div className="entity-body">
                {entidad.fullDescription && (
                  <div className="entity-title">
                    <h3>{entidad.fullDescription}</h3>
                  </div>
                )}
                <div className="entity-details">
                  {Object.entries(datos).slice(0, 3).map(([key, value]) => (
                    <div key={key} className="entity-field">
                      <span className="field-label">{key}:</span>
                      <span className="field-value">{String(value)}</span>
                    </div>
                  ))}
                  {Object.keys(datos).length > 3 && (
                    <span className="more-fields">+{Object.keys(datos).length - 3} más...</span>
                  )}
                </div>
              </div>
              <div className="entity-actions">
                <button
                  className="btn-icon"
                  onClick={() => handleEdit(entidad)}
                  title="Editar"
                >
                  <span className="material-icons">edit</span>
                </button>
                <button
                  className="btn-icon btn-delete"
                  onClick={() => handleDelete(entidad.id!)}
                  title="Eliminar"
                >
                  <span className="material-icons">delete</span>
                </button>
              </div>
            </div>
          );
        })}

        {entidades.length === 0 && (
          <div className="empty-state">
            <span className="material-icons">inbox</span>
            <h3>No hay registros</h3>
            <p>Crea tu primer registro para comenzar</p>
            <button className="btn-primary" onClick={handleCreate}>
              <span className="material-icons">add</span>
              Crear Registro
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingEntidad ? 'Editar Registro' : 'Nuevo Registro'}</h2>
              <button className="btn-close" onClick={() => setShowModal(false)}>
                <span className="material-icons">close</span>
              </button>
            </div>

            {showTabs && (
              <div className="modal-tabs">
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
                  className={`tab-button ${activeTab === 'json' ? 'active' : ''}`}
                  onClick={() => handleTabSwitch('json')}
                >
                  <span className="material-icons">code</span>
                  JSON
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="modal-form">
              {activeTab === 'form' ? (
                <div className="form-section">
                  {getSchemaFields().length > 0 ? (
                    getSchemaFields().map((field: any) => (
                      <DynamicFormField
                        key={field.name}
                        field={field}
                        value={formData[field.name]}
                        onChange={handleFieldChange}
                      />
                    ))
                  ) : (
                    <p className="text-secondary">
                      No hay campos definidos en el esquema. Ve a Gestión de Entidades para configurar los campos.
                    </p>
                  )}
                </div>
              ) : (
                <div className="json-section">
                  <textarea
                    className={`json-editor ${jsonError ? 'error' : ''}`}
                    value={jsonText}
                    onChange={(e) => handleJsonChange(e.target.value)}
                    rows={20}
                    spellCheck={false}
                  />
                  {jsonError && (
                    <div className="json-error">
                      <span className="material-icons">error</span>
                      {jsonError}
                    </div>
                  )}
                </div>
              )}

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingEntidad ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DynamicEntityPage;
