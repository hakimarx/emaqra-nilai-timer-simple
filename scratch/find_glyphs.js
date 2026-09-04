const fs = require('fs');
const opentype = require('opentype.js');

try {
    const buffer = fs.readFileSync('d:/emaqra+timer + rekap nilai/LPMQ IsepMisbah.ttf');
    const font = opentype.parse(new Uint8Array(buffer).buffer);
    
    console.log("Total glyphs:", font.glyphs.length);
    
    // Find all characters mapped in cmap
    const cmap = font.tables.cmap.glyphIndexMap;
    const mapped = [];
    for (const [codeStr, index] of Object.entries(cmap)) {
        const code = parseInt(codeStr);
        const glyph = font.glyphs.get(index);
        mapped.push({ code, name: glyph.name, index });
    }
    
    // Sort by unicode
    mapped.sort((a, b) => a.code - b.code);
    
    console.log("Mapped characters (first 500):");
    for (const item of mapped) {
        if (item.code >= 0x0600 && item.code <= 0x08FF) {
            console.log(`U+${item.code.toString(16).toUpperCase().padStart(4, '0')}: name = "${item.name}", index = ${item.index}`);
        }
    }
} catch (e) {
    console.error('Error:', e);
}
