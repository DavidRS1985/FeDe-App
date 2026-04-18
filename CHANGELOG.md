# Registro de Actualizaciones (Changelog) - FeDe App

## [v10.0.0] - FOCACCIA Edition - 2026-04-18

### 🏠 Rediseño del Home — Centro de Control Operativo
- **Eliminación de "IA Sugiere":** Tarjeta eliminada por mal funcionamiento y lógica confusa.
- **Eliminación de "Inventario":** Tarjeta eliminada por redundancia con el Dashboard.
- **Nuevo: Centro de Alertas Operativas:** Tarjeta de ancho completo con cruce de datos real:
  - Control obligatorio de stock (domingos y martes).
  - Feriados próximos (próximos 7 días).
  - Días sin control de stock (alerta si ≥2 días).
  - Días sin pedido (alerta si ≥3 días).
  - Merma acumulada del día.
  - Estado "Operación al día" cuando no hay alertas.
- **Consolidación de notificaciones:** Campana (🔔) eliminada; alertas centralizadas en la tarjeta Home.

### 🟣 Nuevo Modo: Merma / Desperdicio
- **4to modo operativo** (`mode: 'merma'`) con tema violeta (`#8B5CF6`).
- **Botón dedicado en Home:** Rectangular horizontal de ancho completo con icono `trash-2`.
- **Motivo opcional:** Selector de motivo en el resumen (Vencimiento, Error elaboración, Rotura/Derrame, Excedente).
- **Integración total:** WhatsApp incluye motivo, historial muestra badge 🟣 MERMA con motivo, calendario del Dashboard muestra punto violeta.
- **Filtro en Historial:** Nuevo botón 🟣 MERMA en los filtros de modo.

### ⚡ Nuevo Loader de Carga (Orbital)
- **Rediseño completo del loader:** Anillo orbital con `conic-gradient` + porcentaje dinámico en tipografía Outfit Black.
- **Inercia de progreso:** Sistema inteligente que sube rápido al inicio y desacelera suavemente mientras espera al servidor.
- **Feedback de estado:** Mensajes dinámicos ("Iniciando sistema...", "Conectando con servidor...", "Sincronizado").
- **Cross-platform:** Compatible con Chrome, Safari (iOS), y Firefox vía `-webkit-mask`.

### 🐛 Correcciones
- **Bug doble clic en Inicio:** Eliminada lógica de breadcrumb en `goHome()` que forzaba segundo clic.
- **Lupa obsoleta en Historial:** Eliminado trigger de búsqueda del header cuando se navega al historial (ya tiene búsqueda embebida).
- **Timeout de seguridad:** Aumentado de 5s a 7s para conexiones lentas.

### 🎨 CSS & Estilos
- `body.theme-merma { --primary: var(--violet); }` para tema violeta.
- `.home-alerts-card` — estilos para la tarjeta de alertas.
- `.motivo-btn` — botones de selección de motivo de merma.
- `.loader-wrapper` / `.loader-circle` / `.loader-perc` — nuevo loader orbital.

## [v9.6.5] - CIABATTA REBAKED - 2026-04-13
### 🛠️ Refactorización de Compatibilidad Crítica
- **Soporte ES5 Total:** Se refactorizó todo el código JavaScript a ES5 para asegurar la compatibilidad con el motor de Google Apps Script y evitar cuelgues en la inicialización (loader infinito).
- **Seguridad en Carga:** Implementación de un "Security Timeout" de 5 segundos en el loader oficial.
- **Optimización Desktop:** Centrado automático y ancho óptimo (500px) para ergonomía en escritorio.
- **Limpieza de UI:** Eliminación de redundancia en barras de búsqueda y mejora en el ordenamiento del historial.

## [v9.2.0] - CIABATTA - 2026-04-10
4: 
5: ### 🍞 Nueva Serie: "Panes del Mundo"
6: - **Identidad Personalizable:** Se añadió la posibilidad de cambiar el Título y Subtítulo de la app desde Ajustes.
7: - **Versionamiento Temático:** Adopción de nombres de panes para cada versión (v9.2.0 = CIABATTA).
8: - **Consistencia:** Sincronización de variables de identidad en tiempo real con la nube.

## [v9.0.0] - 2026-04-10

### 🚀 Sincronización Global Cloud
- **Actualización de Versión:** Salto oficial a la versión 9.0.0.
- **Consistencia de UI:** Sincronización de todas las etiquetas de versión en el header, ajustes y logs de consola.
- **Deployment:** Preparación para despliegue unificado en Google Apps Script.

## [v8.7.6] - 2026-04-09

### 🛠️ Hotfix de Visibilidad y Búsqueda Global
- **Corrección de Temas:** Se resolvió un error crítico de sintaxis CSS que causaba visibilidad nula (texto negro) y colores rotos.
- **Mejora de Contraste:** Se ajustó el fondo Zinc para ser ligeramente más visible y se garantizó el contraste del texto blanco puro.
- **Búsqueda Global:** Implementación definitiva de la barra de búsqueda transversal en el header.
- **Identidad de Modos:** Corrección final de los colores de acento para Pedido (Naranja), Stock (Azul) y Recepción (Verde), asegurando legibilidad total.

## [v8.7.0] - 2026-04-09

### 🎨 Overhaul "Flat Zinc & Cyan"
- **Nueva Identidad Visual:** Transición de un diseño basado en sombras y vidrios a una estética industrial ultra-plana basada en escalas de grises **Zinc** con acentos **Cian**.
- **Adiós Sombras y Blurs:** Eliminación total de `box-shadow` y `backdrop-filter` para mejorar la limpieza visual y el rendimiento de renderizado.
- **Componentes Refactorizados:** Dashboard, Historial y Ajustes actualizados al nuevo estilo de bordes sólidos de alto contraste.
- **Integridad de Datos:** Se preservó la lógica de edición que mantiene las fechas originales de los registros, asegurando la cronología del calendario.
- **Versión Core:** Salto a v8.7.0.

## [v8.5.4] - 2026-04-09

### 🚀 Novedades y Mejoras
- **Limpieza de UI de WhatsApp:** Se eliminó la marca de tiempo (ya provista nativamente por WhatsApp) y la palabra "ONLINE" del título de los mensajes generados para un uso más limpio.
- **Correcciones Semánticas de Unidades:** Se corrigió un bug en `formatUnit()` que generaba formas plurales inválidas como "unidads", adaptándolo correctamente a "unidades" y "porciones".
- **Limpieza Estructural Avanzada:** Eliminación definitiva de "Gestión Multi-Local", "Tamaño de Iconos" y la "Zona de Mantenimiento" para simplificar la Configuración.

## [v8.3.0] - Fecha Anterior
### 🚀 Novedades y Mejoras
- **UI/UX Reológico:** Se reemplazó el loader original tipo spinner por una animación fluida de *reloj de arena virtual* (Hourglass). Este nuevo componente de carga utiliza dinámicas pure CSS (giro y vaciado asimétrico de arena) para un look mucho más inmersivo y moderno antes de la carga unificada del Dashboard.
- **Actualización de Versión Core:** Se actualizó la etiqueta global del frontend en \`Code.gs\` a \`v8.3\`.

### 🧹 Limpieza y Mantenimiento
- **Refactorización de Archivos Temporales:** Se analizaron y movieron todos los archivos tipo *basura* y *documentos heredados* (\`check_onclicks.js\`, \`check_syntax.js\`, \`IndexDebug.html\`, \`IndexFallback.html\`) a un nuevo subdirectorio \`/archive\` para mantener limpio el entorno de producción primario sin perder el historial de desarrollo.

*(Nota: La versión actual probada es funcional. Futuras iteraciones incluirán mejoras pendientes sobre el flujo predictivo de FeDe AI).*
