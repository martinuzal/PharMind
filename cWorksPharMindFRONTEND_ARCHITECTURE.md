# PharMind Web Frontend Architecture Analysis

Complete architectural analysis for implementing new modules.
See separate documentation files for complete code examples.

## QUICK REFERENCE

### Service Layer
- Location: `src/services/{module}.service.ts`
- Pattern: Export named const `{module}Service` with CRUD methods
- Base URL: `http://localhost:5209/api`
- Auth: JWT Bearer token from localStorage automatically added
- Error handling: Centralized via errorHandler.service.ts

### Page Components
- Location: `src/pages/{section}/{Module}Page.tsx`
- Pattern: Functional component with useState hooks for state management
- State: Items, Loading, Modal (show/mode/selected), Pagination, Filters, Form
- CSS: Reuse CRMPages.css or create section-specific CSS

### Routing
- Pattern: `/section/module` (e.g., `/gestion/productos`)
- Protection: ProtectedRoute wrapper checks authentication
- Layout: AppLayout includes Sidebar and Toolbar

### Navigation
- Add to gestionMenuItems array in Sidebar.tsx
- Use descriptive Material Icons (shopping_cart, inventory_2, calendar_month)
- Automatic permission checking via isModuloPermitido()

### Styling
- CSS Variables: --bg-primary, --text-primary, --accent-color, etc.
- Naming: BEM pattern (.btn-primary, .badge-success, .btn-icon-edit)
- Responsive: Media queries for 1024px, 768px, 480px breakpoints

### Types
- Entity interface: Full data structure with id, timestamps
- Create/Update DTOs: Separate interfaces for requests
- ListResponse: Pagination metadata + items array

