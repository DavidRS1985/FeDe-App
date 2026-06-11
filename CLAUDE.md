# CLAUDE.md — FeDe Gastro Pro

Guidance for Claude Code when working in this repository.

## Deployment

Push to Google Apps Script via clasp from this directory:

```bash
clasp push
clasp login   # first-time auth
```

**File push order** (defined in `.clasp.json`):
`appsscript.json` → `Code.gs` → `styles.html` → `holidays.html` → `app.html` → `Index.html`

No local dev server. Changes go live after `clasp push` + redeploy in the GAS editor.

## Architecture

**Backend: `Code.gs`** — Google Apps Script V8. Layered:

```
FeDe_Repo      — SpreadsheetApp reads/writes
FeDe_Services  — Orchestration and state
FeDe_Domain    — Pure business logic
MigrationService — Schema upgrades
```

`doGet(e)` is the HTTP entry point. Frontend calls arrive via `google.script.run`.

**Data store:** Single Google Sheet with:
- `Config` — key-value pairs, JSON-encoded (`cats`, `favs`, `units`, `orderAnchors`, etc.)
- `History` — transaction log (ID, Fecha, Modo, Turno, Total, Data_JSON)

**Frontend: `app.html`** — Vanilla JS (ES5 strict), ~5,000+ lines, SPA with view toggling via CSS classes.
Key globals: `CATS`, `HIST`, `CONFIG`, `relData`, `currentMode`, `activeCat`, `_appReady`.

**Six operating modes** (stored in `data-mode`):
- `pedido` — blue — Purchase orders
- `stock` — green — Inventory check
- `recepcion` — violet — Goods receiving
- `merma` — amber — Waste/loss
- `produccion` — teal — Production runs
- `recetarios` — uses `--fede-accent-recetario` — Recipe management

**Caching:**
- `CacheService` 5-min TTL — config; 1-hr TTL — theme
- `PropertiesService` — theme persistence
- `localStorage` — `fede_active_sheet_id`, `fede_snapshot_<id>`, `UNIT_MEM`

## Critical Constraints

**ES5 only.** No arrow functions, template literals, destructuring, spread, `const`/`let`, or `class`. GAS V8 — no transpilation.

**Batch Spreadsheet I/O.** Use `getDataRange().getValues()` — never individual cell reads/writes in a loop.

**History cap:** Auto-deletes rows beyond 300. Do not remove this guard.

**Anti-duplicate check:** `addHistoryEntry` scans full column before inserting. Intentional.

## Design System — FeDe v2

**FeDe Design System v2 is the only valid system.** McFetridge (legacy) is completely phased out. All CSS must use FeDe v2 tokens exclusively.

**Key CSS tokens** (`:root` in `styles.html`):
- Surfaces: `--fede-bg`, `--fede-surface`
- Text: `--fede-on-surface`, `--fede-on-surface-2`, `--fede-on-surface-3`
- Mode accent: `--primary` (auto-set by `data-mode`)
- Mode accents: `--fede-accent-pedido`, `--fede-accent-stock`, `--fede-accent-recepcion`, `--fede-accent-merma`, `--fede-accent-produccion`, `--fede-accent-recetario`
- Border: `--fede-border`
- Radii: `--fede-r-sm` (8px), `--fede-r-md` (12px), `--fede-r-lg` (16px)
- Typography: `--fede-caption`, `--fede-label`, `--fede-body`

**Header pattern (two-zone):**
- Utility row: back button + action pills
- Identity zone: small caption (uppercase, muted) + large title (700 weight)
- Background: `linear-gradient(160deg, var(--fede-surface) 60%, color-mix(in srgb, var(--primary) 5%, var(--fede-surface)) 100%)`
- Fade-out: `<div style="height:10px;background:linear-gradient(to bottom,var(--fede-surface),var(--fede-bg));pointer-events:none;"></div>`

**Prohibited (MCF legacy — never use):**
- `.mcf-*` classes
- `--mcf-*` tokens
- `glassmorphism` / `backdrop-filter` / `saturate()` in non-nav contexts
- Dramatic box-shadows
- `text-transform: uppercase` on titles
- `body.view-recetarios { --fede-accent: ... }` (accent color inheritance removed)

**iOS 7 navbar** (`#main-tabs`): frosted glass, `opacity:0.7/1.0` active state, spring icon scale.

## Multi-sheet Support

Most backend functions accept optional `targetId` to override `MASTER_ID`.
Client stores active sheet in `localStorage` as `fede_active_sheet_id`.

## Specialized Agents

Available in `.claude/agents/` (parent directory):
- `fede-senior-fullstack` — UX/UI redesign, CSS, layout, component HTML
- `fede-logica` — JS logic in `app.html` (render functions, goTab, state management)
- `fede-deploy` — runs `clasp push` and reports result
- `fede-auditor` — pre-deploy quality audit (CSS conflicts, orphan classes, JS errors)
- `fede-architect` — architectural analysis, data structures, algorithm design

## Snapshot Pattern

Photo persistence: always update both GAS sheet **and** localStorage snapshot simultaneously:
```javascript
var snap = JSON.parse(localStorage.getItem('fede_snapshot_' + activeId) || '{}');
snap.recetas = recetas;
localStorage.setItem('fede_snapshot_' + activeId, JSON.stringify(snap));
```
