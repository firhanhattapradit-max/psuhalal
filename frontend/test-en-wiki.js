const https = require('https');

function getWikiThumb(title, lang = 'en') {
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
  console.log('Ayam percik:', await getWikiThumb('Ayam percik', 'en'));
  console.log('Ganesha:', await getWikiThumb('Ganesha', 'en'));
  console.log('Floating market:', await getWikiThumb('Floating market', 'en'));
  console.log('Salted fish:', await getWikiThumb('Salted fish', 'en'));
  console.log('Narathiwat:', await getWikiThumb('Narathiwat province', 'en'));
}
run();
