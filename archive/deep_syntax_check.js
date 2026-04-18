const fs = require('fs');

function checkFile(filename) {
    const content = fs.readFileSync(filename, 'utf8');
    const scripts = content.match(/<script\b[^>]*>([\s\S]*?)<\/script>/gi);
    if (!scripts) return;

    scripts.forEach((scriptTag, idx) => {
        const code = scriptTag.replace(/<script[^>]*>/i, '').replace(/<\/script>/i, '');
        try {
            new (require('vm').Script)(code);
        } catch (e) {
            console.log(`Error in ${filename} (script block ${idx}):`, e.message);
            // Try to find the line
            const lines = code.split('\n');
            const match = e.stack.match(/eval:(\d+):(\d+)/);
            if (match) {
                const lineNum = parseInt(match[1]);
                console.log(`Potential offending line ${lineNum}: ${lines[lineNum - 1]}`);
            }
        }
    });

    // Check on* handlers
    const onRegex = /\bon[a-z]+="([^"]+)"/gi;
    let match;
    while ((match = onRegex.exec(content)) !== null) {
        const code = match[1];
        try {
            new (require('vm').Script)(code);
        } catch (e) {
            console.log(`Error in ${filename} (handler: ${match[0]}):`, e.message);
        }
    }
}

['Index.html', 'app.html', 'holidays.html'].forEach(checkFile);
