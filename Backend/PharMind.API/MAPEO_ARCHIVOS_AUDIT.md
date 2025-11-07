# Mapeo de Archivos TXT a Tablas SQL - Auditoría de Prescripciones

## Formato General
- **Delimitador**: `|` (pipe)
- **Primera línea**: Header con nombres de columnas
- **Encoding**: UTF-8 o Latin1 (detección automática)
- **Líneas siguientes**: Datos

---

## 1. 01_BEB_MERCADOS.TXT → auditMercados

### Headers esperados en el TXT:
```
CdgUsuario|CdgPais|CdgMercado|Descripcion|Closeup|Audit|Feedback|Recetario|Generado|Controlado|Abreviatura|CdgLabora|Edicion|FechaHoraProc|Path
```

### Campos en SQL:
| Campo SQL | Tipo | Nullable | Descripción |
|-----------|------|----------|-------------|
| Id | INT IDENTITY | No | PK auto-incremental |
| CdgUsuario | NVARCHAR(50) | Sí | Código de usuario |
| CdgPais | NVARCHAR(10) | Sí | Código de país |
| CdgMercado | NVARCHAR(50) | Sí | Código de mercado |
| Descripcion | NVARCHAR(500) | Sí | Descripción del mercado |
| Closeup | NVARCHAR(1) | Sí | Flag (S/N) |
| Audit | NVARCHAR(1) | Sí | Flag (S/N) |
| Feedback | NVARCHAR(1) | Sí | Flag (S/N) |
| Recetario | NVARCHAR(1) | Sí | Flag (S/N) |
| Generado | NVARCHAR(1) | Sí | Flag (S/N) |
| Controlado | NVARCHAR(1) | Sí | Flag (S/N) |
| Abreviatura | NVARCHAR(50) | Sí | Abreviatura |
| CdgLabora | NVARCHAR(50) | Sí | Código laboratorio |
| Edicion | NVARCHAR(20) | Sí | Edición |
| FechaHoraProc | NVARCHAR(50) | Sí | Fecha procesamiento |
| Path | NVARCHAR(500) | Sí | Ruta archivo |

**✅ Estado**: Mapeo completo implementado

---

## 2. AUDIT_CATEGORY.TXT → auditCategory

### Headers esperados en el TXT:
```
CdgUsuario|CdgPais|CdgCategoria|Descripcion|Abreviatura|Edicion|FechaHoraProc|Path
```

### Campos en SQL:
| Campo SQL | Tipo | Nullable | Descripción |
|-----------|------|----------|-------------|
| Id | INT IDENTITY | No | PK auto-incremental |
| CdgUsuario | NVARCHAR(50) | Sí | Código de usuario |
| CdgPais | NVARCHAR(10) | Sí | Código de país |
| CdgCategoria | NVARCHAR(50) | Sí | Código de categoría |
| Descripcion | NVARCHAR(500) | Sí | Descripción |
| Abreviatura | NVARCHAR(50) | Sí | Abreviatura |
| Edicion | NVARCHAR(20) | Sí | Edición |
| FechaHoraProc | NVARCHAR(50) | Sí | Fecha procesamiento |
| Path | NVARCHAR(500) | Sí | Ruta archivo |
| RawData | NVARCHAR(1000) | Sí | Backup línea completa |

**✅ Estado**: Mapeo dinámico implementado (8 campos mapeados)

---

## 3. AUDIT_CUSTOMER.TXT → auditCustomer

### Headers esperados en el TXT:
```
CdgUsuario|CdgPais|CdgCliente|NombreCliente|Direccion|Ciudad|Provincia|CodigoPostal|Telefono|Email|Edicion|FechaHoraProc|Path
```

### Campos en SQL:
| Campo SQL | Tipo | Nullable | Descripción |
|-----------|------|----------|-------------|
| Id | INT IDENTITY | No | PK auto-incremental |
| CdgUsuario | NVARCHAR(50) | Sí | Código de usuario |
| CdgPais | NVARCHAR(10) | Sí | Código de país |
| CdgCliente | NVARCHAR(50) | Sí | Código cliente |
| NombreCliente | NVARCHAR(500) | Sí | Nombre del cliente |
| Direccion | NVARCHAR(500) | Sí | Dirección |
| Ciudad | NVARCHAR(200) | Sí | Ciudad |
| Provincia | NVARCHAR(200) | Sí | Provincia |
| CodigoPostal | NVARCHAR(20) | Sí | Código postal |
| Telefono | NVARCHAR(50) | Sí | Teléfono |
| Email | NVARCHAR(200) | Sí | Email |
| Edicion | NVARCHAR(20) | Sí | Edición |
| FechaHoraProc | NVARCHAR(50) | Sí | Fecha procesamiento |
| Path | NVARCHAR(500) | Sí | Ruta archivo |
| RawData | NVARCHAR(1000) | Sí | Backup línea completa |

**✅ Estado**: Mapeo dinámico implementado (13 campos mapeados) + Modelo C# corregido

---

## 4. AUDIT_PERIOD.TXT → auditPeriod

### Headers esperados en el TXT:
```
CdgUsuario|CdgPais|CdgPeriodo|Descripcion|FechaInicio|FechaFin|Edicion|FechaHoraProc|Path
```

### Campos en SQL:
| Campo SQL | Tipo | Nullable | Descripción |
|-----------|------|----------|-------------|
| Id | INT IDENTITY | No | PK auto-incremental |
| CdgUsuario | NVARCHAR(50) | Sí | Código de usuario |
| CdgPais | NVARCHAR(10) | Sí | Código de país |
| CdgPeriodo | NVARCHAR(50) | Sí | Código período |
| Descripcion | NVARCHAR(500) | Sí | Descripción |
| FechaInicio | DATETIME | Sí | Fecha inicio |
| FechaFin | DATETIME | Sí | Fecha fin |
| Edicion | NVARCHAR(20) | Sí | Edición |
| FechaHoraProc | NVARCHAR(50) | Sí | Fecha procesamiento |
| Path | NVARCHAR(500) | Sí | Ruta archivo |
| RawData | NVARCHAR(1000) | Sí | Backup línea completa |

**✅ Estado**: Mapeo dinámico implementado (9 campos mapeados) + parseo DateTime con TryParse

---

## 5. AUDIT_PRODUCT_CLASS.TXT → audotProductClass

### Headers esperados en el TXT:
```
CdgUsuario|CdgPais|CdgClaseProducto|Descripcion|Abreviatura|Edicion|FechaHoraProc|Path
```

### Campos en SQL:
| Campo SQL | Tipo | Nullable | Descripción |
|-----------|------|----------|-------------|
| Id | INT IDENTITY | No | PK auto-incremental |
| CdgUsuario | NVARCHAR(50) | Sí | Código de usuario |
| CdgPais | NVARCHAR(10) | Sí | Código de país |
| CdgClaseProducto | NVARCHAR(50) | Sí | Código clase producto |
| Descripcion | NVARCHAR(500) | Sí | Descripción |
| Abreviatura | NVARCHAR(50) | Sí | Abreviatura |
| Edicion | NVARCHAR(20) | Sí | Edición |
| FechaHoraProc | NVARCHAR(50) | Sí | Fecha procesamiento |
| Path | NVARCHAR(500) | Sí | Ruta archivo |
| RawData | NVARCHAR(1000) | Sí | Backup línea completa |

**✅ Estado**: Mapeo dinámico implementado (8 campos mapeados)

---

## 6. MARKET_01_MARCAS.TXT → auditMarketMarcas

### Headers esperados en el TXT:
```
CdgUsuario|CdgPais|CdgMarca|NombreMarca|CdgLaboratorio|NombreLaboratorio|Edicion|FechaHoraProc|Path
```

### Campos en SQL:
| Campo SQL | Tipo | Nullable | Descripción |
|-----------|------|----------|-------------|
| Id | INT IDENTITY | No | PK auto-incremental |
| CdgUsuario | NVARCHAR(50) | Sí | Código de usuario |
| CdgPais | NVARCHAR(10) | Sí | Código de país |
| CdgMarca | NVARCHAR(50) | Sí | Código marca |
| NombreMarca | NVARCHAR(500) | Sí | Nombre marca |
| CdgLaboratorio | NVARCHAR(50) | Sí | Código laboratorio |
| NombreLaboratorio | NVARCHAR(500) | Sí | Nombre laboratorio |
| Edicion | NVARCHAR(20) | Sí | Edición |
| FechaHoraProc | NVARCHAR(50) | Sí | Fecha procesamiento |
| Path | NVARCHAR(500) | Sí | Ruta archivo |
| RawData | NVARCHAR(1000) | Sí | Backup línea completa |

**✅ Estado**: Mapeo dinámico implementado (9 campos mapeados)

---

## Notas Técnicas

### Mapeo Dinámico ✅ IMPLEMENTADO
El código implementado:
1. Lee la primera línea como header
2. Split por `|` y convierte nombres a mayúsculas para comparación case-insensitive
3. Para cada línea de datos, mapea cada campo por nombre de columna usando switch/case
4. Guarda línea completa en `RawData` para debugging
5. Utiliza `Math.Min(headers.Length, fields.Length)` para evitar excepciones por índice

### Transformaciones Especiales ✅ IMPLEMENTADO
- **Fechas**: Campos `FechaInicio` y `FechaFin` usan `DateTime.TryParse()` para conversión segura
- **Flags**: Campos de 1 carácter se guardan como string (S/N)
- **Trim**: Todos los valores hacen `.Trim()` antes de asignar
- **Valores vacíos**: Se valida `string.IsNullOrWhiteSpace()` y se omiten

### Validaciones ✅ IMPLEMENTADO
- Verifica que archivo tenga al menos 2 líneas (header + datos)
- Loguea errores por línea sin detener el proceso completo (try/catch por línea)
- Cuenta registros exitosos vs errores en `ProcessResult`
- Logging detallado en cada etapa del proceso

---

## Resumen de Implementación

**Fecha de actualización**: 2025-11-06

### Archivos modificados:
1. **AuditoriaPrescripcionesService.cs** - 5 métodos actualizados con mapeo dinámico:
   - `ProcessCategoriasAsync` (8 campos)
   - `ProcessClientesAsync` (13 campos)
   - `ProcessPeriodosAsync` (9 campos con parseo DateTime)
   - `ProcessClasesProductoAsync` (8 campos)
   - `ProcessMarcasAsync` (9 campos)

2. **AuditCustomer.cs** - Modelo corregido:
   - Agregados campos: `Provincia`, `CodigoPostal`, `Email`

### Estado final:
✅ 6/6 archivos TXT con mapeo completo implementado
✅ Modelos C# alineados con estructura SQL
✅ Parseo de fechas implementado con `DateTime.TryParse()`
✅ Manejo de errores robusto por línea
✅ Logging detallado en cada etapa
