const fs = require('fs');
const data = require('../mfq_data.js');

let countFathaSuperscript = 0;
for (const category in data) {
    const list = data[category];
    for (const item of list) {
        if (item.jawaban.includes('\u064E\u0670')) {
            countFathaSuperscript++;
        }
    }
}

console.log("Answers in mfq_data.js with U+064E followed by U+0670:", countFathaSuperscript);
