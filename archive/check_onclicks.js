const fs = require('fs');
const files = ['Index.html', 'app.html', 'holidays.html'];

files.forEach(file => {
    try {
        const content = fs.readFileSync(file, 'utf8');
        const regex = /on[a-z]+="([^"]+)"/gi;
        let match;
        while ((match = regex.exec(content)) !== null) {
            let code = match[1];
            // Since some code is inside template strings injected into innerHTML:
            // e.g. onclick="toggleFav('${ep}')" -> replace ${ep} with something valid to test syntax
            code = code.replace(/\$\{([^}]+)\}/g, "0"); 
            try {
                new Function(code);
            } catch(e) {
                console.log(`Syntax Error in ${file} at ${match[0]}: ${e.message}`);
            }
        }
    } catch(err) {
        console.error("Error reading file", file);
    }
});
