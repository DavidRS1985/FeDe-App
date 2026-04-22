# Example: Styled Action Card

This example shows how a card should be structured to support both design modes automatically by relying on CSS variables and modular overrides.

## HTML Structure
```html
<div class="dash-card-smart">
    <div style="display: flex; align-items: center; gap: 15px;">
        <div class="icon-box" style="background: var(--bg-alt); border: 1.5px solid var(--bd);">
            <i data-lucide="zap" style="color: var(--primary);"></i>
        </div>
        <div style="flex: 1;">
            <h4 style="margin: 0; color: var(--text);">Acción Crítica</h4>
            <p style="margin: 4px 0 0; font-size: 11px; color: var(--dim);">Procesar inventario pendiente</p>
        </div>
        <button class="as-btn" onclick="execute()">PROCESAR</button>
    </div>
</div>
```

## CSS Behavior (Automatic)

- **In Zinc Mode**: 
    - Card will have 14px rounded corners.
    - Background will be dark neutral.
    - Button will have a subtle glass effect and glow.
- **In McFetridge Mode**:
    - Card will have 0px sharp corners and a 2px black border.
    - Backdrop will be warm paper color.
    - Button will have a hard black "sticker" shadow and thick stroke icon.
    - All gradients and blurs will be automatically disabled by the global `*` override.
