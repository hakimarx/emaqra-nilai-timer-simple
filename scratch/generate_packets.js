
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('d:/emaqra+timer + rekap nilai/parsed_data.json', 'utf8'));

const mutasyabihat = data.mutasyabihat;
const surahs = data.surahs;

// Exclusion list
const excludedSurahs = [36, 55, 56, 67]; // Yasin, Ar-Rahman, Al-Waqiah, Al-Mulk
const shortSurahsRange = [93, 114]; // Ad-Duha to An-Nas

function isExcluded(surah) {
    if (excludedSurahs.includes(surah)) return true;
    if (surah >= shortSurahsRange[0] && surah <= shortSurahsRange[1]) return true;
    return false;
}

// Build pool of all verses based on surah ranges
// Note: daftarsurah has segments. We need to consolidate.
const surahInfo = {};
surahs.forEach(s => {
    if (!surahInfo[s.surah]) {
        surahInfo[s.surah] = { name: s.nama, min: s.awal, max: s.akhir };
    } else {
        surahInfo[s.surah].min = Math.min(surahInfo[s.surah].min, s.awal);
        surahInfo[s.surah].max = Math.max(surahInfo[s.surah].max, s.akhir);
    }
});

const allVerses = [];
for (const sNum in surahInfo) {
    const s = surahInfo[sNum];
    if (isExcluded(parseInt(sNum))) continue;
    
    for (let a = s.min; a <= s.max; a++) {
        allVerses.push({ surah: parseInt(sNum), surahName: s.name, ayat: a });
    }
}

// Mutasyabihat lookup
const mutSet = new Set(mutasyabihat.map(m => `${m.surah}:${m.ayat}`));

function isMut(surah, ayat) {
    return mutSet.has(`${surah}:${ayat}`);
}

function getDifficulty(v, allVerses) {
    // Check if current verse is mut
    if (isMut(v.surah, v.ayat)) return 'SULIT';
    
    // Check next 5 verses in the same surah
    for (let i = 1; i <= 5; i++) {
        if (isMut(v.surah, v.ayat + i)) return 'SULIT';
    }
    
    return 'REGULER';
}

// Tag all verses
const taggedVerses = allVerses.map(v => ({
    ...v,
    difficulty: getDifficulty(v, allVerses)
}));

const sulitPool = taggedVerses.filter(v => v.difficulty === 'SULIT');
const regulerPool = taggedVerses.filter(v => v.difficulty === 'REGULER');

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

shuffle(sulitPool);
shuffle(regulerPool);

const packets = [];
const usedIds = new Set(); // To track across packets

for (let i = 0; i < 4; i++) {
    const packet = {
        name: `Paket ${i + 1}`,
        questions: []
    };
    
    // 1 Sulit
    const s = sulitPool.pop();
    packet.questions.push(s);
    
    // 3 Reguler
    for (let j = 0; j < 3; j++) {
        const r = regulerPool.pop();
        packet.questions.push(r);
    }
    
    packets.push(packet);
}

console.log(JSON.stringify(packets, null, 2));
