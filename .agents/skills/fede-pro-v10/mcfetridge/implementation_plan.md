# McFetridge Implementation Plan

Strategy for non-breaking aesthetic migration in FeDe project.

## 1. Architectural Strategy: Parallel Theming
- Use `?style=mcf` URL parameter for testing.
- Conditional loading in `Index.html` head via Apps Script templates.

## 2. Core Files
- `App/styles_mcfetridge.html`: Dedicated CSS overrides.
- `Index.html` modifications for theme detection.
- `Code.gs` adaptation in `doGet(e)` to pass the theme variable.

## 3. Component Mapping
- **Pedido**: Rose (#D4937A)
- **Stock**: Slate (#4E637A)
- **Recepción**: Sage (#8BA87A)
- **Merma**: Mauve (#A884A6)
- **Accent**: Amber (#C89A42)

## 4. Activation Steps
- Beta enablement via URL.
- User-facing toggle in "Ajustes > Identidad".
- Gradual legacy code archiving.
