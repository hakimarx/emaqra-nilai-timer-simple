const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        if (file === '.git' || file === 'node_modules' || file === 'scratch') return;
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(filePath));
        } else {
            results.push(filePath);
        }
    });
    return results;
}

const files = walk('d:/emaqra+timer + rekap nilai');
for (const file of files) {
    if (file.endsWith('.ttf') || file.endsWith('.png') || file.endsWith('.mp4')) continue;
    try {
        const content = fs.readFileSync(file, 'utf8');
        const count57 = (content.match(/\u0657/g) || []).length;
        const count56 = (content.match(/\u0656/g) || []).length;
        if (count57 > 0 || count56 > 0) {
            console.log(`${file}: U+0657 => ${count57}, U+0656 => ${count56}`);
        }
    } catch (e) {
        // ignore binary/read errors
    }
}
