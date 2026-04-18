const fs = require('fs');

const indexHtml = fs.readFileSync('Index.html', 'utf8');
const stylesHtml = fs.readFileSync('styles.html', 'utf8');
const holidaysHtml = fs.readFileSync('holidays.html', 'utf8');
const appHtml = fs.readFileSync('app.html', 'utf8');

// Mimic GAS include
let finalHtml = indexHtml
  .replace("<?!= include('styles'); ?>", stylesHtml)
  .replace("<?!= include('holidays'); ?>", holidaysHtml)
  .replace("<?!= include('app'); ?>", appHtml);

fs.writeFileSync('merged.html', finalHtml);

// Extraer TODAS las secciones de javascript de <script> y armar un bloque gigante para debuggear líneas
const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
let match;
let jsCodeTotal = '';
let currentHtmlLine = 1;

const lines = finalHtml.split('\n');

/// En vez de esto, pasemos TODO a jsdom o puppeteer, O... 
/// Node VM script check sobre un array con las lineas reemplazadas
let rawJs = finalHtml.replace(/<script[^>]*>/gi, '<script>').split('\n');
let isScript = false;
let assembledJs = [];

for (let i = 0; i < rawJs.length; i++) {
    const line = rawJs[i];
    if (line.includes('<script>')) {
        isScript = true;
        let parts = line.split('<script>');
        assembledJs.push('// line ' + (i+1));
        if (parts[1] && parts[1].includes('</script>')) {
            assembledJs.push(parts[1].split('</script>')[0]);
            isScript = false;
        } else if (parts[1]) {
            assembledJs.push(parts[1]);
        }
    } else if (line.includes('</script>')) {
        let parts = line.split('</script>');
        assembledJs.push(parts[0]);
        isScript = false;
    } else if (isScript) {
        assembledJs.push(line);
    } else {
        assembledJs.push(''); // Mantener la misma numeración de líneas
    }
}

fs.writeFileSync('extracted_scripts.js', assembledJs.join('\n'));

try {
  require('vm').Script(assembledJs.join('\n'));
  console.log('No syntax error found in scripts blocks!');
} catch (e) {
  console.log('Syntax Error detected!');
  const stack = e.stack.split('\n');
  console.log(stack[0], stack[1]);
}
