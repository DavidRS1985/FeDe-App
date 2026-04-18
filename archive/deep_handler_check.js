const fs = require('fs');
const html = fs.readFileSync('merged.html', 'utf8');
const regex = /\bon[a-z]+="([^"]+)"/gi;
let match;
while ((match = regex.exec(html)) !== null) {
    let code = match[1];
    // Interpolate ${...} with dummy values for the check
    code = code.replace(/\${[^}]+}/g, '0');
    try {
        new Function(code);
    } catch (e) {
        console.log(`Syntax Error in handler [${match[0]}]: ${e.message}`);
    }
}
