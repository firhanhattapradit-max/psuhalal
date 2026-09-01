const https = require('https');
const url = 'https://www.google.com/search?q=' + encodeURIComponent('ไก่กอและ วงเวียนนก นราธิวาส wongnai');
https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
  let data = '';
  res.on('data', (c) => data += c);
  res.on('end', () => {
    // Look for img.wongnai.com
    const match = data.match(/https:\/\/img\.wongnai\.com\/p\/[a-zA-Z0-9\/\.\-\_]+/g);
    if (match) console.log([...new Set(match)]);
    else console.log('None found');
  });
});
