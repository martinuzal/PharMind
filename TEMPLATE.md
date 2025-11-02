# 🎨 Template de Proyecto - NetOrder BackOffice

## 📋 Tabla de Contenidos
- [Descripción General](#descripción-general)
- [Stack Tecnológico](#stack-tecnológico)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Sistema de Gestión de Usuarios y Roles](#sistema-de-gestión-de-usuarios-y-roles)
- [Sistema de Estilos](#sistema-de-estilos)
- [Componentes Reutilizables](#componentes-reutilizables)
- [Patrones de Diseño](#patrones-de-diseño)
- [Guía de Implementación](#guía-de-implementación)

---

## 📝 Descripción General

Este template está basado en el proyecto NetOrder BackOffice y proporciona una estructura completa y lista para usar en nuevos proyectos de gestión administrativa.

### Características Principales:
- ✅ Sistema de autenticación multi-usuario (clientes, vendedores, admin)
- ✅ Tema claro/oscuro con persistencia
- ✅ Sistema de notificaciones contextual
- ✅ Sidebar colapsable con favoritos/pins
- ✅ Gestión de estado global con Context API
- ✅ Sistema CRUD genérico
- ✅ Backend con .NET 9 y Entity Framework Core
- ✅ Frontend con React + TypeScript + Vite

---

## 🛠️ Stack Tecnológico

### Frontend
- **Framework**: React 18.3.1
- **Lenguaje**: TypeScript 5.6.2
- **Build Tool**: Vite 7.1.12
- **Routing**: React Router DOM 7.0.2
- **HTTP Client**: Axios 1.7.9
- **Iconos**: Material Icons (via Google Fonts)

### Backend
- **Framework**: ASP.NET Core 9.0
- **ORM**: Entity Framework Core 9.0
- **Base de Datos**: SQL Server
- **Arquitectura**: API RESTful

---

## 📁 Estructura del Proyecto

\`\`\`
NetOrderBackOfficeAI/
├── Frontend/
│   ├── src/
│   │   ├── components/         # Componentes reutilizables
│   │   │   ├── layout/         # Layout (Sidebar, Header, etc)
│   │   │   ├── common/         # Componentes comunes (Logo, etc)
│   │   │   └── notifications/  # Sistema de notificaciones
│   │   ├── contexts/           # React Contexts (Estado global)
│   │   ├── pages/              # Páginas/vistas principales
│   │   ├── services/           # Servicios API
│   │   ├── types/              # TypeScript types e interfaces
│   │   ├── styles/             # Estilos globales
│   │   ├── App.tsx             # Componente raíz
│   │   ├── App.css             # Estilos principales
│   │   └── main.tsx            # Entry point
│   ├── public/                 # Archivos estáticos
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── Backend/
│   └── NetOrderBackOffice.API/
│       ├── Controllers/        # Controladores API
│       ├── Models/             # Modelos de entidad
│       ├── DTOs/               # Data Transfer Objects
│       ├── Data/               # DbContext y configuración
│       ├── Services/           # Lógica de negocio
│       ├── appsettings.json    # Configuración
│       └── Program.cs          # Entry point
│
└── Deploy/                     # Archivos de despliegue
    └── QA/
        ├── Frontend/
        └── Backend/
\`\`\`

---

## 👥 Sistema de Gestión de Usuarios y Roles

### Descripción General

El sistema implementa un modelo completo de gestión de usuarios con roles y permisos granulares por módulo. Soporta autenticación tradicional (email/password) y SSO (Single Sign-On) con proveedores externos como Google y Microsoft.

### Arquitectura del Sistema

El sistema se basa en 4 entidades principales:

1. **Usuarios**: Información de usuarios con soporte multi-empresa y SSO
2. **Roles**: Grupos de permisos que se asignan a usuarios
3. **Módulos**: Secciones funcionales del sistema
4. **RolModulo**: Permisos granulares de cada rol sobre cada módulo

### Modelos de Base de Datos

#### 1. Usuario

**Tabla**: `Usuarios`

\`\`\`csharp
public class Usuario
{
    public string Id { get; set; }
    public string EmpresaId { get; set; }
    public string Email { get; set; }
    public string? PasswordHash { get; set; }
    public string NombreCompleto { get; set; }
    public string? Telefono { get; set; }
    public string? Avatar { get; set; }
    public string? Cargo { get; set; }
    public string? Departamento { get; set; }
    public bool EmailVerificado { get; set; }
    public string? TokenVerificacion { get; set; }
    public string? TokenRecuperacion { get; set; }
    public DateTime? TokenRecuperacionExpira { get; set; }
    public string? ProveedorSSO { get; set; } // "Google", "Microsoft", null
    public string? SSOId { get; set; }
    public bool Activo { get; set; }
    public DateTime? UltimoAcceso { get; set; }
    public DateTime FechaCreacion { get; set; }
    public bool? Status { get; set; }
}
\`\`\`

**Características**:
- Soporte para autenticación tradicional y SSO
- Tokens de verificación y recuperación de contraseña
- Multi-empresa (cada usuario pertenece a una empresa)
- Campos de perfil profesional (cargo, departamento)
- Soft delete con campo `Status`

#### 2. Rol

**Tabla**: `Roles`

\`\`\`csharp
public class Rol : AuditableEntity
{
    public string EmpresaId { get; set; }
    public string Nombre { get; set; }
    public string? Descripcion { get; set; }
    public bool EsSistema { get; set; } // Roles del sistema no se pueden eliminar
    public bool Activo { get; set; }
}
\`\`\`

**Características**:
- Roles por empresa (aislamiento multi-tenant)
- Roles de sistema protegidos contra eliminación
- Hereda de `AuditableEntity` (auditoría completa)

#### 3. UsuarioRol

**Tabla**: `UsuarioRoles`

\`\`\`csharp
public class UsuarioRol : AuditableEntity
{
    public string UsuarioId { get; set; }
    public string RolId { get; set; }
    public DateTime FechaAsignacion { get; set; }
    public string? AsignadoPor { get; set; }
}
\`\`\`

**Características**:
- Relación muchos a muchos entre usuarios y roles
- Registro de quién asignó el rol y cuándo
- Un usuario puede tener múltiples roles

#### 4. RolModulo (Permisos)

**Tabla**: `RolModulos`

\`\`\`csharp
public class RolModulo : AuditableEntity
{
    public string RolId { get; set; }
    public string ModuloId { get; set; }
    public string NivelAcceso { get; set; } // "Lectura", "LecturaEscritura", "Administracion"
    public bool PuedeVer { get; set; }
    public bool PuedeCrear { get; set; }
    public bool PuedeEditar { get; set; }
    public bool PuedeEliminar { get; set; }
    public bool PuedeExportar { get; set; }
    public bool PuedeImportar { get; set; }
    public bool PuedeAprobar { get; set; }
}
\`\`\`

**Características**:
- Permisos granulares por acción (CRUD + operaciones especiales)
- Nivel de acceso como categoría general
- Permisos específicos: Ver, Crear, Editar, Eliminar, Exportar, Importar, Aprobar

### Tipos TypeScript (Frontend)

#### Usuario

\`\`\`typescript
export interface Usuario {
  id: string;
  email: string;
  nombreCompleto: string;
  empresaId: string;
  empresaNombre: string;
  activo: boolean;
  emailVerificado: boolean;
  proveedorSSO?: string;
  fechaCreacion: string;
  roles: string[];
}

export interface CreateUsuarioRequest {
  email: string;
  nombreCompleto: string;
  password: string;
  empresaId: string;
  roleIds: string[];
}

export interface UpdateUsuarioRequest {
  nombreCompleto: string;
  activo: boolean;
  roleIds: string[];
}

export interface ChangePasswordRequest {
  usuarioId: string;
  newPassword: string;
}
\`\`\`

#### Rol

\`\`\`typescript
export interface Rol {
  id: string;
  nombre: string;
  descripcion: string;
  empresaId: string;
  esSistema: boolean;
  activo: boolean;
  usuariosCount: number;
  permisos: PermisoModulo[];
}

export interface PermisoModulo {
  moduloId: string;
  moduloNombre: string;
  nivelAcceso: string;
  puedeVer: boolean;
  puedeCrear: boolean;
  puedeEditar: boolean;
  puedeEliminar: boolean;
  puedeExportar: boolean;
  puedeImportar: boolean;
  puedeAprobar: boolean;
}

export interface CreateRolRequest {
  nombre: string;
  descripcion: string;
  empresaId: string;
  permisos: CreatePermisoModuloRequest[];
}

export interface CreatePermisoModuloRequest {
  moduloId: string;
  nivelAcceso: string;
  puedeVer: boolean;
  puedeCrear: boolean;
  puedeEditar: boolean;
  puedeEliminar: boolean;
  puedeExportar: boolean;
  puedeImportar: boolean;
  puedeAprobar: boolean;
}

export interface UpdateRolRequest {
  nombre: string;
  descripcion: string;
  activo: boolean;
  permisos: CreatePermisoModuloRequest[];
}

export interface Modulo {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  ruta: string;
  orden: number;
  activo: boolean;
  moduloPadreId?: string;
  subModulos?: Modulo[];
}
\`\`\`

### Servicios (Frontend)

#### usuariosService.ts

\`\`\`typescript
import axios from 'axios';
import type { Usuario, CreateUsuarioRequest, UpdateUsuarioRequest } from '../types/usuarios';

const API_BASE_URL = 'http://localhost:5285/api';

export const usuariosService = {
  async getAll() {
    const response = await axios.get<Usuario[]>(\`\${API_BASE_URL}/usuarios\`);
    return response.data;
  },

  async getById(id: string) {
    const response = await axios.get<Usuario>(\`\${API_BASE_URL}/usuarios/\${id}\`);
    return response.data;
  },

  async create(data: CreateUsuarioRequest) {
    const response = await axios.post<Usuario>(\`\${API_BASE_URL}/usuarios\`, data);
    return response.data;
  },

  async update(id: string, data: UpdateUsuarioRequest) {
    const response = await axios.put<Usuario>(\`\${API_BASE_URL}/usuarios/\${id}\`, data);
    return response.data;
  },

  async delete(id: string) {
    await axios.delete(\`\${API_BASE_URL}/usuarios/\${id}\`);
  },

  async changePassword(usuarioId: string, newPassword: string) {
    await axios.post(\`\${API_BASE_URL}/usuarios/\${usuarioId}/change-password\`, {
      newPassword
    });
  }
};
\`\`\`

#### rolesService.ts

\`\`\`typescript
import axios from 'axios';
import type { Rol, CreateRolRequest, UpdateRolRequest, Modulo } from '../types/roles';

const API_BASE_URL = 'http://localhost:5285/api';

export const rolesService = {
  async getAll() {
    const response = await axios.get<Rol[]>(\`\${API_BASE_URL}/roles\`);
    return response.data;
  },

  async getById(id: string) {
    const response = await axios.get<Rol>(\`\${API_BASE_URL}/roles/\${id}\`);
    return response.data;
  },

  async create(data: CreateRolRequest) {
    const response = await axios.post<Rol>(\`\${API_BASE_URL}/roles\`, data);
    return response.data;
  },

  async update(id: string, data: UpdateRolRequest) {
    const response = await axios.put<Rol>(\`\${API_BASE_URL}/roles/\${id}\`, data);
    return response.data;
  },

  async delete(id: string) {
    await axios.delete(\`\${API_BASE_URL}/roles/\${id}\`);
  },

  async getModulos() {
    const response = await axios.get<Modulo[]>(\`\${API_BASE_URL}/modulos\`);
    return response.data;
  }
};
\`\`\`

### Controladores (Backend)

#### UsuariosController.cs

**Endpoints principales**:

\`\`\`csharp
[ApiController]
[Route("api/[controller]")]
public class UsuariosController : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<UsuarioDto>>> GetUsuarios()

    [HttpGet("{id}")]
    public async Task<ActionResult<UsuarioDto>> GetUsuario(string id)

    [HttpPost]
    public async Task<ActionResult<UsuarioDto>> CreateUsuario([FromBody] CreateUsuarioDto dto)

    [HttpPut("{id}")]
    public async Task<ActionResult<UsuarioDto>> UpdateUsuario(string id, [FromBody] UpdateUsuarioDto dto)

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUsuario(string id)

    [HttpPost("{id}/change-password")]
    public async Task<IActionResult> ChangePassword(string id, [FromBody] ChangePasswordDto dto)
}
\`\`\`

**Características**:
- Hash de contraseñas con BCrypt
- Validación de email único
- Soft delete (Status = true)
- Retorna usuarios con sus roles

#### RolesController.cs

**Endpoints principales**:

\`\`\`csharp
[ApiController]
[Route("api/[controller]")]
public class RolesController : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<RolDto>>> GetRoles()

    [HttpGet("{id}")]
    public async Task<ActionResult<RolDto>> GetRol(string id)

    [HttpPost]
    public async Task<ActionResult<RolDto>> CreateRol([FromBody] CreateRolDto dto)

    [HttpPut("{id}")]
    public async Task<ActionResult<RolDto>> UpdateRol(string id, [FromBody] UpdateRolDto dto)

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteRol(string id)
}
\`\`\`

**Características**:
- Protección de roles de sistema (no se pueden eliminar)
- Gestión de permisos por módulo
- Retorna cantidad de usuarios asignados
- Soft delete para roles no sistema

### Flujo de Trabajo

#### 1. Crear un Usuario

**Frontend**:
1. Usuario completa formulario con email, nombre, contraseña y selecciona roles
2. Se valida el formato de email y longitud de contraseña
3. Se envía `CreateUsuarioRequest` al backend

**Backend**:
1. Valida que el email no exista
2. Hashea la contraseña con BCrypt
3. Crea el usuario en la tabla `Usuarios`
4. Asigna los roles en la tabla `UsuarioRoles`
5. Retorna el usuario creado con sus roles

#### 2. Crear un Rol

**Frontend**:
1. Usuario ingresa nombre y descripción del rol
2. Selecciona módulos y marca permisos específicos para cada uno
3. Se envía `CreateRolRequest` con array de permisos

**Backend**:
1. Crea el rol en la tabla `Roles`
2. Crea los permisos en la tabla `RolModulos`
3. Retorna el rol creado con sus permisos

#### 3. Asignar Permisos a un Rol

**Frontend**:
1. Formulario muestra todos los módulos disponibles
2. Para cada módulo se pueden marcar:
   - Nivel de acceso (Lectura, LecturaEscritura, Administración)
   - Permisos específicos: Ver, Crear, Editar, Eliminar, Exportar, Importar, Aprobar

**Backend**:
1. Al actualizar un rol, se eliminan los permisos existentes
2. Se crean los nuevos permisos según la selección
3. Se mantiene auditoría de cambios

### Niveles de Acceso

El sistema define 3 niveles de acceso predefinidos:

1. **Lectura**: Solo puede ver información
   - PuedeVer: true
   - Resto: false

2. **LecturaEscritura**: Puede ver y modificar
   - PuedeVer: true
   - PuedeCrear: true
   - PuedeEditar: true
   - PuedeEliminar: false

3. **Administración**: Control total
   - Todos los permisos: true

### Consideraciones de Seguridad

1. **Contraseñas**:
   - Hash con BCrypt (factor de trabajo: 11)
   - Nunca se retornan en las APIs
   - Cambio de contraseña en endpoint separado

2. **Multi-Tenant**:
   - Usuarios y roles están aislados por empresa
   - Validación de EmpresaId en todas las operaciones

3. **Roles de Sistema**:
   - Roles marcados como `EsSistema = true` no se pueden eliminar
   - Útil para roles predefinidos como "Administrador"

4. **Auditoría**:
   - Todas las entidades heredan de `AuditableEntity`
   - Se registra: quién creó, cuándo, quién modificó, cuándo

5. **Soft Delete**:
   - Los usuarios se marcan como inactivos, no se eliminan físicamente
   - Permite mantener integridad referencial y auditoría

### Interfaz de Usuario

#### Página de Usuarios

**Características**:
- Lista de usuarios con filtros por empresa y estado
- Búsqueda por nombre o email
- Indicadores visuales:
  - Badge verde si está activo
  - Badge azul si email verificado
  - Badge naranja si es SSO
- Acciones: Editar, Cambiar contraseña, Eliminar

#### Página de Roles

**Características**:
- Lista de roles con cantidad de usuarios asignados
- Indicador de roles de sistema (protegidos)
- Vista expandible de permisos por módulo
- Matriz de permisos con checkboxes
- Acciones: Editar, Clonar, Eliminar (si no es sistema)

### Mejores Prácticas

1. **Crear Roles Primero**: Antes de usuarios, definir los roles necesarios
2. **Roles de Sistema**: Marcar roles críticos como sistema
3. **Permisos Granulares**: Usar los 7 tipos de permisos según necesidad
4. **Validación de Email**: Siempre validar unicidad de email
5. **Contraseñas Seguras**: Requerir mínimo 8 caracteres
6. **Multi-Empresa**: Siempre filtrar por EmpresaId
7. **Auditoría**: Revisar logs de cambios de permisos periódicamente

---

## 🎨 Sistema de Estilos

### Variables CSS Globales

El sistema utiliza CSS Custom Properties para temas consistentes:

#### Modo Claro
\`\`\`css
:root {
  --bg-primary: #f8f9fa;       /* Fondo principal de la app */
  --bg-secondary: #ffffff;      /* Fondo de tarjetas/contenedores */
  --bg-tertiary: #f3f4f6;       /* Fondo alternativo */
  --text-primary: #202124;      /* Texto principal */
  --text-secondary: #5f6368;    /* Texto secundario */
  --text-tertiary: #9ca3af;     /* Texto terciario/deshabilitado */
  --border-color: #e0e0e0;      /* Bordes */
  --border-color-light: #f1f3f4;/* Bordes suaves */
  --input-bg: #ffffff;          /* Fondo de inputs */
  --input-border: #ddd;         /* Borde de inputs */
  --hover-bg: #f1f3f4;          /* Fondo al hacer hover */
  --shadow-color: rgba(0, 0, 0, 0.1); /* Color de sombras */
  --accent-color: #3b82f6;      /* Color de acento (azul) */
}
\`\`\`

#### Modo Oscuro
\`\`\`css
[data-theme="dark"] {
  --bg-primary: #1a1a1a;
  --bg-secondary: #242424;
  --bg-tertiary: #2d2d2d;
  --text-primary: #e5e5e5;
  --text-secondary: #a0a0a0;
  --text-tertiary: #707070;
  --border-color: #3a3a3a;
  --border-color-light: #2d2d2d;
  --input-bg: #2d2d2d;
  --input-border: #3a3a3a;
  --hover-bg: #2d2d2d;
  --shadow-color: rgba(0, 0, 0, 0.3);
  --accent-color: #60a5fa;
}
\`\`\`

### Paleta de Colores Adicionales

\`\`\`css
/* Estados */
--color-success: #10b981;     /* Verde para éxito */
--color-error: #ef4444;       /* Rojo para errores */
--color-warning: #f59e0b;     /* Amarillo para advertencias */
--color-info: #3b82f6;        /* Azul para información */

/* Opacidades */
--opacity-disabled: 0.5;
--opacity-hover: 0.8;
\`\`\`

### Archivos de Estilos Globales

1. **App.css** - Estilos base y layout principal
2. **dark-mode.css** - Sobrescrituras específicas para modo oscuro
3. **index.css** - Reset y configuración inicial

---

## 🧩 Componentes Reutilizables

### 1. Sidebar (Layout)

**Ubicación**: `components/layout/Sidebar.tsx`

**Características**:
- Colapsable/expandible
- Sistema de menús jerárquicos (2 niveles)
- Selector de cliente con búsqueda
- Sistema de favoritos/pins con drag & drop
- Tema claro/oscuro toggle
- Persistencia en localStorage

**Props**:
\`\`\`typescript
// No recibe props, maneja su propio estado
\`\`\`

**Uso**:
\`\`\`tsx
import Sidebar from './components/layout/Sidebar';

function App() {
  return (
    <div className="app">
      <Sidebar />
      <div className="app-content">
        {/* Contenido */}
      </div>
    </div>
  );
}
\`\`\`

### 2. Sistema de Notificaciones

**Ubicación**: `components/notifications/NotificationCenter.tsx`

**Características**:
- Notificaciones toast en esquina superior derecha
- 4 tipos: success, error, warning, info
- Auto-dismiss configurable
- Categorización por módulo
- Filtros por tipo y categoría
- Panel lateral expandible
- Persistencia en localStorage

**Context API**:
\`\`\`typescript
// contexts/NotificationContext.tsx

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  category: string;
  timestamp: Date;
  read: boolean;
}

const {
  addNotification,
  notifications,
  unreadCount,
  markAsRead,
  clearAll
} = useNotifications();
\`\`\`

**Uso**:
\`\`\`tsx
import { useNotifications } from '../../contexts/NotificationContext';

function MiComponente() {
  const { addNotification } = useNotifications();

  const handleSuccess = () => {
    addNotification({
      title: 'Éxito',
      message: 'Operación completada exitosamente',
      type: 'success',
      category: 'pedidos'
    });
  };

  return <button onClick={handleSuccess}>Guardar</button>;
}
\`\`\`

### 3. Logo Animado

**Ubicación**: `components/common/Logo.tsx`

**Características**:
- SVG con gradiente animado
- Responsive
- Tamaños configurables
- Sin texto (ideal para cuando el sidebar está colapsado)

**Props**:
\`\`\`typescript
interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}
\`\`\`

### 4. Contextos Globales

#### PreferencesContext
**Ubicación**: `contexts/PreferencesContext.tsx`

\`\`\`typescript
interface PreferencesContextType {
  theme: 'light' | 'dark';
  sidebarCollapsed: boolean;
  toggleTheme: () => void;
  toggleSidebar: () => void;
}
\`\`\`

**Uso**:
\`\`\`tsx
const { theme, toggleTheme } = usePreferences();
\`\`\`

#### ClienteContext (si aplica)
**Ubicación**: `contexts/ClienteContext.tsx`

\`\`\`typescript
interface ClienteContextType {
  clienteActual: Cliente | null;
  setClienteActual: (cliente: Cliente | null) => void;
}
\`\`\`

---

## 📐 Patrones de Diseño

### 1. Estructura de Página Estándar

\`\`\`tsx
// pages/ejemplo/EjemploPage.tsx

import { useState } from 'react';
import './EjemploPage.css';

const EjemploPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState(undefined);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleNew = () => {
    setSelectedItem(undefined);
    setShowForm(true);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setShowForm(true);
  };

  const handleSuccess = () => {
    setShowForm(false);
    setSelectedItem(undefined);
    setRefreshKey(prev => prev + 1);
  };

  const handleCancel = () => {
    setShowForm(false);
    setSelectedItem(undefined);
  };

  const handleDelete = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="ejemplo-page">
      <div className="page-header">
        <div>
          <h1>Título de la Página</h1>
          <p className="page-description">Descripción breve</p>
        </div>
        <button className="btn-new" onClick={handleNew}>
          + Nuevo
        </button>
      </div>

      <div className="page-content">
        <ItemList
          key={refreshKey}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {showForm && (
        <ItemForm
          item={selectedItem}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

export default EjemploPage;
\`\`\`

### 2. Componente de Lista Estándar

\`\`\`tsx
// components/ejemplo/ItemList.tsx

interface ItemListProps {
  onEdit: (item: Item) => void;
  onDelete: () => void;
}

const ItemList = ({ onEdit, onDelete }: ItemListProps) => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    pageNumber: 1,
    pageSize: 20
  });

  useEffect(() => {
    loadItems();
  }, [filtros]);

  const loadItems = async () => {
    try {
      setLoading(true);
      const data = await itemService.getAll(filtros);
      setItems(data.items);
    } catch (error) {
      // Manejar error
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro?')) return;

    try {
      await itemService.delete(id);
      onDelete();
      loadItems();
    } catch (error) {
      // Manejar error
    }
  };

  if (loading) return <div className="loading">Cargando...</div>;

  return (
    <div className="item-list-container">
      {/* Filtros */}
      <div className="filters-section">
        {/* Controles de filtro */}
      </div>

      {/* Tabla */}
      <div className="item-table-wrapper">
        <table className="item-table">
          <thead>
            <tr>
              <th>Columna 1</th>
              <th>Columna 2</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.nombre}</td>
                <td>{item.valor}</td>
                <td>
                  <button onClick={() => onEdit(item)}>✏️</button>
                  <button onClick={() => handleDelete(item.id)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="pagination">
        {/* Controles de paginación */}
      </div>
    </div>
  );
};
\`\`\`

### 3. Componente de Formulario Estándar

\`\`\`tsx
// components/ejemplo/ItemForm.tsx

interface ItemFormProps {
  item?: Item;
  onSuccess: () => void;
  onCancel: () => void;
}

const ItemForm = ({ item, onSuccess, onCancel }: ItemFormProps) => {
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    campo1: '',
    campo2: ''
  });

  useEffect(() => {
    if (item) {
      setFormData({
        campo1: item.campo1,
        campo2: item.campo2
      });
    }
  }, [item]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      if (item) {
        await itemService.update(item.id, formData);
        addNotification({
          title: 'Éxito',
          message: 'Item actualizado',
          type: 'success',
          category: 'items'
        });
      } else {
        await itemService.create(formData);
        addNotification({
          title: 'Éxito',
          message: 'Item creado',
          type: 'success',
          category: 'items'
        });
      }

      onSuccess();
    } catch (error: any) {
      addNotification({
        title: 'Error',
        message: error.response?.data || 'Error al guardar',
        type: 'error',
        category: 'items'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="item-form-overlay">
      <div className="item-form-container">
        <div className="item-form-header">
          <h2>{item ? 'Editar' : 'Nuevo'} Item</h2>
          <button className="btn-close" onClick={onCancel}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="item-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Campo 1 <span className="required">*</span></label>
              <input
                type="text"
                name="campo1"
                value={formData.campo1}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Campo 2</label>
              <input
                type="text"
                name="campo2"
                value={formData.campo2}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={onCancel}
              className="btn-cancel"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={loading}
            >
              {loading ? 'Guardando...' : item ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
\`\`\`

### 4. Service Layer

\`\`\`typescript
// services/itemService.ts

import axios from 'axios';

const API_BASE_URL = 'http://localhost:5285/api';

const itemService = {
  async getAll(filtros: any) {
    const params = new URLSearchParams();
    Object.keys(filtros).forEach(key => {
      if (filtros[key]) params.append(key, filtros[key].toString());
    });

    const response = await axios.get(\`\${API_BASE_URL}/items?\${params}\`);
    return response.data;
  },

  async getById(id: string) {
    const response = await axios.get(\`\${API_BASE_URL}/items/\${id}\`);
    return response.data;
  },

  async create(data: any) {
    const response = await axios.post(\`\${API_BASE_URL}/items\`, data);
    return response.data;
  },

  async update(id: string, data: any) {
    const response = await axios.put(\`\${API_BASE_URL}/items/\${id}\`, data);
    return response.data;
  },

  async delete(id: string) {
    await axios.delete(\`\${API_BASE_URL}/items/\${id}\`);
  }
};

export default itemService;
\`\`\`

### 5. Backend Controller Estándar

\`\`\`csharp
// Controllers/ItemsController.cs

[ApiController]
[Route("api/[controller]")]
public class ItemsController : ControllerBase
{
    private readonly NetOrderDbContext _context;
    private readonly ILogger<ItemsController> _logger;

    public ItemsController(NetOrderDbContext context, ILogger<ItemsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<ItemListResponse>> GetItems(
        [FromQuery] string? buscar,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20)
    {
        try
        {
            var query = _context.Items
                .Where(i => i.Status == null || i.Status == false);

            if (!string.IsNullOrEmpty(buscar))
            {
                query = query.Where(i => i.Nombre.Contains(buscar));
            }

            var totalCount = await query.CountAsync();
            var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

            var items = await query
                .OrderBy(i => i.Nombre)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(i => new ItemDto
                {
                    Id = i.Id,
                    Nombre = i.Nombre
                })
                .ToListAsync();

            return Ok(new ItemListResponse
            {
                Items = items,
                TotalItems = totalCount,
                TotalPages = totalPages,
                CurrentPage = pageNumber
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener items");
            return StatusCode(500, "Error interno del servidor");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ItemDto>> GetItem(string id)
    {
        try
        {
            var item = await _context.Items
                .Where(i => i.Id == id && (i.Status == null || i.Status == false))
                .FirstOrDefaultAsync();

            if (item == null)
                return NotFound();

            return Ok(new ItemDto { Id = item.Id, Nombre = item.Nombre });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener item {Id}", id);
            return StatusCode(500, "Error interno del servidor");
        }
    }

    [HttpPost]
    public async Task<ActionResult<ItemDto>> CreateItem([FromBody] CreateItemDto dto)
    {
        try
        {
            var item = new Item
            {
                Id = Guid.NewGuid().ToString(),
                Nombre = dto.Nombre,
                Dates = DateTime.Now,
                Status = false
            };

            _context.Items.Add(item);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetItem), new { id = item.Id },
                new ItemDto { Id = item.Id, Nombre = item.Nombre });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al crear item");
            return StatusCode(500, "Error interno del servidor");
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ItemDto>> UpdateItem(string id, [FromBody] UpdateItemDto dto)
    {
        try
        {
            var item = await _context.Items.FindAsync(id);
            if (item == null)
                return NotFound();

            item.Nombre = dto.Nombre;
            await _context.SaveChangesAsync();

            return Ok(new ItemDto { Id = item.Id, Nombre = item.Nombre });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al actualizar item {Id}", id);
            return StatusCode(500, "Error interno del servidor");
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteItem(string id)
    {
        try
        {
            var item = await _context.Items.FindAsync(id);
            if (item == null)
                return NotFound();

            item.Status = true; // Soft delete
            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al eliminar item {Id}", id);
            return StatusCode(500, "Error interno del servidor");
        }
    }
}
\`\`\`

---

## 🚀 Guía de Implementación

### 1. Configuración Inicial

#### Frontend

\`\`\`bash
# Crear proyecto Vite + React + TypeScript
npm create vite@latest mi-proyecto -- --template react-ts
cd mi-proyecto
npm install

# Instalar dependencias
npm install react-router-dom axios

# Estructura de carpetas
mkdir -p src/{components/{layout,common,notifications},contexts,pages,services,types,styles}
\`\`\`

#### Backend

\`\`\`bash
# Crear proyecto .NET
dotnet new webapi -n MiProyecto.API
cd MiProyecto.API

# Instalar paquetes
dotnet add package Microsoft.EntityFrameworkCore.SqlServer
dotnet add package Microsoft.EntityFrameworkCore.Tools
\`\`\`

### 2. Copiar Archivos Base

#### Frontend
1. Copiar `App.css` y `dark-mode.css` a `src/styles/`
2. Copiar contextos: `PreferencesContext.tsx` y `NotificationContext.tsx`
3. Copiar componentes de layout: `Sidebar.tsx`, `Logo.tsx`, `NotificationCenter.tsx`
4. Actualizar `main.tsx` para incluir providers
5. Actualizar `App.tsx` con estructura base

#### Backend
1. Configurar `DbContext`
2. Configurar connection string en `appsettings.json`
3. Configurar CORS en `Program.cs`
4. Crear estructura de carpetas: `Models/`, `DTOs/`, `Controllers/`, `Services/`

### 3. Configuración de Vite

\`\`\`typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/_noFront/', // Ajustar según necesidad
  server: {
    port: 5173
  }
})
\`\`\`

### 4. Configuración de Backend

\`\`\`csharp
// Program.cs
var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// DbContext
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");
app.UseAuthorization();
app.MapControllers();

app.Run();
\`\`\`

### 5. Agregar Nuevo Módulo CRUD

#### Paso 1: Backend - Crear Modelo
\`\`\`csharp
// Models/MiEntidad.cs
[Table("MiEntidad")]
public class MiEntidad
{
    [Key]
    [Column("Id")]
    public string Id { get; set; } = string.Empty;

    [Column("Nombre")]
    [MaxLength(100)]
    public string Nombre { get; set; } = string.Empty;

    [Column("status")]
    public bool? Status { get; set; }

    [Column("dates")]
    public DateTime? Dates { get; set; }
}
\`\`\`

#### Paso 2: Backend - Crear DTOs
\`\`\`csharp
// DTOs/MiEntidadDTOs.cs
public class MiEntidadDto
{
    public string Id { get; set; }
    public string Nombre { get; set; }
}

public class CreateMiEntidadDto
{
    public string Nombre { get; set; }
}

public class UpdateMiEntidadDto
{
    public string Nombre { get; set; }
}
\`\`\`

#### Paso 3: Backend - Crear Controller
Usar el patrón de controller estándar mostrado arriba.

#### Paso 4: Frontend - Crear Types
\`\`\`typescript
// types/miEntidad.ts
export interface MiEntidad {
  id: string;
  nombre: string;
}

export interface CreateMiEntidadDto {
  nombre: string;
}

export interface UpdateMiEntidadDto {
  nombre: string;
}
\`\`\`

#### Paso 5: Frontend - Crear Service
Usar el patrón de service estándar mostrado arriba.

#### Paso 6: Frontend - Crear Componentes
1. Crear carpeta: `components/mi-entidad/`
2. Crear `MiEntidadList.tsx` y `.css`
3. Crear `MiEntidadForm.tsx` y `.css`

#### Paso 7: Frontend - Crear Page
1. Crear carpeta: `pages/mi-entidad/`
2. Crear `MiEntidadPage.tsx` y `.css`
3. Usar patrón de página estándar

#### Paso 8: Frontend - Agregar Route
\`\`\`tsx
// App.tsx
import MiEntidadPage from './pages/mi-entidad/MiEntidadPage';

// En Routes:
<Route path="/mi-entidad" element={<MiEntidadPage />} />
\`\`\`

#### Paso 9: Frontend - Agregar al Sidebar
\`\`\`tsx
// components/layout/Sidebar.tsx
const menuItems: MenuItem[] = [
  // ...otros items
  {
    id: 'mi-entidad',
    label: 'Mi Entidad',
    icon: 'folder', // Cambiar por icono apropiado
    path: '/mi-entidad'
  }
];
\`\`\`

### 6. Estilos CSS Estándar para Nuevos Módulos

#### Page CSS
\`\`\`css
.mi-entidad-page {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  gap: 1rem;
}

.page-header h1 {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  color: var(--text-primary);
}

.page-description {
  margin: 0;
  font-size: 1rem;
  color: var(--text-secondary);
}

.btn-new {
  padding: 0.75rem 1.5rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-new:hover {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.page-content {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
\`\`\`

#### List CSS
\`\`\`css
.item-list-container {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.filters-section {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.filter-group input {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.item-table-wrapper {
  overflow-x: auto;
}

.item-table {
  width: 100%;
  border-collapse: collapse;
}

.item-table thead {
  background: #f9fafb;
  border-bottom: 2px solid #e5e7eb;
}

.item-table th {
  padding: 0.75rem 1rem;
  text-align: left;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.item-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e5e7eb;
  font-size: 0.875rem;
  color: var(--text-primary);
}

.item-table tbody tr:hover {
  background: #f9fafb;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
}
\`\`\`

#### Form CSS
\`\`\`css
.item-form-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.item-form-container {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.item-form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.item-form-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--text-primary);
}

.btn-close {
  background: transparent;
  border: none;
  font-size: 2rem;
  color: #6b7280;
  cursor: pointer;
}

.item-form {
  padding: 1.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.required {
  color: #ef4444;
}

.form-group input,
.form-group textarea,
.form-group select {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.form-group input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.btn-cancel,
.btn-submit {
  padding: 0.625rem 1.25rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
}

.btn-cancel {
  background: #f3f4f6;
  color: #374151;
}

.btn-submit {
  background: #3b82f6;
  color: white;
}
\`\`\`

---

## 📚 Recursos Adicionales

### Iconos Material
\`\`\`html
<!-- En index.html -->
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
\`\`\`

**Uso**:
\`\`\`html
<span class="material-icons">favorite</span>
\`\`\`

**Iconos comunes**:
- `folder` - Carpeta
- `people` - Personas
- `shopping_cart` - Carrito
- `settings` - Configuración
- `dashboard` - Dashboard
- `edit` - Editar
- `delete` - Eliminar
- `add` - Agregar
- `search` - Buscar
- `close` - Cerrar

### Convenciones de Nomenclatura

#### Frontend
- **Componentes**: PascalCase (`MiComponente.tsx`)
- **Archivos CSS**: kebab-case (`mi-componente.css`)
- **Servicios**: camelCase (`miService.ts`)
- **Types**: PascalCase (`MiTipo.ts`)
- **Constantes**: UPPER_SNAKE_CASE (`MI_CONSTANTE`)

#### Backend
- **Controladores**: PascalCase + Controller (`MiController.cs`)
- **Modelos**: PascalCase (`MiEntidad.cs`)
- **DTOs**: PascalCase + Dto (`MiEntidadDto.cs`)
- **Servicios**: PascalCase + Service (`MiService.cs`)

### Comandos Útiles

#### Frontend
\`\`\`bash
npm run dev          # Modo desarrollo
npm run build        # Build producción
npm run preview      # Preview build
\`\`\`

#### Backend
\`\`\`bash
dotnet run                           # Ejecutar
dotnet build                         # Compilar
dotnet publish -c Release            # Publicar
dotnet ef migrations add MiMigracion # Crear migración
dotnet ef database update            # Actualizar DB
\`\`\`

---

## 📋 Checklist de Implementación

### Nuevo Proyecto
- [ ] Crear estructura de carpetas
- [ ] Copiar archivos de estilos base
- [ ] Configurar Vite
- [ ] Configurar Backend
- [ ] Copiar componentes base (Sidebar, Logo, NotificationCenter)
- [ ] Copiar contextos (Preferences, Notifications)
- [ ] Configurar DbContext
- [ ] Configurar CORS
- [ ] Probar conexión Frontend-Backend

### Nuevo Módulo CRUD
- [ ] Crear modelo en Backend
- [ ] Crear DTOs
- [ ] Crear Controller
- [ ] Agregar DbSet al DbContext
- [ ] Crear types en Frontend
- [ ] Crear service
- [ ] Crear componentes (List, Form)
- [ ] Crear page
- [ ] Agregar route en App.tsx
- [ ] Agregar item en Sidebar
- [ ] Aplicar estilos estándar
- [ ] Probar CRUD completo

---

## 🎯 Mejores Prácticas

1. **Usar variables CSS** para colores y espaciados
2. **Mantener consistencia** en nombres y estructura
3. **Reutilizar componentes** cuando sea posible
4. **Documentar código** complejo
5. **Manejo de errores** consistente
6. **Loading states** en todas las operaciones async
7. **Notificaciones** para feedback al usuario
8. **Validación** en frontend y backend
9. **Soft deletes** usando campo `status`
10. **Paginación** para listas grandes

---

## ✨ Créditos

Template basado en **NetOrder BackOffice**
Desarrollado para proyectos de gestión administrativa con .NET 9 + React + TypeScript

---

**Última actualización**: Octubre 2025
**Versión**: 1.0
