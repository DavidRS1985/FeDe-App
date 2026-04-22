---
name: fede-pro-v10
description: Core architectural and design guidelines for FeDe Gastro Pro v10.0.1 "ARCHITECTED". Manages Repository Pattern, Centralized API Adapter, and McFetridge Design System.
---

# FeDe Gastro Pro v10 Technical Guidelines

Use this skill when modifying or extending the FeDe Gastro Pro application. It ensures adherence to the v10.x structural integrity and architectural patterns.

## 🏛️ 1. Architecture: The FeDe_API Adapter

Since v10.0.1, all frontend-to-backend communication MUST be centralized.

- **Mandatory**: Never call `google.script.run` directly in UI code.
- **Syntax**: Use `FeDe_API.call(methodName, params, successCallback, failureCallback)`.
- **Reasoning**: Standardizes error handling, automatically injects `activeSheetId`, and prevents PWA synchronization conflicts.

```javascript
// ✅ CORRECT (v10 Pattern)
FeDe_API.call('createProduct', { catName: 'Carnes', productName: 'Lomo' }, function(res) {
    showToast('Producto creado');
    loadConfigFromGAS();
});

// ❌ WRONG (Legacy Pattern)
google.script.run.withSuccessHandler(...).createProduct('Carnes', 'Lomo', activeSheetId);
```

## 📦 2. Backend: The FeDe_Repo Pattern

Data persistence in `Code.gs` is managed via the `FeDe_Repo` object to optimize SpreadsheetApp performance.

- **Dual-Interface Support**: All backend functions (CRUD) must support both positional arguments and object-based parameters to maintain compatibility with the API adapter.
- **Caching**: Utilize `CacheService` for heavy reads (Dashboard, Config) to minimize latency.
- **Master Spreadsheet**: Use `FeDe_Repo.getMasterId()` for global defaults.

## 🎨 3. Design Systems

FeDe v10 supports two primary aesthetics, toggled via the `?style=` URL parameter and managed in `Index.html`.

### A. Focaccia Standard (Classic Zinc)
- **Files**: `styles.html`
- **Style**: Soft glassmorphism, rounded corners (`--r: 20px`), Montserrat/Inter fonts, vibrant status colors.


### B. McFetridge Method (Flat Minimalist)
- **Files**: `styles_mcfetridge.html`
- **Style**: High contrast, sharp geometric corners (`--r: 0px`), warm paper backgrounds (`#F4F0E5`), total absence of gradients and shadows.
- **Rule**: All elements must have `border-radius: 0px !important;`.
- **References**:
  - [Design System Guide](./mcfetridge/design_system.md) (Standard: Vertical Stacking & 3-Col Grids)
  - [UX/UI Workflow](./mcfetridge/uxui_workflow.md)
  - [Implementation Plan](./mcfetridge/implementation_plan.md)

## 🛠️ 4. Maintenance & PWA Stability

- **History Management**: The `addHistoryEntry` function performs an automatic cleanup when the sheet exceeds 300 rows.
- **Offline Sync**: `processOfflineQueue` in `app.html` must be handled via the API adapter to ensure retry logic.
- **Version Control**: Increment the version in `appsscript.json`, `Index.html`, and `Code.gs` on every structural change.

## 🔍 5. System Test Module

Use `runSystemTest()` in `app.html` to verify:
1. Connectivity with Google Servers.
2. UI Component integrity (existence of key DOM IDs).
3. Manifest and Service Worker synchronization.
