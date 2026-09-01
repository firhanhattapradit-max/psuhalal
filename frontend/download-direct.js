const puppeteer = require('puppeteer');
const fs = require('fs');

const images = {
  'nr_souvenirs_0_new': 'https://s.isanook.com/tr/0/ud/282/1410145/1410145-20201021115201-ab2ed0a.jpg', // fish crackers
  'nr_souvenirs_2_new': 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Kolae_Boat.jpg', // Kolae boat
  'nr_souvenirs_3_new': 'https://f.ptcdn.info/436/049/000/omuym29fbbgW4Z4r1Y3s-o.jpg', // Tak Bai salted fish
  'nr_souvenirs_4_new': 'https://www.museumthailand.com/upload/evidence/1531206122_60100.jpg', // Yakang dessert
  'nr_souvenirs_6_new': 'https://upload.wikimedia.org/wikipedia/commons/3/36/Lekor.jpg' // keropok lekor
};

async function run() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  for (const [id, url] of Object.entries(images)) {
     console.log('Fetching', id);
     try {
       const res = await page.goto(url, { waitUntil: 'networkidle2' });
       const buf = await res.buffer();
       fs.writeFileSync('./public/images/places/' + id + '.jpg', buf);
       console.log('Saved', id, buf.length, 'bytes');
     } catch(e) {
       console.log('Error', id, e);
     }
  }
  
  await browser.close();
}
run();
