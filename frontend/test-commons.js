const https = require('https');

function searchCommons(query) {
  return new Promise((resolve) => {
    const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrlimit=3&prop=imageinfo&iiprop=url&format=json`;
    https.get(url, { headers: { 'User-Agent': 'HalalMobilityBot/1.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const pages = json.query.pages;
          const urls = [];
          for (let p in pages) {
            if (pages[p].imageinfo && pages[p].imageinfo[0]) {
              urls.push(pages[p].imageinfo[0].url);
            }
          }
          resolve(urls);
        } catch(e) {
          resolve([]);
        }
      });
    }).on('error', () => resolve([]));
  });
}

async function test() {
  console.log('มัสยิดวาดีอัลฮูเซ็น / 300 ปี:', await searchCommons('Masjid Wadi Al-Husen Narathiwat'));
  console.log('น้ำตกปาโจ:', await searchCommons('Pacho Waterfall Narathiwat'));
  console.log('เรือกอและ บ้านทอน:', await searchCommons('Kolae boat Narathiwat'));
  console.log('มัสยิด 300 ปี:', await searchCommons('มัสยิด 300 ปี นราธิวาส'));
}
test();
