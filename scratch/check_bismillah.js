const https = require('https');

const options = {
  hostname: 'raw.githubusercontent.com',
  path: '/thetruetruth/quran-data-kfgqpc/main/qaloon/data/QaloonData_v10.json',
  headers: { 'User-Agent': 'NodeJS-Script' }
};

https.get(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    try {
      const arr = JSON.parse(data);
      // Find sura_no = 2, aya_no = 1
      const v = arr.find(x => x.sura_no === 2 && x.aya_no === 1);
      console.log("Qaloon Sura 2 Aya 1:", JSON.stringify(v, null, 2));
      
      const v18 = arr.find(x => x.sura_no === 18 && x.aya_no === 1);
      console.log("Qaloon Sura 18 Aya 1:", JSON.stringify(v18, null, 2));
    } catch (e) {
      console.error(e);
    }
  });
});
