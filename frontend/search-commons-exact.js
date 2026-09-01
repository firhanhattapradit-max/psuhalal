const https = require('https');

function searchCommons(title) {
  return new Promise((resolve) => {
    const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(title)}&gsrlimit=5&prop=imageinfo&iiprop=url|size&format=json`;
    https.get(url, { headers: { 'User-Agent': 'HalalMobilityTool/1.0 (contact@example.com)' } }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const urls = [];
          if (json.query && json.query.pages) {
            for (let k in json.query.pages) {
              const info = json.query.pages[k].imageinfo;
              if (info && info[0]) urls.push(info[0].url);
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

async function run() {
  const queries = {
    'ไก่กอและ': 'Ayam percik',
    'น้ำตกปาโจ': 'Pacho Waterfall',
    'ผานับดาว': 'Sea of mist Thailand',
    'พระพุทธทักษิณมิ่งมงคล': 'Phra Phuttha Thaksin Ming Mongkhon',
    'เรือกอและ': 'Kolek boat',
    'พระพิฆเนศ': 'Ganesha Thailand',
    'ตลาดน้ำ': 'Floating market Thailand',
    'ปลากุเลาเค็ม': 'Salted fish',
    'ขนมไทยโบราณ': 'Thai traditional desserts',
    'ตลาดเช้า': 'Morning market Thailand',
    'กรือโป๊ะสด': 'Keropok lekor',
    'ผ้าบาติก': 'Batik fabric',
    'กระจูด': 'Lepironia articulata',
    'ลองกอง': 'Lansium domesticum'
  };

  for (let k in queries) {
    const res = await searchCommons(queries[k]);
    console.log(`=== ${k} (${queries[k]}) ===`);
    console.log(res.slice(0, 2));
  }
}

run();
