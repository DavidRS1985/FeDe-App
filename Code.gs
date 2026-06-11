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
        SpreadsheetApp.flush();
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

    // Si cats falta o está corrupto, solo inyectar el default sin tocar el resto del config.
    // initializeDefaultConfig hace sheet.clear() — borraría valores personalizados como app_title.
    if (!config.cats || typeof config.cats !== 'object') {
      var defaultCats = {
        'Personal': { icon: 'chess-pawn', color: '#64748b' },
        'Otros':    { icon: 'package',    color: '#94a3b8'  }
      };
      config.cats = defaultCats;
      FeDe_Repo.saveConfigValue(ss, 'cats', defaultCats);
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
      orderDays: [1, 4],
      pack_factors: {
        "huevos": { "unidad/es": { "maple/s": 30, "docena/s": 12 } },
        "papa":   { "kg": { "bolsa/s": 20 } },
        "harina": { "kg": { "bolsa/s": 25 } }
      }
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

function readProductionLog(ss) {
  var sh = ss.getSheetByName('PRODUCCION');
  if (!sh) {
    sh = ss.insertSheet('PRODUCCION');
    sh.appendRow(['lot_id', 'sku_id', 'recipe_consumed', 'actual_consumed', 'units_produced', 'production_ts', 'station']);
    return [];
  }
  if (sh.getLastRow() < 2) return [];
  var data = sh.getRange(2, 1, sh.getLastRow() - 1, 7).getValues();
  return data
    .filter(function(row) { return row[0] && row[1]; })
    .map(function(row) {
      return {
        lot_id:          String(row[0]),
        sku_id:          String(row[1]),
        recipe_consumed: Number(row[2]) || 0,
        actual_consumed: Number(row[3]) || 0,
        units_produced:  Number(row[4]) || 0,
        production_ts:   row[5] ? new Date(row[5]).toISOString() : '',
        station:         row[6] ? String(row[6]) : ''
      };
    });
}

function saveProductionLot(lotData, targetId) {
  try {
    var ss = FeDe_Repo.getSS(targetId);
    var sh = ss.getSheetByName('PRODUCCION');
    if (!sh) {
      sh = ss.insertSheet('PRODUCCION');
      sh.appendRow(['lot_id', 'sku_id', 'recipe_consumed', 'actual_consumed', 'units_produced', 'production_ts', 'station']);
    }
    var lotId = 'lote-' + new Date().getTime().toString(36);
    var ts = new Date().toISOString();
    sh.appendRow([
      lotId,
      String(lotData.sku_id || ''),
      Number(lotData.recipe_consumed) || 0,
      Number(lotData.actual_consumed) || 0,
      Number(lotData.units_produced) || 0,
      ts,
      String(lotData.station || '')
    ]);
    try {
      var cache = CacheService.getScriptCache();
      cache.remove('app_config_v12_' + (targetId || ''));
    } catch(ce) {}
    return { success: true, lot_id: lotId, production_ts: ts };
  } catch(e) {
    Logger_FeDe.error('saveProductionLot failed', { error: e.message });
    return { success: false, error: e.message };
  }
}

function doGet(e) {
  // ── RELEASE: v12.0.0 ──
  // ── ROUTING PARA PWA / ANDROID ──
  if (e && e.parameter) {
    if (e.parameter.path === 'manifest.json') {
      var manifest = {
        "id": "com.fede.focaccia.v10",
        "name": "FeDe Gastro Pro - v12.0.0 — Smart Replenishment",
        "short_name": "FOCACCIA",
        "start_url": "./",
        "display": "standalone",
        "background_color": "#0f1115",
        "theme_color": "#ffffff",
        "description": "Sistema de gestión operativa - v12.0.0 Smart Replenishment",
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
    .setTitle('FeDe Gastro Pro - v12.0.0 Smart Replenishment')
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
 * Obtiene eventos del Google Calendar (específico o primario) para los próximos 7 días
 */
function getCalendarEvents(targetId) {
  try {
    var state = FeDe_Services.getInitialState(targetId);
    var calId = state.config.calendar_id;
    var cal = calId ? CalendarApp.getCalendarById(calId) : CalendarApp.getDefaultCalendar();
    
    if (!cal) throw new Error('No se pudo encontrar el calendario configurado.');

    var now = new Date();
    var nextWeek = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000));
    var events = cal.getEvents(now, nextWeek);
    
    return {
      success: true,
      events: events.map(function(e) {
        return {
          title:       e.getTitle(),
          start:       e.getStartTime().toISOString(),
          end:         e.getEndTime().toISOString(),
          isAllDay:    e.isAllDayEvent(),
          description: e.getDescription() || '',
          location:    e.getLocation()    || '',
          eventId:     e.getId()
        };
      })
    };
  } catch (err) {
    Logger_FeDe.error('Error al obtener eventos de calendario', { error: err.message });
    return { success: false, message: err.message, events: [] };
  }
}

/**
 * Crea un evento en Google Calendar a partir de los datos de una reserva
 */
function saveReservation(params, targetId) {
  try {
    var state = FeDe_Services.getInitialState(targetId);
    var calId = state.config.calendar_id;
    var cal = calId ? CalendarApp.getCalendarById(calId) : CalendarApp.getDefaultCalendar();

    if (!cal) throw new Error('No se pudo encontrar el calendario configurado.');

    var title   = params.title   || 'Reserva';
    var date    = params.date;    // 'YYYY-MM-DD'
    var time    = params.time;    // 'HH:MM' — ignorado si isAllDay
    var isAllDay = params.isAllDay || false;
    var notes   = params.notes   || '';

    var parts = date.split('-');
    var year  = parseInt(parts[0], 10);
    var month = parseInt(parts[1], 10) - 1;
    var day   = parseInt(parts[2], 10);

    var event;
    if (isAllDay) {
      event = cal.createAllDayEvent(title, new Date(year, month, day));
    } else {
      var timeParts = (time || '20:00').split(':');
      var hour = parseInt(timeParts[0], 10);
      var min  = parseInt(timeParts[1], 10);
      var start = new Date(year, month, day, hour, min);
      var end   = new Date(start.getTime() + 2 * 60 * 60 * 1000); // +2hs por defecto
      event = cal.createEvent(title, start, end);
    }

    if (notes) event.setDescription(notes);

    return { success: true, eventId: event.getId() };
  } catch (err) {
    Logger_FeDe.error('Error al guardar reserva en Calendar', { error: err.message });
    return { success: false, error: err.message };
  }
}

/**
 * Actualiza título, fecha, hora y notas de una reserva existente.
 */
function updateReservation(params, targetId) {
  try {
    var state = FeDe_Services.getInitialState(targetId);
    var calId = state.config.calendar_id;
    var cal = calId ? CalendarApp.getCalendarById(calId) : CalendarApp.getDefaultCalendar();
    if (!cal) return { success: false, error: 'Calendario no encontrado' };
    var event = cal.getEventById(params.eventId);
    if (!event) return { success: false, error: 'Evento no encontrado' };

    if (params.title) event.setTitle(params.title);
    if (params.notes !== undefined) event.setDescription(params.notes || '');

    // Actualizar fecha/hora si se proveen
    if (params.date) {
      var parts = params.date.split('-');
      var year = parseInt(parts[0], 10), month = parseInt(parts[1], 10) - 1, day = parseInt(parts[2], 10);
      if (params.isAllDay) {
        event.setAllDayDate(new Date(year, month, day));
      } else {
        var tp = (params.time || '20:00').split(':');
        var start = new Date(year, month, day, parseInt(tp[0], 10), parseInt(tp[1], 10));
        var end   = new Date(start.getTime() + 2 * 60 * 60 * 1000);
        event.setTime(start, end);
      }
    }

    return { success: true };
  } catch (err) {
    Logger_FeDe.error('Error al actualizar reserva', { error: err.message });
    return { success: false, error: err.message };
  }
}

/**
 * Elimina una reserva del Google Calendar por eventId.
 */
function deleteReservation(params, targetId) {
  try {
    var state = FeDe_Services.getInitialState(targetId);
    var calId = state.config.calendar_id;
    var cal = calId ? CalendarApp.getCalendarById(calId) : CalendarApp.getDefaultCalendar();
    if (!cal) return { success: false, error: 'Calendario no encontrado' };
    var event = cal.getEventById(params.eventId);
    if (!event) return { success: false, error: 'Evento no encontrado en el calendario' };
    event.deleteEvent();
    return { success: true };
  } catch (err) {
    Logger_FeDe.error('Error al eliminar reserva', { error: err.message });
    return { success: false, error: err.message };
  }
}

/**
 * Obtiene toda la configuración y el historial de una sola vez
 * Refactorizado para usar Capa de Servicios y Repositorio
 */
function getAppConfig(targetId) {
  var cache = CacheService.getScriptCache();
  var sheetId = getSheetId(targetId);
  var cacheKey = 'app_config_v12_' + sheetId; // Nueva llave para evitar conflictos
  
  // Limpiar cache corrupta antes de intentar leer
  try { cache.remove(cacheKey); } catch(e) {}

  try {
    Logger_FeDe.info('Cargando de SHEETS');
    var ss = FeDe_Repo.getSS(targetId);

    // MIGRACIÓN FLUIDA (Opcional, no bloqueante)
    try { MigrationService.runCheck(targetId); } catch(e) {}

    // OBTENER ESTADO
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

    var prodLog = [];
    try { prodLog = readProductionLog(ss); } catch(e) { Logger_FeDe.warn('Error leyendo PRODUCCION'); }

    var response = {
      success: true,
      ssName: ss.getName(),
      config: state.config,
      history: history,
      prod_log: prodLog,
      pack_factors: state.config.pack_factors || {
        "huevos": { "unidad/es": { "maple/s": 30, "docena/s": 12 } },
        "papa":   { "kg": { "bolsa/s": 20 } },
        "harina": { "kg": { "bolsa/s": 25 } }
      },
      timestamp: new Date().toISOString()
    };

    // Intentar cachear solo los campos livianos (sin recetas que pueden ser grandes)
    try {
      var configLite = {};
      var configKeys = Object.keys(state.config);
      for (var _ci = 0; _ci < configKeys.length; _ci++) {
        if (configKeys[_ci] !== 'recetas') configLite[configKeys[_ci]] = state.config[configKeys[_ci]];
      }
      var cacheable = { success: true, ssName: response.ssName, config: configLite,
        history: history, prod_log: prodLog, pack_factors: response.pack_factors, timestamp: response.timestamp };
      cache.put(cacheKey, JSON.stringify(cacheable), 300);
    } catch(ce) {
      Logger_FeDe.warn('Cache omitida: ' + ce.message);
    }

    return response;
  } catch(e) {
    Logger_FeDe.error('Fallo crítico en getAppConfig', { error: e.message });
    return { success: false, error: e.message };
  }
}

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
    CacheService.getScriptCache().remove('app_config_v12_' + sheetId);

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

function updateHistoryEntry(params, targetId) {
  try {
    var entryId = params && params.entryId;
    var patch   = params && params.patch;
    if (!entryId) throw new Error('ID requerido');
    if (!Validator.isObject(patch)) throw new Error('Patch inválido');
    var ss = FeDe_Repo.getSS(targetId);
    var sheet = FeDe_Repo.getSheet(ss, 'History');
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] == entryId) {
        var row = i + 1;
        var existing = sheet.getRange(row, 2, 1, 5).getValues()[0];
        var newRow = [
          patch.fecha  !== undefined ? patch.fecha                      : existing[0],
          patch.mode   !== undefined ? String(patch.mode).toLowerCase() : existing[1],
          patch.turno  !== undefined ? patch.turno                      : existing[2],
          patch.total  !== undefined ? (Number(patch.total) || 0)       : existing[3],
          patch.items  !== undefined ? JSON.stringify(patch.items)      : existing[4]
        ];
        sheet.getRange(row, 2, 1, 5).setValues([newRow]);
        SpreadsheetApp.flush();
        return { success: true, entryId: entryId };
      }
    }
    return { success: false, error: 'Registro no encontrado: ' + entryId };
  } catch(e) {
    Logger_FeDe.error('Fallo en updateHistoryEntry', { error: e.message });
    return { success: false, error: e.message };
  }
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
  try {
    // Interfaz dual para FeDe_API
    if (catName && typeof catName === 'object' && productName === undefined && targetId === undefined) {
      targetId = catName.targetId || null;
      productName = catName.productName;
      catName = catName.catName;
    } else if (catName && typeof catName === 'object' && productName !== undefined && targetId === undefined) {
      targetId = productName;
      productName = catName.productName;
      catName = catName.catName;
    }

    var config = getAppConfig(targetId).config;
    if (!config.cats[catName]) return {success: false, error: "No existe"};
    
    // Buscar la primera coincidencia y eliminarla (permite limpiar duplicados uno a uno)
    var idx = config.cats[catName].prods.indexOf(productName);
    if (idx !== -1) {
        config.cats[catName].prods.splice(idx, 1);
    }
    
    saveConfig('cats', config.cats, targetId);
    logCatEdit(catName, targetId);
    return {success: true, data: config.cats};
  } catch(e) { return {success: false, error: e.message}; }
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
  
  var recentOps = [];
  var sortedHistory = history.slice().sort(function(a,b) { return new Date(b.fecha) - new Date(a.fecha); });
  for (var i = 0; i < sortedHistory.length && recentOps.length < 4; i++) {
    var h = sortedHistory[i];
    recentOps.push({
      mode: h.mode || 'stock',
      ts: h.fecha
    });
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

  return { success: true, ssName: config.ssName, data: { totalItems: totalItems, movementsToday: movementsToday, allCategories: Object.keys(cats), recentOps: recentOps, calendar: calendar } };
}

/**
 * 🧹 HERRAMIENTA DE MANTENIMIENTO: Eliminar duplicados por ID
 */
function deduplicateHistory(targetId) {
  try {
    var ss = SpreadsheetApp.openById(getSheetId(targetId));
    var sheet = FeDe_Repo.getSheet(ss, 'History');
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
    var sheet = FeDe_Repo.getSheet(ss, 'Config');
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

// ─────────────────────────────────────────────────────────────────────────────
// SEED: Carga inicial de recetas desde el Cuaderno FeDe
// Ejecutar UNA SOLA VEZ desde el editor de GAS.
// No sobreescribe recetas existentes con el mismo nombre.
// ─────────────────────────────────────────────────────────────────────────────
function seedRecetas() {
  var recetasNuevas = {

    // ── SALSAS BASE ──────────────────────────────────────────────────────────

    'Salsa Pomodoro': {
      name: 'Salsa Pomodoro', yields: 1, yieldUnit: 'lote', active: true,
      updatedAt: new Date().toISOString(),
      ingredients: [
        { prod: 'Tomate triturado',    qty: 2000, unit: 'g' },
        { prod: 'Manzana verde',       qty: 1,    unit: 'u' },
        { prod: 'Zanahoria rallada',   qty: 70,   unit: 'g' },
        { prod: 'Cebolla',             qty: 400,  unit: 'g' },
        { prod: 'Ajo',                 qty: 4,    unit: 'u' },
        { prod: 'Vino blanco/tinto',   qty: 500,  unit: 'ml' },
        { prod: 'Pimentón',            qty: 0,    unit: 'g' },
        { prod: 'Ají molido',          qty: 0,    unit: 'g' },
        { prod: 'Orégano',             qty: 0,    unit: 'g' },
        { prod: 'Tomillo',             qty: 0,    unit: 'g' }
      ]
    },

    'Salsa Bolognesa': {
      name: 'Salsa Bolognesa', yields: 1, yieldUnit: 'lote', active: true,
      updatedAt: new Date().toISOString(),
      ingredients: [
        { prod: 'Salsa Pomodoro',  qty: 1000, unit: 'g' },
        { prod: 'Carne picada',    qty: 1000, unit: 'g' }
      ]
    },

    'Salsa Arrabiata': {
      name: 'Salsa Arrabiata', yields: 1, yieldUnit: 'porción', active: true,
      updatedAt: new Date().toISOString(),
      ingredients: [
        { prod: 'Salsa Pomodoro',        qty: 180, unit: 'g' },
        { prod: 'Ají picante encurtido', qty: 0,   unit: 'g' }
      ]
    },

    'Salsa Carbonara': {
      name: 'Salsa Carbonara', yields: 1, yieldUnit: 'porción', active: true,
      updatedAt: new Date().toISOString(),
      ingredients: [
        { prod: 'Yemas de huevo',    qty: 3, unit: 'u' },
        { prod: 'Queso sardo',       qty: 0, unit: 'g' },
        { prod: 'Panceta/guanciale', qty: 0, unit: 'g' }
      ]
    },

    'Salsa Caesar': {
      name: 'Salsa Caesar', yields: 1, yieldUnit: 'lote', active: true,
      updatedAt: new Date().toISOString(),
      ingredients: [
        { prod: 'Yemas de huevo',        qty: 3,   unit: 'u' },
        { prod: 'Ajo',                   qty: 15,  unit: 'g' },
        { prod: 'Anchoa',                qty: 30,  unit: 'g' },
        { prod: 'Jugo de limón',         qty: 60,  unit: 'ml' },
        { prod: 'Salsa Worcestershire',  qty: 0,   unit: 'ml' },
        { prod: 'Mostaza Dijon',         qty: 10,  unit: 'g' },
        { prod: 'Aceite de oliva',       qty: 250, unit: 'g' },
        { prod: 'Agua',                  qty: 30,  unit: 'ml' },
        { prod: 'Queso sardo rallado',   qty: 50,  unit: 'g' }
      ]
    },

    'Ali Oli de Ajos Asados': {
      name: 'Ali Oli de Ajos Asados', yields: 1, yieldUnit: 'lote', active: true,
      updatedAt: new Date().toISOString(),
      ingredients: [
        { prod: 'Ajo',          qty: 2,   unit: 'u' },
        { prod: 'Aceite de oliva', qty: 0, unit: 'ml' },
        { prod: 'Romero fresco', qty: 0,  unit: 'g' },
        { prod: 'Leche',        qty: 100, unit: 'ml' },
        { prod: 'Aceite neutro', qty: 100, unit: 'ml' },
        { prod: 'Jugo de limón', qty: 0,  unit: 'ml' }
      ]
    },

    'Crema de Coliflor': {
      name: 'Crema de Coliflor', yields: 1, yieldUnit: 'lote', active: true,
      updatedAt: new Date().toISOString(),
      ingredients: [
        { prod: 'Coliflor',      qty: 1000, unit: 'g' },
        { prod: 'Cebolla',       qty: 250,  unit: 'g' },
        { prod: 'Ajo',           qty: 20,   unit: 'g' },
        { prod: 'Crema de leche', qty: 0,   unit: 'ml' }
      ]
    },

    'Pasta de Hongos': {
      name: 'Pasta de Hongos', yields: 1, yieldUnit: 'lote', active: true,
      updatedAt: new Date().toISOString(),
      ingredients: [
        { prod: 'Hongos hidratados',        qty: 300, unit: 'g' },
        { prod: 'Cebolla blanca',           qty: 200, unit: 'g' },
        { prod: 'Vino blanco',              qty: 80,  unit: 'ml' },
        { prod: 'Caldo de verduras/hongos', qty: 150, unit: 'ml' },
        { prod: 'Sal',                      qty: 5,   unit: 'g' },
        { prod: 'Pimienta',                 qty: 2,   unit: 'g' },
        { prod: 'Tomillo/Romero',           qty: 3,   unit: 'g' },
        { prod: 'Aceite de girasol',        qty: 150, unit: 'g' }
      ]
    },

    // ── PANADERÍA ────────────────────────────────────────────────────────────

    'Chuño': {
      name: 'Chuño', yields: 1, yieldUnit: 'lote', active: true,
      updatedAt: new Date().toISOString(),
      ingredients: [
        { prod: 'Fécula de maíz', qty: 20,  unit: 'g' },
        { prod: 'Agua',           qty: 200, unit: 'g' },
        { prod: 'Azúcar',         qty: 0,   unit: 'g' }
      ]
    },

    'Pan Árabe': {
      name: 'Pan Árabe', yields: 6, yieldUnit: 'unidades', active: true,
      updatedAt: new Date().toISOString(),
      ingredients: [
        { prod: 'Harina 000',     qty: 1000, unit: 'g' },
        { prod: 'Agua tibia',     qty: 600,  unit: 'g' },
        { prod: 'Aceite de oliva', qty: 60,  unit: 'g' },
        { prod: 'Levadura fresca', qty: 30,  unit: 'g' },
        { prod: 'Sal',            qty: 20,   unit: 'g' },
        { prod: 'Azúcar',         qty: 10,   unit: 'g' }
      ]
    },

    'Pan Molde Blanco': {
      name: 'Pan Molde Blanco', yields: 2, yieldUnit: 'moldes', active: true,
      updatedAt: new Date().toISOString(),
      ingredients: [
        { prod: 'Harina 0000', qty: 1000, unit: 'g' },
        { prod: 'Agua',        qty: 600,  unit: 'g' },
        { prod: 'Manteca',     qty: 100,  unit: 'g' },
        { prod: 'Levadura',    qty: 25,   unit: 'g' },
        { prod: 'Sal',         qty: 20,   unit: 'g' }
      ]
    },

    'Pan para Hamburguesas': {
      name: 'Pan para Hamburguesas', yields: 1, yieldUnit: 'lote', active: true,
      updatedAt: new Date().toISOString(),
      ingredients: [
        { prod: 'Harina 0000',      qty: 1000, unit: 'g' },
        { prod: 'Agua',             qty: 600,  unit: 'g' },
        { prod: 'Manteca',          qty: 100,  unit: 'g' },
        { prod: 'Levadura',         qty: 30,   unit: 'g' },
        { prod: 'Sal',              qty: 20,   unit: 'g' },
        { prod: 'Azúcar',           qty: 100,  unit: 'g' },
        { prod: 'Extracto de malta', qty: 10,  unit: 'g' },
        { prod: 'Semillas de sésamo', qty: 0,  unit: 'g' }
      ]
    },

    // ── MASAS Y PASTAS ───────────────────────────────────────────────────────

    'Pizza Sin TACC (Base Papa)': {
      name: 'Pizza Sin TACC (Base Papa)', yields: 1, yieldUnit: 'pizza', active: true,
      updatedAt: new Date().toISOString(),
      ingredients: [
        { prod: 'Papa',           qty: 2,   unit: 'u' },
        { prod: 'Fécula de maíz', qty: 0,   unit: 'g' },
        { prod: 'Queso rallado',  qty: 100, unit: 'g' },
        { prod: 'Aceitunas negras', qty: 0, unit: 'g' }
      ]
    },

    'Pizza Keto (Base Pollo)': {
      name: 'Pizza Keto (Base Pollo)', yields: 1, yieldUnit: 'pizza', active: true,
      updatedAt: new Date().toISOString(),
      ingredients: [
        { prod: 'Pechuga de pollo',    qty: 200, unit: 'g' },
        { prod: 'Huevos',              qty: 3,   unit: 'u' },
        { prod: 'Fécula de maíz',      qty: 0,   unit: 'g' },
        { prod: 'Polvo para hornear',  qty: 0,   unit: 'g' }
      ]
    },

    'Mbeju': {
      name: 'Mbeju', yields: 5, yieldUnit: 'porciones', active: true,
      updatedAt: new Date().toISOString(),
      ingredients: [
        { prod: 'Fécula de mandioca', qty: 300, unit: 'g' },
        { prod: 'Harina de mandioca', qty: 50,  unit: 'g' },
        { prod: 'Huevo',              qty: 1,   unit: 'u' },
        { prod: 'Manteca pomada',     qty: 70,  unit: 'g' },
        { prod: 'Queso sardo',        qty: 400, unit: 'g' },
        { prod: 'Queso dambo',        qty: 50,  unit: 'g' },
        { prod: 'Leche entera',       qty: 200, unit: 'g' },
        { prod: 'Sal',                qty: 3,   unit: 'g' }
      ]
    },

    // ── ENTRADAS & PICOTEO ───────────────────────────────────────────────────

    'Mini Tortilla Española': {
      name: 'Mini Tortilla Española', yields: 1, yieldUnit: 'tortilla', active: true,
      updatedAt: new Date().toISOString(),
      ingredients: [
        { prod: 'Huevos',               qty: 4,  unit: 'u' },
        { prod: 'Papa',                 qty: 100, unit: 'g' },
        { prod: 'Cebolla caramelizada', qty: 80,  unit: 'g' },
        { prod: 'Aceite de oliva',      qty: 0,   unit: 'ml' }
      ]
    },

    'Buñuelos de Espinaca': {
      name: 'Buñuelos de Espinaca', yields: 6, yieldUnit: 'unidades', active: true,
      updatedAt: new Date().toISOString(),
      ingredients: [
        { prod: 'Espinaca (jorela)',     qty: 350, unit: 'g' },
        { prod: 'Meringo',              qty: 200, unit: 'g' },
        { prod: 'Sal',                  qty: 3,   unit: 'g' },
        { prod: 'Pimienta',             qty: 2,   unit: 'g' },
        { prod: 'Huevos',               qty: 2,   unit: 'u' },
        { prod: 'Leche',                qty: 150, unit: 'g' },
        { prod: 'Cebolla caramelizada', qty: 50,  unit: 'g' },
        { prod: 'Queso D\'Amada',       qty: 100, unit: 'g' }
      ]
    },

    'Hummus': {
      name: 'Hummus', yields: 1, yieldUnit: 'lote', active: true,
      updatedAt: new Date().toISOString(),
      ingredients: [
        { prod: 'Garbanzos cocidos',    qty: 500, unit: 'g' },
        { prod: 'Aceite de oliva',      qty: 110, unit: 'ml' },
        { prod: 'Jugo de limón',        qty: 100, unit: 'ml' },
        { prod: 'Ajo',                  qty: 1,   unit: 'u' },
        { prod: 'Sal',                  qty: 10,  unit: 'g' },
        { prod: 'Pimienta',             qty: 2,   unit: 'g' },
        { prod: 'Agua filtrada',        qty: 100, unit: 'ml' },
        { prod: 'Tahini',               qty: 110, unit: 'g' }
      ]
    },

    'Baba Ganoush': {
      name: 'Baba Ganoush', yields: 1, yieldUnit: 'lote', active: true,
      updatedAt: new Date().toISOString(),
      ingredients: [
        { prod: 'Berenjena ahumada', qty: 500, unit: 'g' },
        { prod: 'Aceite de oliva',   qty: 60,  unit: 'ml' },
        { prod: 'Jugo de limón',     qty: 90,  unit: 'ml' },
        { prod: 'Ajo',               qty: 1,   unit: 'u' },
        { prod: 'Perejil',           qty: 10,  unit: 'g' },
        { prod: 'Sal',               qty: 10,  unit: 'g' },
        { prod: 'Pimienta',          qty: 2,   unit: 'g' },
        { prod: 'Tahini',            qty: 60,  unit: 'g' }
      ]
    },

    // ── CONSERVAS & ENCURTIDOS ───────────────────────────────────────────────

    'Encurtidos (Coliflor/Zanahoria)': {
      name: 'Encurtidos (Coliflor/Zanahoria)', yields: 1, yieldUnit: 'frasco', active: true,
      updatedAt: new Date().toISOString(),
      ingredients: [
        { prod: 'Vinagre',    qty: 0, unit: 'ml' },
        { prod: 'Agua',       qty: 0, unit: 'ml' },
        { prod: 'Sal',        qty: 0, unit: 'g' },
        { prod: 'Azúcar',     qty: 0, unit: 'g' },
        { prod: 'Coliflor',   qty: 0, unit: 'g' },
        { prod: 'Zanahoria',  qty: 0, unit: 'g' }
      ]
    },

    'Berenjenas en Escabeche': {
      name: 'Berenjenas en Escabeche', yields: 1, yieldUnit: 'frasco', active: true,
      updatedAt: new Date().toISOString(),
      ingredients: [
        { prod: 'Berenjena',      qty: 0, unit: 'g' },
        { prod: 'Sal gruesa',     qty: 0, unit: 'g' },
        { prod: 'Vinagre',        qty: 0, unit: 'ml' },
        { prod: 'Aceite de girasol', qty: 0, unit: 'ml' },
        { prod: 'Ajo',            qty: 0, unit: 'u' }
      ]
    },

    'Zanahorias Glaseadas': {
      name: 'Zanahorias Glaseadas', yields: 1, yieldUnit: 'porción', active: true,
      updatedAt: new Date().toISOString(),
      ingredients: [
        { prod: 'Zanahoria',     qty: 500, unit: 'g' },
        { prod: 'Manteca',       qty: 80,  unit: 'g' },
        { prod: 'Aceite de oliva', qty: 50, unit: 'ml' },
        { prod: 'Azúcar',        qty: 0,   unit: 'g' }
      ]
    },

    // ── PLATOS PRINCIPALES ───────────────────────────────────────────────────

    'Hamburguesa - Medallón': {
      name: 'Hamburguesa - Medallón', yields: 4, yieldUnit: 'medallones', active: true,
      updatedAt: new Date().toISOString(),
      ingredients: [
        { prod: 'Carne picada',   qty: 1000, unit: 'g' },
        { prod: 'Cebolla',        qty: 200,  unit: 'g' },
        { prod: 'Salsa Worcestershire', qty: 0, unit: 'ml' },
        { prod: 'Romero fresco',  qty: 0,   unit: 'g' },
        { prod: 'Crema de leche', qty: 60,  unit: 'g' }
      ]
    },

    'Milanesas': {
      name: 'Milanesas', yields: 1, yieldUnit: 'porción', active: true,
      updatedAt: new Date().toISOString(),
      ingredients: [
        { prod: 'Nalga',         qty: 0, unit: 'g' },
        { prod: 'Huevo',         qty: 0, unit: 'u' },
        { prod: 'Ajo',           qty: 0, unit: 'u' },
        { prod: 'Mostaza',       qty: 0, unit: 'g' },
        { prod: 'Pan rallado/panko', qty: 0, unit: 'g' }
      ]
    },

    'Omelett Queso y Jamón': {
      name: 'Omelett Queso y Jamón', yields: 1, yieldUnit: 'porción', active: true,
      updatedAt: new Date().toISOString(),
      ingredients: [
        { prod: 'Huevos',      qty: 4, unit: 'u' },
        { prod: 'Queso',       qty: 3, unit: 'u' },
        { prod: 'Jamón cocido', qty: 2, unit: 'u' }
      ]
    },

    'Avocado Toast': {
      name: 'Avocado Toast', yields: 1, yieldUnit: 'porción', active: true,
      updatedAt: new Date().toISOString(),
      ingredients: [
        { prod: 'Pan de campo',          qty: 1, unit: 'u' },
        { prod: 'Queso crema',           qty: 0, unit: 'g' },
        { prod: 'Huevos',                qty: 3, unit: 'u' },
        { prod: 'Palta',                 qty: 1, unit: 'u' },
        { prod: 'Tomates cherry',        qty: 2, unit: 'u' },
        { prod: 'Mix de semillas',       qty: 0, unit: 'g' }
      ]
    },

    'Ojo de Bife': {
      name: 'Ojo de Bife', yields: 1, yieldUnit: 'porción', active: true,
      updatedAt: new Date().toISOString(),
      ingredients: [
        { prod: 'Ojo de bife', qty: 300, unit: 'g' }
      ]
    },

    'Pechuga Grillada': {
      name: 'Pechuga Grillada', yields: 1, yieldUnit: 'porción', active: true,
      updatedAt: new Date().toISOString(),
      ingredients: [
        { prod: 'Pechuga de pollo', qty: 1, unit: 'u' }
      ]
    },

    'Salmón Grillé': {
      name: 'Salmón Grillé', yields: 1, yieldUnit: 'porción', active: true,
      updatedAt: new Date().toISOString(),
      ingredients: [
        { prod: 'Filet de salmón',  qty: 200, unit: 'g' },
        { prod: 'Aceite de oliva',  qty: 0,   unit: 'ml' }
      ]
    },

    'Bowl Proteico': {
      name: 'Bowl Proteico', yields: 1, yieldUnit: 'porción', active: true,
      updatedAt: new Date().toISOString(),
      ingredients: [
        { prod: 'Arroz',          qty: 0, unit: 'g' },
        { prod: 'Pechuga de pollo', qty: 0, unit: 'g' },
        { prod: 'Palta',          qty: 0, unit: 'u' },
        { prod: 'Tomates cherry', qty: 0, unit: 'u' },
        { prod: 'Huevo',          qty: 0, unit: 'u' }
      ]
    }
  };

  try {
    var ss = FeDe_Repo.getSS();
    var sh = ss.getSheetByName('Config');
    if (!sh) throw new Error('Hoja Config no encontrada');

    var data = sh.getDataRange().getValues();
    var recetasActuales = {};
    var recetasRow = -1;

    for (var i = 0; i < data.length; i++) {
      if (data[i][0] === 'recetas') {
        recetasRow = i + 1;
        try { recetasActuales = JSON.parse(data[i][1] || '{}'); } catch(e) {}
        break;
      }
    }

    var agregadas = 0;
    var omitidas = 0;
    var nombres = Object.keys(recetasNuevas);
    for (var j = 0; j < nombres.length; j++) {
      var nombre = nombres[j];
      if (recetasActuales[nombre]) {
        omitidas++;
      } else {
        recetasActuales[nombre] = recetasNuevas[nombre];
        agregadas++;
      }
    }

    var jsonVal = JSON.stringify(recetasActuales);
    if (recetasRow > 0) {
      sh.getRange(recetasRow, 2).setValue(jsonVal);
    } else {
      sh.appendRow(['recetas', jsonVal]);
    }

    try {
      var cache = CacheService.getScriptCache();
      cache.remove('app_config_v12_');
      cache.remove('app_config_v12_' + MASTER_ID);
    } catch(ce) {}

    Logger.log('seedRecetas: ' + agregadas + ' recetas cargadas, ' + omitidas + ' ya existían.');
    return { success: true, agregadas: agregadas, omitidas: omitidas };
  } catch(e) {
    Logger.log('seedRecetas ERROR: ' + e.message);
    return { success: false, error: e.message };
  }
}

// saveConfig duplicado eliminado — la implementación completa está en línea ~396

// ═══════════════════════════════════════════════════════════════════════════
// RECETA PHOTOS — Google Drive storage
//
// Folder structure created automatically:
//   Mi unidad (root)
//   └── FeDe Gastro Pro/
//       └── Recetarios/
//           ├── Salsa Pomodoro/
//           │   └── photo_1716123456789.jpg
//           ├── Pan Árabe/
//           │   └── photo_1716123456790.jpg
//           └── Pizza Keto/
//               └── photo_1716123456791.jpg
//
// Returned URL format: https://drive.google.com/uc?id=FILE_ID
// Files are set to public read so the <img> tag can load them directly.
// ═══════════════════════════════════════════════════════════════════════════

/**
 * getRecetaPhotoFolderId(recetaName)
 * Creates (or finds) the nested folder FeDe Gastro Pro > Recetarios > recetaName
 * and returns the leaf folder's Drive ID.
 */
function getRecetaPhotoFolderId(recetaName) {
  // Búsqueda global en Drive (no solo en root) por si FEDE está en subdirectorio
  var l1iter = DriveApp.getFoldersByName('FEDE');
  var l1;
  if (l1iter.hasNext()) {
    l1 = l1iter.next();
  } else {
    // No existe en ningún lado — crear en root
    l1 = DriveApp.getRootFolder().createFolder('FEDE');
  }

  // Level 2: Recetas (carpeta existente del usuario)
  var l2iter = l1.getFoldersByName('Recetas');
  var l2 = l2iter.hasNext() ? l2iter.next() : l1.createFolder('Recetas');

  // Level 3: nombre de la receta (subcarpeta por receta)
  var safeName = recetaName.replace(/[\/\\:*?"<>|]/g, '_').trim() || 'Sin_Nombre';
  var l3iter = l2.getFoldersByName(safeName);
  var l3 = l3iter.hasNext() ? l3iter.next() : l2.createFolder(safeName);

  return l3.getId();
}

/**
 * uploadRecetaPhoto(params, targetId)
 * params: { base64: string, mimeType: string, recetaName: string }
 * Saves the image to Drive, makes it public, returns { success, url }.
 */
function uploadRecetaPhoto(params, targetId) {
  try {
    var base64    = params.base64;
    var mimeType  = params.mimeType  || 'image/jpeg';
    var recetaName = params.recetaName || 'receta';

    // Strip the data:image/...;base64, prefix if present
    var b64data = base64.replace(/^data:[^;]+;base64,/, '');

    // Determine extension from mimeType
    var extMap = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif' };
    var ext = extMap[mimeType] || '.jpg';
    var fileName = 'photo_' + Date.now() + ext;

    // Get or create target folder
    var folderId = getRecetaPhotoFolderId(recetaName);
    var folder   = DriveApp.getFolderById(folderId);

    // Create file from base64 blob
    var blob = Utilities.newBlob(Utilities.base64Decode(b64data), mimeType, fileName);
    var file = folder.createFile(blob);

    // Make publicly accessible (anyone with link can view)
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    // export=view es necesario para que <img src> funcione correctamente en 2025+
    // El formato /uc?id= sin export fue deprecado por Google
    var fileId = file.getId();
    // thumbnail URL: no requiere login, funciona en img tags y WebViews
    var url = 'https://lh3.googleusercontent.com/d/' + fileId;

    Logger.log('uploadRecetaPhoto OK: ' + fileName + ' → ' + url);
    return { success: true, url: url, fileId: fileId };
  } catch(e) {
    Logger.log('uploadRecetaPhoto ERROR: ' + e.toString());
    return { success: false, error: e.message || e.toString() };
  }
}
