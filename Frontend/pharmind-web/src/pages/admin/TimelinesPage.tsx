import React, { useState, useEffect } from 'react';
import { usePage } from '../../contexts/PageContext';
import timelinesService, { type Timeline, type Period } from '../../services/timelines.service';
import './TimelinesPage.css';

const TimelinesPage: React.FC = () => {
  const { setPageInfo, setToolbarContent, setToolbarCenterContent, setToolbarRightContent, clearToolbarContent } = usePage();
  const [timelines, setTimelines] = useState<Timeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTimeline, setEditingTimeline] = useState<Timeline | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    color: '#4CAF50',
    anio: new Date().getFullYear(),
    activo: true,
    esDefault: false,
    periods: [] as Period[]
  });

  useEffect(() => {
    setPageInfo('Períodos', 'schedule', '#3F51B5');
    loadTimelines();

    const toolbarRight = (
      <button
        className="toolbar-btn btn-primary"
        onClick={() => openCreateModal()}
        title="Nuevo Timeline"
      >
        <span className="material-icons">add</span>
        Nuevo Timeline
      </button>
    );

    setToolbarRightContent(toolbarRight);

    return () => {
      clearToolbarContent();
    };
  }, []);

  const loadTimelines = async () => {
    try {
      setLoading(true);
      const data = await timelinesService.getAll();
      setTimelines(data);
    } catch (error) {
      console.error('Error al cargar timelines:', error);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingTimeline(null);
    setFormData({
      nombre: '',
      descripcion: '',
      color: '#4CAF50',
      anio: new Date().getFullYear(),
      activo: true,
      esDefault: false,
      periods: []
    });
    setShowModal(true);
  };

  const openEditModal = (timeline: Timeline) => {
    setEditingTimeline(timeline);
    setFormData({
      nombre: timeline.nombre,
      descripcion: timeline.descripcion || '',
      color: timeline.color || '#4CAF50',
      anio: timeline.anio,
      activo: timeline.activo,
      esDefault: timeline.esDefault,
      periods: timeline.periods
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (editingTimeline) {
        await timelinesService.update(editingTimeline.id, formData);
      } else {
        await timelinesService.create(formData);
      }
      await loadTimelines();
      setShowModal(false);
    } catch (error) {
      console.error('Error al guardar timeline:', error);
      alert('Error al guardar timeline');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar este timeline?')) return;

    try {
      await timelinesService.delete(id);
      await loadTimelines();
    } catch (error: any) {
      console.error('Error al eliminar timeline:', error);
      alert(error.response?.data || 'Error al eliminar timeline');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await timelinesService.setDefault(id);
      await loadTimelines();
    } catch (error) {
      console.error('Error al establecer default:', error);
      alert('Error al establecer como default');
    }
  };

  const generatePeriods = (type: 'monthly' | 'quarterly' | 'bimonthly') => {
    let periods: Period[] = [];

    switch (type) {
      case 'monthly':
        periods = timelinesService.generateMonthlyPeriods(formData.anio);
        break;
      case 'quarterly':
        periods = timelinesService.generateQuarterlyPeriods(formData.anio);
        break;
      case 'bimonthly':
        periods = timelinesService.generateBimonthlyPeriods(formData.anio);
        break;
    }

    setFormData({ ...formData, periods });
  };

  const addPeriod = () => {
    const newPeriod: Period = {
      nombre: '',
      codigo: '',
      orden: formData.periods.length + 1,
      fechaInicio: `${formData.anio}-01-01`,
      fechaFin: `${formData.anio}-01-31`,
      color: '#2196F3',
      activo: true
    };
    setFormData({ ...formData, periods: [...formData.periods, newPeriod] });
  };

  const updatePeriod = (index: number, field: keyof Period, value: any) => {
    const updatedPeriods = [...formData.periods];
    (updatedPeriods[index] as any)[field] = value;
    setFormData({ ...formData, periods: updatedPeriods });
  };

  const removePeriod = (index: number) => {
    const updatedPeriods = formData.periods.filter((_, i) => i !== index);
    // Reordenar
    updatedPeriods.forEach((p, i) => p.orden = i + 1);
    setFormData({ ...formData, periods: updatedPeriods });
  };

  const movePeriod = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= formData.periods.length) return;

    const updatedPeriods = [...formData.periods];
    [updatedPeriods[index], updatedPeriods[newIndex]] = [updatedPeriods[newIndex], updatedPeriods[index]];

    // Actualizar orden
    updatedPeriods.forEach((p, i) => p.orden = i + 1);
    setFormData({ ...formData, periods: updatedPeriods });
  };

  if (loading) {
    return <div className="timelines-page"><div className="loading">Cargando...</div></div>;
  }

  return (
    <div className="timelines-page">
      <div className="timelines-grid">
        {timelines.map(timeline => (
          <div key={timeline.id} className="timeline-card">
            <div className="timeline-header">
              <div className="timeline-title">
                <div className="timeline-color" style={{ backgroundColor: timeline.color || '#4CAF50' }}></div>
                <div>
                  <h3>{timeline.nombre}</h3>
                  <div className="timeline-meta">
                    <span>Año: {timeline.anio}</span>
                    <span>{timeline.periods.length} períodos</span>
                  </div>
                </div>
              </div>
              <div className="timeline-badges">
                {timeline.esDefault && <span className="badge badge-primary">Default</span>}
                <span className={`badge badge-${timeline.activo ? 'success' : 'secondary'}`}>
                  {timeline.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>

            {timeline.descripcion && (
              <p className="timeline-description">{timeline.descripcion}</p>
            )}

            <div className="periods-list">
              {timeline.periods.slice(0, 6).map(period => (
                <div key={period.id} className="period-tag">
                  <div className="period-color" style={{ backgroundColor: period.color || '#2196F3' }}></div>
                  <span>{period.codigo || period.nombre}</span>
                </div>
              ))}
              {timeline.periods.length > 6 && (
                <span className="more-periods">+{timeline.periods.length - 6} más</span>
              )}
            </div>

            <div className="timeline-actions">
              <button className="btn-icon" onClick={() => openEditModal(timeline)} title="Editar">
                <span className="material-icons">edit</span>
              </button>
              {!timeline.esDefault && (
                <button className="btn-icon" onClick={() => handleSetDefault(timeline.id)} title="Establecer como default">
                  <span className="material-icons">star_outline</span>
                </button>
              )}
              {!timeline.esDefault && (
                <button className="btn-icon btn-danger" onClick={() => handleDelete(timeline.id)} title="Eliminar">
                  <span className="material-icons">delete</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingTimeline ? 'Editar Timeline' : 'Nuevo Timeline'}</h2>
              <button className="btn-icon" onClick={() => setShowModal(false)}>
                <span className="material-icons">close</span>
              </button>
            </div>

            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Nombre *</label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Ej: Timeline 2025"
                  />
                </div>

                <div className="form-group">
                  <label>Año *</label>
                  <input
                    type="number"
                    value={formData.anio}
                    onChange={e => setFormData({ ...formData, anio: parseInt(e.target.value) })}
                    min="2020"
                    max="2050"
                  />
                </div>

                <div className="form-group">
                  <label>Color</label>
                  <input
                    type="color"
                    value={formData.color}
                    onChange={e => setFormData({ ...formData, color: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  value={formData.descripcion}
                  onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Descripción del timeline"
                  rows={2}
                />
              </div>

              <div className="form-row">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.activo}
                    onChange={e => setFormData({ ...formData, activo: e.target.checked })}
                  />
                  <span>Activo</span>
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.esDefault}
                    onChange={e => setFormData({ ...formData, esDefault: e.target.checked })}
                  />
                  <span>Establecer como default</span>
                </label>
              </div>

              <div className="periods-section">
                <div className="periods-header">
                  <h3>Períodos</h3>
                  <div className="periods-actions">
                    <button className="btn-sm" onClick={() => generatePeriods('monthly')}>
                      <span className="material-icons">calendar_month</span>
                      Mensuales
                    </button>
                    <button className="btn-sm" onClick={() => generatePeriods('quarterly')}>
                      <span className="material-icons">calendar_view_month</span>
                      Trimestrales
                    </button>
                    <button className="btn-sm" onClick={() => generatePeriods('bimonthly')}>
                      <span className="material-icons">date_range</span>
                      Bimestrales
                    </button>
                    <button className="btn-sm" onClick={addPeriod}>
                      <span className="material-icons">add</span>
                      Agregar
                    </button>
                  </div>
                </div>

                <div className="periods-table">
                  {formData.periods.length === 0 ? (
                    <div className="empty-state">
                      <span className="material-icons">event_busy</span>
                      <p>No hay períodos definidos. Use los botones arriba para generar períodos automáticamente o agregar manualmente.</p>
                    </div>
                  ) : (
                    <table>
                      <thead>
                        <tr>
                          <th style={{ width: '40px' }}>Orden</th>
                          <th>Nombre</th>
                          <th style={{ width: '80px' }}>Código</th>
                          <th style={{ width: '140px' }}>Fecha Inicio</th>
                          <th style={{ width: '140px' }}>Fecha Fin</th>
                          <th style={{ width: '80px' }}>Color</th>
                          <th style={{ width: '100px' }}>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.periods.map((period, index) => (
                          <tr key={index}>
                            <td>
                              <div className="order-controls">
                                <button
                                  className="btn-icon-sm"
                                  onClick={() => movePeriod(index, 'up')}
                                  disabled={index === 0}
                                  title="Subir"
                                >
                                  <span className="material-icons">arrow_upward</span>
                                </button>
                                <span>{period.orden}</span>
                                <button
                                  className="btn-icon-sm"
                                  onClick={() => movePeriod(index, 'down')}
                                  disabled={index === formData.periods.length - 1}
                                  title="Bajar"
                                >
                                  <span className="material-icons">arrow_downward</span>
                                </button>
                              </div>
                            </td>
                            <td>
                              <input
                                type="text"
                                value={period.nombre}
                                onChange={e => updatePeriod(index, 'nombre', e.target.value)}
                                placeholder="Nombre del período"
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                value={period.codigo || ''}
                                onChange={e => updatePeriod(index, 'codigo', e.target.value)}
                                placeholder="Ej: P1"
                              />
                            </td>
                            <td>
                              <input
                                type="date"
                                value={period.fechaInicio.split('T')[0]}
                                onChange={e => updatePeriod(index, 'fechaInicio', e.target.value)}
                              />
                            </td>
                            <td>
                              <input
                                type="date"
                                value={period.fechaFin.split('T')[0]}
                                onChange={e => updatePeriod(index, 'fechaFin', e.target.value)}
                              />
                            </td>
                            <td>
                              <input
                                type="color"
                                value={period.color || '#2196F3'}
                                onChange={e => updatePeriod(index, 'color', e.target.value)}
                              />
                            </td>
                            <td>
                              <button
                                className="btn-icon-sm btn-danger"
                                onClick={() => removePeriod(index)}
                                title="Eliminar"
                              >
                                <span className="material-icons">delete</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>
                Cancelar
              </button>
              <button
                className="btn-primary"
                onClick={handleSave}
                disabled={!formData.nombre || formData.periods.length === 0}
              >
                {editingTimeline ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimelinesPage;
