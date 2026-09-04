const fs = require('fs');
const content = fs.readFileSync('d:/emaqra+timer + rekap nilai/scratch/emaqra.sql', 'latin1');
const tableMatches = content.match(/CREATE TABLE `([^`]+)`/g);
console.log('Tables found:', tableMatches ? tableMatches.map(t => t.match(/`([^`]+)`/)[1]) : 'None');
