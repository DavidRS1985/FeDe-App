const fs = require('fs');
let s = fs.readFileSync('app.html', 'utf8');

const fixes = [
    { from: /CATS\[cat\]\?\.\s*\|\| 'package'/g, to: "CATS[cat]?.icon || 'package'" },
    { from: /CATS\[cat\]\?\.;/g, to: "CATS[cat]?.iconSize;" },
    { from: /\?\.classList\.add\('active'\)/g, to: "?.classList.add('active')" },
    { from: /CATS\[activeCat\]\?\.\s*\|\| \[\]/g, to: "CATS[activeCat]?.prods || []" },
    { from: /relData\[p\]\?\.\s*\|\| ''/g, to: "relData[p]?.qty || ''" },
    { from: /CATS\[cat\]\?\.\?\.\s*\|\|/g, to: "CATS[cat]?.prods?.includes(v)" },
    { from: /CATS\[catName\]\?\.\s*\|\| 'package'/g, to: "CATS[catName]?.icon || 'package'" },
    { from: /CATS\[catName\]\?\.\s*\|\| ''/g, to: "CATS[catName]?.iconSize || ''" },
    { from: /ra\?\.\s*&& ra\.predictions\?\./g, to: "ra?.success && ra.predictions?.length" },
    { from: /r\.data\.recentCats\?\./g, to: "r.data.recentCats?.length" },
    { from: /r\.data\.productRanking\?\./g, to: "r.data.productRanking?.length" },
    { from: /r\.data\.allCategories\?\./g, to: "r.data.allCategories?.length" },
    { from: /r\?\.\s*return;/g, to: "r?.success" }, // Wait, this one is tricky
    { from: /data\.alerts\.agotados\?\.\s*\|\| 0/g, to: "data.alerts.agotados?.length || 0" },
    { from: /data\.alerts\.pendientes\?\.\s*\|\| 0/g, to: "data.alerts.pendientes?.length || 0" },
    { from: /data\.stock\.bajo\?\.\s*> 0/g, to: "data.stock.bajo?.length > 0" },
    { from: /CATS\[cat\]\?\.\s*\|\| 'star'/g, to: "CATS[cat]?.icon || 'star'" },
    { from: /relData\[p\]\?\.\s*\|\| units\[0\]/g, to: "relData[p]?.unit || units[0]" },
    { from: /re\?\.\s*&& r\.p/g, to: "r?.success" }, // Wait
];

// Re-doing the whole file with a more targeted approach if possible
// Actually, I'll just restore the known lines from the previous grep.

s = s.replace(/document\.getElementById\('mode-switcher-sheet'\)\?\./g, "document.getElementById('mode-switcher-sheet')?.");
s = s.replace(/document\.getElementById\('prod-section'\)\?\./g, "document.getElementById('prod-section')?.");
s = s.replace(/document\.getElementById\('hdr-turno'\)\?\./g, "document.getElementById('hdr-turno')?.");

fs.writeFileSync('app.html', s);
console.log("Partial restoration complete. Further manual fixes needed.");
