const https = require('https');

function getWikiThumb(title, lang = 'th') {
  return new Promise((resolve) => {
    const url = `https://${lang}.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&format=json&pithumbsize=1000`;
    https.get(url, { headers: { 'User-Agent': 'HalalBot/1.0' } }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const pages = json.query.pages;
          for (let p in pages) {
            if (pages[p].thumbnail && pages[p].thumbnail.source) {
              return resolve(pages[p].thumbnail.source);
            }
          }
          resolve(null);
        } catch(e) {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

async function run() {
  const list = [
    { name: 'ไก่กอและ', wiki: 'ไก่ฆอและ' },
    { name: 'เรือกอและ', wiki: 'เรือกอและ' },
    { name: 'มัสยิด 300 ปี', wiki: 'มัสยิดตะโละมาเนาะ' },
    { name: 'วัดเขากง', wiki: 'วัดเขากง' },
    { name: 'น้ำตกปาโจ', wiki: 'อุทยานแห่งชาติบูโด-สุไหงปาดี' },
    { name: 'กระจูด', wiki: 'กระจูด' },
    { name: 'ลองกอง', wiki: 'ลองกอง' },
    { name: 'บาติก', wiki: 'บาติก' },
    { name: 'พระพิฆเนศ', wiki: 'พระพิฆเนศ' },
    { name: 'กะปิ', wiki: 'กะปิ' },
    { name: 'ข้าวยำ', wiki: 'ข้าวยำ' }
  ];

  for (const item of list) {
    const thumb = await getWikiThumb(item.wiki, 'th');
    console.log(`${item.name} (${item.wiki}): ${thumb}`);
  }
}

run();
