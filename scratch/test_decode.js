const fs = require('fs');
const contentLatin1 = fs.readFileSync('d:/emaqra+timer + rekap nilai/scratch/emaqra.sql', 'latin1');

const match = contentLatin1.match(/INSERT INTO `soal_fahmil` .*? VALUES\s*([\s\S]*?);/m);
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
            
            // Decode latin1 string to Buffer then to UTF-8
            const decodedSoal = Buffer.from(soal, 'latin1').toString('utf8');
            const decodedJawaban = Buffer.from(jawaban, 'latin1').toString('utf8');
            
            if (catId === '1') {
                console.log(`Cat: ${catId}`);
                console.log(`Original Soal: ${soal.substring(0, 100)}`);
                console.log(`Decoded Soal: ${decodedSoal.substring(0, 100)}`);
                console.log(`Original Jawaban: ${jawaban.substring(0, 100)}`);
                console.log(`Decoded Jawaban: ${decodedJawaban.substring(0, 100)}`);
                console.log('---');
            }
        }
    });
}
