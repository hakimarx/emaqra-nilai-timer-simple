const fs = require('fs');
const content = fs.readFileSync('d:/emaqra+timer + rekap nilai/scratch/emaqra.sql', 'latin1');

function showSchema(tableName) {
    const regex = new RegExp(`CREATE TABLE \`${tableName}\` \\(([\\s\\S]*?)\\) ENGINE`, 'm');
    const match = content.match(regex);
    if (match) {
        console.log(`Schema for ${tableName}:`);
        console.log(match[1].trim());
    } else {
        console.log(`Schema for ${tableName} not found`);
    }
}

function showSamples(tableName, count = 3) {
    const regex = new RegExp(`INSERT INTO \`${tableName}\` .*? VALUES[\\s\\S]*?\\(([\\s\\S]*?)\\);`, 'm');
    const match = content.match(regex);
    if (match) {
        console.log(`\nSamples for ${tableName}:`);
        const values = match[1];
        const lines = values.split(/\),\s*\(/);
        lines.slice(0, count).forEach((l, idx) => {
            console.log(`Row ${idx + 1}: ${l}`);
        });
    } else {
        console.log(`Samples for ${tableName} not found`);
    }
}

showSchema('kategori_fahmil');
showSamples('kategori_fahmil');
showSchema('soal_fahmil');
showSamples('soal_fahmil');
