var MASTER_ID = '1oVhQLOGo4FzaHqB8rCloxnPpkomEB7z57ZM8Jk8a0fU';

// ═══════════════════════════════════════════════════════════════════════════
// NEW MODULAR ARCHITECTURE (Clean Architecture & GAS Patterns)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * REPOSITORY LAYER: Centralizes all Spreadsheet interactions.
 * Every call to SpreadsheetApp should go through here.
 */
var FeDe_Repo = {
  getSS: function(id) {
    try {
      return SpreadsheetApp.openById(getSheetId(id));
    } catch(e) {
      Logger_FeDe.error('Fallo crítico cargando Spreadsheet', { id: id, error: e.message });
      throw new Error('No se pudo conectar con la base de datos.');
    }
  },

  getSheet: function(ss, name) {
    var sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
      if (name === 'History') {
        sheet.appendRow(['ID', 'Fecha', 'Modo', 'Turno', 'Total', 'Data_JSON']);
        sheet.getRange(1, 1, 1, 6).setFontWeight('bold').setBackground('#f3f3f3');
      }
    }
    return sheet;
  },

  /**
   * BATCH READ: Lee toda la configuración de una sola vez (Eficiente)
   */
  getAllConfig: function(ss) {
    var sheet = this.getSheet(ss, 'Config');
    return sheet.getDataRange().getValues();
  },

  /**
   * BATCH WRITE: Encuentra y actualiza una clave en la hoja Config
   */
  saveConfigValue: function(ss, key, value) {
    var sheet = this.getSheet(ss, 'Config');
    var data = sheet.getDataRange().getValues();
    var valStr = JSON.stringify(value);
    
    for (var i = 0; i < data.length; i++) {
      if (data[i][0] == key) {
        sheet.getRange(i + 1, 2).setValue(valStr);
        return true;
      }
    }
    sheet.appendRow([key, valStr]);
    SpreadsheetApp.flush();
    return true;
  }
};

/**
 * SERVICE LAYER: Orchestrates domain logic and interacts with the Repository.
 */
var FeDe_Services = {
  getInitialState: function(targetId) {
    var ss = FeDe_Repo.getSS(targetId);
    var configRows = FeDe_Repo.getAllConfig(ss);
    
    var config = {};
    configRows.forEach(function(row) {
      if (row[0] && typeof row[0] === 'string') {
        try { config[row[0]] = JSON.parse(row[1]); }
        catch(e) { config[row[0]] = row[1]; }
      }
    });

    // Validar integridad de categorías
    if (!config.cats || typeof config.cats !== 'object') {
      config = this.initializeDefaultConfig(FeDe_Repo.getSheet(ss, 'Config'));
    }

    return {
      ssName: ss.getName(),
      config: config
    };
  },

  /**
   * Genera una configuración por defecto si la hoja está vacía.
   */
  initializeDefaultConfig: function(sheet) {
    var defaultConfig = {
      app_theme: 'mcf',
      app_title: 'FeDe Gastro Pro',
      cats: {
        "Personal": { icon: "chess-pawn", color: "#64748b" },
        "Otros": { icon: "package", color: "#94a3b8" }
      },
      favs: [],
      units: ["unidad/es", "kg", "litro/s", "porción/es", "pack/s"],
      orderDays: [1, 4]
    };
    
    sheet.clear();
    sheet.appendRow(['Clave', 'Valor']);
    Object.keys(defaultConfig).forEach(function(key) {
      sheet.appendRow([key, JSON.stringify(defaultConfig[key])]);
    });
    
    return defaultConfig;
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// DOMAIN LAYER (Pure Business Logic)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * DOMAIN LAYER: Core business logic, agnostic of infrastructure or frameworks.
 */
var FeDe_Domain = {
  OrderSuggestion: {
    /**
     * Calcula la cantidad sugerida de pedido basada en un promedio ponderado de 4 semanas.
     * @returns {number} La cantidad final sugerida, respetando anclajes.
     */
    calculateQuantity: function(w1, w2, w3, w4, anchorQty) {
      var weighted = (w1 * 1.0) + (w2 * 0.5) + (w3 * 0.25) + (w4 * 0.25);
      var weeklyAvg = weighted / 2.0;

      var suggested = weeklyAvg < 10 ? Math.round(weeklyAvg * 2) / 2 : Math.ceil(weeklyAvg);
      if (suggested <= 0) suggested = 0;

      if (anchorQty && anchorQty > suggested) {
        return anchorQty;
      }
      return suggested;
    }
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// LOGGING, VALIDATION & UTILITIES
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
    if (typeof value !== 'string') return value;
    return value.trim()
      .replace(/[<>\"']/g, '')
      .replace(/javascript:/gi, '')
      .replace(/onload=/gi, '');
  },
  validateSheetId: function(id) {
    return typeof id === 'string' && /^[a-zA-Z0-9-_]{25,}$/.test(id);
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
  // ── RELEASE: v11.0.18 ──
  // ── ROUTING PARA PWA / ANDROID ──
  if (e && e.parameter) {
    if (e.parameter.path === 'manifest.json') {
      var manifest = {
        "id": "com.fede.focaccia.v10",
        "name": "FeDe Gastro Pro - v11.0.18 — CSS RESPONSIVO & ERGONÓMICO",
        "short_name": "FOCACCIA",
        "start_url": "./",
        "display": "standalone",
        "background_color": "#0f1115",
        "theme_color": "#ffffff",
        "description": "Sistema de gestión operativa - FOCACCIA Edition v11.0.18",
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
  var style = (e && e.parameter && e.parameter.style) || null;
  if (!style) {
    // Primero intentar desde PropertiesService (gratis, sin quota)
    try {
      var savedTheme = PropertiesService.getScriptProperties().getProperty('app_theme');
      if (savedTheme) { style = savedTheme; }
    } catch(err) {}
  }
  if (!style) {
    // Fallback: leer desde Sheets (más lento, sólo si es necesario)
    try {
      var cache = CacheService.getScriptCache();
      var cachedTheme = cache.get('app_theme_global');
      if (cachedTheme) {
        style = cachedTheme;
      } else {
        var sheetId = (e && e.parameter && e.parameter.activeSheetId) ? e.parameter.activeSheetId : null;
        var state = FeDe_Services.getInitialState(sheetId);
        style = state.config.app_theme || 'mcf';
        // Guardar en caché y Properties para próximas cargas
        cache.put('app_theme_global', style, 3600);
        PropertiesService.getScriptProperties().setProperty('app_theme', style);
      }
    } catch(err) { style = 'mcf'; }
  }
  var template = HtmlService.createTemplateFromFile('Index');
  template.theme = style;
  
  return template.evaluate()
    .setTitle('FeDe Gastro Pro - FOCACCIA v11.0.18')
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
 * Obtiene eventos del Google Calendar primario para los próximos 7 días
 */
function getCalendarEvents() {
  try {
    var now = new Date();
    var nextWeek = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000));
    var events = CalendarApp.getDefaultCalendar().getEvents(now, nextWeek);
    
    return {
      success: true,
      events: events.map(function(e) {
        return {
          title: e.getTitle(),
          start: e.getStartTime().toISOString(),
          end: e.getEndTime().toISOString(),
          isAllDay: e.isAllDayEvent()
        };
      })
    };
  } catch (err) {
    Logger_FeDe.error('Error al obtener eventos de calendario', { error: err.message });
    return { success: false, message: err.message, events: [] };
  }
}

/** 
 * Obtiene toda la configuración y el historial de una sola vez 
 * Refactorizado para usar Capa de Servicios y Repositorio
 */
function getAppConfig(targetId) {
  var cache = CacheService.getScriptCache();
  var sheetId = getSheetId(targetId);
  var cacheKey = 'app_config_v11_' + sheetId; // Nueva llave para evitar conflictos
  
  try {
    // 1. OBTENER DE CACHÉ
    var cached = cache.get(cacheKey);
    if (cached) return JSON.parse(cached);

    Logger_FeDe.info('Cargando de SHEETS');
    var ss = FeDe_Repo.getSS(targetId);
    
    // 2. MIGRACIÓN FLUIDA (Opcional, no bloqueante)
    try { MigrationService.runCheck(targetId); } catch(e) {}

    // 3. OBTENER ESTADO
    var state = FeDe_Services.getInitialState(targetId);
    var history = [];
    
    try {
      var histSheet = ss.getSheetByName('History');
      if (histSheet) {
        var lastRow = histSheet.getLastRow();
        if (lastRow > 1) {
          var rowsToRead = Math.min(50, lastRow - 1);
          var histData = histSheet.getRange(lastRow - rowsToRead + 1, 1, rowsToRead, 6).getValues();
          history = histData.map(function(row) {
            return {
              id: String(row[0]),
              fecha: String(row[1]),
              mode: String(row[2]).toLowerCase(),
              turno: String(row[3]),
              total: Number(row[4]) || 0,
              items: (function() { try { return JSON.parse(row[5] || '[]'); } catch(e) { return []; } })()
            };
          }).reverse();
        }
      }
    } catch(e) { Logger_FeDe.warn('Error leyendo historial'); }

    var response = { 
      success: true, 
      ssName: ss.getName(), 
      config: state.config, 
      history: history, 
      timestamp: new Date().toISOString() 
    };

    cache.put(cacheKey, JSON.stringify(response), 300);
    return response;
  } catch(e) {
    Logger_FeDe.error('Fallo crítico en getAppConfig', { error: e.message });
    return { success: false, error: e.message };
  }
}

function getAppState() { return getAppConfig(); }

function saveConfig(key, value, targetId) {
  try {
    // Interfaz dual: soporta objeto (FeDe_API) o argumentos posicionales
    if (key && typeof key === 'object' && value !== undefined && targetId === undefined) {
      targetId = value;
      value = key.value;
      key = key.key;
    }

    if (!Validator.isString(key)) throw new Error('Clave inválida');
    
    var ss = FeDe_Repo.getSS(targetId);
    FeDe_Repo.saveConfigValue(ss, key, value);
    
    // Invalidar caché de config
    var sheetId = getSheetId(targetId);
    CacheService.getScriptCache().remove('app_config_v11_' + sheetId);

    // Si es el tema, sincronizar también en PropertiesService y caché global
    if (key === 'app_theme' && typeof value === 'string') {
      try {
        PropertiesService.getScriptProperties().setProperty('app_theme', value);
        CacheService.getScriptCache().put('app_theme_global', value, 3600);
      } catch(pe) {}
    }
    
    Logger_FeDe.info('Configuración guardada', { key: key });
    return { success: true };
  } catch(e) { 
    Logger_FeDe.error('Error guardando config', { error: e.message });
    return { success: false, error: e.message }; 
  }
}


function addHistoryEntry(entry, targetId) {
  try {
    if (!Validator.isObject(entry)) throw new Error('Entrada inválida');
    
    var ss = FeDe_Repo.getSS(targetId);
    var sheet = FeDe_Repo.getSheet(ss, 'History');
    var entryId = entry.id || IdGenerator.generateEntryId();
    
    // 🛡️ ANTI-DUPLICADO: BATCH READ (Optimizado)
    var lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      var existingIds = sheet.getRange(1, 1, lastRow, 1).getValues();
      for (var i = 0; i < existingIds.length; i++) {
        if (existingIds[i][0] == entryId) return { success: true, entryId: entryId, duplicated: true };
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
    
    // Limpieza (Mantenimiento preventivo)
    if (sheet.getLastRow() > 300) {
      sheet.deleteRows(2, sheet.getLastRow() - 300);
    }
    
    SpreadsheetApp.flush();
    return { success: true, entryId: entryId };
  } catch(e) { 
    Logger_FeDe.error('Fallo en addHistoryEntry', { error: e.message });
    return { success: false, error: e.message }; 
  }
}

function deleteHistoryEntry(entryId, targetId) {
  try {
    var ss = FeDe_Repo.getSS(targetId);
    var sheet = FeDe_Repo.getSheet(ss, 'History');
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

/**
 * MIGRATION LAYER: Asegura que los datos viejos se adapten a nuevas versiones.
 */
var MigrationService = {
  runCheck: function(targetId) {
    try {
      var ss = FeDe_Repo.getSS(targetId);
      var configSheet = FeDe_Repo.getSheet(ss, 'Config');
      var data = configSheet.getDataRange().getValues();
      var versionRow = -1;
      var currentVersion = '10.0.0';

      for (var i = 0; i < data.length; i++) {
        if (data[i][0] === 'db_version') {
          currentVersion = JSON.parse(data[i][1]);
          versionRow = i + 1;
          break;
        }
      }

      if (currentVersion === '10.0.0') {
        Logger_FeDe.info('Ejecutando migración: 10.0.0 -> 10.0.1');
        if (versionRow > 0) configSheet.getRange(versionRow, 2).setValue(JSON.stringify('10.0.1'));
        else configSheet.appendRow(['db_version', JSON.stringify('10.0.1')]);
      }
      
      return { success: true, version: '10.0.1' };
    } catch(e) {
      Logger_FeDe.error('Error en migración', { error: e.message });
      return { success: false, error: e.message };
    }
  }
};

function logCatEdit(catName, targetId) {
  try {
    var ss = FeDe_Repo.getSS(targetId);
    var sheet = FeDe_Repo.getSheet(ss, 'Config');
    var data = sheet.getDataRange().getValues();
    var edits = {};
    var rowIdx = -1;
    for (var i = 0; i < data.length; i++) {
      if (data[i][0] == 'catEditLog') {
        try { edits = JSON.parse(data[i][1]); } catch(e) { edits = {}; }
        rowIdx = i + 1;
        break;
      }
    }
    edits[catName] = new Date().toISOString();
    
    // Mantener solo los últimos 10
    var sortedKeys = Object.keys(edits).sort(function(a,b) { 
      return new Date(edits[b]) - new Date(edits[a]); 
    }).slice(0, 10);
    
    var newEdits = {};
    sortedKeys.forEach(function(k) { newEdits[k] = edits[k]; });
    
    var valStr = JSON.stringify(newEdits);
    if (rowIdx > 0) sheet.getRange(rowIdx, 2).setValue(valStr);
    else sheet.appendRow(['catEditLog', valStr]);
    
    return {success: true};
  } catch(e) { 
    Logger_FeDe.error('Fallo en logCatEdit', { error: e.message });
    return {success: false, error: e.message}; 
  }
}

function deleteHistory(type, targetId) {
  try {
    // Interfaz dual para FeDe_API
    if (type && typeof type === 'object' && targetId === undefined) {
      targetId = type.targetId || null;
      type = type.type || 'all';
    }

    var ss = FeDe_Repo.getSS(targetId);
    var sheet = FeDe_Repo.getSheet(ss, 'History');
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) return { success: true, count: 0 };

    if (type === 'all') {
      sheet.getRange(2, 1, lastRow - 1, 6).clearContent();
      return { success: true, count: lastRow - 1 };
    } else {
      var data = sheet.getRange(2, 1, lastRow - 1, 6).getValues();
      var count = 0;
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
    Logger_FeDe.error('Fallo en deleteHistory', { error: e.message });
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
  try {
    // Interfaz dual para FeDe_API
    if (name && typeof name === 'object' && icon !== undefined && targetId === undefined) {
      targetId = icon;
      icon = name.icon;
      name = name.name;
    }

    if (!isValidName(name)) return {success: false, error: "Nombre vacío"};
    var config = getAppConfig(targetId).config;
    if (config.cats[name]) return {success: false, error: "Ya existe"};
    config.cats[name] = {icon: icon || "package", order: Object.keys(config.cats).length + 1, prods: []};
    saveConfig('cats', config.cats, targetId);
    logCatEdit(name, targetId);
    return {success: true, data: config.cats};
  } catch(e) { return {success: false, error: e.message}; }
}

function updateCategory(oldName, newName, newIcon, newSize, targetId) {
  try {
    // Interfaz dual para FeDe_API
    if (oldName && typeof oldName === 'object' && newName !== undefined && targetId === undefined) {
      targetId = newName;
      newSize = oldName.newSize;
      newIcon = oldName.newIcon;
      newName = oldName.newName;
      oldName = oldName.oldName;
    }

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
  } catch(e) { return {success: false, error: e.message}; }
}

function deleteCategory(name, targetId) {
  try {
    // Interfaz dual para FeDe_API
    if (name && typeof name === 'object' && targetId === undefined) {
      targetId = name.targetId || null;
      name = name.name;
    }

    var config = getAppConfig(targetId).config;
    if (!config.cats[name]) return {success: false, error: "No existe"};
    if (config.cats[name].prods.length > 0) return {success: false, error: "No vacía"};
    delete config.cats[name];
    saveConfig('cats', config.cats, targetId);
    return {success: true, data: config.cats};
  } catch(e) { return {success: false, error: e.message}; }
}

function createProduct(catName, productName, targetId) {
  try {
    // Interfaz dual para FeDe_API
    if (catName && typeof catName === 'object' && productName !== undefined && targetId === undefined) {
      targetId = productName;
      productName = catName.productName;
      catName = catName.catName;
    }

    if (!isValidName(productName)) return {success: false, error: "Nombre vacío"};
    var config = getAppConfig(targetId).config;
    if (!config.cats[catName]) return {success: false, error: "No existe"};
    config.cats[catName].prods.push(productName);
    saveConfig('cats', config.cats, targetId);
    logCatEdit(catName, targetId);
    return {success: true, data: config.cats};
  } catch(e) { return {success: false, error: e.message}; }
}

function updateProduct(catName, oldName, newName, targetId) {
  try {
    // Interfaz dual para FeDe_API
    if (catName && typeof catName === 'object' && oldName !== undefined && targetId === undefined) {
      targetId = oldName;
      newName = catName.newName;
      oldName = catName.oldName;
      catName = catName.catName;
    }

    if (!isValidName(newName)) return {success: false, error: "Nombre vacío"};
    var config = getAppConfig(targetId).config;
    if (!config.cats[catName]) return {success: false, error: "No existe"};
    var idx = config.cats[catName].prods.indexOf(oldName);
    if (idx !== -1) config.cats[catName].prods[idx] = newName;
    saveConfig('cats', config.cats, targetId);
    logCatEdit(catName, targetId);
    return {success: true, data: config.cats};
  } catch(e) { return {success: false, error: e.message}; }
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
    var ss = FeDe_Repo.getSS(targetId);
    var configRows = FeDe_Repo.getAllConfig(ss);
    var histSheet = FeDe_Repo.getSheet(ss, 'History');

    // ── 1. Parsear configuración ──
    var config = {};
    configRows.forEach(function(row) {
      if (row[0]) {
        try { config[row[0]] = JSON.parse(row[1]); } catch(e) { config[row[0]] = row[1]; }
      }
    });

    var cats = config.cats || {};
    var anchors = config.orderAnchors || {};

    // ── 2. Mapa producto → categoría ──
    var prodCatMap = {};
    Object.keys(cats).forEach(function(catName) {
      (cats[catName].prods || []).forEach(function(p) { prodCatMap[p] = catName; });
    });

    // ── 3. Preparar historial y consumos ──
    var now = new Date();
    var cutoff30 = new Date(now.getTime() - 30 * 24 * 3600 * 1000);
    var cutoff90 = new Date(now.getTime() - 90 * 24 * 3600 * 1000);
    var cutoff15 = new Date(now.getTime() - 15 * 24 * 3600 * 1000);
    var lastRow = histSheet.getLastRow();

    var productData = {};
    var lastSeenMap = {};   
    var stockMap = {};

    if (lastRow > 1) {
      var histData = histSheet.getRange(2, 1, lastRow - 1, 6).getValues();
      histData.forEach(function(row) {
        var fecha = new Date(row[1]);
        if (isNaN(fecha.getTime())) return;

        var mode = String(row[2]).toLowerCase();

        if (mode === 'stock' && fecha >= cutoff90) {
          var stockItems = [];
          try { stockItems = JSON.parse(row[5] || '[]'); } catch(e) {}
          stockItems.forEach(function(item) {
            if (!item.prod) return;
            var qty = parseFloat(item.qty);
            if (isNaN(qty)) return;
            if (!stockMap[item.prod] || fecha > stockMap[item.prod].date) {
              stockMap[item.prod] = { qty: qty, date: fecha, unit: item.unit || '' };
            }
          });
          return; 
        }

        if (mode !== 'recepcion' && mode !== 'pedido') return;
        if (fecha < cutoff30) return;

        var items = [];
        try { items = JSON.parse(row[5] || '[]'); } catch(e) {}

        var msAgo = now.getTime() - fecha.getTime();
        var daysAgo = msAgo / (24 * 3600 * 1000);
        var week = 1;
        if (daysAgo > 7 && daysAgo <= 14) week = 2;
        else if (daysAgo > 14 && daysAgo <= 21) week = 3;
        else if (daysAgo > 21) week = 4;

        items.forEach(function(item) {
          if (!item.prod) return;
          var qty = parseFloat(item.qty) || 1;
          var prod = item.prod;

          if (!lastSeenMap[prod] || fecha > lastSeenMap[prod]) lastSeenMap[prod] = fecha;

          if (!productData[prod]) {
            productData[prod] = { w1:0, w2:0, w3:0, w4:0, lastUnit: item.unit || 'unidad/es', count: 0 };
          }
          productData[prod]['w' + week] += qty;
          productData[prod].count++;
          if (item.unit) productData[prod].lastUnit = item.unit;
        });
      });
    }

    // ── 4. Generar sugerencias (Usando Domain Layer) ──
    var suggestions = {};
    Object.keys(productData).forEach(function(prod) {
      var d = productData[prod];
      var anchor = anchors[prod] || null;
      var anchorQty = (anchor && anchor.qty) ? anchor.qty : 0;
      
      var finalQty = FeDe_Domain.OrderSuggestion.calculateQuantity(d.w1, d.w2, d.w3, d.w4, anchorQty);
      
      // Calculate suggested again just for metadata
      var weighted = (d.w1 * 1.0) + (d.w2 * 0.5) + (d.w3 * 0.25) + (d.w4 * 0.25);
      var weeklyAvg = weighted / 2.0;
      var pureSuggested = weeklyAvg < 10 ? Math.round(weeklyAvg * 2) / 2 : Math.ceil(weeklyAvg);
      if (pureSuggested <= 0) pureSuggested = 0;

      var stockEntry = stockMap[prod] || null;
      suggestions[prod] = {
        prod: prod,
        cat: prodCatMap[prod] || 'Otros',
        qty: finalQty,
        suggested: pureSuggested,
        unit: d.lastUnit,
        isAnchored: !!(anchor && anchor.qty > 0),
        anchorMin: anchor ? anchor.qty : 0,
        dataPoints: d.count,
        lastStock: stockEntry ? stockEntry.qty : null,
        lastStockDate: stockEntry ? stockEntry.date.toISOString() : null,
        lastStockUnit: stockEntry ? stockEntry.unit : null
      };
    });

    // ── 5. Agregar anclajes residuales ──
    Object.keys(anchors).forEach(function(prod) {
      if (!suggestions[prod] && anchors[prod].qty > 0) {
        var stockEntry2 = stockMap[prod] || null;
        suggestions[prod] = {
          prod: prod,
          cat: prodCatMap[prod] || 'Anclado',
          qty: anchors[prod].qty,
          suggested: 0,
          unit: anchors[prod].unit || 'unidad/es',
          isAnchored: true,
          anchorMin: anchors[prod].qty,
          dataPoints: 0,
          lastStock: stockEntry2 ? stockEntry2.qty : null,
          lastStockDate: stockEntry2 ? stockEntry2.date.toISOString() : null,
          lastStockUnit: stockEntry2 ? stockEntry2.unit : null
        };
      }
    });

    // ── 6. Baja actividad ──
    var missingProds = [];
    Object.keys(lastSeenMap).forEach(function(prod) {
      if (lastSeenMap[prod] < cutoff15) {
        missingProds.push({ prod: prod, lastSeen: lastSeenMap[prod].toISOString() });
      }
    });

    // ── 7. Agrupar y ordenar ──
    var grouped = {};
    Object.keys(suggestions).forEach(function(prod) {
      var s = suggestions[prod];
      if (!grouped[s.cat]) grouped[s.cat] = [];
      grouped[s.cat].push(s);
    });

    Object.keys(grouped).forEach(function(cat) {
      grouped[cat].sort(function(a, b) { return a.prod < b.prod ? -1 : 1; });
    });

    return { 
      success: true, 
      grouped: grouped,
      anchors: anchors,
      missingProds: missingProds 
    };
  } catch(e) {
    Logger_FeDe.error('Fallo en getSmartOrderSuggestions', { error: e.message });
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

/**
 * API GENÉRICA PARA GUARDAR CONFIGURACIÓN
 */
function saveConfig(params, targetId) {
  try {
    var ss = FeDe_Repo.getSS(targetId);
    FeDe_Repo.saveConfigValue(ss, params.key, params.value);
    return { success: true };
  } catch(e) {
    return { success: false, error: e.message };
  }
}
