const fs = require('fs');

const data = require('../quran_data.js');

const charMap = {};
for (const surah of data) {
    for (const verse of surah.verses) {
        for (const char of verse.text) {
            const code = char.charCodeAt(0);
            if (code >= 0x0600 && code <= 0x08FF) {
                if (!charMap[code]) {
                    charMap[code] = { char, count: 0, hex: code.toString(16).toUpperCase().padStart(4, '0') };
                }
                charMap[code].count++;
            }
        }
    }
}

const sorted = Object.values(charMap).sort((a, b) => b.count - a.count);
for (const entry of sorted) {
    console.log(`U+${entry.hex} (${entry.char}): ${entry.count}`);
}
