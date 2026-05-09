
const fs = require('fs');

function parseSql(filePath) {
    const content = fs.readFileSync(filePath, 'latin1');
    const mutasyabihat = [];
    const surahs = [];

    // Parse cekayatmutasyabihat
    const mutMatch = content.match(/INSERT INTO `cekayatmutasyabihat` .*? VALUES\s*([\s\S]*?);/);
    if (mutMatch) {
        const values = mutMatch[1];
        const rows = values.match(/\(\d+,\s*\d+,\s*\d+,\s*\d+\)/g);
        if (rows) {
            rows.forEach(r => {
                const parts = r.match(/\d+/g);
                mutasyabihat.append({
                    id: parseInt(parts[0]),
                    juz: parseInt(parts[1]),
                    surah: parseInt(parts[2]),
                    ayat: parseInt(parts[3])
                });
            });
        }
    }
    
    // Wait, regex above for mutasyabihat might be slow for many rows.
    // Let's use a simpler approach.
}

// Rewriting more efficiently
function parseEfficiently(filePath) {
    const content = fs.readFileSync(filePath, 'latin1');
    const mutasyabihat = [];
    const surahs = [];

    const lines = content.split('\n');
    let currentTable = null;

    for (let line of lines) {
        if (line.includes('INSERT INTO `cekayatmutasyabihat`')) {
            currentTable = 'mut';
            continue;
        } else if (line.includes('INSERT INTO `daftarsurah`')) {
            currentTable = 'surah';
            continue;
        } else if (line.trim().endsWith(';')) {
            if (currentTable) {
                // Process the last part of values
                processLine(line, currentTable, mutasyabihat, surahs);
            }
            currentTable = null;
            continue;
        }

        if (currentTable) {
            processLine(line, currentTable, mutasyabihat, surahs);
        }
    }

    return { mutasyabihat, surahs };
}

function processLine(line, table, mutasyabihat, surahs) {
    const matches = line.match(/\((.*?)\)/g);
    if (!matches) return;

    matches.forEach(m => {
        const parts = m.substring(1, m.length - 1).split(',');
        if (table === 'mut') {
            mutasyabihat.push({
                id: parseInt(parts[0].trim()),
                juz: parseInt(parts[1].trim()),
                surah: parseInt(parts[2].trim()),
                ayat: parseInt(parts[3].trim())
            });
        } else if (table === 'surah') {
            // (id, kategori, nosurat, nama, awal, akhir)
            surahs.push({
                id: parseInt(parts[0].trim()),
                juz: parseInt(parts[1].trim()),
                surah: parseInt(parts[2].trim()),
                nama: parts[3].trim().replace(/'/g, ""),
                awal: parseInt(parts[4].trim()),
                akhir: parseInt(parts[5].trim())
            });
        }
    });
}

const data = parseEfficiently('d:/emaqra+timer + rekap nilai/emaqra.sql');
fs.writeFileSync('d:/emaqra+timer + rekap nilai/parsed_data.json', JSON.stringify(data, null, 2));
console.log(`Extracted ${data.mutasyabihat.length} mutasyabihat and ${data.surahs.length} surah ranges.`);
