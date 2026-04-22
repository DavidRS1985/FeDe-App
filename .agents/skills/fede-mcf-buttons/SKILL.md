---
name: fede-mcf-buttons
description: How to build and style buttons and category selection chips (.cchip) for the FeDe app using the McFetridge (Tectonic Industrialism) design system. Use this skill whenever you need to create buttons, category lists, or modify interactive elements that require category-based colors, rigid geometry, and physical click states.
---

# FeDe McFetridge Button & Category Grid Guide

This skill defines the precise rules for creating interactive buttons and category selection elements (`.cchip`) in the FeDe application, strictly following the Tectonic Industrialism aesthetic.

## 1. Core Button Geometry
All buttons in the McFetridge system must feel like physical, heavy mechanical switches.
- **Borders**: Must have a strict `4px solid var(--mcf-ink)` border.
- **Corners**: NO rounded corners. `border-radius: 0` is mandatory.
- **Shadows**: Must use a solid, unblurred 8px drop shadow to simulate depth: `box-shadow: 8px 8px 0px var(--mcf-ink)`.
- **Typography**: Text inside buttons should be `uppercase`, `letter-spacing: 1px`, and use `var(--mcf-font-display)`.

## 2. The Active State (The "Click")
The interaction must feel tactile. When a button is pressed (`:active`), it physically depresses into its shadow.
```css
.mcf-btn:active {
    transform: translate(4px, 4px) !important;
    box-shadow: 4px 4px 0px var(--mcf-ink) !important;
}
```

## 3. Category Selection Buttons (`.cchip`)
The category grid is a critical navigation component. It is structured as a single-column scrolling list of wide cards.

### Layout Rules
- **Grid**: Single column (`grid-template-columns: 1fr`).
- **Dimensions**: Buttons (`.cchip`) must span the full width (`100%`) and have a fixed height of exactly `72px`.
- **Content Alignment**: Flex row layout. A small Lucide icon (32px, 1.2px stroke) aligned to the left, followed by the category text.

### Dynamic Category Colors
The background color of a `.cchip` button MUST correspond to the category it represents. The text color (`color`) must guarantee high contrast against that background (usually `var(--mcf-ink)`).

**Color Mapping Implementation**:
When rendering category buttons via JavaScript, apply inline styles or CSS variables based on the category name to define the background color. 
- The border remains `var(--mcf-ink)`.
- The shadow remains `var(--mcf-ink)` (or `var(--mode-color)` depending on the active theme mode).

*Example JS Rendering Logic:*
```javascript
function getCategoryColor(catName) {
    const colors = {
        'Bebidas': 'var(--cat-blue)',
        'Postres': 'var(--cat-pink)',
        'Platos': 'var(--cat-orange)'
        // ... default to var(--mcf-paper)
    };
    return colors[catName] || 'var(--mcf-paper)';
}

// In the HTML template injection:
// <div class="cchip" style="background-color: ${getCategoryColor(cat.name)};">...</div>
```

## 4. Mode-Aware Shadows
In the McFetridge system, the shadow of interactive elements (especially in the `.cat-grid`) often reflects the current application "Mode" (e.g., Merma vs Normal).
- Ensure that the CSS utilizes `var(--mode-color)` for the `box-shadow` if the button's context is tied to a specific operational mode.
  - Normal Mode: `box-shadow: 8px 8px 0px var(--mcf-ink);`
  - Merma Mode: `box-shadow: 8px 8px 0px var(--mcf-merma);` (Violet)

## 5. Prohibition
- NEVER use gradients, subtle drop shadows (`rgba`), or rounded corners on buttons.
- NEVER use standard blue links or default browser button styling. Every interactive surface must be explicitly styled as a tectonic block.
