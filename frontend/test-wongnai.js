const https = require('https');

function fetchWongnaiImages(slug) {
  return new Promise((resolve) => {
    const url = `https://www.wongnai.com/restaurants/${slug}`;
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const matches = [];
        const regex = /https:\/\/img\.wongnai\.com\/p\/[^\s"'<>]+/g;
        let m;
        while ((m = regex.exec(data)) !== null) {
          matches.push(m[0]);
        }
        resolve(matches);
      });
    }).on('error', () => resolve([]));
  });
}

fetchWongnaiImages('246603wO-%E0%B8%A3%E0%B8%B4%E0%B8%A1%E0%B8%99%E0%B9%89%E0%B8%B3').then(imgs => {
  console.log('Found Wongnai images:', imgs.length);
  if (imgs.length > 0) {
    console.log('Sample image:', imgs[0]);
  }
});
