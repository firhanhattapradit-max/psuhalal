const https = require('https');

function searchYahooImages(query) {
  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'images.search.yahoo.com',
      path: '/search/images?p=' + encodeURIComponent(query),
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        // Look for image urls in JSON or img tags
        const matches = [];
        const regex = /imgurl=(https%3A%2F%2F[^&]+)&/g;
        let m;
        while ((m = regex.exec(data)) !== null) {
          matches.push(decodeURIComponent(m[1]));
        }
        if (matches.length === 0) {
          // alternative regex for yahoo
          const r2 = /"iurl":"(https:[^"]+)"/g;
          while ((m = r2.exec(data)) !== null) {
            matches.push(m[1].replace(/\\/g, ''));
          }
        }
        resolve(matches);
      });
    });
    req.on('error', () => resolve([]));
    req.end();
  });
}

searchYahooImages('หาดนราทัศน์ นราธิวาส').then(results => {
  console.log('Yahoo matches count:', results.length);
  if (results.length > 0) {
    console.log('Top 3:');
    results.slice(0, 3).forEach((u, i) => console.log(`${i + 1}: ${u}`));
  }
});
