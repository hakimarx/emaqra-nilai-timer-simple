const fs = require('fs');
const data = require('../mfq_data.js');

console.log("=== OCCURRENCES OF U+0657 IN mfq_data.js ===");
// Search all answers in MFQ_SOAL_DATA
for (const category in data) {
    const list = data[category];
    for (const item of list) {
        const text = item.jawaban;
        if (text.includes('\u0657')) {
            console.log(`ID ${item.id}:`);
            console.log(text);
            const idx = text.indexOf('\u0657');
            const surrounding = text.substring(Math.max(0, idx - 10), Math.min(text.length, idx + 10));
            console.log("Surrounding:", surrounding);
            console.log();
        }
    }
}

console.log("=== OCCURRENCES OF U+0656 IN mfq_data.js ===");
for (const category in data) {
    const list = data[category];
    for (const item of list) {
        const text = item.jawaban;
        if (text.includes('\u0656')) {
            console.log(`ID ${item.id}:`);
            console.log(text);
            const idx = text.indexOf('\u0656');
            const surrounding = text.substring(Math.max(0, idx - 10), Math.min(text.length, idx + 10));
            console.log("Surrounding:", surrounding);
            console.log();
        }
    }
}
