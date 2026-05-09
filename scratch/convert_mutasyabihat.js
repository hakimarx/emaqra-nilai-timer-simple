
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('d:/emaqra+timer + rekap nilai/parsed_data.json', 'utf8'));

const output = `const MUTASYABIHAT_DATA = ${JSON.stringify(data.mutasyabihat)};\nconst SURAH_RANGES = ${JSON.stringify(data.surahs)};\n\nif (typeof module !== 'undefined') {\n  module.exports = { MUTASYABIHAT_DATA, SURAH_RANGES };\n}`;
fs.writeFileSync('d:/emaqra+timer + rekap nilai/mutasyabihat_data.js', output, 'utf8');
console.log('Successfully created mutasyabihat_data.js');
