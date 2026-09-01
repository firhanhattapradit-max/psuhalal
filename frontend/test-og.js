const https = require('https');
const http = require('http');

function fetchOgImage(url) {
  return new Promise((resolve) => {
    try {
      const client = url.startsWith('https') ? https : http;
      client.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 5000
      }, res => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return resolve(fetchOgImage(res.headers.location));
        }
        let data = '';
        res.on('data', chunk => {
          data += chunk;
          if (data.length > 50000) res.destroy(); // only need head
        });
        res.on('close', () => {
          const match = data.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
            || data.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
          resolve(match ? match[1] : null);
        });
        res.on('end', () => {
          const match = data.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
            || data.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
          resolve(match ? match[1] : null);
        });
      }).on('error', () => resolve(null));
    } catch(e) {
      resolve(null);
    }
  });
}

async function test() {
  console.log('TrueID test:', await fetchOgImage('https://travel.trueid.net/detail/8K0dYlB0mR6b'));
}
test();
