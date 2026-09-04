const https = require('https');
const fs = require('fs');

const KEMENAG_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXNzd29yZCI6IjQyNDg4NjcxOGI5NDQ2MDBmZjU2MTY0OTRjM2NhZWVhIiwiaWF0IjoxNzc5MzU1OTQ4fQ.vqOSf0TdAvYf-ZnLWQknQ7QvKRUJ0tyoW_WAEzxhee0';
const HEADERS = {
    'user': 'gayungan',
    'Authorization': KEMENAG_TOKEN
};

function fetchSurah(surahNum) {
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

async function run() {
    const allSurahs = [];
    let errors = [];
    
    for (let i = 1; i <= 114; i++) {
        try {
            console.log(`Fetching surah ${i}...`);
            const data = await fetchSurah(i);
            allSurahs.push({
                id: i,
                verses: data.map(v => ({
                    id: v.ayat,
                    text: v.teks_msi_usmani || v.teks_gundul || '',
                    page: v.halaman || null
                }))
            });
            // Delay to avoid rate limiting
            await new Promise(r => setTimeout(r, 100));
        } catch (e) {
            console.error(`Error fetching surah ${i}:`, e.message);
            errors.push(i);
        }
    }
    
    // Save to file
    fs.writeFileSync('kemenag_data.json', JSON.stringify(allSurahs, null, 2));
    console.log(`Done! Saved ${allSurahs.length} surahs. Errors: ${errors.join(', ')}`);
}

run();