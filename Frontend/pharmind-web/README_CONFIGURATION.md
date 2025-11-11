# Configuración de Variables de Entorno - PharMind Web

## 🔐 Seguridad

**IMPORTANTE**: Nunca subas archivos `.env.local` con datos reales al repositorio.

## 📋 Archivos de Configuración

### Archivos por Ambiente

- `.env.development` - Desarrollo (auto-cargado con `npm run dev`)
- `.env.staging` - Staging (usar con `--mode staging`)
- `.env.production` - Producción (auto-cargado con `npm run build`)
- `.env.local` - **Overrides locales** (no se commitea, mayor prioridad)
- `.env.example` - Template con todas las variables disponibles

### Prioridad de Carga

Vite carga los archivos en este orden (el último tiene mayor prioridad):
1. `.env` (base)
2. `.env.[mode]` (development, staging, production)
3. `.env.local` (overrides locales)
4. `.env.[mode].local` (overrides por ambiente)

## 🚀 Uso

### Desarrollo Local

1. **Primera vez - Crear archivo local:**
   ```bash
   cp .env.example .env.local
   ```

2. **Editar `.env.local` con tus valores:**
   ```env
   VITE_API_BASE_URL=http://localhost:5209/api
   VITE_ENABLE_DEBUG_MODE=true
   ```

3. **Ejecutar:**
   ```bash
   npm run dev
   ```

### Staging

```bash
npm run build -- --mode staging
npm run preview
```

### Producción

```bash
npm run build
npm run preview
```

## 📝 Variables Disponibles

### API Configuration
- `VITE_API_BASE_URL` - URL base del backend API
  - Dev: `http://localhost:5209/api`
  - Prod: `https://api.yourdomain.com/api`

### Application
- `VITE_APP_NAME` - Nombre de la aplicación
- `VITE_ENVIRONMENT` - Ambiente actual (development, staging, production)

### Feature Flags
- `VITE_ENABLE_DEBUG_MODE` - Habilitar modo debug (true/false)
- `VITE_ENABLE_ANALYTICS` - Habilitar analytics (true/false)

### Optional
- `VITE_SIGNALR_HUB_URL` - URL del hub SignalR (si difiere del API)

## 💻 Uso en Código

### Opción 1: Usar el módulo de configuración (Recomendado)

```typescript
import { env } from '@/config/env';

console.log(env.apiBaseUrl);    // http://localhost:5209/api
console.log(env.isDevelopment); // true
console.log(env.enableDebugMode); // true
```

### Opción 2: Acceso directo (No recomendado)

```typescript
const apiUrl = import.meta.env.VITE_API_BASE_URL;
```

## 🔒 Seguridad

### ✅ HACER:
- Usar `.env.local` para secretos de desarrollo
- Commitear `.env.example` con valores placeholder
- Configurar variables en el servidor de producción
- Todas las variables deben comenzar con `VITE_`

### ❌ NO HACER:
- Commitear archivos `.env.local`
- Poner API keys reales en `.env.*`
- Exponer variables sensibles en el cliente
- Usar variables sin el prefijo `VITE_`

## 🌐 Deployment

### Vercel

Configurar en: Project Settings > Environment Variables

```
VITE_API_BASE_URL = https://api.yourproductionurl.com/api
VITE_ENVIRONMENT = production
VITE_ENABLE_DEBUG_MODE = false
VITE_ENABLE_ANALYTICS = true
```

### Netlify

```toml
# netlify.toml
[build.environment]
  VITE_API_BASE_URL = "https://api.yourproductionurl.com/api"
  VITE_ENVIRONMENT = "production"
```

### Docker

```dockerfile
# Dockerfile
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build
```

```bash
# docker-compose.yml
build:
  args:
    VITE_API_BASE_URL: https://api.production.com/api
```

### Azure Static Web Apps

```json
// staticwebapp.config.json
{
  "globalHeaders": {
    "content-security-policy": "default-src 'self'; connect-src 'self' https://api.yourproductionurl.com"
  },
  "environmentVariables": {
    "VITE_API_BASE_URL": "https://api.yourproductionurl.com/api"
  }
}
```

## 🐛 Troubleshooting

### Las variables no se cargan

1. **Asegúrate que comienzan con `VITE_`**
   ```env
   ✅ VITE_API_BASE_URL=http://...
   ❌ API_BASE_URL=http://...
   ```

2. **Reinicia el servidor de desarrollo**
   ```bash
   # Ctrl+C para detener
   npm run dev
   ```

3. **Verifica que el archivo existe**
   ```bash
   ls -la .env*
   ```

### Variables undefined en producción

Las variables se "baken" en tiempo de build. Si cambias variables de entorno en el servidor, necesitas rebuil dear:

```bash
npm run build
```

## 📚 Referencias

- [Vite Environment Variables](https://vite.dev/guide/env-and-mode.html)
- [Vite Config Reference](https://vite.dev/config/)
