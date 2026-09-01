const https = require('https');
const fs = require('fs');

const url = 'https://www.google.com/search?q=' + encodeURIComponent('ไก่กอและวงเวียนนก นราธิวาส');
const options = {
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36' }
};

https.get(url, options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    const match = data.match(/https:\/\/lh\d\.googleusercontent\.com\/p\/[^\s\\"']+/g);
    if (match) {
      console.log([...new Set(match)]);
    } else {
      console.log('No images found in HTML.');
    }
  });
});
