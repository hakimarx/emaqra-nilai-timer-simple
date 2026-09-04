const fs = require('fs');
const data = require('../quran_data.js');

console.log("=== VERSES WITH U+0657 PRECEDED BY H (ه) ===");
for (const surah of data) {
    for (const verse of surah.verses) {
        if (verse.text.includes('هٗ')) {
            console.log(`Surah ${surah.id} (${surah.transliteration}) Ayat ${verse.id}:`);
            console.log(verse.text);
            const idx = verse.text.indexOf('هٗ');
            const surrounding = verse.text.substring(Math.max(0, idx - 10), Math.min(verse.text.length, idx + 10));
            console.log("Surrounding:", surrounding);
            console.log();
        }
    }
}

console.log("=== VERSES WITH U+0656 PRECEDED BY H (ه) ===");
for (const surah of data) {
    for (const verse of surah.verses) {
        if (verse.text.includes('هٖ')) {
            console.log(`Surah ${surah.id} (${surah.transliteration}) Ayat ${verse.id}:`);
            console.log(verse.text);
            const idx = verse.text.indexOf('هٖ');
            const surrounding = verse.text.substring(Math.max(0, idx - 10), Math.min(verse.text.length, idx + 10));
            console.log("Surrounding:", surrounding);
            console.log();
        }
    }
}
