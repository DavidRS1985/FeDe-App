# McFetridge Method — Design System

## Core Principles
1. **Flat**: No gradients. No drop shadows. Matte surfaces only. Color communicates through plane, not transition.
2. **Spare**: Every element earns its place. Negative space is not empty — it is the work. Composition is a puzzle.
3. **Line**: The 1.5px (or 3-4px for industrial felt) contour line is structural. It defines edges, figure-ground, and carries visual weight.

## Color Palette (Tokens)
- **Background (warm paper)**: `#F4F0E5`
- **Surface**: `#E8E3D6`
- **Ink (near-black)**: `#1A1816`
- **Rose**: `#D4937A` (Pedido)
- **Sage**: `#8BA87A` (Recepción)
- **Slate**: `#4E637A` (Stock)
- **Mauve**: `#A884A6` (Merma)
- **Amber**: `#C89A42` (Accent / Focaccia)

## Typography
- **Font**: 'Helvetica Neue', Arial, sans-serif.
- **Display**: 60px, 800 weight, -0.04em tracking.
- **Heading**: 20px, 700 weight, -0.01em tracking.
- **Label**: 11px, 700 weight, 0.14em tracking, UPPERCASE.

## Components Guidelines
- **Borders**: 1.5px to 4px solid `#1A1816`.
- **Corners**: Always `0px` radius.
- **Shadows**: Use "Brutal" Displacement Shadows (e.g., `box-shadow: 4px 4px 0px var(--mcf-ink)`).
- **Interactions**: Button displacement on press (`transform: translate(2px, 2px)`).
- **Illustrations**: SVG-only, geometric motifs.

## 🏗️ Layout Standards (Perfect Alignment)
1. **Product Cards (`.prow`)**:
   - **Structure**: Vertical stacking (`flex-direction: column`).
   - **Dimensions**: Centered with `max-width: 500px`.
   - **Style**: 4px black border + 8px mode-colored displacement shadow.
   - **Padding**: Large internal spacing (`24px`) for industrial breathe.
2. **Category List (`.cat-grid`)**:
   - **Architecture**: Single column wide cards (`flex-direction: column`).
   - **Dimensions**: Fixed height of `72px` for consistent vertical rhythm.
   - **Style**: Icon on the left (small, 32px) with text next to it.
   - **Proportions**: Expanded width with `12px` gaps and optimized clearance.
   - **Iconography**: 1.2px stroke weight for technical precision.
3. **Typography Standards**:
   - **Titles**: Centered, `28px`, `900 weight`, `UPPERCASE` with `2px` tracking.
   - **Inputs**: Bold `16px` text on pure white background, always black ink.
4. **Context Bars**:
   - **Position**: Fixed bottom (`z-index: 9999`) with 80px height.
   - **Hierarchy**: Primary action button 2x wider than secondary.
