# Example: Implementing a New CRUD Function in v10

To add a new feature (e.g., "Manage Suppliers"), follow these 3 steps:

## 1. Backend (Code.gs)
Implement the dual-interface shim.

```javascript
function updateSupplier(id, data, targetId) {
  try {
    // 🔀 DUAL INTERFACE SHIM
    if (id && typeof id === 'object' && data === undefined) {
      targetId = id.targetId || null;
      data = id.data;
      id = id.id;
    }
    
    var ss = FeDe_Repo.getSS(targetId);
    var sheet = FeDe_Repo.getSheet(ss, 'Suppliers');
    // ... logic to update row ...
    
    return { success: true };
  } catch(e) {
    return { success: false, error: e.message };
  }
}
```

## 2. API Adapter (app.html)
The method is automatically available if added to `Code.gs`. Use it in your UI logic:

```javascript
function handleSupplierUpdate(id, newData) {
    FeDe_API.call('updateSupplier', { id: id, data: newData }, function(res) {
        toast('Proveedor actualizado');
        refreshSuppliersUI();
    });
}
```

## 3. UI Component
Ensure buttons and inputs follow the CSS variables (`--bg`, `--text`, `--r`) so they automatically adapt to the McFetridge or Zinc themes.
