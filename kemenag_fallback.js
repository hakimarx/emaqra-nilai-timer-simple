// Kemenag Quran offline fallback data
// Generated from API: https://quran-api.lpmqkemenag.id/api-alquran/ayat/local/{surah}

function getKemenagFallback(surahNum) {
    // KEMENAG_DATA is loaded from kemenag_data.js
    if (typeof KEMENAG_DATA !== 'undefined' && KEMENAG_DATA[surahNum]) {
        return KEMENAG_DATA[surahNum];
    }
    return null;
}