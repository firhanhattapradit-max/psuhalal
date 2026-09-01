const puppeteer = require('puppeteer');
const fs = require('fs');

async function scrapeGmaps(query) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1280, height: 800 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
  
  const searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(query)}/`;
  console.log('Navigating to', searchUrl);
  
  await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });
  
  // Wait a bit to ensure images are loaded
  await new Promise(r => setTimeout(r, 5000));
  
  // Find Google Maps high-res user photos (lh3.googleusercontent.com/p/ or lh5.googleusercontent.com/p/)
  const imgUrl = await page.evaluate(() => {
    // Collect all images
    const imgs = Array.from(document.querySelectorAll('img'));
    
    // Find the first one that is a Google Maps Places photo
    const cover = imgs.find(img => img.src && (img.src.includes('lh3.googleusercontent.com/p/') || img.src.includes('lh5.googleusercontent.com/p/')));
    
    if (cover) {
      // Modify URL to get high-res (w1024-h768-k-no instead of w408-h240-k-no)
      return cover.src.replace(/=w\d+-h\d+-[^&]+/, '=w1024-h768-k-no');
    }
    return null;
  });
  
  await browser.close();
  
  if (imgUrl) {
    console.log(`Found image: ${imgUrl}`);
    // Download image
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
  } else {
    console.log('No Google Maps image found for ' + query);
  }
}

scrapeGmaps('ไก่กอและวงเวียนนก นราธิวาส');
