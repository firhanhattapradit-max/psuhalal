const puppeteer = require('puppeteer');
const fs = require('fs');

async function scrapeGImages(query) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1280, height: 800 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
  
  const searchUrl = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query)}`;
  console.log('Navigating to', searchUrl);
  
  await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });
  
  // Wait a bit to ensure images are loaded
  await new Promise(r => setTimeout(r, 2000));
  
  const imgUrl = await page.evaluate(() => {
    // Find the first image result that is not a logo or icon
    const imgs = Array.from(document.querySelectorAll('img'));
    for (const img of imgs) {
      if (img.src && img.src.startsWith('http') && img.width > 100 && img.height > 100) {
        if (!img.src.includes('logo') && !img.src.includes('gstatic')) {
           return img.src;
        }
      }
    }
    // Fallback to gstatic (thumbnail) if nothing else
    const gstatic = imgs.find(img => img.src && img.src.startsWith('data:image'));
    return gstatic ? gstatic.src : null;
  });
  
  await browser.close();
  
  if (imgUrl) {
    console.log(`Found image: ${imgUrl.substring(0, 100)}...`);
    
    // Download image
    if (imgUrl.startsWith('data:image')) {
      // Base64
      const matches = imgUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches.length !== 3) {
        console.error('Invalid base64');
        return;
      }
      const buffer = Buffer.from(matches[2], 'base64');
      fs.writeFileSync('./public/images/places/nr_restaurants_3.jpg', buffer);
      console.log("Download completed from base64.");
    } else {
      const https = require('https');
      const file = fs.createWriteStream('./public/images/places/nr_restaurants_3.jpg');
      https.get(imgUrl, function(response) {
        response.pipe(file);
        file.on('finish', function() {
          file.close(); 
          console.log("Download completed.");
        });
      }).on('error', function(err) { 
        fs.unlink('./public/images/places/nr_restaurants_3.jpg', () => {}); 
        console.error(err.message);
      });
    }
  } else {
    console.log('No image found for ' + query);
  }
}

scrapeGImages('ไก่กอและ วงเวียนนก นราธิวาส');
