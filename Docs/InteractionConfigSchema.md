# Esquema de Configuración de Interacciones

## Estructura JSON para ConfiguracionUi

El campo `ConfiguracionUi` en la tabla `EsquemasPersonalizados` para entidades de tipo `Interaccion` soporta la siguiente estructura:

```json
{
  "productosPromocionados": {
    "habilitado": true,
    "minCantidad": 2,
    "maxCantidad": 10,
    "requerido": true,
    "label": "Productos Promocionados",
    "helpText": "Ingrese los productos que fueron promocionados durante la visita"
  },
  "muestrasEntregadas": {
    "habilitado": true,
    "requerido": false,
    "label": "Muestras/Materiales Entregados",
    "helpText": "Registre las muestras médicas o materiales entregados"
  },
  "pedidoProductos": {
    "habilitado": true,
    "requerido": false,
    "label": "Pedido de Productos",
    "helpText": "Permite registrar pedidos de productos durante la visita"
  },
  "layout": {
    "showProductosPromovidos": true,
    "showMuestrasEntregadas": true,
    "showPedidoProductos": true,
    "seccionOrden": ["productosPromocionados", "muestrasEntregadas", "pedidoProductos"]
  }
}
```

## Descripción de Campos

### productosPromocionados
- **habilitado**: `boolean` - Indica si esta interacción permite informar productos promocionados
- **minCantidad**: `number` - Cantidad mínima requerida de productos a promocionar
- **maxCantidad**: `number` - Cantidad máxima aceptable de productos a promocionar
- **requerido**: `boolean` - Si es obligatorio informar productos promocionados
- **label**: `string` - Etiqueta a mostrar en el formulario
- **helpText**: `string` - Texto de ayuda para el usuario

### muestrasEntregadas
- **habilitado**: `boolean` - Indica si esta interacción permite informar muestras/materiales entregados
- **requerido**: `boolean` - Si es obligatorio informar muestras entregadas
- **label**: `string` - Etiqueta a mostrar en el formulario
- **helpText**: `string` - Texto de ayuda para el usuario

### pedidoProductos
- **habilitado**: `boolean` - Indica si esta interacción permite tomar pedidos de productos
- **requerido**: `boolean` - Si es obligatorio tomar un pedido
- **label**: `string` - Etiqueta a mostrar en el formulario
- **helpText**: `string` - Texto de ayuda para el usuario

### layout
- **showProductosPromovidos**: `boolean` - Mostrar sección de productos promocionados
- **showMuestrasEntregadas**: `boolean` - Mostrar sección de muestras entregadas
- **showPedidoProductos**: `boolean` - Mostrar sección de pedidos
- **seccionOrden**: `string[]` - Orden de las secciones en el formulario

## Ejemplo de Uso

### Visita Médica Estándar
```json
{
  "productosPromocionados": {
    "habilitado": true,
    "minCantidad": 1,
    "maxCantidad": 5,
    "requerido": true,
    "label": "Productos Promocionados",
    "helpText": "Mínimo 1 producto, máximo 5 productos"
  },
  "muestrasEntregadas": {
    "habilitado": true,
    "requerido": false,
    "label": "Muestras Médicas Entregadas"
  },
  "pedidoProductos": {
    "habilitado": false
  }
}
```

### Visita de Auditoria
```json
{
  "productosPromocionados": {
    "habilitado": false
  },
  "muestrasEntregadas": {
    "habilitado": false
  },
  "pedidoProductos": {
    "habilitado": false
  }
}
```

### Visita Comercial con Pedidos
```json
{
  "productosPromocionados": {
    "habilitado": true,
    "minCantidad": 1,
    "maxCantidad": 10,
    "requerido": false
  },
  "muestrasEntregadas": {
    "habilitado": true,
    "requerido": false
  },
  "pedidoProductos": {
    "habilitado": true,
    "requerido": true,
    "label": "Pedido del Cliente",
    "helpText": "Registre el pedido del cliente"
  }
}
```

## Integración con el Formulario de Interacciones

El componente `InteractionDynamicEntityPage` lee la configuración desde `esquema.configuracionUi` y:

1. Muestra/oculta secciones según `habilitado`
2. Aplica validaciones de cantidad mínima/máxima para productos promocionados
3. Marca campos como requeridos según la configuración
4. Renderiza las secciones en el orden especificado

## Almacenamiento de Datos

Los datos capturados se almacenan en:

- **Productos Promocionados**: Array en campo dinámico `productosPromocionados` de EntidadesDinamica
- **Muestras Entregadas**: Tabla `MuestrasMedicas` con FK a `InteraccionId`
- **Pedidos**: Tabla `PedidosProductos` (a crear) con FK a `InteraccionId`
