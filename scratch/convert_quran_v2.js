
const fs = require('fs');
const path = 'C:/Users/pdpon/.gemini/antigravity/brain/7ec2fe78-24f8-466e-a86c-d048d89897a3/.system_generated/steps/120/content.md';
const content = fs.readFileSync(path, 'utf8');

const startIndex = content.indexOf('[');
const endIndex = content.lastIndexOf(']') + 1;
const json = content.substring(startIndex, endIndex);

const output = 'const QURAN_OFFLINE = ' + json + ';\n\nif (typeof module !== "undefined") module.exports = QURAN_OFFLINE;';
fs.writeFileSync('d:/emaqra+timer + rekap nilai/quran_data.js', output, 'utf8');
console.log('Successfully wrote ' + output.length + ' characters to quran_data.js');
