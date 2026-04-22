---
name: fede-design-system
description: Design system guidelines and aesthetic tokens for FeDe Gastro Pro v10.0.1 (Zinc vs McFetridge).
---

# FeDe Design System Skill

This skill provides the mandatory guidelines for maintaining visual consistency in the FeDe Gastro Pro application. It covers two primary aesthetic modes: **Zinc Industrial** (Default) and **McFetridge Method**.

## General Principles

1. **Responsiveness**: All components must be mobile-first and use relative units (rem, %, vh/vw) where possible.
2. **Modular CSS**: Avoid ad-hoc styles. Use the defined CSS variables in `styles.html` or `styles_mcfetridge.html`.
3. **Contrast**: High contrast is prioritized for operational efficiency in high-pace environments (kitchens, bars).

---

## 1. Zinc Industrial (Classic)
*The default identity of v10. Based on depth, subtle gradients, and glassmorphism.*

- **Radius**: `--r: 14px`, `--r2: 12px`.
- **Shadows**: Soft blurs and elevations (`--sh-sm`, `--sh-md`).
- **Texture**: Uses subtle patterns (hex-grid) and backdrop-filters.
- **Palette**: Dark backgrounds (`#0f1115`), Zinc accents (`#27272a`), and vibrant operational colors.

---

## 2. McFetridge Method (Premium)
*The geometric, high-contrast overhaul. Based on flat surfaces, bold lines, and paper-like textures.*

### Mandatory Rules for McFetridge:
- **Sharp Corners Only**: `border-radius: 0px !important` for ALL elements.
- **Bold Borders**: Consistent `2px solid #1A1816` (var(--mcf-ink)).
- **Sticker Shadows**: Use hard shadows with no blur. 
    - Card Shadow: `4px 4px 0px var(--mcf-ink)`.
    - Button Shadow: `2px 2px 0px var(--mcf-ink)`.
- **Typography**: Heavily uses `Helvetica Neue` or sans-serif bold, uppercase for headers.
- **Iconography**: Increased stroke weight (3px) for Lucide icons.
- **No Glassmorphism**: Disable all `backdrop-filter` and transparency effects.

### Color Tokens (McFetridge):
- Base Background: `#F4F0E5` (Warm Paper)
- Ink/Primary: `#1A1816` (Bold Dark)
- Palette: Rose (`#D4937A`), Sage (`#8BA87A`), Slate (`#4E637A`), Mauve (`#A884A6`).

---

## Implementation Workflow

When editing any UI component:
1. **Always load `styles.html` first** to ensure layout logic is preserved.
2. **Apply overrides** conditionally in `Index.html` head using `styles_mcfetridge.html`.
3. **Check interactive states**: Ensure `:active` states for buttons in McFetridge mode use a `translate(2px, 2px)` effect to "press" the shadow.
4. **Validation**: Verify that the component remains clear and usable in both light (McFetridge) and dark (Zinc) environments.
