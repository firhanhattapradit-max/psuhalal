const https = require('https');

function searchTAT(keyword) {
  return new Promise((resolve) => {
    const url = `https://thailandtourismdirectory.go.th/th/search?keyword=${encodeURIComponent(keyword)}`;
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const matches = [];
        const regex = /https:\/\/files\.thailandtourismdirectory\.go\.th\/assets\/upload\/[^"'\s\)]+/g;
        let m;
        while ((m = regex.exec(data)) !== null) {
          matches.push(m[0]);
        }
        resolve(matches);
      });
    }).on('error', () => resolve([]));
  });
}

async function test() {
  console.log('ปาโจ TAT:', await searchTAT('น้ำตกปาโจ'));
  console.log('มัสยิด 300 ปี TAT:', await searchTAT('มัสยิด 300 ปี'));
  console.log('ผานับดาว TAT:', await searchTAT('ผานับดาว'));
}
test();
