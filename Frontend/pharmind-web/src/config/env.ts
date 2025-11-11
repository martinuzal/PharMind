/**
 * Configuración de variables de entorno
 * Todas las variables de entorno deben comenzar con VITE_ para ser accesibles en el cliente
 */

export const env = {
  // API Configuration
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5209/api',

  // Application Configuration
  appName: import.meta.env.VITE_APP_NAME || 'PharMind',
  environment: import.meta.env.VITE_ENVIRONMENT || 'development',

  // Feature Flags
  enableDebugMode: import.meta.env.VITE_ENABLE_DEBUG_MODE === 'true',
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',

  // SignalR
  signalRHubUrl: import.meta.env.VITE_SIGNALR_HUB_URL || import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5209',

  // Computed properties
  isDevelopment: import.meta.env.MODE === 'development',
  isProduction: import.meta.env.MODE === 'production',
  isStaging: import.meta.env.VITE_ENVIRONMENT === 'staging',
} as const;

// Validar configuración crítica en desarrollo
if (env.isDevelopment && !env.apiBaseUrl) {
  console.warn('⚠️ VITE_API_BASE_URL no está configurado. Usando valor por defecto.');
}

// Exportar para facilitar debugging
if (env.enableDebugMode) {
  console.log('🔧 Environment Configuration:', {
    apiBaseUrl: env.apiBaseUrl,
    environment: env.environment,
    mode: import.meta.env.MODE,
  });
}

export default env;
