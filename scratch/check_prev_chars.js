const fs = require('fs');
const data = require('../quran_data.js');

const prevOf0657 = {};
const prevOf0656 = {};

for (const surah of data) {
    for (const verse of surah.verses) {
        for (let i = 0; i < verse.text.length; i++) {
            const char = verse.text[i];
            const code = char.charCodeAt(0);
            if (code === 0x0657) {
                const prev = i > 0 ? verse.text[i - 1] : '^';
                const prevCode = prev.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0');
                const key = `U+${prevCode}(${prev})`;
                prevOf0657[key] = (prevOf0657[key] || 0) + 1;
            } else if (code === 0x0656) {
                const prev = i > 0 ? verse.text[i - 1] : '^';
                const prevCode = prev.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0');
                const key = `U+${prevCode}(${prev})`;
                prevOf0656[key] = (prevOf0656[key] || 0) + 1;
            }
        }
    }
}

console.log("Preceding characters for U+0657 (Inverted Damma):");
console.log(prevOf0657);
console.log("\nPreceding characters for U+0656 (Subscript Alef):");
console.log(prevOf0656);
