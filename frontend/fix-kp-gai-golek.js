const puppeteer = require('puppeteer');
const fs = require('fs');
const https = require('https');

async function scrapeRealGmaps(query) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1280, height: 800 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
  
  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
  console.log('Navigating to', searchUrl);
  
  await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });
  
  // Wait a bit to ensure images are loaded
  await new Promise(r => setTimeout(r, 3000));
  
  // Find Google Maps high-res user photos inside the knowledge panel
  const imgUrl = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('img'));
    // Look for images that are likely from the knowledge panel (Google Maps photos)
    const cover = imgs.find(img => img.src && (img.src.includes('lh3.googleusercontent.com/p/') || img.src.includes('lh5.googleusercontent.com/p/')));
    
    if (cover) {
      return cover.src.replace(/=w\d+-h\d+-[^&]+/, '=w1024-h768-k-no');
    }
    return null;
  });
  
  await browser.close();
  
  if (imgUrl) {
    console.log(`Found image: ${imgUrl}`);
    // Download image
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
  } else {
    console.log('No Google Maps image found in knowledge panel for ' + query);
  }
}

scrapeRealGmaps('ร้านไก่กอและ วงเวียนนก นราธิวาส');
