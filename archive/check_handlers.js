const fs = require('fs');
const html = fs.readFileSync('merged.html', 'utf8');
const regex = /\bon[a-z]+="([^"]+)"/gi;
let match;
while ((match = regex.exec(html)) !== null) {
    const code = match[1];
    let pStack = 0;
    let bStack = 0;
    let sStack = 0;
    for (let i = 0; i < code.length; i++) {
        const c = code[i];
        if (c === '(') pStack++;
        else if (c === ')') pStack--;
        else if (c === '{') bStack++;
        else if (c === '}') bStack--;
        else if (c === '[') sStack++;
        else if (c === ']') sStack--;
        
        if (pStack < 0 || bStack < 0 || sStack < 0) {
            console.log(`EXTRA CLOSING in ${code}`);
            break;
        }
    }
    if (pStack > 0) console.log(`UNCLOSED PAREN in ${code}`);
    if (bStack > 0) console.log(`UNCLOSED BRACE in ${code}`);
    if (sStack > 0) console.log(`UNCLOSED BRACKET in ${code}`);
}
