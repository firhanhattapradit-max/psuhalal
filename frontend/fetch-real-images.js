const https = require('https');
const fs = require('fs');

function getVQD(query) {
  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'duckduckgo.com',
      path: '/?q=' + encodeURIComponent(query),
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let match = data.match(/vqd=([\d-]+)/);
        if (!match) match = data.match(/vqd="([\d-]+)"/);
        if (!match) match = data.match(/vqd='([\d-]+)'/);
        if (!match) match = data.match(/vqd=([^&"']+)/);
        resolve(match ? match[1] : null);
      });
    });
    req.on('error', () => resolve(null));
    req.end();
  });
}

function searchImages(query, vqd) {
  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'duckduckgo.com',
      path: '/i.js?l=th-th&o=json&q=' + encodeURIComponent(query) + '&vqd=' + vqd + '&f=,,,',
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://duckduckgo.com/'
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.results || []);
        } catch (e) {
          resolve([]);
        }
      });
    });
    req.on('error', () => resolve([]));
    req.end();
  });
}

async function test() {
  const vqd = await getVQD('หาดนราทัศน์ นราธิวาส');
  console.log('VQD:', vqd);
  if (vqd) {
    const results = await searchImages('หาดนราทัศน์ นราธิวาส', vqd);
    console.log('Found:', results.length);
    if (results.length > 0) {
      console.log('Image 1:', results[0].image);
      console.log('Title 1:', results[0].title);
    }
  }
}

test();
