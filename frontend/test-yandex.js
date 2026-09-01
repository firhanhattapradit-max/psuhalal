const https = require('https');

function searchYandex(query) {
  return new Promise((resolve) => {
    const url = `https://yandex.com/images/search?text=${encodeURIComponent(query)}`;
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const matches = [];
        // Look for thumb or img_url
        const regex = /img_url=(https%3A%2F%2F[^&"'\s]+)/g;
        let m;
        while ((m = regex.exec(data)) !== null) {
          matches.push(decodeURIComponent(m[1]));
        }
        if (matches.length === 0) {
          const r2 = /"thumbUrl":"(https:[^"]+)"/g;
          while ((m = r2.exec(data)) !== null) {
            matches.push(m[1].replace(/\\u002F/g, '/').replace(/\\/g, ''));
          }
        }
        if (matches.length === 0) {
          const r3 = /src="(https:\/\/avatars\.mds\.yandex\.net\/get-images-cbir\/[^"]+)"/g;
          while ((m = r3.exec(data)) !== null) {
            matches.push(m[1]);
          }
        }
        resolve({ count: matches.length, matches: matches.slice(0, 3), len: data.length });
      });
    }).on('error', (e) => resolve({ count: 0, error: e.message }));
  });
}

searchYandex('หาดนราทัศน์ นราธิวาส').then(r => console.log('Yandex:', r));
