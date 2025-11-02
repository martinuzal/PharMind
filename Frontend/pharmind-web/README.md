# PharMind - Frontend

Sistema de gestión farmacéutica desarrollado con React + TypeScript + Vite.

## Tecnologías

- **React** 18.3.1
- **TypeScript** 5.6.2
- **Vite** 7.1.12
- **React Router DOM** 7.0.2
- **Axios** 1.7.9
- **Material Icons** (Google Fonts)

## Instalación

```bash
cd C:\Works\PharMind\Frontend\pharmind-web
npm install
```

## Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en: http://localhost:5173

## Compilación

```bash
npm run build
```

Los archivos compilados se generarán en la carpeta `dist/`.

## Estructura del Proyecto

```
src/
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx          # Sidebar con menú navegación
│   │   └── Sidebar.css
│   ├── common/
│   │   └── Logo.tsx              # Logo animado de PharMind
│   └── notifications/
│       ├── NotificationCenter.tsx # Sistema de notificaciones toast
│       └── NotificationCenter.css
├── contexts/
│   ├── AuthContext.tsx           # Gestión de autenticación JWT
│   ├── PreferencesContext.tsx    # Preferencias (tema, sidebar)
│   └── NotificationContext.tsx   # Sistema de notificaciones
├── pages/
│   ├── auth/
│   │   └── LoginPage.tsx         # Página de login
│   ├── usuarios/
│   │   └── UsuariosPage.tsx      # Gestión de usuarios
│   ├── roles/
│   │   └── RolesPage.tsx         # Gestión de roles
│   └── DashboardPage.tsx         # Dashboard principal
├── services/
│   ├── api.ts                    # Configuración Axios + interceptors
│   └── authService.ts            # Servicios de autenticación
├── types/
│   ├── auth.ts                   # Tipos de autenticación
│   └── common.ts                 # Tipos comunes
└── styles/
    ├── App.css                   # Estilos principales
    ├── dark-mode.css             # Estilos modo oscuro
    └── Login.css                 # Estilos de login
```

## Características

### Sistema de Autenticación
- Login con email y password
- JWT guardado en localStorage
- Rutas protegidas
- Interceptor de Axios para agregar token automáticamente
- Redirección automática si no está autenticado

### Tema Claro/Oscuro
- Toggle en sidebar
- Persistencia en localStorage
- Variables CSS customizables
- Transiciones suaves

### Sistema de Notificaciones
- Toast notifications en esquina superior derecha
- 4 tipos: success, error, warning, info
- Auto-dismiss después de 5 segundos
- Persistencia en localStorage

### Sidebar
- Colapsable
- Menú de navegación con Material Icons
- Indicador de ruta activa
- Usuario actual
- Toggle de tema
- Logout

## Configuración

### API Backend
El frontend está configurado para conectarse a:
```
http://localhost:5285
```

Para cambiar la URL del API, editar: `src/services/api.ts`

### Endpoints utilizados
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/me` - Obtener usuario actual

## Páginas Implementadas

### Login (`/login`)
- Formulario con validación
- Manejo de errores
- Loading state
- Diseño responsive

### Dashboard (`/dashboard`)
- Página de bienvenida
- Estadísticas básicas
- Cards informativos

### Usuarios (`/usuarios`)
- Estructura básica
- Listo para implementar CRUD

### Roles (`/roles`)
- Estructura básica
- Listo para implementar CRUD

## Contextos Globales

### AuthContext
```typescript
const { user, isAuthenticated, isLoading, login, logout } = useAuth();
```

### PreferencesContext
```typescript
const { theme, sidebarCollapsed, toggleTheme, toggleSidebar } = usePreferences();
```

### NotificationContext
```typescript
const { notifications, unreadCount, addNotification, markAsRead, clearAll } = useNotifications();
```

## Uso de Notificaciones

```typescript
import { useNotifications } from './contexts/NotificationContext';

const { addNotification } = useNotifications();

addNotification({
  title: 'Éxito',
  message: 'Operación completada',
  type: 'success',
  category: 'usuarios'
});
```

## Estilos

El proyecto utiliza variables CSS para facilitar la personalización:

- `--bg-primary`: Fondo principal
- `--bg-secondary`: Fondo secundario (cards)
- `--text-primary`: Texto principal
- `--text-secondary`: Texto secundario
- `--accent-color`: Color de acento
- `--border-color`: Color de bordes

Más variables disponibles en `src/styles/App.css`

## Scripts Disponibles

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Compilar para producción
- `npm run preview` - Preview de la compilación

## Próximos Pasos

1. Implementar CRUD completo de Usuarios
2. Implementar CRUD completo de Roles
3. Implementar módulo de Empresas
4. Agregar paginación a las listas
5. Agregar filtros y búsqueda
6. Implementar gestión de permisos
7. Agregar tests unitarios

## Licencia

PharMind © 2025
