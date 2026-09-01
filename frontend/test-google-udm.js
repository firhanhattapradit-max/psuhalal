const https = require('https');

function searchGoogleImages(query) {
  return new Promise((resolve) => {
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}&udm=2&hl=th`;
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'th-TH,th;q=0.9,en-US;q=0.8,en;q=0.7'
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const matches = [];
        // Extract encrypted-tbn0 image links or original image links
        const regex = /https:\/\/encrypted-tbn0\.gstatic\.com\/images\?q=tbn:[^"'\s&]+/g;
        let m;
        while ((m = regex.exec(data)) !== null) {
          if (!matches.includes(m[0])) matches.push(m[0]);
        }
        
        // Also look for data-src or img src
        const r2 = /src="(https:\/\/[^"]+\.(jpg|jpeg|png|webp))"/g;
        while ((m = r2.exec(data)) !== null) {
          if (!matches.includes(m[1])) matches.push(m[1]);
        }

        resolve({ count: matches.length, samples: matches.slice(0, 5) });
      });
    }).on('error', (e) => resolve({ count: 0, error: e.message }));
  });
}

async function test() {
  console.log('สวนอาหารริมน้ำ:', await searchGoogleImages('สวนอาหารริมน้ำ นราธิวาส'));
  console.log('หาดนราทัศน์:', await searchGoogleImages('หาดนราทัศน์ นราธิวาส'));
}
test();
