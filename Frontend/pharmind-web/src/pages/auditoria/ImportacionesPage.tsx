import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { usePage } from '../../contexts/PageContext';
import ChunkedUploadService from '../../services/chunkedUpload.service';
import type { UploadProgress } from '../../services/chunkedUpload.service';
import { signalRService } from '../../services/signalr.service';
import './AuditoriaPages.css';

interface Importacion {
  id: number;
  archivo: string;
  tipo: string;
  estado: 'pendiente' | 'procesando' | 'completado' | 'error';
  registrosProcesados: number;
  registrosTotales: number;
  fechaImportacion: string;
  usuario: string;
  errores?: string;
}

const tiposImportacion = [
  'Médicos',
  'Instituciones',
  'Productos',
  'Farmacias',
  'Agentes',
  'Clientes',
  'Ventas',
  'Auditorías'
];

const ImportacionesPage: React.FC = () => {
  const { addNotification } = useNotifications();
  const { setToolbarContent, clearToolbarContent } = usePage();

  const [loading, setLoading] = useState(true);
  const [importaciones, setImportaciones] = useState<Importacion[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTipo, setFilterTipo] = useState<string>('');
  const [filterEstado, setFilterEstado] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [tipoImportacion, setTipoImportacion] = useState<string>('Médicos');

  // Estados para upload chunked
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [uploadStartTime, setUploadStartTime] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [selectedImportacion, setSelectedImportacion] = useState<Importacion | null>(null);
  const [processing, setProcessing] = useState(false);
  const [processResult, setProcessResult] = useState<{
    registrosProcesados: number;
    registrosExitosos: number;
    registrosError: number;
    errores: string[];
  } | null>(null);
  const [processingProgress, setProcessingProgress] = useState<any>(null);
  const [currentUploadId, setCurrentUploadId] = useState<string | null>(null);
  const [processLogs, setProcessLogs] = useState<string[]>([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'error'>('success');

  // Ref para rastrear si el usuario cerró manualmente el modal
  const modalManuallyClosed = useRef(false);

  // Ref para almacenar el intervalo de polling
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleCreate = useCallback(() => {
    setSelectedFile(null);
    setTipoImportacion('Médicos');
    setShowModal(true);
  }, []);

  useEffect(() => {
    const toolbarContent = (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            backgroundColor: '#8b5cf6',
            padding: '0.5rem',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span className="material-icons" style={{ color: 'white', fontSize: '1.5rem' }}>upload_file</span>
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>Importaciones</h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>Gestión de importación de datos</p>
          </div>
        </div>
        <button
          className="btn-add"
          onClick={handleCreate}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <span className="material-icons">add</span>
          Nueva Importación
        </button>
      </div>
    );

    setToolbarContent(toolbarContent);
    return () => clearToolbarContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleCreate]);

  useEffect(() => {
    fetchImportaciones();

    // Conectar a SignalR y luego registrar el listener
    const initSignalR = async () => {
      await signalRService.connect();

      signalRService.onImportProgress((update) => {
        // Solo procesar si el uploadId coincide o no tenemos uploadId guardado aún
        if (update.uploadId) {
          setProcessingProgress(update);
          setProcessing(true); // Marcar que hay un proceso activo
          setCurrentUploadId(update.uploadId); // Guardar el uploadId

          // Solo abrir el modal si el usuario no lo cerró manualmente
          if (!modalManuallyClosed.current) {
            setShowProcessModal(true);
          }

          // Acumular logs si existen
          if (update.logs && update.logs.length > 0) {
            setProcessLogs(prev => [...prev, ...update.logs]);
          }

          if (update.status === 'completed' || update.status === 'completed_with_errors') {
            setShowAlert(true);
            setAlertType(update.status === 'completed' ? 'success' : 'error');
            setAlertMessage(update.message || 'Auditoría importada');
            setProcessing(false);
            modalManuallyClosed.current = false; // Reset para futuras importaciones

            setTimeout(() => {
              setShowProcessModal(false);
              setCurrentUploadId(null);
              setProcessLogs([]);
              fetchImportaciones();
            }, 5000); // Aumenté a 5 segundos para que se puedan leer los logs finales
          } else if (update.status === 'error') {
            setShowAlert(true);
            setAlertType('error');
            setAlertMessage(update.message || 'Error en el procesamiento');
            setProcessing(false);
            setCurrentUploadId(null);
            modalManuallyClosed.current = false; // Reset para futuras importaciones
          }
        }
      });
    };

    initSignalR();

    return () => {
      signalRService.disconnect();
    };
  }, []);

  // Cleanup: detener polling cuando el componente se desmonte
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        console.log('🛑 Cleaning up polling interval on component unmount');
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, []);

  const fetchImportaciones = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5209/api/importaciones/list');

      if (!response.ok) {
        throw new Error('Error al cargar importaciones');
      }

      const data = await response.json();

      // Mapear los datos del backend al formato del frontend
      const mappedData: Importacion[] = data.map((item: any) => ({
        id: item.id,
        archivo: item.archivo,
        tipo: item.tipo,
        estado: item.estado,
        registrosProcesados: item.registrosProcesados,
        registrosTotales: item.registrosProcesados, // Por ahora usar el mismo valor
        fechaImportacion: item.fechaImportacion,
        usuario: item.usuario
      }));

      setImportaciones(mappedData);
    } catch (error) {
      console.error('Error fetching importaciones:', error);
      addNotification({
        title: 'Error',
        message: 'No se pudieron cargar las importaciones',
        type: 'error',
        category: 'auditoria'
      });
    } finally {
      setLoading(false);
    }
  };

  const validateAndSetFile = (file: File) => {
    // Validar tamaño del archivo (máximo 200MB)
    const sizeValidation = ChunkedUploadService.validateFileSize(file, 200);
    if (!sizeValidation.valid) {
      addNotification({
        title: 'Error',
        message: sizeValidation.error || 'Archivo demasiado grande',
        type: 'error',
        category: 'auditoria'
      });
      return false;
    }

    // Validar extensión
    const extensionValidation = ChunkedUploadService.validateFileExtension(file);
    if (!extensionValidation.valid) {
      addNotification({
        title: 'Error',
        message: extensionValidation.error || 'Formato no válido',
        type: 'error',
        category: 'auditoria'
      });
      return false;
    }

    setSelectedFile(file);
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      validateAndSetFile(files[0]);
    }
  };

  const handleProcess = (importacion: Importacion) => {
    setSelectedImportacion(importacion);
    setShowProcessModal(true);
    setProcessResult(null);
    modalManuallyClosed.current = false; // Reset al abrir manualmente

    // Si ya está procesando, marcar como "processing" para que el modal no muestre el botón de iniciar
    if (importacion.estado === 'procesando') {
      setProcessing(true);
    }
  };

  const handleCloseProcessModal = () => {
    setShowProcessModal(false);
    if (processing) {
      // Si está procesando, marcar que el usuario cerró manualmente
      modalManuallyClosed.current = true;
    }
  };

  const handleStartProcessing = async () => {
    if (!selectedImportacion) return;

    setProcessing(true);
    setProcessResult(null);
    setProcessingProgress(null);
    setProcessLogs([]); // Limpiar logs anteriores

    try {
      const response = await fetch(`http://localhost:5209/api/importaciones/${selectedImportacion.id}/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Error al procesar importación');
      }

      // Capturar el uploadId para hacer match con SignalR
      const result = await response.json();
      console.log('Processing started:', result);

      if (result.uploadId) {
        setCurrentUploadId(result.uploadId);
        // ❌ Polling desactivado - usando solo SignalR para actualizaciones en tiempo real
        // startLogPolling(result.uploadId);
      }
    } catch (error) {
      console.error('Error processing importación:', error);
      setAlertType('error');
      setAlertMessage('Error al iniciar el procesamiento');
      setShowAlert(true);
      setProcessing(false);
    }
  };

  // Función para hacer polling de logs desde la base de datos
  const startLogPolling = (uploadId: string) => {
    // Limpiar cualquier polling anterior
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    console.log('🔄 Starting log polling for uploadId:', uploadId);

    pollingIntervalRef.current = setInterval(async () => {
      try {
        const response = await fetch(`http://localhost:5209/api/importaciones/logs/${uploadId}`);
        if (response.ok) {
          const logs = await response.json();
          console.log('📋 Fetched logs from database:', logs);

          // Convertir logs de DB a formato de UI
          const logMessages = logs.map((log: any) => {
            const icon = log.level === 'INFO' ? '✅' : log.level === 'WARNING' ? '⚠️' : '❌';
            return `${icon} ${log.message}`;
          });

          setProcessLogs(logMessages);

          // Si encontramos un log de "completado" o "error crítico", detener el polling
          const hasCompleted = logs.some((log: any) =>
            log.message.includes('completado') || log.message.includes('Error crítico')
          );

          if (hasCompleted) {
            console.log('✅ Processing completed, stopping polling');
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
              pollingIntervalRef.current = null;
            }
            setProcessing(false);
            setShowAlert(true);
            setAlertType(logs.some((log: any) => log.level === 'ERROR') ? 'error' : 'success');
            setAlertMessage('Procesamiento finalizado');

            setTimeout(() => {
              setShowProcessModal(false);
              setCurrentUploadId(null);
              setProcessLogs([]);
              fetchImportaciones();
            }, 5000);
          }
        }
      } catch (error) {
        console.error('Error fetching logs:', error);
      }
    }, 2000); // Polling cada 2 segundos
  };

  const handleDelete = async (importacion: Importacion) => {
    if (!confirm(`¿Está seguro de eliminar la importación "${importacion.archivo}"?`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5209/api/importaciones/${importacion.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Error al eliminar importación');
      }

      addNotification({
        title: 'Éxito',
        message: 'Importación eliminada correctamente',
        type: 'success',
        category: 'auditoria'
      });
      fetchImportaciones();
    } catch (error) {
      console.error('Error deleting importación:', error);
      addNotification({
        title: 'Error',
        message: 'No se pudo eliminar la importación',
        type: 'error',
        category: 'auditoria'
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      addNotification({
        title: 'Error',
        message: 'Debe seleccionar un archivo',
        type: 'error',
        category: 'auditoria'
      });
      return;
    }

    try {
      setUploading(true);
      setUploadStartTime(Date.now());
      setUploadProgress(null);

      // Callback para actualizar el progreso
      const onProgress = (progress: UploadProgress) => {
        setUploadProgress(progress);
      };

      // Iniciar upload chunked
      const result = await ChunkedUploadService.uploadFile(
        selectedFile,
        tipoImportacion,
        onProgress
      );

      if (result.success) {
        addNotification({
          title: 'Éxito',
          message: `Archivo "${result.fileName}" subido correctamente. Procesando importación...`,
          type: 'success',
          category: 'auditoria'
        });

        setShowModal(false);
        setSelectedFile(null);
        setUploadProgress(null);
        fetchImportaciones();
      } else {
        throw new Error(result.error || 'Error en el upload');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      addNotification({
        title: 'Error',
        message: error instanceof Error ? error.message : 'No se pudo subir el archivo',
        type: 'error',
        category: 'auditoria'
      });
    } finally {
      setUploading(false);
    }
  };

  const filteredImportaciones = importaciones.filter(imp => {
    const matchesSearch = imp.archivo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         imp.tipo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         imp.usuario.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTipo = filterTipo === '' || imp.tipo === filterTipo;
    const matchesEstado = filterEstado === '' || imp.estado === filterEstado;
    return matchesSearch && matchesTipo && matchesEstado;
  });

  const getEstadoBadgeClass = (estado: string) => {
    switch (estado) {
      case 'completado':
        return 'badge-success';
      case 'procesando':
        return 'badge-warning';
      case 'error':
        return 'badge-error';
      case 'pendiente':
        return 'badge-pending';
      default:
        return 'badge-inactive';
    }
  };

  const getEstadoLabel = (estado: string) => {
    switch (estado) {
      case 'completado':
        return 'Completado';
      case 'procesando':
        return 'Procesando';
      case 'error':
        return 'Error';
      case 'pendiente':
        return 'Pendiente';
      default:
        return estado;
    }
  };

  if (loading) {
    return (
      <div className="auditoria-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando importaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auditoria-page">
      <div className="page-header">
        <div className="page-actions">
          <div className="search-box">
            <span className="material-icons search-icon">search</span>
            <input
              type="text"
              placeholder="Buscar importaciones..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          <select
            value={filterTipo}
            onChange={(e) => setFilterTipo(e.target.value)}
            className="form-control"
            style={{ width: '180px' }}
          >
            <option value="">Todos los tipos</option>
            {tiposImportacion.map((tipo) => (
              <option key={tipo} value={tipo}>
                {tipo}
              </option>
            ))}
          </select>
          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="form-control"
            style={{ width: '180px' }}
          >
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="procesando">Procesando</option>
            <option value="completado">Completado</option>
            <option value="error">Error</option>
          </select>
        </div>
      </div>

      <div className="content-container">
        {filteredImportaciones.length === 0 ? (
          <div className="empty-state">
            <span className="material-icons">upload_file</span>
            <h3>No hay importaciones</h3>
            <p>Crea tu primera importación para comenzar</p>
            <button className="btn-add" onClick={handleCreate}>
              <span className="material-icons">add</span>
              Nueva Importación
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Archivo</th>
                  <th>Tipo</th>
                  <th>Estado</th>
                  <th>Progreso</th>
                  <th>Fecha</th>
                  <th>Usuario</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredImportaciones.map((imp) => (
                  <tr key={imp.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="material-icons" style={{ fontSize: '1.25rem', color: 'var(--text-secondary)' }}>
                          description
                        </span>
                        <strong>{imp.archivo}</strong>
                      </div>
                    </td>
                    <td>{imp.tipo}</td>
                    <td>
                      <span className={`badge ${getEstadoBadgeClass(imp.estado)}`}>
                        {getEstadoLabel(imp.estado)}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                          {imp.registrosProcesados} / {imp.registrosTotales}
                        </div>
                        <div style={{
                          width: '120px',
                          height: '6px',
                          backgroundColor: 'var(--border-color)',
                          borderRadius: '3px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${(imp.registrosProcesados / imp.registrosTotales) * 100}%`,
                            height: '100%',
                            backgroundColor: imp.estado === 'error' ? '#ef4444' : imp.estado === 'completado' ? '#10b981' : '#3b82f6',
                            transition: 'width 0.3s ease'
                          }} />
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.875rem' }}>{imp.fechaImportacion}</td>
                    <td style={{ fontSize: '0.875rem' }}>{imp.usuario}</td>
                    <td>
                      <div className="action-buttons">
                        {imp.estado === 'completado' && imp.registrosProcesados === 0 && (
                          <button
                            className="btn-icon btn-icon-primary"
                            onClick={() => handleProcess(imp)}
                            title="Procesar archivo"
                          >
                            <span className="material-icons">play_arrow</span>
                          </button>
                        )}
                        {imp.estado === 'procesando' && (
                          <button
                            className="btn-icon btn-icon-warning"
                            onClick={() => handleProcess(imp)}
                            title="Ver progreso"
                          >
                            <span className="material-icons">visibility</span>
                          </button>
                        )}
                        {imp.errores && (
                          <button
                            className="btn-icon btn-icon-info"
                            onClick={() => alert(imp.errores)}
                            title="Ver errores"
                          >
                            <span className="material-icons">error_outline</span>
                          </button>
                        )}
                        <button
                          className="btn-icon btn-icon-delete"
                          onClick={() => handleDelete(imp)}
                          title="Eliminar"
                        >
                          <span className="material-icons">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Nueva Importación</h2>
              <button className="btn-close" onClick={() => setShowModal(false)}>
                <span className="material-icons">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>
                    Tipo de Importación <span className="required">*</span>
                  </label>
                  <select
                    value={tipoImportacion}
                    onChange={(e) => setTipoImportacion(e.target.value)}
                    className="form-control"
                    required
                  >
                    {tiposImportacion.map((tipo) => (
                      <option key={tipo} value={tipo}>
                        {tipo}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    Archivo <span className="required">*</span>
                  </label>

                  {/* Área de Drag & Drop */}
                  <div
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    style={{
                      border: isDragging ? '2px dashed var(--primary-color)' : '2px dashed var(--border-color)',
                      borderRadius: '8px',
                      padding: '2rem',
                      textAlign: 'center',
                      backgroundColor: isDragging ? 'rgba(59, 130, 246, 0.05)' : 'var(--background-secondary)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      position: 'relative'
                    }}
                    onClick={() => document.getElementById('fileInput')?.click()}
                  >
                    <input
                      id="fileInput"
                      type="file"
                      onChange={handleFileChange}
                      accept=".xlsx,.xls,.csv,.zip,.txt"
                      style={{ display: 'none' }}
                      required={!selectedFile}
                    />

                    {!selectedFile ? (
                      <>
                        <span className="material-icons" style={{
                          fontSize: '3rem',
                          color: isDragging ? 'var(--primary-color)' : 'var(--text-secondary)',
                          marginBottom: '1rem',
                          display: 'block'
                        }}>
                          cloud_upload
                        </span>
                        <div style={{ marginBottom: '0.5rem', fontSize: '1rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                          {isDragging ? 'Suelta el archivo aquí' : 'Arrastra y suelta tu archivo aquí'}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                          o haz clic para seleccionar
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          Formatos: Excel (.xlsx, .xls), CSV (.csv), ZIP (.zip) o TXT (.txt)
                          <br />
                          Tamaño máximo: 200MB
                        </div>
                      </>
                    ) : (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        padding: '0.75rem',
                        backgroundColor: 'var(--background-primary)',
                        borderRadius: '6px',
                        textAlign: 'left'
                      }}>
                        <span className="material-icons" style={{
                          color: 'var(--primary-color)',
                          fontSize: '2.5rem'
                        }}>
                          {selectedFile.name.endsWith('.zip') ? 'folder_zip' : 'description'}
                        </span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                            {selectedFile.name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            {ChunkedUploadService.formatFileSize(selectedFile.size)}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFile(null);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            color: 'var(--text-secondary)',
                            transition: 'color 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--error-color)'}
                          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                        >
                          <span className="material-icons">close</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Progreso del Upload */}
                  {uploading && uploadProgress && (
                    <div style={{
                      marginTop: '0.75rem',
                      padding: '1rem',
                      backgroundColor: '#f0f9ff',
                      borderRadius: '8px',
                      border: '1px solid #bfdbfe'
                    }}>
                      <div style={{ marginBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#1e40af' }}>
                            Subiendo archivo...
                          </span>
                          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e40af' }}>
                            {uploadProgress.percentage}%
                          </span>
                        </div>
                        <div style={{
                          width: '100%',
                          height: '8px',
                          backgroundColor: '#dbeafe',
                          borderRadius: '4px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${uploadProgress.percentage}%`,
                            height: '100%',
                            backgroundColor: '#3b82f6',
                            transition: 'width 0.3s ease',
                            borderRadius: '4px'
                          }} />
                        </div>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#60a5fa' }}>
                        <div style={{ marginBottom: '0.25rem' }}>
                          {ChunkedUploadService.formatFileSize(uploadProgress.uploadedBytes)} de{' '}
                          {ChunkedUploadService.formatFileSize(uploadProgress.totalBytes)}
                        </div>
                        <div>
                          Chunk {uploadProgress.chunkIndex} de {uploadProgress.totalChunks}
                          {uploadStartTime > 0 && uploadProgress.uploadedBytes > 0 && (
                            <span style={{ marginLeft: '0.5rem' }}>
                              • {ChunkedUploadService.estimateTimeRemaining(
                                uploadProgress.uploadedBytes,
                                uploadProgress.totalBytes,
                                uploadStartTime
                              )} restantes
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div style={{
                  padding: '1rem',
                  backgroundColor: '#dbeafe',
                  borderRadius: '8px',
                  display: 'flex',
                  gap: '0.75rem'
                }}>
                  <span className="material-icons" style={{ color: '#3b82f6' }}>info</span>
                  <div style={{ fontSize: '0.875rem', color: '#1e40af' }}>
                    <strong>Instrucciones:</strong>
                    <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.25rem' }}>
                      <li>Descargue la plantilla correspondiente al tipo de importación</li>
                      <li>Complete los datos en el formato indicado</li>
                      <li>Guarde el archivo y súbalo usando este formulario</li>
                      <li>El sistema validará y procesará los datos automáticamente</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                  disabled={uploading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={uploading || !selectedFile}
                >
                  {uploading ? (
                    <>
                      <span className="material-icons" style={{ fontSize: '1rem', marginRight: '0.5rem' }}>
                        hourglass_empty
                      </span>
                      Subiendo...
                    </>
                  ) : (
                    'Iniciar Importación'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Procesamiento */}
      {showProcessModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Procesar Importación</h2>
              <button
                className="btn-close"
                onClick={handleCloseProcessModal}
              >
                <span className="material-icons">close</span>
              </button>
            </div>

            <div className="modal-body">
              {selectedImportacion && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <span className="material-icons" style={{ color: 'var(--text-secondary)' }}>
                      description
                    </span>
                    <strong>{selectedImportacion.archivo}</strong>
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    Tipo: {selectedImportacion.tipo}
                  </div>
                </div>
              )}

              {!processing && !processResult && (
                <div style={{
                  padding: '1rem',
                  backgroundColor: '#fef3c7',
                  borderRadius: '8px',
                  display: 'flex',
                  gap: '0.75rem',
                  marginBottom: '1rem'
                }}>
                  <span className="material-icons" style={{ color: '#f59e0b' }}>warning</span>
                  <div style={{ fontSize: '0.875rem', color: '#92400e' }}>
                    <strong>Importante:</strong> El procesamiento analizará y validará todos los registros del archivo.
                    Este proceso puede tardar varios minutos dependiendo del tamaño del archivo.
                  </div>
                </div>
              )}

              {processing && (
                <div style={{ padding: '1rem' }}>
                  {/* Mostrar barra de progreso solo si tenemos datos de SignalR */}
                  {processingProgress && (
                    <>
                      <div style={{ marginBottom: '1rem' }}>
                        <p style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                          {processingProgress.message}
                        </p>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                          Archivo {processingProgress.processedFiles || 0} de {processingProgress.totalFiles || 6}
                        </p>
                        {processingProgress.currentFile && (
                          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                            📄 {processingProgress.currentFile}
                          </p>
                        )}
                      </div>

                      <div style={{
                        width: '100%',
                        height: '30px',
                        backgroundColor: '#e0e0e0',
                        borderRadius: '15px',
                        overflow: 'hidden',
                        marginBottom: '0.75rem'
                      }}>
                        <div style={{
                          height: '100%',
                          background: 'linear-gradient(90deg, #4CAF50, #45a049)',
                          width: `${processingProgress.currentFileProgress || 0}%`,
                          transition: 'width 0.3s ease'
                        }} />
                      </div>

                      <div style={{ textAlign: 'center', fontSize: '1.125rem', fontWeight: 'bold', color: '#4CAF50' }}>
                        {processingProgress.currentFileProgress || 0}%
                      </div>
                    </>
                  )}

                  {/* Logs en tiempo real - mostrar siempre que haya logs */}
                  {processLogs.length > 0 && (
                    <div style={{
                      marginTop: processingProgress ? '1.5rem' : '0',
                      padding: '1rem',
                      backgroundColor: '#1e1e1e',
                      borderRadius: '8px',
                      maxHeight: '300px',
                      overflowY: 'auto',
                      fontFamily: 'monospace',
                      fontSize: '0.8rem',
                      color: '#d4d4d4'
                    }}>
                      <div style={{ marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#ffffff' }}>
                        📋 Log de procesamiento:
                      </div>
                      {processLogs.map((log, index) => (
                        <div key={index} style={{
                          padding: '0.25rem 0',
                          borderBottom: index < processLogs.length - 1 ? '1px solid #333' : 'none',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word'
                        }}>
                          {log}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Spinner solo si no hay logs todavía */}
                  {processLogs.length === 0 && !processingProgress && (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                      <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
                      <p style={{ color: 'var(--text-secondary)' }}>
                        Iniciando procesamiento...
                      </p>
                    </div>
                  )}
                </div>
              )}

              {processResult && (
                <div style={{ marginTop: '1rem' }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '1rem',
                    marginBottom: '1.5rem'
                  }}>
                    <div style={{
                      padding: '1rem',
                      backgroundColor: '#dbeafe',
                      borderRadius: '8px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1e40af' }}>
                        {processResult.registrosProcesados}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#1e40af', marginTop: '0.25rem' }}>
                        Procesados
                      </div>
                    </div>
                    <div style={{
                      padding: '1rem',
                      backgroundColor: '#d1fae5',
                      borderRadius: '8px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#065f46' }}>
                        {processResult.registrosExitosos}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#065f46', marginTop: '0.25rem' }}>
                        Exitosos
                      </div>
                    </div>
                    <div style={{
                      padding: '1rem',
                      backgroundColor: '#fee2e2',
                      borderRadius: '8px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#991b1b' }}>
                        {processResult.registrosError}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#991b1b', marginTop: '0.25rem' }}>
                        Con Errores
                      </div>
                    </div>
                  </div>

                  {processResult.errores && processResult.errores.length > 0 && (
                    <div>
                      <h4 style={{ fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                        Errores encontrados:
                      </h4>
                      <div style={{
                        maxHeight: '200px',
                        overflowY: 'auto',
                        backgroundColor: 'var(--bg-primary)',
                        borderRadius: '6px',
                        padding: '0.75rem',
                        fontSize: '0.75rem',
                        fontFamily: 'monospace'
                      }}>
                        {processResult.errores.map((error, index) => (
                          <div key={index} style={{ marginBottom: '0.5rem', color: '#dc2626' }}>
                            {error}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCloseProcessModal}
              >
                {processResult ? 'Cerrar' : processing ? 'Cerrar (continúa en segundo plano)' : 'Cancelar'}
              </button>
              {!processing && !processResult && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleStartProcessing}
                >
                  <span className="material-icons" style={{ fontSize: '1rem', marginRight: '0.5rem' }}>
                    play_arrow
                  </span>
                  Iniciar Procesamiento
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Alert de notificación */}
      {showAlert && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '15px 20px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          animation: 'slideIn 0.3s ease',
          backgroundColor: alertType === 'success' ? '#4CAF50' : '#f44336',
          color: 'white'
        }}>
          <span>{alertMessage}</span>
          <button
            onClick={() => setShowAlert(false)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: '24px',
              cursor: 'pointer',
              padding: 0,
              width: '30px',
              height: '30px'
            }}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};

export default ImportacionesPage;
