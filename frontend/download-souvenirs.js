const google = require('googlethis');
const fs = require('fs');

async function searchAndDownload(query, filename) {
  try {
    const images = await google.image(query, { safe: false });
    if (images && images.length > 0) {
       let target = null;
       // Find an image that's not from wikipedia to avoid blocks if possible, or just the first valid one
       for(let img of images) {
          if(img.url.startsWith('http') && !img.url.includes('lookaside') && !img.url.includes('isanook')) {
             target = img.url;
             break;
          }
       }
       if(!target) target = images[0].url;
       
       console.log('Downloading', target);
       
       // Download using Puppeteer to bypass all firewalls
       const puppeteer = require('puppeteer');
       const browser = await puppeteer.launch({ headless: true });
       const page = await browser.newPage();
       const res = await page.goto(target, { waitUntil: 'networkidle2' });
       const buf = await res.buffer();
       fs.writeFileSync(filename, buf);
       await browser.close();
       
       console.log(filename, 'saved, size:', buf.length);
    }
  } catch(e) {
    console.error('Error for', query, e);
  }
}

async function run() {
  await searchAndDownload('ร้าน Befish กรือโป๊ะ นราธิวาส', './public/images/places/nr_souvenirs_0_new.jpg');
  await searchAndDownload('เรือกอและจำลอง บ้านทอน นราธิวาส', './public/images/places/nr_souvenirs_2_new.jpg');
  await searchAndDownload('ปลากุเลาเค็มตากใบ นราธิวาส', './public/images/places/nr_souvenirs_3_new.jpg');
  await searchAndDownload('ขนมโบราณยะกัง นราธิวาส', './public/images/places/nr_souvenirs_4_new.jpg');
  await searchAndDownload('กรือโป๊ะสด อ่าวมะนาว นราธิวาส', './public/images/places/nr_souvenirs_6_new.jpg');
}

run();
