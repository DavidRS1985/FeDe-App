const fs = require('fs');
const html = fs.readFileSync('test.html', 'utf8');
const matches = html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi);
let js = '';
for (let m of matches) {
    js += m[1] + '\n';
}
const lines = js.split('\n');
let output = '';
for (let i = 0; i < lines.length; i++) {
    output += (i + 1) + ': ' + lines[i] + '\n';
}
fs.writeFileSync('extracted_lines.txt', output);
