// Script to download Kemenag Quran data for offline fallback
// Run this to generate kemenag_data.js

const https = require('https');
const fs = require('fs');

const KEMENAG_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXNzd29yZCI6IjQyNDg4NjcxOGI5NDQ2MDBmZjU2MTY0OTRjM2NhZWVhIiwiaWF0IjoxNzc5MzU1OTQ4fQ.vqOSf0TdAvYf-ZnLWQknQ7QvKRUJ0tyoW_WAEzxhee0';
const HEADERS = {
    'user': 'gayungan',
    'Authorization': KEMENAG_TOKEN
};

async function fetchSurah(surahNum) {
    return new Promise((resolve, reject) => {
        const url = `https://quran-api.lpmqkemenag.id/api-alquran/ayat/local/${surahNum}`;
        https.get(url, { headers: HEADERS }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (json.code === 200 && json.data) {
                        resolve(json.data);
                    } else {
                        reject(new Error(json.message || 'API error'));
                    }
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

// Download specific surahs (commonly used for MTQ)
const IMPORTANT_SURAH = [1, 2, 3, 23, 32, 36, 39, 42, 44, 56, 61, 67, 78, 81, 83, 85, 86, 87, 88, 91, 93, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114];

async function run() {
    const results = {};
    
    for (const surah of IMPORTANT_SURAH) {
        try {
            console.log(`Downloading surah ${surah}...`);
            const data = await fetchSurah(surah);
            results[surah] = data;
            await new Promise(r => setTimeout(r, 150)); // Rate limit
        } catch (e) {
            console.error(`Error downloading surah ${surah}:`, e.message);
        }
    }
    
    // Generate JS file with proper encoding
    const content = `const KEMENAG_DATA = ${JSON.stringify(results, null, 2)};\n\nfunction getKemenagVerses(surahNum) {\n    return KEMENAG_DATA[surahNum] || null;\n}\n`;
    
    fs.writeFileSync('kemenag_data.js', content, 'utf8');
    console.log(`Done! Generated kemenag_data.js with ${Object.keys(results).length} surahs.`);
}

run();