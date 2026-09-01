const https = require('https');

function searchImage(query) {
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
        const regex = /img_url=(https%3A%2F%2F[^&"'\s]+)/g;
        let m;
        while ((m = regex.exec(data)) !== null) {
          const decoded = decodeURIComponent(m[1]);
          // filter out obvious non-photo or broken formats
          if (!matches.includes(decoded) && (decoded.endsWith('.jpg') || decoded.endsWith('.jpeg') || decoded.endsWith('.png') || decoded.includes('wongnai') || decoded.includes('ytimg') || decoded.includes('fbsbx') || decoded.includes('thailandtourismdirectory') || decoded.includes('mgronline') || decoded.includes('pantip') || decoded.includes('pinimg'))) {
            matches.push(decoded);
          }
        }
        resolve(matches.slice(0, 3));
      });
    }).on('error', () => resolve([]));
  });
}

const list = [
  'สวนอาหารริมน้ำ นราธิวาส',
  'มัสยิดวาดีอัลฮูเซ็น นราธิวาส',
  'น้ำตกปาโจ นราธิวาส',
  'Befish กรือโป๊ะ นราธิวาส',
  'ปลากุเลาเค็มตากใบ นราธิวาส'
];

async function run() {
  for (const item of list) {
    const res = await searchImage(item);
    console.log(`\n=== ${item} ===`);
    console.log(res);
    await new Promise(r => setTimeout(r, 1000));
  }
}

run();
