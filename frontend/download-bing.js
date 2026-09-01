const puppeteer = require('puppeteer');
const fs = require('fs');

async function downloadBing(query, filename) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64)');
  
  console.log('Searching Bing:', query);
  await page.goto(`https://www.bing.com/images/search?q=${encodeURIComponent(query)}`, { waitUntil: 'networkidle2' });
  
  const base64 = await page.evaluate(() => {
    const img = document.querySelector('.mimg');
    if (img) {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      try {
        canvas.getContext('2d').drawImage(img, 0, 0);
        return canvas.toDataURL('image/jpeg');
      } catch(e) {
        return img.src;
      }
    }
    return null;
  });
  
  await browser.close();
  
  if (base64) {
    if (base64.startsWith('data:image')) {
      const matches = base64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        fs.writeFileSync(filename, Buffer.from(matches[2], 'base64'));
        console.log(`Saved ${filename} from base64.`);
      }
    } else {
       console.log('Got URL, skipping (CORS block)', base64.substring(0, 50));
       const b2 = await puppeteer.launch({ headless: true });
       const p2 = await b2.newPage();
       const res = await p2.goto(base64);
       const buf = await res.buffer();
       fs.writeFileSync(filename, buf);
       console.log(`Saved ${filename} from URL, size:`, buf.length);
       await b2.close();
    }
  } else {
    console.log('Not found:', query);
  }
}

async function run() {
  await downloadBing('เรือกอและจำลอง บ้านทอน นราธิวาส', './public/images/places/nr_souvenirs_2_new.jpg');
  await downloadBing('ปลากุเลาเค็มตากใบ นราธิวาส', './public/images/places/nr_souvenirs_3_new.jpg');
  await downloadBing('กรือโป๊ะสด อ่าวมะนาว นราธิวาส', './public/images/places/nr_souvenirs_6_new.jpg');
}

run();
