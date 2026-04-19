var MASTER_ID = '1oVhQLOGo4FzaHqB8rCloxnPpkomEB7z57ZM8Jk8a0fU';

// ═══════════════════════════════════════════════════════════════════════════
// LOGGING & ERROR HANDLING (Backend Patterns)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Sistema de logging centralizado para mejor debugging
 */
var Logger_FeDe = {
  levels: { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 },
  currentLevel: 1, // INFO
  
  log: function(level, message, data) {
    if (data === undefined) data = null;
    var timestamp = new Date().toISOString();
    var levelName = '';
    var keys = Object.keys(this.levels);
    for(var i=0; i<keys.length; i++) {
        if(this.levels[keys[i]] === level) {
            levelName = keys[i];
            break;
        }
    }
    console.log('[' + timestamp + '] [' + levelName + '] ' + message, data);
  },
  
  debug: function(msg, data) { if (this.currentLevel <= 0) this.log(0, msg, data); },
  info: function(msg, data) { if (this.currentLevel <= 1) this.log(1, msg, data); },
  warn: function(msg, data) { if (this.currentLevel <= 2) this.log(2, msg, data); },
  error: function(msg, data) { this.log(3, msg, data); }
};

/**
 * Validación de datos mejorada
 */
var Validator = {
  isString: function(value) { return typeof value === 'string' && value.length > 0; },
  isArray: function(value) { return Array.isArray(value); },
  isObject: function(value) { return value !== null && typeof value === 'object' && !Array.isArray(value); },
  isNumber: function(value, min, max) { 
    if (min === undefined) min = -Infinity;
    if (max === undefined) max = Infinity;
    return typeof value === 'number' && value >= min && value <= max; 
  },
  sanitizeString: function(value) {
    return String(value).trim().replace(/[<>\"']/g, '');
  },
  validateSheetId: function(id) {
    return typeof id === 'string' && id.length > 20;
  }
};

/**
 * Utilidades de UUID y generación de IDs
 */
var IdGenerator = {
  generateUUID: function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0;
      var v = (c === 'x' ? r : (r & 0x3 | 0x8));
      return v.toString(16);
    });
  },
  generateEntryId: function() {
    return Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }
};

function getSheetId(id) {
    return id && id !== 'undefined' && Validator.validateSheetId(id) ? id : MASTER_ID;
}

function doGet(e) {
  // ── ROUTING PARA PWA / ANDROID ──
  if (e && e.parameter) {
    if (e.parameter.path === 'manifest.json') {
      var manifest = {
        "id": "com.fede.focaccia.v10",
        "name": "FeDe Gastro Pro - FOCACCIA",
        "short_name": "FOCACCIA",
        "start_url": "./",
        "display": "standalone",
        "background_color": "#0f1115",
        "theme_color": "#ffffff",
        "description": "Sistema de gestión operativa - FOCACCIA Edition v10.0.0",
        "icons": [
          {
            "src": "https://img.icons8.com/isometric/512/restaurant-membership-card.png",
            "sizes": "512x512",
            "type": "image/png",
            "purpose": "any maskable"
          },
          {
            "src": "https://img.icons8.com/isometric/192/restaurant-membership-card.png",
            "sizes": "192x192",
            "type": "image/png",
            "purpose": "any maskable"
          }
        ],
        "orientation": "portrait"
      };
      return ContentService.createTextOutput(JSON.stringify(manifest))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    if (e.parameter.path === 'sw.js') {
      var swCode = 'var CACHE_NAME = \'fede-focaccia-v10\'; ' +
        'self.addEventListener(\'install\', function(e) { ' +
        'e.waitUntil(caches.open(CACHE_NAME).then(function(cache) { return cache.addAll([\'./\']); })); ' +
        '}); ' +
        'self.addEventListener(\'fetch\', function(event) { ' +
        'event.respondWith(fetch(event.request).catch(function() { return caches.match(event.request); })); ' +
        '});';
      return ContentService.createTextOutput(swCode)
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
  }

  // ── RENDERIZADO NORMAL ──
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('FeDe Gastro Pro - FOCACCIA')
    .setFaviconUrl('https://img.icons8.com/isometric/512/restaurant-membership-card.png')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Función central para incluir archivos HTML dentro del Index.html
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/** 
 * Obtiene toda la configuración y el historial de una sola vez 
 * Mejorado con error handling y validación
 */
function getAppConfig(targetId) {
  try {
    Logger_FeDe.info('Cargando configuración de app', { targetId: targetId });
    
    var sheetId = getSheetId(targetId);
    var ss = SpreadsheetApp.openById(sheetId);
    var configSheet = getOrCreateSheet(ss, 'Config');
    var histSheet = getOrCreateSheet(ss, 'History');
    
    // Leer Config
    var configData = configSheet.getDataRange().getValues();
    var config = {};
    configData.forEach(function(row) {
      if (row[0] && Validator.isString(row[0])) {
        try {
          config[row[0]] = JSON.parse(row[1]);
        } catch(e) {
          Logger_FeDe.warn('No se pudo parsear config item', { key: row[0], error: e.message });
          config[row[0]] = row[1];
        }
      }
    });

    // Inicialización por defecto si está vacío
    if (!config.cats || !Validator.isObject(config.cats) || Object.keys(config.cats).length === 0) {
      Logger_FeDe.info('Inicializando configuración por defecto');
      config = initializeDefaultConfig(configSheet);
    }

    // Leer Historial (últimos 100)
    var lastRow = histSheet.getLastRow();
    var history = [];
    if (lastRow > 1) {
      var histData = histSheet.getRange(2, 1, Math.min(100, lastRow - 1), 6).getValues();
      history = histData.map(function(row) {
        return {
          id: String(row[0]),
          fecha: String(row[1]),
          mode: String(row[2]).toLowerCase(),
          turno: String(row[3]),
          total: Number(row[4]) || 0,
          items: (function() {
            try {
              return JSON.parse(row[5] || '[]');
            } catch(e) {
              Logger_FeDe.warn('Error parseando items del historial', { error: e.message });
              return [];
            }
          })()
        };
      }).reverse();
    }

    Logger_FeDe.info('Configuración cargada exitosamente', { 
      categories: Object.keys(config.cats || {}).length,
      historyItems: history.length
    });

    return { 
      success: true, 
      ssName: ss.getName(), 
      config: config, 
      history: history, 
      timestamp: new Date().toISOString() 
    };
  } catch(e) {
    Logger_FeDe.error('Error cargando configuración', { error: e.message, stack: e.stack });
    return { 
      success: false, 
      error: e.message, 
      config: {}, 
      history: [], 
      timestamp: new Date().toISOString() 
    };
  }
}

function getAppState() { return getAppConfig(); }

function saveConfig(key, value, targetId) {
  try {
    // Validación de inputs
    if (!Validator.isString(key)) {
      throw new Error('La clave debe ser un string válido');
    }
    if (value === null || value === undefined) {
      throw new Error('El valor no puede ser nulo');
    }
    
    Logger_FeDe.debug('Guardando configuración', { key: key, valueType: typeof value });
    
    var ss = SpreadsheetApp.openById(getSheetId(targetId));
    var sheet = getOrCreateSheet(ss, 'Config');
    var data = sheet.getDataRange().getValues();
    var valStr = JSON.stringify(value);
    var found = false;
    
    for (var i = 0; i < data.length; i++) {
      if (data[i][0] == key) {
        sheet.getRange(i + 1, 2).setValue(valStr);
        found = true; 
        break;
      }
    }
    if (!found) sheet.appendRow([key, valStr]);
    
    Logger_FeDe.info('Configuración guardada exitosamente', { key: key });
    return { success: true, key: key };
  } catch(e) { 
    Logger_FeDe.error('Error guardando configuración', { error: e.message, key: key });
    return { success: false, error: e.message }; 
  }
}

function addHistoryEntry(entry, targetId) {
  try {
    // Validación del entry
    if (!Validator.isObject(entry)) {
      throw new Error('entry debe ser un objeto válido');
    }
    
    Logger_FeDe.debug('Agregando entrada al historial', { 
      mode: entry.mode, 
      itemCount: (entry.items || []).length 
    });
    
    var ss = SpreadsheetApp.openById(getSheetId(targetId));
    var sheet = getOrCreateSheet(ss, 'History');
    
    var entryId = entry.id || IdGenerator.generateEntryId();
    
    // 🛡️ ANTI-DUPLICADO: Verificar si el ID ya existe (Solo primera columna para rendimiento)
    var lastRow = sheet.getLastRow();
    if (lastRow > 0) {
      var existingIds = sheet.getRange(1, 1, lastRow, 1).getValues();
      for (var i = 0; i < existingIds.length; i++) {
        if (existingIds[i][0] == entryId) {
          Logger_FeDe.warn('Intento de duplicado detectado y bloqueado', { entryId: entryId });
          return { success: true, entryId: entryId, duplicated: true };
        }
      }
    }

    var newRow = [
      entryId,
      entry.fecha || new Date().toISOString(),
      String(entry.mode || 'stock').toLowerCase(),
      entry.turno || 'Sin turno',
      Number(entry.total) || 0,
      JSON.stringify(entry.items || [])
    ];
    
    sheet.appendRow(newRow);
    // Limpieza: mantener máximo 300 registros (reducción para mejorar rendimiento móvil)
    var currentRows = sheet.getLastRow();
    if (currentRows > 300) {
      sheet.deleteRows(2, currentRows - 300);
      Logger_FeDe.info('Limpieza de historial realizada (300 items limit)');
    }
    
    Logger_FeDe.info('Entrada del historial agregada', { entryId: entryId });
    return { success: true, entryId: entryId };
  } catch(e) { 
    Logger_FeDe.error('Error agregando entrada al historial', { error: e.message });
    return { success: false, error: e.message }; 
  }
}

function deleteHistoryEntry(entryId, targetId) {
  try {
    var ss = SpreadsheetApp.openById(getSheetId(targetId));
    var sheet = getOrCreateSheet(ss, 'History');
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] == entryId) {
        sheet.deleteRow(i + 1);
        break;
      }
    }
    return {success: true};
  } catch(e) { return {success: false, error: e.message}; }
}

function logCatEdit(catName) {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = getOrCreateSheet(ss, 'Config');
    var data = sheet.getDataRange().getValues();
    var edits = {};
    var rowIdx = -1;
    for (var i = 0; i < data.length; i++) {
      if (data[i][0] == 'catEditLog') {
        try { edits = JSON.parse(data[i][1]); } catch(e) {}
        rowIdx = i + 1;
        break;
      }
    }
    edits[catName] = new Date().toISOString();
    var keys = Object.keys(edits).sort(function(a,b) { return new Date(edits[b]) - new Date(edits[a]); }).slice(0, 10);
    var newEdits = {};
    keys.forEach(function(k) { newEdits[k] = edits[k]; });
    var valStr = JSON.stringify(newEdits);
    if (rowIdx > 0) sheet.getRange(rowIdx, 2).setValue(valStr);
    else sheet.appendRow(['catEditLog', valStr]);
    return {success: true};
  } catch(e) { return {success: false, error: e.message}; }
}

function deleteHistory(type, targetId) {
  try {
    var ss = SpreadsheetApp.openById(getSheetId(targetId));
    var sheet = getOrCreateSheet(ss, 'History');
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) return { success: true, count: 0 };

    if (type === 'all') {
      sheet.getRange(2, 1, lastRow - 1, 6).clearContent();
      return { success: true, count: lastRow - 1 };
    } else {
      var data = sheet.getRange(2, 1, lastRow - 1, 6).getValues();
      var count = 0;
      // Ir de abajo hacia arriba para no alterar índices al borrar filas
      for (var i = data.length - 1; i >= 0; i--) {
        var mode = (data[i][2] || '').toLowerCase();
        if (mode === type.toLowerCase()) {
          sheet.deleteRow(i + 2);
          count++;
        }
      }
      return { success: true, count: count };
    }
  } catch(e) {
    return { success: false, error: e.message };
  }
}

function getOrCreateSheet(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    if (name === 'History') sheet.appendRow(['ID', 'Fecha', 'Modo', 'Turno', 'Total', 'Data_JSON']);
  }
  return sheet;
}

function initializeDefaultConfig(sheet) {
  var config = {
    app_title: "FEDE GASTRO PRO",
    app_subtitle: "FOCACCIA Edition v10.0.0",
    units: ['porción/es', 'kg', 'unidad', 'litro', 'botella', 'maple', 'caja', 'frasco', 'lata', 'tupper', 'bandeja', 'atado', 'bolsa', 'paquete'],
    favs: ["Ojo de bife", "Bondiola", "Peceto", "Pechuga", "Salmón", "Langostinos", "Burrata", "Queso Sardo", "Queso Gouda", "Queso parmesano", "Leche entera", "Manteca"],
    cats: {
      "Personal": { icon: "chess-pawn", order: 1, prods: ["Pizza", "Tarta", "Milanesa de pollo", "Guiso de lentejas", "Pastas del personal", "Filet de merluza", "Sopa", "Cerdo"] },
      "Carnes": { icon: "beef", order: 2, prods: ["Bondiola", "Carne picada", "Chorizo", "Jamón cocido", "Jamón crudo", "Lomo", "Mortadela con pistacho", "Ojo de bife", "Osobuco", "Panceta (bacon)", "Pechuga", "Peceto"] },
      "Lácteos": { icon: "milk", order: 3, prods: ["Burrata", "Crema de leche", "Leche entera", "Manteca", "Provoleta", "Queso al pesto", "Queso azul", "Queso brie", "Queso crema", "Queso danbo", "Queso Gouda", "Queso Gouda ahumado", "Queso Gruyere", "Queso Holanda amarillo", "Queso mozzarella", "Queso parmesano", "Queso pategrás", "Queso Sardo", "Ricota", "Yogurt"] },
      "Huevos": { icon: "egg", order: 4, prods: ["Huevos"] },
      "Verdulería": { icon: "carrot", order: 5, prods: ["Ajo", "Arándanos", "Banana", "Berenjena", "Brócoli", "Brotes", "Calabaza", "Cebolla", "Cebolla de verdeo", "Choclo", "Espinaca", "Frutilla", "Kale", "Lechuga", "Limón", "Manzana verde", "Naranja", "Palta", "Papa", "Pera", "Perejil", "Puerro", "Remolacha", "Repollo", "Rúcula", "Tomate cherry", "Tomate perita", "Uvas verdes", "Zanahoria", "Zucchini"] },
      "Pescados": { icon: "fish", order: 6, prods: ["Langostinos", "Merluza", "Pescado blanco (pesca del día)", "Salmón"] },
      "Panadería": { icon: "croissant", order: 7, prods: ["Pan baguetin", "Pan brioche", "Pan de campo", "Pan de hamburguesa", "Pan de miga", "Pan de molde", "Pan de panera", "Pan focaccia", "Prepizza", "Tequeños"] },
      "Pastas": { icon: "soup", order: 8, prods: ["Calzoncelli", "Ñoquis", "Sorrentinos de salmón", "Spaghetti seco", "Tagliatelle", "Tallarines"] },
      "Bebidas": { icon: "bottle-wine", order: 9, prods: ["Vino"] },
      "Condimentos": { icon: "shrub", order: 10, prods: ["Aceite de girasol", "Aceite de oliva", "Aceto balsámico", "Aderezo César", "Ají molido", "Ketchup", "Mayonesa", "Miel", "Mostaza", "Orégano", "Perejil", "Pimienta negra molida", "Sal fina", "Sal gruesa", "Tahini", "Tomillo", "Vinagre de alcohol"] },
      "Conservas": { icon: "cylinder", order: 11, prods: ["Aceitunas negras", "Aceitunas verdes", "Alcaparras", "Hongos deshidratados", "Mermeladas", "Pasta de tomate", "Tomates deshidratados", "Tomates pelados en lata"] },
      "Secos": { icon: "wheat", order: 12, prods: ["Almendras", "Arroz risotto", "Azúcar", "Fécula de maíz", "Fécula de mandioca", "Garbanzos", "Harina 000", "Harina 0000", "Harina de mandioca", "Nueces", "Polvo de hornear"] },
      "Platos carta": { icon: "utensils-crossed", order: 13, prods: ["Affogato", "Berenjenas en escabeche", "Bondiola Braseada", "Borsch", "Brownie c/helado", "Budín de pan", "Burrata fresca c/jamón crudo", "Buñuelos de espinaca", "Caponatta all uso nostro", "Chivito y papas", "Choripán y papas", "Crumble de manzana", "Enrollados FEDE", "Ensalada César con langostinos", "Ensalada Clásica", "Ensalada Kale con praliné de maní", "Girandola", "Hamburguesa y papas", "Humus con vegetales encurtidos", "Lasagna clásica", "Milanesa", "Milanesa gratinada", "Milanesa napolitana", "Mousse de chocolate", "Musaka", "Ojo de bife", "Omelett con queso y jamón", "Osobucco al funghi", "Papas fritas y cheddar", "Pechuga grillada", "Pesca del día", "Pizza FEDE", "Pizza Margherita", "Pizza Mozzarella", "Plato 5 quesos", "Provoleta c/mermelada de morrón", "Risotto de langostinos", "Risotto de pera y queso azul", "Risotto de setas", "Rotolo de espinaca", "Salmon grille", "Sorrentinos calabaza/jamón y queso", "Sorrentinos de salmón", "Suprema de pollo", "Tequeños de queso", "Tiramisú", "Tostado jamón y queso", "Tostón de campo", "Trucha a la manteca", "Vichysoisse", "Vigilante FEDE"] }
    }
  };
  Object.keys(config).forEach(function(k) { sheet.appendRow([k, JSON.stringify(config[k])]); });
  return config;
}

function isValidName(name) { return name && typeof name === 'string' && name.trim().length > 0; }

function createCategory(name, icon, targetId) {
  if (!isValidName(name)) return {success: false, error: "Nombre vacío"};
  var config = getAppConfig(targetId).config;
  if (config.cats[name]) return {success: false, error: "Ya existe"};
  config.cats[name] = {icon: icon || "package", order: Object.keys(config.cats).length + 1, prods: []};
  saveConfig('cats', config.cats, targetId);
  logCatEdit(name, targetId);
  return {success: true, data: config.cats};
}

function updateCategory(oldName, newName, newIcon, newSize, targetId) {
  if (!isValidName(newName)) return {success: false, error: "Nombre vacío"};
  var config = getAppConfig(targetId).config;
  if (!config.cats[oldName]) return {success: false, error: "No existe"};
  var cat = config.cats[oldName];
  cat.icon = newIcon || cat.icon;
  if (newSize) cat.iconSize = newSize;
  config.cats[newName] = cat;
  if (newName !== oldName) delete config.cats[oldName];
  saveConfig('cats', config.cats, targetId);
  logCatEdit(newName, targetId);
  return {success: true, data: config.cats};
}

function deleteCategory(name, targetId) {
  var config = getAppConfig(targetId).config;
  if (!config.cats[name]) return {success: false, error: "No existe"};
  if (config.cats[name].prods.length > 0) return {success: false, error: "No vacía"};
  delete config.cats[name];
  saveConfig('cats', config.cats, targetId);
  return {success: true, data: config.cats};
}

function createProduct(catName, productName, targetId) {
  if (!isValidName(productName)) return {success: false, error: "Nombre vacío"};
  var config = getAppConfig(targetId).config;
  if (!config.cats[catName]) return {success: false, error: "No existe"};
  config.cats[catName].prods.push(productName);
  saveConfig('cats', config.cats, targetId);
  logCatEdit(catName, targetId);
  return {success: true, data: config.cats};
}

function updateProduct(catName, oldName, newName, targetId) {
  if (!isValidName(newName)) return {success: false, error: "Nombre vacío"};
  var config = getAppConfig(targetId).config;
  if (!config.cats[catName]) return {success: false, error: "No existe"};
  var idx = config.cats[catName].prods.indexOf(oldName);
  if (idx !== -1) config.cats[catName].prods[idx] = newName;
  saveConfig('cats', config.cats, targetId);
  logCatEdit(catName, targetId);
  return {success: true, data: config.cats};
}

function deleteProduct(catName, productName, targetId) {
  var config = getAppConfig(targetId).config;
  if (!config.cats[catName]) return {success: false, error: "No existe"};
  config.cats[catName].prods = config.cats[catName].prods.filter(function(p) { return p !== productName; });
  saveConfig('cats', config.cats, targetId);
  logCatEdit(catName, targetId);
  return {success: true, data: config.cats};
}

function getDashboardMetrics(targetId) {
  var config = getAppConfig(targetId), cats = config.config.cats, history = config.history || [];
  var totalItems = 0; 
  Object.keys(cats).forEach(function(c) { totalItems += cats[c].prods.length; });
  
  var today = new Date(); 
  today.setHours(0,0,0,0);
  
  var movementsToday = 0; 
  history.forEach(function(h) { 
    if (new Date(h.fecha).setHours(0,0,0,0) === today.getTime()) movementsToday++; 
  });
  
  var recentCats = [];
  if (config.config.catEditLog) {
    var edits = config.config.catEditLog;
    recentCats = Object.keys(edits).map(function(name) {
        return {name: name, ts: edits[name]};
    }).sort(function(a,b) { 
        return new Date(b.ts) - new Date(a.ts); 
    }).slice(0, 4);
  }
  

  
  var calendar = {};
  var currentMonth = new Date().getMonth();
  var currentYear = new Date().getFullYear();

  history.forEach(function(h) {
    var d = new Date(h.fecha);
    if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
      var day = d.getDate();
      var dateKey = currentYear + '-' + ((currentMonth + 1) < 10 ? '0' + (currentMonth + 1) : (currentMonth + 1)) + '-' + (day < 10 ? '0' + day : day);
      var mode = (h.mode || 'stock').toLowerCase();
      if (!calendar[dateKey]) calendar[dateKey] = [];
      if (calendar[dateKey].indexOf(mode) === -1) calendar[dateKey].push(mode);
    }
  });

  return { success: true, ssName: config.ssName, data: { totalItems: totalItems, movementsToday: movementsToday, allCategories: Object.keys(cats), recentCats: recentCats, calendar: calendar } };
}

/**
 * 🧹 HERRAMIENTA DE MANTENIMIENTO: Eliminar duplicados por ID
 */
function deduplicateHistory(targetId) {
  try {
    var ss = SpreadsheetApp.openById(getSheetId(targetId));
    var sheet = getOrCreateSheet(ss, 'History');
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) return { success: true, removed: 0 };

    var data = sheet.getRange(2, 1, lastRow - 1, 6).getValues();
    var seenIds = {};
    var rowsToDelete = [];
    
    // Recorrer de arriba abajo para marcar duplicados (mantener el primero)
    for (var i = 0; i < data.length; i++) {
        var id = String(data[i][0]).trim();
        if (id && seenIds[id]) {
            rowsToDelete.push(i + 2); // +2 por cabecera y base 1
        } else if (id) {
            seenIds[id] = true;
        }
    }

    // Borrar de abajo hacia arriba para no romper índices
    for (var j = rowsToDelete.length - 1; j >= 0; j--) {
        sheet.deleteRow(rowsToDelete[j]);
    }

    return { success: true, removed: rowsToDelete.length };
  } catch(e) {
    return { success: false, error: e.message };
  }
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ASISTENTE DE PEDIDOS INTELIGENTE — Promedio Ponderado por Recencia
 * ═══════════════════════════════════════════════════════════════════════════
 * Analiza los últimos 30 días de historial (modos 'recepcion' y 'pedido')
 * para sugerir cantidades a pedir. Usa pesos decrecientes para priorizar
 * los datos más recientes sobre el historial antiguo, permitiendo que el
 * sistema se adapte rápidamente a cambios de carta o estacionalidad.
 */
function getSmartOrderSuggestions(targetId) {
  try {
    var sheetId = getSheetId(targetId);
    var ss = SpreadsheetApp.openById(sheetId);
    var configSheet = getOrCreateSheet(ss, 'Config');
    var histSheet = getOrCreateSheet(ss, 'History');

    // ── 1. Leer configuración de categorías y anclajes ──
    var configData = configSheet.getDataRange().getValues();
    var cats = {};
    var anchors = {};
    configData.forEach(function(row) {
      if (row[0] === 'cats') {
        try { cats = JSON.parse(row[1]); } catch(e) {}
      }
      if (row[0] === 'orderAnchors') {
        try { anchors = JSON.parse(row[1]); } catch(e) {}
      }
    });

    // ── 2. Construir mapa de productos por nombre → categoría ──
    var prodCatMap = {};
    Object.keys(cats).forEach(function(catName) {
      var prods = cats[catName].prods || [];
      prods.forEach(function(p) { prodCatMap[p] = catName; });
    });

    // ── 3. Leer historial de los últimos 30 días ──
    var now = new Date();
    var cutoff30 = new Date(now.getTime() - 30 * 24 * 3600 * 1000);
    var cutoff15 = new Date(now.getTime() - 15 * 24 * 3600 * 1000);
    var lastRow = histSheet.getLastRow();

    // productData[prodName] = { w1: qty, w2: qty, w3: qty, w4: qty, lastSeen: Date, lastUnit: str }
    var productData = {};
    var lastSeenMap = {}; // Última vez que apareció cualquier modo

    if (lastRow > 1) {
      var histData = histSheet.getRange(2, 1, lastRow - 1, 6).getValues();
      histData.forEach(function(row) {
        var fecha = new Date(row[1]);
        if (isNaN(fecha.getTime()) || fecha < cutoff30) return;

        var mode = String(row[2]).toLowerCase();
        if (mode !== 'recepcion' && mode !== 'pedido') return;

        var items = [];
        try { items = JSON.parse(row[5] || '[]'); } catch(e) {}

        // Determinar a qué semana pertenece (1=más reciente, 4=más antigua)
        var msAgo = now.getTime() - fecha.getTime();
        var daysAgo = msAgo / (24 * 3600 * 1000);
        var week = 1;
        if (daysAgo > 7 && daysAgo <= 14) week = 2;
        else if (daysAgo > 14 && daysAgo <= 21) week = 3;
        else if (daysAgo > 21) week = 4;

        // Peso según semana (decreciente por recencia)
        var weights = { 1: 1.0, 2: 0.5, 3: 0.25, 4: 0.25 };
        var w = weights[week];

        items.forEach(function(item) {
          if (!item.prod) return;
          var qty = parseFloat(item.qty) || 1;
          var prod = item.prod;

          // Actualizar lastSeen para detectar faltantes
          if (!lastSeenMap[prod] || fecha > lastSeenMap[prod]) {
            lastSeenMap[prod] = fecha;
          }

          if (!productData[prod]) {
            productData[prod] = { w1:0, w2:0, w3:0, w4:0, lastUnit: item.unit || 'unidad/es', count: 0 };
          }
          productData[prod]['w' + week] += qty;
          productData[prod].count++;
          if (item.unit) productData[prod].lastUnit = item.unit;
        });
      });
    }

    // ── 4. Calcular consumo semanal ponderado por producto ──
    // Formula: (w1*1.0 + w2*0.5 + w3*0.25 + w4*0.25) / totalWeight
    // Total weight = 1.0 + 0.5 + 0.25 + 0.25 = 2.0
    var suggestions = {};
    Object.keys(productData).forEach(function(prod) {
      var d = productData[prod];
      var weighted = (d.w1 * 1.0) + (d.w2 * 0.5) + (d.w3 * 0.25) + (d.w4 * 0.25);
      var totalWeight = 2.0;
      var weeklyAvg = weighted / totalWeight;

      // Redondear a 1 decimal si < 10, entero si >= 10
      var suggested = weeklyAvg < 10 ? Math.round(weeklyAvg * 2) / 2 : Math.ceil(weeklyAvg);
      if (suggested <= 0) suggested = 0;

      var cat = prodCatMap[prod] || 'Otros';
      var anchor = anchors[prod] || null;

      // El sugerido final es el mayor entre la inteligencia y el anclaje
      var finalQty = suggested;
      if (anchor && anchor.qty && anchor.qty > finalQty) {
        finalQty = anchor.qty;
      }

      suggestions[prod] = {
        prod: prod,
        cat: cat,
        qty: finalQty,
        suggested: suggested,
        unit: d.lastUnit,
        isAnchored: !!(anchor && anchor.qty > 0),
        anchorMin: anchor ? anchor.qty : 0,
        dataPoints: d.count
      };
    });

    // ── 5. Agregar anclajes que no aparecieron en historial ──
    Object.keys(anchors).forEach(function(prod) {
      if (!suggestions[prod] && anchors[prod].qty > 0) {
        suggestions[prod] = {
          prod: prod,
          cat: prodCatMap[prod] || 'Anclado',
          qty: anchors[prod].qty,
          suggested: 0,
          unit: anchors[prod].unit || 'unidad/es',
          isAnchored: true,
          anchorMin: anchors[prod].qty,
          dataPoints: 0
        };
      }
    });

    // ── 6. Detectar productos con baja actividad (> 15 días sin aparecer) ──
    var missingProds = [];
    Object.keys(lastSeenMap).forEach(function(prod) {
      if (lastSeenMap[prod] < cutoff15) {
        missingProds.push({ prod: prod, lastSeen: lastSeenMap[prod].toISOString() });
      }
    });

    // ── 7. Agrupar por categoría ──
    var grouped = {};
    Object.keys(suggestions).forEach(function(prod) {
      var s = suggestions[prod];
      if (!grouped[s.cat]) grouped[s.cat] = [];
      grouped[s.cat].push(s);
    });

    // Ordenar cada grupo alfabéticamente
    Object.keys(grouped).forEach(function(cat) {
      grouped[cat].sort(function(a, b) {
        return a.prod < b.prod ? -1 : 1;
      });
    });

    return {
      success: true,
      grouped: grouped,
      anchors: anchors,
      missingProds: missingProds,
      generatedAt: new Date().toISOString()
    };
  } catch(e) {
    return { success: false, error: e.message };
  }
}

/**
 * Guarda los anclajes de pedido (mínimos fijos) en Config
 */
function saveOrderAnchors(anchorsObj, targetId) {
  try {
    return saveConfig('orderAnchors', anchorsObj, targetId);
  } catch(e) {
    return { success: false, error: e.message };
  }
}

/**
 * Obtiene los anclajes guardados
 */
function getOrderAnchors(targetId) {
  try {
    var ss = SpreadsheetApp.openById(getSheetId(targetId));
    var sheet = getOrCreateSheet(ss, 'Config');
    var data = sheet.getDataRange().getValues();
    for (var i = 0; i < data.length; i++) {
      if (data[i][0] === 'orderAnchors') {
        try { return { success: true, anchors: JSON.parse(data[i][1]) }; } catch(e) {}
      }
    }
    return { success: true, anchors: {} };
  } catch(e) {
    return { success: false, error: e.message, anchors: {} };
  }
}

