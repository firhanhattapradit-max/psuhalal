const https = require('https');

function getWikiImage(title) {
  return new Promise((resolve) => {
    const url = `https://th.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&format=json&pithumbsize=1000`;
    https.get(url, { headers: { 'User-Agent': 'HalalMobilityBot/1.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const pages = json.query.pages;
          for (let p in pages) {
            if (pages[p].thumbnail) {
              resolve(pages[p].thumbnail.source);
              return;
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

async function test() {
  console.log('หาดนราทัศน์:', await getWikiImage('หาดนราทัศน์'));
  console.log('มัสยิดวาดีอัลฮูเซ็น:', await getWikiImage('มัสยิดวาดีอัลฮูเซ็น'));
  console.log('น้ำตกปาโจ:', await getWikiImage('อุทยานแห่งชาติบูโด-สุไหงปาดี'));
  console.log('พระพุทธทักษิณมิ่งมงคล:', await getWikiImage('วัดเขากง'));
  console.log('อุทยานแห่งชาติอ่าวมะนาว-เขาตันหยง:', await getWikiImage('อุทยานแห่งชาติอ่าวมะนาว-เขาตันหยง'));
}
test();
