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
            bytes.push(63); // '?'
        }
    }
    return Buffer.from(bytes).toString('utf8');
}

function doubleDecode(str) {
    try {
        return singleDecode(singleDecode(str));
    } catch (e) {
        return str;
    }
}

const content = fs.readFileSync('d:/emaqra+timer + rekap nilai/scratch/emaqra.sql', 'latin1');

// Extract kategori_fahmil
const categories = {};
const catMatches = content.match(/INSERT INTO `kategori_fahmil` .*? VALUES\s*([\s\S]*?);/);
if (catMatches) {
    const rows = catMatches[1].match(/\((.*?)\)/g) || [];
    rows.forEach(r => {
        const parts = r.substring(1, r.length - 1).split(',');
        const id = parts[0].trim();
        const name = parts[1].trim().replace(/^'|'$/g, '');
        categories[id] = name;
    });
}

// Map of Category IDs to readable names based on our inspection of content
const categoryFriendlyNames = {
    '1': 'Pemahaman Ayat / Terjemah',
    '2': 'Menyempurnakan Ayat',
    '3': 'Terjemah Ayat',
    '4': 'Fikih & Ibadah',
    '5': 'Tajwid & Makhorijul Huruf',
    '6': 'Ulumul Qur\'an',
    '7': 'Kisah & Sejarah Islam',
    '8': 'Hadits & Ulumul Hadits',
    '9': 'Tafsir',
    '10': 'Kebudayaan Islam & Umum'
};

// Parse all questions
const questions = [];
const soalBlockMatch = content.match(/INSERT INTO `soal_fahmil` .*? VALUES\s*([\s\S]*?);/g);
if (soalBlockMatch) {
    soalBlockMatch.forEach(block => {
        const valuesPart = block.substring(block.indexOf('VALUES') + 6).trim();
        
        let inQuotes = false;
        let quoteChar = '';
        let currentWord = '';
        let currentTuple = [];
        let tuples = [];
        
        for (let i = 0; i < valuesPart.length; i++) {
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
        
        tuples.forEach(parts => {
            if (parts.length >= 4) {
                const id = parseInt(parts[0]);
                const catId = parts[1];
                let soal = parts[2].replace(/^'|'$/g, '').replace(/\\'/g, "'").replace(/\\r\\n/g, "\n").replace(/\\n/g, "\n");
                let jawaban = parts[3].replace(/^'|'$/g, '').replace(/\\'/g, "'").replace(/\\r\\n/g, "\n").replace(/\\n/g, "\n");
                
                // Exclude the long placeholder text we saw
                if (soal.includes('Ketika saya kuliah pada jurusan ini')) return;
                // Exclude obvious generic placeholders
                if (soal.startsWith('Soal ') && jawaban.startsWith('Jawaban Soal ')) return;
                
                soal = doubleDecode(soal).trim();
                jawaban = doubleDecode(jawaban).trim();
                
                questions.push({
                    id,
                    catId: parseInt(catId),
                    category: categoryFriendlyNames[catId] || categories[catId] || `Kategori ${catId}`,
                    soal,
                    jawaban
                });
            }
        });
    });
}

// Group questions by category and sort them
const grouped = {};
questions.forEach(q => {
    if (!grouped[q.category]) {
        grouped[q.category] = [];
    }
    grouped[q.category].push({
        id: q.id,
        soal: q.soal,
        jawaban: q.jawaban
    });
});

const outputContent = `// Bank Soal Fahmil Qur'an / MFQ (Musabaqah Fahmil Qur'an)
const MFQ_SOAL_DATA = ${JSON.stringify(grouped, null, 2)};

if (typeof module !== 'undefined') {
    module.exports = MFQ_SOAL_DATA;
}
`;

fs.writeFileSync('d:/emaqra+timer + rekap nilai/mfq_data.js', outputContent, 'utf8');
console.log(`Generated mfq_data.js successfully with ${questions.length} questions across ${Object.keys(grouped).length} categories.`);
console.log('Categories extracted:', Object.keys(grouped));
