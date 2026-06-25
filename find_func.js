const fs = require('fs');
const content = fs.readFileSync('app.js', 'utf8');
const lines = content.split('\n');
lines.forEach((line, idx) => {
    if (line.toLowerCase().includes('jornada') || line.toLowerCase().includes('nascimento')) {
        console.log(`Linha ${idx + 1}: ${line.trim()}`);
    }
});
