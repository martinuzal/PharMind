import type { AxiosError } from 'axios';

// Tipo para el callback de notificación (será inyectado desde el contexto React)
type NotificationCallback = (notification: {
  title: string;
  message: string;
  type: 'error' | 'warning' | 'info' | 'success';
  category: string;
}) => void;

class ErrorHandlerService {
  private notificationCallback: NotificationCallback | null = null;

  // Método para registrar el callback de notificación desde el contexto React
  setNotificationCallback(callback: NotificationCallback) {
    this.notificationCallback = callback;
  }

  // Extraer mensaje de error del response del backend
  private extractErrorMessage(error: AxiosError): { title: string; message: string; details?: string } {
    const response = error.response?.data as any;

    // Si el backend envió detalles estructurados (como hacemos en RolesController)
    if (response?.error && response?.details) {
      return {
        title: response.error,
        message: 'Ver consola para detalles completos',
        details: response.details
      };
    }

    // Si hay un mensaje general del backend
    if (response?.message) {
      return {
        title: 'Error',
        message: response.message
      };
    }

    // Si hay errores de validación (400 Bad Request)
    if (response?.errors && typeof response.errors === 'object') {
      const errorMessages = Object.entries(response.errors)
        .map(([field, messages]) => `${field}: ${(messages as string[]).join(', ')}`)
        .join('\n');

      return {
        title: 'Error de validación',
        message: errorMessages
      };
    }

    // Mensajes por código de estado HTTP
    const status = error.response?.status;
    switch (status) {
      case 400:
        return { title: 'Solicitud inválida', message: 'Los datos enviados no son válidos' };
      case 401:
        return { title: 'No autorizado', message: 'Sesión expirada. Por favor, inicie sesión nuevamente' };
      case 403:
        return { title: 'Acceso denegado', message: 'No tiene permisos para realizar esta acción' };
      case 404:
        return { title: 'No encontrado', message: 'El recurso solicitado no existe' };
      case 409:
        return { title: 'Conflicto', message: 'Ya existe un registro con estos datos' };
      case 500:
        return { title: 'Error del servidor', message: 'Ocurrió un error interno. Por favor, intente nuevamente' };
      case 503:
        return { title: 'Servicio no disponible', message: 'El servidor no está disponible temporalmente' };
      default:
        return { title: 'Error', message: error.message || 'Error desconocido' };
    }
  }

  // Manejo centralizado de errores de API
  handleApiError(error: AxiosError): void {
    // Si es un error de cancelación de axios, ignorarlo
    if (error.code === 'ERR_CANCELED') {
      return;
    }

    const { title, message, details } = this.extractErrorMessage(error);
    const status = error.response?.status;

    // Logging detallado en consola para debugging
    console.group(`🔴 API Error [${status || 'Network'}]`);
    console.error('Title:', title);
    console.error('Message:', message);

    if (details) {
      console.error('Details from backend:');
      console.error(details);
    }

    console.error('Request:', {
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      data: error.config?.data
    });

    if (error.response) {
      console.error('Response:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    console.groupEnd();

    // No mostrar alert para errores 401 (ya redirige al login)
    if (status !== 401) {
      // Mostrar alert con el error
      const alertMessage = details
        ? `${title}\n\n${message}\n\nDetalles:\n${details}`
        : `${title}\n\n${message}`;
      alert(alertMessage);

      // También mostrar notificación si está disponible
      if (this.notificationCallback) {
        this.notificationCallback({
          title,
          message: details || message,
          type: 'error',
          category: 'API'
        });
      }
    }
  }

  // Manejo de errores de red
  handleNetworkError(): void {
    console.error('🔴 Network Error: No se pudo conectar con el servidor');

    if (this.notificationCallback) {
      this.notificationCallback({
        title: 'Error de conexión',
        message: 'No se pudo conectar con el servidor. Verifique su conexión a internet.',
        type: 'error',
        category: 'Network'
      });
    } else {
      alert('Error de conexión\n\nNo se pudo conectar con el servidor. Verifique su conexión a internet.');
    }
  }
}

// Exportar instancia singleton
export const errorHandler = new ErrorHandlerService();
