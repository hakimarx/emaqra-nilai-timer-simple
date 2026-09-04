const fs = require('fs');
const data = require('../quran_data.js');

let count = 0;
for (const surah of data) {
    for (const verse of surah.verses) {
        if (verse.text.includes('\u064E\u0670')) {
            console.log(`Surah ${surah.id} Ayat ${verse.id}:`);
            console.log(verse.text);
            const idx = verse.text.indexOf('\u064E\u0670');
            const surrounding = verse.text.substring(Math.max(0, idx - 5), Math.min(verse.text.length, idx + 5));
            console.log("Surrounding:", [...surrounding].map(c => `U+${c.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')}(${c})`).join(' '));
            console.log();
            count++;
            if (count >= 5) break;
        }
    }
    if (count >= 5) break;
}
