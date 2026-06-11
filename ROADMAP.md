# FeDe Gastro Pro — Roadmap

## Versiones publicadas

| Versión | Nombre | Estado |
|---------|--------|--------|
| v1–v9 | Fundamentos operativos | ✅ Producción |
| v10.x | Pack Factors + Unidades | ✅ Producción |
| v11.x | Rediseño FeDe v2 + Multi-hoja | ✅ Producción |
| v12.0.0 | Smart Replenishment + ABC Híbrido | ✅ Producción |
| v12.0.1 | Hotfix abcOverrides ReferenceError | ✅ Producción |
| v13.0.0 | Módulo de Producción | ✅ Producción |

---

## v13.0.0 — Módulo de Producción (completado)

- Recetarios: CRUD de recetas con ingredientes, rinde y autocomplete de productos
- Motor de viabilidad: `calcViabilidad()` + `resolveIngredientStock()` con conversión de unidades
- Plan Diario: chef arma el plan al inicio de jornada (mutable, sin impacto en stock)
- Ejecución: confirmar quién hizo qué + descuento automático de stock via `mode: 'produccion'` en History
- Equipo de Cocina: CRUD de trabajadores en Ajustes, multi-select en ejecución
- Vista Por Persona y Historial de producción
- Alertas de stock insuficiente en Plan y en Home
- Badge en Action Grid ("N/M listos")
- Snapshot offline incluye recetas, workers y plan_diario

---

## Próximas versiones

### v14.0.0 — Proveedores y Compras

- **Ficha de proveedor**: nombre, contacto, días de entrega, productos asociados
- **Pedido a proveedor**: generar pedido en PDF/WhatsApp desde la pantalla de Pedido
- **Historial de compras**: registrar precio de última compra por producto
- **Variación de precios**: alerta cuando el precio sube más de X%
- **Lead time**: días promedio de entrega por proveedor → ajusta stock de seguridad en SR

### v14.1.0 — Costos y Márgenes

- **Costo de receta**: calcular costo total de ingredientes por unidad producida
- **Precio de venta**: registrar PVP por plato
- **Margen bruto**: automático al tener costo + PVP
- **Impacto en margen por merma**: cuánto cuesta la merma en pesos
- **Dashboard de costos**: gráfico de los 10 ingredientes más costosos

### v15.0.0 — Planificación Semanal

- **Vista semanal**: calendario de producción para los próximos 7 días
- **Proyección de stock**: dado el plan semanal, cuánto stock hace falta comprar
- **Lista de compras automática**: integra con Smart Replenishment + recetas planificadas
- **Template de semana**: guardar semanas tipo para re-usar

### v15.1.0 — Reportes y Analytics

- **Resumen diario/semanal/mensual**: merma, producción, stock bajo
- **Top 10 productos por merma**
- **Tendencia de consumo por producto**
- **Exportar a Google Sheets / PDF**

### Backlog (sin versión asignada)

- Notificaciones push (Service Worker) para alertas de stock crítico
- Multi-usuario: turnos con nombre de responsable en cada entrada
- Integración con balanza (Bluetooth) para registro automático de peso
- Modo sin conexión completo (Service Worker + sync queue)
- Soporte multi-local (varias sucursales en una cuenta)
