const https = require('https');
const http = require('http');

function getOgImage(url) {
  return new Promise((resolve) => {
    try {
      const client = url.startsWith('https') ? https : http;
      client.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        },
        timeout: 7000
      }, res => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          let loc = res.headers.location;
          if (!loc.startsWith('http')) loc = new URL(loc, url).href;
          return resolve(getOgImage(loc));
        }
        let data = '';
        res.on('data', chunk => {
          data += chunk;
          if (data.length > 200000) res.destroy();
        });
        res.on('close', () => extract(data, resolve));
        res.on('end', () => extract(data, resolve));
      }).on('error', () => resolve(null));
    } catch(e) {
      resolve(null);
    }
  });
}

function extract(data, resolve) {
  const m = data.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
    || data.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)
    || data.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i);
  resolve(m ? m[1] : null);
}

const urls = [
  { name: 'หาดนราทัศน์', url: 'https://travel.trueid.net/detail/8K0dYlB0mR6b' },
  { name: 'มัสยิดวาดีอัลฮูเซ็น', url: 'https://travel.trueid.net/detail/X5rNlD74381R' },
  { name: 'น้ำตกปาโจ', url: 'https://travel.trueid.net/detail/750Q850XJ24b' },
  { name: 'ผานับดาว', url: 'https://travel.trueid.net/detail/y28eK59Ym6Jb' },
  { name: 'พระพุทธทักษิณมิ่งมงคล', url: 'https://travel.trueid.net/detail/1Z2p4w928B3a' },
  { name: 'ยะกังโภชนา', url: 'https://www.wongnai.com/restaurants/224255zK-%E0%B8%A2%E0%B8%B0%E0%B8%81%E0%B8%B1%E0%B8%87%E0%B9%82%E0%B8%A0%E0%B8%8A%E0%B8%99%E0%B8%B2' },
  { name: 'ริมน้ำ', url: 'https://www.wongnai.com/restaurants/246603wO-%E0%B8%A3%E0%B8%B4%E0%B8%A1%E0%B8%99%E0%B9%89%E0%B8%B3' }
];

async function run() {
  for (const u of urls) {
    const img = await getOgImage(u.url);
    console.log(`${u.name}: ${img}`);
  }
}
run();
