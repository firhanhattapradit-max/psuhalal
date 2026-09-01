const puppeteer = require('puppeteer');
const fs = require('fs');

async function downloadWithCanvas(query, filename) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1280, height: 800 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
  
  console.log('Searching for:', query);
  await page.goto(`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query)}`, { waitUntil: 'networkidle2' });
  
  // Wait a bit
  await new Promise(r => setTimeout(r, 2000));
  
  const base64 = await page.evaluate(async () => {
    const imgs = Array.from(document.querySelectorAll('img'));
    let target = null;
    for (const img of imgs) {
      if (img.src && img.width > 100 && img.height > 100 && !img.src.includes('logo') && !img.src.includes('gstatic')) {
         target = img;
         break;
      }
    }
    
    if (!target) {
       target = imgs.find(img => img.src && img.src.startsWith('data:image'));
    }
    
    if (!target) return null;
    
    // Draw to canvas to get base64
    const canvas = document.createElement('canvas');
    canvas.width = target.naturalWidth || target.width;
    canvas.height = target.naturalHeight || target.height;
    const ctx = canvas.getContext('2d');
    
    // If it's a cross-origin image, drawing might fail, but for data URIs or same-origin it works.
    // Google image results are often base64 anyway.
    if (target.src.startsWith('data:image')) {
       return target.src;
    }
    
    try {
      ctx.drawImage(target, 0, 0);
      return canvas.toDataURL('image/jpeg');
    } catch(e) {
       return target.src;
    }
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
       // if it returned a URL, it means canvas failed due to CORS.
       console.log('Failed to canvas, got URL:', base64.substring(0, 50));
       // We can use page.goto to that URL and get the buffer
       const b2 = await puppeteer.launch({ headless: true });
       const p2 = await b2.newPage();
       const res = await p2.goto(base64);
       const buf = await res.buffer();
       fs.writeFileSync(filename, buf);
       console.log(`Saved ${filename} from puppeteer buffer, size:`, buf.length);
       await b2.close();
    }
  } else {
    console.log('Could not find image for', query);
  }
}

async function run() {
  await downloadWithCanvas('กรือโป๊ะ Befish', './public/images/places/nr_souvenirs_0_new.jpg');
  await downloadWithCanvas('เรือกอและจำลอง นราธิวาส', './public/images/places/nr_souvenirs_2_new.jpg');
  await downloadWithCanvas('ปลากุเลาเค็มตากใบ', './public/images/places/nr_souvenirs_3_new.jpg');
  await downloadWithCanvas('ขนมโบราณยะกัง นราธิวาส', './public/images/places/nr_souvenirs_4_new.jpg');
  await downloadWithCanvas('กรือโป๊ะสด อ่าวมะนาว นราธิวาส', './public/images/places/nr_souvenirs_6_new.jpg');
}

run();
