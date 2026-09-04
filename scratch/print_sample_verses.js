const fs = require('fs');
const data = require('../quran_data.js');

function printVersesWith(charCodes, limit = 5) {
    console.log(`--- Verses with character codes [${charCodes.map(c => 'U+' + c.toString(16).toUpperCase()).join(', ')}] ---`);
    let count = 0;
    for (const surah of data) {
        for (const verse of surah.verses) {
            let found = false;
            for (const char of verse.text) {
                if (charCodes.includes(char.charCodeAt(0))) {
                    found = true;
                    break;
                }
            }
            if (found) {
                console.log(`Surah ${surah.id} (${surah.transliteration}) Ayat ${verse.id}:`);
                console.log(verse.text);
                // Print char codes of the verse to inspect them
                const codes = [...verse.text].map(c => {
                    const code = c.charCodeAt(0);
                    return `U+${code.toString(16).toUpperCase().padStart(4, '0')}(${c})`;
                }).join(' ');
                console.log(codes);
                console.log();
                count++;
                if (count >= limit) return;
            }
        }
    }
}

printVersesWith([0x0654]);
printVersesWith([0x065E]);
printVersesWith([0x06ED]);
