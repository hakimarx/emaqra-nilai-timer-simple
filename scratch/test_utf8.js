const fs = require('fs');
const content = fs.readFileSync('d:/emaqra+timer + rekap nilai/scratch/emaqra.sql', 'utf8');

const match = content.match(/INSERT INTO `soal_fahmil` .*? VALUES\s*([\s\S]*?);/m);
if (match) {
    // let's grab a few lines that have Category 1, 2, 3, 5, 7, etc.
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
            const soal = parts[2].replace(/^'|'$/g, '').replace(/\\'/g, "'").replace(/\\r\\n/g, "\n");
            const jawaban = parts[3].replace(/^'|'$/g, '').replace(/\\'/g, "'").replace(/\\r\\n/g, "\n");
            if (catId === '1' || catId === '2' || catId === '3' || catId === '5' || catId === '7') {
                console.log(`Cat: ${catId}`);
                console.log(`Soal: ${soal.substring(0, 100)}`);
                console.log(`Jawaban: ${jawaban.substring(0, 100)}`);
                console.log('---');
            }
        }
    });
}
