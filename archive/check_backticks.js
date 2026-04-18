const fs = require('fs');
['Index.html', 'app.html', 'holidays.html'].forEach(f => {
    const s = fs.readFileSync(f, 'utf8');
    const scripts = s.match(/<script\b[^>]*>([\s\S]*?)<\/script>/gi) || [];
    scripts.forEach((tag, idx) => {
        const code = tag.replace(/<script[^>]*>/i, '').replace(/<\/script>/i, '');
        const count = (code.match(/`/g) || []).length;
        if (count % 2 !== 0) {
            console.log(`${f} script block ${idx} has ODD backticks: ${count}`);
        }
    });
});
