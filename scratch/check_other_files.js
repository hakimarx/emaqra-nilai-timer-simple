const fs = require('fs');
const path = require('path');

const dir = 'd:/emaqra+timer + rekap nilai';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));

for (const file of files) {
    const filePath = path.join(dir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const count57 = (content.match(/\u0657/g) || []).length;
    const count56 = (content.match(/\u0656/g) || []).length;
    const count5E = (content.match(/\u065E/g) || []).length;
    const count54 = (content.match(/\u0654/g) || []).length;
    const count8ED = (content.match(/\u08ED/g) || []).length;
    
    if (count57 > 0 || count56 > 0 || count5E > 0 || count54 > 0 || count8ED > 0) {
        console.log(`${file}:`);
        console.log(`  U+0657: ${count57}`);
        console.log(`  U+0656: ${count56}`);
        console.log(`  U+065E: ${count5E}`);
        console.log(`  U+0654: ${count54}`);
        console.log(`  U+08ED: ${count8ED}`);
    }
}
