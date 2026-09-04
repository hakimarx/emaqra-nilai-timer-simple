const https = require('https');

const options = {
  hostname: 'api.github.com',
  path: '/repos/thetruetruth/quran-data-kfgqpc/git/trees/main?recursive=1',
  headers: {
    'User-Agent': 'NodeJS-Script'
  }
};

https.get(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      if (json.tree) {
        const jsonFiles = json.tree
          .filter(file => file.path.endsWith('.json'))
          .map(file => file.path);
        console.log("JSON Files found:");
        console.log(JSON.stringify(jsonFiles, null, 2));
      } else {
        console.log("No tree found in response:", data);
      }
    } catch (e) {
      console.error("Error parsing response:", e.message);
      console.log("Response starts with:", data.substring(0, 500));
    }
  });
}).on('error', (e) => {
  console.error("Request error:", e);
});
