const https = require('https');

const files = [
  "bazzi/data/BazziData_v07.json",
  "doori/data/DooriData_v09.json",
  "hafs-smart/data/hafs_smart_v8.json",
  "hafs/data/hafsData_v18.json",
  "qaloon/data/QaloonData_v10.json",
  "qumbul/data/QumbulData_v07.json",
  "shouba/data/ShoubaData08.json",
  "soosi/data/SoosiData09.json",
  "warsh/data/warshData_v10.json"
];

let index = 0;

function fetchNext() {
  if (index >= files.length) return;
  const file = files[index];
  const options = {
    hostname: 'raw.githubusercontent.com',
    path: `/thetruetruth/quran-data-kfgqpc/main/${file}`,
    headers: { 'User-Agent': 'NodeJS-Script' }
  };
  
  https.get(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
      if (data.length > 3000) {
        res.destroy();
        printFirst(file, data);
      }
    });
    res.on('end', () => {
      if (data.length <= 3000) {
        printFirst(file, data);
      }
    });
  }).on('error', (e) => {
    console.error("Error for", file, e.message);
    index++;
    fetchNext();
  });
}

function printFirst(file, text) {
  try {
    // clean up text if it was cut off to make it valid JSON
    let cleanText = text.trim();
    if (!cleanText.endsWith('}')) {
      // Find last closed object
      const lastClose = cleanText.lastIndexOf('}');
      if (lastClose !== -1) {
        cleanText = cleanText.substring(0, lastClose + 1) + '\n]';
      } else {
        cleanText = cleanText + '\n]';
      }
    }
    const arr = JSON.parse(cleanText);
    const first = arr[0];
    console.log(`=== FILE: ${file} ===`);
    console.log(JSON.stringify(first, null, 2));
  } catch (e) {
    console.log(`=== FILE: ${file} (Parse Error: ${e.message}) ===`);
    console.log(text.substring(0, 500));
  }
  index++;
  fetchNext();
}

fetchNext();
