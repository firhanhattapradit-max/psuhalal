const https = require('https');

function check(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      resolve({ url, ok: res.statusCode >= 200 && res.statusCode < 400, status: res.statusCode });
    }).on('error', e => resolve({ url, ok: false, error: e.message }));
  });
}

const list = [
  'https://upload.wikimedia.org/wikipedia/commons/f/f6/Fishing_Village_in_Narathiwat.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/6/6c/Lepironia_mucronata.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/e/ec/Shrimp.paste-Belachan-01.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/0/09/YosriNasiKerabu1.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/0/0f/Lanzones.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/3/32/%E0%B8%AB%E0%B8%B2%E0%B8%94%E0%B8%99%E0%B8%A3%E0%B8%B2%E0%B8%97%E0%B8%B1%E0%B8%A8%E0%B8%99%E0%B9%8C.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/c/c5/%E0%B8%A1%E0%B8%B1%E0%B8%AA%E0%B8%A2%E0%B8%B4%E0%B8%94%E0%B8%95%E0%B8%B0%E0%B9%82%E0%B8%A5%E0%B8%B0%E0%B8%A1%E0%B8%B2%E0%B9%80%E0%B8%99%E0%B8%B2%E0%B8%B0_%28%E0%B8%A1%E0%B8%B1%E0%B8%AA%E0%B8%A2%E0%B8%B4%E0%B8%94_300_%E0%B8%9B%E0%B8%B5%29.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/6/6f/%E0%B8%9E%E0%B8%A3%E0%B8%B0%E0%B8%9E%E0%B8%B8%E0%B8%97%E0%B8%98%E0%B8%97%E0%B8%B1%E0%B8%81%E0%B8%A9%E0%B8%B4%E0%B8%93%E0%B8%A1%E0%B8%B4%E0%B9%88%E0%B8%87%E0%B8%A1%E0%B8%87%E0%B8%84%E0%B8%A5_%E0%B8%A7%E0%B8%B1%E0%B8%94%E0%B9%80%E0%B8%82%E0%B8%B2%E0%B8%81%E0%B8%87_-_panoramio.jpg'
];

async function run() {
  for (const u of list) {
    const res = await check(u);
    console.log(res.ok ? 'PASS:' : 'FAIL:', res.status, u);
  }
}
run();
