const fs = require('fs');
const opentype = require('opentype.js');

try {
    const buffer = fs.readFileSync('d:/emaqra+timer + rekap nilai/LPMQ IsepMisbah.ttf');
    // Using opentype.parse synchronously
    const font = opentype.parse(new Uint8Array(buffer).buffer);
    
    const codes = [
        0x064B, 0x064C, 0x064D, // standard tanwins
        0x0654, 0x0655, 0x0656, 0x0657, 0x0658, 0x065E, // diacritics
        0x08ED, // tone mark
        0x08F0, 0x08F1, 0x08F2 // open tanwins
    ];
    
    console.log("Glyphs mapped in LPMQ IsepMisbah.ttf:");
    for (const code of codes) {
        const glyph = font.charToGlyph(String.fromCharCode(code));
        console.log(`U+${code.toString(16).toUpperCase().padStart(4, '0')}: glyph name = "${glyph.name}", index = ${glyph.index}`);
    }
} catch (e) {
    console.error('Error:', e);
}
