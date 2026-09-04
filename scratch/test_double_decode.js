const fs = require('fs');

// CP1252 mapping for the 0x80-0x9F range to Unicode characters
const cp1252Map = {
    0x80: 0x20AC, 0x82: 0x201A, 0x83: 0x0192, 0x84: 0x201E, 0x85: 0x2026,
    0x86: 0x2020, 0x87: 0x2021, 0x88: 0x02C6, 0x89: 0x2030, 0x8A: 0x0160,
    0x8B: 0x2039, 0x8C: 0x0152, 0x8E: 0x017D, 0x91: 0x2018, 0x92: 0x2019,
    0x93: 0x201C, 0x94: 0x201D, 0x95: 0x2022, 0x96: 0x2013, 0x97: 0x2014,
    0x98: 0x02DC, 0x99: 0x2122, 0x9A: 0x0161, 0x9B: 0x203A, 0x9C: 0x0153,
    0x9E: 0x017E, 0x9F: 0x0178
};

// Reverse map: Unicode character code to CP1252 byte value
const unicodeToCp1252Byte = {};
for (let b = 0; b < 256; b++) {
    unicodeToCp1252Byte[b] = b;
}
for (const [byteVal, uniVal] of Object.entries(cp1252Map)) {
    unicodeToCp1252Byte[uniVal] = parseInt(byteVal);
}

function singleDecode(str) {
    const bytes = [];
    for (let i = 0; i < str.length; i++) {
        const code = str.charCodeAt(i);
        if (unicodeToCp1252Byte[code] !== undefined) {
            bytes.push(unicodeToCp1252Byte[code]);
        } else if (code < 256) {
            bytes.push(code);
        } else {
            // If it's some other Unicode character, we try to preserve it or map to '?'
            bytes.push(63); // '?'
        }
    }
    return Buffer.from(bytes).toString('utf8');
}

function doubleDecode(str) {
    try {
        const step1 = singleDecode(str);
        return singleDecode(step1);
    } catch (e) {
        return str;
    }
}

// Test with a sample from SQL file
const content = fs.readFileSync('d:/emaqra+timer + rekap nilai/scratch/emaqra.sql', 'latin1');
const match = content.match(/INSERT INTO `soal_fahmil` .*? VALUES\s*([\s\S]*?);/m);

if (match) {
    const valuesPart = match[1];
    let inQuotes = false;
    let quoteChar = '';
    let currentWord = '';
    let currentTuple = [];
    let tuples = [];
    
    for (let i = 0; i < Math.min(valuesPart.length, 50000); i++) {
        const char = valuesPart[i];
        if (inQuotes) {
            if (char === '\\') {
                currentWord += char + valuesPart[++i];
            } else if (char === quoteChar) {
                inQuotes = false;
                currentWord += char;
            } else {
                currentWord += char;
            }
        } else {
            if (char === "'" || char === "`") {
                inQuotes = true;
                quoteChar = char;
                currentWord += char;
            } else if (char === '(') {
                currentTuple = [];
                currentWord = '';
            } else if (char === ')') {
                currentTuple.push(currentWord.trim());
                tuples.push(currentTuple);
                currentWord = '';
            } else if (char === ',') {
                currentTuple.push(currentWord.trim());
                currentWord = '';
            } else {
                currentWord += char;
            }
        }
    }
    
    tuples.forEach((parts, idx) => {
        if (parts.length >= 4) {
            const catId = parts[1];
            let soal = parts[2].replace(/^'|'$/g, '').replace(/\\'/g, "'").replace(/\\r\\n/g, "\n");
            let jawaban = parts[3].replace(/^'|'$/g, '').replace(/\\'/g, "'").replace(/\\r\\n/g, "\n");
            
            if (catId === '1' || catId === '2' || catId === '3' || catId === '5' || catId === '7') {
                console.log(`\n--- Cat: ${catId} ---`);
                console.log(`Original Soal:\n${soal.substring(0, 100)}`);
                console.log(`Double Decoded Soal:\n${doubleDecode(soal).substring(0, 150)}`);
                console.log(`Original Jawaban:\n${jawaban.substring(0, 100)}`);
                console.log(`Double Decoded Jawaban:\n${doubleDecode(jawaban).substring(0, 150)}`);
            }
        }
    });
}
