const fs = require('fs');
const content = fs.readFileSync('app.js', 'utf8');
const lines = content.split('\n');

const ids = [
    'box-continent', 'box-country', 'box-height', 'box-age',
    'box-position', 'box-speed', 'box-finishing', 'box-dribbling',
    'box-passing', 'box-strength', 'box-defending', 'box-seasons', 'box-clubs'
];

console.log("=== References to result boxes in app.js ===");
lines.forEach((line, i) => {
    ids.forEach(id => {
        if (line.includes(id)) {
            console.log(`Line ${i + 1} (${id}): ${line.trim()}`);
        }
    });
});
