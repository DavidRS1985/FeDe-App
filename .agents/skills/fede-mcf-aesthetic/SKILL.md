---
name: fede-mcf-aesthetic
description: Use this skill whenever you need to design, build, or animate UI components for the FeDe app using the McFetridge (Tectonic Industrialism) design system. It contains strict rules for borders, shadows, typography, and specifically fluid animations (fade-ins, mechanical snaps). Make sure to use this skill whenever the user mentions animations, transitions, styling, or creating new components for the FeDe app.
---

# FeDe McFetridge (Tectonic Industrialism) Aesthetic Guide

This skill provides the absolute source of truth for the McFetridge design system used in the FeDe application. It is designed to ensure visual parity and correct animation physics across all components.

## 1. Core Visual Principles
- **Sharp Edges**: Absolutely NO `border-radius`. Everything is a perfect rectangle (`0px`).
- **Brutalist Borders**: Structural elements must have a `4px solid var(--mcf-ink)` border.
- **Displacement Shadows**: Elements must use solid, unblurred drop shadows. Example: `box-shadow: 8px 8px 0px var(--mcf-ink)`. State changes (like active modes) should colorize this shadow (e.g., `var(--mode-color)`).
- **High Contrast**: Use pure `var(--mcf-ink)` (black/dark) against `var(--mcf-paper)` (white/light) or `var(--mcf-bg)`.

## 2. Typography & Iconography
- **Display Font**: Use `var(--mcf-font-display)`. Weight `950`, usually `uppercase` with `letter-spacing: 1px`.
- **Lucide Icons**: Strict surgical stroke width of `1.2px`. For standard list items, size is `32px`. For large grid items, `72px`.

## 3. Animation Rules (Mechanical Fluidity)
Animations in the McFetridge system must balance the "heavy/industrial" look with smooth, fluid modern interactions. As requested, fade-ins and fluid movements are the priority.

### A. Fade-Ins (Desvanecimientos)
When elements enter the DOM (like modals, context bars, or new list items), they should not pop abruptly. They must fade in smoothly while maintaining their geometric rigidity.
- **Property**: `opacity` (often combined with a slight `transform: translateY`).
- **Timing**: `0.2s` to `0.3s` `ease-out`.
- **Implementation**:
  ```css
  @keyframes mcfFadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
  }
  .element {
      animation: mcfFadeIn 0.25s ease-out forwards !important;
  }
  ```

### B. Fluid & Physical Movements (Movimientos Suaves)
When elements are pressed or change state, the transition must feel physical, like a mechanical switch settling smoothly.
- **Physical Press (Active State)**: When a button is pressed, it must physically displace downwards and to the right to cover its shadow, creating a tactile "click".
  ```css
  .mcf-btn:active {
      transform: translate(4px, 4px) !important;
      box-shadow: 4px 4px 0px var(--mcf-ink) !important;
  }
  ```
- **Easing**: Use custom bezier curves for a "snap" effect that settles smoothly. 
  - Standard snap: `transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1) !important;` (often mapped to `var(--mcf-snap)`).
  - Smooth slide (for menus/drawers): `transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;`

### C. Contextual Transitions
- **Hover Effects**: Since this is primarily a mobile/PWA app, rely heavily on `:active` states rather than `:hover`.
- **Color Transitions**: When a background or border changes color (e.g., a stepper button turning amber), it should happen almost instantly to feel responsive: `transition: background 0.1s !important;`

## 4. Component Archetypes
- **Product Rows (`.prow`)**: 4px border, 8px mode-colored shadow, 12px inner padding.
- **Steppers (`.stepper`)**: 70px square buttons, 32px font size, ink borders, solid background colors on active.
- **Category List (`.cchip`)**: Full-width cards, 72px fixed height, flex-row layout, 32px left-aligned icon.

## 5. Execution Mandates
- ALWAYS use `!important` in CSS overrides within `styles_mcfetridge.html` to guarantee priority over legacy styles.
- NEVER use generic AI aesthetics (soft borders, blurred shadows, generic blue colors). If an element looks "web 2.0" or "bootstrap", it is wrong.
