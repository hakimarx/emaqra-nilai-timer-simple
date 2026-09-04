const fs = require('fs');

async function getKemenagSurah(surah) {
    try {
        const url = `https://quran-api.lpmqkemenag.id/api-alquran/ayat/local/${surah}`;
        const headers = {
            'user': 'gayungan',
            'Authorization': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXNzd29yZCI6IjQyNDg4NjcxOGI5NDQ2MDBmZjU2MTY0OTRjM2NhZWVhIiwiaWF0IjoxNzc5MzU1OTQ4fQ.vqOSf0TdAvYf-ZnLWQknQ7QvKRUJ0tyoW_WAEzxhee0'
        };
        const response = await fetch(url, { headers });
        const data = await response.json();
        return data;
    } catch (e) {
        console.error(`Failed to fetch surah ${surah}`, e.message);
        return null;
    }
}

async function run() {
    const res = await getKemenagSurah(2);
    if (!res || !res.data) {
        console.log("No data returned");
        return;
    }
    
    const ayahs = res.data;
    
    // Find ayah 2 and ayah 265
    const a2 = ayahs.find(a => a.ayat === 2);
    const a265 = ayahs.find(a => a.ayat === 265);
    
    if (a2) {
        const text = a2.teks_msi_usmani;
        console.log("Ayah 2 MSI Usmani:", text);
        const codes = [...text].map(c => `U+${c.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')}(${c})`).join(' ');
        console.log("Ayah 2 codes:", codes);
        console.log();
    }
    
    if (a265) {
        const text = a265.teks_msi_usmani;
        console.log("Ayah 265 MSI Usmani:", text);
        const codes = [...text].map(c => `U+${c.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')}(${c})`).join(' ');
        console.log("Ayah 265 codes:", codes);
        console.log();
    }
}

run();
