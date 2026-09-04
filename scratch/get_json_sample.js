const https = require('https');

const options = {
  hostname: 'raw.githubusercontent.com',
  path: '/thetruetruth/quran-data-kfgqpc/main/qaloon/data/QaloonData_v10.json',
  headers: {
    'User-Agent': 'NodeJS-Script'
  }
};

https.get(options, (res) => {
  let data = '';
  let bytesRead = 0;
  
  res.on('data', (chunk) => {
    data += chunk;
    bytesRead += chunk.length;
    // We only need the first 2000 characters of the JSON file to see the structure
    if (data.length > 2000) {
      res.destroy(); // stop reading
      printSample(data);
    }
  });
  
  res.on('end', () => {
    if (bytesRead <= 2000) {
      printSample(data);
    }
  });
}).on('error', (e) => {
  console.error("Request error:", e);
});

function printSample(text) {
  // Let's print the first part of the text
  console.log("JSON Sample:");
  console.log(text.substring(0, 1500));
}
