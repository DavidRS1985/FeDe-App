# 🛠️ MCFETRIDGE OPERATIONAL PROTOCOL (MOP) v1.0
## Protocolo de Sincronización para Agentes en FeDe Gastro Pro

Este documento define el marco de trabajo para todos los agentes de IA (Antigravity, Skill-Agents, etc.) que operen sobre este repositorio. El objetivo es garantizar coherencia absoluta y colaboración simbiótica.

### 1. IDENTIDAD COLECTIVA
*   **Misión**: Evolucionar FeDe Gastro Pro hacia la herramienta de gestión operativa más potente y estéticamente radical del sector gastronómico.
*   **Tono**: Operativo, preciso, sin "AI-slop", industrial y brutalista.

### 2. SISTEMA DE DISEÑO: EL MÉTODO MCFETRIDGE (McF)
Cualquier agente debe validar sus propuestas contra estos tokens:
*   **Superficies**: Planas (Flat), sin gradientes ni sombras suaves.
*   **Bordes**: Siempre `0px` radius. Grosor constante de `3px` a `5px` (Ink).
*   **Color**: Paleta Pastel Desactivada (Muted Pastels) sobre fondo Crema (`#F4F0E5`).
*   **Iconografía**: Lucide SVG con `stroke-width: 2px`. Estilo de sello o diagrama técnico.

### 3. MANDATO "MOBILE-FIRST"
Toda modificación de UI debe seguir estas reglas:
*   **Touch Targets**: Mínimo `48x48px` para elementos interactivos.
*   **Viewport**: Optimizado para `viewport-fit=cover` (iPhone/Android con notch).
*   **Input Handling**: Prevenir zoom automático y asegurar legibilidad en pantallas de 360px.
*   **Ergonomía**: Controles críticos al alcance del pulgar (Bottom-weighted).

### 4. REGLAS DE COLABORACIÓN ENTRE AGENTES
Antes de realizar cambios, los agentes deben:
1.  **Reconocer el Terreno**: Leer `styles_mcfetridge.html` y `PROTOCOL.md`.
2.  **Respetar lo Existente**: Si un agente previo implementó un componente McF, mantén la estructura pero optimiza la función.
3.  **Documentar Diffs**: Cada operación debe ser explicada indicando el impacto en la "Matriz McF".
4.  **Validar ES5**: El backend (`Code.gs`) y partes críticas de `app.html` deben ser compatibles con el motor antiguo de Google Apps Script.

### 5. PROMPT DE INICIALIZACIÓN (Para el Usuario)
> "Activa el Protocolo MOP. Lee `.agents/PROTOCOL.md` y alinea tu comportamiento al sistema de diseño McFetridge. Trabaja en conjunto con los otros agentes instalados para optimizar la experiencia móvil de FeDe Gastro Pro."
