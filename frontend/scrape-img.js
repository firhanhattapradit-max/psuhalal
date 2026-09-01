const https = require('https');

function searchImage(query) {
  return new Promise((resolve) => {
    https.get({
      hostname: 'html.duckduckgo.com',
      path: '/html/?q=' + encodeURIComponent(query + ' นราธิวาส'),
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        const match = data.match(/<img[^>]+src="([^">]+)"/);
        resolve(match ? (match[1].startsWith('//') ? 'https:' + match[1] : match[1]) : null);
      });
    });
  });
}

searchImage('หาดนราทัศน์').then(console.log);
