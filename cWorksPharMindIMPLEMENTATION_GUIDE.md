# Web Frontend Implementation Guide

## 1. SERVICE LAYER PATTERN

### Api Configuration
File: src/services/api.ts
- baseURL: http://localhost:5209/api
- Automatic JWT Bearer token injection from localStorage
- Response interceptor handles 401 (redirect to login) and network errors
- Error details logged to console with group formatting

### Service Structure Template
```typescript
// 1. Define interfaces
export interface Entity {
  id: string;
  codigo: string;
  nombre: string;
  activo: boolean;
  fechaCreacion: Date;
}

export interface CreateEntityDto {
  codigo: string;
  nombre: string;
  activo?: boolean;
}

export interface UpdateEntityDto {
  nombre: string;
  activo?: boolean;
}

export interface EntityListResponse {
  items: Entity[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

// 2. Export service object with CRUD methods
export const entityService = {
  getAll: async (params?) => Promise<EntityListResponse>,
  getById: async (id) => Promise<Entity>,
  create: async (data) => Promise<Entity>,
  update: async (id, data) => Promise<Entity>,
  delete: async (id) => Promise<void>
};
```

## 2. PAGE COMPONENT PATTERN

### State Management
```typescript
// Data
const [items, setItems] = useState<Entity[]>([]);
const [loading, setLoading] = useState(true);

// Modal
const [showModal, setShowModal] = useState(false);
const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
const [selectedItem, setSelectedItem] = useState<Entity | null>(null);

// Pagination
const [currentPage, setCurrentPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);
const [totalItems, setTotalItems] = useState(0);
const pageSize = 10;

// Filters
const [searchTerm, setSearchTerm] = useState('');
const [filtroStatus, setFiltroStatus] = useState('');

// Form
const [formData, setFormData] = useState<CreateEntityDto>({...});
```

### Key Functions
1. loadItems() - Fetch with filters and pagination
2. handleOpenModal() - Initialize form for create/edit
3. handleCloseModal() - Reset modal state
4. handleSubmit() - API call and notification
5. handleDelete() - Confirm and delete

### Component Lifecycle
- useEffect([currentPage, filters]) → loadItems()
- Service call → Update state → Show notification

## 3. STYLING CONVENTIONS

### CSS Variables (from :root)
- --bg-primary: #f8f9fa (page background)
- --bg-secondary: #ffffff (cards, modals)
- --bg-tertiary: #f3f4f6 (tables header)
- --text-primary: #202124 (main text)
- --text-secondary: #5f6368 (labels, hints)
- --accent-color: #3b82f6 (buttons, highlights)
- --color-success: #10b981
- --color-error: #ef4444
- --border-color: #e0e0e0

### Class Naming
- .page-container, .modal-content, .table-container
- .btn-primary, .btn-secondary, .btn-icon-edit, .btn-icon-delete
- .badge-success, .badge-error, .badge-activo, .badge-inactivo
- .form-control, .form-grid, .search-bar, .filters-section
- .pagination, .action-buttons, .loading-container

## 4. TYPES INTERFACES

### Entity Interface Pattern
```typescript
export interface Producto {
  id: string;                    // UUID
  codigo: string;                // Unique identifier
  nombre: string;                // Required field
  descripcion?: string;          // Optional field
  precio: number;                // Numeric value
  activo: boolean;               // Boolean status
  fechaCreacion: Date;           // Audit timestamp
  fechaModificacion?: Date;      // Optional timestamp
}
```

### DTO Pattern
- CreateXxxDto: Used for POST requests (may exclude id, timestamps)
- UpdateXxxDto: Used for PUT requests (typically same as Create or subset)
- Properties: mark optional with ? when not required in request

## 5. ROUTING STRUCTURE

### Route Patterns
/gestion/productos
/gestion/inventarios
/gestion/calendario
/crm/clientes
/analytics/...
/atlas/...

### Route Implementation
```typescript
<Route
  path="/gestion/productos"
  element={
    <ProtectedRoute>
      <AppLayout>
        <ProductosPage />
      </AppLayout>
    </ProtectedRoute>
  }
/>
```

## 6. NAVIGATION (SIDEBAR)

### Menu Items Template
```typescript
const gestionMenuItems: MenuItem[] = [
  {
    id: 'productos',
    label: 'Productos',
    icon: 'shopping_cart',
    path: '/gestion/productos'
  },
  {
    id: 'inventarios',
    label: 'Inventarios',
    icon: 'inventory_2',
    path: '/gestion/inventarios'
  },
  {
    id: 'calendario',
    label: 'Calendario',
    icon: 'calendar_month',
    path: '/gestion/calendario'
  }
];
```

### Material Icons Reference
shopping_cart - Products
inventory_2 - Inventory
calendar_month - Calendar
business_center - Management/Gestión
bar_chart - Analytics
assessment - Audits
group/people - Users

## IMPLEMENTATION CHECKLIST

For each new module (Productos, Inventarios, Calendario):

### 1. SERVICE (src/services/)
- [ ] Create {module}s.service.ts
- [ ] Define Entity interface
- [ ] Define Create/Update DTOs
- [ ] Define ListResponse interface
- [ ] Implement getAll, getById, create, update, delete
- [ ] Export as named const {module}Service

### 2. PAGE (src/pages/gestion/)
- [ ] Create {Module}Page.tsx
- [ ] Import service and hooks
- [ ] Define all state variables
- [ ] Implement loadItems with error handling
- [ ] Implement modal handlers
- [ ] Implement CRUD handlers
- [ ] Create JSX with filters, table, pagination, modal

### 3. STYLING (src/pages/gestion/)
- [ ] Use CRMPages.css or create specific CSS
- [ ] Reuse common classes from existing pages
- [ ] Follow naming conventions

### 4. ROUTING (src/App.tsx)
- [ ] Import component
- [ ] Add route with ProtectedRoute + AppLayout wrapper
- [ ] Path: /gestion/{module}

### 5. NAVIGATION (src/components/layout/Sidebar.tsx)
- [ ] Add MenuItem to gestionMenuItems array
- [ ] Set icon, label, and path
- [ ] No permission check needed for Gestión section

## EXISTING FILE REFERENCES

Services:
- c:\Works\PharMind\Frontend\pharmind-web\src\services\api.ts
- c:\Works\PharMind\Frontend\pharmind-web\src\services\clientes.service.ts
- c:\Works\PharMind\Frontend\pharmind-web\src\services\regiones.service.ts
- c:\Works\PharMind\Frontend\pharmind-web\src\services\errorHandler.service.ts

Pages:
- c:\Works\PharMind\Frontend\pharmind-web\src\pages\crm\ClientesPage.tsx
- c:\Works\PharMind\Frontend\pharmind-web\src\pages\gestion\RegionesPage.tsx

Styling:
- c:\Works\PharMind\Frontend\pharmind-web\src\styles\App.css
- c:\Works\PharMind\Frontend\pharmind-web\src\pages\crm\CRMPages.css

Routing:
- c:\Works\PharMind\Frontend\pharmind-web\src\App.tsx

Navigation:
- c:\Works\PharMind\Frontend\pharmind-web\src\components\layout\Sidebar.tsx

