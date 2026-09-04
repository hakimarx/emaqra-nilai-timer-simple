const fs = require('fs');
const path = require('path');

const quranPath = 'd:/emaqra+timer + rekap nilai/quran_data.js';
const mfqPath = 'd:/emaqra+timer + rekap nilai/mfq_data.js';

// Create backups in scratch/
fs.copyFileSync(quranPath, 'd:/emaqra+timer + rekap nilai/scratch/quran_data.js.bak2');
fs.copyFileSync(mfqPath, 'd:/emaqra+timer + rekap nilai/scratch/mfq_data.js.bak2');
console.log("Backups created successfully.");

function fixAlifTegak(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Count occurrences of U+064E followed by U+0670
    const countBefore = (content.match(/\u064E\u0670/g) || []).length;
    
    // Replace U+064E\u0670 with U+0670
    content = content.replace(/\u064E\u0670/g, '\u0670');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed ${path.basename(filePath)}:`);
    console.log(`  Replaced U+064E\\u0670 with U+0670: ${countBefore} times`);
}

fixAlifTegak(quranPath);
fixAlifTegak(mfqPath);
