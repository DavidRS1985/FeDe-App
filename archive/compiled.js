
  /**
   * FERIADOS ARGENTINA E ITALIA — Base de datos y Lógica de Negocio
   */

  const HOLIDAYS_DB = {
    // Global / Coincidentes
    '01-01': { name: 'Año Nuevo', desc: 'ITA: Cotechino con Lenticchie para atraer suerte. ARG: Vitel Toné, piononos y asado frío en familia.', type: 'national' },
    '05-01': { name: 'Día del Trabajador', desc: 'ITA: Panino con la Porchetta o parrilladas de carne. ARG: Locro tradicional, asado o empanadas compartidas.', type: 'national' },
    '12-08': { name: 'Inmaculada Concepción', desc: 'ITA: Pettole y bacalao frito. ARG: Día de armar el arbolito navideño, mates y tortas fritas.', type: 'national' },
    '12-25': { name: 'Navidad', desc: 'ITA: Tortellini en caldo, asados, Panettone y Pandoro. ARG: Vitel Toné, ensalada rusa, asado, turrones y sidra.', type: 'national' },

    // Argentina
    '02-17': { name: 'Carnaval', desc: 'ARG: Fiestas populares con murgas. Se suelen comer choripanes, empanadas y comida callejera.', type: 'national' },
    '03-24': { name: 'Día de la Memoria', desc: 'ARG: recuerda a las víctimas de la última dictadura cívico-militar (1976-1983), promoviendo la reflexión, la defensa de la democracia, los derechos humanos y el "Nunca Más" al terrorismo de Estado.', type: 'national' },
    '04-02': { name: 'Día de Malvinas', desc: 'ARG: Conmemoración solemne. Tradicionalmente guisos o comidas de bodegón patrio.', type: 'national' },
    '05-25': { name: 'Revolución de Mayo', desc: 'ARG: Gran celebración patria. Imposible faltar el locro pampa, pastelitos de membrillo y churros.', type: 'national' },
    '06-17': { name: 'Paso a la Inmortalidad de Güemes', desc: 'ARG: Feriado salteño extendido. Empanadas salteñas, tamales y humitas.', type: 'national' },
    '06-20': { name: 'Día de la Bandera', desc: 'ARG: Creación de la insignia. Clásico día de asado dominguero o pastas en familia.', type: 'national' },
    '07-09': { name: 'Día de la Independencia', desc: 'ARG: Fiestas de la independencia nacional. Empanadas de carne cortada a cuchillo, locro y vino tinto.', type: 'national' },
    '08-17': { name: 'Paso a la Inmortalidad de San Martín', desc: 'ARG: Conmemoración del Padre de la Patria. Costumbres de asado, mate y pastelitos.', type: 'national' },
    '10-12': { name: 'Día de la Diversidad Cultural', desc: 'ARG: Integración de culturas. Fusión gastronómica, asados y paellas.', type: 'national' },
    '11-23': { name: 'Día de la Soberanía Nacional', desc: 'ARG: Recuerdo de la Vuelta de Obligado. Día de choripán, asado a la cruz u olla popular.', type: 'national' },

    // Italia
    '01-06': { name: 'Epifanía (La Befana)', desc: 'ITA: Conmemoración de la visita de los Reyes Magos. Se acostumbra comer Fugassa d\'la Befana y dulces variados.', type: 'national' },
    '04-25': { name: 'Día de la Liberación', desc: 'ITA: Fin de la ocupación nazi. Se suelen comer Fave e Pecorino y embutidos durante excursiones al campo.', type: 'national' },
    '06-02': { name: 'Festa della Repubblica', desc: 'ITA: Nacimiento de la República. Almuerzos con Lasagna y platos que lleven colores de la bandera (caprese).', type: 'national' },
    '08-15': { name: 'Ferragosto', desc: 'ITA: Fiesta del verano. Platos frescos como Pollo con i peperoni, ensaladas de arroz y Anguria (sandía).', type: 'national' },
    '11-01': { name: 'Día de Todos los Santos', desc: 'ITA: Recuerdo de los difuntos. Preparaciones como el Pane dei Morti y platos a base de calabaza o castañas.', type: 'national' },
    '12-26': { name: 'San Esteban', desc: 'ITA: Continuación de la Navidad. Se consumen  caldos ligeros o las sobras del día anterior.', type: 'national' }
  };

  function calculateEaster(year) {
    const a = year % 19, b = Math.floor(year / 100), c = year % 100, d = Math.floor(b / 4), e = b % 4,
      f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30,
      i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7,
      m = Math.floor((a + 11 * h + 22 * l) / 451), month = Math.floor((h + l - 7 * m + 114) / 31),
      day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month - 1, day);
  }

  function formatMMDD(date) {
    return String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
  }

  function getHolidaysForYear(year) {
    const easter = calculateEaster(year);
    const movable = {};
    const vSanto = new Date(easter); vSanto.setDate(easter.getDate() - 2);
    const jSanto = new Date(easter); jSanto.setDate(easter.getDate() - 3);
    const lPascua = new Date(easter); lPascua.setDate(easter.getDate() + 1);

    movable[formatMMDD(jSanto)] = { name: 'Jueves Santo', desc: 'ARG: Día de recogimiento. Vigilia: Empanadas de vigilia, tarta de atún y rosca de pascua.', type: 'observance' };
    movable[formatMMDD(vSanto)] = { name: 'Viernes Santo', desc: 'ARG: Ayuno de carnes rojas. Platos de pescado, bacalao o empanadas de verdura.', type: 'national' };
    movable[formatMMDD(easter)] = { name: 'Domingo de Pascua', desc: 'ITA: Agnello al forno, Torta Pasqualina y Colomba Pasquale. ARG: Asado, huevos de chocolate.', type: 'national' };
    movable[formatMMDD(lPascua)] = { name: 'Lunes de Pascua (Pasquetta)', desc: 'ITA: Tradición de picnic con amigos. Se consumen Casatiello, frittatas y parrilladas.', type: 'national' };

    return { ...HOLIDAYS_DB, ...movable };
  }

  function getUpcomingHolidays(days = 14, fromDate = new Date()) {
    const holidays = getHolidaysForYear(fromDate.getFullYear());
    const upcoming = [];
    const today = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate(), 0, 0, 0);

    for (let i = 0; i <= days; i++) {
      const d = new Date(today); d.setDate(today.getDate() + i);
      const key = formatMMDD(d);
      if (holidays[key]) {
        upcoming.push({ date: d, dateString: key, ...holidays[key], daysFromNow: i });
      }
    }
    return upcoming;
  }

  class HolidayAlert {
    constructor(options = {}) {
      this.options = { cacheKey: 'fede_holiday_dismissed', ...options };
      try {
        this.dismissed = new Set(JSON.parse(localStorage.getItem(this.options.cacheKey) || '[]'));
      } catch { this.dismissed = new Set(); }
      this.init();
    }

    init() { this.update(); setInterval(() => this.update(), 60000); }

    update() {
    const now = new Date();
    const badge = document.getElementById('noti-badge');
    if (!badge) return;

    let alertHtml = '';
    let alertCount = 0;

    const day = now.getDay();
    if (day === 0 || day === 2) {
      const msgText = "CONTROL DE STOCK";
      const isDone = sessionStorage.getItem('fede_stock_done') === msgText;
      
      if (!isDone) {
          alertCount++;
          alertHtml += `
            <div style="background:var(--blue); border-radius:16px; padding:16px; margin-bottom:12px; display:flex; align-items:center; justify-content:space-between; gap:12px; box-shadow:0 6px 20px rgba(91, 155, 213, 0.3);">
                <div style="display:flex; align-items:center; gap:12px; flex:1;">
                    <div style="background:rgba(255,255,255,0.2); width:36px; height:36px; border-radius:10px; display:flex; align-items:center; justify-content:center;">
                        <i data-lucide="clipboard-check" style="color:white; width:var(--icon-size-medium);"></i>
                    </div>
                    <div>
                        <div style="color:white; font-weight:900; font-size:13px; text-transform:uppercase; letter-spacing:0.5px; line-height:1.2;">Control Obligatorio</div>
                        <div style="color:rgba(255,255,255,0.8); font-size:10px; font-weight:700; margin-top:2px;">Requerido hoy</div>
                    </div>
                </div>
                <button onclick="window.holidayAlert.dismissStockCard('${msgText}')" style="background:white; color:var(--blue); border:none; border-radius:10px; padding:8px 14px; font-weight:900; font-size:11px; cursor:pointer; display:flex; align-items:center; gap:6px;">
                    <i data-lucide="check" style="width:var(--icon-size-small);"></i> Listo
                </button>
            </div>
          `;
      } else {
          alertHtml += `
            <div style="background:linear-gradient(135deg, #10b981, #059669); border-radius:16px; padding:12px 16px; margin-bottom:12px; display:flex; align-items:center; justify-content:space-between; gap:12px; box-shadow:0 6px 20px rgba(16, 185, 129, 0.25);">
                <div style="display:flex; align-items:center; gap:12px;">
                    <i data-lucide="check-circle-2" style="color:white; width:var(--icon-size-large); background:rgba(255,255,255,0.2); border-radius:10px; padding:8px;"></i>
                    <div>
                        <div style="color:white; font-weight:900; font-size:13px; text-transform:uppercase; letter-spacing:0.5px;">Stock Completado</div>
                        <div style="color:rgba(255,255,255,0.9); font-size:10px; font-weight:700;">¡Todo listo por hoy!</div>
                    </div>
                </div>
                <button onclick="window.holidayAlert.undoStockCard()" style="background:rgba(0,0,0,0.15); color:white; border:none; border-radius:8px; padding:6px 10px; font-weight:800; font-size:10px; cursor:pointer; display:flex; align-items:center; gap:4px;">
                    <i data-lucide="rotate-ccw" style="width:var(--icon-size-small);"></i> Deshacer
                </button>
            </div>
          `;
      }
    }

    const upcoming = getUpcomingHolidays(7);
    if (upcoming.length > 0) {
      alertCount += upcoming.length;
      
      upcoming.forEach(h => {
          let timeText = '';
          const diffMs = h.date.getTime() - now.getTime();
          
          if (diffMs <= 0 && h.daysFromNow === 0) {
              timeText = "Es Hoy";
          } else if (diffMs < 24 * 3600 * 1000) {
              const hs = Math.floor(diffMs / (1000 * 60 * 60));
              const ms = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
              timeText = `${String(hs).padStart(2,'0')}:${String(ms).padStart(2,'0')}`;
          } else {
              timeText = `En ${Math.ceil(diffMs / (1000 * 3600 * 24))} días`;
          }

          alertHtml += `
            <div style="background:linear-gradient(135deg, #098b8c, #065f57); border-radius:16px; padding:14px 16px; margin-bottom:12px; display:flex; align-items:flex-start; gap:14px; box-shadow:0 8px 25px rgba(6, 95, 87, 0.4); color:white;">
                <i data-lucide="calendar-clock" style="color:#a5f3fc; width:var(--icon-size-large); height:var(--icon-size-large); margin-top:2px; flex-shrink:0;"></i>
                <div style="flex:1;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <div style="font-weight:900; font-size:14px; text-transform:uppercase; letter-spacing:0.5px;">${h.name}</div>
                        <div style="background:rgba(0,0,0,0.25); padding:4px 8px; border-radius:8px; font-size:11px; font-weight:800; letter-spacing:1px; color:#a5f3fc; white-space:nowrap;">
                            ${timeText}
                        </div>
                    </div>
                    <div style="font-size:11px; font-weight:600; color:rgba(255,255,255,0.85); margin-top:6px; line-height:1.4;">
                        ${h.desc}
                    </div>
                </div>
            </div>
          `;
      });
    }

    this.cachedAlertHtml = alertHtml;

    if (alertCount > 0) {
        badge.textContent = alertCount;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }

    const openPanel = document.getElementById('noti-panel-content');
    if (openPanel) {
        openPanel.innerHTML = this.cachedAlertHtml || '<div style="text-align:center; padding:30px 20px; color:var(--dim); font-size:12px; font-weight:700;"><i data-lucide="check-circle" style="width:var(--icon-size-large); height:var(--icon-size-large); margin-bottom:10px; opacity:0.5;"></i><br>No hay notificaciones pendientes.</div>';
        if(window.lucide) lucide.createIcons({root: openPanel});
    }
  }

  togglePanel() {
      let overlay = document.getElementById('noti-overlay');
      if (overlay) {
          overlay.remove();
          return;
      }
      
      overlay = document.createElement('div');
      overlay.id = 'noti-overlay';
      overlay.style = "position:fixed; top:0; left:0; width:100%; height:100%; z-index:9000; background:rgba(0,0,0,0.5); backdrop-filter:blur(3px); display:flex; flex-direction:column; align-items:center; justify-content:flex-start; padding-top:80px; padding-left:20px; padding-right:20px; animation:fadeIn 0.2s ease;";
      overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); }
      
      const content = this.cachedAlertHtml || '<div style="text-align:center; padding:30px 20px; color:var(--dim); font-size:12px; font-weight:700;"><i data-lucide="check-circle" style="width:var(--icon-size-large); height:var(--icon-size-large); margin-bottom:10px; opacity:0.5;"></i><br>No hay notificaciones pendientes.</div>';
      
      overlay.innerHTML = `
        <div style="background:var(--s1); width:100%; max-width:400px; border-radius:24px; padding:20px; border:1px solid rgba(255,255,255,0.05); box-shadow:0 10px 40px rgba(0,0,0,0.8); position:relative; max-height:calc(100vh - 120px); display:flex; flex-direction:column;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; flex-shrink:0;">
                <div style="font-weight:900; font-size:16px; color:var(--text); display:flex; align-items:center; gap:8px;">
                    <i data-lucide="bell-ring" style="width:var(--icon-size-medium); color:var(--gold);"></i> Notificaciones
                </div>
                <button onclick="document.getElementById('noti-overlay').remove()" style="background:rgba(255,255,255,0.05); border:none; width:30px; height:30px; border-radius:50%; color:var(--text); display:flex; align-items:center; justify-content:center; cursor:pointer;"><i data-lucide="x" style="width:var(--icon-size-small);"></i></button>
            </div>
            <div id="noti-panel-content" style="overflow-y:auto; flex:1; padding-right:4px;">
                ${content}
            </div>
        </div>
      `;
      document.body.appendChild(overlay);
      if(window.lucide) lucide.createIcons({root: overlay});
  }

  showDetails() {
      // Reemplazado por el Notification Center
      this.togglePanel();
  }

  dismissStockCard(msg) { sessionStorage.setItem('fede_stock_done', msg); this.update(); }
  undoStockCard() { sessionStorage.removeItem('fede_stock_done'); this.update(); }
}

  /**
   * HOLIDAY STOCK PREDICTION
   * Sugiere aumentos de stock antes de feriados
   */
  class HolidayStockHelper {
    constructor(options = {}) {
      this.options = { daysBuffer: 3, multiplier: 1.5, ...options };
    }

    getSuggestedReorders() {
      const upcoming = getUpcomingHolidays(7);
      if (upcoming.length === 0) return [];

      const sug = [];
      upcoming.forEach(h => {
        if (h.daysFromNow <= this.options.daysBuffer) {
          sug.push({
            holiday: h.name,
            date: h.date,
            priority: h.daysFromNow === 0 ? 'urgent' : 'high',
            message: this.generateMessage(h, h.daysFromNow),
            categories: this.getHighDemandCategories(h)
          });
        }
      });
      return sug;
    }

    getHighDemandCategories(h) {
      const map = {
        'Navidad': ['Carnes', 'Bebidas', 'Secos'],
        'Año Nuevo': ['Bebidas', 'Carnes', 'Frutas'],
        'Pascua': ['Verdulería', 'Lácteos']
      };
      return map[h.name] || ['Bebidas', 'Carnes', 'Panificados'];
    }

    generateMessage(h, days) {
      if (days === 0) return `⚠️ ${h.name} HOY. ¡Confirmar stock urgente!`;
      if (days === 1) return `⚠️ Mañana es ${h.name}. Recomiendo reposición extra.`;
      return `📦 En ${days} días: ${h.name}. Prepara tus pedidos.`;
    }
  }


    /* ——————————————————————————————————————————————————————————————————————————
       FeDe ONLINE v8.4 — JS COMPLETO Y CORREGIDO (RESISTENTE A BUGS)
       —————————————————————————————————————————————————————————————————————————— */

    let CATS = {}, FAVS = [], HIST = [], relData = {}, currentMode = null, activeCat = null, CUSTOM_UNITS = {};
    let units = ["unidad/es", "kg", "litro/s", "porción/es", "pack/s", "atado/s", "frasco/s", "lata/s"];
    let treeOpen = {};
    let activeSheetId = localStorage.getItem('fede_active_sheet_id') || 'undefined';
    let dbName = 'Master';

    /* ── INIT ── */
    function initApp() {
        if (window.fedeInitialized) return;
        window.fedeInitialized = true;
        
        console.log('🔧 [INIT] Iniciando FEDE v8.4-GAS (Resistente)');
        
        try {
            // 1. Identidad
            loadAppTitle();
            updateTime();
            setInterval(updateTime, 10000);
            
            // 2. UI y Alertas
            loadIconSizePreference();
            try {
                if (typeof HolidayAlert !== 'undefined') {
                    window.holidayAlert = new HolidayAlert();
                    window.holidayHelper = new HolidayStockHelper();
                    console.log('✓ Alertas iniciadas');
                }
            } catch (e) { console.warn('Alertas no críticas fallaron:', e); }
            
            // 3. Sistema de Red y Cola
            window.offlineQueue = JSON.parse(localStorage.getItem('fede_offline_queue') || '[]');
            updateSyncBadge();
            window.removeEventListener('online', processOfflineQueue);
            window.addEventListener('online', processOfflineQueue);
            
            // 4. Datos: Cache y GAS
            loadLocalSnapshot();
            loadConfigFromGAS();
            
            // 5. Hide Loader (Seguridad)
            // Siempre intentamos ocultar el loader después de un tiempo razonable
            window.loaderTimeout = setTimeout(() => {
                console.warn('⚠️ [SAFETY] Ocultando loader por timeout de seguridad');
                hideLoader();
            }, 3500);

        } catch (e) {
            console.error('❌ ERROR FATAL en initApp:', e);
            hideLoader(); // Aunque falle algo, mostramos la app
        }
    }

    // Manejo robusto del disparo de carga
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(initApp, 1);
    } else {
        window.addEventListener('DOMContentLoaded', initApp);
    }
    
    /**
     * 🎨 SISTEMA DE TAMAÑO GLOBAL DE ICONOS
     */
    function loadIconSizePreference() {
        const savedSize = localStorage.getItem('fede_icon_size') || 'medium';
        setGlobalIconSize(savedSize);
        console.log('🎨 Icon size cargado:', savedSize);
    }
    
    function setGlobalIconSize(size) {
        const validSizes = ['small', 'medium', 'large'];
        if (!validSizes.includes(size)) size = 'medium';
        
        document.documentElement.setAttribute('data-icon-size', size);
        localStorage.setItem('fede_icon_size', size);
        
        const sizeButtons = document.querySelectorAll('[data-icon-control]');
        sizeButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-icon-control') === size) btn.classList.add('active');
        });
        
        console.log('🎨 Icon size actualizado:', size);
        refreshIcons();
    }
    
    function renderIconSizeControls() {
        const currentSize = localStorage.getItem('fede_icon_size') || 'medium';
        
        const activeStyle = 'background: var(--primary); border: 1px solid var(--primary); color: #fff; box-shadow: 0 4px 12px rgba(234,88,12,0.3);';
        const inactiveStyle = 'background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); color: var(--text2);';
        const html = `
        <div style="background: rgba(234, 88, 12, 0.06); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(234, 88, 12, 0.2); border-radius: var(--r2); padding: 20px; margin-bottom: 20px;">
            <h3 style="font-family:'Outfit', sans-serif; font-size: 13px; font-weight: 800; color: var(--text); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 14px; display:flex; align-items:center; gap:8px;">
                Tamaño de Iconos
            </h3>
            <p style="font-size: 12px; color: var(--dim); margin-bottom: 14px; font-weight: 500;">Ajusta el tamaño global de iconos:</p>
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                <button data-icon-control="small" 
                        onclick="setGlobalIconSize('small')" 
                        style="flex: 1; min-width: 90px; padding: 14px 12px; border-radius: 14px; ${currentSize === 'small' ? activeStyle : inactiveStyle} font-family:'Outfit',sans-serif; font-weight: 700; cursor: pointer; transition: all 0.2s; font-size: 12px; text-transform: uppercase; letter-spacing:0.5px;">
                    ▾ Pequeño
                </button>
                <button data-icon-control="medium" 
                        onclick="setGlobalIconSize('medium')" 
                        style="flex: 1; min-width: 90px; padding: 14px 12px; border-radius: 14px; ${currentSize === 'medium' ? activeStyle : inactiveStyle} font-family:'Outfit',sans-serif; font-weight: 700; cursor: pointer; transition: all 0.2s; font-size: 12px; text-transform: uppercase; letter-spacing:0.5px;">
                    ■ Medio
                </button>
                <button data-icon-control="large" 
                        onclick="setGlobalIconSize('large')" 
                        style="flex: 1; min-width: 90px; padding: 14px 12px; border-radius: 14px; ${currentSize === 'large' ? activeStyle : inactiveStyle} font-family:'Outfit',sans-serif; font-weight: 700; cursor: pointer; transition: all 0.2s; font-size: 12px; text-transform: uppercase; letter-spacing:0.5px;">
                    ▲ Grande
                </button>
            </div>
        </div>
        `;
        
        const treeSection = document.getElementById('tree-cats');
        if (treeSection && !document.getElementById('icon-size-controls')) {
            const wrapper = document.createElement('div');
            wrapper.id = 'icon-size-controls';
            wrapper.innerHTML = html;
            treeSection.parentElement.insertBefore(wrapper, treeSection);
            lucide.createIcons();
        }
    }

    function loadLocalSnapshot() {
        const snap = JSON.parse(localStorage.getItem(`fede_snapshot_${activeSheetId}`) || 'null');
        if (snap) {
            console.log('📦 [CACHE] Usando snapshot local');
            CATS = snap.cats || {};
            FAVS = snap.favs || [];
            HIST = snap.history || [];
            if (snap.units) units = snap.units;
            if (snap.custom_units) CUSTOM_UNITS = snap.custom_units;
            renderCatGrid();
            renderTree();
            renderHistory();
            updateDBLabel();
        }
    }

    const HOLIDAYS = {
        '04-02': 'Día de Malvinas',
        '04-03': 'Viernes Santo',
        '05-01': 'Día del Trabajador',
        '05-25': 'Revolución de Mayo',
        '06-20': 'Día de la Bandera',
        '07-09': 'Día de la Independencia',
        '12-25': 'Navidad'
    };

    function updateTime() {
        const now = new Date();
        const days = ['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO'];
        const dayEl = document.getElementById('hdr-day');
        const homeDayEl = document.getElementById('home-day');

        const dateStr = now.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
        const fullDay = `${days[now.getDay()]} ${dateStr}`;

        if (dayEl) dayEl.textContent = fullDay;
        if (homeDayEl) homeDayEl.textContent = fullDay;
    }

    function setSyncStatus(st) {
        // st: 'online' | 'pending' | 'error'
        const el = document.getElementById('sync-status');
        if (!el) return;
        el.className = 'sync-status ' + st;
        const icon = el.querySelector('i');
        if (icon) {
            if (st === 'online') icon.setAttribute('data-lucide', 'cloud-check');
            else if (st === 'pending') icon.setAttribute('data-lucide', 'cloud-upload');
            else icon.setAttribute('data-lucide', 'cloud-off');
            refreshIcons();
        }
    }

    let PREDICTIONS = {};
    function loadPredictions() { google.script.run.withSuccessHandler(r => { if(r.success) { PREDICTIONS = {}; (r.predictions || []).forEach(p => PREDICTIONS[p.name] = p.suggestion); renderProducts(); } }).getPredictiveAnalysis(activeSheetId); }

    function loadConfigFromGAS() {
        console.log('⟳ [LOAD] Iniciando carga desde GAS...', activeSheetId);
        updateDBLabel();
        google.script.run
            .withSuccessHandler(onConfigLoaded)
            .withFailureHandler(onConfigFailed)
            .getAppConfig(activeSheetId);
    }

    function onConfigLoaded(result) {
        console.log('✓ [LOAD] Config recibida:', result);
        // Si llegamos aquí, el servidor respondió, ocultamos lo antes posible
        hideLoader();
        if (window.loaderTimeout) clearTimeout(window.loaderTimeout);
        
        try {
            if (!result || !result.success) {
                console.error('❌ [LOAD] GAS devolvió error:', result?.error);
                toast("❌ Servidor: " + (result?.error || "Error desconocido"));
                return;
            }
            const { config, history, ssName } = result;
            if (ssName) { dbName = ssName; updateDBLabel(); }
            
            if (config && config.cats) {
                CATS = config.cats;
                // Patch icons
                const iconPatch = { "Personal": "chess-pawn", "Verdulería": "carrot", "Pastas": "soup", "Bebidas": "bottle-wine", "Platos carta": "utensils-crossed" };
                let needsSave = false;
                Object.keys(iconPatch).forEach(cat => { if (CATS[cat] && CATS[cat].icon !== iconPatch[cat]) { CATS[cat].icon = iconPatch[cat]; needsSave = true; } });
                if (needsSave && google?.script?.run?.saveConfig) google.script.run.saveConfig('cats', CATS, activeSheetId);
            }
            
            if (config && config.favs) { FAVS = config.favs; }
            if (config && config.units) units = config.units;
            if (config && config.custom_units) CUSTOM_UNITS = config.custom_units;
            if (history) { HIST = history; renderHistory(); }
            
            // Persistencia cache
            localStorage.setItem(`fede_snapshot_${activeSheetId}`, JSON.stringify({ cats: CATS, favs: FAVS, history: HIST, units: units, custom_units: CUSTOM_UNITS, ts: Date.now() }));
            
            renderCatGrid();
            renderTree();
            loadPredictions();
            
            setTimeout(() => {
                refreshIcons();
                checkDraft();
            }, 100);
        } catch (e) {
            console.error('❌ Error fatal en onConfigLoaded:', e);
            toast("⚠️ Error en procesamiento de datos");
        }
    }

    function onConfigFailed(error) {
        console.error('❌ Error GAS:', error);
        // Cancelar timeout de seguridad
        if (window.loaderTimeout) clearTimeout(window.loaderTimeout);
        
        toast("⚠️ No se pudo conectar con servidor");
        const backupCats = localStorage.getItem('fede_cats_backup');
        const backupHist = localStorage.getItem('fede_history_backup');
        if (backupCats) CATS = JSON.parse(backupCats);
        if (backupHist) HIST = JSON.parse(backupHist);
        hideLoader();
        refreshIcons();
        checkDraft();
    }

    function hideLoader() {
        const loader = document.getElementById('loader');
        if (loader) {
            loader.style.opacity = '0';
            loader.style.pointerEvents = 'none';
            setTimeout(() => {
                loader.style.display = 'none';
                console.log('✓ Loader ocultado');
            }, 500);
        } else {
            console.warn('⚠️ Elemento loader no encontrado');
        }
    }

    function saveCatsToGAS(cats) {
        google.script.run
            .withSuccessHandler(result => {
                if (result && result.success) {
                    toast('✓ Guardado en servidor');
                    localStorage.setItem('fede_cats_backup', JSON.stringify(cats));
                } else toast('❌ Error guardando');
            })
            .withFailureHandler(error => toast('❌ Error de servidor'))
            .saveConfig('cats', cats, activeSheetId);
    }

    function addEntryToGAS(entry) {
        google.script.run
            .withSuccessHandler(result => {
                if (result && result.success) {
                    toast('✓ Registrado');
                    loadConfigFromGAS();
                } else toast('❌ Error al guardar');
            })
            .withFailureHandler(error => toast('❌ Error de servidor'))
            .addHistoryEntry(entry, activeSheetId);
    }

    function deleteHistoryEntry(entryId) {
        google.script.run
            .withSuccessHandler(res => { if (res.success) { toast('✓ Borrado'); loadConfigFromGAS(); } })
            .deleteHistoryEntry(entryId, activeSheetId);
    }

    function deleteHistoryData(type) {
        google.script.run
            .withSuccessHandler(res => { if (res.success) { toast('✓ Historial limpiado'); loadConfigFromGAS(); } })
            .deleteHistory(type, activeSheetId);
    }

    /* ── NAVEGACIÓN ── */
    function initRelevamiento(m) {
        enterMode(m);
        goTab('relevamiento');
        renderFAB();
    }

    // Mapa de modos: colores y etiquetas
    const MODE_CONFIG = {
        pedido:   { label: 'PEDIDO',   cls: 'pedido',   bodyClass: 'mode-pedido',   borderColor: 'var(--violet)', glow: 'rgba(139,92,246,0.15)' },
        stock:    { label: 'ALMACEN',  cls: 'stock',    bodyClass: 'mode-stock',    borderColor: 'var(--blue)',   glow: 'rgba(59,130,246,0.15)' },
        entrante: { label: 'ENTRANTE', cls: 'entrante', bodyClass: 'mode-entrante', borderColor: 'var(--green)',  glow: 'rgba(16,185,129,0.15)' },
    };

    function showModeTag(m) {
        const tag = document.getElementById('mode-tag');
        if (!tag) return;
        const cfg = MODE_CONFIG[m];
        if (cfg) {
            tag.textContent = cfg.label;
            tag.className = 'mode-tag-lg ' + cfg.cls;
            tag.classList.remove('hidden');
        } else {
            tag.classList.add('hidden');
            tag.textContent = '';
        }
    }

    function hideModeTag() {
        const tag = document.getElementById('mode-tag');
        if (tag) { tag.classList.add('hidden'); tag.textContent = ''; }
    }

    // Abre bottom sheet para cambiar de modo (solo posible si no hay datos cargados)
    function openModeSwitcher() {
        const sh = document.getElementById('mode-switcher-sheet');
        if (!sh) return;
        
        const hasData = Object.keys(relData || {}).length > 0;
        const warn = document.getElementById('ms-warn');
        if (warn) warn.classList.toggle('hidden', !hasData);
        
        sh.classList.add('open');
        refreshIcons();
    }

    function closeModeSwitcher(e) {
        if (!e || e.target === document.getElementById('mode-switcher-sheet')) {
            document.getElementById('mode-switcher-sheet')?.classList.remove('open');
        }
    }
    function switchModeTo(m) {
        const hasData = Object.keys(relData).length > 0;
        if (hasData) {
            if (!confirm('Hay datos cargados. Si cambias de modo se borran. ¿Continuar?')) return;
            relData = {};
            localStorage.removeItem('fede_draft');
        }
        closeModeSwitcher();
        if (m === 'entrante') {
            // La vista entrante es independiente del relevamiento
            enterMode('entrante');
            goTab('entrante');
        } else {
            enterMode(m);
            goTab('relevamiento');
        }
        renderFAB();
        toast('Modo: ' + MODE_CONFIG[m].label);
    }

    function enterMode(m) {
        currentMode = m;
        const hdr = document.getElementById('main-hdr');
        const cfg = MODE_CONFIG[m] || {};

        // Limpiar TODAS las clases de modo previas y aplicar la nueva
        Object.values(MODE_CONFIG).forEach(c => document.body.classList.remove(c.bodyClass));
        if (cfg.bodyClass) document.body.classList.add(cfg.bodyClass);

        showModeTag(m);

        if (hdr) {
            hdr.style.borderBottom = '2px solid ' + (cfg.borderColor || 'var(--bd)');
            hdr.style.boxShadow = '0 2px 20px ' + (cfg.glow || 'transparent');
        }
    }

    function enterAdmin() {
        currentMode = null;
        document.getElementById('home').classList.add('hidden');
        document.getElementById('app').classList.add('visible');
        hideModeTag();
        const hdr = document.getElementById('main-hdr');
        if (hdr) { hdr.style.borderBottom = '1px solid var(--bd)'; hdr.style.boxShadow = 'none'; }
        goTab('datos');
        setTimeout(() => renderIconSizeControls(), 100);
        refreshIcons();
    }

    function enterDashboard() {
        currentMode = null;
        document.getElementById('home').classList.add('hidden');
        document.getElementById('app').classList.add('visible');
        hideModeTag();
        const hdr = document.getElementById('main-hdr');
        if (hdr) { hdr.style.borderBottom = '1px solid var(--bd)'; hdr.style.boxShadow = 'none'; }
        goTab('dashboard');
        renderDashboard();
        refreshIcons();
    }

    function goHome() {
        if (currentMode && Object.keys(relData).length > 0) saveDraft();
        document.getElementById('app').classList.remove('visible');
        document.getElementById('home').classList.remove('hidden');
        document.getElementById('prod-section')?.classList.add('hidden');
        hideModeTag();
        const hdr = document.getElementById('main-hdr');
        if (hdr) { hdr.style.borderBottom = ''; hdr.style.boxShadow = ''; }

        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));

        // Limpiar clases de modo del body
        Object.values(MODE_CONFIG).forEach(c => document.body.classList.remove(c.bodyClass));

        currentMode = null;
        activeCat = null;
        checkDraft();
        refreshIcons();
    }

    function goTab(id) {
        const h = document.getElementById('home');
        const a = document.getElementById('app');
        if (h) h.classList.add('hidden');
        if (a) { a.classList.remove('hidden'); a.classList.add('visible'); }

        // Mostrar pastilla SOLO en vistas de carga activa
        const activePillViews = ['relevamiento', 'entrante'];
        if (activePillViews.includes(id) && currentMode) {
            showModeTag(currentMode);
        } else {
            hideModeTag();
        }

        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));

        const viewEl = document.getElementById('view-' + id);
        const tabEl  = document.getElementById('tab-' + id);

        if (viewEl) viewEl.classList.add('active');
        if (tabEl)  tabEl.classList.add('active');

        if (id === 'relevamiento') renderCatGrid();
        if (id === 'historial')    renderHistory();
        if (id === 'datos')        { renderTree(); setTimeout(() => renderIconSizeControls(), 100); }
        if (id === 'dashboard')    renderDashboard();
        if (id === 'entrante')     renderEntranteView();

        renderFAB();
        setTimeout(() => lucide.createIcons(), 50);
    }

    /* ── RELEVAMIENTO ── */
    function renderCatGrid() {
        const grid = document.getElementById('cat-grid');
        if (!grid) return;
        const catNames = Object.keys(CATS);
        if (catNames.length === 0) {
            grid.innerHTML = '<div style="text-align:center;color:var(--dim);padding:40px;">Sin categorías cargadas</div>';
            return;
        }
        const sorted = catNames.sort((a, b) => (CATS[a].order || 99) - (CATS[b].order || 99));
        grid.innerHTML = sorted.map(cat => {
            const icon = CATS[cat]?.icon || 'package';
            const size = CATS[cat]?.iconSize;
            const styleOverride = size ? `style="--cat-icon-size: ${size}px;"` : '';
            const encoded = encodeURIComponent(cat);
            return `<div class="cchip" data-cat="${encoded}" onclick="selectCatFromEl(this)" ${styleOverride}>
                <i data-lucide="${icon}"></i>
                <span>${cat}</span>
            </div>`;
        }).join('');
        refreshIcons(grid);
    }

    function selectCatFromEl(el) { selectCat(decodeURIComponent(el.dataset.cat)); }
    function selectCat(cat) {
        if (!CATS[cat]) return toast('❌ Categoría no encontrada');
        activeCat = cat;
        const searchInp = document.getElementById('prod-search');
        if (searchInp) searchInp.value = '';
        document.querySelectorAll('.cchip').forEach(c => c.classList.remove('active'));
        document.querySelector(`.cchip[data-cat="${encodeURIComponent(cat)}"]`)?.classList.add('active');
        document.getElementById('cat-title').textContent = cat;
        document.getElementById('prod-section').classList.remove('hidden');
        renderProducts();
        setTimeout(() => document.getElementById('prod-section').scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }

    function renderProducts() {
        if (!activeCat || !CATS[activeCat]) return;
        const list = document.getElementById('prod-list');
        if (!list) return;
        const prods = [...(CATS[activeCat]?.prods || [])].sort();
        if (prods.length === 0) {
            list.innerHTML = '<div style="text-align:center;color:var(--dim);padding:40px;">Sin productos en esta categoría</div>';
            return;
        }
        try {
            list.innerHTML = prods.map(p => genProductRow(p, getUnitsForProduct(activeCat, p))).join('');
            renderFAB();
            refreshIcons(list);
        } catch (e) {
            console.error('❌ [RENDER] Error:', e.message);
        }
    }

    function genProductRow(p, prodUnits) {
        if (!Array.isArray(prodUnits)) prodUnits = getUnitsForProduct(activeCat, p);
        const ep = encodeURIComponent(p);
        const d = relData[p] || { qty: 0, unit: (prodUnits[0] || units[0]) };
        const isFav = FAVS.includes(p);
        const is86 = d.qty === 86;
        return `
            <div data-prow="${ep}" class="prow ${d.qty > 0 ? 'has-qty' : ''} ${is86 ? 'is-86' : ''}">
                <!-- FILA 1: NOMBRE Y FAV -->
                <div style="display:flex; align-items:center; gap:10px; margin-bottom:12px;">
                    <button onclick="toggleFav('${ep}')" aria-label="${isFav ? 'Quitar favorito' : 'Agregar favorito'}" style="background:none; border:none; color:${isFav ? 'var(--gold)' : 'var(--dim2)'}; cursor:pointer; flex-shrink:0; display:flex; align-items:center; padding:4px;">
                        <i data-lucide="star" style="width:20px; height:20px; fill:${isFav ? 'var(--gold)' : 'none'}; color:${isFav ? 'var(--gold)' : 'var(--dim)'};"></i>
                    </button>
                    <div style="flex:1;">
                        <div class="pname">${p}</div>
                        ${PREDICTIONS[p] ? `<div style="font-size:10px; color:var(--blue); font-weight:800; margin-top:2px; text-transform:uppercase; letter-spacing:0.5px;">Sug: ${PREDICTIONS[p]} ${d.unit}</div>` : ''}
                    </div>
                </div>
                
                <div style="display:flex; align-items:center; justify-content:center; width:100%;">
                    <div class="stepper" style="width:100%; max-width:280px; background:var(--s2); border-radius:18px; display:flex; align-items:center; border:2px solid var(--bd);">
                        <button class="step-btn" data-prod="${ep}" data-dir="-1" onclick="stepEl(this)" style="padding:16px 24px; font-weight:900; background:none; border:none; font-size:28px;">−</button>
                        <div class="pqty-box" onclick="manualEl(this)" data-prod="${ep}" style="flex:1; text-align:center; font-weight:900; font-size:24px; color:var(--text); line-height:1.1;">
                            <div style="color:${is86 ? 'var(--red)' : 'var(--text)'}">${is86 ? '86' : (d.qty || '0')}</div>
                            <div style="font-size:10px; color:var(--dim); text-transform:uppercase; letter-spacing:1px; margin-top:2px;">${is86 ? 'AGOTADO' : d.unit}</div>
                        </div>
                        <button class="step-btn" data-prod="${ep}" data-dir="1" onclick="stepEl(this)" style="padding:16px 24px; font-weight:900; background:none; border:none; font-size:28px;">+</button>
                    </div>
                </div>
                
                <!-- FILA 3: UNIDADES -->
                <div class="unit-row" style="margin-top:14px; display:flex; gap:10px; overflow-x:auto; padding-bottom:4px;">
                    ${prodUnits.map(u => `<div class="uchip ${d.unit === u ? 'active' : ''}" data-prod="${ep}" data-unit="${encodeURIComponent(u)}" onclick="setUnitEl(this)" style="padding:8px 14px; font-size:12px; min-width:60px;">${u}</div>`).join('')}
                </div>
            </div>`;
    }

    function updateProductRow(p) {
        const ep = encodeURIComponent(p);
        const el = document.querySelector(`[data-prow="${ep}"]`);
        if (el) {
            el.outerHTML = genProductRow(p);
            // Re-renderizar iconos solo en ese elemento si fuera necesario (aquí no hay iconos vinculados a valores dinámicos pero por precaución:)
            // refreshIcons(document.querySelector(`[data-prow="${ep}"]`));
        }
    }

    function refreshIcons(root = document) {
        if (window.lucide) lucide.createIcons({ root: root });
        // Aplicar tamaños de iconos desde el data-icon-size
        root.querySelectorAll('[data-lucide]').forEach(icon => {
            if (!icon.style.width) {
                icon.style.width = 'var(--icon-size)';
                icon.style.height = 'var(--icon-size)';
            }
        });
    }

    let searchTimeout = null;
    function filterProducts(q) {
        if (searchTimeout) clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const query = q.toLowerCase().trim();
            document.querySelectorAll('.prow').forEach(el => {
                const name = el.querySelector('.pname').textContent.toLowerCase();
                el.style.display = name.includes(query) ? '' : 'none';
            });
        }, 150);
    }

    function formatUnit(q, u) {
        if (!u) return '';
        const pts = u.split('/');
        const sing = pts[0];
        const plur = pts.length > 1 ? sing + pts[1] : sing + 's';
        return q === 1 ? sing : plur;
    }

    const UNIT_MAPPING = {
        "Huevos": ["unidad/es", "docena", "maple"],
        "Carnes": ["kg", "piezas", "cortes"],
        "Aceite": ["litro/s", "bidones", "botellas"],
        "Lácteos": ["litro/s", "unidad/es", "kg"],
        "Verduras": ["kg", "atado/s", "unidad/es"],
        "Cereales": ["kg", "bolsa/s", "unidad/es"],
        "Frutas": ["kg", "unidad/es", "bolsa/s"],
        "Panes": ["unidad/es", "bolsa/s", "pack/s"],
        "Pescados": ["kg", "piezas", "Porciones"],
        "Bebidas": ["litro/s", "botella/s", "lata/s"],
        "Condimentos": ["kg", "frasco/s", "unidad/es"],
        "Pastas": ["kg", "pack/s", "unidad/es"],
        "Congelados": ["kg", "unidad/es", "pack/s"]
    };

    function getUnitsForProduct(catName, prodName = '') { 
        if (prodName && CUSTOM_UNITS[prodName] && CUSTOM_UNITS[prodName].length > 0) return CUSTOM_UNITS[prodName];
        let defaultU = UNIT_MAPPING[catName] || units;
        if (!prodName) return defaultU;

        const p = prodName.toLowerCase();
        let predicted = null;

        if (p.includes('aceite')) predicted = ['bidones', 'litro/s', 'botella/s'];
        else if (p.includes('fideo') || p.includes('spaguetti') || p.includes('spaghetti') || p.includes('harina') || p.includes('azúcar') || p.includes('azucar') || p.includes('arroz') || p.includes('lenteja')) predicted = ['paquete/s', 'kg', 'gr'];
        else if (p.includes('huevo')) predicted = ['maple', 'docena', 'unidad/es'];
        else if (p.includes('queso') || p.includes('jamón') || p.includes('fiambre') || p.includes('salame')) predicted = ['kg', 'horma/s', 'gr'];
        else if (p.includes('vino') || p.includes('cerveza') || p.includes('gaseosa') || p.includes('agua') || p.includes('jugo')) predicted = ['botella/s', 'litro/s', 'cajón'];
        else if (p.includes('pan')) predicted = ['kg', 'bolsa/s', 'unidad/es'];
        else if (p.includes('carne') || p.includes('pollo') || p.includes('cerdo') || p.includes('vacío') || p.includes('bife')) predicted = ['kg', 'piezas'];
        else if (p.includes('condimento') || p.includes('sal') || p.includes('pimienta')) predicted = ['paquete/s', 'frasco/s', 'gr'];

        if (predicted) return predicted;
        return defaultU;
    }

    function setUnitEl(el) { setUnit(decodeURIComponent(el.dataset.prod), decodeURIComponent(el.dataset.unit)); }
    function setUnit(p, u) {
        if (!relData[p]) relData[p] = { qty: 0, unit: u };
        else relData[p].unit = u;
        updateProductRow(p); saveDraft();
    }

    function stepEl(el) { stepProd(decodeURIComponent(el.dataset.prod), parseInt(el.dataset.dir)); }
    function stepProd(p, dir) {
        if (!relData[p]) relData[p] = { qty: 0, unit: units[0] };
        
        // Moverse entre 0 y 86
        if (dir === -1 && relData[p].qty === 0) {
            relData[p].qty = 86;
        } else if (relData[p].qty === 86) {
            relData[p].qty = 0; // Cualquier dirección saca de 86 a 0
        } else {
            const step = (relData[p].unit === 'kg' || relData[p].unit === 'litro/s') ? 0.5 : 1;
            relData[p].qty = Math.max(0, parseFloat((relData[p].qty + dir * step).toFixed(2)));
        }
        
        // Limpieza: Si vuelve a 0 real, eliminar del relevamiento
        if (relData[p].qty === 0) delete relData[p];

        updateProductRow(p); renderFAB(); saveDraft();
    }

    function manualEl(el) { manualEntry(decodeURIComponent(el.dataset.prod)); }
    function manualEntry(p) {
        const val = prompt(`Cantidad para ${p}:`, relData[p]?.qty || '');
        if (val === null) return;
        const n = parseFloat(val.replace(',', '.'));
        if (!isNaN(n) && n >= 0) {
            if (!relData[p]) relData[p] = { qty: n, unit: units[0] };
            else relData[p].qty = n;
            if (relData[p].qty === 0) delete relData[p];
            updateProductRow(p); renderFAB(); saveDraft();
        }
    }

    function renderFAB() {
        const count = Object.keys(relData).length;
        const fab = document.getElementById('fab');
        if (count > 0) {
            fab.classList.remove('hidden');
            document.getElementById('fab-count').textContent = count;
        } else fab.classList.add('hidden');
    }

    /* ── RESUMEN Y NUBE ── */
    function openResumen() {
        const titleEl = document.getElementById('sh-title');
        const cfg = MODE_CONFIG[currentMode] || { label: 'RESUMEN', cls: 'stock', bodyClass: 'mode-stock' };
        
        if (titleEl) {
            titleEl.textContent = currentMode === 'pedido' ? 'Comanda de Pedido' : 'Estado de Stock';
            titleEl.style.color = currentMode === 'pedido' ? 'var(--violet)' : 'var(--blue)';
        }
        
        // 🎨 OCULTAR FAB
        const fab = document.getElementById('fab');
        if (fab) { fab.style.opacity = '0'; fab.style.pointerEvents = 'none'; }
        
        const byCat = {};
        Object.entries(relData).forEach(([p, d]) => {
            let cat = 'Otras';
            Object.keys(CATS).forEach(c => { if (CATS[c].prods.includes(p)) cat = c; });
            if (!byCat[cat]) byCat[cat] = [];
            byCat[cat].push({ p, d });
        });

        let html = '';
        const itemColor = currentMode === 'pedido' ? 'var(--violet)' : 'var(--blue)';
        
        Object.keys(byCat).sort().forEach(cat => {
            html += `<div class="res-cat" style="border-left: 3px solid ${itemColor}; background:rgba(255,255,255,0.02); padding:12px; border-radius:12px; margin-bottom:16px;">
                <div class="res-cat-name" style="color:${itemColor}; font-size:12px; margin-bottom:10px;">${cat.toUpperCase()}</div>
                ${byCat[cat].map(i => `
                    <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:15px; border-bottom:1px dashed rgba(255,255,255,0.05); padding-bottom:4px;">
                        <span style="font-weight:500;">${i.p}</span>
                        <span style="font-weight:900; color:${i.d.qty === 86 ? 'var(--red)' : itemColor}">
                            ${i.d.qty === 86 ? 'AGOTADO' : i.d.qty + ' ' + i.d.unit}
                        </span>
                    </div>`).join('')}
            </div>`;
        });
        document.getElementById('sh-body').innerHTML = html || '<div style="text-align:center;color:var(--dim);padding:40px;">No hay items cargados.</div>';
        document.getElementById('sheet-overlay').classList.add('open');
        refreshIcons();
    }

    function closeResumen(e) {
        if (!e || e.target === document.getElementById('sheet-overlay')) {
            document.getElementById('sheet-overlay').classList.remove('open');
            
            // 🎨 RESTAURAR FAB CON FADE IN
            const fab = document.getElementById('fab');
            if (fab && !fab.classList.contains('hidden')) {
                fab.style.opacity = '1';
                fab.style.pointerEvents = 'auto';
            }
        }
    }

    function sendWA() {
        const now = new Date();
        const modeLabel = (currentMode || 'STOCK').toUpperCase();
        let msg = `*COMANDA FEDE — ${modeLabel}*\n_${now.toLocaleDateString('es-AR')} ${now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}_\n\n`;
        
        const byCat = {};
        Object.entries(relData).forEach(([p, d]) => {
            let cat = 'Otros';
            Object.keys(CATS).forEach(c => { if (CATS[c].prods.includes(p)) cat = c; });
            if (!byCat[cat]) byCat[cat] = [];
            byCat[cat].push({ p, d });
        });

        Object.keys(byCat).sort().forEach(cat => {
            msg += `*${cat.toUpperCase()}*\\n`;
            byCat[cat].forEach(i => {
                const is86 = i.d.qty === 86;
                msg += `- ${i.p}: ${is86 ? 'AGOTADO (86)' : i.d.qty + ' ' + i.d.unit}\\n`;
            });
            msg += '\\n';
        });

        saveToCloud(true);
        window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
        closeResumen();
    }

    function sendHistWA(id) {
        const h = HIST.find(x => x.id == id);
        if (!h) return;
        const items = Array.isArray(h.items) ? h.items : [];
        const now = new Date(h.fecha);
        let msg = `*FEDE — HISTORIAL ${(h.mode || 'stock').toUpperCase()}*\n_${now.toLocaleDateString('es-AR')} ${now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}_\n\n`;
        const byCat = {};
        items.forEach(i => {
            if (!byCat[i.cat || 'Otros']) byCat[i.cat || 'Otros'] = [];
            byCat[i.cat || 'Otros'].push(i);
        });
        Object.keys(byCat).sort().forEach(cat => {
            msg += `*${cat.toUpperCase()}*\n`;
            byCat[cat].forEach(i => {
                const qty86 = i.qty === 86;
                msg += `• ${i.prod}: ${qty86 ? '⛔ 86' : i.qty + ' ' + formatUnit(i.qty, i.unit)}\n`;
            });
            msg += '\n';
        });
        window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
    }

    function saveToCloud(doClear = true) {
        const items = Object.entries(relData).map(([prod, d]) => {
            let cat = 'Otros';
            Object.keys(CATS).forEach(c => { if (CATS[c].prods.includes(prod)) cat = c; });
            return { prod, cat, qty: d.qty, unit: d.unit };
        });
        if (!items.length) { toast("⚠️ No hay datos para guardar"); return; }
        const entry = {
            id: Date.now(),
            fecha: new Date().toISOString(),
            turno: document.getElementById('hdr-turno')?.textContent || 'Apertura',
            mode: currentMode || 'stock',
            items,
            total: items.length
        };

        // 🟢 AUTO-DISMISS ALERT: Si es un control de stock, descartamos la alerta obligatoria
        if ((currentMode || 'stock') === 'stock' && window.holidayAlert) {
            window.holidayAlert.dismissStockCard("CONTROL DE STOCK");
        }

        setSyncStatus('pending');
        google.script.run
            .withSuccessHandler(() => {
                HIST.unshift(entry);
                toast("✓ ¡Sincronizado!");
                if (doClear) {
                    relData = {};
                    localStorage.removeItem('fede_draft');
                    renderFAB(); closeResumen(); goHome();
                }
                setSyncStatus('online');
                processOfflineQueue(); // Verificar si hay más
            })
            .withFailureHandler(err => {
                enqueueEntry(entry);
                if (doClear) {
                    relData = {};
                    localStorage.removeItem('fede_draft');
                    renderFAB(); closeResumen(); goHome();
                }
                setSyncStatus('error');
            })
            .addHistoryEntry(entry, activeSheetId);
    }

    function enqueueEntry(entry) {
        window.offlineQueue.push(entry);
        localStorage.setItem('fede_offline_queue', JSON.stringify(window.offlineQueue));
        updateSyncBadge();
        toast("⚠️ Sin conexión. Guardado en cola local.");
    }

    function updateSyncBadge() {
        const badge = document.getElementById('hdr-sync-badge');
        const count = document.getElementById('sync-count');
        if (badge && count) {
            if (window.offlineQueue.length > 0) {
                badge.classList.remove('hidden');
                count.textContent = window.offlineQueue.length;
            } else {
                badge.classList.add('hidden');
            }
        }
    }

    let isSyncing = false;
    function processOfflineQueue() {
        if (isSyncing || window.offlineQueue.length === 0) return;
        isSyncing = true;
        const entry = window.offlineQueue[0];
        
        google.script.run
            .withSuccessHandler(() => {
                window.offlineQueue.shift();
                localStorage.setItem('fede_offline_queue', JSON.stringify(window.offlineQueue));
                updateSyncBadge();
                isSyncing = false;
                if (window.offlineQueue.length > 0) processOfflineQueue();
                else toast("✓ Todos los datos sincronizados");
            })
            .withFailureHandler(() => {
                isSyncing = false; // Reintentar después
            })
            .addHistoryEntry(entry, activeSheetId);
    }

    /* ── GESTIÓN ABM ── */
    function renderTree() {
        const el = document.getElementById('tree-cats');
        if (!el) return;
        const sorted = Object.keys(CATS).sort((a, b) => (CATS[a].order || 99) - (CATS[b].order || 99));
        el.innerHTML = sorted.map(cat => {
            const isOpen = treeOpen[cat];
            const ec = encodeURIComponent(cat);
            return `
                <div class="tree-node">
                    <div class="tree-row" data-cat="${ec}" onclick="toggleTreeEl(this)">
                        <span class="tree-toggle ${isOpen ? 'open' : ''}">+</span>
                        <i data-lucide="${CATS[cat].icon || 'package'}" style="width:var(--icon-size-small);height:var(--icon-size-small);color:var(--gold);flex-shrink:0;"></i>
                        <span class="tree-label">${cat}</span>
                        <span style="font-size:11px;color:var(--dim);">${CATS[cat].prods.length} items</span>
                        <button data-cat="${ec}" onclick="event.stopPropagation();openEditCatEl(this)" style="background:none;border:none;color:var(--text2);padding:5px;cursor:pointer;">✏️</button>
                        <button data-cat="${ec}" onclick="event.stopPropagation();deleteCatEl(this)" style="background:none;border:none;color:var(--red);padding:5px;cursor:pointer;">✕</button>
                    </div>
                    <div class="tree-children ${isOpen ? 'open' : ''}">
                        ${[...CATS[cat].prods].sort().map(p => {
                const ep = encodeURIComponent(p);
                return `<div class="tree-leaf">
                                <span>${p}</span>
                                <div style="display:flex;gap:5px;">
                                    <button data-cat="${ec}" data-prod="${ep}" onclick="openEditProdEl(this)" class="tree-leaf-btn-edit">✏️</button>
                                    <button data-cat="${ec}" data-prod="${ep}" onclick="deleteProdEl(this)" style="background:none;border:none;color:var(--red);padding:5px;cursor:pointer;">✕</button>
                                </div>
                            </div>`;
            }).join('')}
                        <div class="tree-add-form">
                            <input data-cat="${ec}" class="tree-add-inp tree-prod-inp" placeholder="Nuevo producto..." onkeydown="if(event.key==='Enter') addProdInp(this)">
                            <button data-cat="${ec}" onclick="addProdBtn(this)" class="tree-add-btn">+ ADD</button>
                        </div>
                    </div>
                </div>`;
        }).join('');
        setTimeout(() => lucide.createIcons(), 50);
    }

    function toggleTreeEl(el) {
        const cat = decodeURIComponent(el.dataset.cat);
        treeOpen[cat] = !treeOpen[cat];
        renderTree();
    }

    function addCat() {
        const v = document.getElementById('new-cat-inp').value.trim();
        if (!v) return toast("Ingresá un nombre");
        if (CATS[v]) return toast("Ya existe");
        google.script.run
            .withSuccessHandler(r => {
                if (r.success) { CATS = r.data; document.getElementById('new-cat-inp').value = ''; renderTree(); renderCatGrid(); toast("✓ Creada"); }
                else toast("❌ " + r.error);
            })
            .withFailureHandler(err => toast("❌ Error: " + err.message))
            .createCategory(v, 'package');
    }

    function deleteCatEl(el) {
        const cat = decodeURIComponent(el.dataset.cat);
        if (!confirm(`¿Borrar "${cat}"?`)) return;
        delete CATS[cat];
        google.script.run.withSuccessHandler(() => { renderTree(); renderCatGrid(); toast("✓ Eliminada"); }).saveConfig('cats', CATS);
    }

    function addProdBtn(el) { _addProd(decodeURIComponent(el.dataset.cat), el.closest('.tree-children').querySelector('.tree-prod-inp')); }
    function addProdInp(inp) { _addProd(decodeURIComponent(inp.dataset.cat), inp); }
    function _addProd(cat, inp) {
        const v = inp.value.trim();
        if (!v || CATS[cat]?.prods?.includes(v)) return;
        google.script.run.withSuccessHandler(r => { if (r.success) { CATS = r.data; inp.value = ''; renderTree(); toast("✓ Añadido"); } }).createProduct(cat, v);
    }

    function deleteProdEl(el) {
        const cat = decodeURIComponent(el.dataset.cat), prod = decodeURIComponent(el.dataset.prod);
        if (confirm(`¿Eliminar "${prod}"?`)) google.script.run.withSuccessHandler(r => { if (r.success) { CATS = r.data; renderTree(); toast("✓ Eliminado"); } }).deleteProduct(cat, prod);
    }

    let editCatOld = null;
    function openEditCatEl(el) {
        const catName = decodeURIComponent(el.dataset.cat);
        editCatOld = catName;
        document.getElementById('modal-cat-name').value = catName;
        document.getElementById('modal-cat-icon').value = CATS[catName]?.icon || 'package';
        document.getElementById('modal-cat-size').value = CATS[catName]?.iconSize || '';
        document.getElementById('modal-edit-cat').classList.add('open');
    }
    function closeEditCatModal(e) { if (!e || e.target === document.getElementById('modal-edit-cat')) document.getElementById('modal-edit-cat').classList.remove('open'); }
    function handleEditCategory() {
        const newName = document.getElementById('modal-cat-name').value.trim();
        const newIcon = document.getElementById('modal-cat-icon').value.trim() || 'package';
        const newSize = parseInt(document.getElementById('modal-cat-size').value, 10) || null;
        google.script.run.withSuccessHandler(r => { if (r.success) { CATS = r.data; renderTree(); renderCatGrid(); toast("✓ Actualizada"); closeEditCatModal(); } }).updateCategory(editCatOld, newName, newIcon, newSize);
    }

    let editProdCat = null, editProdOld = null;
    function openEditProdEl(el) {
        editProdCat = decodeURIComponent(el.dataset.cat); editProdOld = decodeURIComponent(el.dataset.prod);
        document.getElementById('modal-prod-name').value = editProdOld;
        
        const uGroup = CUSTOM_UNITS[editProdOld] || [];
        for (let i = 0; i < 4; i++) {
            document.getElementById('mu-' + i).value = uGroup[i] || '';
        }

        document.getElementById('modal-edit-prod').classList.add('open');
    }
    function closeEditProdModal(e) { if (!e || e.target === document.getElementById('modal-edit-prod')) document.getElementById('modal-edit-prod').classList.remove('open'); }
    
    function handleEditProduct() {
        const newName = document.getElementById('modal-prod-name').value.trim();
        
        // Guardar Unidades Personalizadas (Hasta 4)
        let uArr = [];
        for (let i = 0; i < 4; i++) {
            const val = document.getElementById('mu-' + i).value.trim();
            if (val) uArr.push(val);
        }
        
        if (uArr.length > 0) CUSTOM_UNITS[newName] = uArr;
        else delete CUSTOM_UNITS[newName];
        
        if (editProdOld !== newName && CUSTOM_UNITS[editProdOld]) delete CUSTOM_UNITS[editProdOld];
        
        google.script.run.saveConfig('custom_units', CUSTOM_UNITS, activeSheetId);
        
        // Guardar nombre y relocalizar en CATS
        google.script.run.withSuccessHandler(r => { 
            if (r.success) { 
                CATS = r.data; 
                // Actualizar el DOM partial si es necesario y persistir local data
                const oldData = relData[editProdOld];
                if (oldData) { relData[newName] = oldData; delete relData[editProdOld]; saveDraft(); }
                renderTree(); 
                toast("✓ Actualizado"); 
                closeEditProdModal(); 
            } 
        }).updateProduct(editProdCat, editProdOld, newName);
    }
    
    function handleDeleteProduct() {
        if (!confirm(`¿Eliminar "${editProdOld}"?`)) return;
        delete CUSTOM_UNITS[editProdOld];
        google.script.run.saveConfig('custom_units', CUSTOM_UNITS, activeSheetId);
        google.script.run
            .withSuccessHandler(r => {
                if (r.success) { CATS = r.data; renderTree(); toast("✓ Eliminado"); closeEditProdModal(); }
                else toast("❌ " + r.error);
            })
            .withFailureHandler(err => toast("❌ Error: " + err.message))
            .deleteProduct(editProdCat, editProdOld);
    }

    /* ── DASHBOARD ── */
    function renderDashboard() {
        const loader = document.getElementById('dash-loader');
        const content = document.getElementById('dash-content');
        if (loader) loader.classList.remove('hidden');
        if (content) content.classList.add('hidden');

        google.script.run
            .withSuccessHandler(r => {
                if (loader) loader.classList.add('hidden');
                if (content) content.classList.remove('hidden');
                google.script.run
                    .withSuccessHandler(ra => {
                        const intelEl = document.getElementById('dash-intelligence-list');
                        if (ra?.success && ra.predictions?.length) {
                            intelEl.innerHTML = ra.predictions.map(p => `
                                <div style="display:flex; justify-content:space-between; align-items:center; padding-bottom:8px; border-bottom:1px solid rgba(212,168,67,0.1); margin-bottom:8px;">
                                    <div>
                                        <div style="font-weight:700; font-size:14px; color:var(--text);">${p.name}</div>
                                        <div style="font-size:10px; color:var(--dim);">Promedio: ${p.avg} ${p.unit || ''}</div>
                                    </div>
                                    <div style="text-align:right;">
                                        <div style="font-size:14px; font-weight:900; color:var(--gold);">Sug: ${p.suggestion}</div>
                                        <div style="font-size:9px; color:var(--gold); opacity:0.8; text-transform:uppercase;">Repo sug.</div>
                                    </div>
                                </div>`).join('');
                        } else {
                            intelEl.innerHTML = '<p style="color:var(--dim); font-size:12px;">No hay historial suficiente para predicciones.</p>';
                        }
                        refreshIcons();
                    })
                    .getPredictiveAnalysis(30);

                if (!r || !r.success) return;
                document.getElementById('card-totalitems').textContent = r.data.totalItems;
                document.getElementById('card-movtoday').textContent = r.data.movementsToday;
                const recentCatsEl = document.getElementById('dash-recent-cats');
                if (r.data.recentCats?.length) {
                    recentCatsEl.innerHTML = r.data.recentCats.map(rc => {
                        const cat = CATS[rc.name] || {};
                        const icon = cat.icon || 'package';
                        return `
                            <div class="dash-card-glass" style="min-width:140px; flex-shrink:0; text-align:center; padding:16px;">
                                <div style="background:var(--goldf); width:50px; height:50px; border-radius:12px; display:flex; align-items:center; justify-content:center; margin:0 auto 12px;">
                                    <i data-lucide="${icon}" style="width:var(--icon-size-large); height:var(--icon-size-large); color:var(--gold);"></i>
                                </div>
                                <div style="font-weight:700; font-size:13px; color:var(--text); margin-bottom:4px;">${rc.name}</div>
                                <div style="font-size:10px; color:var(--dim); font-weight:800;">${new Date(rc.ts).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}</div>
                                <button class="wa-btn" style="padding:6px; font-size:10px; margin-top:10px; background:var(--gold); color:#1a1008; border-radius:8px;" onclick="viewCatDetails('${encodeURIComponent(rc.name)}')">VER DETALLE</button>
                            </div>`;
                    }).join('');
                }
                const rankingEl = document.getElementById('dash-product-ranking');
                if (r.data.productRanking?.length) {
                    const maxCount = r.data.productRanking[0].count;
                    rankingEl.innerHTML = r.data.productRanking.map((p, idx) => {
                        const w = (p.count / maxCount) * 100;
                        return `
                            <div style="display:flex; align-items:center; gap:12px; margin-bottom:12px;">
                                <span style="font-weight:800; color:var(--gold); width:20px;">${idx + 1}</span>
                                <div style="flex:1;">
                                    <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                                        <span style="font-weight:700; font-size:13px;">${p.name}</span>
                                        <span style="font-size:11px; color:var(--dim);">${p.count} veces</span>
                                    </div>
                                    <div style="background:var(--s3); border-radius:4px; height:8px; overflow:hidden;">
                                        <div style="background:var(--gold); height:100%; width:${w}%; transition:width 0.6s;"></div>
                                    </div>
                                </div>
                            </div>`;
                    }).join('');
                }
                const sel = document.getElementById('dash-cat-select');
                sel.innerHTML = '<option value="">— Selecciona categoría —</option>';
                (r.data.allCategories || []).forEach(cat => {
                    const o = document.createElement('option'); o.value = cat; o.textContent = cat; sel.appendChild(o);
                });
                if (r.data.allCategories?.length) { sel.value = r.data.allCategories[0]; renderProductChart(7); }
                // 🚨 HOLIDAY STOCK SUGGESTIONS
                const sug = window.holidayHelper.getSuggestedReorders();
                const intelList = document.getElementById('dash-intelligence-list');
                if (sug.length > 0) {
                    const sugHtml = sug.map(s => `
                        <div style="background:rgba(224,82,82,0.1); border:1px solid var(--red); border-radius:12px; padding:15px; margin-bottom:12px;">
                            <div style="font-weight:900; font-size:11px; color:var(--red); text-transform:uppercase; letter-spacing:1px; margin-bottom:6px;">⚠️ Sugerencia Feriado</div>
                            <div style="font-size:14px; font-weight:700; color:var(--text);">${s.message}</div>
                            <p style="font-size:11px; color:var(--dim); margin-top:4px;">Refuerzo sugerido en: <b>${s.categories.join(', ')}</b></p>
                        </div>`).join('');
                    intelList.innerHTML = sugHtml + intelList.innerHTML;
                }

                refreshIcons();
            })
            .getDashboardMetrics(activeSheetId);
    }

    function viewCatDetails(catEnc) { enterMode('pedido'); selectCat(decodeURIComponent(catEnc)); }

    function renderProductChart(period) {
        const cat = document.getElementById('dash-cat-select').value;
        const container = document.getElementById('chart-container');
        const loader = document.getElementById('chart-loader');
        if (!cat) return;

        if (loader) loader.classList.remove('hidden');
        if (container) container.innerHTML = '';

        google.script.run
            .withSuccessHandler(r => {
                if (loader) loader.classList.add('hidden');
                if (!r?.success) return;

                const rawItems = Object.entries(r.data || {});
                const items = rawItems.filter(([, v]) => (v.qty > 0 || v.isOut)).sort((a, b) => (b[1].qty || 0) - (a[1].qty || 0));

                if (!items.length) {
                    container.innerHTML = '<p style="text-align:center;color:var(--dim);padding:40px;font-size:12px;">Sin movimientos registrados para esta categoría.</p>';
                    return;
                }

                const maxVal = Math.max(...items.map(i => i[1].qty || 0)) || 1;

                container.innerHTML = items.map(([prod, s]) => {
                    const isOut = s.isOut && s.outCount > 0;
                    const qty = s.qty || 0;
                    const w = (qty / maxVal) * 100;

                    return `
                    <div style="margin-bottom:18px;">
                        <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:6px;">
                            <div style="flex:1;">
                                <div style="font-weight:700; font-size:14px; color:var(--text); line-height:1.2;">${prod}</div>
                                ${isOut ? `<div style="font-size:10px; color:var(--red); font-weight:800; margin-top:2px; text-transform:uppercase;">🚫 Agotado (${s.outCount} veces)</div>` : ''}
                            </div>
                            <div style="text-align:right;">
                                <span style="font-size:18px; font-weight:900; color:${isOut && !qty ? 'var(--red)' : 'var(--blue)'};">
                                    ${isOut && !qty ? '86' : qty.toFixed(1)}
                                </span>
                                <span style="font-size:10px; color:var(--dim); font-weight:800; margin-left:2px;">${s.unit || ''}</span>
                            </div>
                        </div>
                        <div style="background:var(--s3); border-radius:6px; height:20px; overflow:hidden; border:1.5px solid var(--bd); position:relative;">
                            <div style="background:${isOut && !qty ? 'rgba(224,82,82,0.4)' : 'var(--gold)'}; height:100%; width:${isOut && !qty ? '100%' : w + '%'}; transition:width 0.8s cubic-bezier(0.16, 1, 0.3, 1);"></div>
                        </div>
                    </div>`;
                }).join('');
            })
            .getProductMovements(cat, period || 7);
    }

    function renderFavs() {
        const grid = document.getElementById('favs-grid'), container = document.getElementById('home-favs');
        if (!grid || !container) return; // Protegido contra nulos
        if (!FAVS.length) { container.classList.add('hidden'); return; }
        container.classList.remove('hidden');
        grid.innerHTML = FAVS.slice(0, 6).map(p => {
            let cat = 'Otros';
            Object.keys(CATS).forEach(c => { if (CATS[c].prods.includes(p)) cat = c; });
            const icon = CATS[cat]?.icon || 'star';
            return `
                <div class="dash-card" onclick="enterFav('${encodeURIComponent(p)}')" style="margin-bottom:0; padding:12px 6px; text-align:center; cursor:pointer; background:rgba(212,168,67,0.05); border:1px solid rgba(212,168,67,0.15);">
                    <i data-lucide="${icon}" style="width:var(--icon-size-small); height:var(--icon-size-small); color:var(--gold); display:block; margin:0 auto 6px;"></i>
                    <div style="font-size:11px; font-weight:800; color:var(--text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${p}</div>
                </div>`;
        }).join('');
        refreshIcons();
    }

    function enterFav(pEnc) {
        const p = decodeURIComponent(pEnc); let cat = null;
        Object.keys(CATS).forEach(c => { if (CATS[c].prods.includes(p)) cat = c; });
        if (!cat) return;
        enterMode('pedido'); selectCat(cat);
        setTimeout(() => {
            const row = Array.from(document.querySelectorAll('.prow')).find(r => r.querySelector('.pname').textContent === p);
            if (row) row.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 600);
    }

    function toggleFav(pEnc) {
        const p = decodeURIComponent(pEnc), idx = FAVS.indexOf(p);
        if (idx > -1) FAVS.splice(idx, 1); else { FAVS.unshift(p); if (FAVS.length > 6) FAVS.pop(); }
        updateProductRow(p); google.script.run.saveConfig('favs', FAVS, activeSheetId);
    }

    /* ── GLOBAL SEARCH ── */
    function searchGlobalHome(q) {
        const query = q.toLowerCase().trim();
        const resEl = document.getElementById('home-search-res');
        if (!query || query.length < 2) { resEl.classList.remove('active'); return; }
        
        let results = [];
        Object.keys(CATS).forEach(cat => {
            CATS[cat].prods.forEach(p => {
                if (p.toLowerCase().includes(query)) {
                    results.push({ p, cat });
                }
            });
        });
        
        if (results.length === 0) {
            resEl.innerHTML = '<div style="padding:15px; color:var(--dim); font-size:12px; text-align:center;">No se encontraron productos.</div>';
        } else {
            resEl.innerHTML = results.slice(0, 10).map(r => 
                `<div class="gs-item" onclick="promptGlobalLoad('${encodeURIComponent(r.p)}', '${encodeURIComponent(r.cat)}')">
                    <span class="gs-pname">${r.p}</span>
                    <span class="gs-pcat">${r.cat}</span>
                </div>`
            ).join('');
        }
        resEl.classList.add('active');
    }

    let globalSelected = null;
    function promptGlobalLoad(pEnc, catEnc) {
        const p = decodeURIComponent(pEnc), cat = decodeURIComponent(catEnc);
        document.getElementById('home-search-res').classList.remove('active');
        document.getElementById('home-search').value = '';
        
        globalSelected = { p, cat };
        document.getElementById('as-pname').textContent = p;
        document.getElementById('as-pcat').textContent = cat;

        const d = localStorage.getItem('fede_draft');
        document.getElementById('as-lbl-pedido').textContent = (currentMode === 'pedido' || (d && d.includes('"pedido"'))) ? 'Continuar Pedido Activo' : 'Nuevo Pedido';
        document.getElementById('as-lbl-stock').textContent = (currentMode === 'stock' || (d && d.includes('"stock"'))) ? 'Continuar Control Activo' : 'Nuevo Control de Stock';

        document.getElementById('global-action-sheet').classList.add('active');
    }

    function closeActionSheet(e) {
        if (!e || e.target === document.getElementById('global-action-sheet')) {
            document.getElementById('global-action-sheet').classList.remove('active');
        }
    }

    function confirmGlobalLoad(mode) {
        document.getElementById('global-action-sheet').classList.remove('active');
        if (!globalSelected) return;
        
        if (currentMode !== mode) initRelevamiento(mode);
        else {
            document.getElementById('home').classList.add('hidden');
            document.getElementById('app').classList.add('visible');
        }
        
        setTimeout(() => {
            selectCat(globalSelected.cat);
            setTimeout(() => {
                const ep = encodeURIComponent(globalSelected.p);
                const el = document.querySelector(`[data-prow="${ep}"]`);
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    el.style.transition = 'background 0.5s';
                    el.style.background = 'var(--goldf)';
                    setTimeout(() => el.style.background = '', 1500);
                }
            }, 100);
        }, 50);
    }

    /* ── DRAFT ── */
    function saveDraft() { if (currentMode) localStorage.setItem('fede_draft', JSON.stringify({ mode: currentMode, items: relData, ts: Date.now() })); }
    function checkDraft() {
        const draft = JSON.parse(localStorage.getItem('fede_draft') || 'null');
        const banner = document.getElementById('draft-banner');
        if (draft && Object.keys(draft.items).length > 0) banner.classList.remove('hidden'); else banner.classList.add('hidden');
    }
    function restoreDraft() { 
        const draft = JSON.parse(localStorage.getItem('fede_draft') || 'null'); 
        if (draft) { 
            relData = draft.items; 
            initRelevamiento(draft.mode); 
            renderFAB(); 
        } 
    }
    function discardDraft() { if (confirm("¿Borrar?")) { localStorage.removeItem('fede_draft'); checkDraft(); } }

    /* ── HISTORIAL ── */
    let histFilters = { mode: 'all', from: '', to: '', query: '' };
    function setHistFilter(type, val, el) {
        histFilters[type] = val;
        if (el) {
            el.parentNode.querySelectorAll('button').forEach(b => b.classList.remove('active'));
            el.classList.add('active');
        }
        renderHistory();
    }

    function renderHistory() {
        const list = document.getElementById('hist-list');
        if (!list) return;

        let filtered = HIST;
        
        // 1. Filtrar por Modo
        if (histFilters.mode !== 'all') {
            filtered = filtered.filter(h => (h.mode || 'stock').toLowerCase() === histFilters.mode);
        }

        // 2. Filtrar por Fechas
        if (histFilters.from) {
            const fromD = new Date(histFilters.from); fromD.setHours(0,0,0,0);
            filtered = filtered.filter(h => new Date(h.fecha) >= fromD);
        }
        if (histFilters.to) {
            const toD = new Date(histFilters.to); toD.setHours(23,59,59,999);
            filtered = filtered.filter(h => new Date(h.fecha) <= toD);
        }

        // 3. Filtrar por Búsqueda (Soporta producto o categoría)
        if (histFilters.query) {
            const q = histFilters.query.toLowerCase();
            filtered = filtered.filter(h => {
                const prodsMsg = (h.items || []).map(i => i.prod.toLowerCase() + (i.cat||'').toLowerCase()).join(' ');
                return prodsMsg.includes(q);
            });
        }
        if (!filtered.length) { list.innerHTML = `<p style="text-align:center;padding:40px;color:var(--dim);">No hay registros ${histFilters.mode !== 'all' ? ('de ' + histFilters.mode) : ''} aún.</p>`; return; }
        list.innerHTML = filtered.map(h => {
            const items = Array.isArray(h.items) ? h.items : [];
            return `
            <div class="dash-card" id="hist-card-${h.id}">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                    <span style="font-weight:800;color:var(--gold);border:1px solid var(--gold);padding:4px 12px;border-radius:12px;font-size:12px;">${(h.mode || 'stock').toUpperCase()}</span>
                    <div style="display:flex; gap:8px;">
                        <button onclick="editHistEntry('${h.id}')" style="background:var(--s2); border:1px solid var(--bd); border-radius:8px; padding:6px 10px; color:var(--text);"><i data-lucide="edit-3" style="width:14px;"></i></button>
                        <button onclick="deleteHistEntryManual('${h.id}')" style="background:rgba(224,82,82,0.1); border:1px solid var(--red); border-radius:8px; padding:6px 10px; color:var(--red);"><i data-lucide="trash-2" style="width:14px;"></i></button>
                    </div>
                </div>
                <div onclick="toggleHistExpand('${h.id}')" style="cursor:pointer;">
                    <div style="font-weight:700; font-size:18px;">${h.total} registros</div>
                    <div style="font-size:13px; color:var(--dim);">${new Date(h.fecha).toLocaleString('es-AR')}</div>
                    <div id="hist-expanded-${h.id}" class="hidden" style="margin-top:10px;">
                        ${items.map(i => `<div style="display:flex; justify-content:space-between; font-size:14px; margin-bottom:4px;"><span>${i.prod}</span><span style="font-weight:800; color:${i.qty === 86 ? 'var(--red)' : 'var(--primary)'}">${i.qty === 86 ? 'AGOTADO' : i.qty + ' ' + formatUnit(i.qty, i.unit)}</span></div>`).join('')}
                        <button onclick="sendHistWA('${h.id}'); event.stopPropagation();" style="width:100%; background:#25D366; color:white; margin-top:12px; padding:10px; border-radius:8px; border:none; font-weight:800; display:flex; align-items:center; justify-content:center; gap:8px;"><i data-lucide="message-circle" style="width:18px;"></i> ENVIAR WA</button>
                    </div>
                </div>
            </div>`;
        }).join('');
    }

    function toggleHistExpand(id) { document.getElementById(`hist-expanded-${id}`).classList.toggle('hidden'); }
    function deleteHistEntryManual(id) { if (confirm("¿Eliminar este registro?")) google.script.run.withSuccessHandler(() => { HIST = HIST.filter(h => h.id != id); renderHistory(); toast("✓ Eliminado"); }).deleteHistoryEntry(id); }

    let editingHistId = null, editingHistItems = [];
    function editHistEntry(id) {
        const h = HIST.find(x => x.id == id); if (!h) return;
        editingHistId = id; editingHistItems = JSON.parse(JSON.stringify(h.items));
        renderEditHistItems(); document.getElementById('modal-edit-hist').classList.add('open');
    }
    function renderEditHistItems() {
        document.getElementById('edit-hist-body').innerHTML = editingHistItems.map((item, idx) => `
            <div style="display:flex; align-items:center; justify-content:space-between; padding:10px; border-bottom:1px solid var(--bd);">
                <div style="flex:1;"><div style="font-weight:700; font-size:14px;">${item.prod}</div><div style="font-size:11px; color:var(--dim);">${item.unit}</div></div>
                <div style="display:flex; align-items:center; gap:10px; background:var(--s2); border-radius:8px; padding:4px;">
                    <button onclick="stepEditHistItem(${idx}, -1)" style="background:none; border:none; color:var(--text); font-size:18px; width:30px;">−</button>
                    <span style="font-weight:800; min-width:30px; text-align:center;">${item.qty}</span>
                    <button onclick="stepEditHistItem(${idx}, 1)" style="background:none; border:none; color:var(--text); font-size:18px; width:30px;">+</button>
                </div>
                <button onclick="editingHistItems.splice(${idx}, 1); renderEditHistItems();" style="background:none; border:none; color:var(--red); padding-left:10px;">✕</button>
            </div>`).join('');
    }
    function stepEditHistItem(idx, dir) {
        const item = editingHistItems[idx];
        const step = (item.unit === 'kg' || item.unit === 'litro/s') ? 0.5 : 1;
        item.qty = Math.max(0, parseFloat((item.qty + dir * step).toFixed(2)));
        renderEditHistItems();
    }
    function saveHistoryEdit() {
        const entry = { ...HIST.find(h => h.id == editingHistId), items: editingHistItems, total: editingHistItems.length, fecha: new Date().toISOString() };
        google.script.run.withSuccessHandler(() => {
            google.script.run.withSuccessHandler(() => { loadConfigFromGAS(); closeEditHistModal(); toast("✓ Actualizado"); }).deleteHistoryEntry(editingHistId);
        }).addHistoryEntry(entry);
    }
    function closeEditHistModal() { document.getElementById('modal-edit-hist').classList.remove('open'); }

    /* ── UTILIDADES ── */
    function toast(m, d = 2500) { const t = document.getElementById('toast'); t.textContent = m; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), d); }

    function exportCSV() {
        if (!HIST.length) return toast("No hay historial");
        const rows = [['ID', 'Fecha', 'Modo', 'Turno', 'Total', 'Productos']];
        HIST.forEach(h => {
            const prods = (h.items || []).map(i => `${i.prod} (${i.qty} ${i.unit || ''})`).join(' | ');
            rows.push([h.id, new Date(h.fecha).toLocaleString(), h.mode || '', h.turno || '', h.total, prods]);
        });
        const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `fede_historial.csv`; a.click(); toast("✓ CSV descargado");
    }

    function clearHistory(type) {
        if (!confirm(`¿Borrar todo el historial de ${type.toUpperCase()}? Esta acción no se puede deshacer.`)) return;
        google.script.run
            .withSuccessHandler(r => {
                if (r.success) {
                    HIST = HIST.filter(h => (h.mode || 'stock').toLowerCase() !== type);
                    renderHistory();
                    toast(`✓ ${r.count} registros eliminados`);
                } else toast("❌ Error: " + r.error);
            })
            .withFailureHandler(err => toast("❌ Error de servidor"))
            .deleteHistory(type);
    }

    function clearAllHistory() {
        if (!confirm("⚠️ ¿ESTÁS SEGURO DE BORRAR TODO? Se eliminarán todos los registros de Pedidos y Stock.")) return;
        google.script.run
            .withSuccessHandler(r => {
                if (r.success) {
                    HIST = [];
                    renderHistory();
                    toast("✓ Base de datos vaciada");
                } else toast("❌ Error: " + r.error);
            })
            .withFailureHandler(err => toast("❌ Error de servidor"))
            .deleteHistory('all');
    }

    /* ── FULLSCREEN ── */
    let fsCurrentCat = null, fsProducts = [], fsCurrentIdx = 0;
    function enterFullscreenMode() { if (!activeCat) return toast("Selecciona categoría"); fsCurrentCat = activeCat; fsProducts = [...CATS[fsCurrentCat].prods].sort(); fsCurrentIdx = 0; document.getElementById('prod-fullscreen').classList.add('active'); renderFSProduct(); }
    function exitFullscreenMode() { document.getElementById('prod-fullscreen').classList.remove('active'); saveDraft(); renderFAB(); }
    function renderFSProduct() {
        const prod = fsProducts[fsCurrentIdx], d = relData[prod] || { qty: 0, unit: units[0] };
        document.getElementById('prod-fs-cat').textContent = fsCurrentCat.toUpperCase();
        document.getElementById('prod-fs-name-sm').textContent = prod;
        document.getElementById('prod-fs-name').textContent = prod;
        document.getElementById('prod-fs-unit-row').innerHTML = getUnitsForProduct(fsCurrentCat).map(u => `<div class="prod-fs-uchip ${d.unit === u ? 'active' : ''}" onclick="fsSetUnit('${u}', '${prod}')">${u}</div>`).join('');
        const v = document.getElementById('prod-fs-stepval');
        if (d.qty === 86) { v.textContent = '86'; v.classList.add('is-86'); }
        else { v.textContent = d.qty || '—'; v.classList.remove('is-86'); }
        document.getElementById('prod-fs-counter').textContent = `${fsCurrentIdx + 1} / ${fsProducts.length}`;
    }
    function fsSetUnit(u, prod) { if (!relData[prod]) relData[prod] = { qty: 0, unit: u }; else relData[prod].unit = u; renderFSProduct(); saveDraft(); }
    function fsStepProd(dir) {
        const prod = fsProducts[fsCurrentIdx]; if (!relData[prod]) relData[prod] = { qty: 0, unit: units[0] };
        const step = (relData[prod].unit === 'kg' || relData[prod].unit === 'litro/s') ? 0.5 : 1;
        relData[prod].qty = Math.max(0, parseFloat((relData[prod].qty + dir * step).toFixed(2)));
        if (relData[prod].qty === 0) delete relData[prod];
        renderFSProduct(); saveDraft();
    }
    function fs86() { const p = fsProducts[fsCurrentIdx]; relData[p] = { qty: 86, unit: units[0] }; toast("⚠️ 86"); saveDraft(); setTimeout(() => fsNext(), 500); }
    function fsNext() { if (fsCurrentIdx < fsProducts.length - 1) { fsCurrentIdx++; renderFSProduct(); } else { exitFullscreenMode(); toast("✓ Fin"); } }
    function fsPrev() { if (fsCurrentIdx > 0) { fsCurrentIdx--; renderFSProduct(); } }
    function fsManualEntry() {
        const p = fsProducts[fsCurrentIdx]; const val = prompt(`Cantidad:`, relData[p]?.qty || '');
        if (val !== null) {
            const n = parseFloat(val.replace(',', '.'));
            if (!isNaN(n)) { relData[p] = { qty: n, unit: relData[p]?.unit || units[0] }; renderFSProduct(); saveDraft(); }
        }
    }

    /* ── GESTIÓN DE BASES DE DATOS (DB) ── */
    function saveSheetId() {
        let val = document.getElementById('db-sheet-id').value.trim();
        if (!val) return toast("❌ Ingresa un ID o URL");
        if (val.includes('/d/')) val = val.split('/d/')[1].split('/')[0];
        localStorage.setItem('fede_active_sheet_id', val);
        toast("✓ Vinculando..."); setTimeout(() => location.reload(), 1000);
    }
    function resetToMaster() {
        localStorage.removeItem('fede_active_sheet_id');
        toast("✓ Maestro restaurado."); setTimeout(() => location.reload(), 1000);
    }
    function updateDBLabel() {
        const label = document.getElementById('active-db-label');
        if (label) {
            const sid = localStorage.getItem('fede_active_sheet_id');
            if (sid) {
                label.textContent = `${dbName} (${sid.substring(0, 8)}...)`;
                label.style.color = 'var(--gold)';
            } else {
                label.textContent = `DATABASE: MASTER (DEFAULT)`;
            }
        }
    }

    function clearCurrentRel() {
        if (!confirm("¿Seguro que quieres borrar todo el relevamiento actual y dejar todo en 0?")) return;
        relData = {};
        localStorage.removeItem('fede_draft');
        renderProducts();
        renderFAB();
        closeResumen();
        toast("Relevamiento borrado");
    }

    /* ── ENTRANTE: MERCADERÍA ── */
    function renderEntranteView() {
        const dl = document.getElementById('ent-prods-datalist');
        if (dl) {
            const allProds = [];
            Object.values(CATS).forEach(c => allProds.push(...c.prods));
            const uniqueProds = [...new Set(allProds)].sort();
            dl.innerHTML = uniqueProds.map(p => `<option value="${p}">`).join('');
        }
        
        const dateInput = document.getElementById('ent-date-inp');
        if (dateInput && !dateInput.value) {
            dateInput.value = new Date().toISOString().split('T')[0];
        }

        loadEntranteHistory();
        refreshIcons();
    }

    function saveEntranteRecord() {
        const prod = document.getElementById('ent-prod-inp').value.trim();
        const qty = parseFloat(document.getElementById('ent-qty-inp').value);
        const unit = document.getElementById('ent-unit-inp').value;
        const date = document.getElementById('ent-date-inp').value;

        if (!prod || isNaN(qty) || !date) {
            toast("Completa todos los campos");
            return;
        }

        const entry = {
            id: Date.now(),
            fecha: new Date(date + 'T12:00:00').toISOString(),
            mode: 'entrante',
            items: [{ prod, qty, unit, cat: 'Entrada' }],
            total: 1
        };

        setSyncStatus('pending');
        google.script.run
            .withSuccessHandler(r => {
                if (r && r.success) {
                    toast("Entrada registrada");
                    document.getElementById('ent-prod-inp').value = '';
                    document.getElementById('ent-qty-inp').value = '';
                    loadConfigFromGAS(); 
                } else {
                    toast("Error al guardar");
                }
                setSyncStatus('online');
            })
            .withFailureHandler(err => {
                if (window.enqueueEntry) enqueueEntry(entry);
                setSyncStatus('error');
            })
            .addHistoryEntry(entry, activeSheetId);
    }

    function loadEntranteHistory() {
        const list = document.getElementById('ent-history-list');
        if (!list) return;

        const ents = (HIST || []).filter(h => h.mode === 'entrante').slice(0, 10);
        if (ents.length === 0) {
            list.innerHTML = '<div style="text-align:center; color:var(--dim); padding:20px; font-size:12px;">Sin entradas recientes.</div>';
            return;
        }

        list.innerHTML = ents.map(h => {
            const item = (h.items && h.items[0]) || {};
            return `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:12px; border-bottom:1px solid var(--bd); background:rgba(16,185,129,0.03); border-radius:10px; margin-bottom:8px;">
                <div>
                    <div style="font-weight:700; font-size:14px; color:var(--text);">${item.prod || 'Producto'}</div>
                    <div style="font-size:11px; color:var(--dim);">${new Date(h.fecha).toLocaleDateString('es-AR')}</div>
                </div>
                <div style="text-align:right;">
                    <div style="font-size:15px; font-weight:800; color:var(--green);">${item.qty || 0} ${item.unit || ''}</div>
                </div>
            </div>`;
        }).join('');
    }

    /* ── IDENTIDAD: APP TITLE ── */
    function loadAppTitle() {
        const title = localStorage.getItem('fede_app_title') || 'FeDe';
        const titleDisplay = document.getElementById('app-logo-text');
        const titleInput = document.getElementById('app-title-inp');
        if (titleDisplay) titleDisplay.textContent = title;
        if (titleInput) titleInput.value = title;
    }

    function saveAppTitle() {
        const val = document.getElementById('app-title-inp').value.trim();
        if (!val) return;
        localStorage.setItem('fede_app_title', val);
        const titleDisplay = document.getElementById('app-logo-text');
        if (titleDisplay) titleDisplay.textContent = val;
        google.script.run.saveConfig('app_title', val, activeSheetId);
        toast("Título actualizado");
    }

    function refreshIcons() { if (window.lucide) lucide.createIcons(); }


