const puppeteer = require('puppeteer');
const fs = require('fs');
const https = require('https');

const places = [
  { id: 'nr_souvenirs_1_new', name: 'ร้านมุมสุขภาพ นราธิวาส' },
  { id: 'nr_souvenirs_5_new', name: 'ตลาดเช้าเทศบาลเมืองนราธิวาส นราธิวาส' },
  { id: 'nr_souvenirs_7_new', name: 'ศูนย์จำหน่ายสินค้า OTOP จังหวัดนราธิวาส นราธิวาส' },
  { id: 'nr_souvenirs_8_new', name: 'ร้านเครื่องสานกระจูดบ้านทอน นราธิวาส' },
  { id: 'nr_souvenirs_9_new', name: 'ตลาดผลไม้ นราธิวาส' }
];

async function run() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
  
  for (const place of places) {
    console.log(`Searching Google Maps for: ${place.name}`);
    try {
      const searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(place.name)}`;
      await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 15000 });
      await new Promise(r => setTimeout(r, 4000));
      
      const imageUrl = await page.evaluate(() => {
        const img = document.querySelector('button[aria-label^="Photo of"] img') || 
                    document.querySelector('button[aria-label^="รูปภาพของ"] img') ||
                    document.querySelector('.aoYhje img') || 
                    document.querySelector('img[src^="https://lh3.googleusercontent.com/p/"]') ||
                    document.querySelector('img[src^="https://lh5.googleusercontent.com/p/"]');
        
        if (img) {
          let src = img.getAttribute('src');
          if (src) src = src.replace(/=w\d+-h\d+-k-no/, '=w800-h600-k-no');
          return src;
        }
        return null;
      });

      if (imageUrl) {
        console.log(`Found: ${imageUrl}`);
        await new Promise((resolve) => {
           const file = fs.createWriteStream('./public/images/places/' + place.id + '.jpg');
           https.get(imageUrl, function(response) {
             response.pipe(file);
             file.on('finish', () => resolve());
           });
        });
        console.log('Downloaded', place.id);
      } else {
        console.log(`Not found on Maps.`);
      }
    } catch (err) {
      console.error(`Error:`, err.message);
    }
  }
  await browser.close();
}

run();
