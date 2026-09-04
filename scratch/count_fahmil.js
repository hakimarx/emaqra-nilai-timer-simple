const fs = require('fs');
const content = fs.readFileSync('d:/emaqra+timer + rekap nilai/scratch/emaqra.sql', 'latin1');

// Let's parse all categories and questions
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
console.log('Categories:', categories);

const questions = [];
const soalMatches = content.match(/INSERT INTO `soal_fahmil` .*? VALUES\s*([\s\S]*?);/g);
if (soalMatches) {
    soalMatches.forEach(block => {
        // Find insert value blocks. Note that values can contain comma, parentheses inside quotes, etc.
        // We'll write a simple parser for the SQL INSERT values.
        const valuesPart = block.substring(block.indexOf('VALUES') + 6).trim();
        // valuesPart contains rows like (1, 2, '...', '...', 0), (2, ...);
        // Let's split values by ), ( but carefully. Since it's a script we can use state machine.
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
                const id = parts[0];
                const catId = parts[1];
                const soal = parts[2].replace(/^'|'$/g, '').replace(/\\'/g, "'").replace(/\\r\\n/g, "\n");
                const jawaban = parts[3].replace(/^'|'$/g, '').replace(/\\'/g, "'").replace(/\\r\\n/g, "\n");
                questions.push({ id, catId, soal, jawaban });
            }
        });
    });
}

console.log('Total questions parsed:', questions.length);
console.log('Sample of different categories:');
const seenCats = new Set();
for (let q of questions) {
    if (!seenCats.has(q.catId)) {
        seenCats.add(q.catId);
        console.log(`\nCategory ID: ${q.catId} (${categories[q.catId] || 'Unknown'})`);
        console.log(`Soal: ${q.soal.substring(0, 150)}...`);
        console.log(`Jawaban: ${q.jawaban.substring(0, 150)}...`);
    }
}
