const puppeteer = require('puppeteer');
const fs = require('fs');
const https = require('https');

async function scrapeGoogleImages(query, id) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1280, height: 800 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
  
  const searchUrl = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query)}`;
  console.log(`[${id}] Navigating to ${searchUrl}`);
  
  await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });
  
  // Wait a bit to ensure images are loaded
  await new Promise(r => setTimeout(r, 2000));
  
  const imgUrl = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('img'));
    for (const img of imgs) {
      if (img.src && img.src.startsWith('http') && img.width > 100 && img.height > 100) {
        if (!img.src.includes('logo') && !img.src.includes('gstatic')) {
           return img.src;
        }
      }
    }
    const gstatic = imgs.find(img => img.src && img.src.startsWith('data:image'));
    return gstatic ? gstatic.src : null;
  });
  
  await browser.close();
  
  if (imgUrl) {
    console.log(`[${id}] Found image: ${imgUrl.substring(0, 100)}...`);
    
    if (imgUrl.startsWith('data:image')) {
      const matches = imgUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const buffer = Buffer.from(matches[2], 'base64');
        fs.writeFileSync(`./public/images/places/${id}.jpg`, buffer);
        console.log(`[${id}] Saved from base64.`);
      }
    } else {
      const file = fs.createWriteStream(`./public/images/places/${id}.jpg`);
      https.get(imgUrl, function(response) {
        response.pipe(file);
        file.on('finish', function() {
          file.close(); 
          console.log(`[${id}] Download completed.`);
        });
      }).on('error', function(err) { 
        fs.unlink(`./public/images/places/${id}.jpg`, () => {}); 
        console.error(err.message);
      });
    }
  } else {
    console.log(`[${id}] No image found for ` + query);
  }
}

async function run() {
  await scrapeGoogleImages('Befish กรือโป๊ะ', 'nr_souvenirs_0');
  await scrapeGoogleImages('กลุ่มแม่บ้านเกษตรกรบ้านทอน นราธิวาส', 'nr_souvenirs_2');
  await scrapeGoogleImages('ปลากุเลาเค็มตากใบ ของแท้', 'nr_souvenirs_3');
  await scrapeGoogleImages('ขนมโบราณยะกัง นราธิวาส', 'nr_souvenirs_4');
  await scrapeGoogleImages('กรือโป๊ะสด อ่าวมะนาว นราธิวาส', 'nr_souvenirs_6');
}

run();
