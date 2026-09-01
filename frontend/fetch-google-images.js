const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const https = require('https');

const places = [
  { id: 'nr_restaurants_0', name: 'สวนอาหารริมน้ำ นราธิวาส' },
  { id: 'nr_restaurants_1', name: 'ร้านอาหารริมน้ำบางปอ นราธิวาส' },
  { id: 'nr_restaurants_2', name: 'ร้านยะกังโภชนา นราธิวาส' },
  { id: 'nr_restaurants_3', name: 'ไก่กอและ ถนนระแงะมรรคา นราธิวาส' },
  { id: 'nr_restaurants_4', name: 'AKHOO by Nasir นราธิวาส' },
  { id: 'nr_restaurants_5', name: 'เหมือนฝันเบเกอรี่ นราธิวาส' },
  { id: 'nr_restaurants_6', name: 'November Cafe นราธิวาส' },
  { id: 'nr_restaurants_7', name: 'PLAN TWO KITCHEN นราธิวาส' },
  { id: 'nr_restaurants_8', name: 'ร้าน Md. นราธิวาส' },
  { id: 'nr_attractions_0', name: 'หาดนราทัศน์ นราธิวาส' },
  { id: 'nr_attractions_1', name: 'อุทยานแห่งชาติอ่าวมะนาว-เขาตันหยง นราธิวาส' },
  { id: 'nr_attractions_2', name: 'มัสยิดวาดีอัลฮูเซ็น นราธิวาส' },
  { id: 'nr_attractions_3', name: 'น้ำตกปาโจ นราธิวาส' },
  { id: 'nr_attractions_4', name: 'ผานับดาว นราธิวาส' },
  { id: 'nr_attractions_5', name: 'พระพุทธทักษิณมิ่งมงคล นราธิวาส' },
  { id: 'nr_attractions_6', name: 'ชุมชนบ้านทอน นราธิวาส' },
  { id: 'nr_attractions_7', name: 'เทวสถานองค์พระพิฆเนศ นราธิวาส' },
  { id: 'nr_attractions_8', name: 'ศาลเจ้าโก้วเล้งจี่ นราธิวาส' },
  { id: 'nr_attractions_9', name: 'ตลาดน้ำยะกัง นราธิวาส' },
  { id: 'nr_souvenirs_0', name: 'บีฟิช กรือโป๊ะทอด นราธิวาส' },
  { id: 'nr_souvenirs_1', name: 'ร้านมุมสุขภาพ นราธิวาส' },
  { id: 'nr_souvenirs_2', name: 'กลุ่มแม่บ้านเกษตรกรบ้านทอน นราธิวาส' },
  { id: 'nr_souvenirs_3', name: 'ปลากุเลาเค็มตากใบ นราธิวาส' },
  { id: 'nr_souvenirs_4', name: 'ร้านขนมโบราณย่านยะกัง นราธิวาส' },
  { id: 'nr_souvenirs_5', name: 'ตลาดเช้าเทศบาลเมืองนราธิวาส' },
  { id: 'nr_souvenirs_6', name: 'ร้านกรือโป๊ะสดอ่าวมะนาว นราธิวาส' },
  { id: 'nr_souvenirs_7', name: 'ศูนย์ OTOP นราธิวาส' },
  { id: 'nr_souvenirs_8', name: 'ร้านเครื่องสานกระจูดบ้านทอน นราธิวาส' },
  { id: 'nr_souvenirs_9', name: 'ลองกองตันหยงมัส นราธิวาส' }
];

const downloadImage = (url, filepath) => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 200) {
        res.pipe(fs.createWriteStream(filepath))
           .on('error', reject)
           .once('close', () => resolve(filepath));
      } else {
        res.resume();
        reject(new Error(`Request Failed With a Status Code: ${res.statusCode}`));
      }
    }).on('error', reject);
  });
};

async function run() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  const results = {};

  for (const place of places) {
    console.log(`Searching for: ${place.name}`);
    try {
      await page.goto(`https://www.google.com/search?q=${encodeURIComponent(place.name)}&tbm=isch`, { waitUntil: 'networkidle2' });
      
      // Get the first large image URL from Google Images
      const imageUrl = await page.evaluate(() => {
        const imgs = Array.from(document.querySelectorAll('img'));
        for (let img of imgs) {
           // We want to avoid tiny icons. Often actual images have data-src or src that are larger
           const src = img.getAttribute('data-src') || img.getAttribute('src');
           if (src && src.startsWith('http') && !src.includes('gstatic') && !src.includes('logos')) {
             return src;
           }
        }
        // Fallback to the first image that has a src starting with http
        const fallback = imgs.find(img => {
          const src = img.getAttribute('src') || img.getAttribute('data-src');
          return src && src.startsWith('http') && !src.includes('logos');
        });
        return fallback ? (fallback.getAttribute('src') || fallback.getAttribute('data-src')) : null;
      });

      if (imageUrl) {
        console.log(`Found image for ${place.name}: ${imageUrl}`);
        const filename = `${place.id}.jpg`;
        const filepath = path.join(__dirname, 'public', 'images', 'places', filename);
        await downloadImage(imageUrl, filepath);
        results[place.id] = `/images/places/${filename}`;
        console.log(`Saved to ${filepath}`);
      } else {
        console.log(`No image found for ${place.name}`);
      }
      
      // Wait a bit to avoid getting blocked
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (err) {
      console.error(`Error processing ${place.name}:`, err.message);
    }
  }

  await browser.close();
  
  fs.writeFileSync('google-images-map.json', JSON.stringify(results, null, 2));
  console.log('Done! Results saved to google-images-map.json');
}

run();
