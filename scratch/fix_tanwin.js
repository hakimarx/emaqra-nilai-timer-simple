const fs = require('fs');
const path = require('path');

const quranPath = 'd:/emaqra+timer + rekap nilai/quran_data.js';
const mfqPath = 'd:/emaqra+timer + rekap nilai/mfq_data.js';

// Create backups in scratch/
fs.copyFileSync(quranPath, 'd:/emaqra+timer + rekap nilai/scratch/quran_data.js.bak');
fs.copyFileSync(mfqPath, 'd:/emaqra+timer + rekap nilai/scratch/mfq_data.js.bak');
console.log("Backups created successfully.");

function fixFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Count occurrences before
    const count57 = (content.match(/\u0657/g) || []).length;
    const count56 = (content.match(/\u0656/g) || []).length;
    const count5E = (content.match(/\u065E/g) || []).length;
    
    // Perform replacements:
    // U+0657 (inverted damma) -> U+064B (fathatain)
    // U+0656 (subscript alef) -> U+064D (kasratain)
    // U+065E (reversed damma) -> U+064C (dammataun)
    content = content.replace(/\u0657/g, '\u064B');
    content = content.replace(/\u0656/g, '\u064D');
    content = content.replace(/\u065E/g, '\u064C');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed ${path.basename(filePath)}:`);
    console.log(`  Replaced U+0657 with U+064B: ${count57} times`);
    console.log(`  Replaced U+0656 with U+064D: ${count56} times`);
    console.log(`  Replaced U+065E with U+064C: ${count5E} times`);
}

fixFile(quranPath);
fixFile(mfqPath);
